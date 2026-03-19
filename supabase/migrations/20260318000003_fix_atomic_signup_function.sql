-- ============================================================================
-- FIX ATOMIC SIGNUP FUNCTION
-- Migration: 20260318000003
-- Purpose: Update create_distributor_atomic to accept new business/personal
--          registration fields (address, phone, business info, date of birth)
-- ============================================================================

-- Drop the old function (specify exact signature that exists)
DROP FUNCTION IF EXISTS create_distributor_atomic(
  p_auth_user_id uuid,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_slug text,
  p_phone text,
  p_company_name text,
  p_sponsor_id uuid,
  p_licensing_status text,
  p_licensing_status_set_at timestamp with time zone,
  p_tax_id text,
  p_tax_id_type text,
  p_date_of_birth date
);

-- Recreate with all new parameters
CREATE OR REPLACE FUNCTION create_distributor_atomic(
  -- Original parameters
  p_auth_user_id    UUID,
  p_first_name      TEXT,
  p_last_name       TEXT,
  p_email           TEXT,
  p_slug            TEXT,
  p_phone           TEXT    DEFAULT NULL,
  p_company_name    TEXT    DEFAULT NULL,
  p_sponsor_id      UUID    DEFAULT NULL,
  p_licensing_status TEXT   DEFAULT 'non_licensed',
  p_licensing_status_set_at TIMESTAMPTZ DEFAULT NOW(),

  -- New parameters for business/personal registration
  p_registration_type TEXT DEFAULT 'personal',
  p_business_type     TEXT DEFAULT NULL,
  p_tax_id_type       TEXT DEFAULT 'ssn',
  p_date_of_birth     DATE DEFAULT NULL,
  p_dba_name          TEXT DEFAULT NULL,
  p_business_website  TEXT DEFAULT NULL,
  p_address_line1     TEXT DEFAULT '',
  p_address_line2     TEXT DEFAULT NULL,
  p_city              TEXT DEFAULT '',
  p_state             TEXT DEFAULT '',
  p_zip               TEXT DEFAULT ''
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
    licensing_status_set_at,
    -- New fields
    registration_type,
    business_type,
    tax_id_type,
    date_of_birth,
    dba_name,
    business_website,
    address_line1,
    address_line2,
    city,
    state,
    zip
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
    p_licensing_status_set_at,
    -- New values
    p_registration_type,
    p_business_type,
    p_tax_id_type,
    p_date_of_birth,
    p_dba_name,
    p_business_website,
    p_address_line1,
    p_address_line2,
    p_city,
    p_state,
    p_zip
  )
  RETURNING * INTO v_distributor;

  RETURN v_distributor;
END;
$$;

COMMENT ON FUNCTION create_distributor_atomic IS
  'Atomically creates a distributor with matrix placement. Uses advisory lock to prevent race conditions. Now supports business/personal registration with address fields.';
