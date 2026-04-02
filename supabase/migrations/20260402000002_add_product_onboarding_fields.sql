-- =============================================
-- ADD PRODUCT ONBOARDING FIELDS
-- Add onboarding requirement and cal.com integration
-- =============================================
-- Migration: 20260402000002
-- Created: 2026-04-02
-- =============================================

-- Add onboarding fields to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS requires_onboarding BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_duration_minutes INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS onboarding_instructions TEXT;

-- Add comments
COMMENT ON COLUMN products.requires_onboarding IS 'If true, redirect to cal.com after purchase for onboarding';
COMMENT ON COLUMN products.onboarding_duration_minutes IS 'Duration of onboarding session in minutes';
COMMENT ON COLUMN products.onboarding_instructions IS 'Internal notes for onboarding team';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
