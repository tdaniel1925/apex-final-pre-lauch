-- =============================================
-- MIGRATION: Dual-Ladder Core Tables
-- Date: 2026-03-16
-- Phase: 2 (Build New DB Schema)
-- Agent: 2A
-- =============================================
--
-- PURPOSE: Create core members table with dual-ladder rank tracking
--
-- TABLES CREATED:
-- 1. members - Rep/distributor data with Tech + Insurance ranks
--
-- =============================================

-- =============================================
-- TABLE: members
-- =============================================
-- Purpose: Core member/distributor record with dual-ladder ranks
-- Links to: distributors table (via member_id = distributor.id)

CREATE TABLE IF NOT EXISTS public.members (
  -- Primary Key
  member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key to distributors table
  distributor_id UUID NOT NULL REFERENCES public.distributors(id) ON DELETE CASCADE,

  -- Member Identity
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  enroller_id UUID REFERENCES public.members(member_id) ON DELETE SET NULL,
  sponsor_id UUID REFERENCES public.members(member_id) ON DELETE SET NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  enrollment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  termination_date TIMESTAMPTZ,

  -- ==========================================
  -- TECH LADDER RANKS
  -- ==========================================
  -- Current rank (updated monthly)
  tech_rank TEXT NOT NULL DEFAULT 'starter' CHECK (tech_rank IN (
    'starter', 'bronze', 'silver', 'gold', 'platinum', 'ruby', 'diamond', 'crown', 'elite'
  )),

  -- Highest rank ever achieved (for rank bonuses)
  highest_tech_rank TEXT NOT NULL DEFAULT 'starter' CHECK (highest_tech_rank IN (
    'starter', 'bronze', 'silver', 'gold', 'platinum', 'ruby', 'diamond', 'crown', 'elite'
  )),

  -- Rank tracking
  tech_rank_achieved_date TIMESTAMPTZ,
  tech_rank_promotion_scheduled TIMESTAMPTZ, -- Promotions effective next month
  tech_rank_grace_period_start TIMESTAMPTZ, -- 2-month grace before demotion
  tech_rank_lock_until TIMESTAMPTZ, -- 6-month lock for new reps

  -- ==========================================
  -- INSURANCE LADDER RANKS
  -- ==========================================
  insurance_rank TEXT DEFAULT 'inactive' CHECK (insurance_rank IN (
    'inactive', 'associate', 'manager', 'director', 'senior_director', 'executive_director', 'mga'
  )),

  highest_insurance_rank TEXT DEFAULT 'inactive' CHECK (highest_insurance_rank IN (
    'inactive', 'associate', 'manager', 'director', 'senior_director', 'executive_director', 'mga'
  )),

  insurance_rank_achieved_date TIMESTAMPTZ,

  -- MGA Shop (if insurance_rank = 'mga')
  mga_shop_id UUID,
  mga_shop_name TEXT,
  mga_licensed_states TEXT[], -- Array of state codes

  -- ==========================================
  -- PRODUCTION CREDITS (Monthly)
  -- ==========================================
  -- Tracked monthly for qualification
  personal_credits_monthly INTEGER NOT NULL DEFAULT 0,
  team_credits_monthly INTEGER NOT NULL DEFAULT 0,

  -- Tech ladder production
  tech_personal_credits_monthly INTEGER NOT NULL DEFAULT 0,
  tech_team_credits_monthly INTEGER NOT NULL DEFAULT 0,

  -- Insurance ladder production
  insurance_personal_credits_monthly INTEGER NOT NULL DEFAULT 0,
  insurance_team_credits_monthly INTEGER NOT NULL DEFAULT 0,

  -- ==========================================
  -- OVERRIDE QUALIFICATION
  -- ==========================================
  -- Must have 50+ personal credits/month to earn overrides
  override_qualified BOOLEAN NOT NULL DEFAULT FALSE,

  -- ==========================================
  -- CROSS-CREDIT TRACKING
  -- ==========================================
  -- Bill's % from tech ladder credited to insurance ladder
  tech_to_insurance_credit_pct NUMERIC(5, 2) DEFAULT 0.00,

  -- 0.5% from insurance ladder credited to tech ladder
  insurance_to_tech_credit_pct NUMERIC(5, 2) DEFAULT 0.50,

  -- ==========================================
  -- TIMESTAMPS
  -- ==========================================
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Indexes
  UNIQUE(distributor_id)
);

-- =============================================
-- INDEXES
-- =============================================

-- Query members by rank
CREATE INDEX IF NOT EXISTS idx_members_tech_rank ON public.members(tech_rank);
CREATE INDEX IF NOT EXISTS idx_members_insurance_rank ON public.members(insurance_rank);

-- Query members by status
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);

-- Query members by enroller (for override calculations)
CREATE INDEX IF NOT EXISTS idx_members_enroller ON public.members(enroller_id);

-- Query members by sponsor (for matrix building)
CREATE INDEX IF NOT EXISTS idx_members_sponsor ON public.members(sponsor_id);

-- Query by override qualification
CREATE INDEX IF NOT EXISTS idx_members_override_qualified ON public.members(override_qualified);

-- Query MGA shops
CREATE INDEX IF NOT EXISTS idx_members_mga_shop ON public.members(mga_shop_id) WHERE mga_shop_id IS NOT NULL;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything (for commission runs)
CREATE POLICY service_all_members ON public.members
  FOR ALL
  TO service_role
  USING (true);

-- Policy: Authenticated users can read their own record
CREATE POLICY member_read_own ON public.members
  FOR SELECT
  TO authenticated
  USING (distributor_id = auth.uid());

-- Note: Admin policies will be added in Phase 4 after verifying distributors table structure

-- =============================================
-- TRIGGERS
-- =============================================

-- Update updated_at on row change
CREATE OR REPLACE FUNCTION update_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION update_members_updated_at();

-- Auto-calculate override qualification on credit update
CREATE OR REPLACE FUNCTION update_override_qualified()
RETURNS TRIGGER AS $$
BEGIN
  NEW.override_qualified = (NEW.personal_credits_monthly >= 50);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_override_qualified
  BEFORE INSERT OR UPDATE OF personal_credits_monthly ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION update_override_qualified();

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE public.members IS 'Core member/distributor records with dual-ladder rank tracking (Tech + Insurance)';
COMMENT ON COLUMN public.members.tech_rank IS 'Current tech ladder rank (9 ranks: starter → elite)';
COMMENT ON COLUMN public.members.insurance_rank IS 'Current insurance ladder rank (7 ranks: inactive → mga)';
COMMENT ON COLUMN public.members.override_qualified IS 'TRUE if personal_credits_monthly >= 50 (required to earn overrides)';
COMMENT ON COLUMN public.members.enroller_id IS 'IMMUTABLE - Personal enroller always earns L1 override (30%)';
COMMENT ON COLUMN public.members.tech_rank_lock_until IS '6-month rank lock for new reps (prevents demotion)';
COMMENT ON COLUMN public.members.tech_rank_grace_period_start IS '2-month grace period before demotion takes effect';

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Count members by tech rank:
-- SELECT tech_rank, COUNT(*) FROM public.members GROUP BY tech_rank ORDER BY tech_rank;

-- Count override-qualified members:
-- SELECT override_qualified, COUNT(*) FROM public.members GROUP BY override_qualified;

-- Find all MGA members:
-- SELECT member_id, full_name, mga_shop_name FROM public.members WHERE insurance_rank = 'mga';

-- =============================================
-- END OF MIGRATION
-- =============================================
