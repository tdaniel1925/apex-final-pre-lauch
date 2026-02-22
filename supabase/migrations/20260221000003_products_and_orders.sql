-- =============================================
-- PRODUCTS & ORDERS SYSTEM - Complete Migration
-- E-commerce foundation for commission tracking
-- =============================================
-- Migration: 20260221000003
-- Created: 2026-02-21
-- =============================================

-- =============================================
-- 1. PRODUCT CATEGORIES
-- =============================================

CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial categories
INSERT INTO product_categories (name, slug, description, display_order) VALUES
('AgentPulse Suite', 'agentpulse', 'AI-powered tools for insurance agents', 1),
('Estate Planning', 'estate-planning', 'Digital wills, trusts, and legal documents', 2),
('Financial Education', 'education', 'Self-paced courses and membership content', 3),
('Power Bundles', 'bundles', 'Pre-packaged product combinations', 4);

-- =============================================
-- 2. PRODUCTS
-- =============================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE RESTRICT,

  -- Product info
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  long_description TEXT,

  -- Pricing
  retail_price_cents INTEGER NOT NULL CHECK (retail_price_cents > 0),
  wholesale_price_cents INTEGER NOT NULL CHECK (wholesale_price_cents > 0),
  bv INTEGER NOT NULL CHECK (bv >= 0), -- Business Volume for commissions

  -- Product type
  is_subscription BOOLEAN DEFAULT FALSE,
  subscription_interval TEXT CHECK (subscription_interval IN ('monthly', 'annual', 'quarterly')),
  subscription_interval_count INTEGER DEFAULT 1,

  -- Inventory (digital products, but track availability)
  is_digital BOOLEAN DEFAULT TRUE,
  stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock', 'discontinued')),

  -- Media
  image_url TEXT,
  thumbnail_url TEXT,

  -- SEO & Marketing
  meta_title TEXT,
  meta_description TEXT,
  features JSONB DEFAULT '[]', -- Array of feature strings

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_subscription CHECK (
    (is_subscription = FALSE) OR
    (is_subscription = TRUE AND subscription_interval IS NOT NULL)
  ),
  CONSTRAINT wholesale_less_than_retail CHECK (wholesale_price_cents < retail_price_cents)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_subscription ON products(is_subscription);

-- =============================================
-- 3. CUSTOMERS (Retail Customers, not distributors)
-- =============================================

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Customer info
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,

  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',

  -- Referral tracking
  referred_by_distributor_id UUID REFERENCES distributors(id) ON DELETE SET NULL,
  referred_by_affiliate_code TEXT,

  -- Stripe
  stripe_customer_id TEXT UNIQUE,

  -- Upgrade tracking (if they become a distributor)
  upgraded_to_distributor_id UUID REFERENCES distributors(id) ON DELETE SET NULL,
  upgraded_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  notes TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_stripe ON customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_referred_by ON customers(referred_by_distributor_id);
CREATE INDEX IF NOT EXISTS idx_customers_upgraded ON customers(upgraded_to_distributor_id);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active);

-- =============================================
-- 4. ORDERS
-- =============================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE, -- Human-readable order number

  -- Purchaser (either customer OR distributor, not both)
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  distributor_id UUID REFERENCES distributors(id) ON DELETE SET NULL,

  -- Order totals (in cents)
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  shipping_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,

  -- Commission tracking
  total_bv INTEGER NOT NULL DEFAULT 0, -- Sum of all order_items.bv_amount
  is_personal_purchase BOOLEAN DEFAULT FALSE, -- Distributor buying for themselves (counts as PBV)

  -- Payment
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  payment_method TEXT CHECK (payment_method IN ('card', 'ach', 'manual', 'comp')),
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partial_refund')),
  paid_at TIMESTAMPTZ,

  -- Fulfillment
  fulfillment_status TEXT DEFAULT 'pending'
    CHECK (fulfillment_status IN ('pending', 'processing', 'fulfilled', 'cancelled')),
  fulfilled_at TIMESTAMPTZ,

  -- Shipping (for physical items, if any)
  shipping_name TEXT,
  shipping_address_line1 TEXT,
  shipping_address_line2 TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT DEFAULT 'US',
  tracking_number TEXT,

  -- Metadata
  notes TEXT,
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT order_has_purchaser CHECK (
    (customer_id IS NOT NULL AND distributor_id IS NULL) OR
    (customer_id IS NULL AND distributor_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_distributor ON orders(distributor_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment ON orders(stripe_payment_intent_id);

-- =============================================
-- 5. ORDER ITEMS
-- =============================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,

  -- Pricing snapshot (at time of purchase)
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL,
  total_price_cents INTEGER NOT NULL,

  -- Commission tracking (snapshot BV at purchase time)
  bv_amount INTEGER NOT NULL, -- quantity × product.bv at purchase

  -- Subscription tracking (if this item is a subscription)
  subscription_id UUID, -- Links to subscriptions table

  -- Product snapshot (in case product details change later)
  product_name TEXT NOT NULL,
  product_description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_subscription ON order_items(subscription_id);

-- =============================================
-- 6. SUBSCRIPTIONS (Recurring Orders)
-- =============================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Subscriber (customer OR distributor)
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,

  -- Subscription details
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,

  -- Billing
  current_price_cents INTEGER NOT NULL, -- Can change over time
  interval TEXT NOT NULL CHECK (interval IN ('monthly', 'annual', 'quarterly')),
  interval_count INTEGER NOT NULL DEFAULT 1,

  -- Billing dates
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  next_billing_date TIMESTAMPTZ NOT NULL,

  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,

  -- Stripe
  stripe_subscription_id TEXT UNIQUE,

  -- Status
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'past_due', 'canceled', 'paused', 'trialing')),

  -- Counts
  billing_cycle_count INTEGER DEFAULT 0, -- How many times billed

  -- Metadata
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT subscription_has_subscriber CHECK (
    (customer_id IS NOT NULL AND distributor_id IS NULL) OR
    (customer_id IS NULL AND distributor_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_distributor ON subscriptions(distributor_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_product ON subscriptions(product_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- Link order_items to subscriptions
ALTER TABLE order_items
  ADD CONSTRAINT fk_order_items_subscription
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL;

-- =============================================
-- 7. BV TRACKING (Monthly Snapshots for Commission Calculations)
-- =============================================

CREATE TABLE IF NOT EXISTS bv_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Month being tracked
  month_year TEXT NOT NULL, -- Format: 'YYYY-MM'

  -- BV totals
  personal_bv INTEGER NOT NULL DEFAULT 0, -- PBV: distributor's own purchases
  group_bv INTEGER NOT NULL DEFAULT 0, -- GBV: entire downline

  -- Breakdown by source
  retail_orders_bv INTEGER DEFAULT 0, -- From retail customer orders
  personal_orders_bv INTEGER DEFAULT 0, -- From distributor's own orders
  team_orders_bv INTEGER DEFAULT 0, -- From downline orders

  -- Subscription tracking
  active_autoship_customers INTEGER DEFAULT 0,
  new_customers_this_month INTEGER DEFAULT 0,

  -- Status tracking
  is_active BOOLEAN DEFAULT FALSE, -- Met 50 PBV requirement
  is_locked BOOLEAN DEFAULT FALSE, -- Locked after commission run

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  locked_at TIMESTAMPTZ,

  UNIQUE(distributor_id, month_year)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bv_snapshots_distributor ON bv_snapshots(distributor_id);
CREATE INDEX IF NOT EXISTS idx_bv_snapshots_month ON bv_snapshots(month_year);
CREATE INDEX IF NOT EXISTS idx_bv_snapshots_locked ON bv_snapshots(is_locked);
CREATE INDEX IF NOT EXISTS idx_bv_snapshots_active ON bv_snapshots(is_active);

-- =============================================
-- 8. ORDER NUMBER GENERATION FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  order_num TEXT;
BEGIN
  -- Get next sequence number
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 6) AS INTEGER)), 0) + 1
  INTO next_num
  FROM orders
  WHERE order_number LIKE 'APEX-%';

  -- Format: APEX-000001
  order_num := 'APEX-' || LPAD(next_num::TEXT, 6, '0');

  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 9. TRIGGERS
-- =============================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate order number on insert
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- =============================================
-- 10. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_snapshots ENABLE ROW LEVEL SECURITY;

-- Products: Public read, admin write
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE auth_user_id = auth.uid()
    )
  );

-- Product Categories: Public read
CREATE POLICY "Anyone can view product categories"
  ON product_categories FOR SELECT
  USING (is_active = TRUE);

-- Customers: Distributors can view their referred customers
CREATE POLICY "Distributors can view their customers"
  ON customers FOR SELECT
  USING (
    referred_by_distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Orders: Users can view their own orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Distributors can view own orders"
  ON orders FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Order Items: Inherit from orders
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders
      WHERE customer_id IN (
        SELECT id FROM customers WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
      OR distributor_id IN (
        SELECT id FROM distributors WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Subscriptions: Users can view their own
CREATE POLICY "Customers can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Distributors can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- BV Snapshots: Distributors can view their own
CREATE POLICY "Distributors can view own BV snapshots"
  ON bv_snapshots FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- =============================================
-- 11. COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE products IS 'All products available for purchase (AgentPulse, Estate Planning, Education, Bundles)';
COMMENT ON TABLE product_categories IS 'Product categories (AgentPulse, Estate Planning, Education, Bundles)';
COMMENT ON TABLE customers IS 'Retail customers (not distributors) who purchase products';
COMMENT ON TABLE orders IS 'All orders placed by customers or distributors';
COMMENT ON TABLE order_items IS 'Individual line items within orders';
COMMENT ON TABLE subscriptions IS 'Recurring subscriptions for products (monthly/annual)';
COMMENT ON TABLE bv_snapshots IS 'Monthly BV totals per distributor for commission calculations';

COMMENT ON COLUMN products.bv IS 'Business Volume - used for commission calculations (1 BV = $1.00)';
COMMENT ON COLUMN products.is_subscription IS 'Whether this product is sold as a recurring subscription';
COMMENT ON COLUMN orders.is_personal_purchase IS 'If TRUE, distributor buying for themselves (counts as PBV)';
COMMENT ON COLUMN orders.total_bv IS 'Sum of all order_items.bv_amount - used for commission calculations';
COMMENT ON COLUMN bv_snapshots.is_active IS 'Whether distributor met 50 PBV minimum for this month';
COMMENT ON COLUMN bv_snapshots.is_locked IS 'Locked after monthly commission run (no more changes)';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
