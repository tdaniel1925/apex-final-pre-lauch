-- =============================================
-- Add is_licensed_agent field to distributors
-- For Licensed Agent Tools & Resources access control
-- =============================================

-- Add is_licensed_agent column to distributors table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='distributors' AND column_name='is_licensed_agent'
  ) THEN
    -- Add column with default TRUE since all current distributors are licensed agents
    ALTER TABLE distributors ADD COLUMN is_licensed_agent BOOLEAN NOT NULL DEFAULT TRUE;
    RAISE NOTICE 'Added is_licensed_agent column';
  ELSE
    RAISE NOTICE 'is_licensed_agent column already exists';
  END IF;
END$$;

-- Create index for fast licensed agent filtering
CREATE INDEX IF NOT EXISTS idx_distributors_licensed_agent ON distributors(is_licensed_agent);

-- Add comment for documentation
COMMENT ON COLUMN distributors.is_licensed_agent IS 'Indicates if distributor has active life insurance license - controls access to Licensed Agent Tools';

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
