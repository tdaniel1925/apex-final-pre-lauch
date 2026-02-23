-- Fix: Add affiliate_code generation to create_distributor_atomic function
-- Run this in Supabase SQL Editor

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
  PERFORM pg_advisory_xact_lock(987654321);

  -- Find the next available slot
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

COMMENT ON FUNCTION create_distributor_atomic IS
'Atomically finds next matrix slot and inserts distributor in one
transaction. Advisory lock prevents concurrent race conditions.
Now generates affiliate_code from slug.';
