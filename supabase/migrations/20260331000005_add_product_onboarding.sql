-- =============================================
-- ADD PRODUCT ONBOARDING FEATURES
-- Migration: 20260331000005
-- Adds onboarding requirement fields to products
-- =============================================

-- Add onboarding columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS requires_onboarding BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_duration_minutes INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS onboarding_instructions TEXT;

-- Update existing products with onboarding requirements
UPDATE products
SET requires_onboarding = TRUE,
    onboarding_duration_minutes = 30
WHERE slug IN ('pulsemarket', 'pulseflow', 'pulsedrive', 'pulsecommand');

-- Update Business Center to not require onboarding
UPDATE products
SET requires_onboarding = FALSE
WHERE slug = 'businesscenter';

-- Add index for onboarding queries
CREATE INDEX IF NOT EXISTS idx_products_requires_onboarding
ON products(requires_onboarding);

-- Add comments
COMMENT ON COLUMN products.requires_onboarding IS 'Whether this product requires an onboarding session after purchase';
COMMENT ON COLUMN products.onboarding_duration_minutes IS 'Expected duration of onboarding session in minutes';
COMMENT ON COLUMN products.onboarding_instructions IS 'Special instructions or notes for the onboarding session';
