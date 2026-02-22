-- =============================================
-- COMMISSION ENGINE - Core Tables
-- All 16 commission types + payout system
-- =============================================
-- Migration: 20260221000004
-- Created: 2026-02-21
-- =============================================

-- =============================================
-- 1. RANK HISTORY (Track rank changes over time)
-- =============================================

CREATE TABLE IF NOT EXISTS rank_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Rank change
  from_rank TEXT,
  to_rank TEXT NOT NULL
    CHECK (to_rank IN ('associate', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'crown_diamond', 'royal_diamond')),

  -- Qualification details
  month_year TEXT NOT NULL, -- When they qualified
  pbv INTEGER NOT NULL,
  gbv INTEGER NOT NULL,
  personally_sponsored_count INTEGER DEFAULT 0,
  leg_requirements_met BOOLEAN DEFAULT FALSE,

  -- Speed tracking (for multipliers)
  days_since_last_rank INTEGER,
  speed_multiplier DECIMAL(3,2) DEFAULT 1.0 CHECK (speed_multiplier IN (1.0, 1.5, 2.0)),

  -- Grace period tracking
  is_grace_period BOOLEAN DEFAULT FALSE,

  achieved_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(distributor_id, to_rank) -- One record per rank achievement
);

CREATE INDEX IF NOT EXISTS idx_rank_history_distributor ON rank_history(distributor_id);
CREATE INDEX IF NOT EXISTS idx_rank_history_month ON rank_history(month_year);
CREATE INDEX IF NOT EXISTS idx_rank_history_rank ON rank_history(to_rank);

-- =============================================
-- 2. RETAIL CASH COMMISSIONS (Weekly Payouts)
-- =============================================

CREATE TABLE IF NOT EXISTS commissions_retail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Commission details
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  retail_price_cents INTEGER NOT NULL,
  wholesale_price_cents INTEGER NOT NULL,
  commission_amount_cents INTEGER NOT NULL, -- Retail - Wholesale

  -- Week tracking (paid weekly on Fridays)
  week_ending DATE NOT NULL, -- Friday of the week

  -- Payout tracking
  payout_batch_id UUID, -- Links to payout_batches
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'held', 'cancelled')),
  paid_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commissions_retail_distributor ON commissions_retail(distributor_id);
CREATE INDEX IF NOT EXISTS idx_commissions_retail_week ON commissions_retail(week_ending);
CREATE INDEX IF NOT EXISTS idx_commissions_retail_status ON commissions_retail(status);
CREATE INDEX IF NOT EXISTS idx_commissions_retail_payout ON commissions_retail(payout_batch_id);

-- =============================================
-- 3. CUSTOMER ACQUISITION BONUS (CAB)
-- =============================================

CREATE TABLE IF NOT EXISTS commissions_cab (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- CAB tier
  first_order_bv INTEGER NOT NULL,
  cab_amount_cents INTEGER NOT NULL, -- Based on tier

  -- Payout tracking
  payout_batch_id UUID,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'held', 'cancelled')),
  paid_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(customer_id) -- One CAB per customer (first order only)
);

CREATE INDEX IF NOT EXISTS idx_commissions_cab_distributor ON commissions_cab(distributor_id);
CREATE INDEX IF NOT EXISTS idx_commissions_cab_customer ON commissions_cab(customer_id);
CREATE INDEX IF NOT EXISTS idx_commissions_cab_status ON commissions_cab(status);

-- =============================================
-- 4. CUSTOMER MILESTONE BONUSES
-- =============================================

CREATE TABLE IF NOT EXISTS commissions_customer_milestone (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Achievement
  month_year TEXT NOT NULL,
  new_customers_count INTEGER NOT NULL,
  milestone_tier TEXT NOT NULL CHECK (milestone_tier IN ('5', '10', '15', '20', '30')),
  bonus_amount_cents INTEGER NOT NULL,

  -- Payout tracking
  payout_batch_id UUID,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'held', 'cancelled')),
  paid_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(distributor_id, month_year) -- One per month
);

CREATE INDEX IF NOT EXISTS idx_commissions_milestone_distributor ON commissions_customer_milestone(distributor_id);
CREATE INDEX IF NOT EXISTS idx_commissions_milestone_month ON commissions_customer_milestone(month_year);

-- =============================================
-- 5. CUSTOMER RETENTION BONUS
-- =============================================

CREATE TABLE IF NOT EXISTS commissions_retention (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Achievement
  month_year TEXT NOT NULL,
  active_autoship_count INTEGER NOT NULL,
  retention_tier TEXT NOT NULL CHECK (retention_tier IN ('10', '25', '50', '100')),
  bonus_amount_cents INTEGER NOT NULL,

  -- Payout tracking
  payout_batch_id UUID,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'held', 'cancelled')),
  paid_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(distributor_id, month_year) -- One per month
);

CREATE INDEX IF NOT EXISTS idx_commissions_retention_distributor ON commissions_retention(distributor_id);
CREATE INDEX IF NOT EXISTS idx_commissions_retention_month ON commissions_retention(month_year);

-- =============================================
-- 6. MATRIX COMMISSIONS (Levels 1-7)
-- =============================================

CREATE TABLE IF NOT EXISTS commissions_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Matrix details
  month_year TEXT NOT NULL,
  organization_number INTEGER DEFAULT 1 CHECK (organization_number IN (1, 2, 3)), -- SOT orgs

  -- Breakdown by level
  level_1_bv INTEGER DEFAULT 0,
  level_1_rate DECIMAL(5,4) DEFAULT 0,
  level_1_commission_cents INTEGER DEFAULT 0,

  level_2_bv INTEGER DEFAULT 0,
  level_2_rate DECIMAL(5,4) DEFAULT 0,
  level_2_commission_cents INTEGER DEFAULT 0,

  level_3_bv INTEGER DEFAULT 0,
  level_3_rate DECIMAL(5,4) DEFAULT 0,
  level_3_commission_cents INTEGER DEFAULT 0,

  level_4_bv INTEGER DEFAULT 0,
  level_4_rate DECIMAL(5,4) DEFAULT 0,
  level_4_commission_cents INTEGER DEFAULT 0,

  level_5_bv INTEGER DEFAULT 0,
  level_5_rate DECIMAL(5,4) DEFAULT 0,
  level_5_commission_cents INTEGER DEFAULT 0,

  level_6_bv INTEGER DEFAULT 0,
  level_6_rate DECIMAL(5,4) DEFAULT 0,
  level_6_commission_cents INTEGER DEFAULT 0,

  level_7_bv INTEGER DEFAULT 0,
  level_7_rate DECIMAL(5,4) DEFAULT 0,
  level_7_commission_cents INTEGER DEFAULT 0,

  -- Total
  total_commission_cents INTEGER NOT NULL,

  -- Rank at time of calculation
  rank_at_calculation TEXT NOT NULL,

  -- Payout tracking
  payout_batch_id UUID,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'held', 'cancelled')),
  paid_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(distributor_id, month_year, organization_number)
);

CREATE INDEX IF NOT EXISTS idx_commissions_matrix_distributor ON commissions_matrix(distributor_id);
CREATE INDEX IF NOT EXISTS idx_commissions_matrix_month ON commissions_matrix(month_year);
CREATE INDEX IF NOT EXISTS idx_commissions_matrix_org ON commissions_matrix(organization_number);

-- =============================================
-- 7. MATCHING BONUS (Gen 1-3)
-- =============================================

CREATE TABLE IF NOT EXISTS commissions_matching (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Matching details
  month_year TEXT NOT NULL,

  -- Gen 1 (all personally sponsored)
  gen1_matrix_commissions_cents INTEGER DEFAULT 0,
  gen1_match_rate DECIMAL(5,4) DEFAULT 0,
  gen1_match_commission_cents INTEGER DEFAULT 0,

  -- Gen 2 (next Silver+ in each line)
  gen2_matrix_commissions_cents INTEGER DEFAULT 0,
  gen2_match_rate DECIMAL(5,4) DEFAULT 0,
  gen2_match_commission_cents INTEGER DEFAULT 0,

  -- Gen 3 (next Silver+ below Gen 2)
  gen3_matrix_commissions_cents INTEGER DEFAULT 0,
  gen3_match_rate DECIMAL(5,4) DEFAULT 0,
  gen3_match_commission_cents INTEGER DEFAULT 0,

  -- Total
  total_commission_cents INTEGER NOT NULL,

  -- Cap enforcement
  pre_cap_amount_cents INTEGER, -- Before $25k cap applied
  cap_applied BOOLEAN DEFAULT FALSE,

  -- Rank at calculation
  rank_at_calculation TEXT NOT NULL,

  -- Payout tracking
  payout_batch_id UUID,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'held', 'cancelled')),
  paid_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(distributor_id, month_year)
);

CREATE INDEX IF NOT EXISTS idx_commissions_matching_distributor ON commissions_matching(distributor_id);
CREATE INDEX IF NOT EXISTS idx_commissions_matching_month ON commissions_matching(month_year);

-- =============================================
-- 8. OVERRIDE BONUSES
-- =============================================

CREATE TABLE IF NOT EXISTS commissions_override (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Override details
  month_year TEXT NOT NULL,

  -- Breakdown by rank differential
  override_on_associate_bv INTEGER DEFAULT 0,
  override_on_associate_rate DECIMAL(5,4) DEFAULT 0,
  override_on_associate_cents INTEGER DEFAULT 0,

  override_on_bronze_bv INTEGER DEFAULT 0,
  override_on_bronze_rate DECIMAL(5,4) DEFAULT 0,
  override_on_bronze_cents INTEGER DEFAULT 0,

  override_on_silver_bv INTEGER DEFAULT 0,
  override_on_silver_rate DECIMAL(5,4) DEFAULT 0,
  override_on_silver_cents INTEGER DEFAULT 0,

  override_on_gold_bv INTEGER DEFAULT 0,
  override_on_gold_rate DECIMAL(5,4) DEFAULT 0,
  override_on_gold_cents INTEGER DEFAULT 0,

  override_on_platinum_bv INTEGER DEFAULT 0,
  override_on_platinum_rate DECIMAL(5,4) DEFAULT 0,
  override_on_platinum_cents INTEGER DEFAULT 0,

  override_on_diamond_bv INTEGER DEFAULT 0,
  override_on_diamond_rate DECIMAL(5,4) DEFAULT 0,
  override_on_diamond_cents INTEGER DEFAULT 0,

  -- Total
  total_commission_cents INTEGER NOT NULL,

  -- Rank at calculation
  rank_at_calculation TEXT NOT NULL,

  -- Payout tracking
  payout_batch_id UUID,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'held', 'cancelled')),
  paid_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(distributor_id, month_year)
);

CREATE INDEX IF NOT EXISTS idx_commissions_override_distributor ON commissions_override(distributor_id);
CREATE INDEX IF NOT EXISTS idx_commissions_override_month ON commissions_override(month_year);

-- =============================================
-- 9. CODED INFINITY BONUS (Level 8+)
-- =============================================

CREATE TABLE IF NOT EXISTS commissions_infinity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Infinity details
  month_year TEXT NOT NULL,
  organization_number INTEGER DEFAULT 1 CHECK (organization_number IN (1, 2, 3)),

  -- BV from Level 8+
  infinity_bv INTEGER NOT NULL,
  infinity_rate DECIMAL(5,4) NOT NULL, -- 1%, 2%, or 3%
  commission_cents INTEGER NOT NULL,

  -- Circuit breaker tracking
  circuit_breaker_applied BOOLEAN DEFAULT FALSE,
  original_rate DECIMAL(5,4), -- If circuit breaker reduced rate

  -- Rank at calculation
  rank_at_calculation TEXT NOT NULL,

  -- Payout tracking
  payout_batch_id UUID,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'held', 'cancelled')),
  paid_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(distributor_id, month_year, organization_number)
);

CREATE INDEX IF NOT EXISTS idx_commissions_infinity_distributor ON commissions_infinity(distributor_id);
CREATE INDEX IF NOT EXISTS idx_commissions_infinity_month ON commissions_infinity(month_year);

-- =============================================
-- 10. FAST START BONUS
-- =============================================

CREATE TABLE IF NOT EXISTS commissions_fast_start (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Achievement category
  category TEXT NOT NULL CHECK (category IN ('enrollment', 'gbv', 'customer', 'rank')),
  achievement_description TEXT NOT NULL,
  bonus_amount_cents INTEGER NOT NULL,

  -- Timing
  enrollment_date DATE NOT NULL,
  achievement_date DATE NOT NULL,
  days_to_achieve INTEGER NOT NULL CHECK (days_to_achieve <= 30),

  -- Upline Fast Start (10% to sponsor)
  sponsor_id UUID REFERENCES distributors(id) ON DELETE SET NULL,
  sponsor_bonus_cents INTEGER DEFAULT 0,

  -- Payout tracking
  payout_batch_id UUID,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'held', 'cancelled')),
  paid_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commissions_fast_start_distributor ON commissions_fast_start(distributor_id);
CREATE INDEX IF NOT EXISTS idx_commissions_fast_start_sponsor ON commissions_fast_start(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_commissions_fast_start_category ON commissions_fast_start(category);

-- =============================================
-- 11. RANK ADVANCEMENT BONUS
-- =============================================

CREATE TABLE IF NOT EXISTS commissions_rank_advancement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  rank_history_id UUID NOT NULL REFERENCES rank_history(id) ON DELETE CASCADE,

  -- Rank achieved
  rank_achieved TEXT NOT NULL,
  base_bonus_cents INTEGER NOT NULL,

  -- Speed multiplier
  days_to_achieve INTEGER,
  speed_multiplier DECIMAL(3,2) NOT NULL,
  final_bonus_cents INTEGER NOT NULL,

  -- Installment tracking (Diamond+ paid in 3 installments)
  is_installment_plan BOOLEAN DEFAULT FALSE,
  installments_total INTEGER DEFAULT 1,
  installment_number INTEGER DEFAULT 1,
  installment_amount_cents INTEGER NOT NULL,
  remaining_installments INTEGER DEFAULT 0,

  -- Momentum bonus (separate from rank bonus)
  momentum_bonus_cents INTEGER DEFAULT 0,
  momentum_achievement TEXT, -- e.g., "3 ranks in 6 months"

  -- Month tracking
  month_year TEXT NOT NULL,

  -- Payout tracking
  payout_batch_id UUID,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'held', 'cancelled')),
  paid_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commissions_rank_distributor ON commissions_rank_advancement(distributor_id);
CREATE INDEX IF NOT EXISTS idx_commissions_rank_month ON commissions_rank_advancement(month_year);
CREATE INDEX IF NOT EXISTS idx_commissions_rank_installment ON commissions_rank_advancement(is_installment_plan, installment_number);

-- =============================================
-- 12. CAR BONUS
-- =============================================

CREATE TABLE IF NOT EXISTS commissions_car (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Car bonus details
  month_year TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('cruiser', 'executive', 'prestige', 'apex')),
  bonus_amount_cents INTEGER NOT NULL,

  -- Qualification tracking
  rank_at_qualification TEXT NOT NULL,
  gbv_at_qualification INTEGER NOT NULL,
  consecutive_months_qualified INTEGER NOT NULL,

  -- Cap tracking (max $3k/month across all orgs)
  pre_cap_amount_cents INTEGER,
  cap_applied BOOLEAN DEFAULT FALSE,

  -- Payout tracking
  payout_batch_id UUID,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'held', 'cancelled')),
  paid_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(distributor_id, month_year)
);

CREATE INDEX IF NOT EXISTS idx_commissions_car_distributor ON commissions_car(distributor_id);
CREATE INDEX IF NOT EXISTS idx_commissions_car_month ON commissions_car(month_year);
CREATE INDEX IF NOT EXISTS idx_commissions_car_tier ON commissions_car(tier);

-- =============================================
-- 13. VACATION BONUS
-- =============================================

CREATE TABLE IF NOT EXISTS commissions_vacation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  rank_history_id UUID NOT NULL REFERENCES rank_history(id) ON DELETE CASCADE,

  -- Vacation bonus details
  rank_achieved TEXT NOT NULL,
  vacation_tier TEXT NOT NULL,
  bonus_amount_cents INTEGER NOT NULL,

  -- Cash equivalent option
  is_cash_equivalent BOOLEAN DEFAULT FALSE,

  -- Payout tracking
  payout_batch_id UUID,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'held', 'cancelled')),
  paid_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(distributor_id, rank_achieved) -- One vacation bonus per rank
);

CREATE INDEX IF NOT EXISTS idx_commissions_vacation_distributor ON commissions_vacation(distributor_id);

-- =============================================
-- 14. INFINITY POOL
-- =============================================

CREATE TABLE IF NOT EXISTS commissions_infinity_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Pool details
  month_year TEXT NOT NULL,
  rank TEXT NOT NULL,
  shares INTEGER NOT NULL, -- 1, 2, or 4
  total_pool_cents INTEGER NOT NULL, -- 3% of company BV
  total_shares INTEGER NOT NULL, -- Company-wide shares
  commission_per_share_cents INTEGER NOT NULL,
  total_commission_cents INTEGER NOT NULL,

  -- Qualification
  gbv_at_qualification INTEGER NOT NULL,

  -- Payout tracking (paid on 20th)
  payout_batch_id UUID,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'held', 'cancelled')),
  paid_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(distributor_id, month_year)
);

CREATE INDEX IF NOT EXISTS idx_commissions_pool_distributor ON commissions_infinity_pool(distributor_id);
CREATE INDEX IF NOT EXISTS idx_commissions_pool_month ON commissions_infinity_pool(month_year);

-- =============================================
-- 15. PAYOUT BATCHES (ACH Processing)
-- =============================================

CREATE TABLE IF NOT EXISTS payout_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number TEXT NOT NULL UNIQUE, -- e.g., "PAYOUT-2026-02"

  -- Batch details
  month_year TEXT NOT NULL, -- Which month's commissions
  payout_type TEXT NOT NULL CHECK (payout_type IN ('monthly', 'weekly_retail', 'infinity_pool')),

  -- Totals
  distributor_count INTEGER NOT NULL DEFAULT 0,
  total_amount_cents INTEGER NOT NULL DEFAULT 0,

  -- ACH file generation
  ach_file_generated BOOLEAN DEFAULT FALSE,
  ach_file_path TEXT,
  ach_file_generated_at TIMESTAMPTZ,
  ach_file_generated_by UUID REFERENCES admins(id),

  -- Status
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_review', 'approved', 'processing', 'completed', 'failed', 'cancelled')),

  -- Approval tracking
  approved_by UUID REFERENCES admins(id),
  approved_at TIMESTAMPTZ,

  -- Processing tracking
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,

  -- Safeguard tracking
  payout_ratio DECIMAL(5,4), -- Total payouts / total revenue
  safeguard_flags TEXT[], -- e.g., ['payout_ratio_exceeded', 'cash_reserve_low']

  -- Metadata
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payout_batches_month ON payout_batches(month_year);
CREATE INDEX IF NOT EXISTS idx_payout_batches_status ON payout_batches(status);
CREATE INDEX IF NOT EXISTS idx_payout_batches_type ON payout_batches(payout_type);

-- =============================================
-- 16. PAYOUT ITEMS (Individual Distributor Payouts)
-- =============================================

CREATE TABLE IF NOT EXISTS payout_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_batch_id UUID NOT NULL REFERENCES payout_batches(id) ON DELETE CASCADE,
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Payout details
  total_amount_cents INTEGER NOT NULL,

  -- ACH details
  bank_account_holder_name TEXT,
  bank_routing_number TEXT,
  bank_account_number_last4 TEXT, -- Only store last 4 digits for display
  bank_account_type TEXT CHECK (bank_account_type IN ('checking', 'savings')),

  -- Status
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'failed', 'cancelled', 'held')),

  -- Failure tracking
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Timestamps
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(payout_batch_id, distributor_id) -- One payout per distributor per batch
);

CREATE INDEX IF NOT EXISTS idx_payout_items_batch ON payout_items(payout_batch_id);
CREATE INDEX IF NOT EXISTS idx_payout_items_distributor ON payout_items(distributor_id);
CREATE INDEX IF NOT EXISTS idx_payout_items_status ON payout_items(status);

-- =============================================
-- 17. BANK ACCOUNTS (For ACH Payouts)
-- =============================================

CREATE TABLE IF NOT EXISTS distributor_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE UNIQUE,

  -- Bank details (encrypted in production)
  account_holder_name TEXT NOT NULL,
  routing_number TEXT NOT NULL,
  account_number_encrypted TEXT NOT NULL, -- Encrypted full account number
  account_number_last4 TEXT NOT NULL, -- Last 4 for display
  account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings')),

  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verification_method TEXT, -- e.g., 'micro_deposits', 'instant', 'manual'

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_distributor ON distributor_bank_accounts(distributor_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_verified ON distributor_bank_accounts(is_verified);

-- =============================================
-- 18. TRIGGERS
-- =============================================

CREATE TRIGGER update_payout_batches_updated_at
  BEFORE UPDATE ON payout_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON distributor_bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 19. ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all commission tables
ALTER TABLE rank_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions_retail ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions_cab ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions_customer_milestone ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions_retention ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions_matching ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions_override ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions_infinity ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions_fast_start ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions_rank_advancement ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions_car ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions_vacation ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions_infinity_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributor_bank_accounts ENABLE ROW LEVEL SECURITY;

-- Distributors can view their own commission records
CREATE POLICY "Distributors view own commissions"
  ON commissions_retail FOR SELECT
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

-- Repeat for all commission tables (same pattern)
CREATE POLICY "Distributors view own CAB"
  ON commissions_cab FOR SELECT
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Distributors view own milestones"
  ON commissions_customer_milestone FOR SELECT
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Distributors view own retention"
  ON commissions_retention FOR SELECT
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Distributors view own matrix"
  ON commissions_matrix FOR SELECT
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Distributors view own matching"
  ON commissions_matching FOR SELECT
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Distributors view own override"
  ON commissions_override FOR SELECT
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Distributors view own infinity"
  ON commissions_infinity FOR SELECT
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Distributors view own fast start"
  ON commissions_fast_start FOR SELECT
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Distributors view own rank advancement"
  ON commissions_rank_advancement FOR SELECT
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Distributors view own car"
  ON commissions_car FOR SELECT
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Distributors view own vacation"
  ON commissions_vacation FOR SELECT
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Distributors view own pool"
  ON commissions_infinity_pool FOR SELECT
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Distributors view own payouts"
  ON payout_items FOR SELECT
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Distributors view own rank history"
  ON rank_history FOR SELECT
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

-- Bank accounts: Distributors can manage their own
CREATE POLICY "Distributors manage own bank account"
  ON distributor_bank_accounts FOR ALL
  USING (distributor_id IN (SELECT id FROM distributors WHERE auth_user_id = auth.uid()));

-- Payout batches: Admins only
CREATE POLICY "Admins manage payout batches"
  ON payout_batches FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

-- =============================================
-- 20. COMMENTS
-- =============================================

COMMENT ON TABLE commissions_retail IS 'Weekly retail cash commissions (retail price - wholesale price)';
COMMENT ON TABLE commissions_cab IS 'Customer Acquisition Bonuses ($5-$75 based on first order BV)';
COMMENT ON TABLE commissions_matrix IS 'Matrix commissions from Levels 1-7 (rates by rank)';
COMMENT ON TABLE commissions_matching IS 'Matching bonuses on personally sponsored distributors (Gen 1-3)';
COMMENT ON TABLE commissions_override IS 'Override bonuses on lower-ranked downline';
COMMENT ON TABLE commissions_infinity IS 'Coded Infinity Bonus from Level 8+ (unlimited depth)';
COMMENT ON TABLE commissions_rank_advancement IS 'One-time bonuses for achieving new ranks ($250-$50k)';
COMMENT ON TABLE commissions_car IS 'Monthly car bonuses ($500-$2k based on rank + GBV)';
COMMENT ON TABLE commissions_vacation IS 'One-time vacation bonuses per rank ($500-$30k)';
COMMENT ON TABLE commissions_infinity_pool IS '3% of company BV divided by Diamond+ shares';
COMMENT ON TABLE payout_batches IS 'Monthly ACH payout batches';
COMMENT ON TABLE payout_items IS 'Individual distributor payouts within batches';
COMMENT ON TABLE distributor_bank_accounts IS 'ACH bank account details for payouts';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
