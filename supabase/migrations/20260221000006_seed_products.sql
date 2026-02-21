-- =============================================
-- SEED PRODUCTS
-- All 33 products from compensation plan
-- =============================================
-- Migration: 20260221000006
-- Created: 2026-02-21
-- =============================================

-- =============================================
-- AGENTPULSE INDIVIDUAL TOOLS (6 products)
-- =============================================

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'WarmLine',
  'warmline',
  'AI-powered warm calling system for insurance agents',
  (SELECT id FROM product_categories WHERE slug = 'agentpulse'),
  7900,  -- $79/mo
  5500,  -- $55/mo
  40,
  TRUE,
  'month',
  TRUE,
  TRUE,
  1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'warmline');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'LeadLoop',
  'leadloop',
  'Automated lead nurturing and follow-up system',
  (SELECT id FROM product_categories WHERE slug = 'agentpulse'),
  6900,  -- $69/mo
  4800,  -- $48/mo
  35,
  TRUE,
  'month',
  TRUE,
  TRUE,
  2
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'leadloop');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'PulseInsight',
  'pulseinsight',
  'Analytics and insights dashboard for agent performance',
  (SELECT id FROM product_categories WHERE slug = 'agentpulse'),
  5900,  -- $59/mo
  4100,  -- $41/mo
  30,
  TRUE,
  'month',
  TRUE,
  TRUE,
  3
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'pulseinsight');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'AgentPilot',
  'agentpilot',
  'AI co-pilot for insurance sales automation',
  (SELECT id FROM product_categories WHERE slug = 'agentpulse'),
  9900,  -- $99/mo
  6900,  -- $69/mo
  50,
  TRUE,
  'month',
  TRUE,
  TRUE,
  4
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'agentpilot');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'PulseFollow',
  'pulsefollow',
  'Automated follow-up sequences and reminders',
  (SELECT id FROM product_categories WHERE slug = 'agentpulse'),
  6900,  -- $69/mo
  4800,  -- $48/mo
  35,
  TRUE,
  'month',
  TRUE,
  TRUE,
  5
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'pulsefollow');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'PolicyPing',
  'policying',
  'Policy renewal reminders and retention tools',
  (SELECT id FROM product_categories WHERE slug = 'agentpulse'),
  4900,  -- $49/mo
  3400,  -- $34/mo
  25,
  TRUE,
  'month',
  TRUE,
  TRUE,
  6
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'policyping');

-- =============================================
-- AGENTPULSE BUNDLES (4 products)
-- =============================================

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'AgentPulse Starter Bundle',
  'agentpulse-starter',
  'Essential tools bundle for new agents (WarmLine + PulseInsight)',
  (SELECT id FROM product_categories WHERE slug = 'agentpulse'),
  11900,  -- $119/mo
  8300,   -- $83/mo
  60,
  TRUE,
  'month',
  TRUE,
  TRUE,
  11
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'agentpulse-starter');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'AgentPulse Pro Bundle',
  'agentpulse-pro',
  'Professional suite for growing agents (WarmLine + LeadLoop + PulseInsight)',
  (SELECT id FROM product_categories WHERE slug = 'agentpulse'),
  19900,  -- $199/mo
  13900,  -- $139/mo
  100,
  TRUE,
  'month',
  TRUE,
  TRUE,
  12
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'agentpulse-pro');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'AgentPulse Elite Bundle',
  'agentpulse-elite',
  'Complete suite for top producers (all 6 tools included)',
  (SELECT id FROM product_categories WHERE slug = 'agentpulse'),
  29900,  -- $299/mo
  20900,  -- $209/mo
  150,
  TRUE,
  'month',
  TRUE,
  TRUE,
  13
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'agentpulse-elite');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'AgentPulse Elite Annual',
  'agentpulse-elite-annual',
  'Complete suite annual plan (all 6 tools, 2 months free)',
  (SELECT id FROM product_categories WHERE slug = 'agentpulse'),
  299000,  -- $2,990/yr
  209000,  -- $2,090/yr
  150,     -- BV per month
  TRUE,
  'year',
  TRUE,
  TRUE,
  14
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'agentpulse-elite-annual');

-- =============================================
-- ESTATE PLANNING PRODUCTS (8 products)
-- =============================================

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Basic Will Template',
  'basic-will-template',
  'Simple will template with guided completion',
  (SELECT id FROM product_categories WHERE slug = 'estate-planning'),
  4900,  -- $49
  3400,  -- $34
  25,
  FALSE,
  NULL,
  TRUE,
  TRUE,
  21
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'basic-will-template');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Living Trust Package',
  'living-trust-package',
  'Revocable living trust documents and guidance',
  (SELECT id FROM product_categories WHERE slug = 'estate-planning'),
  14900,  -- $149
  10400,  -- $104
  75,
  FALSE,
  NULL,
  TRUE,
  TRUE,
  22
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'living-trust-package');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Power of Attorney Forms',
  'power-of-attorney',
  'Healthcare and financial POA documents',
  (SELECT id FROM product_categories WHERE slug = 'estate-planning'),
  6900,  -- $69
  4800,  -- $48
  35,
  FALSE,
  NULL,
  TRUE,
  TRUE,
  23
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'power-of-attorney');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Healthcare Directive Kit',
  'healthcare-directive',
  'Living will and advance healthcare directive',
  (SELECT id FROM product_categories WHERE slug = 'estate-planning'),
  5900,  -- $59
  4100,  -- $41
  30,
  FALSE,
  NULL,
  TRUE,
  TRUE,
  24
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'healthcare-directive');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Estate Planning Masterclass',
  'estate-planning-masterclass',
  '6-week online course on estate planning fundamentals',
  (SELECT id FROM product_categories WHERE slug = 'estate-planning'),
  29900,  -- $299
  20900,  -- $209
  150,
  FALSE,
  NULL,
  TRUE,
  TRUE,
  25
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'estate-planning-masterclass');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Family Trust Builder',
  'family-trust-builder',
  'Interactive trust creation tool with attorney review',
  (SELECT id FROM product_categories WHERE slug = 'estate-planning'),
  39900,  -- $399
  27900,  -- $279
  200,
  FALSE,
  NULL,
  TRUE,
  TRUE,
  26
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'family-trust-builder');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Asset Protection Toolkit',
  'asset-protection-toolkit',
  'Comprehensive asset protection strategies and documents',
  (SELECT id FROM product_categories WHERE slug = 'estate-planning'),
  49900,  -- $499
  34900,  -- $349
  250,
  FALSE,
  NULL,
  TRUE,
  TRUE,
  27
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'asset-protection-toolkit');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Complete Estate Plan',
  'complete-estate-plan',
  'Full estate planning package with all documents and support',
  (SELECT id FROM product_categories WHERE slug = 'estate-planning'),
  79900,  -- $799
  55900,  -- $559
  400,
  FALSE,
  NULL,
  TRUE,
  TRUE,
  28
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'complete-estate-plan');

-- =============================================
-- FINANCIAL EDUCATION COURSES (10 products)
-- =============================================

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Financial Literacy 101',
  'financial-literacy-101',
  'Introduction to personal finance fundamentals',
  (SELECT id FROM product_categories WHERE slug = 'financial-education'),
  9900,  -- $99
  6900,  -- $69
  50,
  FALSE,
  NULL,
  TRUE,
  TRUE,
  31
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'financial-literacy-101');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Budgeting Mastery',
  'budgeting-mastery',
  'Learn to create and maintain a bulletproof budget',
  (SELECT id FROM product_categories WHERE slug = 'financial-education'),
  7900,  -- $79
  5500,  -- $55
  40,
  FALSE,
  NULL,
  TRUE,
  TRUE,
  32
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'budgeting-mastery');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Debt Freedom Blueprint',
  'debt-freedom-blueprint',
  'Step-by-step system to eliminate debt strategically',
  (SELECT id FROM product_categories WHERE slug = 'financial-education'),
  14900,  -- $149
  10400,  -- $104
  75,
  FALSE,
  NULL,
  TRUE,
  TRUE,
  33
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'debt-freedom-blueprint');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Investing for Beginners',
  'investing-beginners',
  'Start your investment journey with confidence',
  (SELECT id FROM product_categories WHERE slug = 'financial-education'),
  19900,  -- $199
  13900,  -- $139
  100,
  FALSE,
  NULL,
  TRUE,
  TRUE,
  34
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'investing-beginners');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Retirement Planning Essentials',
  'retirement-planning',
  'Build a secure retirement plan that works',
  (SELECT id FROM product_categories WHERE slug = 'financial-education'),
  24900,  -- $249
  17400,  -- $174
  125,
  FALSE,
  NULL,
  TRUE,
  TRUE,
  35
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'retirement-planning');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Tax Optimization Strategies',
  'tax-optimization',
  'Legal strategies to minimize your tax burden',
  (SELECT id FROM product_categories WHERE slug = 'financial-education'),
  29900,  -- $299
  20900,  -- $209
  150,
  FALSE,
  NULL,
  TRUE,
  TRUE,
  36
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'tax-optimization');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Real Estate Investing Fundamentals',
  'real-estate-investing',
  'Build wealth through strategic real estate investment',
  (SELECT id FROM product_categories WHERE slug = 'financial-education'),
  39900,  -- $399
  27900,  -- $279
  200,
  FALSE,
  NULL,
  TRUE,
  TRUE,
  37
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'real-estate-investing');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Business Finance for Entrepreneurs',
  'business-finance',
  'Master business finance and grow your company',
  (SELECT id FROM product_categories WHERE slug = 'financial-education'),
  34900,  -- $349
  24400,  -- $244
  175,
  FALSE,
  NULL,
  TRUE,
  TRUE,
  38
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'business-finance');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Wealth Building Masterclass',
  'wealth-building',
  'Comprehensive wealth creation and preservation strategies',
  (SELECT id FROM product_categories WHERE slug = 'financial-education'),
  49900,  -- $499
  34900,  -- $349
  250,
  FALSE,
  NULL,
  TRUE,
  TRUE,
  39
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'wealth-building');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Financial Freedom Academy',
  'financial-freedom-academy',
  'Complete financial education program with lifetime access',
  (SELECT id FROM product_categories WHERE slug = 'financial-education'),
  99900,  -- $999
  69900,  -- $699
  500,
  FALSE,
  NULL,
  TRUE,
  TRUE,
  40
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'financial-freedom-academy');

-- =============================================
-- POWER BUNDLES (5 products)
-- =============================================

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Agent Starter Pack',
  'agent-starter-pack',
  'AgentPulse Starter + Basic Will + Financial Literacy 101',
  (SELECT id FROM product_categories WHERE slug = 'bundles'),
  13900,  -- $139/mo
  9700,   -- $97/mo
  70,
  TRUE,
  'month',
  TRUE,
  TRUE,
  51
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'agent-starter-pack');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Agent Growth Pack',
  'agent-growth-pack',
  'AgentPulse Pro + Living Trust + Investing for Beginners',
  (SELECT id FROM product_categories WHERE slug = 'bundles'),
  22900,  -- $229/mo
  16000,  -- $160/mo
  115,
  TRUE,
  'month',
  TRUE,
  TRUE,
  52
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'agent-growth-pack');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Agent Domination Pack',
  'agent-domination-pack',
  'AgentPulse Elite + Complete Estate Plan + Tax Optimization',
  (SELECT id FROM product_categories WHERE slug = 'bundles'),
  34900,  -- $349/mo
  24400,  -- $244/mo
  175,
  TRUE,
  'month',
  TRUE,
  TRUE,
  53
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'agent-domination-pack');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Education Power Bundle',
  'education-power-bundle',
  'All 10 financial education courses (one-time purchase)',
  (SELECT id FROM product_categories WHERE slug = 'bundles'),
  99900,  -- $999
  69900,  -- $699
  500,
  FALSE,
  NULL,
  TRUE,
  TRUE,
  54
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'education-power-bundle');

INSERT INTO products (name, slug, description, category_id, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, is_digital, is_active, display_order)
SELECT
  'Full Ecosystem Pass',
  'full-ecosystem-pass',
  'AgentPulse Elite + All Estate Planning + All Financial Education',
  (SELECT id FROM product_categories WHERE slug = 'bundles'),
  59900,  -- $599/mo
  41900,  -- $419/mo
  300,
  TRUE,
  'month',
  TRUE,
  TRUE,
  55
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'full-ecosystem-pass');

-- =============================================
-- MIGRATION COMPLETE
-- 33 products seeded
-- =============================================
