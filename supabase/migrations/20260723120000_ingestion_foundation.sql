-- === OPPORTUNITY DATA FOUNDATION ===
CREATE TABLE public.opportunity_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_url TEXT,
  reliability_score NUMERIC DEFAULT 0,
  data_quality_baseline NUMERIC DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.opportunity_sources TO anon, authenticated;
GRANT ALL ON public.opportunity_sources TO service_role;
ALTER TABLE public.opportunity_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sources are viewable by all" ON public.opportunity_sources FOR SELECT USING (true);

CREATE TABLE public.opportunities (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES public.opportunity_sources(id) ON DELETE RESTRICT,
  external_id TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  business_model TEXT,
  startup_cost NUMERIC,
  operating_cost NUMERIC,
  estimated_revenue NUMERIC,
  estimated_profit NUMERIC,
  estimated_margin NUMERIC,
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  difficulty TEXT,
  location_market TEXT,
  evidence_summary TEXT,
  source_reliability NUMERIC,
  data_quality_score NUMERIC,
  confidence_score NUMERIC,
  trend_analytics JSONB NOT NULL DEFAULT '{}'::jsonb,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_opportunities_category ON public.opportunities(category);
CREATE INDEX idx_opportunities_confidence ON public.opportunities(confidence_score DESC);
CREATE INDEX idx_opportunities_discovered ON public.opportunities(discovered_at DESC);
GRANT SELECT ON public.opportunities TO anon, authenticated;
GRANT ALL ON public.opportunities TO service_role;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Opportunities are viewable by all" ON public.opportunities FOR SELECT USING (true);

CREATE TABLE public.opportunity_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id TEXT NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  source_url TEXT,
  reliability_score NUMERIC,
  confidence_score NUMERIC,
  evidence_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_opportunity_evidence_opportunity ON public.opportunity_evidence(opportunity_id, evidence_at DESC);
GRANT SELECT ON public.opportunity_evidence TO anon, authenticated;
GRANT ALL ON public.opportunity_evidence TO service_role;
ALTER TABLE public.opportunity_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Evidence is viewable by all" ON public.opportunity_evidence FOR SELECT USING (true);

CREATE TABLE public.opportunity_score_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id TEXT NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  profit_potential_score NUMERIC NOT NULL,
  beginner_accessibility_score NUMERIC NOT NULL,
  low_capital_score NUMERIC NOT NULL,
  evidence_confidence_score NUMERIC NOT NULL,
  trend_momentum_score NUMERIC NOT NULL,
  sustainability_score NUMERIC NOT NULL,
  overall_score NUMERIC NOT NULL,
  score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  scoring_model_version TEXT NOT NULL DEFAULT 'opportunity-v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_opportunity_score_snapshots_opportunity ON public.opportunity_score_snapshots(opportunity_id, created_at DESC);
GRANT SELECT ON public.opportunity_score_snapshots TO anon, authenticated;
GRANT ALL ON public.opportunity_score_snapshots TO service_role;
ALTER TABLE public.opportunity_score_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scores are viewable by all" ON public.opportunity_score_snapshots FOR SELECT USING (true);

CREATE TABLE public.opportunity_analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id TEXT NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  score NUMERIC,
  trend_direction TEXT,
  engagement_score NUMERIC,
  source_count INT,
  evidence_count INT,
  snapshot_payload JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX idx_opportunity_analytics_snapshots_opportunity ON public.opportunity_analytics_snapshots(opportunity_id, snapshot_at DESC);
GRANT SELECT ON public.opportunity_analytics_snapshots TO anon, authenticated;
GRANT ALL ON public.opportunity_analytics_snapshots TO service_role;
ALTER TABLE public.opportunity_analytics_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Analytics snapshots are viewable by all" ON public.opportunity_analytics_snapshots FOR SELECT USING (true);

CREATE TABLE public.opportunity_user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id TEXT NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_opportunity_user_interactions_user ON public.opportunity_user_interactions(user_id, created_at DESC);
GRANT SELECT, INSERT ON public.opportunity_user_interactions TO authenticated;
GRANT ALL ON public.opportunity_user_interactions TO service_role;
ALTER TABLE public.opportunity_user_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own interactions" ON public.opportunity_user_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own interactions" ON public.opportunity_user_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_opportunity_sources_updated BEFORE UPDATE ON public.opportunity_sources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_opportunities_updated BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
