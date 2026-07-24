-- === AI ECOSYSTEM SOURCE HEALTH SEED ===
-- Registers our self-hosted AI Ecosystem opportunity-engine
-- (github.com/benchmarkdupe/ai-ecosystem) as a live scout, alongside the
-- existing Hacker News / Reddit / etc. entries seeded in the ingestion
-- foundation migration.
INSERT INTO public.source_health (scout_id, scout_name, status, refresh_interval_minutes)
VALUES ('ai_ecosystem', 'AI Ecosystem Opportunity Engine', 'never_run', 60)
ON CONFLICT (scout_id) DO NOTHING;
