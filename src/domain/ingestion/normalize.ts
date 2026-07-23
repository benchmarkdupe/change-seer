import type { OpportunityIngestionEnvelope, NormalizedOpportunityInput } from "./architecture";

export function normalizeOpportunityForStorage(input: NormalizedOpportunityInput): NormalizedOpportunityInput {
  return {
    ...input,
    title: input.title.trim(),
    category: input.category.trim().toLowerCase(),
    requiredSkills: (input.requiredSkills ?? []).map((skill) => skill.trim()).filter(Boolean),
    difficulty: input.difficulty?.trim() ?? "unknown",
    locationMarket: input.locationMarket?.trim() ?? null,
    evidenceSummary: input.evidenceSummary?.trim() ?? null,
    sourceReliability: input.sourceReliability ?? 0,
    dataQualityScore: input.dataQualityScore ?? 0,
    confidenceScore: input.confidenceScore ?? 0,
  };
}

export function buildIngestionEnvelope(input: NormalizedOpportunityInput): OpportunityIngestionEnvelope {
  return {
    source: {
      slug: input.sourceId,
      name: input.sourceId,
      platform: input.sourceId,
      sourceType: "ingested",
      sourceUrl: input.sourceUrl ?? null,
    },
    opportunity: normalizeOpportunityForStorage(input),
  };
}
