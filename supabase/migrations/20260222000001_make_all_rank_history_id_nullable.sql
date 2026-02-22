-- =============================================
-- FIX: Make rank_history_id nullable on all tables
-- Functions don't provide rank_history_id when inserting
-- =============================================
-- Migration: 20260222000001
-- Created: 2026-02-22
-- Fixes: null value in rank_history_id violates not-null constraint
-- =============================================

-- Make rank_history_id nullable on tables that have it
DO $$
BEGIN
  -- Check and modify commissions_vacation
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commissions_vacation'
    AND column_name = 'rank_history_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE commissions_vacation ALTER COLUMN rank_history_id DROP NOT NULL;
  END IF;

  -- Check and modify commissions_car
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commissions_car'
    AND column_name = 'rank_history_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE commissions_car ALTER COLUMN rank_history_id DROP NOT NULL;
  END IF;
END $$;

-- Add comments if columns exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'commissions_vacation' AND column_name = 'rank_history_id') THEN
    COMMENT ON COLUMN commissions_vacation.rank_history_id IS 'Optional reference to rank_history table';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'commissions_car' AND column_name = 'rank_history_id') THEN
    COMMENT ON COLUMN commissions_car.rank_history_id IS 'Optional reference to rank_history table';
  END IF;
END $$;
