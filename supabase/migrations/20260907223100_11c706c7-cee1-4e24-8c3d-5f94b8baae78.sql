-- 1. Fix mutable search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. Remove anon exposure of user_roles; keep least-privilege for authenticated (RLS scoped)
REVOKE ALL ON public.user_roles FROM anon;
REVOKE ALL ON public.user_roles FROM PUBLIC;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- 3. Explicit RLS policies on storage.objects for the private buckets
DROP POLICY IF EXISTS "private_buckets_admin_select" ON storage.objects;
CREATE POLICY "private_buckets_admin_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id IN ('site-media','media','dataroom') AND public.is_admin());

DROP POLICY IF EXISTS "private_buckets_admin_insert" ON storage.objects;
CREATE POLICY "private_buckets_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('site-media','media','dataroom') AND public.is_admin());

DROP POLICY IF EXISTS "private_buckets_admin_update" ON storage.objects;
CREATE POLICY "private_buckets_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id IN ('site-media','media','dataroom') AND public.is_admin())
  WITH CHECK (bucket_id IN ('site-media','media','dataroom') AND public.is_admin());

DROP POLICY IF EXISTS "private_buckets_admin_delete" ON storage.objects;
CREATE POLICY "private_buckets_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id IN ('site-media','media','dataroom') AND public.is_admin());
