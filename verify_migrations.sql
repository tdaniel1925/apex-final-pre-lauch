-- =============================================
-- VERIFY COMMISSION ENGINE MIGRATIONS
-- Quick verification that all 5 migrations were applied
-- =============================================

-- Check total table count
SELECT COUNT(*) as total_tables
FROM pg_tables
WHERE schemaname = 'public';

-- Check total function count
SELECT COUNT(*) as total_functions
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public';

-- Check key tables from each migration
SELECT
    'business_center_subscriptions' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'business_center_subscriptions')
        THEN '✅' ELSE '❌' END as migration_002;

SELECT
    'products' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'products')
        THEN '✅' ELSE '❌' END as migration_003;

SELECT
    'commissions_matrix' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'commissions_matrix')
        THEN '✅' ELSE '❌' END as migration_004;

SELECT
    'run_monthly_commissions' as function_name,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'run_monthly_commissions')
        THEN '✅' ELSE '❌' END as migration_005;

-- Check if products were seeded (should have 33 products)
SELECT COUNT(*) as product_count,
    CASE WHEN COUNT(*) >= 33 THEN '✅ Seeded' ELSE '❌ Not seeded' END as migration_006
FROM products;

-- Show product categories
SELECT slug, name FROM product_categories ORDER BY display_order;

-- Show sample products by category
SELECT
    pc.name as category,
    COUNT(p.id) as product_count
FROM product_categories pc
LEFT JOIN products p ON p.category_id = pc.id
GROUP BY pc.id, pc.name
ORDER BY pc.display_order;
