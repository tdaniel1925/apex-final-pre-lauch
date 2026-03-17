-- =============================================
-- SYSTEM SETTINGS TABLES
-- Database-backed configuration management
-- =============================================

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('general', 'branding', 'email', 'compensation', 'matrix', 'notifications', 'api_keys', 'features')),
  key text NOT NULL UNIQUE,
  value text,
  value_type text NOT NULL DEFAULT 'string' CHECK (value_type IN ('string', 'number', 'boolean', 'json', 'encrypted')),
  is_secret boolean DEFAULT false,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE UNIQUE INDEX idx_system_settings_key ON system_settings(key);

-- RLS Policies (admin only)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all settings"
  ON system_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update settings"
  ON system_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can insert settings"
  ON system_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create setting_audit_log table
CREATE TABLE IF NOT EXISTS setting_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_id uuid REFERENCES system_settings(id) ON DELETE SET NULL,
  setting_key text NOT NULL,
  old_value text,
  new_value text,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Indexes
CREATE INDEX idx_setting_audit_log_setting_id ON setting_audit_log(setting_id);
CREATE INDEX idx_setting_audit_log_changed_at ON setting_audit_log(changed_at DESC);
CREATE INDEX idx_setting_audit_log_changed_by ON setting_audit_log(changed_by);

-- RLS Policies (admin only)
ALTER TABLE setting_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON setting_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER settings_updated_at_trigger
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- Function to log setting changes
CREATE OR REPLACE FUNCTION log_setting_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if value actually changed
  IF OLD.value IS DISTINCT FROM NEW.value THEN
    INSERT INTO setting_audit_log (
      setting_id,
      setting_key,
      old_value,
      new_value,
      changed_by
    ) VALUES (
      NEW.id,
      NEW.key,
      OLD.value,
      NEW.value,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-log changes
CREATE TRIGGER settings_audit_trigger
  AFTER UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION log_setting_change();

-- Seed default settings
INSERT INTO system_settings (category, key, value, value_type, description) VALUES
  -- General
  ('general', 'site_name', 'Apex Admin', 'string', 'Site name displayed in header and page titles'),
  ('general', 'company_name', 'Apex', 'string', 'Legal company name for official documents'),
  ('general', 'support_email', 'support@apex.com', 'string', 'Primary support contact email'),
  ('general', 'support_phone', '', 'string', 'Support phone number (optional)'),
  ('general', 'timezone', 'America/New_York', 'string', 'Default timezone for system operations'),
  ('general', 'date_format', 'MM/DD/YYYY', 'string', 'Date display format'),
  ('general', 'currency', 'USD', 'string', 'Currency code'),

  -- Branding
  ('branding', 'primary_color', '#3b82f6', 'string', 'Primary brand color (hex code)'),
  ('branding', 'secondary_color', '#1e40af', 'string', 'Secondary brand color (hex code)'),
  ('branding', 'logo_url', '/logo.png', 'string', 'URL to company logo'),
  ('branding', 'favicon_url', '/favicon.ico', 'string', 'URL to favicon'),
  ('branding', 'site_tagline', 'Your success, our mission', 'string', 'Site tagline or slogan'),

  -- Email
  ('email', 'smtp_host', '', 'string', 'SMTP server hostname'),
  ('email', 'smtp_port', '587', 'number', 'SMTP server port'),
  ('email', 'smtp_username', '', 'string', 'SMTP authentication username'),
  ('email', 'smtp_password', '', 'encrypted', 'SMTP authentication password'),
  ('email', 'from_email', 'noreply@apex.com', 'string', 'Default sender email address'),
  ('email', 'from_name', 'Apex', 'string', 'Default sender display name'),
  ('email', 'reply_to_email', 'support@apex.com', 'string', 'Reply-to email address'),

  -- Compensation
  ('compensation', 'override_min_credits', '50', 'number', 'Minimum personal credits required to earn overrides'),
  ('compensation', 'rank_grace_period_months', '2', 'number', 'Months below requirements before demotion'),
  ('compensation', 'new_rep_lock_months', '6', 'number', 'Rank lock period for new representatives'),
  ('compensation', 'botmakers_fee_pct', '0.30', 'number', 'BotMakers fee percentage (0.30 = 30%)'),
  ('compensation', 'apex_take_pct', '0.30', 'number', 'Apex take percentage (0.30 = 30%)'),
  ('compensation', 'bonus_pool_pct', '0.035', 'number', 'Bonus pool percentage (0.035 = 3.5%)'),
  ('compensation', 'leadership_pool_pct', '0.015', 'number', 'Leadership pool percentage (0.015 = 1.5%)'),
  ('compensation', 'seller_commission_pct', '0.60', 'number', 'Seller commission percentage (0.60 = 60%)'),
  ('compensation', 'override_pool_pct', '0.40', 'number', 'Override pool percentage (0.40 = 40%)'),

  -- Matrix
  ('matrix', 'auto_placement_enabled', 'true', 'boolean', 'Enable automatic placement for new members'),
  ('matrix', 'spillover_strategy', 'left_to_right', 'string', 'Spillover placement strategy'),
  ('matrix', 'max_width', '3', 'number', 'Maximum width per level (0 = unlimited)'),

  -- Notifications
  ('notifications', 'new_signup_alerts', 'true', 'boolean', 'Send alerts for new member signups'),
  ('notifications', 'rank_advancement_alerts', 'true', 'boolean', 'Send alerts for rank advancements'),
  ('notifications', 'commission_run_alerts', 'true', 'boolean', 'Send alerts when commission runs complete'),
  ('notifications', 'low_activity_alerts', 'false', 'boolean', 'Send alerts for inactive members'),

  -- API Keys (encrypted, marked as secret)
  ('api_keys', 'stripe_secret_key', '', 'encrypted', 'Stripe secret API key'),
  ('api_keys', 'stripe_publishable_key', '', 'string', 'Stripe publishable API key'),

  -- Feature Flags
  ('features', 'signup_enabled', 'true', 'boolean', 'Allow new member signups'),
  ('features', 'commissions_enabled', 'true', 'boolean', 'Enable commission calculations'),
  ('features', 'public_registration', 'true', 'boolean', 'Allow public registration (vs invite-only)'),
  ('features', 'maintenance_mode', 'false', 'boolean', 'Enable maintenance mode (blocks non-admin access)')
ON CONFLICT (key) DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON system_settings TO authenticated;
GRANT SELECT ON setting_audit_log TO authenticated;

-- Comments
COMMENT ON TABLE system_settings IS 'Database-backed system configuration settings';
COMMENT ON TABLE setting_audit_log IS 'Audit trail for all setting changes';
COMMENT ON COLUMN system_settings.is_secret IS 'If true, value is hidden in UI (shows [ENCRYPTED])';
COMMENT ON COLUMN system_settings.value_type IS 'Data type for validation: string, number, boolean, json, encrypted';
