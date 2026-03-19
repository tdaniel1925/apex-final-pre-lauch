-- =============================================
-- Fix Distributors RLS Policy
-- Replace convoluted subquery with simple auth_user_id check
-- =============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view own distributor record" ON public.distributors;

-- Create simplified policy that directly checks auth_user_id
CREATE POLICY "Users can view own distributor record"
  ON public.distributors
  FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Also allow service role full access
CREATE POLICY "Service role has full access to distributors"
  ON public.distributors
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
