-- =============================================
-- MIGRATION: Compensation Configuration System
-- Date: 2026-03-16
-- Phase: 3 (Agent 1 - Database Architect)
-- =============================================
--
-- PURPOSE: Create configuration tables for flexible comp plan management
--
-- TABLES CREATED:
-- 1. compensation_plan_configs - Main compensation plan versions
-- 2. tech_rank_configs - Tech ladder rank configurations per plan
-- 3. waterfall_configs - Waterfall percentage configurations per plan
-- 4. bonus_program_configs - Bonus program configurations per plan
-- 5. compensation_config_audit_log - Audit trail of all config changes
--
-- DESIGN DECISIONS:
-- - Config versioning: Each plan has a unique version number
-- - Immutable history: Old configs remain in DB for audit trail
-- - Active flag: Only one config can be active at a time
-- - Cascade delete: Deleting a plan deletes all related configs
-- - JSONB flexibility: Bonus programs use JSONB for program-specific rules
--
-- =============================================

-- =============================================
-- TABLE: compensation_plan_configs
-- =============================================
-- Purpose: Master configuration table for compensation plans
-- Each plan is a versioned snapshot of all compensation rules

CREATE TABLE IF NOT EXISTS public.compensation_plan_configs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Plan Identity
  name TEXT NOT NULL, -- e.g., "2026 Standard Plan", "2027 Q1 Plan"
  version INTEGER NOT NULL, -- Incrementing version number (1, 2, 3, ...)
  description TEXT, -- Human-readable description of changes

  -- Activation
  effective_date DATE NOT NULL, -- When this plan takes effect
  is_active BOOLEAN NOT NULL DEFAULT FALSE, -- Only one plan can be active

  -- Admin Tracking
  created_by UUID, -- Admin user who created this config
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(version), -- Each version number used once
  CHECK(version > 0) -- Versions start at 1
);

-- =============================================
-- TABLE: tech_rank_configs
-- =============================================
-- Purpose: Tech ladder rank requirements and rewards per plan version
-- Each plan can have different rank requirements, bonuses, and override schedules

CREATE TABLE IF NOT EXISTS public.tech_rank_configs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  plan_config_id UUID NOT NULL REFERENCES public.compensation_plan_configs(id) ON DELETE CASCADE,

  -- Rank Identity
  rank_name TEXT NOT NULL CHECK (rank_name IN (
    'starter', 'bronze', 'silver', 'gold', 'platinum', 'ruby', 'diamond', 'crown', 'elite'
  )),
  rank_order INTEGER NOT NULL CHECK (rank_order BETWEEN 1 AND 9), -- 1=Starter, 9=Elite

  -- Requirements
  personal_credits_required INTEGER NOT NULL, -- Personal production credits/month
  group_credits_required INTEGER NOT NULL, -- Team production credits/month
  downline_requirements JSONB, -- {"bronze": 1, "silver": 2} or [{"gold": 3}, {"platinum": 2}] for OR conditions

  -- Rewards
  rank_bonus_cents INTEGER NOT NULL DEFAULT 0, -- One-time rank advancement bonus
  override_schedule NUMERIC(5,2)[], -- Array of 5 percentages: [0.30, 0.15, 0.10, 0.05, 0.00]

  -- Grace & Lock Rules
  grace_period_months INTEGER NOT NULL DEFAULT 2, -- Months below requirements before demotion
  rank_lock_months INTEGER NOT NULL DEFAULT 6, -- Months new reps are locked at rank

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(plan_config_id, rank_order), -- One config per rank per plan
  UNIQUE(plan_config_id, rank_name), -- Rank names unique within plan
  CHECK(array_length(override_schedule, 1) = 5) -- Must have exactly 5 override levels
);

-- =============================================
-- TABLE: waterfall_configs
-- =============================================
-- Purpose: Revenue waterfall percentages per plan and product type
-- Allows different splits for standard products vs Business Center

CREATE TABLE IF NOT EXISTS public.waterfall_configs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  plan_config_id UUID NOT NULL REFERENCES public.compensation_plan_configs(id) ON DELETE CASCADE,

  -- Product Type
  product_type TEXT NOT NULL DEFAULT 'standard' CHECK (product_type IN ('standard', 'business_center')),

  -- Waterfall Percentages (stored as decimals: 0.30 = 30%)
  botmakers_pct NUMERIC(5,2) NOT NULL, -- % of price to BotMakers
  apex_pct NUMERIC(5,2) NOT NULL, -- % of adjusted gross to Apex
  bonus_pool_pct NUMERIC(5,2) NOT NULL, -- % of remainder to Bonus Pool
  leadership_pool_pct NUMERIC(5,2) NOT NULL, -- % of remainder to Leadership Pool
  seller_commission_pct NUMERIC(5,2) NOT NULL, -- % of commission pool to Seller
  override_pool_pct NUMERIC(5,2) NOT NULL, -- % of commission pool to Override Pool

  -- Business Center Fixed Amounts (only used if product_type = 'business_center')
  bc_price_cents INTEGER, -- Fixed $39 price
  bc_botmakers_cents INTEGER, -- Fixed $11 to BotMakers
  bc_apex_cents INTEGER, -- Fixed $8 to Apex
  bc_seller_cents INTEGER, -- Fixed $10 to Seller
  bc_sponsor_cents INTEGER, -- Fixed $8 to Sponsor
  bc_costs_cents INTEGER, -- Fixed $2 for costs
  bc_credits INTEGER, -- Fixed 39 credits

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(plan_config_id, product_type), -- One config per product type per plan
  CHECK(botmakers_pct >= 0 AND botmakers_pct <= 1), -- Percentages between 0 and 100%
  CHECK(apex_pct >= 0 AND apex_pct <= 1),
  CHECK(bonus_pool_pct >= 0 AND bonus_pool_pct <= 1),
  CHECK(leadership_pool_pct >= 0 AND leadership_pool_pct <= 1),
  CHECK(seller_commission_pct >= 0 AND seller_commission_pct <= 1),
  CHECK(override_pool_pct >= 0 AND override_pool_pct <= 1)
);

-- =============================================
-- TABLE: bonus_program_configs
-- =============================================
-- Purpose: Bonus program configurations (Fast Start, Car Allowance, etc.)
-- Uses JSONB for flexibility as each program has different rules

CREATE TABLE IF NOT EXISTS public.bonus_program_configs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  plan_config_id UUID NOT NULL REFERENCES public.compensation_plan_configs(id) ON DELETE CASCADE,

  -- Program Identity
  program_name TEXT NOT NULL CHECK (program_name IN (
    'fast_start',        -- Fast Start Bonus (30/60/90 day tiers)
    'trip_incentive',    -- Gold in 90 Days Trip
    'car_allowance',     -- Car/Lifestyle Allowance
    'quarterly_contest', -- Quarterly Production Contests
    'leadership_retreat',-- Annual Leadership Retreat
    'enhanced_rank',     -- Enhanced Rank Bonuses (within 12 months)
    'weekly_production', -- Weekly Production Bonus (Insurance)
    'mga_recruiting'     -- MGA Quarterly Recruiting Bonus
  )),

  -- Program Status
  enabled BOOLEAN NOT NULL DEFAULT TRUE, -- Can disable programs without deleting

  -- Program Configuration (flexible JSONB structure)
  -- Examples:
  -- Fast Start: {"tiers": [{"days": 30, "accounts": 3, "bonus": 25000}, ...]}
  -- Car Allowance: {"platinum": 50000, "ruby": 75000, "diamond": 100000}
  -- Trip Incentive: {"target_rank": "gold", "days": 90, "cost": 400000}
  config_json JSONB NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(plan_config_id, program_name) -- One config per program per plan
);

-- =============================================
-- TABLE: compensation_config_audit_log
-- =============================================
-- Purpose: Complete audit trail of all configuration changes
-- Tracks who changed what and when for compliance

CREATE TABLE IF NOT EXISTS public.compensation_config_audit_log (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Admin Who Made Change
  admin_id UUID, -- References auth.users or members table
  admin_email TEXT, -- Snapshot for reporting

  -- Action Performed
  action TEXT NOT NULL CHECK (action IN (
    'created',      -- New plan created
    'updated',      -- Existing plan modified
    'activated',    -- Plan set as active
    'deactivated',  -- Plan deactivated
    'deleted'       -- Plan deleted (rare)
  )),

  -- What Changed
  config_id UUID REFERENCES public.compensation_plan_configs(id) ON DELETE SET NULL,
  config_type TEXT, -- 'plan', 'rank', 'waterfall', 'bonus_program'

  -- Change Details (JSONB for flexibility)
  -- Before/after snapshots for auditing
  changes JSONB, -- {"before": {...}, "after": {...}}
  reason TEXT, -- Why the change was made

  -- Timestamp
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Plan queries
CREATE INDEX IF NOT EXISTS idx_plan_configs_active ON public.compensation_plan_configs(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_plan_configs_effective ON public.compensation_plan_configs(effective_date);
CREATE INDEX IF NOT EXISTS idx_plan_configs_version ON public.compensation_plan_configs(version);

-- Rank config queries
CREATE INDEX IF NOT EXISTS idx_tech_rank_plan ON public.tech_rank_configs(plan_config_id);
CREATE INDEX IF NOT EXISTS idx_tech_rank_order ON public.tech_rank_configs(rank_order);

-- Waterfall config queries
CREATE INDEX IF NOT EXISTS idx_waterfall_plan ON public.waterfall_configs(plan_config_id);
CREATE INDEX IF NOT EXISTS idx_waterfall_type ON public.waterfall_configs(product_type);

-- Bonus program queries
CREATE INDEX IF NOT EXISTS idx_bonus_program_plan ON public.bonus_program_configs(plan_config_id);
CREATE INDEX IF NOT EXISTS idx_bonus_program_enabled ON public.bonus_program_configs(enabled) WHERE enabled = TRUE;

-- Audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_config ON public.compensation_config_audit_log(config_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON public.compensation_config_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON public.compensation_config_audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.compensation_config_audit_log(action);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.compensation_plan_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_rank_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waterfall_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_program_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compensation_config_audit_log ENABLE ROW LEVEL SECURITY;

-- Service role policies (for commission engine)
CREATE POLICY service_all_plan_configs ON public.compensation_plan_configs
  FOR ALL TO service_role USING (true);

CREATE POLICY service_all_rank_configs ON public.tech_rank_configs
  FOR ALL TO service_role USING (true);

CREATE POLICY service_all_waterfall_configs ON public.waterfall_configs
  FOR ALL TO service_role USING (true);

CREATE POLICY service_all_bonus_configs ON public.bonus_program_configs
  FOR ALL TO service_role USING (true);

CREATE POLICY service_all_audit_log ON public.compensation_config_audit_log
  FOR ALL TO service_role USING (true);

-- Authenticated users can READ active configs
CREATE POLICY member_read_active_plan ON public.compensation_plan_configs
  FOR SELECT TO authenticated
  USING (is_active = TRUE);

CREATE POLICY member_read_active_ranks ON public.tech_rank_configs
  FOR SELECT TO authenticated
  USING (
    plan_config_id IN (
      SELECT id FROM public.compensation_plan_configs WHERE is_active = TRUE
    )
  );

CREATE POLICY member_read_active_waterfall ON public.waterfall_configs
  FOR SELECT TO authenticated
  USING (
    plan_config_id IN (
      SELECT id FROM public.compensation_plan_configs WHERE is_active = TRUE
    )
  );

CREATE POLICY member_read_active_bonuses ON public.bonus_program_configs
  FOR SELECT TO authenticated
  USING (
    plan_config_id IN (
      SELECT id FROM public.compensation_plan_configs WHERE is_active = TRUE
    )
  );

-- Note: Admin-only write policies will be added in Phase 4 after admin role verification

-- =============================================
-- TRIGGERS
-- =============================================

-- Update updated_at timestamp on all config tables
CREATE OR REPLACE FUNCTION update_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plan_configs_updated_at
  BEFORE UPDATE ON public.compensation_plan_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_config_updated_at();

CREATE TRIGGER rank_configs_updated_at
  BEFORE UPDATE ON public.tech_rank_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_config_updated_at();

CREATE TRIGGER waterfall_configs_updated_at
  BEFORE UPDATE ON public.waterfall_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_config_updated_at();

CREATE TRIGGER bonus_configs_updated_at
  BEFORE UPDATE ON public.bonus_program_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_config_updated_at();

-- Ensure only one active plan at a time
CREATE OR REPLACE FUNCTION enforce_single_active_plan()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = TRUE THEN
    -- Deactivate all other plans
    UPDATE public.compensation_plan_configs
    SET is_active = FALSE
    WHERE id != NEW.id AND is_active = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_active_plan
  BEFORE INSERT OR UPDATE OF is_active ON public.compensation_plan_configs
  FOR EACH ROW
  WHEN (NEW.is_active = TRUE)
  EXECUTE FUNCTION enforce_single_active_plan();

-- Log all configuration changes to audit log
CREATE OR REPLACE FUNCTION log_config_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_config_type TEXT;
  v_changes JSONB;
BEGIN
  -- Determine action
  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
    v_changes := jsonb_build_object('after', row_to_json(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'updated';
    v_changes := jsonb_build_object('before', row_to_json(OLD), 'after', row_to_json(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'deleted';
    v_changes := jsonb_build_object('before', row_to_json(OLD));
  END IF;

  -- Determine config type
  v_config_type := TG_TABLE_NAME;

  -- Insert audit log entry
  INSERT INTO public.compensation_config_audit_log (
    admin_id,
    admin_email,
    action,
    config_id,
    config_type,
    changes,
    timestamp
  ) VALUES (
    auth.uid(), -- Current user
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    v_action,
    COALESCE(NEW.id, OLD.id),
    v_config_type,
    v_changes,
    NOW()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to all config tables
CREATE TRIGGER audit_plan_configs
  AFTER INSERT OR UPDATE OR DELETE ON public.compensation_plan_configs
  FOR EACH ROW
  EXECUTE FUNCTION log_config_changes();

CREATE TRIGGER audit_rank_configs
  AFTER INSERT OR UPDATE OR DELETE ON public.tech_rank_configs
  FOR EACH ROW
  EXECUTE FUNCTION log_config_changes();

CREATE TRIGGER audit_waterfall_configs
  AFTER INSERT OR UPDATE OR DELETE ON public.waterfall_configs
  FOR EACH ROW
  EXECUTE FUNCTION log_config_changes();

CREATE TRIGGER audit_bonus_configs
  AFTER INSERT OR UPDATE OR DELETE ON public.bonus_program_configs
  FOR EACH ROW
  EXECUTE FUNCTION log_config_changes();

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Get the currently active compensation plan
CREATE OR REPLACE FUNCTION get_active_compensation_plan()
RETURNS UUID AS $$
  SELECT id FROM public.compensation_plan_configs
  WHERE is_active = TRUE
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Get tech rank config for active plan
CREATE OR REPLACE FUNCTION get_rank_config(p_rank_name TEXT)
RETURNS TABLE (
  rank_name TEXT,
  personal_credits_required INTEGER,
  group_credits_required INTEGER,
  downline_requirements JSONB,
  rank_bonus_cents INTEGER,
  override_schedule NUMERIC(5,2)[]
) AS $$
  SELECT
    tc.rank_name,
    tc.personal_credits_required,
    tc.group_credits_required,
    tc.downline_requirements,
    tc.rank_bonus_cents,
    tc.override_schedule
  FROM public.tech_rank_configs tc
  WHERE tc.plan_config_id = get_active_compensation_plan()
    AND tc.rank_name = p_rank_name
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Get waterfall config for active plan
CREATE OR REPLACE FUNCTION get_waterfall_config(p_product_type TEXT DEFAULT 'standard')
RETURNS TABLE (
  botmakers_pct NUMERIC(5,2),
  apex_pct NUMERIC(5,2),
  bonus_pool_pct NUMERIC(5,2),
  leadership_pool_pct NUMERIC(5,2),
  seller_commission_pct NUMERIC(5,2),
  override_pool_pct NUMERIC(5,2)
) AS $$
  SELECT
    wc.botmakers_pct,
    wc.apex_pct,
    wc.bonus_pool_pct,
    wc.leadership_pool_pct,
    wc.seller_commission_pct,
    wc.override_pool_pct
  FROM public.waterfall_configs wc
  WHERE wc.plan_config_id = get_active_compensation_plan()
    AND wc.product_type = p_product_type
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE public.compensation_plan_configs IS 'Master compensation plan configurations with versioning and activation';
COMMENT ON TABLE public.tech_rank_configs IS 'Tech ladder rank requirements, bonuses, and override schedules per plan version';
COMMENT ON TABLE public.waterfall_configs IS 'Revenue waterfall percentages per plan and product type (standard vs Business Center)';
COMMENT ON TABLE public.bonus_program_configs IS 'Bonus program configurations with flexible JSONB rules per plan';
COMMENT ON TABLE public.compensation_config_audit_log IS 'Complete audit trail of all configuration changes for compliance';

COMMENT ON COLUMN public.compensation_plan_configs.is_active IS 'Only ONE plan can be active at a time (enforced by trigger)';
COMMENT ON COLUMN public.tech_rank_configs.override_schedule IS 'Array of 5 percentages for L1-L5 overrides (e.g., [0.30, 0.15, 0.10, 0.05, 0.00])';
COMMENT ON COLUMN public.tech_rank_configs.downline_requirements IS 'JSONB: {"bronze": 1} or [{"gold": 3}, {"platinum": 2}] for OR conditions';
COMMENT ON COLUMN public.bonus_program_configs.config_json IS 'Flexible JSONB structure for program-specific rules';
COMMENT ON COLUMN public.waterfall_configs.product_type IS 'standard = normal waterfall, business_center = fixed $39 split';

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Get active plan:
-- SELECT * FROM public.compensation_plan_configs WHERE is_active = TRUE;

-- Get all ranks for active plan:
-- SELECT rank_name, personal_credits_required, group_credits_required, rank_bonus_cents/100.0 as bonus_usd
-- FROM public.tech_rank_configs
-- WHERE plan_config_id = get_active_compensation_plan()
-- ORDER BY rank_order;

-- Get waterfall config for standard products:
-- SELECT * FROM get_waterfall_config('standard');

-- Get all enabled bonus programs for active plan:
-- SELECT program_name, config_json
-- FROM public.bonus_program_configs
-- WHERE plan_config_id = get_active_compensation_plan() AND enabled = TRUE;

-- Recent audit log:
-- SELECT timestamp, admin_email, action, config_type, changes
-- FROM public.compensation_config_audit_log
-- ORDER BY timestamp DESC
-- LIMIT 20;

-- =============================================
-- END OF MIGRATION
-- =============================================
