-- =============================================
-- Add is_admin column and set tdaniel@botmakers.ai as admin
-- =============================================

-- Add is_admin column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='distributors' AND column_name='is_admin'
  ) THEN
    ALTER TABLE distributors ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;
    RAISE NOTICE 'Added is_admin column to distributors table';
  ELSE
    RAISE NOTICE 'is_admin column already exists';
  END IF;
END$$;

-- Update tdaniel@botmakers.ai to admin
UPDATE distributors
SET is_admin = TRUE
WHERE email = 'tdaniel@botmakers.ai';

-- Verify the update
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM distributors
  WHERE email = 'tdaniel@botmakers.ai'
    AND is_admin = TRUE;

  IF admin_count = 1 THEN
    RAISE NOTICE 'Successfully set tdaniel@botmakers.ai as admin';
  ELSE
    RAISE WARNING 'User tdaniel@botmakers.ai not found or update failed';
  END IF;
END$$;

-- Create index for is_admin filtering
CREATE INDEX IF NOT EXISTS idx_distributors_is_admin ON distributors(is_admin);

COMMENT ON COLUMN distributors.is_admin IS 'Indicates if distributor has admin/superadmin access to admin portal';
