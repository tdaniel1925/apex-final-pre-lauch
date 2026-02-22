-- =============================================
-- ADD: month_year to commissions_retail
-- Retail commissions are paid weekly but need month_year for consistency
-- =============================================
-- Migration: 20260221000016
-- Created: 2026-02-22
-- Fixes: column commissions_retail.month_year does not exist
-- =============================================

ALTER TABLE commissions_retail
  ADD COLUMN IF NOT EXISTS month_year TEXT;

-- Populate month_year from week_ending for existing records
UPDATE commissions_retail
SET month_year = TO_CHAR(week_ending, 'YYYY-MM')
WHERE month_year IS NULL;

CREATE INDEX IF NOT EXISTS idx_commissions_retail_month ON commissions_retail(month_year);

COMMENT ON COLUMN commissions_retail.month_year IS
'Month when commission was calculated (format: YYYY-MM) - derived from week_ending';
