/**
 * Database Schema Types
 *
 * TypeScript types for core database tables.
 * Generated from Supabase migrations.
 *
 * IMPORTANT: This file provides type safety for database queries.
 * Always import types from this file instead of defining inline.
 *
 * @module db/schema
 */

// =============================================
// CORE TABLES
// =============================================

/**
 * Distributors Table
 *
 * Main rep/distributor table with auth relationship
 *
 * DUAL-TREE SYSTEM:
 * - sponsor_id: Enrollment tree (who enrolled whom) - For L1 overrides
 * - matrix_parent_id: Matrix tree (5×7 forced matrix) - For L2-L5 overrides
 *
 * NEVER MIX THESE TREES!
 */
export interface Distributor {
  id: string;
  auth_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  slug: string;
  rep_number: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;
  date_of_birth: string | null;

  // Enrollment Tree
  sponsor_id: string | null; // Use for L1 overrides (30%), team counting

  // Matrix Tree
  matrix_parent_id: string | null; // Use for L2-L5 overrides, spillover
  matrix_position: number | null; // Position under matrix parent (1-5)
  matrix_depth: number; // Depth in matrix tree

  // Status
  status: 'active' | 'inactive' | 'suspended' | 'deleted';
  current_rank: string | null;

  // Deprecated/Cached Fields - DO NOT USE
  /** @deprecated Use members.personal_credits_monthly instead (cached/stale) */
  personal_bv_monthly: number | null;
  /** @deprecated Use members.team_credits_monthly instead (cached/stale) */
  group_bv_monthly: number | null;
  /** @deprecated Use COUNT query on sponsor_id instead (cached/stale) */
  downline_count: number | null;

  // Metadata
  profile_image: string | null;
  profile_photo_url: string | null;
  business_center_tier: string | null;
  ai_phone_number: string | null;
  vapi_assistant_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Members Table (SOURCE OF TRUTH FOR BV DATA)
 *
 * Dual-ladder rank tracking with monthly BV/credits
 *
 * CRITICAL: This is the ONLY source of truth for BV data!
 * Always JOIN with this table for personal_credits_monthly and team_credits_monthly
 *
 * NEVER use cached BV fields from distributors table!
 */
export interface Member {
  member_id: string;
  distributor_id: string; // Links to distributors.id

  // Identity
  email: string;
  full_name: string;

  // Dual-Ladder Ranks
  tech_rank: TechRank; // Current tech ladder rank
  insurance_rank: InsuranceRank; // Current insurance ladder rank
  paying_rank: TechRank; // Payment level (used for commission rates!)

  // LIVE BV DATA (Source of Truth)
  personal_credits_monthly: number; // ✅ USE THIS for personal BV
  team_credits_monthly: number; // ✅ USE THIS for team BV
  tech_personal_credits_monthly: number;
  tech_team_credits_monthly: number;
  insurance_personal_credits_monthly: number;
  insurance_team_credits_monthly: number;

  // Override Qualification
  override_qualified: boolean; // Auto-calculated: personal_credits_monthly >= 50

  // Rank Management
  tech_rank_achieved_at: string | null;
  tech_rank_lock_until: string | null;
  tech_rank_grace_period_start: string | null;
  insurance_rank_achieved_at: string | null;

  // MGA Shop (if insurance_rank = 'mga')
  mga_shop_id: string | null;
  mga_shop_name: string | null;
  mga_licensed_states: string[] | null;

  // Enrollment (Insurance Ladder)
  /** @deprecated For tech ladder, use distributors.sponsor_id instead */
  enroller_id: string | null;

  // Metadata
  join_date: string;
  last_active_date: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Earnings Ledger
 *
 * All commission and bonus earnings with line-item detail
 * Replaces old commissions_* tables
 */
export interface EarningsLedger {
  earning_id: string;

  // Commission Run
  run_id: string;
  run_date: string; // DATE
  pay_period_start: string; // DATE
  pay_period_end: string; // DATE

  // Member
  member_id: string;
  member_name: string; // Snapshot

  // Earning Type
  earning_type:
    | 'override'
    | 'rank_bonus'
    | 'bonus_pool'
    | 'leadership_pool'
    | 'fast_start_bonus'
    | 'generation_bonus'
    | 'business_center';

  // Source
  source_member_id: string | null;
  source_member_name: string | null;
  source_order_id: string | null;
  source_product_name: string | null;

  // Override Details
  override_level: number | null; // L1, L2, L3, L4, L5
  override_percentage: number | null; // 0.30, 0.20, 0.15, 0.10, 0.10

  // Rank Snapshot
  member_tech_rank: string | null;
  member_insurance_rank: string | null;

  // Amounts
  base_amount_cents: number;
  adjustment_cents: number;
  final_amount_cents: number; // Can be negative for clawbacks

  // Status
  status: 'pending' | 'approved' | 'paid' | 'held' | 'reversed' | 'disputed';

  // Payment Tracking
  paid_at: string | null;
  payment_method: string | null;
  payment_reference: string | null;

  // Notes
  notes: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Orders Table
 */
export interface Order {
  id: string;
  order_number: string;
  rep_id: string | null; // Distributor who made sale
  customer_id: string | null;

  // Amounts
  subtotal_cents: number;
  tax_cents: number;
  shipping_cents: number;
  total_amount_cents: number;

  // Status
  status: 'pending' | 'processing' | 'completed' | 'refunded' | 'cancelled';

  // BV Tracking
  total_bv: number;
  bv_credited: boolean;
  promotion_fund_credited: boolean;

  // Payment
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  payment_method: string | null;

  // Metadata
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Order Items Table
 */
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_cents: number;
  total_price_cents: number;
  bv_per_unit: number;
  total_bv: number;
  created_at: string;
}

/**
 * Products Table
 */
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;

  // Pricing
  member_price_cents: number; // Price for distributors
  retail_price_cents: number; // Price for customers

  // BV (Business Volume)
  bv: number; // Business volume for commission calculations

  // Status
  status: 'active' | 'inactive' | 'discontinued';
  is_digital: boolean;

  // Metadata
  image_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * CAB Clawback Queue
 *
 * Tracks orders within 60-day clawback window
 */
export interface CABClawbackQueue {
  id: string;
  rep_id: string;
  customer_id: string | null;
  order_id: string;
  cab_amount: number; // Decimal
  cancel_date: string; // TIMESTAMPTZ
  clawback_eligible_until: string; // TIMESTAMPTZ (cancel_date + 60 days)
  status: 'pending' | 'clawback' | 'cleared';
  commission_run_id: string | null;
  created_at: string;
}

/**
 * Compensation Run Status
 *
 * Tracks compensation run execution with locking
 */
export interface CompensationRunStatus {
  id: string;
  period_start: string; // DATE
  period_end: string; // DATE
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  started_at: string | null; // TIMESTAMPTZ
  completed_at: string | null; // TIMESTAMPTZ
  total_override_amount_cents: number;
  total_bonus_amount_cents: number;
  total_pool_amount_cents: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================
// ENUMS
// =============================================

export type TechRank =
  | 'starter'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'ruby'
  | 'diamond'
  | 'crown'
  | 'elite';

export type InsuranceRank =
  | 'inactive'
  | 'pre_associate'
  | 'associate'
  | 'sr_associate'
  | 'agent'
  | 'sr_agent'
  | 'mga';

export type DistributorStatus = 'active' | 'inactive' | 'suspended' | 'deleted';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'refunded' | 'cancelled';

export type EarningStatus = 'pending' | 'approved' | 'paid' | 'held' | 'reversed' | 'disputed';

export type EarningType =
  | 'override'
  | 'rank_bonus'
  | 'bonus_pool'
  | 'leadership_pool'
  | 'fast_start_bonus'
  | 'generation_bonus'
  | 'business_center';

// =============================================
// HELPER TYPES
// =============================================

/**
 * Distributor with live BV data (correct pattern)
 *
 * Use this when querying distributors and need BV data
 */
export interface DistributorWithMember extends Distributor {
  member: {
    personal_credits_monthly: number;
    team_credits_monthly: number;
    override_qualified: boolean;
    tech_rank: TechRank;
    paying_rank: TechRank;
  };
}

/**
 * Database insert types (without auto-generated fields)
 */
export type DistributorInsert = Omit<Distributor, 'id' | 'created_at' | 'updated_at'>;
export type MemberInsert = Omit<Member, 'member_id' | 'created_at' | 'updated_at'>;
export type EarningsLedgerInsert = Omit<EarningsLedger, 'earning_id' | 'created_at' | 'updated_at'>;
export type OrderInsert = Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>;

// =============================================
// NOTE: All types are already exported at their definitions
// =============================================
