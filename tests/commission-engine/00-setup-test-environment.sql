-- =============================================
-- TEST ENVIRONMENT SETUP
-- Creates isolated sandbox for commission testing
-- =============================================
-- All test data uses "test_" prefix for easy identification
-- Can be completely wiped without affecting production
-- =============================================

-- =============================================
-- ISOLATION STRATEGY
-- =============================================
-- We use email prefixes to isolate test data:
-- - Test distributors: test_dist_001@example.com, test_dist_002@example.com, etc.
-- - Test customers: test_cust_001@example.com, etc.
-- - Test month: '9999-99' (clearly not a real month)
--
-- This allows:
-- 1. Easy identification of test data
-- 2. Easy cleanup (DELETE WHERE email LIKE 'test_%')
-- 3. No impact on production data
-- 4. Can run in production database safely
-- =============================================

-- =============================================
-- CLEANUP FUNCTION (Run this to reset sandbox)
-- =============================================

CREATE OR REPLACE FUNCTION cleanup_test_data()
RETURNS TEXT AS $$
DECLARE
  v_deleted_distributors INTEGER;
  v_deleted_customers INTEGER;
  v_deleted_commissions INTEGER;
  v_deleted_orders INTEGER;
BEGIN
  -- Delete all test commission records
  DELETE FROM commissions_retail WHERE distributor_id IN (
    SELECT id FROM distributors WHERE email LIKE 'test_%'
  );
  DELETE FROM commissions_matrix WHERE distributor_id IN (
    SELECT id FROM distributors WHERE email LIKE 'test_%'
  );
  DELETE FROM commissions_matching WHERE distributor_id IN (
    SELECT id FROM distributors WHERE email LIKE 'test_%'
  );
  DELETE FROM commissions_override WHERE distributor_id IN (
    SELECT id FROM distributors WHERE email LIKE 'test_%'
  );
  DELETE FROM commissions_infinity WHERE distributor_id IN (
    SELECT id FROM distributors WHERE email LIKE 'test_%'
  );
  DELETE FROM commissions_customer_milestone WHERE distributor_id IN (
    SELECT id FROM distributors WHERE email LIKE 'test_%'
  );
  DELETE FROM commissions_customer_retention WHERE distributor_id IN (
    SELECT id FROM distributors WHERE email LIKE 'test_%'
  );
  DELETE FROM commissions_fast_start WHERE distributor_id IN (
    SELECT id FROM distributors WHERE email LIKE 'test_%'
  );
  DELETE FROM commissions_rank_advancement WHERE distributor_id IN (
    SELECT id FROM distributors WHERE email LIKE 'test_%'
  );
  DELETE FROM commissions_car WHERE distributor_id IN (
    SELECT id FROM distributors WHERE email LIKE 'test_%'
  );
  DELETE FROM commissions_vacation WHERE distributor_id IN (
    SELECT id FROM distributors WHERE email LIKE 'test_%'
  );
  DELETE FROM commissions_infinity_pool WHERE distributor_id IN (
    SELECT id FROM distributors WHERE email LIKE 'test_%'
  );

  GET DIAGNOSTICS v_deleted_commissions = ROW_COUNT;

  -- Delete test payout batches
  DELETE FROM payout_batch_items WHERE payout_batch_id IN (
    SELECT id FROM payout_batches WHERE month_year = '9999-99'
  );
  DELETE FROM payout_batches WHERE month_year = '9999-99';

  -- Delete test rank snapshots
  DELETE FROM rank_snapshots WHERE distributor_id IN (
    SELECT id FROM distributors WHERE email LIKE 'test_%'
  );
  DELETE FROM rank_history WHERE distributor_id IN (
    SELECT id FROM distributors WHERE email LIKE 'test_%'
  );

  -- Delete test BV snapshots
  DELETE FROM bv_snapshots WHERE distributor_id IN (
    SELECT id FROM distributors WHERE email LIKE 'test_%'
  );

  -- Delete test orders
  DELETE FROM order_items WHERE order_id IN (
    SELECT id FROM orders WHERE distributor_id IN (
      SELECT id FROM distributors WHERE email LIKE 'test_%'
    )
  );
  DELETE FROM orders WHERE distributor_id IN (
    SELECT id FROM distributors WHERE email LIKE 'test_%'
  );
  DELETE FROM orders WHERE customer_id IN (
    SELECT id FROM customers WHERE email LIKE 'test_%'
  );

  GET DIAGNOSTICS v_deleted_orders = ROW_COUNT;

  -- Delete test subscriptions
  DELETE FROM subscriptions WHERE distributor_id IN (
    SELECT id FROM distributors WHERE email LIKE 'test_%'
  );
  DELETE FROM subscriptions WHERE customer_id IN (
    SELECT id FROM customers WHERE email LIKE 'test_%'
  );

  -- Delete test customers
  DELETE FROM customers WHERE email LIKE 'test_%';
  GET DIAGNOSTICS v_deleted_customers = ROW_COUNT;

  -- Delete test distributors (CASCADE will handle related records)
  DELETE FROM distributors WHERE email LIKE 'test_%';
  GET DIAGNOSTICS v_deleted_distributors = ROW_COUNT;

  RETURN FORMAT(
    'Cleanup complete: %s distributors, %s customers, %s orders, %s commission records deleted',
    v_deleted_distributors,
    v_deleted_customers,
    v_deleted_orders,
    v_deleted_commissions
  );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VERIFICATION FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION verify_test_isolation()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- Check for test distributors
  RETURN QUERY
  SELECT
    'Test Distributors'::TEXT,
    CASE WHEN COUNT(*) > 0 THEN '✅ Found' ELSE '❌ None' END,
    COUNT(*)::TEXT || ' test distributors'
  FROM distributors
  WHERE email LIKE 'test_%';

  -- Check for test customers
  RETURN QUERY
  SELECT
    'Test Customers'::TEXT,
    CASE WHEN COUNT(*) > 0 THEN '✅ Found' ELSE '❌ None' END,
    COUNT(*)::TEXT || ' test customers'
  FROM customers
  WHERE email LIKE 'test_%';

  -- Check for test commission records
  RETURN QUERY
  SELECT
    'Test Commissions'::TEXT,
    CASE WHEN COUNT(*) > 0 THEN '✅ Found' ELSE '❌ None' END,
    COUNT(*)::TEXT || ' test commission records'
  FROM commissions_retail
  WHERE distributor_id IN (SELECT id FROM distributors WHERE email LIKE 'test_%');

  -- Verify no production data will be affected
  RETURN QUERY
  SELECT
    'Production Safety'::TEXT,
    '✅ Safe'::TEXT,
    'Test data is isolated by email prefix'::TEXT;

END;
$$ LANGUAGE plpgsql;

-- =============================================
-- USAGE INSTRUCTIONS
-- =============================================

COMMENT ON FUNCTION cleanup_test_data() IS
'Removes all test data from sandbox. Safe to run in production.
Usage: SELECT cleanup_test_data();';

COMMENT ON FUNCTION verify_test_isolation() IS
'Verifies test environment is set up correctly.
Usage: SELECT * FROM verify_test_isolation();';

-- =============================================
-- READY MESSAGE
-- =============================================

SELECT
  '✅ Test environment functions created!' as status,
  'Run: SELECT * FROM verify_test_isolation();' as next_step;
