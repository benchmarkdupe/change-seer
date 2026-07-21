
-- === ENUMS ===
CREATE TYPE public.app_role AS ENUM ('user', 'early_access', 'builder', 'moderator', 'admin', 'developer');
CREATE TYPE public.profile_visibility AS ENUM ('public', 'private');
CREATE TYPE public.source_status AS ENUM ('healthy', 'degraded', 'down', 'never_run');
CREATE TYPE public.transaction_kind AS ENUM ('income', 'expense');
CREATE TYPE public.project_status AS ENUM ('exploring', 'building', 'launched', 'paused', 'shelved');

-- === PROFILES ===
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  region TEXT,
  interests TEXT[] DEFAULT '{}',
  visibility public.profile_visibility NOT NULL DEFAULT 'public',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by all"
  ON public.profiles FOR SELECT
  USING (visibility = 'public' OR auth.uid() = id);
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- === USER ROLES ===
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- === BADGES ===
CREATE TABLE public.badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  icon TEXT NOT NULL DEFAULT 'award',
  color TEXT NOT NULL DEFAULT 'primary',
  max_supply INT,
  retired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.badges TO anon, authenticated;
GRANT ALL ON public.badges TO service_role;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges are public" ON public.badges FOR SELECT USING (true);

CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  issue_number INT,
  displayed BOOLEAN NOT NULL DEFAULT TRUE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
GRANT SELECT ON public.user_badges TO anon, authenticated;
GRANT UPDATE ON public.user_badges TO authenticated;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User badges are public" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users toggle own badge display" ON public.user_badges FOR UPDATE USING (auth.uid() = user_id);

-- === SAVED OPPORTUNITIES ===
CREATE TABLE public.saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL,
  note TEXT,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, opportunity_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_opportunities TO authenticated;
GRANT ALL ON public.saved_opportunities TO service_role;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saves"
  ON public.saved_opportunities FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- === PROJECTS ===
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  status public.project_status NOT NULL DEFAULT 'exploring',
  visibility public.profile_visibility NOT NULL DEFAULT 'private',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own projects or public"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id OR visibility = 'public');
CREATE POLICY "Users manage own projects"
  ON public.projects FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- === TRANSACTIONS ===
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  kind public.transaction_kind NOT NULL,
  amount_cents BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  category TEXT,
  description TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own transactions"
  ON public.transactions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- === SOURCE HEALTH ===
CREATE TABLE public.source_health (
  scout_id TEXT PRIMARY KEY,
  scout_name TEXT NOT NULL,
  status public.source_status NOT NULL DEFAULT 'never_run',
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  last_error TEXT,
  records_last_run INT NOT NULL DEFAULT 0,
  total_runs INT NOT NULL DEFAULT 0,
  refresh_interval_minutes INT NOT NULL DEFAULT 60,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.source_health TO anon, authenticated;
GRANT ALL ON public.source_health TO service_role;
ALTER TABLE public.source_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Source health is public" ON public.source_health FOR SELECT USING (true);

-- === OPPORTUNITY SIGNALS (real, persisted) ===
CREATE TABLE public.opportunity_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id TEXT NOT NULL,
  opportunity_key TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  evidence TEXT NOT NULL,
  source_url TEXT,
  source_confidence INT NOT NULL DEFAULT 50,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_payload JSONB
);
CREATE INDEX idx_signals_opp ON public.opportunity_signals(opportunity_key, detected_at DESC);
CREATE INDEX idx_signals_scout ON public.opportunity_signals(scout_id, detected_at DESC);
GRANT SELECT ON public.opportunity_signals TO anon, authenticated;
GRANT ALL ON public.opportunity_signals TO service_role;
ALTER TABLE public.opportunity_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signals are public" ON public.opportunity_signals FOR SELECT USING (true);

-- === UPDATED_AT TRIGGER ===
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- === SIGNUP HOOK: profile + role + founding-tester badge ===
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  founding_count INT;
  next_issue INT;
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;

  -- Founding Tester: first 100 users get an issue number
  SELECT COUNT(*) INTO founding_count FROM public.user_badges WHERE badge_id = 'founding-tester';
  IF founding_count < 100 THEN
    next_issue := founding_count + 1;
    INSERT INTO public.user_badges (user_id, badge_id, issue_number)
    VALUES (NEW.id, 'founding-tester', next_issue)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'early_access')
    ON CONFLICT DO NOTHING;

    IF next_issue <= 10 THEN
      INSERT INTO public.user_badges (user_id, badge_id, issue_number)
      VALUES (NEW.id, 'first-ten', next_issue)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- === BADGE SEEDS ===
INSERT INTO public.badges (id, name, description, rarity, icon, color, max_supply) VALUES
  ('founding-tester', 'Founding Tester', 'One of the first 100 people to try OpportunityOS. Retired at issue 100.', 'legendary', 'sparkles', 'tier-high', 100),
  ('first-ten', 'First Ten', 'One of the first ten users ever. Never re-issued.', 'mythic', 'crown', 'tier-high', 10),
  ('early-access', 'Early Access', 'Joined during early access.', 'rare', 'zap', 'primary', NULL),
  ('first-build', 'First Build', 'Created your first project from an opportunity.', 'uncommon', 'hammer', 'tier-mod', NULL),
  ('first-sale', 'First Sale', 'Logged your first income transaction.', 'uncommon', 'trending-up', 'tier-high', NULL),
  ('early-signal', 'Early Signal', 'Saved an opportunity before it hit High Signal.', 'rare', 'radar', 'primary', NULL),
  ('verified-builder', 'Verified Builder', 'Externally verified project outcomes.', 'legendary', 'shield-check', 'state-verified', NULL);

-- === SOURCE HEALTH SEEDS (scouts we know about) ===
INSERT INTO public.source_health (scout_id, scout_name, status, refresh_interval_minutes) VALUES
  ('hacker_news', 'Hacker News Trends', 'never_run', 60),
  ('reddit_scout', 'Reddit Community Signals', 'never_run', 120),
  ('google_trend_scout', 'Google Trends', 'never_run', 240),
  ('business_scout', 'Business Registry', 'never_run', 1440),
  ('marketplace_scout', 'Marketplace Signals', 'never_run', 360),
  ('job_scout', 'Job Market Signals', 'never_run', 180);
