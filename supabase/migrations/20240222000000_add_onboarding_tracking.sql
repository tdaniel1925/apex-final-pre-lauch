-- =============================================
-- Add Onboarding Tracking to Distributors
-- Migration: 20240222000000
-- =============================================

-- Add onboarding tracking columns to distributors table
DO $$
BEGIN
  -- Add onboarding_completed column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'distributors' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE distributors ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
  END IF;

  -- Add onboarding_step column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'distributors' AND column_name = 'onboarding_step'
  ) THEN
    ALTER TABLE distributors ADD COLUMN onboarding_step INTEGER DEFAULT 1;
  END IF;

  -- Add onboarding_completed_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'distributors' AND column_name = 'onboarding_completed_at'
  ) THEN
    ALTER TABLE distributors ADD COLUMN onboarding_completed_at TIMESTAMPTZ;
  END IF;

  -- Add profile_photo_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'distributors' AND column_name = 'profile_photo_url'
  ) THEN
    ALTER TABLE distributors ADD COLUMN profile_photo_url TEXT;
  END IF;

  -- Add bio column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'distributors' AND column_name = 'bio'
  ) THEN
    ALTER TABLE distributors ADD COLUMN bio TEXT;
  END IF;

  -- Add social_links column if it doesn't exist (JSON)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'distributors' AND column_name = 'social_links'
  ) THEN
    ALTER TABLE distributors ADD COLUMN social_links JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create index on onboarding_completed for faster queries
CREATE INDEX IF NOT EXISTS idx_distributors_onboarding_completed
ON distributors(onboarding_completed);

-- Add comment
COMMENT ON COLUMN distributors.onboarding_completed IS 'Whether user has completed first-time onboarding';
COMMENT ON COLUMN distributors.onboarding_step IS 'Current step in onboarding flow (1-6)';
COMMENT ON COLUMN distributors.onboarding_completed_at IS 'When onboarding was completed';
COMMENT ON COLUMN distributors.profile_photo_url IS 'URL to profile photo';
COMMENT ON COLUMN distributors.bio IS 'User bio/about section';
COMMENT ON COLUMN distributors.social_links IS 'JSON object with social media links';
