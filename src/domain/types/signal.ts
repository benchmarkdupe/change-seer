/**
 * signal.ts
 *
 * A Signal is the atomic unit of evidence in OpportunityOS.
 * Every Scout, regardless of what it collects from (Reddit, Google Trends,
 * a state bid board, an eBay sold-listings feed), outputs Signals in this
 * exact shape. The Scoring Engine never knows or cares where a signal came
 * from beyond its `scoutId` — this is what lets us add a TikTokScout next
 * quarter without touching the engine or any existing scout.
 */

export type SignalType =
  | "search_growth" // rising/falling search interest
  | "market_growth" // TAM / category growth
  | "competition" // how saturated the space is (higher = worse)
  | "revenue_potential" // estimated upside
  | "startup_cost" // capital required (higher = worse)
  | "difficulty" // execution difficulty (higher = worse)
  | "momentum" // rate of change over recent window
  | "community_interest" // discussion/engagement volume
  | "market_saturation" // supply-side crowding (higher = worse)
  | "verification_confidence"; // how corroborated/legitimate the source is

/** Signals where a HIGHER raw value is WORSE for the opportunity.
 * The scoring engine inverts these before weighting. Centralizing this
 * list means a new scout never has to know about polarity — it just
 * reports what it observed. */
export const INVERTED_SIGNAL_TYPES: ReadonlySet<SignalType> = new Set([
  "competition",
  "startup_cost",
  "difficulty",
  "market_saturation",
]);

export interface RawSignal {
  /** Which opportunity this evidence pertains to (Scouts key on external identity —
   * a title/source fingerprint — resolved to an internal opportunityId at ingestion) */
  opportunityKey: string;
  scoutId: string;
  type: SignalType;
  /** 0-100, already normalized by the scout that produced it */
  value: number;
  /** Free-text evidence a human (or the AI summarizer) can point to.
   * This is what makes every score traceable back to *something real*. */
  evidence: string;
  detectedAt: string; // ISO timestamp
  /** Scout's own confidence in this specific observation, 0-100 */
  sourceConfidence: number;
}
