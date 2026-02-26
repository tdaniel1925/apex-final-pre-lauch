-- =============================================
-- Fix email_campaigns table columns
-- Ensure all required columns exist from the full schema
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

-- Add current_step column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='email_campaigns' AND column_name='current_step'
  ) THEN
    ALTER TABLE email_campaigns ADD COLUMN current_step INTEGER DEFAULT 0;
    RAISE NOTICE 'Added current_step column';
  ELSE
    RAISE NOTICE 'current_step column already exists';
  END IF;
END$$;

-- Add is_active column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='email_campaigns' AND column_name='is_active'
  ) THEN
    ALTER TABLE email_campaigns ADD COLUMN is_active BOOLEAN DEFAULT true;
    RAISE NOTICE 'Added is_active column';
  ELSE
    RAISE NOTICE 'is_active column already exists';
  END IF;
END$$;

-- Add completed_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='email_campaigns' AND column_name='completed_at'
  ) THEN
    ALTER TABLE email_campaigns ADD COLUMN completed_at TIMESTAMPTZ;
    RAISE NOTICE 'Added completed_at column';
  ELSE
    RAISE NOTICE 'completed_at column already exists';
  END IF;
END$$;

-- Add paused_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='email_campaigns' AND column_name='paused_at'
  ) THEN
    ALTER TABLE email_campaigns ADD COLUMN paused_at TIMESTAMPTZ;
    RAISE NOTICE 'Added paused_at column';
  ELSE
    RAISE NOTICE 'paused_at column already exists';
  END IF;
END$$;

-- Add started_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='email_campaigns' AND column_name='started_at'
  ) THEN
    ALTER TABLE email_campaigns ADD COLUMN started_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added started_at column';
  ELSE
    RAISE NOTICE 'started_at column already exists';
  END IF;
END$$;

-- Add last_email_sent_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='email_campaigns' AND column_name='last_email_sent_at'
  ) THEN
    ALTER TABLE email_campaigns ADD COLUMN last_email_sent_at TIMESTAMPTZ;
    RAISE NOTICE 'Added last_email_sent_at column';
  ELSE
    RAISE NOTICE 'last_email_sent_at column already exists';
  END IF;
END$$;

-- Add next_email_scheduled_for column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='email_campaigns' AND column_name='next_email_scheduled_for'
  ) THEN
    ALTER TABLE email_campaigns ADD COLUMN next_email_scheduled_for TIMESTAMPTZ;
    RAISE NOTICE 'Added next_email_scheduled_for column';
  ELSE
    RAISE NOTICE 'next_email_scheduled_for column already exists';
  END IF;
END$$;

-- Add total_emails_sent column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='email_campaigns' AND column_name='total_emails_sent'
  ) THEN
    ALTER TABLE email_campaigns ADD COLUMN total_emails_sent INTEGER DEFAULT 0;
    RAISE NOTICE 'Added total_emails_sent column';
  ELSE
    RAISE NOTICE 'total_emails_sent column already exists';
  END IF;
END$$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_email_campaigns_active ON email_campaigns(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_email_campaigns_next_scheduled ON email_campaigns(next_email_scheduled_for) WHERE is_active = true;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
