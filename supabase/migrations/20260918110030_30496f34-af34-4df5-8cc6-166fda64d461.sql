DROP POLICY IF EXISTS "Public can read published news" ON public.news;
CREATE POLICY "Public can read published news"
ON public.news FOR SELECT TO anon
USING (is_published = true);
DROP POLICY IF EXISTS "Authenticated can read news" ON public.news;
CREATE POLICY "Authenticated can read news"
ON public.news FOR SELECT TO authenticated
USING (is_published = true OR public.is_admin());
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;