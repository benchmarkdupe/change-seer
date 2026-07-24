import { createServerFn } from "@tanstack/react-start";
import type { Opportunity } from "@/domain/types/opportunity";
import { runLiveSignalSource } from "@/lib/live-signal-source.server";
import type { NormalizedLiveSignal } from "@/lib/live-signal-source.server";

/**
 * Fetches the latest live opportunities derived from real scouts (currently
 * Hacker News). Runs server-side, uses service role to record source health
 * and persist signals, then returns fully-scored Opportunity objects tagged
 * with data state 'live'. Failure paths degrade to an empty list rather than
 * crashing the discover feed — callers merge with sample data.
 */
export const getLiveOpportunities = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ opportunities: Opportunity[]; lastRun: string | null }> => {
    const { fetchTopHNStories, normalizeHN } = await import("@/lib/hacker-news.server");

    return runLiveSignalSource({
      scoutId: "hacker_news",
      category: "trend",
      sourceType: "hacker_news",
      defaultRefreshIntervalMinutes: 60,
      async fetchSignals() {
        const stories = await fetchTopHNStories(20);
        // HNStory has no index signature, but it's structurally a plain JSON object.
        return stories.flatMap(normalizeHN) as unknown as NormalizedLiveSignal[];
      },
      buildOpportunity({ opportunityKey, rows, score }) {
        const payload = rows[0].raw_payload as {
          title?: string;
          url?: string;
          by?: string;
          score?: number;
          descendants?: number;
        } | null;
        const title = payload?.title ?? opportunityKey;
        const sparkline = Array.from({ length: 10 }, (_, i) =>
          Math.max(5, Math.round(score.signalScore - (9 - i) * (score.momentum / 30))),
        );
        return {
          id: `live-${opportunityKey}`,
          title,
          category: "trend",
          region: "Global",
          detectedAt: rows[0].detected_at,
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
            publicEvidence: rows.map((r) => ({
              label: r.evidence,
              sourceScoutId: r.scout_id,
            })),
          },
          sourceScoutIds: ["hacker_news"],
        } satisfies Opportunity;
      },
    });
  },
);

/**
 * Fetches live opportunities researched by our own AI Ecosystem backend
 * (github.com/benchmarkdupe/ai-ecosystem's opportunity-engine service) —
 * ideas for autonomous content businesses, scored by a 2-step analyst→critic
 * AI chain. Same cache/ingest/score pipeline as getLiveOpportunities, just
 * pointed at a different provider. Returns an empty list (never throws) if
 * AI_ECOSYSTEM_OPPORTUNITY_ENGINE_URL isn't configured, so this degrades
 * gracefully when the backend isn't deployed/reachable.
 */
export const getLiveAiEcosystemOpportunities = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ opportunities: Opportunity[]; lastRun: string | null }> => {
    const { fetchResearchedIdeas, normalizeAiEcosystemIdea, difficultyFromScore } =
      await import("@/lib/ai-ecosystem.server");

    return runLiveSignalSource({
      scoutId: "ai_ecosystem",
      category: "income",
      sourceType: "ai_ecosystem",
      defaultRefreshIntervalMinutes: 60,
      async fetchSignals() {
        const ideas = await fetchResearchedIdeas(20);
        return ideas.flatMap(normalizeAiEcosystemIdea);
      },
      buildOpportunity({ opportunityKey, rows, score }) {
        const payload = rows[0].raw_payload as {
          title?: string;
          profitabilityScore?: number | null;
          research?: { analysis?: Record<string, { score: number; reasoning: string }> };
        } | null;
        const title = payload?.title ?? opportunityKey;
        const analysis = payload?.research?.analysis;
        const sparkline = Array.from({ length: 10 }, (_, i) =>
          Math.max(5, Math.round(score.signalScore - (9 - i) * (score.momentum / 30))),
        );
        return {
          id: `live-${opportunityKey}`,
          title,
          category: "income",
          region: "Global",
          detectedAt: rows[0].detected_at,
          verification: "pending",
          trend: score.momentum >= 60 ? "up" : score.momentum <= 40 ? "down" : "flat",
          sparkline,
          estimatedStartupCost: { min: 0, max: 0 },
          estimatedTimeCommitment: "Automated — AI-run content pipeline",
          estimatedDifficulty: analysis?.startupDifficulty
            ? difficultyFromScore(analysis.startupDifficulty.score)
            : "moderate",
          estimatedMonthlyPotential: { min: 0, max: 0 },
          summary: `Researched by our AI Ecosystem backend as an automatable content-business idea (profitability score ${payload?.profitabilityScore ?? "n/a"}/10 from a 2-step analyst→critic AI chain). A generated hypothesis, not a human-verified plan — read the reasoning before acting.`,
          score,
          aiDetail: {
            whyGrowing: analysis?.demand?.reasoning ?? "No demand analysis available yet.",
            whoIsSucceeding:
              "Too early to say — this is an AI-generated idea, not a validated business.",
            risks: [
              analysis?.competition?.reasoning ?? "Competition not yet analyzed.",
              "AI-generated analysis — treat as a starting hypothesis, not verified fact",
              "Not yet cross-corroborated by a second independent source",
            ],
            recommendedCapital:
              "N/A — automated content business, no capital estimate provided by the source",
            difficultyExplanation:
              analysis?.startupDifficulty?.reasoning ?? "Difficulty not yet analyzed.",
            howToBegin: [
              "Review the full research and script (if generated) in the AI Ecosystem dashboard",
              "Validate demand independently before committing production time",
            ],
            timeToProfitability: "N/A — depends on content production and publishing cadence",
            publicEvidence: rows.map((r) => ({
              label: r.evidence,
              sourceScoutId: r.scout_id,
            })),
          },
          sourceScoutIds: ["ai_ecosystem"],
        } satisfies Opportunity;
      },
    });
  },
);
