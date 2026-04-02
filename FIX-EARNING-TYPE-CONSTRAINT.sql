-- Fix earnings_ledger earning_type constraint to include seller_commission
-- Run each statement separately if needed

-- Step 1: Drop old constraint
ALTER TABLE earnings_ledger DROP CONSTRAINT IF EXISTS earnings_ledger_earning_type_check;

-- Step 2: Add new constraint with seller_commission
ALTER TABLE earnings_ledger ADD CONSTRAINT earnings_ledger_earning_type_check CHECK (earning_type IN ('seller_commission', 'override', 'rank_bonus', 'bonus_pool', 'leadership_pool', 'fast_start_bonus', 'generation_bonus', 'business_center'));
