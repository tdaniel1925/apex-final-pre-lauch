-- =============================================
-- MIGRATION STATUS CHECKER
-- Run this to see which migrations are applied
-- =============================================

-- Show all tables in public schema
SELECT 'TABLES IN DATABASE:' as info;
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Show all functions (for commission engine check)
SELECT '' as separator;
SELECT 'FUNCTIONS IN DATABASE:' as info;
SELECT
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_result(p.oid) as result_type
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- Check for specific key tables from each migration group
SELECT '' as separator;
SELECT 'MIGRATION STATUS CHECK:' as info;

-- Old migrations (001-015, 2024-2025 series)
SELECT
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'distributors')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status,
    'Old Foundation Migrations (distributors, matrix, training)' as migration_group;

-- 20260221000002 - Business Center System
SELECT
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'business_center_subscriptions')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status,
    '20260221000002 - Business Center System (17 tables)' as migration;

-- Check individual tables from Business Center
SELECT
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'crm_contacts')
        THEN '✅' ELSE '❌' END as crm_contacts,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'email_campaigns')
        THEN '✅' ELSE '❌' END as email_campaigns,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'lead_capture_forms')
        THEN '✅' ELSE '❌' END as lead_capture_forms,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'affiliate_clicks')
        THEN '✅' ELSE '❌' END as affiliate_clicks;

-- 20260221000003 - Products & Orders
SELECT
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'products')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status,
    '20260221000003 - Products & Orders (7 tables)' as migration;

-- Check individual tables from Products & Orders
SELECT
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'product_categories')
        THEN '✅' ELSE '❌' END as product_categories,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'products')
        THEN '✅' ELSE '❌' END as products,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'customers')
        THEN '✅' ELSE '❌' END as customers,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'orders')
        THEN '✅' ELSE '❌' END as orders,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'subscriptions')
        THEN '✅' ELSE '❌' END as subscriptions,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'bv_snapshots')
        THEN '✅' ELSE '❌' END as bv_snapshots;

-- 20260221000004 - Commission Engine Core
SELECT
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'commissions_matrix')
        THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status,
    '20260221000004 - Commission Engine Core (19 tables)' as migration;

-- Check commission tables
SELECT
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'commissions_retail')
        THEN '✅' ELSE '❌' END as commissions_retail,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'commissions_matrix')
        THEN '✅' ELSE '❌' END as commissions_matrix,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'commissions_matching')
        THEN '✅' ELSE '❌' END as commissions_matching,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'commissions_override')
        THEN '✅' ELSE '❌' END as commissions_override,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'payout_batches')
        THEN '✅' ELSE '❌' END as payout_batches,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'rank_history')
        THEN '✅' ELSE '❌' END as rank_history;

-- 20260221000005 - Commission Functions
SELECT
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_proc p
        LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'run_monthly_commissions'
    ) THEN '✅ APPLIED' ELSE '❌ NOT APPLIED' END as status,
    '20260221000005 - Commission Calculation Functions (20 functions)' as migration;

-- Check individual functions
SELECT
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'run_monthly_commissions')
        THEN '✅' ELSE '❌' END as run_monthly_commissions,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_matrix_commissions')
        THEN '✅' ELSE '❌' END as calculate_matrix_commissions,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_matching_bonuses')
        THEN '✅' ELSE '❌' END as calculate_matching_bonuses,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_override_bonuses')
        THEN '✅' ELSE '❌' END as calculate_override_bonuses,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_infinity_bonus')
        THEN '✅' ELSE '❌' END as calculate_infinity_bonus,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_customer_milestones')
        THEN '✅' ELSE '❌' END as calculate_customer_milestones,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_rank_advancement_bonuses')
        THEN '✅' ELSE '❌' END as calculate_rank_advancement_bonuses,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_infinity_pool')
        THEN '✅' ELSE '❌' END as calculate_infinity_pool;

-- 20260221000006 - Seed Products
SELECT
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'products')
        THEN '⚠️ TABLE EXISTS - Check if seeded'
        ELSE '❌ NOT APPLIED (products table missing)' END as status,
    '20260221000006 - Seed Products (33 products)' as migration;

-- Summary
SELECT '' as separator;
SELECT 'SUMMARY:' as info;
SELECT
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as total_tables,
    (SELECT COUNT(*) FROM pg_proc p
     LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
     WHERE n.nspname = 'public') as total_functions;
