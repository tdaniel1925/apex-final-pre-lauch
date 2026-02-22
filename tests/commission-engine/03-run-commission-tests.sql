-- =============================================
-- RUN COMMISSION ENGINE TESTS
-- Executes all 16 commission types on test data
-- =============================================
-- This script runs the complete commission calculation
-- for test month '9999-99' and verifies all types work correctly
-- =============================================

\timing on

-- =============================================
-- PRE-RUN VERIFICATION
-- =============================================

DO $$
DECLARE
  v_dist_count INTEGER;
  v_order_count INTEGER;
  v_bv_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_dist_count FROM distributors WHERE email LIKE 'test_%';
  SELECT COUNT(*) INTO v_order_count FROM orders WHERE distributor_id IN (SELECT id FROM distributors WHERE email LIKE 'test_%');
  SELECT COUNT(*) INTO v_bv_count FROM bv_snapshots WHERE month_year = '9999-99';

  IF v_dist_count = 0 THEN
    RAISE EXCEPTION 'No test distributors found. Run 01-seed-test-distributors.sql first';
  END IF;

  IF v_order_count = 0 THEN
    RAISE EXCEPTION 'No test orders found. Run 02-seed-test-orders.sql first';
  END IF;

  IF v_bv_count = 0 THEN
    RAISE EXCEPTION 'No BV snapshots for test month. Run 02-seed-test-orders.sql first';
  END IF;

  RAISE NOTICE '✅ Pre-run checks passed:';
  RAISE NOTICE '  - % test distributors', v_dist_count;
  RAISE NOTICE '  - % test orders', v_order_count;
  RAISE NOTICE '  - % BV snapshots', v_bv_count;
END $$;

-- =============================================
-- CLEAN UP OLD TEST COMMISSIONS (if any)
-- =============================================

DELETE FROM commissions_retail WHERE month_year = '9999-99';
DELETE FROM commissions_matrix WHERE month_year = '9999-99';
DELETE FROM commissions_matching WHERE month_year = '9999-99';
DELETE FROM commissions_override WHERE month_year = '9999-99';
DELETE FROM commissions_infinity WHERE month_year = '9999-99';
DELETE FROM commissions_customer_milestone WHERE month_year = '9999-99';
DELETE FROM commissions_customer_retention WHERE month_year = '9999-99';
DELETE FROM commissions_fast_start WHERE month_year = '9999-99';
DELETE FROM commissions_rank_advancement WHERE month_year = '9999-99';
DELETE FROM commissions_car WHERE month_year = '9999-99';
DELETE FROM commissions_vacation WHERE month_year = '9999-99';
DELETE FROM commissions_infinity_pool WHERE month_year = '9999-99';
DELETE FROM payout_batch_items WHERE payout_batch_id IN (SELECT id FROM payout_batches WHERE month_year = '9999-99');
DELETE FROM payout_batches WHERE month_year = '9999-99';

-- =============================================
-- RUN MONTHLY COMMISSIONS
-- This calls all 16 commission type functions
-- =============================================

SELECT
  '🚀 Starting commission calculation for test month 9999-99...' as status;

SELECT run_monthly_commissions('9999-99') as commission_run_summary;

-- =============================================
-- VERIFY COMMISSION RESULTS
-- =============================================

SELECT
  '✅ Commission calculation complete!' as status;

-- Count records by commission type
SELECT
  'Retail Commissions' as type,
  COUNT(*) as records,
  COALESCE(SUM(commission_cents), 0)::NUMERIC / 100 as total_usd
FROM commissions_retail
WHERE month_year = '9999-99'
UNION ALL
SELECT
  'Matrix Commissions' as type,
  COUNT(*) as records,
  COALESCE(SUM(total_commission_cents), 0)::NUMERIC / 100 as total_usd
FROM commissions_matrix
WHERE month_year = '9999-99'
UNION ALL
SELECT
  'Matching Bonuses' as type,
  COUNT(*) as records,
  COALESCE(SUM(total_commission_cents), 0)::NUMERIC / 100 as total_usd
FROM commissions_matching
WHERE month_year = '9999-99'
UNION ALL
SELECT
  'Override Bonuses' as type,
  COUNT(*) as records,
  COALESCE(SUM(total_commission_cents), 0)::NUMERIC / 100 as total_usd
FROM commissions_override
WHERE month_year = '9999-99'
UNION ALL
SELECT
  'Infinity Bonus (L8+)' as type,
  COUNT(*) as records,
  COALESCE(SUM(commission_cents), 0)::NUMERIC / 100 as total_usd
FROM commissions_infinity
WHERE month_year = '9999-99'
UNION ALL
SELECT
  'Customer Milestone' as type,
  COUNT(*) as records,
  COALESCE(SUM(bonus_cents), 0)::NUMERIC / 100 as total_usd
FROM commissions_customer_milestone
WHERE month_year = '9999-99'
UNION ALL
SELECT
  'Customer Retention' as type,
  COUNT(*) as records,
  COALESCE(SUM(bonus_cents), 0)::NUMERIC / 100 as total_usd
FROM commissions_customer_retention
WHERE month_year = '9999-99'
UNION ALL
SELECT
  'Fast Start Bonuses' as type,
  COUNT(*) as records,
  COALESCE(SUM(total_bonus_cents), 0)::NUMERIC / 100 as total_usd
FROM commissions_fast_start
WHERE month_year = '9999-99'
UNION ALL
SELECT
  'Rank Advancement' as type,
  COUNT(*) as records,
  COALESCE(SUM(bonus_cents), 0)::NUMERIC / 100 as total_usd
FROM commissions_rank_advancement
WHERE month_year = '9999-99'
UNION ALL
SELECT
  'Car Bonuses' as type,
  COUNT(*) as records,
  COALESCE(SUM(bonus_cents), 0)::NUMERIC / 100 as total_usd
FROM commissions_car
WHERE month_year = '9999-99'
UNION ALL
SELECT
  'Vacation Bonuses' as type,
  COUNT(*) as records,
  COALESCE(SUM(bonus_cents), 0)::NUMERIC / 100 as total_usd
FROM commissions_vacation
WHERE month_year = '9999-99'
UNION ALL
SELECT
  'Infinity Pool' as type,
  COUNT(*) as records,
  COALESCE(SUM(share_cents), 0)::NUMERIC / 100 as total_usd
FROM commissions_infinity_pool
WHERE month_year = '9999-99'
ORDER BY total_usd DESC;

-- Show total commissions by distributor (top 20)
SELECT
  d.email,
  d.first_name || ' ' || d.last_name as name,
  bv.personal_bv,
  bv.group_bv,
  (
    COALESCE((SELECT SUM(commission_cents) FROM commissions_retail cr WHERE cr.distributor_id = d.id AND cr.month_year = '9999-99'), 0) +
    COALESCE((SELECT SUM(total_commission_cents) FROM commissions_matrix cm WHERE cm.distributor_id = d.id AND cm.month_year = '9999-99'), 0) +
    COALESCE((SELECT SUM(total_commission_cents) FROM commissions_matching cmm WHERE cmm.distributor_id = d.id AND cmm.month_year = '9999-99'), 0) +
    COALESCE((SELECT SUM(total_commission_cents) FROM commissions_override co WHERE co.distributor_id = d.id AND co.month_year = '9999-99'), 0) +
    COALESCE((SELECT SUM(commission_cents) FROM commissions_infinity ci WHERE ci.distributor_id = d.id AND ci.month_year = '9999-99'), 0) +
    COALESCE((SELECT SUM(bonus_cents) FROM commissions_customer_milestone ccm WHERE ccm.distributor_id = d.id AND ccm.month_year = '9999-99'), 0) +
    COALESCE((SELECT SUM(bonus_cents) FROM commissions_customer_retention ccr WHERE ccr.distributor_id = d.id AND ccr.month_year = '9999-99'), 0) +
    COALESCE((SELECT SUM(total_bonus_cents) FROM commissions_fast_start cfs WHERE cfs.distributor_id = d.id AND cfs.month_year = '9999-99'), 0) +
    COALESCE((SELECT SUM(bonus_cents) FROM commissions_rank_advancement cra WHERE cra.distributor_id = d.id AND cra.month_year = '9999-99'), 0) +
    COALESCE((SELECT SUM(bonus_cents) FROM commissions_car cc WHERE cc.distributor_id = d.id AND cc.month_year = '9999-99'), 0) +
    COALESCE((SELECT SUM(bonus_cents) FROM commissions_vacation cv WHERE cv.distributor_id = d.id AND cv.month_year = '9999-99'), 0) +
    COALESCE((SELECT SUM(share_cents) FROM commissions_infinity_pool cip WHERE cip.distributor_id = d.id AND cip.month_year = '9999-99'), 0)
  )::NUMERIC / 100 as total_commissions_usd
FROM distributors d
LEFT JOIN bv_snapshots bv ON bv.distributor_id = d.id AND bv.month_year = '9999-99'
WHERE d.email LIKE 'test_%'
ORDER BY total_commissions_usd DESC
LIMIT 20;

-- Show payout ratio (should be < 55%)
SELECT
  '📊 Payout Ratio Analysis' as analysis;

WITH totals AS (
  SELECT
    -- Total revenue from all orders
    (SELECT COALESCE(SUM(o.total_cents), 0)
     FROM orders o
     WHERE o.distributor_id IN (SELECT id FROM distributors WHERE email LIKE 'test_%')
        OR o.customer_id IN (SELECT id FROM customers WHERE email LIKE 'test_%')
    )::NUMERIC / 100 as total_revenue_usd,

    -- Total commissions paid
    (
      (SELECT COALESCE(SUM(commission_cents), 0) FROM commissions_retail WHERE month_year = '9999-99') +
      (SELECT COALESCE(SUM(total_commission_cents), 0) FROM commissions_matrix WHERE month_year = '9999-99') +
      (SELECT COALESCE(SUM(total_commission_cents), 0) FROM commissions_matching WHERE month_year = '9999-99') +
      (SELECT COALESCE(SUM(total_commission_cents), 0) FROM commissions_override WHERE month_year = '9999-99') +
      (SELECT COALESCE(SUM(commission_cents), 0) FROM commissions_infinity WHERE month_year = '9999-99') +
      (SELECT COALESCE(SUM(bonus_cents), 0) FROM commissions_customer_milestone WHERE month_year = '9999-99') +
      (SELECT COALESCE(SUM(bonus_cents), 0) FROM commissions_customer_retention WHERE month_year = '9999-99') +
      (SELECT COALESCE(SUM(total_bonus_cents), 0) FROM commissions_fast_start WHERE month_year = '9999-99') +
      (SELECT COALESCE(SUM(bonus_cents), 0) FROM commissions_rank_advancement WHERE month_year = '9999-99') +
      (SELECT COALESCE(SUM(bonus_cents), 0) FROM commissions_car WHERE month_year = '9999-99') +
      (SELECT COALESCE(SUM(bonus_cents), 0) FROM commissions_vacation WHERE month_year = '9999-99') +
      (SELECT COALESCE(SUM(share_cents), 0) FROM commissions_infinity_pool WHERE month_year = '9999-99')
    )::NUMERIC / 100 as total_commissions_usd
)
SELECT
  total_revenue_usd,
  total_commissions_usd,
  CASE
    WHEN total_revenue_usd > 0 THEN
      ROUND((total_commissions_usd / total_revenue_usd * 100)::NUMERIC, 2)
    ELSE 0
  END as payout_ratio_percent,
  CASE
    WHEN total_revenue_usd > 0 AND (total_commissions_usd / total_revenue_usd) < 0.55 THEN
      '✅ Under 55% (Safe)'
    WHEN total_revenue_usd > 0 AND (total_commissions_usd / total_revenue_usd) BETWEEN 0.55 AND 0.60 THEN
      '⚠️ 55-60% (Warning)'
    WHEN total_revenue_usd > 0 THEN
      '❌ Over 60% (Dangerous)'
    ELSE
      'No revenue data'
  END as health_status
FROM totals;

\timing off

-- =============================================
-- SUMMARY
-- =============================================

SELECT
  '✅ Commission test run complete!' as status,
  'Review the results above to verify all commission types calculated correctly.' as next_step;
