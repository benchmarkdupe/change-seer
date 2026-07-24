import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
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
    const {
      fetchResearchedIdeas,
      fetchPublishedProductionsByIdeaId,
      normalizeAiEcosystemIdea,
      difficultyFromScore,
      seedIdeasFromCandidates,
      isDropshippingIdea,
      DROPSHIPPING_SEED_ARCHETYPES,
    } = await import("@/lib/ai-ecosystem.server");

    return runLiveSignalSource({
      scoutId: "ai_ecosystem",
      category: "income",
      sourceType: "ai_ecosystem",
      defaultRefreshIntervalMinutes: 60,
      async fetchSignals() {
        // Feed our own real trending signals in as candidate ideas so this
        // source has fresh AI research to show instead of sitting empty —
        // see seedIdeasFromCandidates for the rate-limit reasoning. Alternate
        // by hour with the dropshipping archetype pool (rather than seeding
        // from both every refresh) so the Drop Shipping category gets
        // populated too without a second AI budget — total spend stays
        // governed solely by AI_ECOSYSTEM_SEED_PER_REFRESH.
        try {
          const seedFromDropshipping = new Date().getHours() % 2 === 1;
          let candidates: string[];
          if (seedFromDropshipping) {
            candidates = DROPSHIPPING_SEED_ARCHETYPES;
          } else {
            const { fetchTopHNStories } = await import("@/lib/hacker-news.server");
            const trending = await fetchTopHNStories(10);
            candidates = trending.map((s) => s.title);
          }
          const maxNew = Number(process.env.AI_ECOSYSTEM_SEED_PER_REFRESH ?? 1);
          await seedIdeasFromCandidates(candidates, maxNew);
        } catch {
          // seeding is a bonus, not a requirement — fall through to reading whatever already exists
        }

        const [ideas, productionsByIdeaId] = await Promise.all([
          fetchResearchedIdeas(20),
          fetchPublishedProductionsByIdeaId(),
        ]);
        // Dropshipping-shaped ideas get their own category/tab (see
        // getLiveDropshippingOpportunities below) — exclude them here so
        // they don't show up scored under the generic income profile too.
        return ideas
          .filter((idea) => !isDropshippingIdea(idea))
          .flatMap((idea) => normalizeAiEcosystemIdea(idea, productionsByIdeaId.get(idea.id)));
      },
      buildOpportunity({ opportunityKey, rows, score }) {
        const payload = rows[0].raw_payload as {
          title?: string;
          profitabilityScore?: number | null;
          research?: { analysis?: Record<string, { score: number; reasoning: string }> };
          production?: {
            youtubeUrl?: string | null;
            analytics?: { viewCount?: number; likeCount?: number; commentCount?: number } | null;
          } | null;
        } | null;
        const title = payload?.title ?? opportunityKey;
        const analysis = payload?.research?.analysis;
        const production = payload?.production;
        const published = !!production?.analytics;
        const sparkline = Array.from({ length: 10 }, (_, i) =>
          Math.max(5, Math.round(score.signalScore - (9 - i) * (score.momentum / 30))),
        );
        return {
          id: `live-${opportunityKey}`,
          title,
          category: "income",
          region: "Global",
          detectedAt: rows[0].detected_at,
          verification: published ? "verified" : "pending",
          trend: score.momentum >= 60 ? "up" : score.momentum <= 40 ? "down" : "flat",
          sparkline,
          estimatedStartupCost: { min: 0, max: 0 },
          estimatedTimeCommitment: "Automated — AI-run content pipeline",
          estimatedDifficulty: analysis?.startupDifficulty
            ? difficultyFromScore(analysis.startupDifficulty.score)
            : "moderate",
          estimatedMonthlyPotential: { min: 0, max: 0 },
          summary: published
            ? `Researched, produced, and published by our AI Ecosystem backend — already live on YouTube with ${production?.analytics?.viewCount ?? 0} views. Real audience data, not just a pre-launch estimate.`
            : `Researched by our AI Ecosystem backend as an automatable content-business idea (profitability score ${payload?.profitabilityScore ?? "n/a"}/10 from a 2-step analyst→critic AI chain). A generated hypothesis, not a human-verified plan — read the reasoning before acting.`,
          score,
          aiDetail: {
            whyGrowing: analysis?.demand?.reasoning ?? "No demand analysis available yet.",
            whoIsSucceeding: published
              ? `This exact idea already has a published video — see the real view/like/comment counts in the evidence below.`
              : "Too early to say — this is an AI-generated idea, not a validated business.",
            risks: [
              analysis?.competition?.reasoning ?? "Competition not yet analyzed.",
              published
                ? "One video's performance isn't a guarantee the format repeats — treat as an early read, not a trend"
                : "AI-generated analysis — treat as a starting hypothesis, not verified fact",
              "Not yet cross-corroborated by a second independent source",
            ],
            recommendedCapital:
              "N/A — automated content business, no capital estimate provided by the source",
            difficultyExplanation:
              analysis?.startupDifficulty?.reasoning ?? "Difficulty not yet analyzed.",
            howToBegin: published
              ? [
                  `Watch the published video (${production?.youtubeUrl ?? "see evidence below"}) to see what actually landed`,
                  "Look for a second, related idea to test whether the audience response repeats",
                ]
              : [
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

/**
 * Dropshipping-shaped AI Ecosystem ideas (digital or physical — print on
 * demand, private/white label, reselling, digital downloads), split out
 * from getLiveAiEcosystemOpportunities into their own category/tab. Reads
 * the same already-fetched idea list (isDropshippingIdea classifies by
 * keyword, no extra AI call) and reuses the seeding that source already
 * does, so this doesn't add any additional ai-ecosystem AI usage.
 */
export const getLiveDropshippingOpportunities = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ opportunities: Opportunity[]; lastRun: string | null }> => {
    const {
      fetchResearchedIdeas,
      fetchPublishedProductionsByIdeaId,
      normalizeAiEcosystemIdea,
      difficultyFromScore,
      isDropshippingIdea,
    } = await import("@/lib/ai-ecosystem.server");

    return runLiveSignalSource({
      scoutId: "ai_ecosystem_dropshipping",
      category: "dropshipping",
      sourceType: "ai_ecosystem_dropshipping",
      defaultRefreshIntervalMinutes: 60,
      async fetchSignals() {
        const [ideas, productionsByIdeaId] = await Promise.all([
          fetchResearchedIdeas(20),
          fetchPublishedProductionsByIdeaId(),
        ]);
        return ideas
          .filter(isDropshippingIdea)
          .flatMap((idea) =>
            normalizeAiEcosystemIdea(
              idea,
              productionsByIdeaId.get(idea.id),
              "ai_ecosystem_dropshipping",
            ),
          );
      },
      buildOpportunity({ opportunityKey, rows, score }) {
        const payload = rows[0].raw_payload as {
          title?: string;
          profitabilityScore?: number | null;
          research?: { analysis?: Record<string, { score: number; reasoning: string }> };
          production?: {
            youtubeUrl?: string | null;
            analytics?: { viewCount?: number; likeCount?: number; commentCount?: number } | null;
          } | null;
        } | null;
        const title = payload?.title ?? opportunityKey;
        const analysis = payload?.research?.analysis;
        const production = payload?.production;
        const published = !!production?.analytics;
        const sparkline = Array.from({ length: 10 }, (_, i) =>
          Math.max(5, Math.round(score.signalScore - (9 - i) * (score.momentum / 30))),
        );
        return {
          id: `live-${opportunityKey}`,
          title,
          category: "dropshipping",
          region: "Global",
          detectedAt: rows[0].detected_at,
          verification: published ? "verified" : "pending",
          trend: score.momentum >= 60 ? "up" : score.momentum <= 40 ? "down" : "flat",
          sparkline,
          estimatedStartupCost: { min: 0, max: 500 },
          estimatedTimeCommitment:
            "Part-time to start — supplier/fulfillment is outsourced by design",
          estimatedDifficulty: analysis?.startupDifficulty
            ? difficultyFromScore(analysis.startupDifficulty.score)
            : "moderate",
          estimatedMonthlyPotential: { min: 0, max: 0 },
          summary: published
            ? `Researched and published by our AI Ecosystem backend as a drop-ship/no-inventory business idea — already live with ${production?.analytics?.viewCount ?? 0} views of real audience data.`
            : `Researched by our AI Ecosystem backend as a drop-ship/no-inventory business idea (profitability score ${payload?.profitabilityScore ?? "n/a"}/10). Market saturation is the biggest risk in this model — read the competition analysis before committing to a niche.`,
          score,
          aiDetail: {
            whyGrowing: analysis?.demand?.reasoning ?? "No demand analysis available yet.",
            whoIsSucceeding: published
              ? "This exact idea already has a published video — see the real view/like/comment counts in the evidence below."
              : "Too early to say — this is an AI-generated idea, not a validated business.",
            risks: [
              analysis?.competition?.reasoning ??
                "Competitive saturation not yet analyzed — this is the #1 failure mode for drop-ship niches.",
              "No exclusivity: a working niche gets copied fast once it's visible",
              "Supplier/fulfillment quality is outside your direct control",
            ],
            recommendedCapital:
              "Low to start (ad spend + storefront tooling) — the appeal of this model is minimal upfront inventory risk.",
            difficultyExplanation:
              analysis?.startupDifficulty?.reasoning ?? "Difficulty not yet analyzed.",
            howToBegin: [
              "Validate the niche isn't already saturated before sourcing a supplier",
              "Line up a supplier/fulfillment method (POD provider, dropship supplier, or digital delivery) before spending on ads",
              "Test with a small paid traffic budget before scaling spend",
            ],
            timeToProfitability: "N/A — depends on ad efficiency and niche competition",
            publicEvidence: rows.map((r) => ({
              label: r.evidence,
              sourceScoutId: r.scout_id,
            })),
          },
          sourceScoutIds: ["ai_ecosystem_dropshipping"],
        } satisfies Opportunity;
      },
    });
  },
);

/**
 * Looks up a single live opportunity (id starting "live-") by id across
 * every live source, for the opportunity detail page — the list endpoints
 * above only return the top N per source, so a card clicked from the
 * Discover feed needs its own direct lookup rather than re-slicing a list.
 */
export const getLiveOpportunityById = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }): Promise<{ opportunity: Opportunity | null }> => {
    const [hn, ai, dropshipping] = await Promise.all([
      getLiveOpportunities(),
      getLiveAiEcosystemOpportunities(),
      getLiveDropshippingOpportunities(),
    ]);
    const opportunity =
      [...hn.opportunities, ...ai.opportunities, ...dropshipping.opportunities].find(
        (o) => o.id === data.id,
      ) ?? null;
    return { opportunity };
  });
