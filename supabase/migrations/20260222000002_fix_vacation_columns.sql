-- =============================================
-- FIX: commissions_vacation and commissions_car Columns
-- Functions don't provide all required fields or use different names
-- =============================================
-- Migration: 20260222000002
-- Created: 2026-02-22
-- Fixes: Column mismatches in vacation and car bonuses
-- =============================================

-- Fix vacation table
ALTER TABLE commissions_vacation
  ALTER COLUMN vacation_tier DROP NOT NULL,
  ALTER COLUMN rank_achieved DROP NOT NULL;

-- Fix car table - add columns function expects
ALTER TABLE commissions_car
  ADD COLUMN IF NOT EXISTS rank_at_calculation TEXT,
  ADD COLUMN IF NOT EXISTS gbv_at_calculation INTEGER,
  ADD COLUMN IF NOT EXISTS organization_number INTEGER DEFAULT 1;

-- Make original columns nullable since function uses different names
ALTER TABLE commissions_car
  ALTER COLUMN rank_at_qualification DROP NOT NULL,
  ALTER COLUMN gbv_at_qualification DROP NOT NULL;

-- Comments
COMMENT ON COLUMN commissions_vacation.vacation_tier IS
'Vacation tier level - optional, calculated from rank';

COMMENT ON COLUMN commissions_vacation.rank_achieved IS
'Rank that qualified for vacation bonus - optional';

COMMENT ON COLUMN commissions_car.rank_at_calculation IS
'Rank at time of car bonus calculation';

COMMENT ON COLUMN commissions_car.gbv_at_calculation IS
'GBV at time of car bonus calculation';
