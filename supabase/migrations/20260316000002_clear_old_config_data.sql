-- =============================================
-- MIGRATION: Clear Old Config Data
-- Date: 2026-03-16
-- Phase: 1 (Remove Old System)
-- Agent: 1D
-- =============================================
--
-- PURPOSE: Clear/drop any old compensation configuration tables
--
-- SAFETY:
-- - Backup exists: Supabase automatic backup from 2026-03-16 12:16:09
-- - Git tag: comp-plan-v1-snapshot
--
-- TABLES TO CHECK:
-- 1. comp_engine_config - Waterfall percentages, override schedules
-- 2. comp_engine_rank_config - Rank thresholds
--
-- =============================================

-- Drop config tables if they exist (IF EXISTS prevents errors)
DROP TABLE IF EXISTS public.comp_engine_config CASCADE;
DROP TABLE IF EXISTS public.comp_engine_rank_config CASCADE;

-- Also clear any other potential config tables from old system
DROP TABLE IF EXISTS public.commission_config CASCADE;
DROP TABLE IF EXISTS public.compensation_config CASCADE;
DROP TABLE IF EXISTS public.rank_config CASCADE;

-- =============================================
-- VERIFICATION
-- =============================================

-- After running this migration, verify config tables are gone:
-- SELECT tablename FROM pg_tables WHERE tablename LIKE '%comp%config%';
-- Expected result: 0 rows

-- =============================================
-- NOTES
-- =============================================

-- All old configuration is now removed.
-- New configuration will be:
-- 1. Phase 2: Database schema (product credit_pct, etc.)
-- 2. Phase 3: TypeScript constants (new config.ts)

-- This ensures a clean slate for the dual-ladder system.

-- =============================================
-- END OF MIGRATION
-- =============================================
