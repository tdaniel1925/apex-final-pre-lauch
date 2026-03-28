-- =============================================
-- Add stripe_session_id to orders
-- Migration: 20260326000003
-- Allows booking lookup by Stripe checkout session
-- =============================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);

-- Comment
COMMENT ON COLUMN orders.stripe_session_id IS 'Stripe Checkout Session ID - used for booking lookups after checkout';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
