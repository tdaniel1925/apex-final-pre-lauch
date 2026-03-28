-- =============================================
-- REMOVE PUBLIC ACCESS TO DISTRIBUTORS TABLE
-- =============================================
-- Problem: Policies with 'public' role grant access to everyone (including anonymous)
-- Solution: Remove permissive public READ policies

-- Drop the permissive public policies that allow anonymous read access
DROP POLICY IF EXISTS "Public can view basic distributor info for replicated sites" ON public.distributors;
DROP POLICY IF EXISTS "public_read_distributors" ON public.distributors;

-- The distributor_block_anon policy now effectively blocks anonymous users
-- Authenticated users can still read/update their own records via existing policies:
-- - "Users can view own distributor record"
-- - "Users can read their own distributor"
-- - "Users can update their own distributor"
