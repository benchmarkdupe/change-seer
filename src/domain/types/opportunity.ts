import { SignalType } from "./signal";

export type Category =
  | "business"
  | "product"
  | "job"
  | "investment"
  | "trend"
  | "income";

export type VerificationStatus = "verified" | "pending" | "unverified";
export type TrendDirection = "up" | "down" | "flat";
export type Difficulty = "low" | "moderate" | "high" | "very_high";

/** One line item in a score's audit trail. Every one of these must be
 * renderable directly in the UI — no summarizing, no hiding. If a user
 * asks "why is this a 91", this array IS the answer. */
export interface ScoreContribution {
  signalType: SignalType;
  rawValue: number;          // 0-100 as reported
  weight: number;             // weight applied for this opportunity's category profile
  contribution: number;       // signed points this signal added/subtracted from the final score
  inverted: boolean;
  reason: string;             // human-readable, e.g. "Search demand increasing"
}

export interface ScoreBreakdown {
  signalScore: number;        // 0-100 composite
  confidence: number;         // 0-100, how corroborated the score is
  momentum: number;           // 0-100, rate-of-change component
  rating: "high_signal" | "moderate" | "low_signal";
  contributions: ScoreContribution[];
  /** Ordered, top-line reasons for display in the card's "why" list —
   * derived from `contributions`, never authored independently. This
   * guarantees the summary can never disagree with the math. */
  topReasons: string[];
  scoringVersion: string;     // weight-profile version used, for auditability
  computedAt: string;
}

export interface AIDetail {
  whyGrowing: string;
  whoIsSucceeding: string;
  risks: string[];
  recommendedCapital: string;
  difficultyExplanation: string;
  howToBegin: string[];
  timeToProfitability: string;
  publicEvidence: { label: string; sourceScoutId: string }[];
}

export interface Opportunity {
  id: string;
  title: string;
  category: Category;
  region: string;                 // geographic scope
  detectedAt: string;             // ISO date first observed
  verification: VerificationStatus;
  trend: TrendDirection;
  sparkline: number[];            // recent score history for the trend graph

  estimatedStartupCost: { min: number; max: number };
  estimatedTimeCommitment: string;   // e.g. "10-15 hrs/wk"
  estimatedDifficulty: Difficulty;
  estimatedMonthlyPotential: { min: number; max: number };

  summary: string;                // one-paragraph AI summary
  score: ScoreBreakdown;
  aiDetail: AIDetail;

  sourceScoutIds: string[];       // which scouts contributed evidence
}
