-- =============================================
-- Stage 1: Admin Portal Foundation
-- Admin roles, activity logging, and access control
-- =============================================

-- Add admin role tracking to distributors
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS admin_role VARCHAR(50);
-- Possible values: 'super_admin', 'admin', 'support', 'viewer', NULL

COMMENT ON COLUMN distributors.admin_role IS 'Admin role for portal access: super_admin, admin, support, viewer';

-- Create admin activity log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES distributors(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50), -- 'distributor', 'commission', 'system', 'settings'
  target_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE admin_activity_log IS 'Audit trail for all admin portal actions';

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_admin_activity_admin ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_action ON admin_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_target ON admin_activity_log(target_type, target_id);

-- Enable RLS on admin activity log
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Only admins and master can view activity logs
CREATE POLICY "Only admins can view activity logs"
ON admin_activity_log FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM distributors
    WHERE distributors.auth_user_id = auth.uid()
    AND (distributors.is_master = true OR distributors.admin_role IS NOT NULL)
  )
);

-- Service role can do anything
CREATE POLICY "Service role full access to activity log"
ON admin_activity_log FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant super_admin role to master user (tdaniel@botmakers.ai)
UPDATE distributors
SET admin_role = 'super_admin'
WHERE is_master = true;

-- Helper function to get matrix stats
CREATE OR REPLACE FUNCTION get_matrix_stats()
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'total_positions', (SELECT COUNT(*) FROM distributors),
    'filled_positions', (SELECT COUNT(*) FROM distributors WHERE matrix_parent_id IS NOT NULL),
    'available_positions', (SELECT COUNT(*) FROM distributors WHERE matrix_parent_id IS NULL)
  );
END;
$$ LANGUAGE plpgsql;

-- Helper function to get average matrix depth
CREATE OR REPLACE FUNCTION avg_matrix_depth()
RETURNS NUMERIC AS $$
BEGIN
  RETURN (SELECT AVG(matrix_depth) FROM distributors);
END;
$$ LANGUAGE plpgsql;
