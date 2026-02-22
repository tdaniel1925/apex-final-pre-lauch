-- =============================================
-- SEED TEST DISTRIBUTORS
-- Creates realistic multi-level matrix for testing
-- =============================================
-- Creates 50+ test distributors in a 5-wide x 7-deep matrix
-- Includes all rank levels from Affiliate to Royal Diamond
-- All emails use test_ prefix for isolation
-- =============================================

DO $$
DECLARE
  -- Level 1 (Top) - Royal Diamond
  v_royal_diamond_id UUID;

  -- Level 2 - Crown Diamonds
  v_crown_diamond_1_id UUID;
  v_crown_diamond_2_id UUID;

  -- Level 3 - Diamonds
  v_diamond_ids UUID[];

  -- Level 4 - Platinum
  v_platinum_ids UUID[];

  -- Level 5 - Gold
  v_gold_ids UUID[];

  -- Level 6 - Silver
  v_silver_ids UUID[];

  -- Level 7 - Bronze and Affiliates
  v_bronze_ids UUID[];

  v_counter INTEGER := 1;
  v_temp_id UUID;
BEGIN

  -- =============================================
  -- LEVEL 1: Royal Diamond (Top Leader)
  -- =============================================
  INSERT INTO distributors (
    first_name, last_name, email, slug,
    sponsor_id, matrix_parent_id, matrix_position, matrix_depth,
    status, created_at
  ) VALUES (
    'Test', 'Royal Diamond',
    'test_dist_001@example.com',
    'test-royal-diamond',
    NULL, NULL, NULL, 0,
    'active', NOW() - INTERVAL '3 years'
  ) RETURNING id INTO v_royal_diamond_id;

  -- =============================================
  -- LEVEL 2: Crown Diamonds (2 positions under Royal)
  -- =============================================
  INSERT INTO distributors (
    first_name, last_name, email, slug,
    sponsor_id, matrix_parent_id, matrix_position, matrix_depth,
    status, created_at
  ) VALUES (
    'Test', 'Crown Diamond 1',
    'test_dist_002@example.com',
    'test-crown-diamond-1',
    v_royal_diamond_id, v_royal_diamond_id, 1, 1,
    'active', NOW() - INTERVAL '2 years'
  ) RETURNING id INTO v_crown_diamond_1_id;

  INSERT INTO distributors (
    first_name, last_name, email, slug,
    sponsor_id, matrix_parent_id, matrix_position, matrix_depth,
    status, created_at
  ) VALUES (
    'Test', 'Crown Diamond 2',
    'test_dist_003@example.com',
    'test-crown-diamond-2',
    v_royal_diamond_id, v_royal_diamond_id, 2, 1,
    'active', NOW() - INTERVAL '2 years'
  ) RETURNING id INTO v_crown_diamond_2_id;

  -- =============================================
  -- LEVEL 3: Diamonds (5 positions under each Crown)
  -- =============================================
  v_diamond_ids := ARRAY[]::UUID[];
  v_counter := 4;

  -- 5 Diamonds under Crown Diamond 1
  FOR i IN 1..5 LOOP
    INSERT INTO distributors (
      first_name, last_name, email, slug,
      sponsor_id, matrix_parent_id, matrix_position, matrix_depth,
      status, created_at
    ) VALUES (
      'Test', 'Diamond ' || v_counter,
      'test_dist_' || LPAD(v_counter::TEXT, 3, '0') || '@example.com',
      'test-diamond-' || v_counter,
      v_crown_diamond_1_id, v_crown_diamond_1_id, i, 2,
      'active', NOW() - INTERVAL '18 months'
    ) RETURNING id INTO v_temp_id;

    v_diamond_ids := array_append(v_diamond_ids, v_temp_id);
    v_counter := v_counter + 1;
  END LOOP;

  -- 5 Diamonds under Crown Diamond 2
  FOR i IN 1..5 LOOP
    INSERT INTO distributors (
      first_name, last_name, email, slug,
      sponsor_id, matrix_parent_id, matrix_position, matrix_depth,
      status, created_at
    ) VALUES (
      'Test', 'Diamond ' || v_counter,
      'test_dist_' || LPAD(v_counter::TEXT, 3, '0') || '@example.com',
      'test-diamond-' || v_counter,
      v_crown_diamond_2_id, v_crown_diamond_2_id, i, 2,
      'active', NOW() - INTERVAL '18 months'
    ) RETURNING id INTO v_temp_id;

    v_diamond_ids := array_append(v_diamond_ids, v_temp_id);
    v_counter := v_counter + 1;
  END LOOP;

  -- =============================================
  -- LEVEL 4: Platinum (3 positions under each Diamond)
  -- =============================================
  v_platinum_ids := ARRAY[]::UUID[];

  FOR i IN 1..10 LOOP -- 10 Diamonds
    FOR j IN 1..3 LOOP -- 3 Platinum each
      INSERT INTO distributors (
        first_name, last_name, email, slug,
        sponsor_id, matrix_parent_id, matrix_position, matrix_depth,
        status, created_at
      ) VALUES (
        'Test', 'Platinum ' || v_counter,
        'test_dist_' || LPAD(v_counter::TEXT, 3, '0') || '@example.com',
        'test-platinum-' || v_counter,
        v_diamond_ids[i], v_diamond_ids[i], j, 3,
        'active', NOW() - INTERVAL '12 months'
      ) RETURNING id INTO v_temp_id;

      v_platinum_ids := array_append(v_platinum_ids, v_temp_id);
      v_counter := v_counter + 1;
    END LOOP;
  END LOOP;

  -- =============================================
  -- LEVEL 5: Gold (2 positions under first 15 Platinum)
  -- =============================================
  v_gold_ids := ARRAY[]::UUID[];

  FOR i IN 1..15 LOOP
    FOR j IN 1..2 LOOP
      INSERT INTO distributors (
        first_name, last_name, email, slug,
        sponsor_id, matrix_parent_id, matrix_position, matrix_depth,
        status, created_at
      ) VALUES (
        'Test', 'Gold ' || v_counter,
        'test_dist_' || LPAD(v_counter::TEXT, 3, '0') || '@example.com',
        'test-gold-' || v_counter,
        v_platinum_ids[i], v_platinum_ids[i], j, 4,
        'active', NOW() - INTERVAL '9 months'
      ) RETURNING id INTO v_temp_id;

      v_gold_ids := array_append(v_gold_ids, v_temp_id);
      v_counter := v_counter + 1;
    END LOOP;
  END LOOP;

  -- =============================================
  -- LEVEL 6: Silver (2 positions under first 15 Gold)
  -- =============================================
  v_silver_ids := ARRAY[]::UUID[];

  FOR i IN 1..15 LOOP
    FOR j IN 1..2 LOOP
      INSERT INTO distributors (
        first_name, last_name, email, slug,
        sponsor_id, matrix_parent_id, matrix_position, matrix_depth,
        status, created_at
      ) VALUES (
        'Test', 'Silver ' || v_counter,
        'test_dist_' || LPAD(v_counter::TEXT, 3, '0') || '@example.com',
        'test-silver-' || v_counter,
        v_gold_ids[i], v_gold_ids[i], j, 5,
        'active', NOW() - INTERVAL '6 months'
      ) RETURNING id INTO v_temp_id;

      v_silver_ids := array_append(v_silver_ids, v_temp_id);
      v_counter := v_counter + 1;
    END LOOP;
  END LOOP;

  -- =============================================
  -- LEVEL 7: Bronze and Affiliates (fill out to 150 total)
  -- =============================================
  v_bronze_ids := ARRAY[]::UUID[];

  -- Bronze under first 20 Silver
  FOR i IN 1..20 LOOP
    FOR j IN 1..2 LOOP
      INSERT INTO distributors (
        first_name, last_name, email, slug,
        sponsor_id, matrix_parent_id, matrix_position, matrix_depth,
        status, created_at
      ) VALUES (
        'Test', 'Bronze ' || v_counter,
        'test_dist_' || LPAD(v_counter::TEXT, 3, '0') || '@example.com',
        'test-bronze-' || v_counter,
        v_silver_ids[i], v_silver_ids[i], j, 6,
        'active', NOW() - INTERVAL '3 months'
      ) RETURNING id INTO v_temp_id;

      v_bronze_ids := array_append(v_bronze_ids, v_temp_id);
      v_counter := v_counter + 1;
    END LOOP;
  END LOOP;

  -- Affiliates (brand new, no downline)
  FOR i IN 1..10 LOOP
    -- Random parent from Bronze
    INSERT INTO distributors (
      first_name, last_name, email, slug,
      sponsor_id, matrix_parent_id, matrix_position, matrix_depth,
      status, created_at
    ) VALUES (
      'Test', 'Affiliate ' || v_counter,
      'test_dist_' || LPAD(v_counter::TEXT, 3, '0') || '@example.com',
      'test-affiliate-' || v_counter,
      v_bronze_ids[1 + (i % array_length(v_bronze_ids, 1))],
      v_bronze_ids[1 + (i % array_length(v_bronze_ids, 1))],
      3 + (i % 3), -- Position 3, 4, or 5
      7,
      'active', NOW() - INTERVAL '1 month'
    );

    v_counter := v_counter + 1;
  END LOOP;

  RAISE NOTICE 'Created % test distributors', v_counter - 1;

END $$;

-- =============================================
-- VERIFY DISTRIBUTOR CREATION
-- =============================================

SELECT
  '✅ Test distributors created!' as status,
  COUNT(*) as total_distributors,
  COUNT(*) FILTER (WHERE matrix_depth = 0) as level_1,
  COUNT(*) FILTER (WHERE matrix_depth = 1) as level_2,
  COUNT(*) FILTER (WHERE matrix_depth = 2) as level_3,
  COUNT(*) FILTER (WHERE matrix_depth = 3) as level_4,
  COUNT(*) FILTER (WHERE matrix_depth = 4) as level_5,
  COUNT(*) FILTER (WHERE matrix_depth = 5) as level_6,
  COUNT(*) FILTER (WHERE matrix_depth = 6) as level_7
FROM distributors
WHERE email LIKE 'test_%';
