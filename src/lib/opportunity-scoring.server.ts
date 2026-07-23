import type { OpportunityIngestionEnvelope } from "@/domain/ingestion/architecture";

export function buildDefaultScoreEnvelope(input: {
  envelope: OpportunityIngestionEnvelope;
  budget?: number;
}) {
  const opportunity = input.envelope.opportunity;
  const startupCost = opportunity.startupCost ?? 0;
  const estimatedProfit = opportunity.estimatedProfit ?? 0;
  const margin = opportunity.estimatedMargin ?? 0;
  const quality = Math.min(100, Math.max(0, (opportunity.dataQualityScore ?? 0) + (opportunity.confidenceScore ?? 0) / 2));
  const capitalPressure = startupCost > 0 ? Math.min(100, Math.max(0, 100 - (startupCost / 1000) * 10)) : 50;
  const beginnerAccessibility = Math.min(100, Math.max(0, 100 - (opportunity.difficulty === "high" ? 30 : opportunity.difficulty === "very_high" ? 45 : 10) - (startupCost > 1000 ? 20 : 0)));
  const profitPotential = Math.min(100, Math.max(0, Math.round(((estimatedProfit ?? 0) / Math.max(1, startupCost || 1000)) * 100 + (margin ?? 0) * 0.5)));
  const lowCapital = Math.min(100, Math.max(0, Math.round((100 - capitalPressure) * 0.6 + (input.budget && startupCost > 0 ? Math.max(0, 100 - (startupCost / Math.max(1, input.budget)) * 100) * 0.4 : 50))));
  const trendMomentum = Math.round((opportunity.trendAnalytics?.momentum as number | undefined) ?? 50);
  const sustainability = Math.min(100, Math.max(0, Math.round((quality * 0.5) + (trendMomentum * 0.3) + (margin * 0.2))));
  const overall = Math.round((profitPotential * 0.28) + (beginnerAccessibility * 0.2) + (lowCapital * 0.2) + (quality * 0.17) + (trendMomentum * 0.1) + (sustainability * 0.05));

  return {
    opportunityId: "",
    profitPotentialScore: profitPotential,
    beginnerAccessibilityScore: beginnerAccessibility,
    lowCapitalScore: lowCapital,
    evidenceConfidenceScore: quality,
    trendMomentumScore: trendMomentum,
    sustainabilityScore: sustainability,
    overallScore: overall,
    scoreBreakdown: {
      capitalPressure,
      budgetScenario: input.budget ?? null,
      model: "budget-aware-v1",
      quality,
    },
    scoringModelVersion: "opportunity-v1",
  };
}
