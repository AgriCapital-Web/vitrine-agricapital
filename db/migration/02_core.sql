-- =============================================================================
-- 02_core.sql — Core domain schema for AgriCapital
-- Reverse-engineered from application code (src/**, supabase/functions/**).
-- Assumes 01_prelude.sql already created: extensions, public.set_updated_at(),
-- public.app_role enum, public.has_role(), public.is_admin(), public.user_roles.
-- Idempotent: safe to re-run.
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- =============================================================================
-- 1. profiles
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 2. news
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_fr text NOT NULL,
  title_en text,
  title_ar text,
  title_es text,
  title_de text,
  title_zh text,
  content_fr text NOT NULL,
  content_en text,
  content_ar text,
  content_es text,
  content_de text,
  content_zh text,
  excerpt_fr text,
  excerpt_en text,
  excerpt_ar text,
  excerpt_es text,
  excerpt_de text,
  excerpt_zh text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  videos jsonb NOT NULL DEFAULT '[]'::jsonb,
  featured_image text,
  category text NOT NULL DEFAULT 'general',
  is_published boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  author text NOT NULL DEFAULT 'AgriCapital',
  views_count integer NOT NULL DEFAULT 0,
  shares_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.news TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news TO authenticated;
GRANT ALL ON public.news TO service_role;

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published news" ON public.news;
CREATE POLICY "Public can read published news"
ON public.news FOR SELECT
TO anon, authenticated
USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin full access news" ON public.news;
CREATE POLICY "Admin full access news"
ON public.news FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS set_updated_at ON public.news;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 3. site_content (dynamic translations)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'text',
  content_fr text,
  content_en text,
  content_ar text,
  content_es text,
  content_de text,
  content_zh text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active site content" ON public.site_content;
CREATE POLICY "Public can read active site content"
ON public.site_content FOR SELECT
TO anon, authenticated
USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage site content" ON public.site_content;
CREATE POLICY "Admin manage site content"
ON public.site_content FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS set_updated_at ON public.site_content;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 4. site_menu
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.site_menu (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.site_menu(id) ON DELETE CASCADE,
  label_fr text NOT NULL,
  label_en text,
  label_ar text,
  label_es text,
  label_de text,
  label_zh text,
  url text,
  target text DEFAULT '_self',
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_menu TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_menu TO authenticated;
GRANT ALL ON public.site_menu TO service_role;

ALTER TABLE public.site_menu ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active menu" ON public.site_menu;
CREATE POLICY "Public can read active menu"
ON public.site_menu FOR SELECT
TO anon, authenticated
USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage site menu" ON public.site_menu;
CREATE POLICY "Admin manage site menu"
ON public.site_menu FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS set_updated_at ON public.site_menu;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.site_menu
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 5. site_media (gallery)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.site_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  alt_text_fr text,
  alt_text_en text,
  type text NOT NULL DEFAULT 'image',
  category text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_media TO authenticated;
GRANT ALL ON public.site_media TO service_role;

ALTER TABLE public.site_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active media" ON public.site_media;
CREATE POLICY "Public can read active media"
ON public.site_media FOR SELECT
TO anon, authenticated
USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage site media" ON public.site_media;
CREATE POLICY "Admin manage site media"
ON public.site_media FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =============================================================================
-- 6. media (uploaded media metadata registry — complements the 'media' storage bucket)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  url text NOT NULL,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.media TO authenticated;
GRANT ALL ON public.media TO service_role;

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage media" ON public.media;
CREATE POLICY "Admin manage media"
ON public.media FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =============================================================================
-- 7. testimonials (+ testimonials_public view)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  testimonial text NOT NULL,
  photo_url text,
  approved boolean NOT NULL DEFAULT false,
  status text DEFAULT 'other',
  is_agricapital_subscriber boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a testimonial" ON public.testimonials;
CREATE POLICY "Anyone can submit a testimonial"
ON public.testimonials FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage testimonials" ON public.testimonials;
CREATE POLICY "Admin manage testimonials"
ON public.testimonials FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS set_updated_at ON public.testimonials;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP VIEW IF EXISTS public.testimonials_public CASCADE;
CREATE VIEW public.testimonials_public
WITH (security_invoker = off) AS
SELECT id, first_name, last_name, testimonial, photo_url, is_agricapital_subscriber, status, created_at
FROM public.testimonials
WHERE approved = true AND status = 'approved';

GRANT SELECT ON public.testimonials_public TO anon, authenticated;

-- =============================================================================
-- 8. admin_notifications
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_notifications TO authenticated;
GRANT ALL ON public.admin_notifications TO service_role;

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all notifications" ON public.admin_notifications;
CREATE POLICY "Admins can view all notifications"
ON public.admin_notifications FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update notifications" ON public.admin_notifications;
CREATE POLICY "Admins can update notifications"
ON public.admin_notifications FOR UPDATE
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert notifications" ON public.admin_notifications;
CREATE POLICY "Admins can insert notifications"
ON public.admin_notifications FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete notifications" ON public.admin_notifications;
CREATE POLICY "Admins can delete notifications"
ON public.admin_notifications FOR DELETE
TO authenticated
USING (public.is_admin());

-- =============================================================================
-- 9. push_subscriptions
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage their push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Admins can manage their push subscriptions"
ON public.push_subscriptions FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin() AND user_id = auth.uid());

DROP TRIGGER IF EXISTS set_updated_at ON public.push_subscriptions;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 10. page_visits + visitor_counters (+ bump_visitor_counters trigger)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.page_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  visitor_id text NOT NULL,
  user_agent text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.page_visits TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_visits TO authenticated;
GRANT ALL ON public.page_visits TO service_role;

ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can record a page visit" ON public.page_visits;
CREATE POLICY "Anyone can record a page visit"
ON public.page_visits FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can view page visits" ON public.page_visits;
CREATE POLICY "Admin can view page visits"
ON public.page_visits FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_page_visits_created_at ON public.page_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_page_visits_visitor_id ON public.page_visits(visitor_id);

CREATE TABLE IF NOT EXISTS public.visitor_counters (
  id text PRIMARY KEY,
  total_visitors bigint NOT NULL DEFAULT 0,
  weekly_visitors bigint NOT NULL DEFAULT 0,
  week_started_at timestamptz NOT NULL DEFAULT date_trunc('week', now()),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.visitor_counters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitor_counters TO authenticated;
GRANT ALL ON public.visitor_counters TO service_role;

ALTER TABLE public.visitor_counters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read visitor counters" ON public.visitor_counters;
CREATE POLICY "Public can read visitor counters"
ON public.visitor_counters FOR SELECT
TO anon, authenticated
USING (id = 'public');

DROP POLICY IF EXISTS "Admin manage visitor counters" ON public.visitor_counters;
CREATE POLICY "Admin manage visitor counters"
ON public.visitor_counters FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

INSERT INTO public.visitor_counters (id, total_visitors, weekly_visitors, week_started_at)
VALUES ('public', 0, 0, date_trunc('week', now()))
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.bump_visitor_counters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_week timestamptz := date_trunc('week', now());
BEGIN
  INSERT INTO public.visitor_counters (id, total_visitors, weekly_visitors, week_started_at, updated_at)
  VALUES ('public', 1, 1, current_week, now())
  ON CONFLICT (id) DO UPDATE
  SET total_visitors = public.visitor_counters.total_visitors + 1,
      weekly_visitors = CASE
        WHEN public.visitor_counters.week_started_at < current_week THEN 1
        ELSE public.visitor_counters.weekly_visitors + 1
      END,
      week_started_at = CASE
        WHEN public.visitor_counters.week_started_at < current_week THEN current_week
        ELSE public.visitor_counters.week_started_at
      END,
      updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.bump_visitor_counters() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bump_visitor_counters() TO service_role;

DROP TRIGGER IF EXISTS trg_bump_visitor_counters ON public.page_visits;
CREATE TRIGGER trg_bump_visitor_counters
AFTER INSERT ON public.page_visits
FOR EACH ROW EXECUTE FUNCTION public.bump_visitor_counters();

-- =============================================================================
-- 11. audit_logs
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- =============================================================================
-- 12. ai_chat_logs
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.ai_chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_message text NOT NULL,
  assistant_response text NOT NULL,
  language text DEFAULT 'fr',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_chat_logs TO authenticated;
GRANT ALL ON public.ai_chat_logs TO service_role;

ALTER TABLE public.ai_chat_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can view ai chat logs" ON public.ai_chat_logs;
CREATE POLICY "Admin can view ai chat logs"
ON public.ai_chat_logs FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Service role can insert ai chat logs" ON public.ai_chat_logs;
CREATE POLICY "Service role can insert ai chat logs"
ON public.ai_chat_logs FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- =============================================================================
-- 13. broken_image_logs (+ report_broken_image function)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.broken_image_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  page_url text,
  user_agent text,
  status text NOT NULL DEFAULT 'open',
  hits integer NOT NULL DEFAULT 1,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (image_url)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.broken_image_logs TO authenticated;
GRANT ALL ON public.broken_image_logs TO service_role;

ALTER TABLE public.broken_image_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff read broken images" ON public.broken_image_logs;
CREATE POLICY "Staff read broken images"
ON public.broken_image_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS "Staff update broken images" ON public.broken_image_logs;
CREATE POLICY "Staff update broken images"
ON public.broken_image_logs FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS "Staff delete broken images" ON public.broken_image_logs;
CREATE POLICY "Staff delete broken images"
ON public.broken_image_logs FOR DELETE
TO authenticated
USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.report_broken_image(_image_url text, _page_url text, _user_agent text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _image_url IS NULL OR length(_image_url) > 2048 THEN RETURN; END IF;
  INSERT INTO public.broken_image_logs (image_url, page_url, user_agent)
  VALUES (_image_url, left(coalesce(_page_url, ''), 2048), left(coalesce(_user_agent, ''), 512))
  ON CONFLICT (image_url) DO UPDATE
    SET hits = public.broken_image_logs.hits + 1,
        last_seen_at = now(),
        page_url = EXCLUDED.page_url,
        status = CASE WHEN public.broken_image_logs.status = 'fixed' THEN 'open' ELSE public.broken_image_logs.status END;
END;
$$;

GRANT EXECUTE ON FUNCTION public.report_broken_image(text, text, text) TO anon, authenticated;

-- =============================================================================
-- 14. backup_settings / backup_history
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.backup_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_backup_enabled boolean DEFAULT false,
  backup_interval text DEFAULT 'daily',
  backup_destination text DEFAULT 'local',
  google_drive_folder_id text,
  last_backup_at timestamptz,
  next_backup_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.backup_settings TO authenticated;
GRANT ALL ON public.backup_settings TO service_role;

ALTER TABLE public.backup_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage backup settings" ON public.backup_settings;
CREATE POLICY "Admins can manage backup settings"
ON public.backup_settings FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS set_updated_at ON public.backup_settings;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.backup_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.backup_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type text NOT NULL DEFAULT 'manual',
  format text NOT NULL,
  tables_included jsonb,
  file_size text,
  destination text DEFAULT 'local',
  google_drive_file_id text,
  status text DEFAULT 'pending',
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.backup_history TO authenticated;
GRANT ALL ON public.backup_history TO service_role;

ALTER TABLE public.backup_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage backup history" ON public.backup_history;
CREATE POLICY "Admins can manage backup history"
ON public.backup_history FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =============================================================================
-- 15. partnerships
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.partnerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  description text,
  benefits text,
  status text NOT NULL DEFAULT 'active',
  partner_count integer DEFAULT 0,
  logo_url text,
  contact_email text,
  contact_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.partnerships TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partnerships TO authenticated;
GRANT ALL ON public.partnerships TO service_role;

ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active partnerships" ON public.partnerships;
CREATE POLICY "Public can read active partnerships"
ON public.partnerships FOR SELECT
TO anon, authenticated
USING (status = 'active' OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage partnerships" ON public.partnerships;
CREATE POLICY "Admin manage partnerships"
ON public.partnerships FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS set_updated_at ON public.partnerships;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.partnerships
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 16. Functions: increment_news_view / increment_news_share
-- =============================================================================
CREATE OR REPLACE FUNCTION public.increment_news_view(p_news_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.news
  SET views_count = COALESCE(views_count, 0) + 1,
      updated_at = now()
  WHERE id = p_news_id
  RETURNING views_count INTO v_count;

  RETURN COALESCE(v_count, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_news_view(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_news_share(p_news_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.news
  SET shares_count = COALESCE(shares_count, 0) + 1,
      updated_at = now()
  WHERE id = p_news_id
  RETURNING shares_count INTO v_count;

  RETURN COALESCE(v_count, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_news_share(uuid) TO anon, authenticated;
