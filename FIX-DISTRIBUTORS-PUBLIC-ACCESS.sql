-- =============================================
-- FIX DISTRIBUTORS TABLE - REMOVE PUBLIC ACCESS
-- =============================================
-- Problem: Two policies grant public (including anon) read access
-- Solution: Drop these policies and replace with authenticated-only

-- Drop the permissive public policies
DROP POLICY IF EXISTS "Public can view basic distributor info for replicated sites" ON public.distributors;
DROP POLICY IF EXISTS "public_read_distributors" ON public.distributors;

-- Optional: Create authenticated-only policy for reading distributors
-- Uncomment if you want authenticated users to read all distributors
-- CREATE POLICY "authenticated_read_distributors" ON public.distributors
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- Verify the public policies are gone
SELECT
  tablename,
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'distributors'
  AND ('public' = ANY(roles) OR 'anon' = ANY(roles))
ORDER BY policyname;

-- Expected: Only distributor_block_anon should remain for anon role
-- No policies should grant access to public role
