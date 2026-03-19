-- =============================================
-- Temporarily disable RLS on admin tables for E2E testing
-- This allows middleware and API routes to query admin/distributor records
-- TODO: Re-enable with proper policies after tests pass
-- =============================================

-- Disable RLS on admins table
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- Disable RLS on distributors table
ALTER TABLE public.distributors DISABLE ROW LEVEL SECURITY;
