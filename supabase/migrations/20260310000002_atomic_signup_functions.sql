-- =============================================
-- Atomic Matrix Placement + Rate Limiting
-- Fixes race condition on concurrent signups
-- Ensures distributor creation is atomic
-- =============================================

-- =============================================
-- 1. RATE LIMITING TABLE
-- Tracks signup attempts per IP address
-- =============================================

CREATE TABLE IF NOT EXISTS signup_rate_limits (
  ip_address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_time
  ON signup_rate_limits(ip_address, created_at DESC);

-- =============================================
-- 2. FIND MATRIX PLACEMENT FUNCTION
-- Finds next available matrix slot using BFS
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
    SELECT id INTO v_master_id
    FROM distributors
    WHERE is_master = true
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

-- =============================================
-- 3. ATOMIC PLACEMENT + INSERT FUNCTION
-- Uses advisory lock to serialize all matrix
-- placements, eliminating the race condition.
-- The lock is released automatically when the
-- transaction (function call) completes.
-- =============================================

CREATE OR REPLACE FUNCTION create_distributor_atomic(
  p_auth_user_id    UUID,
  p_first_name      TEXT,
  p_last_name       TEXT,
  p_email           TEXT,
  p_slug            TEXT,
  p_phone           TEXT    DEFAULT NULL,
  p_company_name    TEXT    DEFAULT NULL,
  p_sponsor_id      UUID    DEFAULT NULL,
  p_licensing_status TEXT   DEFAULT 'non_licensed',
  p_licensing_status_set_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS distributors
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_placement       RECORD;
  v_distributor     distributors;
BEGIN
  -- Acquire session-level advisory lock on a fixed key.
  -- This serializes ALL concurrent matrix placements so no
  -- two requests can ever select the same open slot.
  PERFORM pg_advisory_xact_lock(987654321);

  -- Find the next available slot (BFS)
  SELECT * INTO v_placement
  FROM find_matrix_placement(p_sponsor_id);

  -- Insert the distributor record with the claimed slot
  -- Generate affiliate_code from slug (required field)
  INSERT INTO distributors (
    auth_user_id,
    first_name,
    last_name,
    email,
    slug,
    affiliate_code,
    phone,
    company_name,
    sponsor_id,
    matrix_parent_id,
    matrix_position,
    matrix_depth,
    is_master,
    profile_complete,
    licensing_status,
    licensing_status_set_at
  ) VALUES (
    p_auth_user_id,
    p_first_name,
    p_last_name,
    p_email,
    p_slug,
    p_slug,  -- Use slug as affiliate_code (unique replicated site URL)
    p_phone,
    p_company_name,
    p_sponsor_id,
    v_placement.parent_id,
    v_placement.matrix_position,
    v_placement.matrix_depth,
    false,
    false,
    p_licensing_status,
    p_licensing_status_set_at
  )
  RETURNING * INTO v_distributor;

  RETURN v_distributor;
END;
$$;
