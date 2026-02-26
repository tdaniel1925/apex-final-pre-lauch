-- =============================================
-- Add licensing_status column to email_campaigns
-- =============================================

-- Add licensing_status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='email_campaigns' AND column_name='licensing_status'
  ) THEN
    ALTER TABLE email_campaigns ADD COLUMN licensing_status TEXT NOT NULL DEFAULT 'licensed' CHECK (licensing_status IN ('licensed', 'non_licensed'));
    RAISE NOTICE 'Added licensing_status column';
  ELSE
    RAISE NOTICE 'licensing_status column already exists';
  END IF;
END$$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
