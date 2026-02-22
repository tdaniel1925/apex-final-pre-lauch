-- =============================================
-- Fix RLS Policies for Distributors
-- Allow users to read/update their own records
-- =============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read their own distributor" ON distributors;
DROP POLICY IF EXISTS "Users can update their own distributor" ON distributors;
DROP POLICY IF EXISTS "Service role full access" ON distributors;

-- Policy 1: Users can read their own distributor record
CREATE POLICY "Users can read their own distributor"
ON distributors
FOR SELECT
TO authenticated
USING (auth.uid() = auth_user_id);

-- Policy 2: Users can update their own distributor record
CREATE POLICY "Users can update their own distributor"
ON distributors
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- Policy 3: Service role has full access (for admin operations)
CREATE POLICY "Service role full access"
ON distributors
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE distributors ENABLE ROW LEVEL SECURITY;
