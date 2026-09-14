GRANT SELECT ON TABLE public.news TO anon;
GRANT SELECT ON TABLE public.news TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.news TO authenticated;
GRANT ALL ON TABLE public.news TO service_role;

DROP POLICY IF EXISTS "Public can read published news" ON public.news;
CREATE POLICY "Public can read published news"
ON public.news
FOR SELECT
TO anon, authenticated
USING (is_published = true OR (auth.role() = 'authenticated' AND public.is_admin()));