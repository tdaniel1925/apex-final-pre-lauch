-- =============================================
-- APPLY THIS IN SUPABASE SQL EDITOR
-- Fix: Enable downline visibility for all users
-- =============================================
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Copy this entire file
-- 3. Paste and click "Run"
-- 4. Test by logging in as a regular user
-- =============================================

-- =============================================
-- Policy 1: Allow users to see their direct enrollees (L1)
-- =============================================
CREATE POLICY member_read_l1_downline ON public.members
  FOR SELECT
  TO authenticated
  USING (
    enroller_id IN (
      SELECT member_id
      FROM public.members
      WHERE distributor_id = auth.uid()
    )
  );

-- =============================================
-- Policy 2: Allow users to see their entire downline tree (recursive)
-- This uses a recursive CTE to traverse the entire enrollment tree
-- =============================================
CREATE POLICY member_read_all_downline ON public.members
  FOR SELECT
  TO authenticated
  USING (
    member_id IN (
      WITH RECURSIVE downline AS (
        -- Start with user's own member record
        SELECT member_id
        FROM public.members
        WHERE distributor_id = auth.uid()

        UNION ALL

        -- Recursively get all enrolled members
        SELECT m.member_id
        FROM public.members m
        INNER JOIN downline d ON m.enroller_id = d.member_id
      )
      SELECT member_id FROM downline
    )
  );

-- =============================================
-- Add index for better performance on enroller_id queries
-- =============================================
CREATE INDEX IF NOT EXISTS idx_members_enroller_id ON public.members(enroller_id);

-- =============================================
-- Verification: Check that policies were created
-- =============================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'members'
ORDER BY policyname;

-- =============================================
-- Expected Result:
-- You should see:
-- - member_read_own (existing)
-- - member_read_l1_downline (new)
-- - member_read_all_downline (new)
-- - service_all_members (existing)
-- =============================================
