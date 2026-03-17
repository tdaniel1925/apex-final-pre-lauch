-- =============================================
-- SERVICE SUBSCRIPTIONS SIMPLIFIED
-- Remove digital download complexity, focus on service access
-- =============================================
-- Migration: 20260317030001
-- Created: 2026-03-17
-- =============================================

-- Add service-specific fields to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS service_type TEXT, -- 'software', 'membership', 'training', 'tool'
  ADD COLUMN IF NOT EXISTS access_url TEXT, -- URL to access the service after purchase
  ADD COLUMN IF NOT EXISTS setup_instructions TEXT, -- How to get started with the service
  ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 0; -- Free trial period

COMMENT ON COLUMN products.service_type IS 'Type of service: software, membership, training, tool';
COMMENT ON COLUMN products.access_url IS 'URL where user accesses the service after subscribing';
COMMENT ON COLUMN products.setup_instructions IS 'Instructions for getting started with the service';
COMMENT ON COLUMN products.trial_days IS 'Number of free trial days (0 = no trial)';

-- =============================================
-- SERVICE ACCESS TRACKING
-- Track which reps have access to which services
-- =============================================

CREATE TABLE IF NOT EXISTS service_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Subscriber (distributor purchasing the service)
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,

  -- Access control
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'canceled', 'expired')),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL = never expires (for one-time purchases)

  -- Trial tracking
  is_trial BOOLEAN DEFAULT FALSE,
  trial_ends_at TIMESTAMPTZ,

  -- Usage tracking (optional)
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,

  -- Metadata
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One access record per distributor per product
  UNIQUE(distributor_id, product_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_access_distributor ON service_access(distributor_id);
CREATE INDEX IF NOT EXISTS idx_service_access_product ON service_access(product_id);
CREATE INDEX IF NOT EXISTS idx_service_access_subscription ON service_access(subscription_id);
CREATE INDEX IF NOT EXISTS idx_service_access_status ON service_access(status);
CREATE INDEX IF NOT EXISTS idx_service_access_expires ON service_access(expires_at);

-- Auto-update trigger
CREATE TRIGGER update_service_access_updated_at
  BEFORE UPDATE ON service_access
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- AUTO-GRANT SERVICE ACCESS ON SUBSCRIPTION
-- =============================================

CREATE OR REPLACE FUNCTION grant_service_access_on_subscription()
RETURNS TRIGGER AS $$
DECLARE
  product RECORD;
  expires_date TIMESTAMPTZ;
BEGIN
  -- Only grant access when subscription becomes active
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN

    -- Get product details
    SELECT * INTO product FROM products WHERE id = NEW.product_id;

    -- Calculate expiration based on subscription interval
    CASE NEW.interval
      WHEN 'monthly' THEN
        expires_date := NOW() + (NEW.interval_count || ' months')::INTERVAL;
      WHEN 'annual' THEN
        expires_date := NOW() + (NEW.interval_count || ' years')::INTERVAL;
      WHEN 'quarterly' THEN
        expires_date := NOW() + ((NEW.interval_count * 3) || ' months')::INTERVAL;
      ELSE
        expires_date := NOW() + '1 month'::INTERVAL;
    END CASE;

    -- Create or update service access
    INSERT INTO service_access (
      distributor_id,
      product_id,
      subscription_id,
      status,
      granted_at,
      expires_at,
      is_trial,
      trial_ends_at
    ) VALUES (
      NEW.distributor_id,
      NEW.product_id,
      NEW.id,
      'active',
      NOW(),
      expires_date,
      NEW.status = 'trialing',
      CASE WHEN NEW.status = 'trialing' THEN NEW.current_period_end ELSE NULL END
    )
    ON CONFLICT (distributor_id, product_id)
    DO UPDATE SET
      subscription_id = NEW.id,
      status = 'active',
      expires_at = expires_date,
      updated_at = NOW();

  -- Suspend access when subscription becomes past_due or canceled
  ELSIF NEW.status IN ('past_due', 'canceled', 'paused') AND OLD.status = 'active' THEN
    UPDATE service_access
    SET
      status = CASE
        WHEN NEW.status = 'canceled' THEN 'canceled'
        WHEN NEW.status = 'past_due' THEN 'suspended'
        ELSE 'suspended'
      END,
      updated_at = NOW()
    WHERE subscription_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER grant_access_on_subscription_change
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION grant_service_access_on_subscription();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE service_access ENABLE ROW LEVEL SECURITY;

-- Distributors can view their own service access
CREATE POLICY "Distributors can view own service access"
  ON service_access FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Admins can manage all service access
CREATE POLICY "Admins can manage service access"
  ON service_access FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE auth_user_id = auth.uid()
    )
  );

-- =============================================
-- HELPER FUNCTION: Check if rep has access to service
-- =============================================

CREATE OR REPLACE FUNCTION has_service_access(
  p_distributor_id UUID,
  p_product_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  access_record RECORD;
BEGIN
  SELECT * INTO access_record
  FROM service_access
  WHERE distributor_id = p_distributor_id
    AND product_id = p_product_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW());

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE service_access IS 'Tracks which reps have access to which service subscriptions';
COMMENT ON COLUMN service_access.expires_at IS 'When access expires (NULL = lifetime access)';
COMMENT ON COLUMN service_access.is_trial IS 'Whether this is a trial subscription';
COMMENT ON COLUMN service_access.status IS 'active, suspended, canceled, or expired';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
