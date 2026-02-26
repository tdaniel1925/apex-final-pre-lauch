-- =============================================
-- Fix email_campaigns name column
-- Make it nullable since it's not used in the code
-- =============================================

-- Remove NOT NULL constraint from name column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='email_campaigns' AND column_name='name' AND is_nullable='NO'
  ) THEN
    ALTER TABLE email_campaigns ALTER COLUMN name DROP NOT NULL;
    RAISE NOTICE 'Removed NOT NULL constraint from name column';
  ELSE
    RAISE NOTICE 'name column is already nullable or does not exist';
  END IF;
END$$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
