-- Add 'seller_commission' to earnings_ledger earning_type constraint
-- Run this in Supabase SQL Editor

-- Drop the old constraint
ALTER TABLE earnings_ledger
DROP CONSTRAINT IF EXISTS earnings_ledger_earning_type_check;

-- Add new constraint with 'seller_commission' included
ALTER TABLE earnings_ledger
ADD CONSTRAINT earnings_ledger_earning_type_check
CHECK (earning_type IN (
  'seller_commission',   -- Seller's 60% commission (NEW)
  'override',            -- Standard override commissions
  'rank_bonus',          -- One-time rank advancement bonus
  'bonus_pool',          -- Monthly bonus pool share (3.5%)
  'leadership_pool',     -- Monthly leadership pool share (1.5%)
  'fast_start_bonus',    -- Fast Start bonus
  'generation_bonus',    -- Generation bonus
  'business_center'      -- Business Center fixed payment
));

-- Verify the constraint was updated
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'earnings_ledger_earning_type_check';
