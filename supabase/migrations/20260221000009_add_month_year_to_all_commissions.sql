-- =============================================
-- ADD month_year TO ALL EVENT-BASED COMMISSION TABLES
-- Ensures consistency across all commission types
-- =============================================
-- Migration: 20260221000009
-- Created: 2026-02-21
-- Fixes: Missing month_year columns in event-based commissions
-- =============================================

-- Add month_year column to fast start bonuses
ALTER TABLE commissions_fast_start
  ADD COLUMN IF NOT EXISTS month_year TEXT;

-- Add month_year column to customer milestone bonuses
ALTER TABLE commissions_customer_milestone
  ADD COLUMN IF NOT EXISTS month_year TEXT;

-- Add month_year column to customer retention bonuses
ALTER TABLE commissions_retention
  ADD COLUMN IF NOT EXISTS month_year TEXT;

-- Add month_year column to rank advancement bonuses
ALTER TABLE commissions_rank_advancement
  ADD COLUMN IF NOT EXISTS month_year TEXT;

-- Add month_year column to car bonuses
ALTER TABLE commissions_car
  ADD COLUMN IF NOT EXISTS month_year TEXT;

-- Add month_year column to vacation bonuses
ALTER TABLE commissions_vacation
  ADD COLUMN IF NOT EXISTS month_year TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_commissions_fast_start_month ON commissions_fast_start(month_year);
CREATE INDEX IF NOT EXISTS idx_commissions_customer_milestone_month ON commissions_customer_milestone(month_year);
CREATE INDEX IF NOT EXISTS idx_commissions_retention_month ON commissions_retention(month_year);
CREATE INDEX IF NOT EXISTS idx_commissions_rank_advancement_month ON commissions_rank_advancement(month_year);
CREATE INDEX IF NOT EXISTS idx_commissions_car_month ON commissions_car(month_year);
CREATE INDEX IF NOT EXISTS idx_commissions_vacation_month ON commissions_vacation(month_year);

COMMENT ON COLUMN commissions_fast_start.month_year IS
'Month when bonus was calculated (format: YYYY-MM)';

COMMENT ON COLUMN commissions_customer_milestone.month_year IS
'Month when bonus was calculated (format: YYYY-MM)';

COMMENT ON COLUMN commissions_retention.month_year IS
'Month when bonus was calculated (format: YYYY-MM)';

COMMENT ON COLUMN commissions_rank_advancement.month_year IS
'Month when bonus was calculated (format: YYYY-MM)';

COMMENT ON COLUMN commissions_car.month_year IS
'Month when bonus was calculated (format: YYYY-MM)';

COMMENT ON COLUMN commissions_vacation.month_year IS
'Month when bonus was calculated (format: YYYY-MM)';
