-- ============================================================
-- Migration 015: Business Card Orders
-- Tracks rep business card orders placed via Printful
-- ============================================================

CREATE TABLE IF NOT EXISTS business_card_orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Order details
  quantity      INTEGER NOT NULL,
  name_on_card  TEXT NOT NULL,
  title_on_card TEXT NOT NULL,
  phone_on_card TEXT NOT NULL,
  email_on_card TEXT NOT NULL,
  website_on_card TEXT,

  -- Shipping address
  ship_to_name  TEXT NOT NULL,
  ship_address1 TEXT NOT NULL,
  ship_address2 TEXT,
  ship_city     TEXT NOT NULL,
  ship_state    TEXT NOT NULL,
  ship_zip      TEXT NOT NULL,

  -- Printful
  printful_order_id   TEXT,
  printful_order_status TEXT DEFAULT 'pending',

  -- Status
  status        TEXT NOT NULL DEFAULT 'submitted'
                  CHECK (status IN ('submitted','processing','shipped','delivered','cancelled')),
  notes         TEXT,

  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE business_card_orders ENABLE ROW LEVEL SECURITY;

-- Reps can see only their own orders
CREATE POLICY "reps_view_own_card_orders"
  ON business_card_orders FOR SELECT
  USING (
    distributor_id = (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid() LIMIT 1
    )
  );

-- Reps can insert their own orders
CREATE POLICY "reps_insert_own_card_orders"
  ON business_card_orders FOR INSERT
  WITH CHECK (
    distributor_id = (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid() LIMIT 1
    )
  );
