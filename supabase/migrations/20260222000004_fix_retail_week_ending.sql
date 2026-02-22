-- =============================================
-- FIX: Add week_ending to retail commission function
-- The function needs to provide week_ending (NOT NULL column)
-- =============================================
-- Migration: 20260222000004
-- Created: 2026-02-22
-- Fixes: null value in week_ending violates not-null constraint
-- =============================================

CREATE OR REPLACE FUNCTION calculate_retail_commissions(
  p_month_year TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_commission_cents INTEGER;
  v_count INTEGER := 0;
  v_month_start DATE;
  v_month_end DATE;
  v_week_ending DATE;
BEGIN
  -- Parse month_year to get date range (e.g., '2026-02' → Feb 1-28)
  v_month_start := (p_month_year || '-01')::DATE;
  v_month_end := (v_month_start + INTERVAL '1 month')::DATE;

  -- Calculate week_ending as last day of month (for compatibility)
  v_week_ending := (v_month_end - INTERVAL '1 day')::DATE;

  -- Get all paid retail orders from customers in the month
  FOR v_order IN
    SELECT
      o.id as order_id,
      o.total_cents,
      o.created_at,
      c.referred_by_distributor_id as distributor_id
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    WHERE o.customer_id IS NOT NULL
      AND o.payment_status = 'paid'
      AND o.is_personal_purchase = FALSE
      AND o.created_at >= v_month_start
      AND o.created_at < v_month_end
  LOOP
    -- Only process if customer was referred by a distributor
    IF v_order.distributor_id IS NOT NULL THEN
      -- Calculate commission for each item in the order
      FOR v_item IN
        SELECT * FROM order_items WHERE order_id = v_order.order_id
      LOOP
        -- Commission = retail price - wholesale price
        -- Wholesale is 70% of retail (30% markup)
        v_commission_cents := v_item.total_price_cents -
          (v_item.unit_price_cents * 0.70)::INTEGER * v_item.quantity;

        INSERT INTO commissions_retail (
          distributor_id,
          order_id,
          order_item_id,
          retail_price_cents,
          wholesale_price_cents,
          commission_amount_cents,
          week_ending,
          month_year
        ) VALUES (
          v_order.distributor_id,
          v_order.order_id,
          v_item.id,
          v_item.total_price_cents,
          (v_item.unit_price_cents * 0.70)::INTEGER * v_item.quantity,
          v_commission_cents,
          v_week_ending,
          p_month_year
        );

        v_count := v_count + 1;
      END LOOP;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;
