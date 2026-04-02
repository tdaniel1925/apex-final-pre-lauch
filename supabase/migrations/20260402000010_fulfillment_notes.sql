-- Fulfillment Notes Table
CREATE TABLE fulfillment_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_session_id UUID NOT NULL REFERENCES onboarding_sessions(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  note_text TEXT NOT NULL CHECK (char_length(note_text) > 0 AND char_length(note_text) <= 5000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_fulfillment_notes_session
ON fulfillment_notes(onboarding_session_id, created_at DESC);

CREATE INDEX idx_fulfillment_notes_admin
ON fulfillment_notes(admin_id);

CREATE INDEX idx_fulfillment_notes_deleted
ON fulfillment_notes(deleted_at)
WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE fulfillment_notes ENABLE ROW LEVEL SECURITY;

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

-- Admins can soft delete own notes
CREATE POLICY "Admins can delete own notes"
ON fulfillment_notes FOR UPDATE
TO authenticated
USING (admin_id = auth.uid() AND deleted_at IS NULL)
WITH CHECK (admin_id = auth.uid());

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_fulfillment_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fulfillment_notes_updated_at
BEFORE UPDATE ON fulfillment_notes
FOR EACH ROW
EXECUTE FUNCTION update_fulfillment_notes_updated_at();
