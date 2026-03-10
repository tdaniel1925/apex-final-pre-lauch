-- =============================================
-- Add Onboarding Skip Preference
-- Allows users to permanently dismiss onboarding
-- =============================================

-- Add column to track if user wants to skip onboarding permanently
ALTER TABLE distributors
ADD COLUMN onboarding_permanently_skipped BOOLEAN NOT NULL DEFAULT FALSE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_distributors_onboarding_skipped
ON distributors(onboarding_permanently_skipped);

-- Add comment
COMMENT ON COLUMN distributors.onboarding_permanently_skipped IS
'When TRUE, user has chosen to permanently skip onboarding and should not be shown the modal again';
