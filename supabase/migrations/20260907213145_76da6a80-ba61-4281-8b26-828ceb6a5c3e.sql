DROP POLICY IF EXISTS "Public can read non-sensitive settings" ON public.site_settings;

CREATE POLICY "Public can read allowlisted settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (category = ANY (ARRAY['general','contact','social','seo','branding','appearance','content','public']));