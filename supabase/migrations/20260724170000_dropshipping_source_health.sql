-- === DROP SHIPPING SOURCE HEALTH SEED ===
-- Registers the dropshipping-classified slice of AI Ecosystem ideas
-- (see getLiveDropshippingOpportunities) as its own scout, split out of
-- the general ai_ecosystem source into the dedicated Drop Shipping category.
INSERT INTO public.source_health (scout_id, scout_name, status, refresh_interval_minutes)
VALUES ('ai_ecosystem_dropshipping', 'AI Ecosystem — Drop Shipping', 'never_run', 60)
ON CONFLICT (scout_id) DO NOTHING;
