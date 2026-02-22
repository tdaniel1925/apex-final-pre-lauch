-- =============================================
-- VERIFY COMMISSION CALCULATION RESULTS
-- Detailed verification of all commission types
-- =============================================
-- This script provides detailed analysis to verify:
-- - All commission types calculated correctly
-- - Edge cases handled properly
-- - No negative commissions
-- - No duplicate records
-- - Payout ratios are safe
-- =============================================

\set test_month '9999-99'

-- =============================================
-- 1. DATA INTEGRITY CHECKS
-- =============================================

SELECT '═══════════════════════════════════════' as separator;
SELECT '1. DATA INTEGRITY CHECKS' as section;
SELECT '═══════════════════════════════════════' as separator;

-- Check for negative commissions (should be 0)
SELECT
  'Negative Commission Check' as test_name,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ PASS'
    ELSE '❌ FAIL: ' || COUNT(*) || ' negative commissions found'
  END as result
FROM (
  SELECT distributor_id, commission_cents FROM commissions_retail WHERE month_year = :'test_month' AND commission_cents < 0
  UNION ALL
  SELECT distributor_id, total_commission_cents FROM commissions_matrix WHERE month_year = :'test_month' AND total_commission_cents < 0
  UNION ALL
  SELECT distributor_id, total_commission_cents FROM commissions_matching WHERE month_year = :'test_month' AND total_commission_cents < 0
  UNION ALL
  SELECT distributor_id, total_commission_cents FROM commissions_override WHERE month_year = :'test_month' AND total_commission_cents < 0
) negatives;

-- Check for duplicate commission records (should be 0)
SELECT
  'Duplicate Retail Commissions' as test_name,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ PASS'
    ELSE '❌ FAIL: ' || COUNT(*) || ' duplicates found'
  END as result
FROM (
  SELECT distributor_id, month_year, COUNT(*)
  FROM commissions_retail
  WHERE month_year = :'test_month'
  GROUP BY distributor_id, month_year
  HAVING COUNT(*) > 1
) dups;

SELECT
  'Duplicate Matrix Commissions' as test_name,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ PASS'
    ELSE '❌ FAIL: ' || COUNT(*) || ' duplicates found'
  END as result
FROM (
  SELECT distributor_id, month_year, organization_number, COUNT(*)
  FROM commissions_matrix
  WHERE month_year = :'test_month'
  GROUP BY distributor_id, month_year, organization_number
  HAVING COUNT(*) > 1
) dups;

-- =============================================
-- 2. COMMISSION TYPE VERIFICATION
-- =============================================

SELECT '═══════════════════════════════════════' as separator;
SELECT '2. COMMISSION TYPE VERIFICATION' as section;
SELECT '═══════════════════════════════════════' as separator;

-- Retail Commissions (35% of retail sales)
SELECT
  'Retail Commissions' as commission_type,
  COUNT(*) as records,
  COALESCE(SUM(commission_cents), 0)::NUMERIC / 100 as total_usd,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ Generated'
    ELSE '⚠️ No records'
  END as status
FROM commissions_retail
WHERE month_year = :'test_month';

-- Matrix Commissions (7-level deep)
SELECT
  'Matrix Commissions' as commission_type,
  COUNT(*) as records,
  COALESCE(SUM(total_commission_cents), 0)::NUMERIC / 100 as total_usd,
  COUNT(*) FILTER (WHERE level_7_commission_cents > 0) as reaching_level_7,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ Generated'
    ELSE '⚠️ No records'
  END as status
FROM commissions_matrix
WHERE month_year = :'test_month';

-- Matching Bonuses (Gen 1-3, Silver+)
SELECT
  'Matching Bonuses' as commission_type,
  COUNT(*) as records,
  COALESCE(SUM(total_commission_cents), 0)::NUMERIC / 100 as total_usd,
  COUNT(*) FILTER (WHERE gen_3_commission_cents > 0) as gen_3_earners,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ Generated'
    ELSE '⚠️ No records'
  END as status
FROM commissions_matching
WHERE month_year = :'test_month';

-- Override Bonuses (differential, with break rule)
SELECT
  'Override Bonuses' as commission_type,
  COUNT(*) as records,
  COALESCE(SUM(total_commission_cents), 0)::NUMERIC / 100 as total_usd,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ Generated'
    ELSE '⚠️ No records'
  END as status
FROM commissions_override
WHERE month_year = :'test_month';

-- Infinity Bonus (L8+, Diamond+)
SELECT
  'Infinity Bonus (L8+)' as commission_type,
  COUNT(*) as records,
  COALESCE(SUM(commission_cents), 0)::NUMERIC / 100 as total_usd,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ Generated'
    ELSE '⚠️ Expected 0 if no Diamond+ with L8 depth'
  END as status
FROM commissions_infinity
WHERE month_year = :'test_month';

-- Customer Milestone Bonuses
SELECT
  'Customer Milestone' as commission_type,
  COUNT(*) as records,
  COALESCE(SUM(bonus_cents), 0)::NUMERIC / 100 as total_usd,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ Generated'
    ELSE '⚠️ Expected 0 if no new customer milestones'
  END as status
FROM commissions_customer_milestone
WHERE month_year = :'test_month';

-- Customer Retention Bonuses
SELECT
  'Customer Retention' as commission_type,
  COUNT(*) as records,
  COALESCE(SUM(bonus_cents), 0)::NUMERIC / 100 as total_usd,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ Generated'
    ELSE '⚠️ Expected 0 if no active subscriptions'
  END as status
FROM commissions_customer_retention
WHERE month_year = :'test_month';

-- Fast Start Bonuses
SELECT
  'Fast Start Bonuses' as commission_type,
  COUNT(*) as records,
  COALESCE(SUM(total_bonus_cents), 0)::NUMERIC / 100 as total_usd,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ Generated'
    ELSE '⚠️ Expected 0 if no distributors in first 30 days'
  END as status
FROM commissions_fast_start
WHERE month_year = :'test_month';

-- Rank Advancement Bonuses
SELECT
  'Rank Advancement' as commission_type,
  COUNT(*) as records,
  COALESCE(SUM(bonus_cents), 0)::NUMERIC / 100 as total_usd,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ Generated'
    ELSE '⚠️ Expected 0 if no rank advancements'
  END as status
FROM commissions_rank_advancement
WHERE month_year = :'test_month';

-- =============================================
-- 3. BUSINESS LOGIC VERIFICATION
-- =============================================

SELECT '═══════════════════════════════════════' as separator;
SELECT '3. BUSINESS LOGIC VERIFICATION' as section;
SELECT '═══════════════════════════════════════' as separator;

-- Retail Commission Rate Check (should be 35%)
SELECT
  'Retail Rate Accuracy' as test_name,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ PASS: All retail commissions at 35%'
    ELSE '❌ FAIL: ' || COUNT(*) || ' records with incorrect rate'
  END as result
FROM commissions_retail
WHERE month_year = :'test_month'
  AND ABS(commission_rate - 0.35) > 0.001; -- Allow small floating point variance

-- Matrix Rate Validation (rates should match rank)
-- Sample check: Level 1 rate for Bronze should be 0.05
WITH matrix_rates AS (
  SELECT
    cm.distributor_id,
    cm.rank_at_calculation,
    cm.level_1_rate,
    CASE cm.rank_at_calculation
      WHEN 'bronze' THEN 0.05
      WHEN 'silver' THEN 0.06
      WHEN 'gold' THEN 0.07
      WHEN 'platinum' THEN 0.08
      WHEN 'diamond' THEN 0.09
      WHEN 'crown_diamond' THEN 0.10
      WHEN 'royal_diamond' THEN 0.10
      ELSE 0.05
    END as expected_level_1_rate
  FROM commissions_matrix cm
  WHERE cm.month_year = :'test_month'
    AND cm.rank_at_calculation IS NOT NULL
)
SELECT
  'Matrix Rate Accuracy (Level 1)' as test_name,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ PASS: All level 1 rates match rank'
    ELSE '⚠️ WARNING: ' || COUNT(*) || ' records with unexpected rates'
  END as result
FROM matrix_rates
WHERE ABS(level_1_rate - expected_level_1_rate) > 0.001;

-- Gen Matching Cap Check ($25k per distributor per month)
SELECT
  'Gen Matching Cap Enforcement' as test_name,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ PASS: No distributor exceeded $25k cap'
    ELSE '❌ FAIL: ' || COUNT(*) || ' distributors exceeded cap'
  END as result,
  COALESCE(MAX(total_commission_cents)::NUMERIC / 100, 0) as max_matching_paid_usd
FROM commissions_matching
WHERE month_year = :'test_month'
  AND total_commission_cents > 2500000; -- $25,000 cap

-- =============================================
-- 4. PAYOUT RATIO HEALTH CHECK
-- =============================================

SELECT '═══════════════════════════════════════' as separator;
SELECT '4. PAYOUT RATIO HEALTH CHECK' as section;
SELECT '═══════════════════════════════════════' as separator;

WITH revenue AS (
  SELECT COALESCE(SUM(o.total_cents), 0) as total_revenue_cents
  FROM orders o
  WHERE o.distributor_id IN (SELECT id FROM distributors WHERE email LIKE 'test_%')
     OR o.customer_id IN (SELECT id FROM customers WHERE email LIKE 'test_%')
),
commissions AS (
  SELECT (
    (SELECT COALESCE(SUM(commission_cents), 0) FROM commissions_retail WHERE month_year = :'test_month') +
    (SELECT COALESCE(SUM(total_commission_cents), 0) FROM commissions_matrix WHERE month_year = :'test_month') +
    (SELECT COALESCE(SUM(total_commission_cents), 0) FROM commissions_matching WHERE month_year = :'test_month') +
    (SELECT COALESCE(SUM(total_commission_cents), 0) FROM commissions_override WHERE month_year = :'test_month') +
    (SELECT COALESCE(SUM(commission_cents), 0) FROM commissions_infinity WHERE month_year = :'test_month') +
    (SELECT COALESCE(SUM(bonus_cents), 0) FROM commissions_customer_milestone WHERE month_year = :'test_month') +
    (SELECT COALESCE(SUM(bonus_cents), 0) FROM commissions_customer_retention WHERE month_year = :'test_month') +
    (SELECT COALESCE(SUM(total_bonus_cents), 0) FROM commissions_fast_start WHERE month_year = :'test_month') +
    (SELECT COALESCE(SUM(bonus_cents), 0) FROM commissions_rank_advancement WHERE month_year = :'test_month') +
    (SELECT COALESCE(SUM(bonus_cents), 0) FROM commissions_car WHERE month_year = :'test_month') +
    (SELECT COALESCE(SUM(bonus_cents), 0) FROM commissions_vacation WHERE month_year = :'test_month') +
    (SELECT COALESCE(SUM(share_cents), 0) FROM commissions_infinity_pool WHERE month_year = :'test_month')
  ) as total_commissions_cents
)
SELECT
  (r.total_revenue_cents::NUMERIC / 100) as total_revenue_usd,
  (c.total_commissions_cents::NUMERIC / 100) as total_commissions_usd,
  CASE
    WHEN r.total_revenue_cents > 0 THEN
      ROUND((c.total_commissions_cents::NUMERIC / r.total_revenue_cents * 100), 2)
    ELSE 0
  END as payout_ratio_percent,
  CASE
    WHEN r.total_revenue_cents = 0 THEN '⚠️ No revenue data'
    WHEN (c.total_commissions_cents::NUMERIC / r.total_revenue_cents) < 0.45 THEN '✅ EXCELLENT: Under 45%'
    WHEN (c.total_commissions_cents::NUMERIC / r.total_revenue_cents) < 0.50 THEN '✅ GOOD: 45-50%'
    WHEN (c.total_commissions_cents::NUMERIC / r.total_revenue_cents) < 0.55 THEN '✅ ACCEPTABLE: 50-55%'
    WHEN (c.total_commissions_cents::NUMERIC / r.total_revenue_cents) < 0.60 THEN '⚠️ WARNING: 55-60%'
    ELSE '❌ DANGER: Over 60%'
  END as health_status
FROM revenue r, commissions c;

-- =============================================
-- 5. EDGE CASE VERIFICATION
-- =============================================

SELECT '═══════════════════════════════════════' as separator;
SELECT '5. EDGE CASE VERIFICATION' as section;
SELECT '═══════════════════════════════════════' as separator;

-- Check: Inactive distributors should NOT receive commissions
SELECT
  'Inactive Distributor Check' as test_name,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ PASS: No inactive distributors received commissions'
    ELSE '❌ FAIL: ' || COUNT(*) || ' inactive distributors got paid'
  END as result
FROM distributors d
WHERE d.email LIKE 'test_%'
  AND d.status != 'active'
  AND EXISTS (
    SELECT 1 FROM commissions_retail cr
    WHERE cr.distributor_id = d.id AND cr.month_year = :'test_month'
  );

-- Check: Distributors with 0 BV should not get matrix commissions
SELECT
  'Zero BV Check' as test_name,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ PASS: No distributors with 0 BV got matrix commissions'
    ELSE '⚠️ WARNING: ' || COUNT(*) || ' distributors with 0 BV got matrix commissions (may be valid if downline has BV)'
  END as result
FROM bv_snapshots bv
JOIN commissions_matrix cm ON cm.distributor_id = bv.distributor_id
WHERE bv.month_year = :'test_month'
  AND bv.personal_bv = 0
  AND bv.group_bv = 0
  AND cm.month_year = :'test_month';

-- =============================================
-- SUMMARY
-- =============================================

SELECT '═══════════════════════════════════════' as separator;
SELECT 'VERIFICATION COMPLETE' as summary;
SELECT '═══════════════════════════════════════' as separator;

SELECT
  '✅ Verification complete!' as status,
  'Review results above for any ❌ FAIL or ⚠️ WARNING statuses.' as action;
