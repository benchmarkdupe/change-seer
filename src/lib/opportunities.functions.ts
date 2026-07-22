import { createServerFn } from "@tanstack/react-start";
import type { Opportunity } from "@/domain/types/opportunity";

/**
 * Fetches the latest live opportunities derived from real scouts (currently
 * Hacker News). Runs server-side, uses service role to record source health
 * and persist signals, then returns fully-scored Opportunity objects tagged
 * with data state 'live'. Failure paths degrade to an empty list rather than
 * crashing the discover feed — callers merge with sample data.
 */
export const getLiveOpportunities = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ opportunities: Opportunity[]; lastRun: string | null }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { fetchTopHNStories, normalizeHN } = await import("@/lib/hacker-news.server");
    const { ScoringEngine } = await import("@/domain/scoring/ScoringEngine");

    const scoutId = "hacker_news";
    const startedAt = new Date();
    let lastRun: string | null = null;

    try {
      // Read cached signals fresh from db first (avoid hammering HN on every page load)
      const { data: healthRow } = await supabaseAdmin
        .from("source_health")
        .select("last_success_at, refresh_interval_minutes")
        .eq("scout_id", scoutId)
        .maybeSingle();

      lastRun = healthRow?.last_success_at ?? null;

      const shouldRefetch =
        !healthRow?.last_success_at ||
        Date.now() - new Date(healthRow.last_success_at).getTime() >
          (healthRow.refresh_interval_minutes ?? 60) * 60_000;

      if (shouldRefetch) {
        const stories = await fetchTopHNStories(20);
        const normalized = stories.flatMap(normalizeHN);

        if (normalized.length > 0) {
          // Insert new signals (allow duplicates by design — they carry different detected_at)
          await supabaseAdmin.from("opportunity_signals").insert(
            normalized.map((s) => ({
              scout_id: s.scout_id,
              opportunity_key: s.opportunity_key,
              signal_type: s.signal_type,
              value: s.value,
              evidence: s.evidence,
              source_url: s.source_url,
              source_confidence: s.source_confidence,
              raw_payload: s.raw_payload as unknown as never,
            })),
          );
        }

        lastRun = startedAt.toISOString();
        await supabaseAdmin
          .from("source_health")
          .update({
            status: "healthy",
            last_success_at: lastRun,
            last_error: null,
            records_last_run: normalized.length,
            total_runs: (healthRow ? 1 : 1) + 0,
            updated_at: lastRun,
          })
          .eq("scout_id", scoutId);
      }

      // Read the most recent signal per opportunity_key from the DB
      const { data: signalRows } = await supabaseAdmin
        .from("opportunity_signals")
        .select("*")
        .eq("scout_id", scoutId)
        .order("detected_at", { ascending: false })
        .limit(200);

      if (!signalRows?.length) return { opportunities: [], lastRun };

      // Group by opportunity_key
      const grouped: Record<string, typeof signalRows> = {};
      for (const s of signalRows) {
        (grouped[s.opportunity_key] ??= []).push(s);
      }

      const engine = new ScoringEngine();
      const opportunities: Opportunity[] = Object.entries(grouped)
        .slice(0, 12)
        .map(([key, sigs]) => {
          const raw = sigs.map((s) => ({
            opportunityKey: s.opportunity_key,
            scoutId: s.scout_id,
            type: s.signal_type as never,
            value: Number(s.value),
            evidence: s.evidence,
            sourceConfidence: s.source_confidence,
            detectedAt: s.detected_at,
          }));
          const score = engine.score("trend", raw);
          const payload = sigs[0].raw_payload as {
            title?: string;
            url?: string;
            by?: string;
            score?: number;
            descendants?: number;
          } | null;
          const title = payload?.title ?? key;
          const sparkline = Array.from({ length: 10 }, (_, i) =>
            Math.max(5, Math.round(score.signalScore - (9 - i) * (score.momentum / 30))),
          );
          return {
            id: `live-${key}`,
            title,
            category: "trend",
            region: "Global",
            detectedAt: sigs[0].detected_at,
            verification: "unverified",
            trend: score.momentum >= 60 ? "up" : score.momentum <= 40 ? "down" : "flat",
            sparkline,
            estimatedStartupCost: { min: 0, max: 0 },
            estimatedTimeCommitment: "N/A — trend signal",
            estimatedDifficulty: "moderate",
            estimatedMonthlyPotential: { min: 0, max: 0 },
            summary: `Trending on Hacker News (${payload?.score ?? 0} points, ${payload?.descendants ?? 0} comments). Live signal from an official public API — a starting point, not a business plan.`,
            score,
            aiDetail: {
              whyGrowing: `Currently on the Hacker News front page — a leading indicator for early developer/builder attention.`,
              whoIsSucceeding: `Too early to say — this is a raw attention signal, not a validated opportunity.`,
              risks: [
                "Attention on HN is often transient — story lifespan is measured in hours",
                "Unverified: one source, not cross-corroborated yet",
                "May be news/discussion, not a buildable opportunity",
              ],
              recommendedCapital: "N/A — evaluate the underlying content first",
              difficultyExplanation:
                "Depends entirely on the underlying opportunity — this is a trend signal only.",
              howToBegin: [
                "Read the source link and top comments to understand what's actually being discussed",
                "Check if it's a company, technology, or observation — each implies different next steps",
              ],
              timeToProfitability: "N/A",
              publicEvidence: sigs.map((s) => ({
                label: s.evidence,
                sourceScoutId: s.scout_id,
              })),
            },
            sourceScoutIds: [scoutId],
          } satisfies Opportunity;
        });

      return { opportunities, lastRun };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await supabaseAdmin
        .from("source_health")
        .update({
          status: "down",
          last_failure_at: new Date().toISOString(),
          last_error: message.slice(0, 500),
          updated_at: new Date().toISOString(),
        })
        .eq("scout_id", scoutId);
      return { opportunities: [], lastRun };
    }
  },
);
