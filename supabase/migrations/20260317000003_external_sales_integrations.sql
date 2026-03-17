-- =============================================
-- EXTERNAL SALES INTEGRATIONS
-- Tables for tracking external platform sales (jordyn.app, agentpulse.cloud)
-- =============================================
-- Migration: 20260317000003
-- Created: 2026-03-17
-- =============================================

-- =============================================
-- TABLE: integration_platforms
-- =============================================
-- Purpose: Track external integration platforms

CREATE TABLE IF NOT EXISTS public.integration_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Platform identity
  platform_name TEXT NOT NULL UNIQUE, -- 'jordyn', 'agentpulse'
  platform_display_name TEXT NOT NULL, -- 'Jordyn.app', 'AgentPulse.cloud'
  platform_url TEXT NOT NULL,

  -- Webhook configuration
  webhook_secret TEXT NOT NULL, -- Secret for signature verification
  webhook_enabled BOOLEAN DEFAULT true,

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'testing')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.integration_platforms IS 'External platform integrations (jordyn.app, agentpulse.cloud)';

-- =============================================
-- TABLE: distributor_replicated_sites
-- =============================================
-- Purpose: Map distributor member_id to external platform user IDs

CREATE TABLE IF NOT EXISTS public.distributor_replicated_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Distributor relationship
  member_id UUID NOT NULL REFERENCES public.members(member_id) ON DELETE CASCADE,

  -- Platform relationship
  platform_id UUID NOT NULL REFERENCES public.integration_platforms(id) ON DELETE CASCADE,

  -- External platform user ID (used in webhook metadata)
  external_user_id TEXT NOT NULL, -- Platform's user ID for this distributor

  -- Site information
  replicated_site_url TEXT, -- e.g., https://johndoe.jordyn.app

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one site per member per platform
  UNIQUE(member_id, platform_id),
  UNIQUE(platform_id, external_user_id)
);

CREATE INDEX idx_distributor_sites_member ON public.distributor_replicated_sites(member_id);
CREATE INDEX idx_distributor_sites_platform ON public.distributor_replicated_sites(platform_id);
CREATE INDEX idx_distributor_sites_external_user ON public.distributor_replicated_sites(external_user_id);

COMMENT ON TABLE public.distributor_replicated_sites IS 'Maps distributors to their external platform user IDs';
COMMENT ON COLUMN public.distributor_replicated_sites.external_user_id IS 'Platform-specific user ID sent in webhook metadata';

-- =============================================
-- TABLE: external_sales
-- =============================================
-- Purpose: Track all sales from external platforms

CREATE TABLE IF NOT EXISTS public.external_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Platform relationship
  platform_id UUID NOT NULL REFERENCES public.integration_platforms(id) ON DELETE RESTRICT,

  -- Distributor (who gets credit for this sale)
  member_id UUID NOT NULL REFERENCES public.members(member_id) ON DELETE RESTRICT,

  -- External order details
  external_order_id TEXT NOT NULL, -- Platform's order ID (for idempotency)
  external_customer_id TEXT, -- Platform's customer ID
  external_product_id TEXT, -- Platform's product ID
  external_product_name TEXT NOT NULL,

  -- Sale details
  sale_amount_cents INTEGER NOT NULL, -- Total sale amount
  quantity INTEGER DEFAULT 1,
  currency TEXT DEFAULT 'USD',

  -- Credits earned (calculated from product mapping)
  tech_credits_earned INTEGER DEFAULT 0,
  insurance_credits_earned INTEGER DEFAULT 0,

  -- Commission calculation
  commission_amount_cents INTEGER DEFAULT 0, -- If direct commission
  commission_percentage NUMERIC(5, 2), -- e.g., 30.00 for 30%

  -- Sale metadata
  sale_date TIMESTAMPTZ NOT NULL,
  customer_email TEXT,
  customer_name TEXT,

  -- Processing status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Received webhook, not processed
    'processed',    -- Credits/earnings created
    'failed',       -- Processing failed
    'duplicate'     -- Duplicate event (already processed)
  )),

  -- Processing details
  processed_at TIMESTAMPTZ,
  processing_error TEXT,

  -- Webhook metadata (raw payload for debugging)
  webhook_payload JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: prevent duplicate orders
  UNIQUE(platform_id, external_order_id)
);

CREATE INDEX idx_external_sales_member ON public.external_sales(member_id);
CREATE INDEX idx_external_sales_platform ON public.external_sales(platform_id);
CREATE INDEX idx_external_sales_external_order ON public.external_sales(external_order_id);
CREATE INDEX idx_external_sales_status ON public.external_sales(status);
CREATE INDEX idx_external_sales_sale_date ON public.external_sales(sale_date);

COMMENT ON TABLE public.external_sales IS 'All sales from external platforms (jordyn.app, agentpulse.cloud)';
COMMENT ON COLUMN public.external_sales.external_order_id IS 'Platform order ID - ensures idempotency';
COMMENT ON COLUMN public.external_sales.tech_credits_earned IS 'Tech ladder credits earned from this sale';
COMMENT ON COLUMN public.external_sales.insurance_credits_earned IS 'Insurance ladder credits earned from this sale';

-- =============================================
-- TABLE: integration_webhook_logs
-- =============================================
-- Purpose: Log all webhook events for debugging/auditing

CREATE TABLE IF NOT EXISTS public.integration_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Platform relationship
  platform_id UUID REFERENCES public.integration_platforms(id) ON DELETE SET NULL,

  -- Event details
  event_type TEXT NOT NULL, -- 'sale.completed', 'sale.refunded', etc.
  event_id TEXT, -- Platform's event ID (if provided)

  -- Request details
  request_method TEXT NOT NULL DEFAULT 'POST',
  request_headers JSONB,
  request_body TEXT, -- Raw body for signature verification
  request_ip TEXT,

  -- Signature verification
  signature_header TEXT,
  signature_verified BOOLEAN,

  -- Processing
  status TEXT NOT NULL CHECK (status IN ('received', 'processed', 'failed', 'rejected')),
  processing_duration_ms INTEGER, -- How long it took to process
  error_message TEXT,

  -- Result
  external_sale_id UUID REFERENCES public.external_sales(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_platform ON public.integration_webhook_logs(platform_id);
CREATE INDEX idx_webhook_logs_event_type ON public.integration_webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_status ON public.integration_webhook_logs(status);
CREATE INDEX idx_webhook_logs_created_at ON public.integration_webhook_logs(created_at);

COMMENT ON TABLE public.integration_webhook_logs IS 'Audit log of all webhook events received';

-- =============================================
-- TABLE: external_product_mappings
-- =============================================
-- Purpose: Map external platform products to our credit system

CREATE TABLE IF NOT EXISTS public.external_product_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Platform relationship
  platform_id UUID NOT NULL REFERENCES public.integration_platforms(id) ON DELETE CASCADE,

  -- External product identity
  external_product_id TEXT NOT NULL,
  external_product_name TEXT NOT NULL,
  external_product_sku TEXT,

  -- Credit mapping
  tech_credits INTEGER DEFAULT 0, -- Tech ladder credits for this product
  insurance_credits INTEGER DEFAULT 0, -- Insurance ladder credits for this product

  -- Commission mapping (if applicable)
  commission_percentage NUMERIC(5, 2), -- e.g., 30.00 for 30%
  fixed_commission_cents INTEGER, -- Or fixed amount

  -- Product category
  category TEXT, -- 'tech', 'insurance', 'both', 'other'

  -- Status
  active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(platform_id, external_product_id)
);

CREATE INDEX idx_product_mappings_platform ON public.external_product_mappings(platform_id);
CREATE INDEX idx_product_mappings_external_product ON public.external_product_mappings(external_product_id);

COMMENT ON TABLE public.external_product_mappings IS 'Maps external products to our credit/commission system';

-- =============================================
-- AUTO-UPDATE TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_integration_platforms_updated_at
  BEFORE UPDATE ON public.integration_platforms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_distributor_sites_updated_at
  BEFORE UPDATE ON public.distributor_replicated_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_external_sales_updated_at
  BEFORE UPDATE ON public.external_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_mappings_updated_at
  BEFORE UPDATE ON public.external_product_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.integration_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributor_replicated_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_product_mappings ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for webhooks)
CREATE POLICY service_all_integration_platforms ON public.integration_platforms FOR ALL TO service_role USING (true);
CREATE POLICY service_all_distributor_sites ON public.distributor_replicated_sites FOR ALL TO service_role USING (true);
CREATE POLICY service_all_external_sales ON public.external_sales FOR ALL TO service_role USING (true);
CREATE POLICY service_all_webhook_logs ON public.integration_webhook_logs FOR ALL TO service_role USING (true);
CREATE POLICY service_all_product_mappings ON public.external_product_mappings FOR ALL TO service_role USING (true);

-- Members can view their own replicated sites
CREATE POLICY member_read_own_sites ON public.distributor_replicated_sites
  FOR SELECT
  TO authenticated
  USING (member_id IN (SELECT member_id FROM public.members WHERE distributor_id = auth.uid()));

-- Members can view their own external sales
CREATE POLICY member_read_own_external_sales ON public.external_sales
  FOR SELECT
  TO authenticated
  USING (member_id IN (SELECT member_id FROM public.members WHERE distributor_id = auth.uid()));

-- =============================================
-- SEED DATA: Integration Platforms
-- =============================================

INSERT INTO public.integration_platforms (platform_name, platform_display_name, platform_url, webhook_secret, status)
VALUES
  ('jordyn', 'Jordyn.app', 'https://jordyn.app', 'CHANGE_ME_jordyn_webhook_secret_key', 'active'),
  ('agentpulse', 'AgentPulse.cloud', 'https://agentpulse.cloud', 'CHANGE_ME_agentpulse_webhook_secret_key', 'active')
ON CONFLICT (platform_name) DO NOTHING;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- View all platforms:
-- SELECT * FROM public.integration_platforms;

-- View external sales by member:
-- SELECT m.full_name, COUNT(es.*) as sale_count, SUM(es.sale_amount_cents)/100.0 as total_usd
-- FROM public.external_sales es
-- JOIN public.members m ON es.member_id = m.member_id
-- GROUP BY m.member_id, m.full_name;

-- View webhook logs (last 24 hours):
-- SELECT platform_id, event_type, status, created_at
-- FROM public.integration_webhook_logs
-- WHERE created_at > NOW() - INTERVAL '24 hours'
-- ORDER BY created_at DESC;

-- =============================================
-- END OF MIGRATION
-- =============================================
