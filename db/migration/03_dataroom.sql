-- =============================================================================
-- 03_dataroom.sql
-- AgriCapital Data Room domain: private document vault, NDA signatories,
-- hashed/expiring sessions, access logs, comments, intents, versioning,
-- review workflow and secure one-time download links.
--
-- Assumes pre-existing: public.set_updated_at(), enum public.app_role,
-- public.has_role(uuid, public.app_role), public.is_admin(), public.user_roles.
--
-- Security model: PRIVATE data room. No universal/master codes. All signatory
-- facing access happens through service_role edge functions using hashed,
-- 8-hour expiring session tokens. No anon grants anywhere in this file.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. dataroom_signatories — NDA signatories (KYC + personal access code)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dataroom_signatories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  whatsapp text,
  profession text,
  organization text,
  country text,
  profile_type text NOT NULL DEFAULT 'autre' CHECK (profile_type IN ('investisseur','partenaire','presse','autre')),
  access_level text NOT NULL DEFAULT 'nda' CHECK (access_level IN ('public','nda','vip')),
  newsletter_optin boolean NOT NULL DEFAULT false,
  id_document_url text,
  id_verified boolean NOT NULL DEFAULT false,
  access_code_hash text NOT NULL,
  nda_pdf_url text,
  nda_signed_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dataroom_signatories TO authenticated;
GRANT ALL ON public.dataroom_signatories TO service_role;

ALTER TABLE public.dataroom_signatories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dataroom_signatories_admin_all" ON public.dataroom_signatories;
CREATE POLICY "dataroom_signatories_admin_all" ON public.dataroom_signatories
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS set_updated_at_dataroom_signatories ON public.dataroom_signatories;
CREATE TRIGGER set_updated_at_dataroom_signatories
  BEFORE UPDATE ON public.dataroom_signatories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_dataroom_signatories_email ON public.dataroom_signatories(lower(email));
CREATE INDEX IF NOT EXISTS idx_dataroom_signatories_created_at ON public.dataroom_signatories(created_at);

-- -----------------------------------------------------------------------------
-- 2. dataroom_publications — documents / photos / videos / platforms shown in vault
--    (this is the domain's central "dataroom" content table)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dataroom_publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type = ANY (ARRAY['document','photo','image','video','presentation','platform'])),
  title text NOT NULL,
  description text,
  category text,
  file_url text,
  video_url text,
  platform_url text,
  platform_login text,
  platform_password text,
  platform_type text CHECK (platform_type IS NULL OR platform_type IN ('website','dashboard','payment','document_portal','communication','other')),
  cover_url text,
  preview_title text,
  preview_description text,
  preview_image_url text,
  screenshot_url text,
  dynamic_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  watermark_enabled boolean NOT NULL DEFAULT true,
  visibility text NOT NULL DEFAULT 'all' CHECK (visibility = ANY (ARRAY['public','nda','vip','all','investisseur','partenaire','presse'])),
  workflow_status text NOT NULL DEFAULT 'draft' CHECK (workflow_status IN ('draft','in_review','published','archived')),
  is_published boolean NOT NULL DEFAULT false,
  reviewed_by uuid,
  reviewed_at timestamptz,
  published_at timestamptz,
  current_version integer NOT NULL DEFAULT 1,
  source_file_name text,
  source_file_size bigint,
  source_mime_type text,
  views_count integer NOT NULL DEFAULT 0,
  downloads_count integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dataroom_publications TO authenticated;
GRANT ALL ON public.dataroom_publications TO service_role;

ALTER TABLE public.dataroom_publications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dataroom_publications_admin_all" ON public.dataroom_publications;
CREATE POLICY "dataroom_publications_admin_all" ON public.dataroom_publications
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS set_updated_at_dataroom_publications ON public.dataroom_publications;
CREATE TRIGGER set_updated_at_dataroom_publications
  BEFORE UPDATE ON public.dataroom_publications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Keeps is_published / published_at consistent with workflow_status
CREATE OR REPLACE FUNCTION public.dataroom_validate_workflow()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.workflow_status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = now();
  END IF;
  NEW.is_published = (NEW.workflow_status = 'published');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dataroom_validate_workflow ON public.dataroom_publications;
CREATE TRIGGER trg_dataroom_validate_workflow
  BEFORE INSERT OR UPDATE ON public.dataroom_publications
  FOR EACH ROW EXECUTE FUNCTION public.dataroom_validate_workflow();

CREATE INDEX IF NOT EXISTS idx_dataroom_publications_visibility ON public.dataroom_publications(visibility);
CREATE INDEX IF NOT EXISTS idx_dataroom_publications_workflow_status ON public.dataroom_publications(workflow_status);
CREATE INDEX IF NOT EXISTS idx_dataroom_publications_created_at ON public.dataroom_publications(created_at);

-- Alias view kept for readability where code may refer to the domain simply as "dataroom".
-- (no separate base table named "dataroom" is used anywhere in the codebase)

-- -----------------------------------------------------------------------------
-- 3. dataroom_sessions — hashed, 8h-expiring signatory sessions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dataroom_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signatory_id uuid NOT NULL REFERENCES public.dataroom_signatories(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '8 hours'),
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, DELETE ON public.dataroom_sessions TO authenticated;
GRANT ALL ON public.dataroom_sessions TO service_role;

ALTER TABLE public.dataroom_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dataroom_sessions_admin_select" ON public.dataroom_sessions;
CREATE POLICY "dataroom_sessions_admin_select" ON public.dataroom_sessions
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "dataroom_sessions_immutable" ON public.dataroom_sessions;
CREATE POLICY "dataroom_sessions_immutable" ON public.dataroom_sessions
  FOR UPDATE TO authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "dataroom_sessions_admin_revoke" ON public.dataroom_sessions;
CREATE POLICY "dataroom_sessions_admin_revoke" ON public.dataroom_sessions
  FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_dataroom_sessions_token_hash ON public.dataroom_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_dataroom_sessions_expires_at ON public.dataroom_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_dataroom_sessions_signatory_id ON public.dataroom_sessions(signatory_id);

-- Housekeeping: purge expired sessions (service_role only)
CREATE OR REPLACE FUNCTION public.purge_expired_dataroom_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE removed integer;
BEGIN
  DELETE FROM public.dataroom_sessions WHERE expires_at < now();
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END;
$$;
REVOKE ALL ON FUNCTION public.purge_expired_dataroom_sessions() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_expired_dataroom_sessions() TO service_role;

-- -----------------------------------------------------------------------------
-- 4. dataroom_access_logs — view/login/download activity trail
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dataroom_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signatory_id uuid REFERENCES public.dataroom_signatories(id) ON DELETE CASCADE,
  publication_id uuid REFERENCES public.dataroom_publications(id) ON DELETE CASCADE,
  action text NOT NULL,
  progress_pct integer,
  ip_address text,
  user_agent text,
  device_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.dataroom_access_logs TO authenticated;
GRANT ALL ON public.dataroom_access_logs TO service_role;

ALTER TABLE public.dataroom_access_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dataroom_access_logs_admin_select" ON public.dataroom_access_logs;
CREATE POLICY "dataroom_access_logs_admin_select" ON public.dataroom_access_logs
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_dataroom_access_logs_signatory_id ON public.dataroom_access_logs(signatory_id);
CREATE INDEX IF NOT EXISTS idx_dataroom_access_logs_publication_id ON public.dataroom_access_logs(publication_id);
CREATE INDEX IF NOT EXISTS idx_dataroom_access_logs_created_at ON public.dataroom_access_logs(created_at);

-- -----------------------------------------------------------------------------
-- 5. dataroom_comments — signatory feedback on publications (admin moderated)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dataroom_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signatory_id uuid NOT NULL REFERENCES public.dataroom_signatories(id) ON DELETE CASCADE,
  publication_id uuid NOT NULL REFERENCES public.dataroom_publications(id) ON DELETE CASCADE,
  body text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  admin_reply text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dataroom_comments TO authenticated;
GRANT ALL ON public.dataroom_comments TO service_role;

ALTER TABLE public.dataroom_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dataroom_comments_admin_all" ON public.dataroom_comments;
CREATE POLICY "dataroom_comments_admin_all" ON public.dataroom_comments
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_dataroom_comments_publication_id ON public.dataroom_comments(publication_id);
CREATE INDEX IF NOT EXISTS idx_dataroom_comments_created_at ON public.dataroom_comments(created_at);

-- -----------------------------------------------------------------------------
-- 6. dataroom_intents — signatory expressions of interest (investment, partnership...)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dataroom_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signatory_id uuid NOT NULL REFERENCES public.dataroom_signatories(id) ON DELETE CASCADE,
  publication_id uuid REFERENCES public.dataroom_publications(id) ON DELETE SET NULL,
  intent_type text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'nouveau',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dataroom_intents TO authenticated;
GRANT ALL ON public.dataroom_intents TO service_role;

ALTER TABLE public.dataroom_intents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dataroom_intents_admin_all" ON public.dataroom_intents;
CREATE POLICY "dataroom_intents_admin_all" ON public.dataroom_intents
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_dataroom_intents_signatory_id ON public.dataroom_intents(signatory_id);
CREATE INDEX IF NOT EXISTS idx_dataroom_intents_publication_id ON public.dataroom_intents(publication_id);
CREATE INDEX IF NOT EXISTS idx_dataroom_intents_created_at ON public.dataroom_intents(created_at);

-- -----------------------------------------------------------------------------
-- 7. dataroom_versions — document version history / snapshots
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dataroom_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id uuid NOT NULL REFERENCES public.dataroom_publications(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  title text,
  description text,
  file_url text,
  source_file_name text,
  source_file_size bigint,
  source_mime_type text,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  change_note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (publication_id, version_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dataroom_versions TO authenticated;
GRANT ALL ON public.dataroom_versions TO service_role;

ALTER TABLE public.dataroom_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dataroom_versions_admin_all" ON public.dataroom_versions;
CREATE POLICY "dataroom_versions_admin_all" ON public.dataroom_versions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_dataroom_versions_publication_id ON public.dataroom_versions(publication_id);
CREATE INDEX IF NOT EXISTS idx_dataroom_versions_created_at ON public.dataroom_versions(created_at);

-- -----------------------------------------------------------------------------
-- 8. dataroom_review_comments — internal admin/moderator review notes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dataroom_review_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id uuid NOT NULL REFERENCES public.dataroom_publications(id) ON DELETE CASCADE,
  author_id uuid,
  author_name text,
  body text NOT NULL,
  status_at_comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dataroom_review_comments TO authenticated;
GRANT ALL ON public.dataroom_review_comments TO service_role;

ALTER TABLE public.dataroom_review_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dataroom_review_comments_admin_all" ON public.dataroom_review_comments;
CREATE POLICY "dataroom_review_comments_admin_all" ON public.dataroom_review_comments
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_dataroom_review_comments_publication_id ON public.dataroom_review_comments(publication_id);
CREATE INDEX IF NOT EXISTS idx_dataroom_review_comments_created_at ON public.dataroom_review_comments(created_at);

-- -----------------------------------------------------------------------------
-- 9. dataroom_download_links — secure, hashed, expiring, single/limited-use links
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dataroom_download_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id uuid NOT NULL REFERENCES public.dataroom_publications(id) ON DELETE CASCADE,
  signatory_id uuid REFERENCES public.dataroom_signatories(id) ON DELETE SET NULL,
  email text,
  visibility_scope text NOT NULL DEFAULT 'nda',
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  max_uses integer NOT NULL DEFAULT 1,
  used_count integer NOT NULL DEFAULT 0,
  revoked boolean NOT NULL DEFAULT false,
  last_used_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dataroom_download_links TO authenticated;
GRANT ALL ON public.dataroom_download_links TO service_role;

ALTER TABLE public.dataroom_download_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dataroom_download_links_admin_all" ON public.dataroom_download_links;
CREATE POLICY "dataroom_download_links_admin_all" ON public.dataroom_download_links
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS set_updated_at_dataroom_download_links ON public.dataroom_download_links;
CREATE TRIGGER set_updated_at_dataroom_download_links
  BEFORE UPDATE ON public.dataroom_download_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_dataroom_download_links_token_hash ON public.dataroom_download_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_dataroom_download_links_expires_at ON public.dataroom_download_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_dataroom_download_links_publication_id ON public.dataroom_download_links(publication_id);
CREATE INDEX IF NOT EXISTS idx_dataroom_download_links_created_at ON public.dataroom_download_links(created_at);

-- -----------------------------------------------------------------------------
-- 10. Popularity counters (called by dataroom-list / dataroom-download-link)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_dataroom_view(_publication_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.dataroom_publications SET views_count = views_count + 1 WHERE id = _publication_id;
$$;
REVOKE ALL ON FUNCTION public.increment_dataroom_view(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_dataroom_view(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.increment_dataroom_download(_publication_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.dataroom_publications SET downloads_count = downloads_count + 1 WHERE id = _publication_id;
$$;
REVOKE ALL ON FUNCTION public.increment_dataroom_download(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_dataroom_download(uuid) TO service_role;
