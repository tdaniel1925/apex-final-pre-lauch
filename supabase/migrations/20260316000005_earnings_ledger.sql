-- =============================================
-- MIGRATION: Earnings Ledger
-- Date: 2026-03-16
-- Phase: 2 (Build New DB Schema)
-- Agent: 2C
-- =============================================
--
-- PURPOSE: Create earnings ledger for tracking all commission payments
--
-- TABLES CREATED:
-- 1. earnings_ledger - All commission/bonus/pool earnings with line-item detail
--
-- =============================================

-- =============================================
-- TABLE: earnings_ledger
-- =============================================
-- Purpose: Track all commission payments (overrides, bonuses, pools)
-- Replaces: Old commissions_* tables from v1

CREATE TABLE IF NOT EXISTS public.earnings_ledger (
  -- Primary Key
  earning_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Commission Run Tracking
  run_id UUID NOT NULL, -- Links to commission run
  run_date DATE NOT NULL, -- Date of commission run
  pay_period_start DATE NOT NULL, -- Period this earning covers
  pay_period_end DATE NOT NULL,

  -- Member
  member_id UUID NOT NULL REFERENCES public.members(member_id) ON DELETE CASCADE,
  member_name TEXT NOT NULL, -- Snapshot for reporting

  -- Earnings Type
  earning_type TEXT NOT NULL CHECK (earning_type IN (
    'override',            -- Standard override commissions
    'rank_bonus',          -- One-time rank advancement bonus
    'bonus_pool',          -- Monthly bonus pool share (3.5%)
    'leadership_pool',     -- Monthly leadership pool share (1.5%)
    'fast_start_bonus',    -- Fast Start bonus
    'generation_bonus',    -- Generation bonus
    'business_center'      -- Business Center fixed payment
  )),

  -- Source Information
  source_member_id UUID REFERENCES public.members(member_id) ON DELETE SET NULL,
  source_member_name TEXT, -- Who generated the sale
  source_order_id UUID, -- Order that triggered earning (if applicable)
  source_product_name TEXT, -- Product name snapshot

  -- Override Details (for override type)
  override_level INTEGER, -- L1, L2, L3, L4, L5
  override_percentage NUMERIC(5, 2), -- 30%, 20%, 15%, 10%, 10%

  -- Rank Information (snapshot at time of earning)
  member_tech_rank TEXT, -- Member's tech rank when earned
  member_insurance_rank TEXT, -- Member's insurance rank when earned

  -- Amount Details
  base_amount_cents INTEGER NOT NULL, -- Amount before any adjustments
  adjustment_cents INTEGER DEFAULT 0, -- Any adjustments (+ or -)
  final_amount_cents INTEGER NOT NULL, -- Final payout amount

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',           -- Calculated but not paid
    'approved',          -- Approved for payment
    'paid',              -- Payment sent
    'held',              -- Held for compliance
    'reversed',          -- Reversed/canceled
    'disputed'           -- Under dispute
  )),

  -- Payment Tracking
  paid_at TIMESTAMPTZ,
  payment_method TEXT, -- 'stripe', 'check', 'wire', etc.
  payment_reference TEXT, -- Stripe charge ID, check number, etc.

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Query earnings by member
CREATE INDEX IF NOT EXISTS idx_earnings_member ON public.earnings_ledger(member_id);

-- Query earnings by run
CREATE INDEX IF NOT EXISTS idx_earnings_run ON public.earnings_ledger(run_id);

-- Query earnings by type
CREATE INDEX IF NOT EXISTS idx_earnings_type ON public.earnings_ledger(earning_type);

-- Query earnings by status
CREATE INDEX IF NOT EXISTS idx_earnings_status ON public.earnings_ledger(status);

-- Query earnings by date range
CREATE INDEX IF NOT EXISTS idx_earnings_run_date ON public.earnings_ledger(run_date);
CREATE INDEX IF NOT EXISTS idx_earnings_period ON public.earnings_ledger(pay_period_start, pay_period_end);

-- Query earnings by source member (for downline reports)
CREATE INDEX IF NOT EXISTS idx_earnings_source ON public.earnings_ledger(source_member_id);

-- Composite index for member + period (common query)
CREATE INDEX IF NOT EXISTS idx_earnings_member_period ON public.earnings_ledger(member_id, pay_period_start, pay_period_end);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE public.earnings_ledger ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything (for commission runs)
CREATE POLICY service_all_earnings ON public.earnings_ledger
  FOR ALL
  TO service_role
  USING (true);

-- Policy: Members can read their own earnings
CREATE POLICY member_read_own_earnings ON public.earnings_ledger
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

-- Update updated_at on row change
CREATE OR REPLACE FUNCTION update_earnings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER earnings_updated_at
  BEFORE UPDATE ON public.earnings_ledger
  FOR EACH ROW
  EXECUTE FUNCTION update_earnings_updated_at();

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE public.earnings_ledger IS 'All commission and bonus earnings with line-item detail for dual-ladder system';
COMMENT ON COLUMN public.earnings_ledger.earning_type IS 'Type of earning: override, rank_bonus, bonus_pool, leadership_pool, fast_start_bonus, generation_bonus, business_center';
COMMENT ON COLUMN public.earnings_ledger.override_level IS 'For override type: L1 (30%), L2 (20%), L3 (15%), L4 (10%), L5 (10%)';
COMMENT ON COLUMN public.earnings_ledger.final_amount_cents IS 'Final payout amount (base + adjustments)';
COMMENT ON COLUMN public.earnings_ledger.run_id IS 'Links to commission run batch';

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Total earnings by member:
-- SELECT member_name, SUM(final_amount_cents)/100.0 as total_usd
-- FROM public.earnings_ledger
-- WHERE status IN ('pending', 'approved', 'paid')
-- GROUP BY member_id, member_name
-- ORDER BY total_usd DESC;

-- Earnings breakdown by type:
-- SELECT earning_type, COUNT(*) as count, SUM(final_amount_cents)/100.0 as total_usd
-- FROM public.earnings_ledger
-- WHERE run_date = CURRENT_DATE
-- GROUP BY earning_type;

-- Pending payments:
-- SELECT COUNT(*) as pending_count, SUM(final_amount_cents)/100.0 as pending_usd
-- FROM public.earnings_ledger
-- WHERE status = 'pending';

-- =============================================
-- END OF MIGRATION
-- =============================================
