import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { OpportunityIngestionEnvelope } from "@/domain/ingestion/architecture";

export async function ingestOpportunityEnvelope(envelope: OpportunityIngestionEnvelope) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase service role credentials for ingestion");
  }

  const supabase = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const opportunityId = `opp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const insertedAt = new Date().toISOString();

  const { error: sourceError } = await supabase.from("opportunity_sources").upsert({
    id: envelope.source.slug,
    name: envelope.source.name,
    platform: envelope.source.platform,
    source_type: envelope.source.sourceType,
    source_url: envelope.source.sourceUrl ?? null,
    reliability_score: envelope.source.reliabilityScore ?? 0,
    data_quality_baseline: envelope.source.dataQualityBaseline ?? 0,
    active: envelope.source.isActive ?? true,
    created_at: insertedAt,
    updated_at: insertedAt,
  }, { onConflict: "id" });

  if (sourceError) throw sourceError;

  const { error: oppError } = await supabase.from("opportunities").insert({
    id: opportunityId,
    source_id: envelope.source.slug,
    external_id: envelope.rawRecord?.externalId ?? null,
    title: envelope.opportunity.title,
    category: envelope.opportunity.category,
    business_model: envelope.opportunity.businessModel ?? null,
    startup_cost: envelope.opportunity.startupCost ?? null,
    operating_cost: envelope.opportunity.operatingCost ?? null,
    estimated_revenue: envelope.opportunity.estimatedRevenue ?? null,
    estimated_profit: envelope.opportunity.estimatedProfit ?? null,
    estimated_margin: envelope.opportunity.estimatedMargin ?? null,
    required_skills: envelope.opportunity.requiredSkills ?? [],
    difficulty: envelope.opportunity.difficulty ?? null,
    location_market: envelope.opportunity.locationMarket ?? null,
    evidence_summary: envelope.opportunity.evidenceSummary ?? null,
    source_reliability: envelope.opportunity.sourceReliability ?? null,
    data_quality_score: envelope.opportunity.dataQualityScore ?? null,
    confidence_score: envelope.opportunity.confidenceScore ?? null,
    trend_analytics: envelope.opportunity.trendAnalytics ?? {},
    discovered_at: envelope.opportunity.discoveredAt ?? insertedAt,
    last_updated_at: envelope.opportunity.lastUpdatedAt ?? insertedAt,
    source_url: envelope.opportunity.sourceUrl ?? null,
    created_at: insertedAt,
    updated_at: insertedAt,
  });

  if (oppError) throw oppError;

  if (envelope.evidence?.length) {
    const { error: evidenceError } = await supabase.from("opportunity_evidence").insert(
      envelope.evidence.map((item) => ({
        opportunity_id: opportunityId,
        evidence_type: item.evidenceType,
        summary: item.summary,
        source_url: item.sourceUrl ?? null,
        reliability_score: item.reliabilityScore ?? null,
        confidence_score: item.confidenceScore ?? null,
        evidence_at: item.evidenceAt ?? insertedAt,
        created_at: insertedAt,
      })),
    );

    if (evidenceError) throw evidenceError;
  }

  if (envelope.score) {
    const { error: scoreError } = await supabase.from("opportunity_score_snapshots").insert({
      opportunity_id: opportunityId,
      profit_potential_score: envelope.score.profitPotentialScore,
      beginner_accessibility_score: envelope.score.beginnerAccessibilityScore,
      low_capital_score: envelope.score.lowCapitalScore,
      evidence_confidence_score: envelope.score.evidenceConfidenceScore,
      trend_momentum_score: envelope.score.trendMomentumScore,
      sustainability_score: envelope.score.sustainabilityScore,
      overall_score: envelope.score.overallScore,
      score_breakdown: envelope.score.scoreBreakdown ?? {},
      scoring_model_version: envelope.score.scoringModelVersion ?? "opportunity-v1",
      created_at: insertedAt,
    });

    if (scoreError) throw scoreError;
  }

  if (envelope.analytics?.length) {
    const { error: analyticsError } = await supabase.from("opportunity_analytics_snapshots").insert(
      envelope.analytics.map((item) => ({
        opportunity_id: opportunityId,
        snapshot_at: item.snapshotAt ?? insertedAt,
        score: item.score ?? null,
        trend_direction: item.trendDirection ?? null,
        engagement_score: item.engagementScore ?? null,
        source_count: item.sourceCount ?? null,
        evidence_count: item.evidenceCount ?? null,
        snapshot_payload: item.snapshotPayload ?? {},
      })),
    );

    if (analyticsError) throw analyticsError;
  }

  if (envelope.interaction) {
    const { error: interactionError } = await supabase.from("opportunity_user_interactions").insert({
      opportunity_id: opportunityId,
      user_id: envelope.interaction.userId,
      interaction_type: envelope.interaction.interactionType,
      metadata: envelope.interaction.metadata ?? {},
      created_at: envelope.interaction.createdAt ?? insertedAt,
    });

    if (interactionError) throw interactionError;
  }

  return { opportunityId };
}
