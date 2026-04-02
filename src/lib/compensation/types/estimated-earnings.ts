/**
 * Real-Time Earnings Estimates - TypeScript Types
 *
 * These types support the real-time earnings estimation system where
 * estimates are created immediately after each sale and updated daily
 * until validated at month end.
 */

export type QualificationStatus = 'qualified' | 'at_risk' | 'disqualified' | 'pending';

export type EarningType =
  | 'seller_commission'
  | 'override_l1'
  | 'override_l2'
  | 'override_l3'
  | 'override_l4'
  | 'override_l5'
  | 'rank_bonus';

/**
 * Individual qualification check results
 */
export interface QualificationChecks {
  pv_check: boolean; // Has at least 50 PV this month
  retail_check: boolean; // Has at least 70% retail volume
  rank_check: boolean; // Maintains required rank for override level
  gv_check?: boolean; // Has required GV for rank (if applicable)
}

/**
 * Estimated earnings record
 */
export interface EstimatedEarning {
  id: string;
  transaction_id: string;
  member_id: string;
  run_month: string; // Format: 'YYYY-MM'
  earning_type: EarningType;
  override_level: number | null;
  estimated_amount_cents: number;

  // Snapshots at time of estimate
  snapshot_member_pv: number;
  snapshot_member_gv: number;
  snapshot_member_rank: string;
  snapshot_retail_pct: number | null;

  // Current qualification status (updated daily)
  current_qualification_status: QualificationStatus;
  qualification_checks: QualificationChecks;
  disqualification_reasons: string[];

  // Timestamps
  estimated_at: string;
  last_checked_at: string | null;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Input for creating a new estimated earning
 */
export interface CreateEstimatedEarningInput {
  transaction_id: string;
  member_id: string;
  run_month: string;
  earning_type: EarningType;
  override_level?: number;
  estimated_amount_cents: number;
  snapshot_member_pv: number;
  snapshot_member_gv: number;
  snapshot_member_rank: string;
  snapshot_retail_pct?: number;
}

/**
 * Result of creating estimated earnings for a transaction
 */
export interface EstimationResult {
  success: boolean;
  count: number; // Number of estimates created
  estimates: EstimatedEarning[];
  errors?: string[];
}

/**
 * Daily qualification check result
 */
export interface QualificationCheckResult {
  member_id: string;
  estimate_id: string;
  previous_status: QualificationStatus;
  new_status: QualificationStatus;
  checks: QualificationChecks;
  reasons: string[];
  changed: boolean;
}

/**
 * Summary of daily qualification update
 */
export interface DailyQualificationSummary {
  total_checked: number;
  total_qualified: number;
  total_at_risk: number;
  total_disqualified: number;
  total_pending: number;
  status_changes: number;
  checked_at: string;
}

/**
 * Month-end validation result
 */
export interface ValidationResult {
  estimate_id: string;
  approved: boolean;
  final_status: 'approved' | 'disqualified';
  final_amount_cents: number;
  disqualification_reason?: string;
  earnings_ledger_id?: string;
}

/**
 * Summary of month-end validation
 */
export interface MonthEndValidationSummary {
  run_month: string;
  total_estimates: number;
  approved_count: number;
  disqualified_count: number;
  approved_amount_cents: number;
  disqualified_amount_cents: number;
  results: ValidationResult[];
  validated_at: string;
}

/**
 * Dashboard view of estimated earnings for a member
 */
export interface MemberEstimatedEarningsSummary {
  member_id: string;
  run_month: string;
  total_estimated_cents: number;
  qualified_amount_cents: number;
  at_risk_amount_cents: number;
  disqualified_amount_cents: number;
  pending_amount_cents: number;

  // Breakdown by type
  seller_commission_cents: number;
  override_l1_cents: number;
  override_l2_cents: number;
  override_l3_cents: number;
  override_l4_cents: number;
  override_l5_cents: number;
  rank_bonus_cents: number;

  // Current qualification metrics
  current_pv: number;
  current_gv: number;
  current_rank: string;
  current_retail_pct: number;

  // Warnings
  at_risk_reasons: string[];
  disqualification_reasons: string[];

  // Last update
  last_checked_at: string | null;
}

/**
 * Notification data for real-time alerts
 */
export interface EstimateNotification {
  type: 'new_estimate' | 'status_change' | 'at_risk_warning' | 'disqualified';
  member_id: string;
  estimate_id: string;
  earning_type: EarningType;
  amount_cents: number;
  status: QualificationStatus;
  message: string;
  reasons?: string[];
  timestamp: string;
}
