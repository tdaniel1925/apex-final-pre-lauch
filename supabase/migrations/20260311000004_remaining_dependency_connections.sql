-- =====================================================
-- Migration: 10 Remaining Dependency Connections
-- Date: 2026-03-11
-- Description: Orders, webhooks, renewals, active rep,
--              check match sequencing, notifications,
--              snapshot gate, carry forward, termination,
--              promotion fund integrity
-- =====================================================

-- =====================================================
-- FIX 6: STRIPE WEBHOOK → ORDER RECORDING
-- =====================================================

-- Table: orders
-- Purpose: Record all purchases from Stripe webhooks
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_id UUID NOT NULL REFERENCES public.distributors(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('member', 'retail', 'business_center')),
  gross_amount_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'complete', 'refunded', 'chargeback', 'cancelled')),
  bv_credited BOOLEAN DEFAULT false,
  bv_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  commission_run_id UUID,
  promotion_fund_credited BOOLEAN DEFAULT false, -- FIX 15
  promotion_fund_credit_amount NUMERIC(10, 2) DEFAULT 0, -- FIX 15
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns if table already existed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='rep_id') THEN
    ALTER TABLE public.orders ADD COLUMN rep_id UUID REFERENCES public.distributors(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='bv_amount') THEN
    ALTER TABLE public.orders ADD COLUMN bv_amount NUMERIC(10, 2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='commission_run_id') THEN
    ALTER TABLE public.orders ADD COLUMN commission_run_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='promotion_fund_credited') THEN
    ALTER TABLE public.orders ADD COLUMN promotion_fund_credited BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='promotion_fund_credit_amount') THEN
    ALTER TABLE public.orders ADD COLUMN promotion_fund_credit_amount NUMERIC(10, 2) DEFAULT 0;
  END IF;
END $$;

-- RLS Policies for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reps can read own orders"
  ON public.orders
  FOR SELECT
  USING (
    rep_id IN (
      SELECT id FROM public.distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admin and CFO can read all orders"
  ON public.orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_distributors
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update orders"
  ON public.orders
  FOR UPDATE
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_rep_id ON public.orders(rep_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON public.orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_bv_credited ON public.orders(bv_credited) WHERE bv_credited = false;
CREATE INDEX IF NOT EXISTS idx_orders_promotion_fund ON public.orders(promotion_fund_credited) WHERE promotion_fund_credited = false;

-- =====================================================
-- FIX 7: CAB CLAWBACK MECHANISM
-- =====================================================

-- Table: cab_clawback_queue
-- Purpose: Track CAB bonuses eligible for clawback within 60-day window
CREATE TABLE IF NOT EXISTS public.cab_clawback_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_id UUID NOT NULL REFERENCES public.distributors(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  cab_amount NUMERIC(10, 2) NOT NULL,
  cancel_date TIMESTAMPTZ NOT NULL,
  clawback_eligible_until TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'clawback', 'cleared')),
  commission_run_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies for cab_clawback_queue
ALTER TABLE public.cab_clawback_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and CFO can read clawback queue"
  ON public.cab_clawback_queue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_distributors
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage clawback queue"
  ON public.cab_clawback_queue
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cab_clawback_rep ON public.cab_clawback_queue(rep_id);
CREATE INDEX IF NOT EXISTS idx_cab_clawback_status ON public.cab_clawback_queue(status);
CREATE INDEX IF NOT EXISTS idx_cab_clawback_eligible ON public.cab_clawback_queue(clawback_eligible_until);

-- =====================================================
-- FIX 8: RENEWAL RATE TRACKING
-- =====================================================

-- Table: subscription_renewals
-- Purpose: Track subscription renewals for Retention Bonus calculation
CREATE TABLE IF NOT EXISTS public.subscription_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_id UUID NOT NULL REFERENCES public.distributors(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  renewal_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('renewed', 'cancelled', 'failed')),
  stripe_invoice_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns if table already existed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscription_renewals' AND column_name='rep_id') THEN
    ALTER TABLE public.subscription_renewals ADD COLUMN rep_id UUID REFERENCES public.distributors(id) ON DELETE CASCADE;
  END IF;
END $$;

-- RLS Policies
ALTER TABLE public.subscription_renewals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reps can read own renewals"
  ON public.subscription_renewals
  FOR SELECT
  USING (
    rep_id IN (
      SELECT id FROM public.distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admin and CFO can read all renewals"
  ON public.subscription_renewals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_distributors
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert renewals"
  ON public.subscription_renewals
  FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_renewals_rep_date ON public.subscription_renewals(rep_id, renewal_date);
CREATE INDEX IF NOT EXISTS idx_renewals_status ON public.subscription_renewals(status);

-- Function: calculate_renewal_rate
-- Purpose: Calculate renewal rate for Retention Bonus eligibility
CREATE OR REPLACE FUNCTION public.calculate_renewal_rate(
  p_rep_id UUID,
  p_month TEXT -- Format: YYYY-MM
)
RETURNS NUMERIC AS $$
DECLARE
  renewals_due INTEGER;
  renewals_successful INTEGER;
  rate NUMERIC;
BEGIN
  -- Count renewals due in month
  SELECT COUNT(*) INTO renewals_due
  FROM public.subscription_renewals
  WHERE rep_id = p_rep_id
  AND TO_CHAR(renewal_date, 'YYYY-MM') = p_month;

  IF renewals_due = 0 THEN
    RETURN 0;
  END IF;

  -- Count successful renewals
  SELECT COUNT(*) INTO renewals_successful
  FROM public.subscription_renewals
  WHERE rep_id = p_rep_id
  AND TO_CHAR(renewal_date, 'YYYY-MM') = p_month
  AND status = 'renewed';

  rate := (renewals_successful::NUMERIC / renewals_due::NUMERIC) * 100;

  RETURN ROUND(rate, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIX 9: ACTIVE REP DEFINITION ENFORCEMENT
-- =====================================================

-- Function: is_rep_active
-- Purpose: Returns true if rep has $50+ personal BV in given month
CREATE OR REPLACE FUNCTION public.is_rep_active(
  p_rep_id UUID,
  p_month TEXT -- Format: YYYY-MM
)
RETURNS BOOLEAN AS $$
DECLARE
  personal_bv_value NUMERIC;
BEGIN
  -- Read from org_bv_cache for current month
  IF p_month = TO_CHAR(NOW(), 'YYYY-MM') THEN
    SELECT COALESCE(personal_bv, 0) INTO personal_bv_value
    FROM public.org_bv_cache
    WHERE rep_id = p_rep_id;
  ELSE
    -- Read from bv_snapshots for historical months
    SELECT COALESCE(personal_bv, 0) INTO personal_bv_value
    FROM public.bv_snapshots
    WHERE rep_id = p_rep_id
    AND snapshot_month = p_month;
  END IF;

  RETURN COALESCE(personal_bv_value, 0) >= 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIX 10: CHECK MATCH SEQUENCING
-- =====================================================

-- Table: commission_run_rep_totals
-- Purpose: Store per-rep commission breakdown for 7-phase run
CREATE TABLE IF NOT EXISTS public.commission_run_rep_totals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_run_id UUID NOT NULL,
  rep_id UUID NOT NULL REFERENCES public.distributors(id) ON DELETE CASCADE,
  seller_commission NUMERIC(10, 2) DEFAULT 0,
  override_earned NUMERIC(10, 2) DEFAULT 0,
  bonuses_earned NUMERIC(10, 2) DEFAULT 0,
  subtotal NUMERIC(10, 2) DEFAULT 0, -- Before check match
  check_match_earned NUMERIC(10, 2) DEFAULT 0,
  total_payout NUMERIC(10, 2) DEFAULT 0,
  carry_forward_in NUMERIC(10, 2) DEFAULT 0, -- FIX 13
  carry_forward_out NUMERIC(10, 2) DEFAULT 0, -- FIX 13
  final_payout NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(commission_run_id, rep_id)
);

-- Add missing columns if table already existed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commission_run_rep_totals' AND column_name='rep_id') THEN
    ALTER TABLE public.commission_run_rep_totals ADD COLUMN rep_id UUID REFERENCES public.distributors(id) ON DELETE CASCADE;
  END IF;
END $$;

-- RLS Policies
ALTER TABLE public.commission_run_rep_totals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reps can read own commission totals"
  ON public.commission_run_rep_totals
  FOR SELECT
  USING (
    rep_id IN (
      SELECT id FROM public.distributors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admin and CFO can read all commission totals"
  ON public.commission_run_rep_totals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_distributors
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage commission totals"
  ON public.commission_run_rep_totals
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comm_totals_run ON public.commission_run_rep_totals(commission_run_id);
CREATE INDEX IF NOT EXISTS idx_comm_totals_rep ON public.commission_run_rep_totals(rep_id);

-- =====================================================
-- FIX 12: BV SNAPSHOT → COMMISSION RUN SEQUENCING GATE
-- =====================================================

-- Table: bv_snapshot_runs
-- Purpose: Track BV snapshot run status for gate checking
CREATE TABLE IF NOT EXISTS public.bv_snapshot_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_month TEXT NOT NULL UNIQUE, -- Format: YYYY-MM
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'complete', 'failed')),
  rep_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- RLS Policies
ALTER TABLE public.bv_snapshot_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and CFO can read snapshot runs"
  ON public.bv_snapshot_runs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_distributors
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage snapshot runs"
  ON public.bv_snapshot_runs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_snapshot_runs_month ON public.bv_snapshot_runs(snapshot_month);
CREATE INDEX IF NOT EXISTS idx_snapshot_runs_status ON public.bv_snapshot_runs(status);

-- Add columns to commission_runs for gate tracking
ALTER TABLE public.commission_runs
ADD COLUMN IF NOT EXISTS snapshot_id UUID REFERENCES public.bv_snapshot_runs(id);

ALTER TABLE public.commission_runs
ADD COLUMN IF NOT EXISTS snapshot_verified BOOLEAN DEFAULT false;

-- =====================================================
-- FIX 13: CARRY FORWARD AUTOMATION
-- =====================================================

-- Function: get_carry_forward
-- Purpose: Get carry forward amount from prior commission run
CREATE OR REPLACE FUNCTION public.get_carry_forward(
  p_rep_id UUID,
  p_run_month TEXT -- Format: YYYY-MM
)
RETURNS NUMERIC AS $$
DECLARE
  carry_amount NUMERIC;
BEGIN
  -- Find most recent prior commission run totals for rep
  SELECT COALESCE(carry_forward_out, 0) INTO carry_amount
  FROM public.commission_run_rep_totals crt
  INNER JOIN public.commission_runs cr ON crt.commission_run_id = cr.id
  WHERE crt.rep_id = p_rep_id
  AND cr.period < p_run_month
  ORDER BY cr.period DESC
  LIMIT 1;

  RETURN COALESCE(carry_amount, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIX 14: REP DEACTIVATION — DOWNLINE ORPHAN RULES
-- =====================================================

-- Update distributors table status enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'distributors_status_check'
  ) THEN
    ALTER TABLE public.distributors
    DROP CONSTRAINT IF EXISTS distributors_status_check;

    ALTER TABLE public.distributors
    ADD CONSTRAINT distributors_status_check
    CHECK (status IN ('active', 'inactive', 'suspended', 'terminated'));
  END IF;
END $$;

-- Function: handle_termination
-- Purpose: Re-sponsor downline up when rep is terminated
CREATE OR REPLACE FUNCTION public.handle_termination(
  p_rep_id UUID
)
RETURNS TABLE(affected_rep_id UUID, old_sponsor_id UUID, new_sponsor_id UUID) AS $$
DECLARE
  terminated_sponsor_id UUID;
BEGIN
  -- Get terminated rep's sponsor
  SELECT sponsor_id INTO terminated_sponsor_id
  FROM public.distributors
  WHERE id = p_rep_id;

  IF terminated_sponsor_id IS NULL THEN
    RAISE EXCEPTION 'Terminated rep has no sponsor - cannot re-sponsor downline';
  END IF;

  -- Return affected reps info before update
  RETURN QUERY
  SELECT
    id as affected_rep_id,
    sponsor_id as old_sponsor_id,
    terminated_sponsor_id as new_sponsor_id
  FROM public.distributors
  WHERE sponsor_id = p_rep_id;

  -- Update all direct downline to new sponsor
  UPDATE public.distributors
  SET sponsor_id = terminated_sponsor_id
  WHERE sponsor_id = p_rep_id;

  -- Update terminated rep status
  UPDATE public.distributors
  SET status = 'terminated'
  WHERE id = p_rep_id;

  -- Log to audit_log
  INSERT INTO public.audit_log (action, actor_id, actor_type, details)
  VALUES (
    'rep_terminated',
    p_rep_id,
    'system',
    jsonb_build_object(
      'terminated_rep_id', p_rep_id,
      'new_sponsor_id', terminated_sponsor_id,
      'affected_count', (SELECT COUNT(*) FROM public.distributors WHERE sponsor_id = terminated_sponsor_id)
    )
  );

  -- Recalculate sponsor chain for affected reps
  PERFORM public.recalculate_sponsor_chain(d.id)
  FROM public.distributors d
  WHERE d.sponsor_id = terminated_sponsor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.cab_clawback_queue TO authenticated;
GRANT SELECT ON public.subscription_renewals TO authenticated;
GRANT SELECT ON public.commission_run_rep_totals TO authenticated;
GRANT SELECT ON public.bv_snapshot_runs TO authenticated;

GRANT EXECUTE ON FUNCTION public.calculate_renewal_rate(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_rep_active(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_carry_forward(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_termination(UUID) TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.orders IS 'All purchases from Stripe webhooks - source of truth for BV crediting';
COMMENT ON TABLE public.cab_clawback_queue IS 'Tracks CAB bonuses eligible for clawback within 60-day window';
COMMENT ON TABLE public.subscription_renewals IS 'Renewal tracking for Retention Bonus (80%+ requirement)';
COMMENT ON TABLE public.commission_run_rep_totals IS '7-phase commission run breakdown per rep';
COMMENT ON TABLE public.bv_snapshot_runs IS 'BV snapshot run status for commission run gate';

COMMENT ON FUNCTION public.calculate_renewal_rate(UUID, TEXT) IS 'Calculate renewal rate percentage for Retention Bonus eligibility';
COMMENT ON FUNCTION public.is_rep_active(UUID, TEXT) IS 'Returns true if rep has $50+ personal BV in month (active definition)';
COMMENT ON FUNCTION public.get_carry_forward(UUID, TEXT) IS 'Get carry forward amount from prior commission run';
COMMENT ON FUNCTION public.handle_termination(UUID) IS 'Re-sponsor downline up when rep is terminated';
