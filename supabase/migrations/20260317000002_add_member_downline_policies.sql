-- =============================================
-- FIX: Allow users to see their downline members
-- Date: March 17, 2026
-- Issue: Users can only see their own member record
-- Solution: Add RLS policies for downline access
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
-- Verification Query (run after applying migration)
-- =============================================
-- Test as a regular user:
-- SELECT * FROM members WHERE enroller_id = 'your-member-id';
-- Should return your direct enrollees
