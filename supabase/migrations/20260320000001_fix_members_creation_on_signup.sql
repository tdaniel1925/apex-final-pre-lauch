-- =============================================
-- FIX: Add Members Table Creation to Signup
-- Date: 2026-03-20
-- Issue: Members record not created during signup
-- Impact: Commission system fails (no members record)
-- =============================================

-- Drop and recreate the function with members table insert
DROP FUNCTION IF EXISTS create_distributor_atomic(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TIMESTAMPTZ);

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

  -- FIX: Create corresponding members table record for commission system
  -- This links the distributor to the dual-ladder compensation system
  INSERT INTO public.members (
    distributor_id,
    email,
    full_name,
    enroller_id,
    sponsor_id,
    status,
    tech_rank,
    insurance_rank
  ) VALUES (
    v_distributor.id,
    p_email,
    p_first_name || ' ' || p_last_name,
    (SELECT member_id FROM public.members WHERE distributor_id = p_sponsor_id),
    (SELECT member_id FROM public.members WHERE distributor_id = p_sponsor_id),
    'active',
    'starter',
    'inactive'
  );

  RETURN v_distributor;
END;
$$;

COMMENT ON FUNCTION create_distributor_atomic IS 'Atomically creates distributor and members records with matrix placement. Uses advisory lock to prevent race conditions.';
