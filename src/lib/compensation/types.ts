// Apex Affinity Group - TypeScript Types
// Generated from database schema and documentation

// ============================================================================
// ENUMS
// ============================================================================

export type RepStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';
export type Rank = 'INACTIVE' | 'ASSOCIATE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
export type ProductType = 'PULSEMARKET' | 'PULSEFLOW' | 'PULSEDRIVE' | 'PULSECOMMAND' | 'SMARTLOCK' | 'BIZCENTER';
export type PriceType = 'MEMBER' | 'RETAIL';
export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
export type CABState = 'PENDING' | 'EARNED' | 'VOIDED' | 'VOIDED_CAP' | 'CLAWBACK';
export type CommissionRunStatus = 'PENDING' | 'PROCESSING' | 'LOCKED';
export type LineItemType =
  | 'SELLER' | 'SELLER_BIZ' | 'BIZ_REFERRAL'
  | 'OVERRIDE_L1' | 'OVERRIDE_L2' | 'OVERRIDE_L3' | 'OVERRIDE_L4' | 'OVERRIDE_L5' | 'OVERRIDE_L6' | 'OVERRIDE_L7'
  | 'OVERRIDE_COMPRESSED'
  | 'CAB_EARNED' | 'CAB_CLAWBACK' | 'CAB_CLAWBACK_CARRYFORWARD'
  | 'BONUS_VOLUME_KICKER' | 'BONUS_PVB' | 'BONUS_TVB' | 'BONUS_RETENTION' | 'BONUS_MATCHING'
  | 'BONUS_CHECK_MATCH' | 'BONUS_GRS' | 'BONUS_GOLD_ACCELERATOR' | 'BONUS_INFINITY' | 'BONUS_CAR_ALLOWANCE'
  | 'CORRECTION';
export type AdminRole = 'SUPER_ADMIN' | 'FINANCE' | 'OPERATIONS' | 'SUPPORT' | 'REP';

// ============================================================================
// DATABASE MODELS
// ============================================================================

export interface Rep {
  rep_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  ssn_last4: string | null;
  date_of_birth: Date;
  enrollment_date: Date;
  status: RepStatus;

  // Genealogy
  enroller_id: string | null;  // personal sponsor (permanent)
  placement_parent_id: string | null;  // matrix position
  placement_position: number | null;  // 1-5
  matrix_path: string | null;

  // Rank
  current_rank: Rank;
  prior_month_rank: Rank | null;
  consecutive_platinum_days: number;

  // Special programs
  infinity_org_active: boolean;
  second_org_root_rep_id: string | null;
  gold_accelerator_paid: boolean;
  car_allowance_active: boolean;
  car_allowance_consecutive_months: number;

  // Financial
  clawback_carry_forward_balance: number;
  commission_carry_forward: number;

  // Compliance
  rep_agreement_version: string | null;
  rep_agreement_signed_at: Date | null;

  // Audit
  created_at: Date;
  updated_at: Date;
  terminated_at: Date | null;
  termination_reason: string | null;
}

export interface Subscription {
  subscription_id: string;
  rep_id: string;
  customer_email: string;
  customer_name: string;

  // Product
  product_id: ProductType;
  price_type: PriceType | null;
  actual_price_paid: number;
  member_price: number;  // locked at enrollment
  bv_value: number;  // always = member_price

  // Status
  status: SubscriptionStatus;
  enrollment_date: Date;
  cancellation_date: Date | null;
  suspension_date: Date | null;

  // Payment failure handling
  payment_failed_date: Date | null;
  recovery_deadline: Date | null;

  created_at: Date;
  updated_at: Date;
}

export interface CABRecord {
  cab_id: string;
  rep_id: string;
  subscription_id: string;

  // Timing
  enrollment_date: Date;
  release_eligible_date: Date;  // enrollment_date + 60 days

  // State
  state: CABState;
  amount: number;
  trigger_reason: string | null;

  // Commission run linkage
  released_in_run_id: string | null;
  clawback_applied_run_id: string | null;

  created_at: Date;
  updated_at: Date;
}

export interface BVSnapshot {
  snapshot_id: string;
  rep_id: string;
  month: number;
  year: number;
  personal_bv: number;
  team_bv: number;
  snapshot_date: Date;
  created_at: Date;
}

export interface RankSnapshot {
  rank_snapshot_id: string;
  rep_id: string;
  month: number;
  year: number;
  rank: Rank;
  personal_bv_at_snapshot: number;
  team_bv_at_snapshot: number;
  snapshot_date: Date;
  created_at: Date;
}

export interface CommissionRun {
  run_id: string;
  month: number;
  year: number;
  status: CommissionRunStatus;

  // Aggregates
  total_reps: number | null;
  total_payout: number | null;
  total_seller_commissions: number | null;
  total_overrides: number | null;
  total_cab_released: number | null;
  total_cab_clawbacks: number | null;
  total_bonuses: number | null;
  total_carry_forwards: number | null;
  total_botmakers: number | null;
  total_apex: number | null;
  total_bonus_pool_contributions: number | null;

  processed_at: Date | null;
  locked_at: Date | null;
  created_at: Date;
}

export interface CommissionLineItem {
  line_item_id: string;
  run_id: string;
  rep_id: string;
  line_type: LineItemType;
  amount: number;  // negative for clawbacks

  // Optional linkages
  subscription_id: string | null;
  cab_id: string | null;
  source_rep_id: string | null;
  override_level: number | null;
  compressed: boolean;

  notes: string | null;
  created_at: Date;
}

export interface BonusPoolRecord {
  pool_record_id: string;
  month: number;
  year: number;
  contributions: number;
  distributions: number;
  balance: number;  // computed
  pool_rate: number;
  auto_trigger_active: boolean;
  created_at: Date;
}

// ============================================================================
// CALCULATION TYPES
// ============================================================================

export interface WaterfallResult {
  grossPrice: number;
  botmakersFee: number;
  bonusPoolContribution: number;
  apexMargin: number;
  fieldRemainder: number;
  sellerCommission: number;
  overridePool: number;
  overrideLevels: {
    L1: number;
    L2: number;
    L3: number;
    L4: number;
    L5: number;
    L6?: number;  // Powerline only
    L7?: number;  // Powerline only
  };
}

export interface BizCenterSplit {
  sellerAmount: number;  // $10
  enrollerAmount: number;  // $8
}

export interface RankRequirements {
  rank: Rank;
  personalBVMin: number;
  teamBVMin: number;
}

export interface OverrideRecipient {
  rep: Rep;
  level: number;
  amount: number;
  compressed: boolean;
  originalLevel?: number;  // if compressed, what level it was supposed to be
}

export interface CommissionCalculationResult {
  rep_id: string;
  month: number;
  year: number;

  // Seller commissions
  seller_commissions: CommissionLineItem[];

  // Override commissions
  override_commissions: CommissionLineItem[];

  // CABs
  cabs_earned: CommissionLineItem[];
  cabs_clawback: CommissionLineItem[];

  // Bonuses
  bonuses: CommissionLineItem[];

  // Totals
  gross_total: number;
  clawbacks_total: number;
  net_payout: number;
  carry_forward: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface CompPlanConfig {
  waterfall: {
    botmakers_fee_pct: number;
    bonus_pool_pct: number;
    apex_margin_pct: number;
    seller_commission_pct: number;
    override_pool_pct: number;
  };
  override_percentages: {
    standard: {
      L1: number;
      L2: number;
      L3: number;
      L4: number;
      L5: number;
    };
    powerline: {
      L1: number;
      L2: number;
      L3: number;
      L4: number;
      L5: number;
      L6: number;
      L7: number;
    };
  };
  rank_thresholds: {
    INACTIVE: { personal_bv: number; team_bv: number };
    ASSOCIATE: { personal_bv: number; team_bv: number };
    BRONZE: { personal_bv: number; team_bv: number };
    SILVER: { personal_bv: number; team_bv: number };
    GOLD: { personal_bv: number; team_bv: number };
    PLATINUM: { personal_bv: number; team_bv: number };
  };
  bonuses: {
    cab: {
      amount: number;
      retention_days: number;
      monthly_cap: number;
    };
    gold_accelerator: number;
    infinity_bonus: {
      monthly_amount: number;
      required_consecutive_platinum_days: number;
      second_org_bv_threshold: number;
    };
  };
  powerline: {
    threshold_bv: number;
    required_rank: Rank;
  };
  minimum_payout: number;
}
