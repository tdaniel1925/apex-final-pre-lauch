-- =============================================
-- Temporarily disable RLS on distributors for testing
-- This allows the autopilot API to fetch distributor info
-- =============================================

ALTER TABLE public.distributors DISABLE ROW LEVEL SECURITY;
