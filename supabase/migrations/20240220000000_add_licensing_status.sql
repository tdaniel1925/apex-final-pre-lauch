-- =============================================
-- Add Licensing Status System to Distributors
-- Tracks whether distributor is licensed insurance agent or not
-- =============================================

-- Add licensing status columns to distributors table
ALTER TABLE distributors
ADD COLUMN licensing_status TEXT NOT NULL DEFAULT 'non_licensed'
  CHECK (licensing_status IN ('licensed', 'non_licensed')),
ADD COLUMN licensing_status_set_at TIMESTAMPTZ,
ADD COLUMN licensing_verified BOOLEAN DEFAULT false,
ADD COLUMN licensing_verified_at TIMESTAMPTZ,
ADD COLUMN licensing_verified_by UUID REFERENCES distributors(id);

-- Add comments for documentation
COMMENT ON COLUMN distributors.licensing_status IS 'Whether distributor is a licensed insurance agent or non-licensed';
COMMENT ON COLUMN distributors.licensing_status_set_at IS 'When the licensing status was initially set (at signup)';
COMMENT ON COLUMN distributors.licensing_verified IS 'Whether admin has verified their insurance license (for licensed only)';
COMMENT ON COLUMN distributors.licensing_verified_at IS 'When admin verified the license';
COMMENT ON COLUMN distributors.licensing_verified_by IS 'Which admin user verified the license';

-- Create index for faster queries filtering by licensing status
CREATE INDEX idx_distributors_licensing_status ON distributors(licensing_status);
CREATE INDEX idx_distributors_licensing_verified ON distributors(licensing_verified) WHERE licensing_status = 'licensed';

-- Create feature access rules table (for future feature gating)
CREATE TABLE feature_access_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_key TEXT UNIQUE NOT NULL,
  licensing_status TEXT NOT NULL CHECK (licensing_status IN ('licensed', 'non_licensed')),
  is_enabled BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE feature_access_rules IS 'Defines which features are available to which licensing status';
COMMENT ON COLUMN feature_access_rules.feature_key IS 'Unique identifier for the feature (e.g., insurance_licensing_section)';
COMMENT ON COLUMN feature_access_rules.licensing_status IS 'Which licensing status this rule applies to';
COMMENT ON COLUMN feature_access_rules.is_enabled IS 'Whether this feature is enabled for this licensing status';

-- Insert initial feature access rules
INSERT INTO feature_access_rules (feature_key, licensing_status, is_enabled, description) VALUES
  -- Insurance/Licensing features (licensed only)
  ('insurance_licensing_section', 'licensed', true, 'Insurance license information and upload section'),
  ('insurance_licensing_section', 'non_licensed', false, 'Not available to non-licensed distributors'),
  ('insurance_license_upload', 'licensed', true, 'Upload and manage insurance license documents'),
  ('insurance_license_upload', 'non_licensed', false, 'License upload not required for non-licensed'),

  -- Commission features (differentiated access)
  ('commission_advanced', 'licensed', true, 'Advanced commission tracking and reporting'),
  ('commission_advanced', 'non_licensed', false, 'Basic commission tracking only'),

  -- Training materials (both have access, but different levels in future)
  ('training_materials', 'licensed', true, 'Access to all training materials'),
  ('training_materials', 'non_licensed', true, 'Access to basic training materials'),

  -- Lead generation (both have access)
  ('lead_generation', 'licensed', true, 'Full lead generation tools'),
  ('lead_generation', 'non_licensed', true, 'Basic lead generation tools'),

  -- Marketing materials (both have access)
  ('marketing_materials', 'licensed', true, 'Access to marketing materials'),
  ('marketing_materials', 'non_licensed', true, 'Access to marketing materials');

-- Create RLS policies for feature_access_rules
ALTER TABLE feature_access_rules ENABLE ROW LEVEL SECURITY;

-- Everyone can read feature access rules (needed for UI)
CREATE POLICY "Anyone can view feature access rules"
  ON feature_access_rules FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify feature access rules
CREATE POLICY "Only admins can modify feature access rules"
  ON feature_access_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE distributors.auth_user_id = auth.uid()
      AND distributors.is_master = true
    )
  );
