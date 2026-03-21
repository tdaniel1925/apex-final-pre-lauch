-- =============================================
-- FIX: Matrix Position Update with Advisory Lock
-- Date: 2026-03-20
-- Issue: Admin matrix-position endpoint has no lock
-- Impact: Two admins can create position conflicts
-- =============================================

-- Create function to update matrix position with same lock as signup
CREATE OR REPLACE FUNCTION update_distributor_matrix_position(
  p_distributor_id UUID,
  p_matrix_parent_id UUID,
  p_matrix_position INTEGER,
  p_matrix_depth INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_parent_depth INTEGER;
  v_calculated_depth INTEGER;
BEGIN
  -- Acquire the SAME advisory lock as signup function
  -- This prevents race conditions between signup and admin moves
  PERFORM pg_advisory_xact_lock(987654321);

  -- Validate position is not already taken
  IF EXISTS (
    SELECT 1 FROM distributors
    WHERE matrix_parent_id = p_matrix_parent_id
      AND matrix_position = p_matrix_position
      AND id != p_distributor_id
      AND status != 'deleted'
  ) THEN
    RAISE EXCEPTION 'Position % under this parent is already occupied', p_matrix_position;
  END IF;

  -- Validate parent exists and get its depth
  IF p_matrix_parent_id IS NOT NULL THEN
    SELECT matrix_depth INTO v_parent_depth
    FROM distributors
    WHERE id = p_matrix_parent_id
      AND status != 'deleted';

    IF v_parent_depth IS NULL THEN
      RAISE EXCEPTION 'Matrix parent not found or deleted';
    END IF;

    -- Calculate correct depth (parent + 1)
    v_calculated_depth := v_parent_depth + 1;

    -- If manual depth provided, validate it matches calculated depth
    IF p_matrix_depth IS NOT NULL AND p_matrix_depth != v_calculated_depth THEN
      RAISE EXCEPTION 'Manual depth % does not match calculated depth % (parent depth % + 1)',
        p_matrix_depth, v_calculated_depth, v_parent_depth;
    END IF;
  ELSE
    v_calculated_depth := COALESCE(p_matrix_depth, 0);
  END IF;

  -- Update distributor matrix position
  UPDATE distributors
  SET
    matrix_parent_id = p_matrix_parent_id,
    matrix_position = p_matrix_position,
    matrix_depth = v_calculated_depth,
    updated_at = NOW()
  WHERE id = p_distributor_id;

  -- Return success with calculated depth
  RETURN jsonb_build_object(
    'success', true,
    'distributor_id', p_distributor_id,
    'matrix_depth', v_calculated_depth
  );
END;
$$;

COMMENT ON FUNCTION update_distributor_matrix_position IS 'Updates distributor matrix position with advisory lock to prevent race conditions. Validates depth consistency.';
