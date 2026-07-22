import { SignalType } from "../types/signal";
import { Category } from "../types/opportunity";

export const SCORING_VERSION = "weights-2026.07.1";

export type WeightProfile = Partial<Record<SignalType, number>>;

/**
 * Weights are intentionally per-category, not global. "startup_cost" should
 * matter far more for a Product/Business opportunity than for a Trend
 * observation, and "community_interest" matters more for Trend/Income than
 * for a Job posting. This is the single file a human tunes when the model
 * "feels wrong" for a category — nothing else in the engine changes.
 *
 * Every profile's weights should sum to ~1.0 so scores stay comparable
 * across categories. Not enforced at compile time on purpose (mock stage);
 * flagged as a TODO for a runtime validation pass before this goes live.
 */
export const WEIGHT_PROFILES: Record<Category, WeightProfile> = {
  business: {
    market_growth: 0.22,
    revenue_potential: 0.2,
    competition: 0.15,
    startup_cost: 0.13,
    difficulty: 0.1,
    verification_confidence: 0.2,
  },
  product: {
    search_growth: 0.22,
    market_growth: 0.15,
    competition: 0.15,
    startup_cost: 0.13,
    momentum: 0.15,
    verification_confidence: 0.2,
  },
  job: {
    market_growth: 0.15,
    difficulty: 0.1,
    revenue_potential: 0.25,
    verification_confidence: 0.35,
    momentum: 0.15,
  },
  investment: {
    momentum: 0.3,
    market_growth: 0.15,
    competition: 0.2,
    verification_confidence: 0.2,
    difficulty: 0.15,
  },
  trend: {
    search_growth: 0.25,
    community_interest: 0.25,
    momentum: 0.2,
    market_saturation: 0.15,
    verification_confidence: 0.15,
  },
  income: {
    search_growth: 0.18,
    startup_cost: 0.12,
    difficulty: 0.15,
    revenue_potential: 0.2,
    market_saturation: 0.15,
    verification_confidence: 0.2,
  },
};

/** Human-readable reason templates, keyed by signal type and direction.
 * Kept separate from scoring math so copy can be edited freely without
 * risking the numbers, and so the AI summarizer and the rule-based
 * reasons always speak with one voice. */
export const REASON_TEMPLATES: Record<SignalType, { up: string; down: string }> = {
  search_growth: { up: "Search demand increasing", down: "Search demand declining" },
  market_growth: { up: "Market/category growing", down: "Market/category contracting" },
  competition: { up: "Competition intensifying", down: "Low competition" },
  revenue_potential: { up: "Strong revenue potential", down: "Limited revenue potential" },
  startup_cost: { up: "High capital requirement", down: "Low barrier to entry" },
  difficulty: { up: "High execution difficulty", down: "Approachable execution difficulty" },
  momentum: { up: "Accelerating momentum", down: "Momentum stalling" },
  community_interest: {
    up: "Discussion volume increasing",
    down: "Discussion volume flat or falling",
  },
  market_saturation: {
    up: "Supply-side crowding out",
    down: "Supplier/space availability increasing",
  },
  verification_confidence: {
    up: "Strongly corroborated across sources",
    down: "Limited corroboration",
  },
};
