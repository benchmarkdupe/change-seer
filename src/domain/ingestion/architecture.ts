export interface OpportunitySourceDefinition {
  id?: string;
  slug: string;
  name: string;
  platform: string;
  sourceType: string;
  sourceUrl?: string | null;
  reliabilityScore?: number;
  dataQualityBaseline?: number;
  isActive?: boolean;
}

export interface RawSourceRecordInput {
  sourceId: string;
  externalId: string;
  sourceType: string;
  sourceUrl?: string | null;
  payload: Record<string, unknown>;
  discoveredAt?: string;
  lastSeenAt?: string;
  status?: "new" | "updated" | "ignored" | "error";
}

export interface NormalizedOpportunityInput {
  sourceId: string;
  externalId?: string | null;
  title: string;
  category: string;
  businessModel?: string | null;
  startupCost?: number | null;
  operatingCost?: number | null;
  estimatedRevenue?: number | null;
  estimatedProfit?: number | null;
  estimatedMargin?: number | null;
  requiredSkills?: string[];
  difficulty?: string | null;
  locationMarket?: string | null;
  evidenceSummary?: string | null;
  sourceReliability?: number | null;
  dataQualityScore?: number | null;
  confidenceScore?: number | null;
  trendAnalytics?: Record<string, unknown>;
  discoveredAt?: string;
  lastUpdatedAt?: string;
  sourceUrl?: string | null;
}

export interface OpportunityEvidenceInput {
  opportunityId: string;
  evidenceType: string;
  summary: string;
  sourceUrl?: string | null;
  reliabilityScore?: number | null;
  confidenceScore?: number | null;
  evidenceAt?: string;
}

export interface OpportunityScoreSnapshotInput {
  opportunityId: string;
  profitPotentialScore: number;
  beginnerAccessibilityScore: number;
  lowCapitalScore: number;
  evidenceConfidenceScore: number;
  trendMomentumScore: number;
  sustainabilityScore: number;
  overallScore: number;
  scoreBreakdown?: Record<string, unknown>;
  scoringModelVersion?: string;
  createdAt?: string;
}

export interface OpportunityAnalyticsSnapshotInput {
  opportunityId: string;
  snapshotAt?: string;
  score?: number | null;
  trendDirection?: string | null;
  engagementScore?: number | null;
  sourceCount?: number | null;
  evidenceCount?: number | null;
  snapshotPayload?: Record<string, unknown>;
}

export interface OpportunityUserInteractionInput {
  opportunityId: string;
  userId: string;
  interactionType: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface OpportunityIngestionEnvelope {
  source: OpportunitySourceDefinition;
  rawRecord?: RawSourceRecordInput;
  opportunity: NormalizedOpportunityInput;
  evidence?: OpportunityEvidenceInput[];
  score?: OpportunityScoreSnapshotInput;
  analytics?: OpportunityAnalyticsSnapshotInput[];
  interaction?: OpportunityUserInteractionInput;
}

export function buildScoreSnapshotFromInputs(input: {
  profitPotentialScore: number;
  beginnerAccessibilityScore: number;
  lowCapitalScore: number;
  evidenceConfidenceScore: number;
  trendMomentumScore: number;
  sustainabilityScore: number;
  overallScore?: number;
  scoringModelVersion?: string;
}): OpportunityScoreSnapshotInput {
  return {
    opportunityId: "",
    profitPotentialScore: input.profitPotentialScore,
    beginnerAccessibilityScore: input.beginnerAccessibilityScore,
    lowCapitalScore: input.lowCapitalScore,
    evidenceConfidenceScore: input.evidenceConfidenceScore,
    trendMomentumScore: input.trendMomentumScore,
    sustainabilityScore: input.sustainabilityScore,
    overallScore: input.overallScore ?? Math.round(
      (input.profitPotentialScore * 0.3) +
        (input.beginnerAccessibilityScore * 0.2) +
        (input.lowCapitalScore * 0.2) +
        (input.evidenceConfidenceScore * 0.15) +
        (input.trendMomentumScore * 0.1) +
        (input.sustainabilityScore * 0.05),
    ),
    scoringModelVersion: input.scoringModelVersion ?? "opportunity-v1",
  };
}

export function buildAnalyticsSnapshotFromInputs(input: {
  opportunityId: string;
  score?: number | null;
  trendDirection?: string | null;
  engagementScore?: number | null;
  sourceCount?: number | null;
  evidenceCount?: number | null;
  snapshotPayload?: Record<string, unknown>;
}): OpportunityAnalyticsSnapshotInput {
  return {
    opportunityId: input.opportunityId,
    snapshotAt: new Date().toISOString(),
    score: input.score ?? null,
    trendDirection: input.trendDirection ?? null,
    engagementScore: input.engagementScore ?? null,
    sourceCount: input.sourceCount ?? null,
    evidenceCount: input.evidenceCount ?? null,
    snapshotPayload: input.snapshotPayload ?? {},
  };
}
