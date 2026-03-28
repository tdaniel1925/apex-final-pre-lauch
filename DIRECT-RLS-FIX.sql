-- =============================================
-- COPY AND PASTE THIS ENTIRE BLOCK INTO SUPABASE SQL EDITOR
-- Click "RUN" and verify you see success messages
-- =============================================

-- Step 1: Enable RLS on members table
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing anon policies
DROP POLICY IF EXISTS member_block_anon ON public.members;

-- Step 3: Create blocking policy for anonymous users
CREATE POLICY member_block_anon ON public.members
  FOR ALL
  TO anon
  USING (false);

-- Step 4: Verify the policy was created
SELECT
  tablename,
  policyname,
  roles,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'members'
  AND policyname = 'member_block_anon';

-- You should see:
-- tablename | policyname        | roles  | qual
-- members   | member_block_anon | {anon} | false
