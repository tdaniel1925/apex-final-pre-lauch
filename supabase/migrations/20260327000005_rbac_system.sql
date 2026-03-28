-- =============================================
-- RBAC SYSTEM - Role-Based Access Control
-- =============================================
-- Security Fix #7: Implement granular admin permissions
-- Prevents junior admins from performing dangerous operations
-- =============================================

-- Create admin_roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 0, -- Higher = more powerful
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create admin_permissions table
CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- e.g., 'distributors', 'compensation', 'settings'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create role-permission junction table
CREATE TABLE IF NOT EXISTS admin_role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES admin_permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Create admin-role assignment table
CREATE TABLE IF NOT EXISTS admin_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(admin_id, role_id)
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_admin_role_permissions_role
  ON admin_role_permissions(role_id);

CREATE INDEX IF NOT EXISTS idx_admin_role_permissions_permission
  ON admin_role_permissions(permission_id);

CREATE INDEX IF NOT EXISTS idx_admin_user_roles_admin
  ON admin_user_roles(admin_id);

CREATE INDEX IF NOT EXISTS idx_admin_user_roles_role
  ON admin_user_roles(role_id);

-- =============================================
-- INSERT DEFAULT ROLES
-- =============================================

INSERT INTO admin_roles (name, display_name, description, priority) VALUES
  ('super_admin', 'Super Admin', 'Full system access - can do everything', 100),
  ('admin', 'Admin', 'Standard admin - most operations allowed', 80),
  ('manager', 'Manager', 'Team management - limited admin access', 60),
  ('support', 'Support', 'Customer support - view only with limited edits', 40),
  ('readonly', 'Read Only', 'View-only access - no modifications', 20)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- INSERT DEFAULT PERMISSIONS
-- =============================================

INSERT INTO admin_permissions (name, display_name, category, description) VALUES
  -- Distributor Management
  ('view_distributors', 'View Distributors', 'distributors', 'View distributor list and details'),
  ('create_distributors', 'Create Distributors', 'distributors', 'Create new distributor accounts'),
  ('edit_distributors', 'Edit Distributors', 'distributors', 'Modify distributor information'),
  ('delete_distributors', 'Delete Distributors', 'distributors', 'Soft delete distributor accounts'),
  ('permanent_delete_distributors', 'Permanently Delete Distributors', 'distributors', 'Hard delete distributor accounts (irreversible)'),
  ('change_distributor_email', 'Change Distributor Email', 'distributors', 'Modify distributor email addresses'),
  ('change_distributor_sponsor', 'Change Sponsor', 'distributors', 'Modify distributor sponsor relationships'),
  ('change_distributor_matrix', 'Change Matrix Position', 'distributors', 'Modify distributor matrix placement'),

  -- Compensation
  ('view_compensation', 'View Compensation', 'compensation', 'View compensation reports and earnings'),
  ('run_compensation', 'Run Compensation', 'compensation', 'Execute compensation calculation runs'),
  ('edit_compensation_config', 'Edit Compensation Config', 'compensation', 'Modify compensation plan settings'),
  ('override_commissions', 'Override Commissions', 'compensation', 'Manually adjust commission amounts'),
  ('approve_payouts', 'Approve Payouts', 'compensation', 'Approve commission payments'),

  -- Insurance Licensing
  ('view_licenses', 'View Licenses', 'licenses', 'View insurance license information'),
  ('approve_licenses', 'Approve Licenses', 'licenses', 'Approve insurance license applications'),
  ('revoke_licenses', 'Revoke Licenses', 'licenses', 'Revoke insurance licenses'),
  ('reassign_agents', 'Reassign Agents', 'licenses', 'Reassign licensed agents to different sponsors'),

  -- Sensitive Data
  ('view_ssn', 'View SSN', 'sensitive', 'View Social Security Numbers'),
  ('edit_ssn', 'Edit SSN', 'sensitive', 'Modify Social Security Numbers'),
  ('view_bank_info', 'View Bank Info', 'sensitive', 'View bank account information'),
  ('edit_bank_info', 'Edit Bank Info', 'sensitive', 'Modify bank account information'),

  -- Communication
  ('send_emails', 'Send Emails', 'communication', 'Send individual emails to distributors'),
  ('send_bulk_emails', 'Send Bulk Emails', 'communication', 'Send mass emails to distributor groups'),

  -- Events
  ('view_events', 'View Events', 'events', 'View event list and details'),
  ('create_events', 'Create Events', 'events', 'Create new events'),
  ('edit_events', 'Edit Events', 'events', 'Modify event information'),
  ('delete_events', 'Delete Events', 'events', 'Delete events'),

  -- Admin Management
  ('view_admins', 'View Admins', 'admin', 'View admin user list'),
  ('create_admins', 'Create Admins', 'admin', 'Grant admin access to users'),
  ('edit_admin_roles', 'Edit Admin Roles', 'admin', 'Modify admin role assignments'),
  ('revoke_admin', 'Revoke Admin', 'admin', 'Remove admin access from users'),

  -- System Settings
  ('view_settings', 'View Settings', 'settings', 'View system settings'),
  ('edit_settings', 'Edit Settings', 'settings', 'Modify system settings'),
  ('view_audit_logs', 'View Audit Logs', 'audit', 'View admin action audit logs'),
  ('export_data', 'Export Data', 'data', 'Export system data'),
  ('import_data', 'Import Data', 'data', 'Import bulk data')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- ASSIGN PERMISSIONS TO ROLES
-- =============================================

-- Super Admin: All permissions
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN admin_permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Admin: Most permissions (excluding permanent delete and sensitive data edits)
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN admin_permissions p
WHERE r.name = 'admin'
  AND p.name NOT IN (
    'permanent_delete_distributors',
    'edit_ssn',
    'edit_bank_info',
    'edit_compensation_config',
    'create_admins',
    'edit_admin_roles',
    'revoke_admin',
    'edit_settings'
  )
ON CONFLICT DO NOTHING;

-- Manager: Team management permissions
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN admin_permissions p
WHERE r.name = 'manager'
  AND p.name IN (
    'view_distributors',
    'edit_distributors',
    'change_distributor_email',
    'view_compensation',
    'view_events',
    'edit_events',
    'send_emails',
    'view_licenses'
  )
ON CONFLICT DO NOTHING;

-- Support: View and limited edit permissions
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN admin_permissions p
WHERE r.name = 'support'
  AND p.name IN (
    'view_distributors',
    'edit_distributors',
    'view_compensation',
    'view_events',
    'send_emails',
    'view_licenses'
  )
ON CONFLICT DO NOTHING;

-- Read Only: View-only permissions
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN admin_permissions p
WHERE r.name = 'readonly'
  AND p.name LIKE 'view_%'
ON CONFLICT DO NOTHING;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_user_roles ENABLE ROW LEVEL SECURITY;

-- Admins can view all roles and permissions
CREATE POLICY "Admins can view roles"
  ON admin_roles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.auth_user_id = auth.uid()
      AND distributors.is_admin = true
    )
  );

CREATE POLICY "Admins can view permissions"
  ON admin_permissions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.auth_user_id = auth.uid()
      AND distributors.is_admin = true
    )
  );

CREATE POLICY "Admins can view role permissions"
  ON admin_role_permissions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.auth_user_id = auth.uid()
      AND distributors.is_admin = true
    )
  );

CREATE POLICY "Admins can view user roles"
  ON admin_user_roles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.auth_user_id = auth.uid()
      AND distributors.is_admin = true
    )
  );

-- Only super admins can modify roles and permissions
CREATE POLICY "Super admins can manage roles"
  ON admin_roles FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_user_roles aur
      JOIN admin_roles ar ON aur.role_id = ar.id
      WHERE aur.admin_id = auth.uid()
      AND ar.name = 'super_admin'
    )
  );

-- Service role can do everything
GRANT ALL ON admin_roles TO service_role;
GRANT ALL ON admin_permissions TO service_role;
GRANT ALL ON admin_role_permissions TO service_role;
GRANT ALL ON admin_user_roles TO service_role;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to check if admin has permission
CREATE OR REPLACE FUNCTION admin_has_permission(
  p_admin_id UUID,
  p_permission_name VARCHAR
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM admin_user_roles aur
    JOIN admin_role_permissions arp ON aur.role_id = arp.role_id
    JOIN admin_permissions ap ON arp.permission_id = ap.id
    WHERE aur.admin_id = p_admin_id
    AND ap.name = p_permission_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin's highest role priority
CREATE OR REPLACE FUNCTION admin_highest_priority(
  p_admin_id UUID
)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (
      SELECT MAX(ar.priority)
      FROM admin_user_roles aur
      JOIN admin_roles ar ON aur.role_id = ar.id
      WHERE aur.admin_id = p_admin_id
    ),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on functions
COMMENT ON FUNCTION admin_has_permission IS 'Check if admin has a specific permission';
COMMENT ON FUNCTION admin_highest_priority IS 'Get admin highest role priority (higher = more powerful)';
