-- =============================================
-- Platform Integrations & Replicated Sites
-- Migration: 20260317000001
-- Creates tables for managing external platform integrations
-- and tracking replicated sites for each distributor
-- =============================================

-- =============================================
-- 1. Platform Integrations Table
-- =============================================
-- Stores configuration for external platforms that can
-- create replicated sites (e.g., jordyn.app, agentpulse.cloud)

CREATE TABLE IF NOT EXISTS platform_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Platform Identification
  platform_name TEXT NOT NULL UNIQUE, -- 'jordyn', 'agentpulse', etc.
  platform_display_name TEXT NOT NULL, -- 'Jordyn.app', 'AgentPulse Cloud'
  platform_url TEXT NOT NULL, -- Base URL: 'https://jordyn.app'

  -- API Configuration (encrypted in production)
  api_endpoint TEXT NOT NULL, -- Full API URL for user creation
  api_key_encrypted TEXT, -- Encrypted API key
  api_secret_encrypted TEXT, -- Encrypted API secret (if needed)
  auth_type TEXT NOT NULL DEFAULT 'bearer', -- 'bearer', 'basic', 'api_key'

  -- Integration Behavior
  sync_users BOOLEAN NOT NULL DEFAULT true, -- Auto-create users on signup
  enabled BOOLEAN NOT NULL DEFAULT true, -- Master switch

  -- Site URL Pattern
  -- Pattern for generating user site URLs
  -- Example: '{username}.jordyn.app' or 'agentpulse.cloud/{username}'
  site_url_pattern TEXT NOT NULL,

  -- Retry Configuration
  max_retry_attempts INTEGER NOT NULL DEFAULT 5,
  retry_delay_seconds INTEGER NOT NULL DEFAULT 300, -- 5 minutes

  -- Additional Configuration (JSON for flexibility)
  config JSONB DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES distributors(id),
  updated_by UUID REFERENCES distributors(id)
);

-- =============================================
-- 2. Distributor Replicated Sites Table
-- =============================================
-- Tracks replicated sites created for each distributor
-- on external platforms

CREATE TABLE IF NOT EXISTS distributor_replicated_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES platform_integrations(id) ON DELETE CASCADE,

  -- Site Information
  site_url TEXT NOT NULL, -- Full URL: 'john-doe.jordyn.app'
  external_user_id TEXT, -- User ID on external platform
  external_username TEXT, -- Username on external platform

  -- Status Tracking
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'failed', 'suspended'
  sync_attempts INTEGER NOT NULL DEFAULT 0,
  last_sync_attempt_at TIMESTAMPTZ,
  last_sync_error TEXT, -- Last error message

  -- Activation
  activated_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  suspended_reason TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(distributor_id, integration_id) -- One site per distributor per platform
);

-- =============================================
-- 3. Indexes for Performance
-- =============================================

-- Index for finding sites by distributor
CREATE INDEX IF NOT EXISTS idx_replicated_sites_distributor
ON distributor_replicated_sites(distributor_id);

-- Index for finding sites by integration
CREATE INDEX IF NOT EXISTS idx_replicated_sites_integration
ON distributor_replicated_sites(integration_id);

-- Index for finding failed sites (for retry job)
CREATE INDEX IF NOT EXISTS idx_replicated_sites_failed
ON distributor_replicated_sites(status)
WHERE status = 'failed';

-- Index for finding pending sites
CREATE INDEX IF NOT EXISTS idx_replicated_sites_pending
ON distributor_replicated_sites(status)
WHERE status = 'pending';

-- Index for enabled integrations
CREATE INDEX IF NOT EXISTS idx_integrations_enabled
ON platform_integrations(enabled)
WHERE enabled = true;

-- Index for integrations that sync users
CREATE INDEX IF NOT EXISTS idx_integrations_sync_users
ON platform_integrations(sync_users)
WHERE sync_users = true;

-- =============================================
-- 4. Row Level Security (RLS)
-- =============================================

ALTER TABLE platform_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributor_replicated_sites ENABLE ROW LEVEL SECURITY;

-- Platform Integrations Policies
-- Only admins can view/modify integrations
CREATE POLICY "Admins can view all integrations"
ON platform_integrations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM distributors
    WHERE distributors.auth_user_id = auth.uid()
    AND distributors.is_admin = true
  )
);

CREATE POLICY "Admins can insert integrations"
ON platform_integrations FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM distributors
    WHERE distributors.auth_user_id = auth.uid()
    AND distributors.is_admin = true
  )
);

CREATE POLICY "Admins can update integrations"
ON platform_integrations FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM distributors
    WHERE distributors.auth_user_id = auth.uid()
    AND distributors.is_admin = true
  )
);

-- Distributor Replicated Sites Policies
-- Distributors can view their own sites
CREATE POLICY "Distributors can view own replicated sites"
ON distributor_replicated_sites FOR SELECT
TO authenticated
USING (
  distributor_id IN (
    SELECT id FROM distributors WHERE auth_user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM distributors
    WHERE distributors.auth_user_id = auth.uid()
    AND distributors.is_admin = true
  )
);

-- Service role can insert/update (for automated sync)
CREATE POLICY "Service role can manage replicated sites"
ON distributor_replicated_sites FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =============================================
-- 5. Updated At Trigger
-- =============================================

CREATE OR REPLACE FUNCTION update_platform_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_platform_integrations_updated_at
BEFORE UPDATE ON platform_integrations
FOR EACH ROW
EXECUTE FUNCTION update_platform_integrations_updated_at();

CREATE OR REPLACE FUNCTION update_distributor_replicated_sites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_distributor_replicated_sites_updated_at
BEFORE UPDATE ON distributor_replicated_sites
FOR EACH ROW
EXECUTE FUNCTION update_distributor_replicated_sites_updated_at();

-- =============================================
-- 6. Seed Example Integrations
-- =============================================

INSERT INTO platform_integrations (
  platform_name,
  platform_display_name,
  platform_url,
  api_endpoint,
  auth_type,
  sync_users,
  enabled,
  site_url_pattern
) VALUES
(
  'jordyn',
  'Jordyn.app',
  'https://jordyn.app',
  'https://jordyn.app/api/v1/users/create',
  'bearer',
  true,
  true,
  '{username}.jordyn.app'
),
(
  'agentpulse',
  'AgentPulse Cloud',
  'https://agentpulse.cloud',
  'https://agentpulse.cloud/api/v1/users/create',
  'bearer',
  true,
  true,
  'agentpulse.cloud/{username}'
)
ON CONFLICT (platform_name) DO NOTHING;

-- =============================================
-- 7. Comments for Documentation
-- =============================================

COMMENT ON TABLE platform_integrations IS 'Stores configuration for external platforms that create replicated sites';
COMMENT ON TABLE distributor_replicated_sites IS 'Tracks replicated sites created for distributors on external platforms';
COMMENT ON COLUMN platform_integrations.sync_users IS 'When true, automatically creates users on this platform during signup';
COMMENT ON COLUMN platform_integrations.site_url_pattern IS 'Pattern for generating site URLs. Use {username} as placeholder';
COMMENT ON COLUMN distributor_replicated_sites.status IS 'Site status: pending, active, failed, suspended';
COMMENT ON COLUMN distributor_replicated_sites.external_user_id IS 'User ID on the external platform (for future API calls)';
