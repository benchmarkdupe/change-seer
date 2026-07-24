import type { Category, Opportunity, ScoreBreakdown } from "@/domain/types/opportunity";
import type { Database } from "@/integrations/supabase/types";

export type SignalRow = Database["public"]["Tables"]["opportunity_signals"]["Row"];

export interface NormalizedLiveSignal {
  opportunity_key: string;
  scout_id: string;
  signal_type: string;
  value: number;
  evidence: string;
  source_url: string | null;
  source_confidence: number;
  raw_payload: Record<string, unknown>;
}

export interface LiveSignalSourceConfig {
  scoutId: string;
  category: Category;
  /** Tag stored on the ingested raw record (e.g. "hacker_news", "ai_ecosystem"). */
  sourceType: string;
  defaultRefreshIntervalMinutes: number;
  maxOpportunities?: number;
  /** Hit the upstream provider and return fresh normalized signals. Only called when the cached data is stale. */
  fetchSignals(): Promise<NormalizedLiveSignal[]>;
  /** Shape one opportunity_key's scored, grouped signal rows into a full Opportunity card. */
  buildOpportunity(args: {
    opportunityKey: string;
    rows: SignalRow[];
    score: ScoreBreakdown;
  }): Opportunity;
}

/**
 * Generic orchestration for a "real" (non-mock) scout: check whether the
 * cached signals in Supabase are fresh enough, refetch from the upstream
 * provider if not, persist + ingest, then read back and score. Extracted
 * from the original Hacker News-only implementation so every live source
 * (Hacker News, AI Ecosystem, future ones) shares one battle-tested path
 * instead of re-deriving the cache/ingest/score dance per source.
 */
export async function runLiveSignalSource(
  config: LiveSignalSourceConfig,
): Promise<{ opportunities: Opportunity[]; lastRun: string | null }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { ScoringEngine } = await import("@/domain/scoring/ScoringEngine");
  const { buildIngestionEnvelope } = await import("@/domain/ingestion/normalize");
  const { buildDefaultScoreEnvelope } = await import("@/lib/opportunity-scoring.server");
  const { ingestOpportunityEnvelope } = await import("@/lib/opportunity-ingestion.server");

  const startedAt = new Date();
  let lastRun: string | null = null;

  try {
    const { data: healthRow } = await supabaseAdmin
      .from("source_health")
      .select("last_success_at, refresh_interval_minutes, total_runs")
      .eq("scout_id", config.scoutId)
      .maybeSingle();

    lastRun = healthRow?.last_success_at ?? null;

    const shouldRefetch =
      !healthRow?.last_success_at ||
      Date.now() - new Date(healthRow.last_success_at).getTime() >
        (healthRow.refresh_interval_minutes ?? config.defaultRefreshIntervalMinutes) * 60_000;

    if (shouldRefetch) {
      const normalized = await config.fetchSignals();

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

        for (const entry of normalized.slice(0, 6)) {
          const envelope = buildIngestionEnvelope({
            sourceId: config.scoutId,
            externalId: entry.opportunity_key,
            title: entry.evidence || entry.opportunity_key,
            category: config.category,
            evidenceSummary: entry.evidence,
            sourceReliability: entry.source_confidence,
            dataQualityScore: Math.min(100, entry.source_confidence + 10),
            confidenceScore: entry.source_confidence,
            trendAnalytics: { momentum: entry.value },
            discoveredAt: startedAt.toISOString(),
            lastUpdatedAt: startedAt.toISOString(),
            sourceUrl: entry.source_url ?? null,
          });
          const score = buildDefaultScoreEnvelope({ envelope, budget: 1000 });
          await ingestOpportunityEnvelope({
            ...envelope,
            rawRecord: {
              sourceId: config.scoutId,
              externalId: entry.opportunity_key,
              sourceType: config.sourceType,
              sourceUrl: entry.source_url ?? null,
              payload: { raw: entry },
              discoveredAt: startedAt.toISOString(),
              lastSeenAt: startedAt.toISOString(),
            },
            evidence: [
              {
                opportunityId: "",
                evidenceType: "signal",
                summary: entry.evidence,
                sourceUrl: entry.source_url ?? null,
                reliabilityScore: entry.source_confidence,
                confidenceScore: entry.source_confidence,
                evidenceAt: startedAt.toISOString(),
              },
            ],
            score: { ...score, opportunityId: "" },
            analytics: [
              {
                opportunityId: "",
                score: score.overallScore,
                trendDirection: score.trendMomentumScore >= 60 ? "up" : "flat",
                engagementScore: entry.value,
                sourceCount: 1,
                evidenceCount: 1,
              },
            ],
          });
        }
      }

      lastRun = startedAt.toISOString();
      await supabaseAdmin
        .from("source_health")
        .update({
          status: "healthy",
          last_success_at: lastRun,
          last_error: null,
          records_last_run: normalized.length,
          total_runs: (healthRow?.total_runs ?? 0) + 1,
          updated_at: lastRun,
        })
        .eq("scout_id", config.scoutId);
    }

    // Read the most recent signal rows for this scout back from the DB
    const { data: signalRows } = await supabaseAdmin
      .from("opportunity_signals")
      .select("*")
      .eq("scout_id", config.scoutId)
      .order("detected_at", { ascending: false })
      .limit(200);

    if (!signalRows?.length) return { opportunities: [], lastRun };

    const grouped: Record<string, SignalRow[]> = {};
    for (const row of signalRows) {
      (grouped[row.opportunity_key] ??= []).push(row);
    }

    const engine = new ScoringEngine();
    const opportunities: Opportunity[] = Object.entries(grouped)
      .slice(0, config.maxOpportunities ?? 12)
      .map(([opportunityKey, rows]) => {
        const raw = rows.map((r) => ({
          opportunityKey: r.opportunity_key,
          scoutId: r.scout_id,
          type: r.signal_type as never,
          value: Number(r.value),
          evidence: r.evidence,
          sourceConfidence: r.source_confidence,
          detectedAt: r.detected_at,
        }));
        const score = engine.score(config.category, raw);
        return config.buildOpportunity({ opportunityKey, rows, score });
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
      .eq("scout_id", config.scoutId);
    return { opportunities: [], lastRun };
  }
}
