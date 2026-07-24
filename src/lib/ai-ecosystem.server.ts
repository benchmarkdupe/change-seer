import type { NormalizedLiveSignal } from "@/lib/live-signal-source.server";
import type { Difficulty } from "@/domain/types/opportunity";

/**
 * AI Ecosystem (github.com/benchmarkdupe/ai-ecosystem) is our own backend —
 * a self-hosted "Opportunity Engine" that researches ideas for autonomous
 * content businesses via a 2-step analyst→critic AI chain and scores them
 * on 5 dimensions (demand, competition, monetizationPotential,
 * startupDifficulty, automationPotential). It's designed by its own README
 * to be consumed by an external frontend like this one over HTTP, auth'd
 * with a shared x-api-key. We treat researched ideas as a real Income
 * scout: genuine AI analysis against a live idea record, not synthesized
 * mock data.
 *
 * Docs: https://github.com/benchmarkdupe/ai-ecosystem/blob/main/services/opportunity-engine/README.md
 */
const AI_ECOSYSTEM_URL = process.env.AI_ECOSYSTEM_OPPORTUNITY_ENGINE_URL;
const AI_ECOSYSTEM_API_KEY = process.env.AI_ECOSYSTEM_API_KEY;
const YOUTUBE_WORKER_URL = process.env.AI_ECOSYSTEM_YOUTUBE_WORKER_URL;

export interface AiEcosystemDimension {
  score: number; // 0-10
  reasoning: string;
}

export interface AiEcosystemAnalysis {
  demand: AiEcosystemDimension;
  competition: AiEcosystemDimension;
  monetizationPotential: AiEcosystemDimension;
  startupDifficulty: AiEcosystemDimension;
  automationPotential: AiEcosystemDimension;
}

export interface AiEcosystemIdea {
  id: number;
  title: string;
  notes: string | null;
  type: string;
  status: "new" | "researched" | "scripted";
  research: { analysis: AiEcosystemAnalysis } | null;
  profitabilityScore: number | null;
  script: unknown;
  createdAt: string;
  updatedAt: string;
}

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${AI_ECOSYSTEM_URL}${path}`, {
    headers: AI_ECOSYSTEM_API_KEY ? { "x-api-key": AI_ECOSYSTEM_API_KEY } : undefined,
  });
  if (!res.ok) throw new Error(`AI Ecosystem ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

async function fetchYoutubeWorkerJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${YOUTUBE_WORKER_URL}${path}`, {
    headers: AI_ECOSYSTEM_API_KEY ? { "x-api-key": AI_ECOSYSTEM_API_KEY } : undefined,
  });
  if (!res.ok) throw new Error(`YouTube Worker ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${AI_ECOSYSTEM_URL}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(AI_ECOSYSTEM_API_KEY ? { "x-api-key": AI_ECOSYSTEM_API_KEY } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`AI Ecosystem ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

/** Ideas that have completed the research step (status "researched" or "scripted") — earlier ones have no analysis to score yet. */
export async function fetchResearchedIdeas(limit = 20): Promise<AiEcosystemIdea[]> {
  if (!AI_ECOSYSTEM_URL) return [];
  const ideas = await fetchJSON<AiEcosystemIdea[]>("/ideas");
  return ideas.filter((idea) => idea.research?.analysis).slice(0, limit);
}

export interface YoutubeProductionAnalytics {
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
}

export interface YoutubeProduction {
  id: number;
  ideaId: number;
  status: string;
  youtubeVideoId: string | null;
  youtubeUrl: string | null;
  publishedAt: string | null;
  analytics: YoutubeProductionAnalytics | null;
}

/**
 * Published productions from the youtube-worker service, keyed by the idea
 * they were scripted from. This is the strongest evidence tier this app
 * has anywhere: real audience outcome data (actual view/like/comment
 * counts on a live video), not a pre-launch AI estimate. Reads whatever
 * youtube-worker already has cached rather than forcing a fresh YouTube
 * Data API call on every refresh, to stay well inside its quota — see
 * `GET /productions/:id/analytics` in youtube-worker's README if you want
 * to force a refresh from there instead.
 */
export async function fetchPublishedProductionsByIdeaId(): Promise<Map<number, YoutubeProduction>> {
  const byIdea = new Map<number, YoutubeProduction>();
  if (!YOUTUBE_WORKER_URL) return byIdea;
  try {
    const productions = await fetchYoutubeWorkerJSON<YoutubeProduction[]>(
      "/productions?status=published",
    );
    for (const p of productions) {
      if (p.ideaId != null) byIdea.set(p.ideaId, p);
    }
  } catch {
    // youtube-worker being unreachable shouldn't take down the AI Ecosystem source
  }
  return byIdea;
}

/**
 * Creates + researches up to `maxNew` fresh ideas from candidate titles
 * that don't already exist there, so the AI Ecosystem feed has real
 * AI-researched ideas to show instead of sitting empty until someone
 * manually creates one via its dashboard. Candidates are typically our own
 * live signals (e.g. trending Hacker News titles) — ai-ecosystem's
 * analyst→critic chain will score literally any text as a business idea,
 * so a low score on a bad candidate is itself useful signal, not a bug.
 *
 * Kept deliberately small: each research call is a 2-step AI chain (2
 * requests), and the free-tier OpenRouter models ai-ecosystem ships with by
 * default are capped at 50 requests/day, 20/min account-wide — see its
 * README. At the default hourly refresh interval, maxNew=1 uses ~48 of
 * that daily budget; raise it only if you're on a paid OpenRouter key, or
 * set AI_ECOSYSTEM_SEED_PER_REFRESH=0 to disable auto-seeding entirely.
 *
 * Best-effort throughout: a candidate that fails to create/research is
 * skipped, never thrown — this must never break the read path.
 */
export async function seedIdeasFromCandidates(
  candidateTitles: string[],
  maxNew: number,
): Promise<void> {
  if (!AI_ECOSYSTEM_URL || maxNew <= 0 || candidateTitles.length === 0) return;

  let existing: Set<string>;
  try {
    const ideas = await fetchJSON<AiEcosystemIdea[]>("/ideas");
    existing = new Set(ideas.map((i) => i.title.trim().toLowerCase()));
  } catch {
    return; // can't safely dedupe against what's already there — skip this run
  }

  let created = 0;
  for (const rawTitle of candidateTitles) {
    if (created >= maxNew) break;
    const title = rawTitle.trim();
    const key = title.toLowerCase();
    if (!title || existing.has(key)) continue;

    try {
      const idea = await postJSON<{ id: number }>("/ideas", { title });
      await postJSON(`/ideas/${idea.id}/research`, {});
      existing.add(key);
      created++;
    } catch {
      // one bad candidate (e.g. a title the analyst model chokes on) shouldn't stop the rest
    }
  }
}

const DROPSHIPPING_KEYWORDS = [
  "dropship",
  "drop ship",
  "drop-ship",
  "print on demand",
  "print-on-demand",
  "pod store",
  "white label",
  "private label",
  "digital download",
  "digital product store",
  "reseller",
  "reselling",
];

/** Whether an idea is dropshipping-shaped (digital or physical) rather than general "online income" — routes it to the dedicated Drop Shipping category instead. Keyword-based on purpose: no extra AI call needed to classify it. */
export function isDropshippingIdea(idea: Pick<AiEcosystemIdea, "title" | "notes">): boolean {
  const text = `${idea.title} ${idea.notes ?? ""}`.toLowerCase();
  return DROPSHIPPING_KEYWORDS.some((kw) => text.includes(kw));
}

/**
 * A few evergreen dropshipping archetypes (digital and physical), used as a
 * fallback candidate pool for seedIdeasFromCandidates so the Drop Shipping
 * category actually gets real AI-researched ideas over time — without a
 * second seeding budget. Callers should alternate between this and real
 * trending-signal candidates (e.g. by hour) rather than seed from both every
 * refresh, so total AI spend stays governed solely by
 * AI_ECOSYSTEM_SEED_PER_REFRESH.
 */
export const DROPSHIPPING_SEED_ARCHETYPES = [
  "a print-on-demand store for a specific hobby niche",
  "a dropshipping store for a single trending physical product category",
  "a private-label reseller for a niche home goods category",
  "a digital download store selling templates for a specific profession",
];

const DIMENSION_TO_SIGNAL: Record<
  keyof AiEcosystemAnalysis,
  { signalType: string; label: string }
> = {
  demand: { signalType: "search_growth", label: "demand" },
  competition: { signalType: "market_saturation", label: "competitive saturation" },
  monetizationPotential: { signalType: "revenue_potential", label: "monetization potential" },
  startupDifficulty: { signalType: "difficulty", label: "startup difficulty" },
  automationPotential: { signalType: "automation_potential", label: "automation potential" },
};

/**
 * Turn one researched idea's 5-dimension analysis into signals. AI-generated
 * (analyst→critic reviewed), so scouted at moderate (not maximal) source
 * confidence — unless a published YouTube production backs it with real
 * audience data, in which case that outcome data drives a much stronger
 * verification_confidence signal, since it's no longer just a model's guess.
 */
export function normalizeAiEcosystemIdea(
  idea: AiEcosystemIdea,
  production?: YoutubeProduction | null,
  scoutId: string = "ai_ecosystem",
): NormalizedLiveSignal[] {
  const analysis = idea.research?.analysis;
  if (!analysis) return [];

  const key = `ai-ecosystem-${idea.id}`;
  const payload = { ...idea, production: production ?? null } as unknown as Record<string, unknown>;

  const signals = (Object.keys(DIMENSION_TO_SIGNAL) as Array<keyof AiEcosystemAnalysis>)
    .map((dimension): NormalizedLiveSignal | null => {
      const entry = analysis[dimension];
      if (!entry) return null;
      const { signalType, label } = DIMENSION_TO_SIGNAL[dimension];
      return {
        opportunity_key: key,
        scout_id: scoutId,
        signal_type: signalType,
        value: Math.round(Math.min(10, Math.max(0, entry.score)) * 10),
        evidence: entry.reasoning || `AI Ecosystem scored ${label} at ${entry.score}/10`,
        source_url: null,
        source_confidence: 75,
        raw_payload: payload,
      };
    })
    .filter((s): s is NormalizedLiveSignal => s !== null);

  if (production?.analytics) {
    const { viewCount = 0, likeCount = 0, commentCount = 0 } = production.analytics;
    signals.push({
      opportunity_key: key,
      scout_id: scoutId,
      signal_type: "verification_confidence",
      value: 95,
      evidence: `Published on YouTube and getting real traction: ${viewCount} views, ${likeCount} likes, ${commentCount} comments — actual outcome data, not a pre-launch estimate.`,
      source_url: production.youtubeUrl,
      source_confidence: 95,
      raw_payload: payload,
    });
  }

  return signals;
}

export function difficultyFromScore(score0to10: number): Difficulty {
  if (score0to10 <= 2.5) return "low";
  if (score0to10 <= 5) return "moderate";
  if (score0to10 <= 7.5) return "high";
  return "very_high";
}
