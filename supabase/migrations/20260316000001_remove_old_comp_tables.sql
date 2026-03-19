-- =============================================
-- MIGRATION: Remove Old Compensation System Tables
-- Date: 2026-03-16
-- Phase: 1 (Remove Old System)
-- Agent: 1B
-- =============================================
--
-- PURPOSE: Drop all tables from the old single-ladder compensation system
--
-- SAFETY:
-- - Backup exists: Supabase automatic backup from 2026-03-16 12:16:09
-- - Git tag: comp-plan-v1-snapshot
-- - Can rollback with: Restore database from Supabase dashboard
--
-- TABLES TO DROP (7 total):
-- 1. rank_history - Monthly rank snapshots
-- 2. commissions_waterfall - Waterfall breakdown per subscription
-- 3. commissions_overrides - Override distributions
-- 4. commissions_cabs - Customer Acquisition Bonus tracking
-- 5. commissions_bonuses - Bonus program payouts
-- 6. commissions_runs - Commission run metadata
-- 7. commissions_payouts - Final payout records
--
-- =============================================

-- Drop tables in reverse dependency order (children first, parents last)

-- 1. Drop commission_payouts (depends on commissions_runs)
DROP TABLE IF EXISTS public.commissions_payouts CASCADE;

-- 2. Drop commissions_bonuses (depends on commissions_runs)
DROP TABLE IF EXISTS public.commissions_bonuses CASCADE;

-- 3. Drop commissions_overrides (depends on commissions_waterfall)
DROP TABLE IF EXISTS public.commissions_overrides CASCADE;

-- 4. Drop commissions_cabs (depends on commissions_runs)
DROP TABLE IF EXISTS public.commissions_cabs CASCADE;

-- 5. Drop commissions_waterfall (depends on commissions_runs)
DROP TABLE IF EXISTS public.commissions_waterfall CASCADE;

-- 6. Drop commissions_runs (parent table)
DROP TABLE IF EXISTS public.commissions_runs CASCADE;

-- 7. Drop rank_history (standalone table)
DROP TABLE IF EXISTS public.rank_history CASCADE;

-- =============================================
-- VERIFICATION
-- =============================================

-- After running this migration, verify tables are gone:
-- SELECT tablename FROM pg_tables WHERE tablename LIKE 'commissions_%';
-- Expected result: 0 rows

-- SELECT tablename FROM pg_tables WHERE tablename = 'rank_history';
-- Expected result: 0 rows

-- =============================================
-- ROLLBACK
-- =============================================

-- If you need to rollback:
-- 1. Go to Supabase Dashboard
-- 2. Database → Backups
-- 3. Click "Restore" on 2026-03-16 12:16:09 backup
-- 4. Confirm restore
-- 5. Wait for restore to complete

-- Or from git:
-- git reset --hard comp-plan-v1-snapshot
-- npm run build

-- =============================================
-- NOTES
-- =============================================

-- This migration is IRREVERSIBLE without restoring from backup.
-- Ensure backup exists before running!

-- CASCADE will automatically drop:
-- - Foreign key constraints
-- - Indexes
-- - Triggers
-- - RLS policies
-- - Any dependent objects

-- After this migration:
-- - Old commission data is GONE
-- - Cannot run old commission runs
-- - Old API endpoints will fail (expected - will be deprecated in Agent 1C)
-- - Clean slate for dual-ladder system

-- =============================================
-- END OF MIGRATION
-- =============================================
