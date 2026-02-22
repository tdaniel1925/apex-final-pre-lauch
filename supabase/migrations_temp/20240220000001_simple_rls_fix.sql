-- =============================================
-- Simplified Fix: Remove Problematic Downline Policy
-- =============================================

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Distributors can view own profile" ON distributors;
DROP POLICY IF EXISTS "Distributors can update own profile" ON distributors;
DROP POLICY IF EXISTS "Distributors can view downline basic info" ON distributors;
DROP POLICY IF EXISTS "Public can view distributor landing pages" ON distributors;

-- Drop the function too
DROP FUNCTION IF EXISTS is_in_downline(UUID, UUID);

-- =============================================
-- Create Simple, Non-Recursive Policies
-- =============================================

-- Policy 1: Public can read ALL distributor info (needed for replicated sites)
CREATE POLICY "public_read_distributors"
  ON distributors
  FOR SELECT
  USING (true);

-- Policy 2: Distributors can update ONLY their own profile
CREATE POLICY "distributors_update_own"
  ON distributors
  FOR UPDATE
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Policy 3: Only authenticated users can insert (via signup flow)
CREATE POLICY "authenticated_insert"
  ON distributors
  FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- Note: We removed the downline viewing policy to eliminate recursion
-- Downline viewing will be handled via the dashboard with service role key
