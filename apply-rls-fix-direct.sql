-- =============================================
-- APPLY THIS IN SUPABASE SQL EDITOR
-- =============================================

-- Step 1: Drop old problematic policies
DROP POLICY IF EXISTS member_read_l1_downline ON public.members;
DROP POLICY IF EXISTS member_read_all_downline ON public.members;

-- Step 2: Create SECURITY DEFINER function
CREATE OR REPLACE FUNCTION get_user_downline(user_uid uuid)
RETURNS TABLE(member_id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH RECURSIVE downline AS (
    SELECT m.member_id, m.enroller_id
    FROM members m
    INNER JOIN distributors d ON m.distributor_id = d.id
    WHERE d.auth_user_id = user_uid

    UNION ALL

    SELECT m.member_id, m.enroller_id
    FROM members m
    INNER JOIN downline dl ON m.enroller_id = dl.member_id
  )
  SELECT downline.member_id FROM downline;
$$;

GRANT EXECUTE ON FUNCTION get_user_downline(uuid) TO authenticated;

-- Step 3: Create new policy
CREATE POLICY member_read_downline ON public.members
  FOR SELECT
  TO authenticated
  USING (
    distributor_id = auth.uid()
    OR
    member_id IN (
      SELECT member_id FROM get_user_downline(auth.uid())
    )
  );
