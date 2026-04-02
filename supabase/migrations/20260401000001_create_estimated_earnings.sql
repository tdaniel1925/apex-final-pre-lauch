-- ===================================================================
-- PHASE 1: Real-Time Earnings Estimates
-- Create estimated_earnings table for real-time visibility
-- ===================================================================

-- 1. Create estimated_earnings table
CREATE TABLE IF NOT EXISTS estimated_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,

  -- Commission details
  run_month TEXT NOT NULL, -- Format: 'YYYY-MM'
  earning_type TEXT NOT NULL CHECK (
    earning_type IN ('seller_commission', 'override_l1', 'override_l2', 'override_l3', 'override_l4', 'override_l5', 'rank_bonus')
  ),
  override_level INTEGER, -- NULL for seller_commission, 1-5 for overrides
  estimated_amount_cents INTEGER NOT NULL,

  -- Snapshots at time of estimate (when transaction happened)
  snapshot_member_pv INTEGER NOT NULL,
  snapshot_member_gv INTEGER NOT NULL,
  snapshot_member_rank TEXT NOT NULL,
  snapshot_retail_pct DECIMAL(5,2), -- Percentage of PV from retail customers

  -- Current qualification status (updated daily at 2am)
  current_qualification_status TEXT DEFAULT 'pending' CHECK (
    current_qualification_status IN ('qualified', 'at_risk', 'disqualified', 'pending')
  ),

  -- Detailed qualification checks (JSON object)
  -- Example: {"pv_check": true, "retail_check": false, "rank_check": true}
  qualification_checks JSONB DEFAULT '{}'::jsonb,

  -- Array of reasons if disqualified or at risk
  -- Example: ["Below 50 PV minimum", "Retail % dropped to 65%"]
  disqualification_reasons TEXT[],

  -- Timestamps
  estimated_at TIMESTAMPTZ DEFAULT NOW(), -- When estimate was created
  last_checked_at TIMESTAMPTZ, -- Last time daily check ran
  validated_at TIMESTAMPTZ, -- When month-end validation completed

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one estimate per transaction/member/earning type/level
  UNIQUE(transaction_id, member_id, earning_type, override_level)
);

-- 2. Update earnings_ledger to support new statuses
ALTER TABLE earnings_ledger
DROP CONSTRAINT IF EXISTS earnings_ledger_status_check;

ALTER TABLE earnings_ledger
ADD CONSTRAINT earnings_ledger_status_check
CHECK (status IN ('pending', 'approved', 'paid', 'disqualified', 'clawed_back'));

-- 3. Add disqualification_reason to earnings_ledger
ALTER TABLE earnings_ledger
ADD COLUMN IF NOT EXISTS disqualification_reason TEXT;

-- 4. Add estimated_earning_id reference to track which estimate became official
ALTER TABLE earnings_ledger
ADD COLUMN IF NOT EXISTS estimated_earning_id UUID REFERENCES estimated_earnings(id);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_estimated_earnings_member_id
ON estimated_earnings(member_id);

CREATE INDEX IF NOT EXISTS idx_estimated_earnings_run_month
ON estimated_earnings(run_month);

CREATE INDEX IF NOT EXISTS idx_estimated_earnings_transaction_id
ON estimated_earnings(transaction_id);

CREATE INDEX IF NOT EXISTS idx_estimated_earnings_status
ON estimated_earnings(current_qualification_status);

CREATE INDEX IF NOT EXISTS idx_estimated_earnings_member_month
ON estimated_earnings(member_id, run_month);

-- 6. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_estimated_earnings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to auto-update updated_at
CREATE TRIGGER trigger_update_estimated_earnings_updated_at
BEFORE UPDATE ON estimated_earnings
FOR EACH ROW
EXECUTE FUNCTION update_estimated_earnings_updated_at();

-- 8. Add helpful comments
COMMENT ON TABLE estimated_earnings IS 'Real-time earnings estimates created immediately after each transaction. Updated daily at 2am for qualification status. Validated and moved to earnings_ledger at month end.';

COMMENT ON COLUMN estimated_earnings.current_qualification_status IS 'Updated daily at 2am. qualified = all checks passing, at_risk = close to failing, disqualified = failed checks, pending = first 24 hours before first check';

COMMENT ON COLUMN estimated_earnings.snapshot_retail_pct IS 'Retail % at time of estimate. Updated daily based on rolling 30-day calculation.';

COMMENT ON COLUMN estimated_earnings.qualification_checks IS 'JSON object with individual check results: pv_check, retail_check, rank_check';

-- 9. Grant permissions (adjust role name as needed)
-- GRANT SELECT, INSERT, UPDATE ON estimated_earnings TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON earnings_ledger TO authenticated;
