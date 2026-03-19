-- =============================================
-- EXTERNAL INTEGRATIONS SYSTEM
-- Track external platform integrations and sales
-- =============================================
-- Migration: 20260317181850
-- Created: 2026-03-17
-- Purpose: Enable integration with external platforms (jordyn.app, agentpulse.cloud, shopify)
--          to create replicated sites and receive sales webhooks
-- =============================================

-- =============================================
-- 1. INTEGRATIONS TABLE
-- Master configuration for each external platform
-- =============================================

CREATE TABLE IF NOT EXISTS integrations (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Platform identification
  platform_name TEXT NOT NULL UNIQUE, -- 'jordyn', 'agentpulse', 'shopify', etc.
  display_name TEXT NOT NULL, -- User-friendly name: "Jordyn.app", "AgentPulse Cloud"

  -- Configuration
  is_enabled BOOLEAN DEFAULT true,
  api_endpoint TEXT NOT NULL, -- Base API URL
  api_key_encrypted TEXT, -- Encrypted API key (use pg_crypto or application-level encryption)
  webhook_secret TEXT, -- Secret for verifying webhook signatures

  -- Features this integration supports
  supports_replicated_sites BOOLEAN DEFAULT false,
  supports_sales_webhooks BOOLEAN DEFAULT false,
  supports_commission_tracking BOOLEAN DEFAULT false,

  -- Auto-creation settings
  auto_create_site_on_signup BOOLEAN DEFAULT false,

  -- Metadata
  integration_metadata JSONB DEFAULT '{}'::jsonb, -- Additional platform-specific config
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_platform_name CHECK (platform_name ~ '^[a-z0-9_]+$')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_integrations_platform ON integrations(platform_name);
CREATE INDEX IF NOT EXISTS idx_integrations_enabled ON integrations(is_enabled) WHERE is_enabled = true;

-- Comments
COMMENT ON TABLE integrations IS 'Master configuration for external platform integrations';
COMMENT ON COLUMN integrations.platform_name IS 'Unique platform identifier (lowercase, no spaces)';
COMMENT ON COLUMN integrations.integration_metadata IS 'Flexible JSONB field for platform-specific configuration';
COMMENT ON COLUMN integrations.supports_replicated_sites IS 'Whether this platform supports creating replicated sites';
COMMENT ON COLUMN integrations.supports_sales_webhooks IS 'Whether this platform sends sales webhooks';

-- =============================================
-- 2. DISTRIBUTOR REPLICATED SITES TABLE
-- Track each distributor's replicated sites on external platforms
-- =============================================

CREATE TABLE IF NOT EXISTS distributor_replicated_sites (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE RESTRICT,

  -- External platform identifiers
  external_site_id TEXT NOT NULL, -- Platform's unique ID for this site
  external_user_id TEXT, -- Platform's unique ID for the user (if applicable)

  -- Site details
  site_url TEXT NOT NULL, -- Full URL to the replicated site
  site_slug TEXT, -- Unique slug on the external platform
  site_status TEXT DEFAULT 'active' CHECK (site_status IN ('pending', 'active', 'suspended', 'deleted')),

  -- Creation details
  created_via TEXT DEFAULT 'manual' CHECK (created_via IN ('manual', 'auto', 'import')),
  provisioned_at TIMESTAMPTZ,

  -- Synchronization
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'error')),
  sync_error TEXT,

  -- Platform-specific data
  site_metadata JSONB DEFAULT '{}'::jsonb, -- Platform-specific site details

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(distributor_id, integration_id), -- One site per distributor per platform
  UNIQUE(integration_id, external_site_id) -- External site ID must be unique within platform
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_repl_sites_distributor ON distributor_replicated_sites(distributor_id);
CREATE INDEX IF NOT EXISTS idx_repl_sites_integration ON distributor_replicated_sites(integration_id);
CREATE INDEX IF NOT EXISTS idx_repl_sites_external_id ON distributor_replicated_sites(external_site_id);
CREATE INDEX IF NOT EXISTS idx_repl_sites_status ON distributor_replicated_sites(site_status);
CREATE INDEX IF NOT EXISTS idx_repl_sites_sync_status ON distributor_replicated_sites(sync_status);

-- Comments
COMMENT ON TABLE distributor_replicated_sites IS 'Tracks each distributor''s replicated sites on external platforms';
COMMENT ON COLUMN distributor_replicated_sites.external_site_id IS 'Platform''s unique ID for this replicated site';
COMMENT ON COLUMN distributor_replicated_sites.site_metadata IS 'Flexible JSONB field for platform-specific site data';
COMMENT ON COLUMN distributor_replicated_sites.created_via IS 'How the site was created: manual, auto (on signup), or import';

-- =============================================
-- 3. INTEGRATION PRODUCT MAPPINGS TABLE
-- Map external platform products to internal credits/commissions
-- =============================================

CREATE TABLE IF NOT EXISTS integration_product_mappings (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL, -- NULL if no direct mapping

  -- External product identification
  external_product_id TEXT NOT NULL, -- Platform's product ID
  external_product_name TEXT NOT NULL, -- Platform's product name
  external_product_sku TEXT, -- Platform's SKU (if applicable)

  -- Credit/Commission rules
  tech_credits DECIMAL(10, 2) DEFAULT 0,
  insurance_credits DECIMAL(10, 2) DEFAULT 0,
  direct_commission_percentage DECIMAL(5, 2) DEFAULT 0, -- 0-100
  override_commission_percentage DECIMAL(5, 2) DEFAULT 0, -- 0-100

  -- Fixed commission amounts (alternative to percentage)
  fixed_commission_amount DECIMAL(10, 2),

  -- Mapping configuration
  is_active BOOLEAN DEFAULT true,
  commission_type TEXT DEFAULT 'credits' CHECK (commission_type IN ('credits', 'percentage', 'fixed', 'none')),

  -- Metadata
  mapping_metadata JSONB DEFAULT '{}'::jsonb, -- Additional mapping rules
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(integration_id, external_product_id), -- One mapping per external product per platform
  CONSTRAINT valid_commission_percentages CHECK (
    direct_commission_percentage >= 0 AND direct_commission_percentage <= 100 AND
    override_commission_percentage >= 0 AND override_commission_percentage <= 100
  ),
  CONSTRAINT valid_credits CHECK (tech_credits >= 0 AND insurance_credits >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prod_mappings_integration ON integration_product_mappings(integration_id);
CREATE INDEX IF NOT EXISTS idx_prod_mappings_product ON integration_product_mappings(product_id);
CREATE INDEX IF NOT EXISTS idx_prod_mappings_external_id ON integration_product_mappings(external_product_id);
CREATE INDEX IF NOT EXISTS idx_prod_mappings_active ON integration_product_mappings(is_active) WHERE is_active = true;

-- Comments
COMMENT ON TABLE integration_product_mappings IS 'Maps external platform products to internal credits and commissions';
COMMENT ON COLUMN integration_product_mappings.commission_type IS 'How to calculate commission: credits (BV), percentage, fixed amount, or none';
COMMENT ON COLUMN integration_product_mappings.mapping_metadata IS 'Additional rules for complex commission structures';

-- =============================================
-- 4. EXTERNAL SALES TABLE
-- Track sales received from external platforms
-- =============================================

CREATE TABLE IF NOT EXISTS external_sales (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE RESTRICT,
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE RESTRICT, -- Seller
  product_mapping_id UUID REFERENCES integration_product_mappings(id) ON DELETE SET NULL,
  replicated_site_id UUID REFERENCES distributor_replicated_sites(id) ON DELETE SET NULL,

  -- External platform identifiers
  external_sale_id TEXT NOT NULL, -- Platform's unique order/sale ID
  external_customer_id TEXT, -- Platform's customer ID
  external_product_id TEXT NOT NULL, -- Platform's product ID

  -- Sale details
  sale_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  quantity INTEGER DEFAULT 1,

  -- Commission calculated from mapping rules
  tech_credits_earned DECIMAL(10, 2) DEFAULT 0,
  insurance_credits_earned DECIMAL(10, 2) DEFAULT 0,
  commission_amount DECIMAL(10, 2) DEFAULT 0,
  commission_type TEXT, -- How commission was calculated

  -- Sale status
  sale_status TEXT DEFAULT 'completed' CHECK (sale_status IN ('pending', 'completed', 'refunded', 'canceled')),

  -- Timestamps
  sale_date TIMESTAMPTZ NOT NULL, -- When the sale occurred on external platform
  processed_at TIMESTAMPTZ DEFAULT NOW(), -- When we received and processed the webhook
  refunded_at TIMESTAMPTZ,

  -- Raw webhook data for audit trail
  webhook_payload JSONB, -- Full webhook payload for debugging

  -- Processing status
  commission_applied BOOLEAN DEFAULT false,
  commission_applied_at TIMESTAMPTZ,

  -- Metadata
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(integration_id, external_sale_id), -- Prevent duplicate processing of same sale
  CONSTRAINT valid_sale_amount CHECK (sale_amount >= 0),
  CONSTRAINT valid_quantity CHECK (quantity > 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ext_sales_integration ON external_sales(integration_id);
CREATE INDEX IF NOT EXISTS idx_ext_sales_distributor ON external_sales(distributor_id);
CREATE INDEX IF NOT EXISTS idx_ext_sales_external_id ON external_sales(external_sale_id);
CREATE INDEX IF NOT EXISTS idx_ext_sales_status ON external_sales(sale_status);
CREATE INDEX IF NOT EXISTS idx_ext_sales_date ON external_sales(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_ext_sales_commission_applied ON external_sales(commission_applied) WHERE commission_applied = false;
CREATE INDEX IF NOT EXISTS idx_ext_sales_replicated_site ON external_sales(replicated_site_id);

-- Comments
COMMENT ON TABLE external_sales IS 'Sales received from external platforms via webhooks';
COMMENT ON COLUMN external_sales.webhook_payload IS 'Full webhook payload stored for audit and debugging';
COMMENT ON COLUMN external_sales.commission_applied IS 'Whether credits/commission have been applied to distributor';
COMMENT ON COLUMN external_sales.sale_date IS 'When the sale occurred on the external platform';
COMMENT ON COLUMN external_sales.processed_at IS 'When we received and processed the webhook';

-- =============================================
-- 5. INTEGRATION WEBHOOK LOGS TABLE
-- Audit log for all webhook requests received
-- =============================================

CREATE TABLE IF NOT EXISTS integration_webhook_logs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  integration_id UUID REFERENCES integrations(id) ON DELETE SET NULL,
  external_sale_id UUID REFERENCES external_sales(id) ON DELETE SET NULL, -- If webhook created a sale

  -- Webhook details
  webhook_event_type TEXT NOT NULL, -- 'sale.created', 'sale.refunded', 'subscription.created', etc.
  webhook_source_ip TEXT,
  webhook_signature TEXT, -- Signature from webhook for verification
  signature_verified BOOLEAN DEFAULT false,

  -- Request data
  http_method TEXT DEFAULT 'POST',
  headers JSONB, -- Full HTTP headers
  payload JSONB NOT NULL, -- Full webhook payload

  -- Processing status
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'success', 'error', 'ignored')),
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,

  -- Error handling
  error_message TEXT,
  error_details JSONB,
  retry_count INTEGER DEFAULT 0,

  -- Response
  response_code INTEGER,
  response_body TEXT,

  -- Timestamps
  received_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_http_method CHECK (http_method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_webhook_logs_integration ON integration_webhook_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON integration_webhook_logs(webhook_event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON integration_webhook_logs(processing_status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_received ON integration_webhook_logs(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_signature_verified ON integration_webhook_logs(signature_verified);

-- Comments
COMMENT ON TABLE integration_webhook_logs IS 'Audit log for all webhook requests from external platforms';
COMMENT ON COLUMN integration_webhook_logs.payload IS 'Full webhook payload for debugging and reprocessing';
COMMENT ON COLUMN integration_webhook_logs.signature_verified IS 'Whether the webhook signature was valid';
COMMENT ON COLUMN integration_webhook_logs.processing_status IS 'pending, processing, success, error, or ignored';

-- =============================================
-- 6. AUTO-UPDATE TRIGGERS
-- =============================================

-- Update integrations updated_at
CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update distributor_replicated_sites updated_at
CREATE TRIGGER update_replicated_sites_updated_at
  BEFORE UPDATE ON distributor_replicated_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update integration_product_mappings updated_at
CREATE TRIGGER update_product_mappings_updated_at
  BEFORE UPDATE ON integration_product_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update external_sales updated_at
CREATE TRIGGER update_external_sales_updated_at
  BEFORE UPDATE ON external_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Integrations: Admin access only
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage integrations"
  ON integrations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM distributors WHERE auth_user_id = auth.uid() AND is_admin = true
    )
  );

-- Distributor Replicated Sites: Distributors can view their own, admins can view all
ALTER TABLE distributor_replicated_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Distributors can view own replicated sites"
  ON distributor_replicated_sites FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all replicated sites"
  ON distributor_replicated_sites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM distributors WHERE auth_user_id = auth.uid() AND is_admin = true
    )
  );

-- Product Mappings: Admin access only
ALTER TABLE integration_product_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage product mappings"
  ON integration_product_mappings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM distributors WHERE auth_user_id = auth.uid() AND is_admin = true
    )
  );

-- External Sales: Distributors can view their own, admins can view all
ALTER TABLE external_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Distributors can view own external sales"
  ON external_sales FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all external sales"
  ON external_sales FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM distributors WHERE auth_user_id = auth.uid() AND is_admin = true
    )
  );

-- Webhook Logs: Admin access only
ALTER TABLE integration_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook logs"
  ON integration_webhook_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM distributors WHERE auth_user_id = auth.uid() AND is_admin = true
    )
  );

-- =============================================
-- 8. SEED INITIAL INTEGRATIONS
-- =============================================

-- Insert Jordyn.app integration
INSERT INTO integrations (
  platform_name,
  display_name,
  api_endpoint,
  supports_replicated_sites,
  supports_sales_webhooks,
  supports_commission_tracking,
  auto_create_site_on_signup,
  is_enabled,
  notes
) VALUES (
  'jordyn',
  'Jordyn.app',
  'https://api.jordyn.app',
  true,
  true,
  true,
  false, -- Set to true when ready to auto-create
  false, -- Disabled by default until configured
  'AI-powered sales assistant platform'
) ON CONFLICT (platform_name) DO NOTHING;

-- Insert AgentPulse Cloud integration
INSERT INTO integrations (
  platform_name,
  display_name,
  api_endpoint,
  supports_replicated_sites,
  supports_sales_webhooks,
  supports_commission_tracking,
  auto_create_site_on_signup,
  is_enabled,
  notes
) VALUES (
  'agentpulse',
  'AgentPulse Cloud',
  'https://api.agentpulse.cloud',
  true,
  true,
  true,
  false, -- Set to true when ready to auto-create
  false, -- Disabled by default until configured
  'Insurance agent CRM and marketing platform'
) ON CONFLICT (platform_name) DO NOTHING;

-- =============================================
-- 9. HELPER FUNCTIONS
-- =============================================

-- Function: Get replicated site URL for distributor and platform
CREATE OR REPLACE FUNCTION get_replicated_site_url(
  p_distributor_id UUID,
  p_platform_name TEXT
)
RETURNS TEXT AS $$
DECLARE
  site_url TEXT;
BEGIN
  SELECT drs.site_url INTO site_url
  FROM distributor_replicated_sites drs
  JOIN integrations i ON drs.integration_id = i.id
  WHERE drs.distributor_id = p_distributor_id
    AND i.platform_name = p_platform_name
    AND drs.site_status = 'active';

  RETURN site_url;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_replicated_site_url IS 'Get active replicated site URL for a distributor on a specific platform';

-- Function: Check if distributor has replicated site on platform
CREATE OR REPLACE FUNCTION has_replicated_site(
  p_distributor_id UUID,
  p_platform_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM distributor_replicated_sites drs
    JOIN integrations i ON drs.integration_id = i.id
    WHERE drs.distributor_id = p_distributor_id
      AND i.platform_name = p_platform_name
      AND drs.site_status = 'active'
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION has_replicated_site IS 'Check if distributor has an active replicated site on a platform';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- Tables created:
--   - integrations
--   - distributor_replicated_sites
--   - integration_product_mappings
--   - external_sales
--   - integration_webhook_logs
--
-- Features:
--   - Platform configuration management
--   - Replicated site tracking per distributor
--   - Product mapping for commission calculation
--   - Sales webhook processing and audit logging
--   - Row-level security for all tables
--   - Helper functions for common queries
-- =============================================
