-- =============================================
-- FIX: RLS Infinite Recursion in Members Table
-- CRITICAL: Apply this immediately to fix genealogy/team queries
-- =============================================
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Copy this entire file
-- 3. Paste and click "Run"
-- 4. Verify tests pass: npm test -- tests/unit/api-genealogy.test.ts --run
-- =============================================

-- =============================================
-- Step 1: Drop existing problematic policies
-- =============================================
DROP POLICY IF EXISTS member_read_l1_downline ON public.members;
DROP POLICY IF EXISTS member_read_all_downline ON public.members;

-- =============================================
-- Step 2: Create SECURITY DEFINER function to bypass RLS
-- This function runs with elevated privileges, bypassing RLS
-- inside the policy to prevent infinite recursion
-- =============================================
CREATE OR REPLACE FUNCTION get_user_downline(user_uid uuid)
RETURNS TABLE(member_id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH RECURSIVE downline AS (
    -- Base case: Get user's own member record
    SELECT m.member_id, m.enroller_id
    FROM members m
    INNER JOIN distributors d ON m.distributor_id = d.id
    WHERE d.auth_user_id = user_uid

    UNION ALL

    -- Recursive case: Get all enrolled members
    SELECT m.member_id, m.enroller_id
    FROM members m
    INNER JOIN downline dl ON m.enroller_id = dl.member_id
  )
  SELECT downline.member_id FROM downline;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_downline(uuid) TO authenticated;

-- =============================================
-- Step 3: Create simple policy that calls the function
-- This policy does NOT query members table directly,
-- avoiding infinite recursion
-- =============================================
CREATE POLICY member_read_downline ON public.members
  FOR SELECT
  TO authenticated
  USING (
    -- User can see their own member record
    distributor_id = auth.uid()
    OR
    -- User can see anyone in their downline
    member_id IN (
      SELECT member_id FROM get_user_downline(auth.uid())
    )
  );

-- =============================================
-- Step 4: Verify policies are correct
-- =============================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'members'
ORDER BY policyname;

-- =============================================
-- Expected Result:
-- You should see:
-- - member_read_own (allows viewing own record)
-- - member_read_downline (allows viewing downline - NEW)
-- - service_all_members (service role can see all)
--
-- The old problematic policies should be GONE:
-- - member_read_l1_downline (REMOVED)
-- - member_read_all_downline (REMOVED)
-- =============================================

-- =============================================
-- Step 5: Test the fix
-- =============================================
-- Test 1: User should be able to see their own member record
SELECT member_id, full_name
FROM members
WHERE distributor_id = auth.uid()
LIMIT 1;

-- Test 2: User should be able to see their direct enrollees
SELECT m.member_id, m.full_name, m.tech_rank
FROM members m
WHERE m.enroller_id IN (
  SELECT member_id FROM members WHERE distributor_id = auth.uid()
)
LIMIT 5;

-- Test 3: Verify function works
SELECT COUNT(*) as downline_count
FROM get_user_downline(auth.uid());

-- =============================================
-- DONE!
-- Now run tests to verify:
-- npm test -- tests/unit/api-genealogy.test.ts --run
-- npm test -- tests/unit/api-team.test.ts --run
-- =============================================
