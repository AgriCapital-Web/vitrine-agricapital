-- ===== Abonnés newsletter =====
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  first_name text, last_name text,
  language text NOT NULL DEFAULT 'fr',
  source text NOT NULL DEFAULT 'website',
  is_active boolean NOT NULL DEFAULT true,
  unsubscribe_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24),'hex'),
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin manage subscribers" ON public.newsletter_subscribers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.newsletter_subscribers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== Campagnes =====
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Campagne',
  subject text NOT NULL,
  preheader text,
  html_content text NOT NULL DEFAULT '',
  plain_text text,
  source_prompt text,
  provider text NOT NULL DEFAULT 'brevo',
  brevo_campaign_id text,
  audience_type text NOT NULL DEFAULT 'all',
  include_image boolean NOT NULL DEFAULT true,
  include_video boolean NOT NULL DEFAULT false,
  image_url text, video_url text,
  media_preview jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_review','ready','scheduled','sending','sent','partial','failed','cancelled')),
  validated_by uuid, validated_at timestamptz,
  scheduled_at timestamptz, last_sent_at timestamptz,
  batches_total integer NOT NULL DEFAULT 0,
  open_count integer NOT NULL DEFAULT 0,
  click_count integer NOT NULL DEFAULT 0,
  error_summary text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_campaigns TO authenticated;
GRANT ALL ON public.email_campaigns TO service_role;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage campaigns" ON public.email_campaigns FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.email_campaigns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== Historique des envois =====
CREATE TABLE IF NOT EXISTS public.newsletter_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE SET NULL,
  subject text NOT NULL,
  preheader text,
  html_preview text, html_content text,
  total_recipients integer NOT NULL DEFAULT 0,
  total_sent integer NOT NULL DEFAULT 0,
  total_failed integer NOT NULL DEFAULT 0,
  failed_recipients jsonb NOT NULL DEFAULT '[]'::jsonb,
  audience_type text NOT NULL DEFAULT 'all',
  status text NOT NULL DEFAULT 'pending',
  started_at timestamptz, completed_at timestamptz,
  batches_total integer NOT NULL DEFAULT 0,
  batches_completed integer NOT NULL DEFAULT 0,
  open_count integer NOT NULL DEFAULT 0,
  click_count integer NOT NULL DEFAULT 0,
  media_preview jsonb NOT NULL DEFAULT '[]'::jsonb,
  error_summary text,
  scheduled_at timestamptz,
  sent_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_sends TO authenticated;
GRANT ALL ON public.newsletter_sends TO service_role;
ALTER TABLE public.newsletter_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage sends" ON public.newsletter_sends FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_newsletter_sends_created_at ON public.newsletter_sends(created_at);

-- ===== Suivi ouvertures / clics =====
CREATE TABLE IF NOT EXISTS public.email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  send_id uuid REFERENCES public.newsletter_sends(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE SET NULL,
  recipient_email text,
  event_type text NOT NULL CHECK (event_type IN ('delivered','opened','clicked','bounced','unsubscribed','spam')),
  link_url text,
  user_agent text, ip_address text,
  provider_event_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.email_events TO authenticated;
GRANT ALL ON public.email_events TO service_role;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read email events" ON public.email_events FOR SELECT TO authenticated USING (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_email_events_send ON public.email_events(send_id, event_type);

CREATE OR REPLACE FUNCTION public.bump_email_event_counters() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.event_type = 'opened' THEN
    UPDATE public.newsletter_sends SET open_count = open_count + 1 WHERE id = NEW.send_id;
    UPDATE public.email_campaigns SET open_count = open_count + 1 WHERE id = NEW.campaign_id;
  ELSIF NEW.event_type = 'clicked' THEN
    UPDATE public.newsletter_sends SET click_count = click_count + 1 WHERE id = NEW.send_id;
    UPDATE public.email_campaigns SET click_count = click_count + 1 WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_bump_email_event_counters AFTER INSERT ON public.email_events FOR EACH ROW EXECUTE FUNCTION public.bump_email_event_counters();

-- ===== Journal des emails transactionnels =====
CREATE TABLE IF NOT EXISTS public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  subject text NOT NULL,
  body text,
  email_type text NOT NULL DEFAULT 'transactional',
  provider text NOT NULL DEFAULT 'brevo',
  status text NOT NULL DEFAULT 'sent',
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.email_logs TO authenticated;
GRANT ALL ON public.email_logs TO service_role;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read email logs" ON public.email_logs FOR SELECT TO authenticated USING (public.is_admin());

-- ===== Signatures / modèles / paramètres =====
CREATE TABLE IF NOT EXISTS public.email_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, html_content text NOT NULL, is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_signatures TO authenticated;
GRANT ALL ON public.email_signatures TO service_role;
ALTER TABLE public.email_signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage signatures" ON public.email_signatures FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.email_signatures FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE, name text NOT NULL, subject text NOT NULL, html_content text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_templates TO authenticated;
GRANT ALL ON public.email_templates TO service_role;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage templates" ON public.email_templates FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE, value jsonb NOT NULL DEFAULT '{}'::jsonb,
  category text NOT NULL DEFAULT 'general', description text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read public settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (category IN ('general','contact','social','seo','branding','appearance','content','public') OR public.is_admin());
CREATE POLICY "Admin manage settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== Messages de contact =====
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, email text NOT NULL, phone text, subject text, message text NOT NULL,
  language text DEFAULT 'fr', source text DEFAULT 'website',
  status text NOT NULL DEFAULT 'new',
  read_at timestamptz, replied_at timestamptz, admin_reply text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send a contact message" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin manage contact messages" ON public.contact_messages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== Demandes de partenariat =====
CREATE TABLE IF NOT EXISTS public.partnership_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type text NOT NULL, partner_type text NOT NULL, category text,
  first_name text, last_name text, company_name text, company_logo_url text, photo_url text,
  email text NOT NULL, phone text, whatsapp text, country text, city text,
  land_area_hectares numeric, investment_amount numeric, preferred_offer text, message text,
  language text DEFAULT 'fr',
  status text NOT NULL DEFAULT 'pending', notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.partnership_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partnership_requests TO authenticated;
GRANT ALL ON public.partnership_requests TO service_role;
ALTER TABLE public.partnership_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a partnership request" ON public.partnership_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin manage partnership requests" ON public.partnership_requests FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.partnership_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== Liste d'attente =====
CREATE TABLE IF NOT EXISTS public.waitlist_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL, email text NOT NULL, phone text, whatsapp text, residence text,
  land_status text, desired_area_hectares numeric, land_area_hectares numeric,
  source_page text, message text,
  status text NOT NULL DEFAULT 'new', notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waitlist_submissions TO authenticated;
GRANT ALL ON public.waitlist_submissions TO service_role;
ALTER TABLE public.waitlist_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage waitlist" ON public.waitlist_submissions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.waitlist_submissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== Contacts visiteurs (chatbot) =====
CREATE TABLE IF NOT EXISTS public.visitor_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL, first_name text, last_name text, email text, phone text,
  language text DEFAULT 'fr', collected_via text DEFAULT 'chatbot',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.visitor_contacts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitor_contacts TO authenticated;
GRANT ALL ON public.visitor_contacts TO service_role;
ALTER TABLE public.visitor_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can leave contact via chatbot" ON public.visitor_contacts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin manage visitor contacts" ON public.visitor_contacts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ===== Propositions d'actualités (formulaire public) =====
CREATE TABLE IF NOT EXISTS public.news_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL, author_email text NOT NULL, author_phone text, organization text,
  title text NOT NULL, content text NOT NULL, category text DEFAULT 'general',
  images jsonb NOT NULL DEFAULT '[]'::jsonb, source_url text,
  language text DEFAULT 'fr',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','published')),
  review_notes text, reviewed_by uuid, reviewed_at timestamptz, published_news_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.news_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_submissions TO authenticated;
GRANT ALL ON public.news_submissions TO service_role;
ALTER TABLE public.news_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit news" ON public.news_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin manage news submissions" ON public.news_submissions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.news_submissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();