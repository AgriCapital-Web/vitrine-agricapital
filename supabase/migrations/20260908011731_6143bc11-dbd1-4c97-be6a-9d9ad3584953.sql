-- 1) Testimonials: public read of approved rows, without email column
DROP POLICY IF EXISTS "Public can read approved testimonials" ON public.testimonials;
CREATE POLICY "Public can read approved testimonials"
  ON public.testimonials FOR SELECT
  TO anon, authenticated
  USING (approved = true AND status = 'approved');

REVOKE SELECT ON public.testimonials FROM anon;
GRANT SELECT (id, first_name, last_name, testimonial, photo_url, is_agricapital_subscriber, status, created_at, updated_at)
  ON public.testimonials TO anon;

-- 2) Public testimonials view runs with the querying user's rights
ALTER VIEW public.testimonials_public SET (security_invoker = on);

-- 3) Hide admin-only objects from anonymous callers (and the GraphQL schema)
REVOKE SELECT ON public.admin_notifications FROM anon;
REVOKE SELECT ON public.ai_chat_logs FROM anon;
REVOKE SELECT ON public.audit_logs FROM anon;
REVOKE SELECT ON public.backup_history FROM anon;
REVOKE SELECT ON public.backup_settings FROM anon;
REVOKE SELECT ON public.broken_image_logs FROM anon;
REVOKE SELECT ON public.media FROM anon;
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.push_subscriptions FROM anon;
REVOKE SELECT ON public.page_visits FROM anon;
