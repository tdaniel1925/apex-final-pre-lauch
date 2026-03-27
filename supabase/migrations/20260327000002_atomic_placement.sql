-- =============================================
-- Atomic Distributor Creation & Placement
-- Security Fix #3: Prevents orphaned records
-- =============================================
-- Migration: Add create_and_place_distributor function
-- Date: 2026-03-27
-- Purpose: Ensure distributor creation and matrix placement happen atomically

-- =============================================
-- 1. CREATE ATOMIC PLACEMENT FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION create_and_place_distributor(
  -- Distributor data
  p_email TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_phone TEXT DEFAULT NULL,
  p_slug TEXT DEFAULT NULL,
  p_sponsor_id UUID DEFAULT NULL,
  p_referrer_id UUID DEFAULT NULL,
  p_address_line1 TEXT DEFAULT NULL,
  p_address_line2 TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_zip TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,

  -- Placement data
  p_matrix_parent_id UUID,
  p_matrix_position INT,
  p_matrix_depth INT
)
RETURNS TABLE (
  distributor_id UUID,
  member_id UUID,
  success BOOLEAN,
  error TEXT
) AS $$
DECLARE
  v_distributor_id UUID;
  v_member_id UUID;
  v_full_name TEXT;
BEGIN
  -- Build full name
  v_full_name := p_first_name || ' ' || p_last_name;

  -- Validate required inputs
  IF p_email IS NULL OR p_first_name IS NULL OR p_last_name IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, FALSE, 'Missing required fields: email, first_name, last_name';
    RETURN;
  END IF;

  IF p_sponsor_id IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, FALSE, 'Missing required field: sponsor_id';
    RETURN;
  END IF;

  IF p_matrix_parent_id IS NULL OR p_matrix_position IS NULL OR p_matrix_depth IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, FALSE, 'Missing required fields: matrix_parent_id, matrix_position, matrix_depth';
    RETURN;
  END IF;

  -- Check email doesn't exist
  IF EXISTS (SELECT 1 FROM distributors WHERE email = p_email) THEN
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, FALSE, 'Email already exists';
    RETURN;
  END IF;

  -- Check slug doesn't exist (if provided)
  IF p_slug IS NOT NULL AND EXISTS (SELECT 1 FROM distributors WHERE slug = p_slug) THEN
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, FALSE, 'Username already exists';
    RETURN;
  END IF;

  -- Check sponsor exists
  IF NOT EXISTS (SELECT 1 FROM distributors WHERE id = p_sponsor_id) THEN
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, FALSE, 'Sponsor not found';
    RETURN;
  END IF;

  -- Check matrix parent exists
  IF NOT EXISTS (SELECT 1 FROM distributors WHERE id = p_matrix_parent_id) THEN
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, FALSE, 'Matrix parent not found';
    RETURN;
  END IF;

  -- Check matrix position is valid (1-5)
  IF p_matrix_position < 1 OR p_matrix_position > 5 THEN
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, FALSE, 'Invalid matrix position (must be 1-5)';
    RETURN;
  END IF;

  -- Check matrix position is not already occupied
  IF EXISTS (
    SELECT 1 FROM distributors
    WHERE matrix_parent_id = p_matrix_parent_id
    AND matrix_position = p_matrix_position
  ) THEN
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, FALSE, 'Matrix position already occupied';
    RETURN;
  END IF;

  -- BEGIN ATOMIC OPERATION
  -- All steps will succeed or all will fail (automatic transaction)

  -- Step 1: Create distributor record with matrix placement
  INSERT INTO distributors (
    email,
    first_name,
    last_name,
    phone,
    slug,
    sponsor_id,
    referrer_id,
    matrix_parent_id,
    matrix_position,
    matrix_depth,
    address_line1,
    address_line2,
    city,
    state,
    zip,
    country,
    status,
    created_at,
    updated_at
  ) VALUES (
    p_email,
    p_first_name,
    p_last_name,
    p_phone,
    p_slug,
    p_sponsor_id,
    p_referrer_id,
    p_matrix_parent_id,
    p_matrix_position,
    p_matrix_depth,
    p_address_line1,
    p_address_line2,
    p_city,
    p_state,
    p_zip,
    p_country,
    'active',
    NOW(),
    NOW()
  ) RETURNING id INTO v_distributor_id;

  -- Step 2: Create corresponding member record
  INSERT INTO members (
    distributor_id,
    member_id,
    full_name,
    email,
    phone,
    sponsor_id,
    matrix_parent_id,
    matrix_position,
    matrix_depth,
    status,
    tech_rank,
    insurance_rank,
    personal_credits_monthly,
    team_credits_monthly,
    created_at,
    updated_at
  ) VALUES (
    v_distributor_id,
    gen_random_uuid(), -- Generate unique member_id
    v_full_name,
    p_email,
    p_phone,
    p_sponsor_id,
    p_matrix_parent_id,
    p_matrix_position,
    p_matrix_depth,
    'active',
    'starter', -- Default starting rank
    NULL, -- No insurance rank initially
    0, -- No credits yet
    0, -- No team credits yet
    NOW(),
    NOW()
  ) RETURNING member_id INTO v_member_id;

  -- Step 3: Update distributor with member_id reference
  UPDATE distributors
  SET member_id = v_member_id
  WHERE id = v_distributor_id;

  -- Success!
  RETURN QUERY SELECT v_distributor_id, v_member_id, TRUE, NULL::TEXT;

EXCEPTION
  WHEN OTHERS THEN
    -- Any error causes automatic rollback
    -- SQLERRM contains the error message
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, FALSE, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 2. ADD HELPFUL COMMENTS
-- =============================================

COMMENT ON FUNCTION create_and_place_distributor IS
  'Atomically creates distributor and places in matrix. All steps succeed or all fail. Security Fix #3: Prevents orphaned records.';

-- =============================================
-- 3. GRANT PERMISSIONS
-- =============================================

-- Grant execute to service role only (admin operations)
GRANT EXECUTE ON FUNCTION create_and_place_distributor TO service_role;

-- Authenticated users should NOT be able to create distributors directly
-- This is admin-only functionality

