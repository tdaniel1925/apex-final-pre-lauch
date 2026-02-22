-- =============================================
-- FIX: snapshot_monthly_bv() BV Calculation
-- Orders table doesn't have total_bv, must calculate from order_items
-- =============================================
-- Migration: 20260221000011
-- Created: 2026-02-22
-- Fixes: Function tries to SUM(o.total_bv) which doesn't exist
-- =============================================

CREATE OR REPLACE FUNCTION snapshot_monthly_bv(p_month_year TEXT)
RETURNS TABLE(
  distributor_id UUID,
  personal_bv INTEGER,
  group_bv INTEGER,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH personal_orders AS (
    -- Get distributor's own purchases this month
    SELECT
      o.distributor_id,
      SUM(oi.bv_amount) as pbv
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.distributor_id IS NOT NULL
      AND o.is_personal_purchase = TRUE
      AND o.payment_status = 'paid'
      AND TO_CHAR(o.created_at, 'YYYY-MM') = p_month_year
    GROUP BY o.distributor_id
  ),
  retail_customers AS (
    -- Get BV from retail customers they referred
    SELECT
      c.referred_by_distributor_id as distributor_id,
      SUM(oi.bv_amount) as retail_bv
    FROM customers c
    JOIN orders o ON o.customer_id = c.id
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.payment_status = 'paid'
      AND TO_CHAR(o.created_at, 'YYYY-MM') = p_month_year
    GROUP BY c.referred_by_distributor_id
  )
  SELECT
    d.id as distributor_id,
    (COALESCE(po.pbv, 0) + COALESCE(rc.retail_bv, 0))::INTEGER as personal_bv,
    0 as group_bv, -- Will calculate GBV in separate step
    ((COALESCE(po.pbv, 0) + COALESCE(rc.retail_bv, 0)) >= 50) as is_active
  FROM distributors d
  LEFT JOIN personal_orders po ON po.distributor_id = d.id
  LEFT JOIN retail_customers rc ON rc.distributor_id = d.id
  WHERE d.status = 'active';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION snapshot_monthly_bv IS
'Calculates personal BV for all active distributors for a given month.
BV is calculated from order_items.bv_amount (not orders.total_bv which does not exist).
Includes both personal purchases and retail customer purchases.';
