-- =============================================
-- ADMIN AUDIT LOG
-- =============================================
-- Security Fix #6: Track all admin actions for compliance
-- Tracks: who, what, when, where for all admin operations
-- =============================================

-- Create admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who performed the action
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT NOT NULL,

  -- What action was performed
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50), -- e.g., 'distributor', 'compensation_config', 'email_template'
  entity_id UUID,

  -- Change tracking
  old_value JSONB,
  new_value JSONB,

  -- Request context
  ip_address VARCHAR(50),
  user_agent TEXT,
  request_path TEXT,
  request_method VARCHAR(10),

  -- Result
  status VARCHAR(20) NOT NULL DEFAULT 'success', -- 'success', 'failure', 'partial'
  error_message TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Query by admin
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id
  ON admin_audit_log(admin_id);

-- Query by action type
CREATE INDEX IF NOT EXISTS idx_audit_log_action
  ON admin_audit_log(action);

-- Query by entity
CREATE INDEX IF NOT EXISTS idx_audit_log_entity
  ON admin_audit_log(entity_type, entity_id);

-- Query by time range
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
  ON admin_audit_log(created_at DESC);

-- Composite index for common queries (admin + time)
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_time
  ON admin_audit_log(admin_id, created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON admin_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.auth_user_id = auth.uid()
      AND distributors.is_admin = true
    )
  );

-- Policy: System can insert audit logs (no user access)
CREATE POLICY "System can insert audit logs"
  ON admin_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Service role will handle actual inserts

-- Policy: Nobody can update or delete audit logs (immutable)
-- No UPDATE or DELETE policies = nobody can modify

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to purge old audit logs (retention policy)
CREATE OR REPLACE FUNCTION purge_old_audit_logs(retention_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM admin_audit_log
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on function
COMMENT ON FUNCTION purge_old_audit_logs IS 'Purge audit logs older than retention period (default 365 days)';

-- =============================================
-- AUDIT LOG ACTION TYPES
-- =============================================

-- Comment describing standard action types
COMMENT ON TABLE admin_audit_log IS 'Admin action audit log for compliance and forensics.

Standard action types:
- CREATE_DISTRIBUTOR
- UPDATE_DISTRIBUTOR
- DELETE_DISTRIBUTOR
- CHANGE_EMAIL
- CHANGE_SPONSOR
- CHANGE_MATRIX_POSITION
- APPROVE_LICENSE
- REVOKE_LICENSE
- RUN_COMPENSATION
- UPDATE_COMPENSATION_CONFIG
- VIEW_SSN
- UPDATE_SSN
- VIEW_BANK_INFO
- UPDATE_BANK_INFO
- SEND_EMAIL
- CREATE_EVENT
- UPDATE_EVENT
- DELETE_EVENT
- GRANT_ADMIN
- REVOKE_ADMIN
- UPDATE_SETTINGS
- EXPORT_DATA
- BULK_IMPORT';

-- =============================================
-- GRANTS
-- =============================================

-- Service role can do anything
GRANT ALL ON admin_audit_log TO service_role;

-- Authenticated users (admins) can only read
GRANT SELECT ON admin_audit_log TO authenticated;
