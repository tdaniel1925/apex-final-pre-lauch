-- =============================================
-- EXACT MIGRATION STATUS CHECKER
-- Shows EXACTLY which migrations have been applied
-- =============================================

-- Check if migration tracking table exists
SELECT
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'supabase_migrations'
        AND table_name = 'schema_migrations'
    ) THEN '✅ Migration tracking table exists'
    ELSE '❌ No migration tracking table (migrations applied manually)'
    END as migration_tracking_status;

-- Note: If tracking table doesn't exist, migrations were applied manually through Supabase dashboard

-- Manual check by looking for unique tables from each migration
SELECT '' as separator;
SELECT 'MIGRATION STATUS BY UNIQUE TABLE DETECTION:' as info;

-- 001_create_distributors.sql
SELECT
    '001_create_distributors.sql' as migration,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'distributors')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 002_matrix_placement_function.sql
SELECT
    '002_matrix_placement_function.sql' as migration,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'place_in_matrix')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 003_fix_rls_policies.sql
SELECT
    '003_fix_rls_policies.sql' as migration,
    '⚠️ Cannot detect (RLS policy changes)' as status;

-- 004_admin_portal_foundation.sql
SELECT
    '004_admin_portal_foundation.sql' as migration,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'admins')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 005_distributor_management.sql
SELECT
    '005_distributor_management.sql' as migration,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'distributors'
        AND column_name = 'compliance_notes'
    ) THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 006_matrix_management.sql
SELECT
    '006_matrix_management.sql' as migration,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_matrix_children')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 010_training_audio.sql
SELECT
    '010_training_audio.sql' as migration,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'training_episodes')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 011_training_rls.sql
SELECT
    '011_training_rls.sql' as migration,
    '⚠️ Cannot detect (RLS policy changes)' as status;

-- 012_atomic_signup.sql
SELECT
    '012_atomic_signup.sql' as migration,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_distributor_atomic')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 013_waitlist.sql
SELECT
    '013_waitlist.sql' as migration,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'waitlist')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 014_rep_number.sql
SELECT
    '014_rep_number.sql' as migration,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'distributors'
        AND column_name = 'rep_number'
    ) THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 015_business_card_orders.sql
SELECT
    '015_business_card_orders.sql' as migration,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'business_card_orders')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 20240220000000_add_licensing_status.sql
SELECT
    '20240220000000_add_licensing_status.sql' as migration,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'distributors'
        AND column_name = 'licensing_status'
    ) THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 20240220000000_fix_distributor_rls_recursion.sql
SELECT
    '20240220000000_fix_distributor_rls_recursion.sql' as migration,
    '⚠️ Cannot detect (RLS fix)' as status;

-- 20240220000001_add_licensing_status_fixed.sql
SELECT
    '20240220000001_add_licensing_status_fixed.sql' as migration,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'distributors'
        AND column_name = 'licensing_expiry'
    ) THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 20240220000001_simple_rls_fix.sql
SELECT
    '20240220000001_simple_rls_fix.sql' as migration,
    '⚠️ Cannot detect (RLS fix)' as status;

-- 20240221000000_add_email_nurture_system.sql
SELECT
    '20240221000000_add_email_nurture_system.sql' as migration,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'email_sequence_templates')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 20240222000000_email_sends.sql
SELECT
    '20240222000000_email_sends.sql' as migration,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'email_sends')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 20250220000000_add_matrix_depth.sql
SELECT
    '20250220000000_add_matrix_depth.sql' as migration,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'distributors'
        AND column_name = 'matrix_depth'
    ) THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 20250220000001_fix_matrix_placement_depth.sql
SELECT
    '20250220000001_fix_matrix_placement_depth.sql' as migration,
    '⚠️ Cannot detect (function update)' as status;

-- 20250221000000_fix_infinite_loop.sql
SELECT
    '20250221000000_fix_infinite_loop.sql' as migration,
    '⚠️ Cannot detect (RLS fix)' as status;

-- 20250221000001_matrix_placement_bfs.sql
SELECT
    '20250221000001_matrix_placement_bfs.sql' as migration,
    '⚠️ Cannot detect (function update)' as status;

-- 20260218000000_training_category_system.sql
SELECT
    '20260218000000_training_category_system.sql' as migration,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'training_categories')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 20260219000000_admin_email_templates.sql
SELECT
    '20260219000000_admin_email_templates.sql' as migration,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'email_templates')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 20260221000002_business_center_system.sql
SELECT
    '20260221000002_business_center_system.sql' as migration,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'business_center_subscriptions')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 20260221000003_products_and_orders.sql
SELECT
    '20260221000003_products_and_orders.sql' as migration,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'products')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 20260221000004_commission_engine_core.sql
SELECT
    '20260221000004_commission_engine_core.sql' as migration,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'commissions_matrix')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 20260221000005_commission_calculation_functions.sql
SELECT
    '20260221000005_commission_calculation_functions.sql' as migration,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'run_monthly_commissions')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

-- 20260221000006_seed_products.sql
SELECT
    '20260221000006_seed_products.sql' as migration,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'products')
        THEN '⚠️ TABLE EXISTS - Cannot check if seeded'
    ELSE '❌ NOT APPLIED (products table missing)' END as status;

-- Summary - Quick Reference for Commission Engine Migrations
SELECT '' as separator;
SELECT 'COMMISSION ENGINE STATUS (Today''s Migrations):' as info;

SELECT
    '20260221000002' as migration_number,
    'Business Center System' as name,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'business_center_subscriptions')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

SELECT
    '20260221000003' as migration_number,
    'Products & Orders' as name,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'products')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

SELECT
    '20260221000004' as migration_number,
    'Commission Engine Core' as name,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'commissions_matrix')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

SELECT
    '20260221000005' as migration_number,
    'Commission Functions' as name,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'run_monthly_commissions')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status;

SELECT
    '20260221000006' as migration_number,
    'Seed Products' as name,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'products')
        THEN '⚠️ Table exists - Cannot check if seeded'
    ELSE '❌ NOT APPLIED (products table missing)' END as status;
