/**
 * DataState — honesty rail.
 *
 * OpportunityOS is designed to eventually ingest real data from live
 * providers. Until a signal is actually sourced from a real API, the UI
 * MUST NOT imply otherwise. This enum is the single source of truth for
 * how a piece of data is currently sourced.
 *
 *  - sample:   seeded demo data, no real provider
 *  - live:     just refreshed from a real provider
 *  - stale:    real provider, but data is older than its refresh window
 *  - pending:  observation exists, awaiting second-source verification
 *  - verified: cross-corroborated across ≥2 independent providers
 */
export type DataState = "sample" | "live" | "stale" | "pending" | "verified";

export const DATA_STATE_LABEL: Record<DataState, string> = {
  sample: "Sample data",
  live: "Live",
  stale: "Stale",
  pending: "Pending verification",
  verified: "Verified",
};

export const DATA_STATE_EXPLAINER: Record<DataState, string> = {
  sample:
    "This is seeded demo data — no live provider is connected yet. It's here so you can see how OpportunityOS thinks. Real scout integrations will replace it.",
  live: "Just refreshed from a connected data source.",
  stale:
    "This came from a real source, but the data is older than its normal refresh window — treat with caution.",
  pending:
    "One scout observed this, but it hasn't been corroborated by a second independent source yet.",
  verified: "Cross-corroborated across at least two independent scouts or sources.",
};
