-- =====================================================
-- Migration: 5 Missing Dependency Connections
-- Date: 2026-03-11
-- Description: BV snapshots, Stripe sync, SO rank sync,
--              Promotion fund, Sponsor recalculation
-- =====================================================

-- =====================================================
-- FIX 1: BV SNAPSHOT MECHANISM
-- =====================================================

-- Table: bv_snapshots
-- Purpose: Freeze BV values at month end for commission runs
CREATE TABLE IF NOT EXISTS public.bv_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_id UUID NOT NULL REFERENCES public.distributors(id) ON DELETE CASCADE,
  snapshot_month TEXT NOT NULL, -- Format: YYYY-MM
  personal_bv NUMERIC(10, 2) NOT NULL DEFAULT 0,
  team_bv NUMERIC(10, 2) NOT NULL DEFAULT 0,
  org_bv NUMERIC(10, 2) NOT NULL DEFAULT 0,
  rank_at_snapshot TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rep_id, snapshot_month)
);

-- RLS Policies for bv_snapshots
ALTER TABLE public.bv_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reps can read own BV snapshots"
  ON public.bv_snapshots
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.distributors WHERE email = auth.email()
    )
    AND rep_id = auth.uid()
  );

CREATE POLICY "Admin and CFO can read all BV snapshots"
  ON public.bv_snapshots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors
      WHERE id = auth.uid()
      AND role IN ('admin', 'cfo')
    )
  );

CREATE POLICY "System can insert BV snapshots"
  ON public.bv_snapshots
  FOR INSERT
  WITH CHECK (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_bv_snapshots_rep_month ON public.bv_snapshots(rep_id, snapshot_month);
CREATE INDEX IF NOT EXISTS idx_bv_snapshots_month ON public.bv_snapshots(snapshot_month);

-- =====================================================
-- FIX 2: STRIPE PRICE SYNC WARNING
-- =====================================================

-- Add price_sync_status column to products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS price_sync_status TEXT DEFAULT 'synced' CHECK (price_sync_status IN ('synced', 'mismatch', 'pending_manual'));

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS stripe_last_checked_at TIMESTAMPTZ;

-- =====================================================
-- FIX 3: SMART OFFICE RANK SYNC FLAGS
-- =====================================================

-- Add Smart Office tracking columns to rank_upgrade_requests
ALTER TABLE public.rank_upgrade_requests
ADD COLUMN IF NOT EXISTS smart_office_updated BOOLEAN DEFAULT false;

ALTER TABLE public.rank_upgrade_requests
ADD COLUMN IF NOT EXISTS smart_office_updated_at TIMESTAMPTZ;

ALTER TABLE public.rank_upgrade_requests
ADD COLUMN IF NOT EXISTS smart_office_updated_by UUID REFERENCES public.distributors(id);

ALTER TABLE public.rank_upgrade_requests
ADD COLUMN IF NOT EXISTS carrier_contracts_updated BOOLEAN DEFAULT false;

ALTER TABLE public.rank_upgrade_requests
ADD COLUMN IF NOT EXISTS carrier_contracts_updated_at TIMESTAMPTZ;

ALTER TABLE public.rank_upgrade_requests
ADD COLUMN IF NOT EXISTS notes TEXT;

-- =====================================================
-- FIX 4: PROMOTION FUND LEDGER
-- =====================================================

-- Table: promotion_fund_ledger
-- Purpose: Track $5 from every Business Center sale for promotion bonuses
CREATE TABLE IF NOT EXISTS public.promotion_fund_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  amount NUMERIC(10, 2) NOT NULL,
  source_rep_id UUID REFERENCES public.distributors(id) ON DELETE SET NULL,
  source_order_id TEXT,
  bonus_type TEXT, -- For debits: 'silver_builder', 'gold_builder', etc.
  recipient_rep_id UUID REFERENCES public.distributors(id) ON DELETE SET NULL,
  balance_after NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- RLS Policies for promotion_fund_ledger
ALTER TABLE public.promotion_fund_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and CFO can read promotion fund ledger"
  ON public.promotion_fund_ledger
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors
      WHERE id = auth.uid()
      AND role IN ('admin', 'cfo')
    )
  );

CREATE POLICY "System can insert into promotion fund ledger"
  ON public.promotion_fund_ledger
  FOR INSERT
  WITH CHECK (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_promotion_fund_created ON public.promotion_fund_ledger(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_promotion_fund_type ON public.promotion_fund_ledger(transaction_type);

-- Function to get current promotion fund balance
CREATE OR REPLACE FUNCTION public.get_promotion_fund_balance()
RETURNS NUMERIC AS $$
DECLARE
  current_balance NUMERIC;
BEGIN
  SELECT COALESCE(balance_after, 0) INTO current_balance
  FROM public.promotion_fund_ledger
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN COALESCE(current_balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIX 5: ORG BV CACHE & SPONSOR RECALCULATION
-- =====================================================

-- Table: org_bv_cache
-- Purpose: Cache BV calculations for instant display
CREATE TABLE IF NOT EXISTS public.org_bv_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_id UUID NOT NULL REFERENCES public.distributors(id) ON DELETE CASCADE,
  personal_bv NUMERIC(10, 2) NOT NULL DEFAULT 0,
  team_bv NUMERIC(10, 2) NOT NULL DEFAULT 0,
  org_bv NUMERIC(10, 2) NOT NULL DEFAULT 0,
  direct_count INTEGER NOT NULL DEFAULT 0,
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rep_id)
);

-- RLS Policies for org_bv_cache
ALTER TABLE public.org_bv_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reps can read own org BV cache"
  ON public.org_bv_cache
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.distributors WHERE email = auth.email()
    )
    AND rep_id = auth.uid()
  );

CREATE POLICY "Admin and CFO can read all org BV cache"
  ON public.org_bv_cache
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors
      WHERE id = auth.uid()
      AND role IN ('admin', 'cfo')
    )
  );

CREATE POLICY "System can upsert org BV cache"
  ON public.org_bv_cache
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_org_bv_cache_rep ON public.org_bv_cache(rep_id);

-- Function: recalculate_sponsor_chain
-- Purpose: Walk up sponsor chain and recalculate BV for all ancestors
CREATE OR REPLACE FUNCTION public.recalculate_sponsor_chain(new_rep_id UUID)
RETURNS VOID AS $$
DECLARE
  current_rep_id UUID;
  sponsor_id_var UUID;
  personal_bv_calc NUMERIC;
  team_bv_calc NUMERIC;
  org_bv_calc NUMERIC;
  direct_count_calc INTEGER;
BEGIN
  -- Start with the new rep's sponsor
  SELECT sponsor_id INTO sponsor_id_var
  FROM public.distributors
  WHERE id = new_rep_id;

  -- Walk up the sponsor chain
  WHILE sponsor_id_var IS NOT NULL LOOP
    current_rep_id := sponsor_id_var;

    -- Calculate personal BV (sum of this rep's sales in current month)
    SELECT COALESCE(SUM(bv), 0) INTO personal_bv_calc
    FROM public.orders
    WHERE buyer_id = current_rep_id
    AND status = 'completed'
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW())
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

    -- Calculate direct count
    SELECT COUNT(*) INTO direct_count_calc
    FROM public.distributors
    WHERE sponsor_id = current_rep_id
    AND status = 'active';

    -- Calculate team BV (sum of direct downline sales in current month)
    SELECT COALESCE(SUM(o.bv), 0) INTO team_bv_calc
    FROM public.orders o
    INNER JOIN public.distributors d ON o.buyer_id = d.id
    WHERE d.sponsor_id = current_rep_id
    AND o.status = 'completed'
    AND EXTRACT(MONTH FROM o.created_at) = EXTRACT(MONTH FROM NOW())
    AND EXTRACT(YEAR FROM o.created_at) = EXTRACT(YEAR FROM NOW());

    -- Calculate org BV (sum of all downline sales in current month - recursive)
    WITH RECURSIVE downline AS (
      SELECT id FROM public.distributors WHERE id = current_rep_id
      UNION ALL
      SELECT d.id FROM public.distributors d
      INNER JOIN downline ON d.sponsor_id = downline.id
    )
    SELECT COALESCE(SUM(o.bv), 0) INTO org_bv_calc
    FROM public.orders o
    WHERE o.buyer_id IN (SELECT id FROM downline WHERE id != current_rep_id)
    AND o.status = 'completed'
    AND EXTRACT(MONTH FROM o.created_at) = EXTRACT(MONTH FROM NOW())
    AND EXTRACT(YEAR FROM o.created_at) = EXTRACT(YEAR FROM NOW());

    -- Upsert to org_bv_cache
    INSERT INTO public.org_bv_cache (rep_id, personal_bv, team_bv, org_bv, direct_count, last_calculated_at)
    VALUES (current_rep_id, personal_bv_calc, team_bv_calc, org_bv_calc, direct_count_calc, NOW())
    ON CONFLICT (rep_id)
    DO UPDATE SET
      personal_bv = EXCLUDED.personal_bv,
      team_bv = EXCLUDED.team_bv,
      org_bv = EXCLUDED.org_bv,
      direct_count = EXCLUDED.direct_count,
      last_calculated_at = EXCLUDED.last_calculated_at;

    -- Move to next sponsor up the chain
    SELECT sponsor_id INTO sponsor_id_var
    FROM public.distributors
    WHERE id = current_rep_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: After new profile insert, recalculate sponsor chain
CREATE OR REPLACE FUNCTION public.trigger_recalculate_sponsor_chain()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.recalculate_sponsor_chain(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_distributor_insert
AFTER INSERT ON public.distributors
FOR EACH ROW
EXECUTE FUNCTION public.trigger_recalculate_sponsor_chain();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT SELECT ON public.bv_snapshots TO authenticated;
GRANT SELECT ON public.promotion_fund_ledger TO authenticated;
GRANT SELECT ON public.org_bv_cache TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_promotion_fund_balance() TO authenticated;
GRANT EXECUTE ON FUNCTION public.recalculate_sponsor_chain(UUID) TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.bv_snapshots IS 'Monthly BV snapshots for frozen commission run calculations';
COMMENT ON TABLE public.promotion_fund_ledger IS 'Tracks $5 from every Business Center sale for promotion bonuses';
COMMENT ON TABLE public.org_bv_cache IS 'Cached BV calculations for instant display and commission runs';
COMMENT ON FUNCTION public.recalculate_sponsor_chain(UUID) IS 'Recalculates BV for entire sponsor chain after new signup';
COMMENT ON FUNCTION public.get_promotion_fund_balance() IS 'Returns current promotion fund balance';
