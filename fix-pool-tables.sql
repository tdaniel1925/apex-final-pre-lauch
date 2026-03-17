-- Create bonus_pool_ledger table
CREATE TABLE IF NOT EXISTS public.bonus_pool_ledger (
  pool_entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_label TEXT NOT NULL,
  total_sales_cents INTEGER NOT NULL DEFAULT 0,
  pool_percentage NUMERIC(5, 4) NOT NULL DEFAULT 0.0350,
  pool_amount_cents INTEGER NOT NULL,
  distributed_amount_cents INTEGER DEFAULT 0,
  remaining_amount_cents INTEGER DEFAULT 0,
  distribution_status TEXT NOT NULL DEFAULT 'accumulating' CHECK (distribution_status IN (
    'accumulating', 'calculating', 'ready', 'distributed', 'rolled_over'
  )),
  qualified_member_count INTEGER DEFAULT 0,
  share_per_member_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(period_label)
);

-- Create pool_distribution_history table
CREATE TABLE IF NOT EXISTS public.pool_distribution_history (
  distribution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_type TEXT NOT NULL CHECK (pool_type IN ('bonus_pool', 'leadership_pool')),
  period_label TEXT NOT NULL,
  total_pool_cents INTEGER NOT NULL,
  distributed_cents INTEGER NOT NULL,
  recipient_count INTEGER NOT NULL,
  run_id UUID NOT NULL,
  run_date DATE NOT NULL,
  run_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bonus_pool_period ON public.bonus_pool_ledger(period_label);
CREATE INDEX IF NOT EXISTS idx_bonus_pool_status ON public.bonus_pool_ledger(distribution_status);

CREATE INDEX IF NOT EXISTS idx_distribution_type ON public.pool_distribution_history(pool_type);
CREATE INDEX IF NOT EXISTS idx_distribution_period ON public.pool_distribution_history(period_label);
CREATE INDEX IF NOT EXISTS idx_distribution_run ON public.pool_distribution_history(run_id);

-- Enable RLS
ALTER TABLE public.bonus_pool_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_distribution_history ENABLE ROW LEVEL SECURITY;

-- Service role policies
CREATE POLICY service_all_bonus_pool ON public.bonus_pool_ledger FOR ALL TO service_role USING (true);
CREATE POLICY service_all_distribution ON public.pool_distribution_history FOR ALL TO service_role USING (true);

-- Triggers
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
