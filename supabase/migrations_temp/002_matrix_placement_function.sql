-- =============================================
-- Apex Affinity Group - Matrix Placement Function
-- Migration 002: BFS Auto-Placement Algorithm
-- =============================================

-- =============================================
-- 1. ADD UNIQUE CONSTRAINT FOR POSITION
-- =============================================
-- Prevents two distributors from occupying the same slot
-- This handles concurrency at the database level

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_matrix_position
ON distributors(matrix_parent_id, matrix_position)
WHERE matrix_parent_id IS NOT NULL;

-- =============================================
-- 2. MATRIX PLACEMENT FUNCTION (BFS Algorithm)
-- =============================================

CREATE OR REPLACE FUNCTION find_matrix_placement(
  p_sponsor_id UUID DEFAULT NULL
)
RETURNS TABLE(
  parent_id UUID,
  matrix_position INTEGER,
  matrix_depth INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_start_id UUID;
  v_master_id UUID;
  v_current_id UUID;
  v_current_depth INTEGER;
  v_children_count INTEGER;
  v_next_position INTEGER;
  v_max_depth CONSTANT INTEGER := 7;
  v_max_children CONSTANT INTEGER := 5;
  v_queue UUID[];
  v_visited UUID[];
BEGIN
  -- Step 1: Determine starting point (sponsor or master)
  IF p_sponsor_id IS NULL THEN
    -- No sponsor provided, use master distributor
    SELECT id INTO v_master_id
    FROM distributors
    WHERE is_master = true
    LIMIT 1;

    IF v_master_id IS NULL THEN
      RAISE EXCEPTION 'Master distributor not found';
    END IF;

    v_start_id := v_master_id;
  ELSE
    -- Validate sponsor exists
    SELECT id INTO v_start_id
    FROM distributors
    WHERE id = p_sponsor_id;

    IF v_start_id IS NULL THEN
      RAISE EXCEPTION 'Sponsor not found: %', p_sponsor_id;
    END IF;
  END IF;

  -- Step 2: Initialize BFS queue and visited set
  v_queue := ARRAY[v_start_id];
  v_visited := ARRAY[]::UUID[];

  -- Step 3: BFS Loop
  WHILE array_length(v_queue, 1) > 0 LOOP
    -- Dequeue first element
    v_current_id := v_queue[1];
    v_queue := v_queue[2:array_length(v_queue, 1)];

    -- Skip if already visited
    IF v_current_id = ANY(v_visited) THEN
      CONTINUE;
    END IF;

    -- Mark as visited
    v_visited := array_append(v_visited, v_current_id);

    -- Get current distributor's depth
    SELECT d.matrix_depth INTO v_current_depth
    FROM distributors d
    WHERE d.id = v_current_id;

    -- Check depth constraint (can't place beyond level 7)
    IF v_current_depth >= v_max_depth THEN
      CONTINUE; -- Skip this node, can't add children
    END IF;

    -- Count existing children
    SELECT COUNT(*) INTO v_children_count
    FROM distributors
    WHERE matrix_parent_id = v_current_id;

    -- Check if this node has available slots
    IF v_children_count < v_max_children THEN
      -- Find first available position (1-5)
      FOR i IN 1..v_max_children LOOP
        -- Check if position i is taken
        SELECT COUNT(*) INTO v_children_count
        FROM distributors
        WHERE matrix_parent_id = v_current_id
          AND matrix_position = i;

        IF v_children_count = 0 THEN
          -- Found available slot!
          RETURN QUERY SELECT
            v_current_id AS parent_id,
            i AS matrix_position,
            v_current_depth + 1 AS matrix_depth;
          RETURN;
        END IF;
      END LOOP;
    END IF;

    -- No slots available in current node, add children to queue (BFS)
    v_queue := v_queue || ARRAY(
      SELECT id
      FROM distributors
      WHERE matrix_parent_id = v_current_id
      ORDER BY matrix_position
    );
  END LOOP;

  -- If we get here, no available slots found
  RAISE EXCEPTION 'Matrix is full or max depth reached. Cannot place distributor.';
END;
$$;

-- =============================================
-- 3. COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON FUNCTION find_matrix_placement IS
'Finds the next available slot in the 5×7 forced matrix using BFS.
Returns: parent_id (where to place), position (1-5), depth (1-7).
Handles spillover automatically by searching level-by-level.';

-- =============================================
-- 4. VERIFICATION QUERIES
-- =============================================

-- Test 1: Find placement for first distributor (should go under master)
-- SELECT * FROM find_matrix_placement(NULL);

-- Test 2: Find placement with specific sponsor
-- SELECT * FROM find_matrix_placement('[sponsor_uuid]');

-- Test 3: Check unique constraint works (try to place two in same slot)
-- Should fail with unique constraint violation
