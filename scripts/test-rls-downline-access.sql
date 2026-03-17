-- =============================================
-- TEST RLS DOWNLINE ACCESS POLICIES
-- Run this AFTER applying the RLS fix
-- =============================================

-- =============================================
-- Step 1: Verify policies exist
-- =============================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles::text[] AS roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'members'
ORDER BY policyname;

-- Expected policies:
-- - member_read_own (existing)
-- - member_read_l1_downline (NEW)
-- - member_read_all_downline (NEW)
-- - service_all_members (existing)

-- =============================================
-- Step 2: Check index was created
-- =============================================
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'members'
  AND indexname = 'idx_members_enroller_id';

-- Expected: 1 row showing the index on enroller_id

-- =============================================
-- Step 3: Test downline visibility
-- NOTE: This must be run as an authenticated user (not service role)
-- =============================================

-- Get your member_id first
SELECT member_id, first_name, last_name, email
FROM members
WHERE distributor_id = auth.uid();

-- REPLACE 'your-member-id' with the member_id from above
-- Then test L1 downline access:
SELECT
  member_id,
  first_name,
  last_name,
  email,
  tech_rank,
  personal_credits_monthly,
  team_credits_monthly,
  created_at
FROM members
WHERE enroller_id = 'your-member-id';

-- If policies work: You should see your direct enrollees
-- If policies don't work: Empty result []

-- =============================================
-- Step 4: Test recursive downline visibility
-- =============================================

-- This should return ALL members in your downline tree
WITH RECURSIVE downline AS (
  -- Start with your own member record
  SELECT member_id, first_name, last_name, enroller_id, 1 as level
  FROM members
  WHERE distributor_id = auth.uid()

  UNION ALL

  -- Recursively get enrolled members
  SELECT m.member_id, m.first_name, m.last_name, m.enroller_id, d.level + 1
  FROM members m
  INNER JOIN downline d ON m.enroller_id = d.member_id
)
SELECT * FROM downline ORDER BY level, first_name;

-- If policies work: You should see your entire downline tree with levels
-- If policies don't work: Only your own record (level 1)

-- =============================================
-- Step 5: Verify security (cannot see other users' downlines)
-- =============================================

-- Try to access someone else's downline (should return empty)
-- REPLACE 'someone-elses-member-id' with a member_id that's NOT in your downline
SELECT *
FROM members
WHERE enroller_id = 'someone-elses-member-id';

-- Expected: Empty [] (security working - you can't see other people's downlines)

-- =============================================
-- Step 6: Count your downline by level
-- =============================================

WITH RECURSIVE downline AS (
  SELECT member_id, enroller_id, 1 as level
  FROM members
  WHERE distributor_id = auth.uid()

  UNION ALL

  SELECT m.member_id, m.enroller_id, d.level + 1
  FROM members m
  INNER JOIN downline d ON m.enroller_id = d.member_id
)
SELECT
  level,
  COUNT(*) as member_count
FROM downline
GROUP BY level
ORDER BY level;

-- Shows how many members at each level of your downline

-- =============================================
-- TROUBLESHOOTING
-- =============================================

-- If tests fail, check:

-- 1. Are you logged in as a regular user (not admin)?
--    Admin might be bypassing RLS

-- 2. Does your user have a member record?
SELECT * FROM members WHERE distributor_id = auth.uid();
--    Should return 1 row

-- 3. Do you have any enrollees?
--    Check the members table for records with your member_id as enroller_id

-- 4. Are the policies actually applied?
--    Re-run Step 1 above

-- =============================================
-- END OF TESTS
-- =============================================
