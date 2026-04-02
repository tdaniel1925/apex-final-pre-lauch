-- =============================================
-- APPLY 3 NEW MIGRATIONS
-- Run this in Supabase SQL Editor
-- =============================================

-- MIGRATION 1: Remove Business Center Trial
-- =============================================
UPDATE products
SET trial_days = 0
WHERE slug = 'businesscenter';

-- MIGRATION 2: Add Fulfillment Tracking
-- =============================================
ALTER TABLE onboarding_sessions
  ADD COLUMN IF NOT EXISTS fulfillment_stage TEXT
    CHECK (fulfillment_stage IN (
      'payment_made',
      'onboarding_scheduled',
      'onboarding_complete',
      'building_pages',
      'social_proofs',
      'content_approved',
      'campaigns_live',
      'completed'
    )) DEFAULT 'payment_made',
  ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_fulfillment_stage
  ON onboarding_sessions(fulfillment_stage);

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_calendar_event
  ON onboarding_sessions(calendar_event_id);

COMMENT ON COLUMN onboarding_sessions.fulfillment_stage IS 'Current stage in the fulfillment pipeline';
COMMENT ON COLUMN onboarding_sessions.calendar_event_id IS 'Cal.com event ID for tracking';

-- MIGRATION 3: Fulfillment Notes Table
-- =============================================
CREATE TABLE IF NOT EXISTS fulfillment_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_session_id UUID NOT NULL REFERENCES onboarding_sessions(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  note_text TEXT NOT NULL CHECK (char_length(note_text) > 0 AND char_length(note_text) <= 5000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_fulfillment_notes_session
ON fulfillment_notes(onboarding_session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fulfillment_notes_admin
ON fulfillment_notes(admin_id);

CREATE INDEX IF NOT EXISTS idx_fulfillment_notes_deleted
ON fulfillment_notes(deleted_at)
WHERE deleted_at IS NULL;

ALTER TABLE fulfillment_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all notes" ON fulfillment_notes;
DROP POLICY IF EXISTS "Admins can insert notes" ON fulfillment_notes;
DROP POLICY IF EXISTS "Admins can update own notes" ON fulfillment_notes;
DROP POLICY IF EXISTS "Admins can delete own notes" ON fulfillment_notes;

-- Admins can view all notes
CREATE POLICY "Admins can view all notes"
ON fulfillment_notes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM distributors d
    WHERE d.user_id = auth.uid()
    AND (d.is_admin = true OR d.is_master = true)
  )
);

-- Admins can insert notes
CREATE POLICY "Admins can insert notes"
ON fulfillment_notes FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM distributors d
    WHERE d.user_id = auth.uid()
    AND (d.is_admin = true OR d.is_master = true)
  )
);

-- Admins can update own notes
CREATE POLICY "Admins can update own notes"
ON fulfillment_notes FOR UPDATE
TO authenticated
USING (admin_id = auth.uid())
WITH CHECK (admin_id = auth.uid());

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_fulfillment_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS fulfillment_notes_updated_at ON fulfillment_notes;

CREATE TRIGGER fulfillment_notes_updated_at
BEFORE UPDATE ON fulfillment_notes
FOR EACH ROW
EXECUTE FUNCTION update_fulfillment_notes_updated_at();

-- =============================================
-- MIGRATIONS COMPLETE
-- =============================================
