-- =============================================
-- Fix ambiguous column references in find_matrix_placement
-- =============================================

CREATE OR REPLACE FUNCTION find_matrix_placement(p_sponsor_id UUID DEFAULT NULL)
RETURNS TABLE(parent_id UUID, matrix_position INT, matrix_depth INT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_id UUID;
  v_current_depth INT;
  v_position INT;
  v_master_id UUID;
BEGIN
  -- If no sponsor provided, use master distributor as parent
  IF p_sponsor_id IS NULL THEN
    SELECT d.id INTO v_master_id
    FROM distributors d
    WHERE d.is_master = true
    LIMIT 1;

    IF v_master_id IS NULL THEN
      RAISE EXCEPTION 'Master distributor not found';
    END IF;

    p_sponsor_id := v_master_id;
  END IF;

  -- Start with the sponsor as the potential parent
  v_current_id := p_sponsor_id;

  -- Get sponsor's depth
  SELECT d.matrix_depth INTO v_current_depth
  FROM distributors d
  WHERE d.id = p_sponsor_id;

  IF v_current_depth IS NULL THEN
    v_current_depth := 0;
  END IF;

  -- BFS search for first available slot
  -- Check if sponsor has open positions (1-5)
  FOR v_position IN 1..5 LOOP
    IF NOT EXISTS (
      SELECT 1 FROM distributors d
      WHERE d.matrix_parent_id = v_current_id
      AND d.matrix_position = v_position
    ) THEN
      -- Found open slot
      RETURN QUERY SELECT v_current_id, v_position, v_current_depth + 1;
      RETURN;
    END IF;
  END LOOP;

  -- If sponsor is full, search their children
  -- This is a simplified BFS - for production, use a proper queue
  FOR v_current_id IN (
    SELECT d.id FROM distributors d
    WHERE d.matrix_parent_id = p_sponsor_id
    ORDER BY d.matrix_position ASC
  ) LOOP
    -- Check this child's positions
    FOR v_position IN 1..5 LOOP
      IF NOT EXISTS (
        SELECT 1 FROM distributors d
        WHERE d.matrix_parent_id = v_current_id
        AND d.matrix_position = v_position
      ) THEN
        SELECT d.matrix_depth INTO v_current_depth
        FROM distributors d
        WHERE d.id = v_current_id;

        -- Found open slot
        RETURN QUERY SELECT v_current_id, v_position, v_current_depth + 1;
        RETURN;
      END IF;
    END LOOP;
  END LOOP;

  -- If we get here, need to go deeper (this is a fallback)
  -- Place under master as last resort
  SELECT d.id INTO v_master_id
  FROM distributors d
  WHERE d.is_master = true
  LIMIT 1;

  RETURN QUERY SELECT v_master_id, 1::INT, 1::INT;
END;
$$;
