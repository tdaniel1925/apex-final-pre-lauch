-- =============================================
-- ENSURE AGENTPULSE PRODUCTS EXIST
-- Migration: 20260326000004
-- Re-inserts AgentPulse products if they don't exist
-- =============================================

-- Ensure category exists
INSERT INTO product_categories (name, slug, description, display_order)
VALUES ('AgentPulse Suite', 'agentpulse', 'AI-powered CRM and automation tools for insurance agents', 1)
ON CONFLICT (slug) DO NOTHING;

-- Delete any existing products and re-insert
DELETE FROM products;

-- PulseMarket
INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
VALUES (
  'PulseMarket',
  'pulsemarket',
  'Marketing automation and lead generation for insurance agents',
  (SELECT id FROM product_categories WHERE slug = 'agentpulse'),
  7900,  -- $79 retail
  5900,  -- $59 member
  59,    -- BV
  TRUE,
  'monthly',
  TRUE,
  TRUE,
  1
);

-- PulseFlow
INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
VALUES (
  'PulseFlow',
  'pulseflow',
  'Workflow automation and client communication platform',
  (SELECT id FROM product_categories WHERE slug = 'agentpulse'),
  14900,  -- $149 retail
  12900,  -- $129 member
  129,    -- BV
  TRUE,
  'monthly',
  TRUE,
  TRUE,
  2
);

-- PulseDrive
INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
VALUES (
  'PulseDrive',
  'pulsedrive',
  'Sales pipeline and opportunity management',
  (SELECT id FROM product_categories WHERE slug = 'agentpulse'),
  29900,  -- $299 retail
  25900,  -- $259 member
  259,    -- BV
  TRUE,
  'monthly',
  TRUE,
  TRUE,
  3
);

-- PulseCommand
INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
VALUES (
  'PulseCommand',
  'pulsecommand',
  'Enterprise-grade agency management and analytics',
  (SELECT id FROM product_categories WHERE slug = 'agentpulse'),
  49900,  -- $499 retail
  42900,  -- $429 member
  429,    -- BV
  TRUE,
  'monthly',
  TRUE,
  TRUE,
  4
);

-- SmartLock
INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
VALUES (
  'SmartLock',
  'smartlock',
  'Data security and compliance monitoring',
  (SELECT id FROM product_categories WHERE slug = 'agentpulse'),
  9900,  -- $99 retail
  7900,  -- $79 member
  79,    -- BV
  TRUE,
  'monthly',
  TRUE,
  TRUE,
  5
);

-- BusinessCenter
INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
VALUES (
  'BusinessCenter',
  'businesscenter',
  'Replicated website and back office tools',
  (SELECT id FROM product_categories WHERE slug = 'agentpulse'),
  4000,  -- $40 retail
  3000,  -- $30 member
  30,    -- BV
  TRUE,
  'monthly',
  TRUE,
  TRUE,
  6
);
