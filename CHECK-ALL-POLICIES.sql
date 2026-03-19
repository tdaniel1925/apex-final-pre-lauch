-- =============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- This will show ALL policies on the members table
-- =============================================

SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'members'
ORDER BY policyname;

-- Also check if RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'members';
