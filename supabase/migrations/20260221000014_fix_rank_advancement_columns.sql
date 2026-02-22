-- =============================================
-- FIX: commissions_rank_advancement Column Mismatch
-- Add from_rank and to_rank columns that the function expects
-- =============================================
-- Migration: 20260221000014
-- Created: 2026-02-22
-- Fixes: column "from_rank" does not exist
-- =============================================

-- Add from_rank and to_rank columns
ALTER TABLE commissions_rank_advancement
  ADD COLUMN IF NOT EXISTS from_rank TEXT,
  ADD COLUMN IF NOT EXISTS to_rank TEXT;

-- Update existing records to use rank_achieved as to_rank
UPDATE commissions_rank_advancement
SET to_rank = rank_achieved
WHERE to_rank IS NULL;

-- Make rank_achieved nullable since we now use from_rank/to_rank
ALTER TABLE commissions_rank_advancement
  ALTER COLUMN rank_achieved DROP NOT NULL;

-- Rename installments_total to match what function expects (installment_total)
-- Note: This might fail if data exists, but since we're in testing it should be fine
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commissions_rank_advancement'
    AND column_name = 'installments_total'
  ) THEN
    ALTER TABLE commissions_rank_advancement
    RENAME COLUMN installments_total TO installment_total;
  END IF;
END $$;

-- Comments
COMMENT ON COLUMN commissions_rank_advancement.from_rank IS
'The rank the distributor was promoted from';

COMMENT ON COLUMN commissions_rank_advancement.to_rank IS
'The rank the distributor was promoted to';
