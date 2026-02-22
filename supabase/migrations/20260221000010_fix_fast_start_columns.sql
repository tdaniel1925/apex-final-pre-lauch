-- =============================================
-- FIX: commissions_fast_start Column Mismatch
-- Add columns that calculate_fast_start_bonuses() expects
-- =============================================
-- Migration: 20260221000010
-- Created: 2026-02-21
-- Fixes: column "enrollment_bonus_cents" does not exist
-- =============================================

-- Add missing columns that the function expects
ALTER TABLE commissions_fast_start
  ADD COLUMN IF NOT EXISTS enrollment_bonus_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gbv_bonus_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS customer_bonus_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rank_bonus_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_bonus_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS upline_bonus_from_distributor_id UUID REFERENCES distributors(id) ON DELETE SET NULL;

-- Make the original detailed columns optional since function doesn't use them
ALTER TABLE commissions_fast_start
  ALTER COLUMN category DROP NOT NULL,
  ALTER COLUMN achievement_description DROP NOT NULL,
  ALTER COLUMN bonus_amount_cents DROP NOT NULL,
  ALTER COLUMN enrollment_date DROP NOT NULL,
  ALTER COLUMN achievement_date DROP NOT NULL,
  ALTER COLUMN days_to_achieve DROP NOT NULL;

-- Create index for upline tracking
CREATE INDEX IF NOT EXISTS idx_commissions_fast_start_upline ON commissions_fast_start(upline_bonus_from_distributor_id);

COMMENT ON COLUMN commissions_fast_start.enrollment_bonus_cents IS
'Bonus for enrolling within first 30 days';

COMMENT ON COLUMN commissions_fast_start.gbv_bonus_cents IS
'Bonus for hitting GBV targets within first 30 days';

COMMENT ON COLUMN commissions_fast_start.customer_bonus_cents IS
'Bonus for customer acquisition within first 30 days';

COMMENT ON COLUMN commissions_fast_start.rank_bonus_cents IS
'Bonus for rank advancement within first 30 days';

COMMENT ON COLUMN commissions_fast_start.total_bonus_cents IS
'Sum of all fast start bonuses';

COMMENT ON COLUMN commissions_fast_start.upline_bonus_from_distributor_id IS
'Distributor ID who triggered the 10% upline bonus';
