-- =============================================
-- Fix Infinite Recursion in Distributors RLS Policies
-- =============================================

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Distributors can view downline basic info" ON distributors;

-- Recreate it with a simpler approach that doesn't cause recursion
-- Instead of recursive CTE, we'll use a function that uses security definer
CREATE OR REPLACE FUNCTION is_in_downline(distributor_id UUID, check_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_id UUID;
  max_depth INT := 7;
  depth INT := 0;
BEGIN
  current_id := check_id;

  WHILE current_id IS NOT NULL AND depth < max_depth LOOP
    IF current_id = distributor_id THEN
      RETURN TRUE;
    END IF;

    SELECT matrix_parent_id INTO current_id
    FROM distributors
    WHERE id = current_id;

    depth := depth + 1;
  END LOOP;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the downline policy using the function
CREATE POLICY "Distributors can view downline basic info"
  ON distributors
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM distributors d
      WHERE d.auth_user_id = auth.uid()
      AND is_in_downline(d.id, distributors.id)
    )
  );

-- Ensure public access policy is still in place
DROP POLICY IF EXISTS "Public can view distributor landing pages" ON distributors;
CREATE POLICY "Public can view distributor landing pages"
  ON distributors
  FOR SELECT
  USING (true);
