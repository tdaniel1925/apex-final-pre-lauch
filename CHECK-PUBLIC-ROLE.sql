-- Check if there are policies for the PUBLIC role
-- PUBLIC role applies to everyone, including anon
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'members'
  AND 'public' = ANY(roles);

-- Also check table grants
SELECT
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'members'
  AND grantee IN ('anon', 'public', 'authenticated');
