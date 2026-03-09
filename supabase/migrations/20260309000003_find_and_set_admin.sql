-- =============================================
-- Find tdaniel user and set as admin
-- =============================================

-- Try to find user by email pattern
DO $$
DECLARE
  user_email TEXT;
  user_id UUID;
BEGIN
  -- Look for tdaniel in email
  SELECT email, id INTO user_email, user_id
  FROM distributors
  WHERE email ILIKE '%tdaniel%'
  LIMIT 1;

  IF user_email IS NOT NULL THEN
    RAISE NOTICE 'Found user: % with ID: %', user_email, user_id;

    -- Set as admin
    UPDATE distributors
    SET is_admin = TRUE
    WHERE id = user_id;

    RAISE NOTICE 'Successfully set % as admin', user_email;
  ELSE
    RAISE WARNING 'No user found with tdaniel in email. Checking all users...';

    -- Show first few users to help identify
    FOR user_email IN
      SELECT email FROM distributors ORDER BY created_at DESC LIMIT 5
    LOOP
      RAISE NOTICE 'Found user: %', user_email;
    END LOOP;
  END IF;
END$$;
