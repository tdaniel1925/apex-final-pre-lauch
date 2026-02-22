-- =============================================
-- SEED TEST CUSTOMERS & ORDERS
-- Creates realistic purchase scenarios for commission testing
-- =============================================
-- Creates test customers and orders for various scenarios:
-- - Retail sales (for retail commissions)
-- - Distributor purchases (for matrix/matching)
-- - Subscriptions (for retention bonuses)
-- - Product bundles (for higher BV)
-- =============================================

DO $$
DECLARE
  v_distributor_ids UUID[];
  v_product_ids UUID[];
  v_customer_id UUID;
  v_order_id UUID;
  v_counter INTEGER := 1;
  v_test_month TEXT := '9999-99'; -- Clearly test data
BEGIN

  -- Get test distributor IDs
  SELECT ARRAY_AGG(id ORDER BY created_at) INTO v_distributor_ids
  FROM distributors
  WHERE email LIKE 'test_%'
  LIMIT 50;

  -- Get product IDs for testing
  SELECT ARRAY_AGG(id) INTO v_product_ids
  FROM products
  WHERE is_active = TRUE
  LIMIT 10;

  -- =============================================
  -- SCENARIO 1: Retail Sales (Non-distributor customers)
  -- Creates 30 customers who purchased from test distributors
  -- =============================================
  FOR i IN 1..30 LOOP
    -- Create customer
    INSERT INTO customers (
      email, first_name, last_name,
      referred_by_distributor_id,
      created_at
    ) VALUES (
      'test_cust_' || LPAD(v_counter::TEXT, 3, '0') || '@example.com',
      'Test Customer',
      v_counter::TEXT,
      v_distributor_ids[1 + (i % array_length(v_distributor_ids, 1))],
      NOW() - INTERVAL '1 month'
    ) RETURNING id INTO v_customer_id;

    -- Create order for this customer
    INSERT INTO orders (
      customer_id,
      distributor_id,
      status,
      total_cents,
      created_at
    ) VALUES (
      v_customer_id,
      NULL,
      'completed',
      0, -- Will be calculated from items
      NOW() - INTERVAL '1 month'
    ) RETURNING id INTO v_order_id;

    -- Add 1-3 random products to order
    FOR j IN 1..(1 + (i % 3)) LOOP
      INSERT INTO order_items (
        order_id,
        product_id,
        quantity,
        price_cents,
        bv_points
      )
      SELECT
        v_order_id,
        v_product_ids[1 + ((i + j) % array_length(v_product_ids, 1))],
        1,
        p.retail_price_cents,
        p.bv
      FROM products p
      WHERE id = v_product_ids[1 + ((i + j) % array_length(v_product_ids, 1))];
    END LOOP;

    -- Update order total
    UPDATE orders
    SET total_cents = (
      SELECT COALESCE(SUM(price_cents * quantity), 0)
      FROM order_items
      WHERE order_id = v_order_id
    )
    WHERE id = v_order_id;

    v_counter := v_counter + 1;
  END LOOP;

  RAISE NOTICE 'Created 30 retail customer orders';

  -- =============================================
  -- SCENARIO 2: Distributor Self-Purchases
  -- Test distributors buy products (creates matrix BV)
  -- =============================================
  FOR i IN 1..40 LOOP
    INSERT INTO orders (
      customer_id,
      distributor_id,
      status,
      total_cents,
      created_at
    ) VALUES (
      NULL,
      v_distributor_ids[i],
      'completed',
      0,
      NOW() - INTERVAL '1 month'
    ) RETURNING id INTO v_order_id;

    -- Add 2-5 products per distributor
    FOR j IN 1..(2 + (i % 4)) LOOP
      INSERT INTO order_items (
        order_id,
        product_id,
        quantity,
        price_cents,
        bv_points
      )
      SELECT
        v_order_id,
        v_product_ids[1 + ((i + j) % array_length(v_product_ids, 1))],
        1,
        p.wholesale_price_cents, -- Distributors pay wholesale
        p.bv
      FROM products p
      WHERE id = v_product_ids[1 + ((i + j) % array_length(v_product_ids, 1))];
    END LOOP;

    UPDATE orders
    SET total_cents = (
      SELECT COALESCE(SUM(price_cents * quantity), 0)
      FROM order_items
      WHERE order_id = v_order_id
    )
    WHERE id = v_order_id;
  END LOOP;

  RAISE NOTICE 'Created 40 distributor self-purchase orders';

  -- =============================================
  -- SCENARIO 3: Subscriptions (for retention bonuses)
  -- Create monthly subscriptions for test customers
  -- =============================================
  FOR i IN 1..20 LOOP
    -- Get a subscription product
    INSERT INTO subscriptions (
      customer_id,
      distributor_id,
      product_id,
      status,
      current_period_start,
      current_period_end,
      created_at
    )
    SELECT
      (SELECT id FROM customers WHERE email LIKE 'test_cust_%' ORDER BY RANDOM() LIMIT 1),
      NULL,
      p.id,
      'active',
      NOW() - INTERVAL '2 months',
      NOW() + INTERVAL '1 month',
      NOW() - INTERVAL '2 months'
    FROM products p
    WHERE p.is_subscription = TRUE
      AND p.is_active = TRUE
    ORDER BY RANDOM()
    LIMIT 1;
  END LOOP;

  RAISE NOTICE 'Created 20 active subscriptions';

  -- =============================================
  -- SCENARIO 4: Create BV Snapshots for Test Month
  -- Required for commission calculations
  -- =============================================
  INSERT INTO bv_snapshots (
    distributor_id,
    month_year,
    personal_bv,
    group_bv,
    is_active,
    created_at
  )
  SELECT
    d.id,
    v_test_month,
    COALESCE((
      SELECT SUM(oi.bv_points * oi.quantity)
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.distributor_id = d.id
        AND o.status = 'completed'
    ), 0)::INTEGER as personal_bv,
    0 as group_bv, -- Will be calculated by calculate_group_bv
    TRUE,
    NOW()
  FROM distributors d
  WHERE d.email LIKE 'test_%';

  RAISE NOTICE 'Created BV snapshots for test month %', v_test_month;

  -- Calculate Group BV for all test distributors
  PERFORM calculate_group_bv(v_test_month);

  RAISE NOTICE 'Calculated group BV for test distributors';

END $$;

-- =============================================
-- VERIFY DATA CREATION
-- =============================================

SELECT
  '✅ Test orders and customers created!' as status;

SELECT
  'Retail Customers' as type,
  COUNT(*) as count
FROM customers
WHERE email LIKE 'test_%'
UNION ALL
SELECT
  'Customer Orders' as type,
  COUNT(*) as count
FROM orders
WHERE customer_id IN (SELECT id FROM customers WHERE email LIKE 'test_%')
UNION ALL
SELECT
  'Distributor Orders' as type,
  COUNT(*) as count
FROM orders
WHERE distributor_id IN (SELECT id FROM distributors WHERE email LIKE 'test_%')
UNION ALL
SELECT
  'Active Subscriptions' as type,
  COUNT(*) as count
FROM subscriptions
WHERE status = 'active'
  AND (
    customer_id IN (SELECT id FROM customers WHERE email LIKE 'test_%')
    OR distributor_id IN (SELECT id FROM distributors WHERE email LIKE 'test_%')
  )
UNION ALL
SELECT
  'BV Snapshots' as type,
  COUNT(*) as count
FROM bv_snapshots
WHERE month_year = '9999-99';

-- Show total BV by distributor rank
SELECT
  CASE
    WHEN bv.group_bv >= 500000 THEN 'Royal Diamond'
    WHEN bv.group_bv >= 250000 THEN 'Crown Diamond'
    WHEN bv.group_bv >= 100000 THEN 'Diamond'
    WHEN bv.group_bv >= 50000 THEN 'Platinum'
    WHEN bv.group_bv >= 25000 THEN 'Gold'
    WHEN bv.group_bv >= 10000 THEN 'Silver'
    WHEN bv.group_bv >= 5000 THEN 'Bronze'
    ELSE 'Affiliate'
  END as rank,
  COUNT(*) as distributor_count,
  AVG(bv.personal_bv)::INTEGER as avg_personal_bv,
  AVG(bv.group_bv)::INTEGER as avg_group_bv
FROM bv_snapshots bv
WHERE bv.month_year = '9999-99'
  AND bv.distributor_id IN (SELECT id FROM distributors WHERE email LIKE 'test_%')
GROUP BY
  CASE
    WHEN bv.group_bv >= 500000 THEN 'Royal Diamond'
    WHEN bv.group_bv >= 250000 THEN 'Crown Diamond'
    WHEN bv.group_bv >= 100000 THEN 'Diamond'
    WHEN bv.group_bv >= 50000 THEN 'Platinum'
    WHEN bv.group_bv >= 25000 THEN 'Gold'
    WHEN bv.group_bv >= 10000 THEN 'Silver'
    WHEN bv.group_bv >= 5000 THEN 'Bronze'
    ELSE 'Affiliate'
  END
ORDER BY avg_group_bv DESC;
