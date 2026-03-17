-- =============================================
-- MIGRATION: Insurance Ladder Tables
-- Date: 2026-03-16
-- Phase: 2 (Build New DB Schema)
-- Agent: 2E
-- =============================================
--
-- PURPOSE: Create insurance ladder support tables
--
-- TABLES CREATED:
-- 1. mga_shops - MGA shop configuration and hierarchy
-- 2. member_state_licenses - Track insurance licenses by state
-- 3. insurance_production - Track insurance-specific sales and credits
--
-- =============================================

-- =============================================
-- TABLE: mga_shops
-- =============================================
-- Purpose: MGA (Managing General Agent) shop configuration

CREATE TABLE IF NOT EXISTS public.mga_shops (
  -- Primary Key
  shop_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Shop Info
  shop_name TEXT NOT NULL UNIQUE,
  shop_code TEXT NOT NULL UNIQUE, -- Short code like "MGA-001"

  -- Owner
  owner_member_id UUID NOT NULL REFERENCES public.members(member_id) ON DELETE RESTRICT,
  owner_name TEXT NOT NULL, -- Snapshot for reporting

  -- Licensing
  licensed_states TEXT[] NOT NULL DEFAULT '{}', -- Array of state codes
  primary_state TEXT, -- Primary state of operation

  -- Business Info
  business_entity_name TEXT,
  tax_id TEXT, -- EIN
  business_address TEXT,
  business_phone TEXT,
  business_email TEXT,

  -- Commission Split
  mga_commission_split_pct NUMERIC(5, 2) DEFAULT 0.00, -- % of insurance commissions retained by MGA

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',     -- Active MGA shop
    'suspended',  -- Temporarily suspended
    'terminated'  -- Terminated
  )),

  -- Dates
  established_date DATE NOT NULL DEFAULT CURRENT_DATE,
  suspended_date DATE,
  terminated_date DATE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLE: member_state_licenses
-- =============================================
-- Purpose: Track insurance licenses by member and state

CREATE TABLE IF NOT EXISTS public.member_state_licenses (
  -- Primary Key
  license_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Member
  member_id UUID NOT NULL REFERENCES public.members(member_id) ON DELETE CASCADE,
  member_name TEXT NOT NULL, -- Snapshot

  -- License Info
  state_code TEXT NOT NULL, -- e.g., "CA", "TX", "NY"
  license_number TEXT NOT NULL,
  license_type TEXT NOT NULL CHECK (license_type IN (
    'life',         -- Life insurance
    'health',       -- Health insurance
    'property',     -- Property insurance
    'casualty',     -- Casualty insurance
    'variable',     -- Variable products
    'general_lines' -- General lines
  )),

  -- Dates
  issue_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  renewal_date DATE,

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',    -- Currently active
    'expired',   -- Expired
    'suspended', -- Suspended by state
    'revoked',   -- Revoked
    'pending'    -- Application pending
  )),

  -- Compliance
  ce_credits_required INTEGER DEFAULT 0, -- Continuing education credits required
  ce_credits_completed INTEGER DEFAULT 0, -- Completed
  last_ce_date DATE,
  next_ce_deadline DATE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(member_id, state_code, license_type)
);

-- =============================================
-- TABLE: insurance_production
-- =============================================
-- Purpose: Track insurance-specific sales and credits

CREATE TABLE IF NOT EXISTS public.insurance_production (
  -- Primary Key
  production_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Member
  member_id UUID NOT NULL REFERENCES public.members(member_id) ON DELETE CASCADE,
  member_name TEXT NOT NULL, -- Snapshot
  member_insurance_rank TEXT, -- Rank at time of sale

  -- MGA Shop (if applicable)
  mga_shop_id UUID REFERENCES public.mga_shops(shop_id) ON DELETE SET NULL,
  mga_shop_name TEXT,

  -- Sale Info
  policy_number TEXT,
  policy_type TEXT NOT NULL CHECK (policy_type IN (
    'life', 'health', 'annuity', 'disability', 'long_term_care', 'medicare_supplement', 'other'
  )),
  carrier_name TEXT NOT NULL,
  premium_amount_cents INTEGER NOT NULL, -- Annual premium
  commission_percentage NUMERIC(5, 2), -- % commission from carrier

  -- Credits
  production_credits INTEGER NOT NULL, -- Credits earned for comp plan
  credited_to_tech_ladder INTEGER DEFAULT 0, -- 0.5% crossover to tech ladder
  credited_to_insurance_ladder INTEGER NOT NULL, -- Main insurance ladder credit

  -- Sale Date
  sale_date DATE NOT NULL,
  effective_date DATE,

  -- State
  state_code TEXT NOT NULL, -- State where policy was sold

  -- Payment Status
  commission_paid BOOLEAN DEFAULT FALSE,
  commission_paid_date DATE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- MGA Shops
CREATE INDEX IF NOT EXISTS idx_mga_shops_owner ON public.mga_shops(owner_member_id);
CREATE INDEX IF NOT EXISTS idx_mga_shops_status ON public.mga_shops(status);
CREATE INDEX IF NOT EXISTS idx_mga_shops_state ON public.mga_shops USING GIN(licensed_states);

-- Member Licenses
CREATE INDEX IF NOT EXISTS idx_licenses_member ON public.member_state_licenses(member_id);
CREATE INDEX IF NOT EXISTS idx_licenses_state ON public.member_state_licenses(state_code);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON public.member_state_licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_expiration ON public.member_state_licenses(expiration_date);
CREATE INDEX IF NOT EXISTS idx_licenses_member_state ON public.member_state_licenses(member_id, state_code);

-- Insurance Production
CREATE INDEX IF NOT EXISTS idx_insurance_prod_member ON public.insurance_production(member_id);
CREATE INDEX IF NOT EXISTS idx_insurance_prod_mga ON public.insurance_production(mga_shop_id);
CREATE INDEX IF NOT EXISTS idx_insurance_prod_date ON public.insurance_production(sale_date);
CREATE INDEX IF NOT EXISTS idx_insurance_prod_state ON public.insurance_production(state_code);
CREATE INDEX IF NOT EXISTS idx_insurance_prod_carrier ON public.insurance_production(carrier_name);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE public.mga_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_state_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_production ENABLE ROW LEVEL SECURITY;

-- Service role policies
CREATE POLICY service_all_mga ON public.mga_shops FOR ALL TO service_role USING (true);
CREATE POLICY service_all_licenses ON public.member_state_licenses FOR ALL TO service_role USING (true);
CREATE POLICY service_all_insurance_prod ON public.insurance_production FOR ALL TO service_role USING (true);

-- Members can view their own data
CREATE POLICY member_read_own_licenses ON public.member_state_licenses
  FOR SELECT TO authenticated
  USING (member_id IN (SELECT member_id FROM public.members WHERE distributor_id = auth.uid()));

CREATE POLICY member_read_own_production ON public.insurance_production
  FOR SELECT TO authenticated
  USING (member_id IN (SELECT member_id FROM public.members WHERE distributor_id = auth.uid()));

-- =============================================
-- TRIGGERS
-- =============================================

-- Update updated_at on mga_shops changes
CREATE OR REPLACE FUNCTION update_mga_shops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mga_shops_updated_at
  BEFORE UPDATE ON public.mga_shops
  FOR EACH ROW
  EXECUTE FUNCTION update_mga_shops_updated_at();

-- Update updated_at on licenses changes
CREATE OR REPLACE FUNCTION update_licenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER licenses_updated_at
  BEFORE UPDATE ON public.member_state_licenses
  FOR EACH ROW
  EXECUTE FUNCTION update_licenses_updated_at();

-- Update updated_at on insurance production changes
CREATE OR REPLACE FUNCTION update_insurance_prod_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER insurance_prod_updated_at
  BEFORE UPDATE ON public.insurance_production
  FOR EACH ROW
  EXECUTE FUNCTION update_insurance_prod_updated_at();

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE public.mga_shops IS 'MGA (Managing General Agent) shop configuration for insurance ladder';
COMMENT ON TABLE public.member_state_licenses IS 'Track insurance licenses by member and state for compliance';
COMMENT ON TABLE public.insurance_production IS 'Track insurance-specific sales and production credits';

COMMENT ON COLUMN public.insurance_production.credited_to_tech_ladder IS '0.5% of insurance credits cross-credited to tech ladder';
COMMENT ON COLUMN public.mga_shops.mga_commission_split_pct IS 'Percentage of insurance commissions retained by MGA (if any)';

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Count MGA shops:
-- SELECT COUNT(*) FROM public.mga_shops WHERE status = 'active';

-- Members needing license renewal soon:
-- SELECT member_name, state_code, license_type, expiration_date
-- FROM public.member_state_licenses
-- WHERE status = 'active'
-- AND expiration_date <= CURRENT_DATE + INTERVAL '60 days'
-- ORDER BY expiration_date;

-- Insurance production by member:
-- SELECT member_name, COUNT(*) as policies, SUM(production_credits) as total_credits
-- FROM public.insurance_production
-- WHERE sale_date >= DATE_TRUNC('month', CURRENT_DATE)
-- GROUP BY member_id, member_name
-- ORDER BY total_credits DESC;

-- =============================================
-- END OF MIGRATION
-- =============================================
