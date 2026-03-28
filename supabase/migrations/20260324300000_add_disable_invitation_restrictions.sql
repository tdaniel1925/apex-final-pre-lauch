-- =============================================
-- ADD DISABLE INVITATION RESTRICTIONS SETTING
-- Admin can globally disable all invitation limits
-- =============================================

-- Add new feature flag for disabling invitation restrictions
INSERT INTO system_settings (category, key, value, value_type, description) VALUES
  ('features', 'disable_invitation_restrictions', 'false', 'boolean', 'Disable all invitation send limits (admin override)')
ON CONFLICT (key) DO NOTHING;
