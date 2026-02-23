-- =============================================
-- Admin Notes System
-- Allows admins to add internal notes on distributors
-- =============================================

-- =============================================
-- 1. CREATE ADMIN_NOTES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS admin_notes (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- What note is about
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Who created note
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE SET NULL,
  admin_name VARCHAR(200) NOT NULL, -- Denormalized for history

  -- Note content
  note_type VARCHAR(50) NOT NULL DEFAULT 'general',
    -- Types: general, warning, important, follow_up, compliance, password_reset, status_change
  note_text TEXT NOT NULL,

  -- Pinning/Priority
  is_pinned BOOLEAN DEFAULT false,
  priority VARCHAR(20) DEFAULT 'normal', -- normal, high, urgent

  -- Follow-up
  follow_up_date TIMESTAMPTZ,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES admins(id) ON DELETE SET NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. CREATE INDEXES
-- =============================================

-- Fast lookup by distributor
CREATE INDEX idx_admin_notes_distributor ON admin_notes(distributor_id);

-- Fast lookup by admin (who created it)
CREATE INDEX idx_admin_notes_admin ON admin_notes(admin_id);

-- Sort by created date
CREATE INDEX idx_admin_notes_created ON admin_notes(created_at DESC);

-- Filter pinned notes
CREATE INDEX idx_admin_notes_pinned ON admin_notes(is_pinned) WHERE is_pinned = true;

-- Filter unresolved notes with follow-ups
CREATE INDEX idx_admin_notes_follow_up ON admin_notes(follow_up_date) WHERE is_resolved = false AND follow_up_date IS NOT NULL;

-- =============================================
-- 3. ADD COLUMNS TO DISTRIBUTORS TABLE
-- =============================================

-- Track notes count for quick display
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS admin_notes_count INTEGER DEFAULT 0;

-- Track last admin action
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS last_admin_action TIMESTAMPTZ;
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS last_admin_action_by UUID REFERENCES admins(id) ON DELETE SET NULL;

-- Create index for sorting by last admin action
CREATE INDEX IF NOT EXISTS idx_distributors_last_admin_action ON distributors(last_admin_action DESC);

-- =============================================
-- 4. CREATE TRIGGER TO UPDATE notes_count
-- =============================================

-- Function to increment notes count
CREATE OR REPLACE FUNCTION increment_admin_notes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE distributors
  SET admin_notes_count = admin_notes_count + 1
  WHERE id = NEW.distributor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on INSERT
CREATE TRIGGER trigger_increment_admin_notes_count
AFTER INSERT ON admin_notes
FOR EACH ROW
EXECUTE FUNCTION increment_admin_notes_count();

-- Function to decrement notes count
CREATE OR REPLACE FUNCTION decrement_admin_notes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE distributors
  SET admin_notes_count = GREATEST(0, admin_notes_count - 1)
  WHERE id = OLD.distributor_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger on DELETE
CREATE TRIGGER trigger_decrement_admin_notes_count
AFTER DELETE ON admin_notes
FOR EACH ROW
EXECUTE FUNCTION decrement_admin_notes_count();

-- =============================================
-- 5. CREATE TRIGGER FOR updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_admin_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_admin_notes_updated_at
BEFORE UPDATE ON admin_notes
FOR EACH ROW
EXECUTE FUNCTION update_admin_notes_updated_at();

-- =============================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can see all notes
CREATE POLICY admin_notes_select_policy ON admin_notes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
  )
);

-- Policy: Admins can insert notes
CREATE POLICY admin_notes_insert_policy ON admin_notes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
  )
);

-- Policy: Admins can update their own notes or if super_admin
CREATE POLICY admin_notes_update_policy ON admin_notes
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
    AND (admins.id = admin_notes.admin_id OR admins.role = 'super_admin')
  )
);

-- Policy: Only super_admins can delete notes
CREATE POLICY admin_notes_delete_policy ON admin_notes
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
    AND admins.role = 'super_admin'
  )
);
