-- =============================================
-- Admin Activity Log
-- Complete audit trail of all admin actions on distributors
-- =============================================

-- =============================================
-- 1. CREATE ADMIN_ACTIVITY_LOG TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS admin_activity_log (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Who performed the action
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE SET NULL,
  admin_email VARCHAR(255) NOT NULL, -- Denormalized for history
  admin_name VARCHAR(200) NOT NULL, -- Denormalized for history

  -- What was affected
  distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,
  distributor_name VARCHAR(200), -- Denormalized for history

  -- Action tracking
  action_type VARCHAR(100) NOT NULL,
    -- Types: password_reset, suspend, unsuspend, activate, delete, undelete,
    --        license_change, manual_placement, note_added, email_sent,
    --        profile_updated, status_change, permanent_delete, resend_welcome
  action_description TEXT,

  -- Before/After snapshots (for audit trail)
  changes JSONB, -- { before: {...}, after: {...}, fields: ['status', 'licensing_status'] }

  -- Context
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. CREATE INDEXES
-- =============================================

-- Fast lookup by distributor
CREATE INDEX idx_activity_log_distributor ON admin_activity_log(distributor_id);

-- Fast lookup by admin
CREATE INDEX idx_activity_log_admin ON admin_activity_log(admin_id);

-- Filter by action type
CREATE INDEX idx_activity_log_action ON admin_activity_log(action_type);

-- Sort by date (most common query)
CREATE INDEX idx_activity_log_created ON admin_activity_log(created_at DESC);

-- Composite index for distributor activity timeline
CREATE INDEX idx_activity_log_distributor_created ON admin_activity_log(distributor_id, created_at DESC);

-- GIN index for JSONB changes (allows querying specific field changes)
CREATE INDEX idx_activity_log_changes ON admin_activity_log USING GIN(changes);

-- =============================================
-- 3. CREATE HELPER FUNCTION FOR LOGGING
-- =============================================

CREATE OR REPLACE FUNCTION log_admin_activity(
  p_admin_id UUID,
  p_admin_email VARCHAR,
  p_admin_name VARCHAR,
  p_distributor_id UUID,
  p_distributor_name VARCHAR,
  p_action_type VARCHAR,
  p_action_description TEXT,
  p_changes JSONB DEFAULT NULL,
  p_ip_address VARCHAR DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  -- Insert activity log
  INSERT INTO admin_activity_log (
    admin_id,
    admin_email,
    admin_name,
    distributor_id,
    distributor_name,
    action_type,
    action_description,
    changes,
    ip_address,
    user_agent
  ) VALUES (
    p_admin_id,
    p_admin_email,
    p_admin_name,
    p_distributor_id,
    p_distributor_name,
    p_action_type,
    p_action_description,
    p_changes,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_log_id;

  -- Update distributor's last_admin_action if distributor_id provided
  IF p_distributor_id IS NOT NULL THEN
    UPDATE distributors
    SET
      last_admin_action = NOW(),
      last_admin_action_by = p_admin_id
    WHERE id = p_distributor_id;
  END IF;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: All admins can view all activity logs
CREATE POLICY activity_log_select_policy ON admin_activity_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
  )
);

-- Policy: All admins can insert activity logs
CREATE POLICY activity_log_insert_policy ON admin_activity_log
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
  )
);

-- Policy: No updates or deletes allowed (audit trail is immutable)
-- Only super_admin can delete in rare circumstances
CREATE POLICY activity_log_delete_policy ON admin_activity_log
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
    AND admins.role = 'super_admin'
  )
);

-- =============================================
-- 5. CREATE VIEW FOR RECENT ACTIVITY
-- =============================================

CREATE OR REPLACE VIEW admin_recent_activity AS
SELECT
  al.id,
  al.admin_id,
  al.admin_email,
  al.admin_name,
  al.distributor_id,
  al.distributor_name,
  al.action_type,
  al.action_description,
  al.changes,
  al.created_at,
  d.slug AS distributor_slug,
  d.status AS distributor_status
FROM admin_activity_log al
LEFT JOIN distributors d ON d.id = al.distributor_id
ORDER BY al.created_at DESC
LIMIT 100;

-- Grant access to view
GRANT SELECT ON admin_recent_activity TO authenticated;
