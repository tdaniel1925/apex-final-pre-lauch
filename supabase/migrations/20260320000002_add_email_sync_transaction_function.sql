-- =============================================
-- FIX: Email Sync Transaction Function
-- Date: 2026-03-20
-- Issue: Email updates to auth.users and distributors not atomic
-- Impact: Email can diverge if one update succeeds and other fails
-- =============================================

-- Create function to update email in both auth and distributors atomically
-- Note: Supabase Auth API calls can't be in PostgreSQL transactions,
-- so this function updates distributors within a transaction and
-- the API endpoint must handle auth rollback manually if this fails
CREATE OR REPLACE FUNCTION update_distributor_email(
  p_distributor_id UUID,
  p_new_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_email TEXT;
  v_auth_user_id UUID;
BEGIN
  -- Get current email and auth_user_id within transaction
  SELECT email, auth_user_id
  INTO v_old_email, v_auth_user_id
  FROM distributors
  WHERE id = p_distributor_id
  FOR UPDATE;  -- Lock row for update

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Distributor not found: %', p_distributor_id;
  END IF;

  -- Update email in distributors table
  UPDATE distributors
  SET
    email = p_new_email,
    updated_at = NOW()
  WHERE id = p_distributor_id;

  -- Also update in members table if exists
  UPDATE members
  SET
    email = p_new_email,
    updated_at = NOW()
  WHERE distributor_id = p_distributor_id;

  -- Return old values for rollback if needed
  RETURN jsonb_build_object(
    'old_email', v_old_email,
    'auth_user_id', v_auth_user_id,
    'success', true
  );
END;
$$;

COMMENT ON FUNCTION update_distributor_email IS 'Updates email in distributors and members tables atomically. Returns old email for auth rollback if needed.';
