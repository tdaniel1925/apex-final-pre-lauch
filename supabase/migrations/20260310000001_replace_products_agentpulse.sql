-- =============================================
-- REPLACE PRODUCTS WITH AGENTPULSE LINEUP
-- Migration: 20260310000001
-- Replaces old products with PulseMarket, PulseFlow, PulseDrive, PulseCommand, SmartLock, BusinessCenter
-- =============================================

-- Delete old products
DELETE FROM products;
DELETE FROM product_categories;

-- =============================================
-- 1. PRODUCT CATEGORIES
-- =============================================

INSERT INTO product_categories (name, slug, description, display_order) VALUES
('AgentPulse Suite', 'agentpulse', 'AI-powered CRM and automation tools for insurance agents', 1);

-- =============================================
-- 2. AGENTPULSE PRODUCTS
-- =============================================

-- PulseMarket (formerly PulseGuard)
INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
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
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'pulsemarket');

-- PulseFlow
INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
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
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'pulseflow');

-- PulseDrive
INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'PulseDrive',
  'pulsedrive',
  'Advanced sales pipeline and deal management system',
  (SELECT id FROM product_categories WHERE slug = 'agentpulse'),
  29900,  -- $299 retail
  21900,  -- $219 member
  219,    -- BV
  TRUE,
  'monthly',
  TRUE,
  TRUE,
  3
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'pulsedrive');

-- PulseCommand
INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'PulseCommand',
  'pulsecommand',
  'Enterprise-grade agency management and analytics platform',
  (SELECT id FROM product_categories WHERE slug = 'agentpulse'),
  49900,  -- $499 retail
  34900,  -- $349 member
  349,    -- BV
  TRUE,
  'monthly',
  TRUE,
  TRUE,
  4
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'pulsecommand');

-- SmartLock
INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'SmartLock',
  'smartlock',
  'Data security and compliance monitoring',
  (SELECT id FROM product_categories WHERE slug = 'agentpulse'),
  9900,   -- $99 retail
  9900,   -- $99 member
  99,     -- BV
  TRUE,
  'monthly',
  TRUE,
  TRUE,
  5
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'smartlock');

-- BusinessCenter
INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'BusinessCenter',
  'businesscenter',
  'Complete back office with replicated website and team management',
  (SELECT id FROM product_categories WHERE slug = 'agentpulse'),
  4000,  -- $40 retail
  3900,  -- $39 member
  39,    -- BV
  TRUE,
  'monthly',
  TRUE,
  TRUE,
  6
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'businesscenter');

-- =============================================
-- MIGRATION COMPLETE
-- 6 AgentPulse products ready
-- =============================================
