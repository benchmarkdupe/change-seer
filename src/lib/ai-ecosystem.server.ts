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

/** Turn one researched idea's 5-dimension analysis into signals. AI-generated (analyst→critic reviewed), so scouted at moderate (not maximal) source confidence. */
export function normalizeAiEcosystemIdea(idea: AiEcosystemIdea): NormalizedLiveSignal[] {
  const analysis = idea.research?.analysis;
  if (!analysis) return [];

  const key = `ai-ecosystem-${idea.id}`;
  return (Object.keys(DIMENSION_TO_SIGNAL) as Array<keyof AiEcosystemAnalysis>)
    .map((dimension): NormalizedLiveSignal | null => {
      const entry = analysis[dimension];
      if (!entry) return null;
      const { signalType, label } = DIMENSION_TO_SIGNAL[dimension];
      return {
        opportunity_key: key,
        scout_id: "ai_ecosystem",
        signal_type: signalType,
        value: Math.round(Math.min(10, Math.max(0, entry.score)) * 10),
        evidence: entry.reasoning || `AI Ecosystem scored ${label} at ${entry.score}/10`,
        source_url: null,
        source_confidence: 75,
        raw_payload: idea as unknown as Record<string, unknown>,
      };
    })
    .filter((s): s is NormalizedLiveSignal => s !== null);
}

export function difficultyFromScore(score0to10: number): Difficulty {
  if (score0to10 <= 2.5) return "low";
  if (score0to10 <= 5) return "moderate";
  if (score0to10 <= 7.5) return "high";
  return "very_high";
}
