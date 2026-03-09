-- =============================================
-- Link tdaniel@botmakers.ai auth to distributor record
-- =============================================

-- Update the distributor record to link to the correct auth user
DO $$
DECLARE
  target_auth_id UUID := 'ab1e4182-144a-4e2e-8eda-879c1d50fc14';
  dist_email TEXT;
BEGIN
  -- Find distributor with tdaniel in email
  SELECT email INTO dist_email
  FROM distributors
  WHERE email ILIKE '%tdaniel%'
  LIMIT 1;

  IF dist_email IS NOT NULL THEN
    RAISE NOTICE 'Found distributor: %', dist_email;

    -- Update auth_user_id to link to the logged in auth account
    UPDATE distributors
    SET auth_user_id = target_auth_id
    WHERE email = dist_email;

    RAISE NOTICE 'Successfully linked auth account % to distributor %', target_auth_id, dist_email;
  ELSE
    RAISE WARNING 'No distributor found with tdaniel in email';
  END IF;
END$$;

-- Verify the link
DO $$
DECLARE
  result_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO result_count
  FROM distributors
  WHERE auth_user_id = 'ab1e4182-144a-4e2e-8eda-879c1d50fc14'
    AND is_admin = TRUE;

  IF result_count = 1 THEN
    RAISE NOTICE 'Verification successful: Admin account is properly linked';
  ELSE
    RAISE WARNING 'Verification failed: Expected 1 admin record, found %', result_count;
  END IF;
END$$;
