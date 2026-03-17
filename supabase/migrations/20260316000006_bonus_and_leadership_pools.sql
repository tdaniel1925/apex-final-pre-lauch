-- =============================================
-- MIGRATION: Bonus and Leadership Pool Tables
-- Date: 2026-03-16
-- Phase: 2 (Build New DB Schema)
-- Agent: 2D
-- =============================================
--
-- PURPOSE: Create bonus pool (3.5%) and leadership pool (1.5%) tables
--
-- TABLES CREATED:
-- 1. bonus_pool_ledger - Track 3.5% bonus pool accumulation and distribution
-- 2. leadership_shares - Track Elite members' leadership pool shares
-- 3. pool_distribution_history - Audit trail of pool payouts
--
-- =============================================

-- =============================================
-- TABLE: bonus_pool_ledger
-- =============================================
-- Purpose: Track 3.5% bonus pool accumulation per period

CREATE TABLE IF NOT EXISTS public.bonus_pool_ledger (
  -- Primary Key
  pool_entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_label TEXT NOT NULL, -- "2026-03" format

  -- Pool Accumulation
  total_sales_cents INTEGER NOT NULL DEFAULT 0, -- Total sales for period
  pool_percentage NUMERIC(5, 4) NOT NULL DEFAULT 0.0350, -- 3.5%
  pool_amount_cents INTEGER NOT NULL, -- total_sales × 3.5%

  -- Distribution
  distributed_amount_cents INTEGER DEFAULT 0, -- Amount paid out
  remaining_amount_cents INTEGER DEFAULT 0, -- Undistributed balance
  distribution_status TEXT NOT NULL DEFAULT 'accumulating' CHECK (distribution_status IN (
    'accumulating',  -- Still collecting sales
    'calculating',   -- Calculating shares
    'ready',         -- Ready to distribute
    'distributed',   -- Fully distributed
    'rolled_over'    -- Rolled to next period
  )),

  -- Qualified Members
  qualified_member_count INTEGER DEFAULT 0, -- Members who earned rank bonuses
  share_per_member_cents INTEGER DEFAULT 0, -- Equal share amount

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(period_label)
);

-- =============================================
-- TABLE: leadership_shares
-- =============================================
-- Purpose: Track Elite members' shares in 1.5% leadership pool

CREATE TABLE IF NOT EXISTS public.leadership_shares (
  -- Primary Key
  share_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_label TEXT NOT NULL, -- "2026-03" format

  -- Elite Member
  member_id UUID NOT NULL REFERENCES public.members(member_id) ON DELETE CASCADE,
  member_name TEXT NOT NULL, -- Snapshot for reporting

  -- Share Calculation
  personal_credits INTEGER NOT NULL, -- Personal production credits
  team_credits INTEGER NOT NULL, -- Team production credits
  share_percentage NUMERIC(8, 6) NOT NULL, -- % of total Elite production
  share_points INTEGER NOT NULL, -- Points for this member

  -- Pool Distribution
  total_pool_cents INTEGER NOT NULL, -- Total 1.5% pool for period
  member_payout_cents INTEGER NOT NULL, -- This member's share

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',    -- Calculated but not approved
    'approved',   -- Approved for payment
    'paid',       -- Payment sent
    'disputed'    -- Under dispute
  )),

  -- Payment Tracking
  paid_at TIMESTAMPTZ,
  earning_id UUID, -- Links to earnings_ledger entry

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(member_id, period_label)
);

-- =============================================
-- TABLE: pool_distribution_history
-- =============================================
-- Purpose: Audit trail of all pool distributions

CREATE TABLE IF NOT EXISTS public.pool_distribution_history (
  -- Primary Key
  distribution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Pool Info
  pool_type TEXT NOT NULL CHECK (pool_type IN ('bonus_pool', 'leadership_pool')),
  period_label TEXT NOT NULL,

  -- Distribution
  total_pool_cents INTEGER NOT NULL,
  distributed_cents INTEGER NOT NULL,
  recipient_count INTEGER NOT NULL,

  -- Run Info
  run_id UUID NOT NULL,
  run_date DATE NOT NULL,
  run_by UUID, -- Admin who triggered distribution

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Bonus pool queries
CREATE INDEX IF NOT EXISTS idx_bonus_pool_period ON public.bonus_pool_ledger(period_label);
CREATE INDEX IF NOT EXISTS idx_bonus_pool_status ON public.bonus_pool_ledger(distribution_status);

-- Leadership shares queries
CREATE INDEX IF NOT EXISTS idx_leadership_member ON public.leadership_shares(member_id);
CREATE INDEX IF NOT EXISTS idx_leadership_period ON public.leadership_shares(period_label);
CREATE INDEX IF NOT EXISTS idx_leadership_status ON public.leadership_shares(status);
CREATE INDEX IF NOT EXISTS idx_leadership_member_period ON public.leadership_shares(member_id, period_label);

-- Distribution history queries
CREATE INDEX IF NOT EXISTS idx_distribution_type ON public.pool_distribution_history(pool_type);
CREATE INDEX IF NOT EXISTS idx_distribution_period ON public.pool_distribution_history(period_label);
CREATE INDEX IF NOT EXISTS idx_distribution_run ON public.pool_distribution_history(run_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.bonus_pool_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadership_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_distribution_history ENABLE ROW LEVEL SECURITY;

-- Service role policies
CREATE POLICY service_all_bonus_pool ON public.bonus_pool_ledger FOR ALL TO service_role USING (true);
CREATE POLICY service_all_leadership ON public.leadership_shares FOR ALL TO service_role USING (true);
CREATE POLICY service_all_distribution ON public.pool_distribution_history FOR ALL TO service_role USING (true);

-- Members can view their own leadership shares
CREATE POLICY member_read_own_shares ON public.leadership_shares
  FOR SELECT
  TO authenticated
  USING (
    member_id IN (
      SELECT member_id FROM public.members WHERE distributor_id = auth.uid()
    )
  );

-- =============================================
-- TRIGGERS
-- =============================================

-- Update updated_at on bonus pool changes
CREATE OR REPLACE FUNCTION update_bonus_pool_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bonus_pool_updated_at
  BEFORE UPDATE ON public.bonus_pool_ledger
  FOR EACH ROW
  EXECUTE FUNCTION update_bonus_pool_updated_at();

-- Update updated_at on leadership shares changes
CREATE OR REPLACE FUNCTION update_leadership_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leadership_updated_at
  BEFORE UPDATE ON public.leadership_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_leadership_updated_at();

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE public.bonus_pool_ledger IS '3.5% bonus pool accumulation per period (shared among rank bonus earners)';
COMMENT ON TABLE public.leadership_shares IS '1.5% leadership pool shares for Elite members only';
COMMENT ON TABLE public.pool_distribution_history IS 'Audit trail of all bonus and leadership pool distributions';

COMMENT ON COLUMN public.bonus_pool_ledger.pool_percentage IS 'Always 3.5% (0.0350) of sales';
COMMENT ON COLUMN public.leadership_shares.share_percentage IS 'This Elite member''s % of total Elite production';
COMMENT ON COLUMN public.leadership_shares.share_points IS 'Points = personal_credits + team_credits';

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check bonus pool for current period:
-- SELECT period_label, pool_amount_cents/100.0 as pool_usd,
--        qualified_member_count, share_per_member_cents/100.0 as share_usd
-- FROM public.bonus_pool_ledger
-- WHERE period_label = TO_CHAR(CURRENT_DATE, 'YYYY-MM');

-- Check Elite leadership shares for current period:
-- SELECT member_name, share_percentage, member_payout_cents/100.0 as payout_usd
-- FROM public.leadership_shares
-- WHERE period_label = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
-- ORDER BY member_payout_cents DESC;

-- Pool distribution summary:
-- SELECT pool_type, COUNT(*) as distributions, SUM(distributed_cents)/100.0 as total_usd
-- FROM public.pool_distribution_history
-- GROUP BY pool_type;

-- =============================================
-- END OF MIGRATION
-- =============================================
