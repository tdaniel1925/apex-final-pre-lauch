// =============================================
// DUAL-LADDER COMPENSATION ENGINE - TYPES
// =============================================
// Source: APEX_COMP_ENGINE_SPEC_FINAL.md
// Phase: 3 (Build New TypeScript Code)
// Agent: 2 (TypeScript Type Architect)
// =============================================

/**
 * Product types in the compensation system
 *
 * - standard: PulseGuard, PulseFlow, PulseDrive, PulseCommand, SmartLook
 * - business_center: Fixed $39/mo product with special commission rules
 */
export type ProductType = 'standard' | 'business_center';

/**
 * Member status values
 */
export type MemberStatus = 'active' | 'inactive' | 'suspended' | 'terminated';

/**
 * Commission run processing status
 */
export type CommissionRunStatus = 'pending' | 'processing' | 'completed' | 'locked' | 'failed';

/**
 * Audit log action types
 */
export type AuditAction =
  | 'created'
  | 'updated'
  | 'activated'
  | 'deactivated'
  | 'deleted';

// =============================================
// COMPENSATION PLAN CONFIGURATION
// =============================================

/**
 * Top-level compensation plan configuration
 *
 * Represents a versioned compensation plan with an effective date.
 * Multiple versions can exist, but only one should be active at a time.
 *
 * @example
 * {
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   name: 'Q1 2026 Plan',
 *   version: 1,
 *   effectiveDate: '2026-01-01T00:00:00Z',
 *   isActive: true,
 *   description: 'Standard dual-ladder plan for Q1 2026'
 * }
 */
export interface CompensationPlanConfig {
  /** Unique identifier for this plan configuration */
  id: string;

  /** Human-readable plan name (e.g., "Q1 2026 Plan", "Standard Plan v2") */
  name: string;

  /** Incremental version number (1, 2, 3...) */
  version: number;

  /** ISO 8601 date when this plan becomes effective */
  effectiveDate: string;

  /** User ID who created this configuration (optional for system-created plans) */
  createdBy?: string;

  /** ISO 8601 timestamp when configuration was created */
  createdAt: string;

  /** ISO 8601 timestamp when configuration was last updated */
  updatedAt: string;

  /** Whether this plan is currently active (only one should be active) */
  isActive: boolean;

  /** Optional description of this plan or what changed */
  description?: string;
}

// =============================================
// TECH RANK CONFIGURATION
// =============================================

/**
 * Configuration for a single tech ladder rank
 *
 * Defines all requirements and benefits for achieving a specific rank:
 * - Credit requirements (personal + group)
 * - Downline requirements (sponsored members at specific ranks)
 * - One-time rank bonus
 * - Override schedule (L1-L5 percentages)
 * - Grace period and rank lock rules
 *
 * @example
 * {
 *   id: 'rank-silver-123',
 *   planConfigId: 'plan-123',
 *   rankName: 'silver',
 *   rankOrder: 2,
 *   personalCreditsRequired: 500,
 *   groupCreditsRequired: 1500,
 *   downlineRequirements: null,
 *   rankBonusCents: 100000, // $1,000
 *   overrideSchedule: [0.30, 0.10, 0.05, 0.00, 0.00],
 *   gracePeriodMonths: 2,
 *   rankLockMonths: 6
 * }
 */
export interface TechRankConfig {
  /** Unique identifier for this rank configuration */
  id: string;

  /** Reference to parent compensation plan */
  planConfigId: string;

  /**
   * Rank name (one of the 9 tech ranks)
   * @see TECH_RANKS in config.ts
   */
  rankName: string;

  /**
   * Rank order/level (0-8)
   * 0 = starter, 1 = bronze, 2 = silver, ... 8 = elite
   */
  rankOrder: number;

  /** Minimum personal production credits required per month */
  personalCreditsRequired: number;

  /** Minimum group (team) production credits required per month */
  groupCreditsRequired: number;

  /**
   * Downline rank requirements (sponsored members only)
   *
   * @example
   * // Gold requires 1 Bronze sponsored
   * { "bronze": 1 }
   *
   * @example
   * // Diamond requires 3 Golds OR 2 Platinums (OR condition)
   * [{ "gold": 3 }, { "platinum": 2 }]
   */
  downlineRequirements?: Record<string, number> | Record<string, number>[];

  /**
   * One-time rank advancement bonus (in cents)
   * Paid once per rank per lifetime
   */
  rankBonusCents: number;

  /**
   * Override percentages for levels L1-L5
   *
   * Format: [L1, L2, L3, L4, L5]
   * - L1 is always 0.30 (30%) for all ranks (Enroller Override Rule)
   * - Higher ranks unlock deeper levels with higher percentages
   * - Percentages are of the OVERRIDE POOL, not retail price
   *
   * @example
   * // Silver rank: L1-L3 unlocked
   * [0.30, 0.10, 0.05, 0.00, 0.00]
   *
   * @example
   * // Platinum rank: L1-L5 unlocked
   * [0.30, 0.18, 0.12, 0.08, 0.03]
   */
  overrideSchedule: [number, number, number, number, number];

  /**
   * Grace period in months before demotion (default: 2)
   * Member has this many months below requirements before rank decreases
   */
  gracePeriodMonths: number;

  /**
   * Rank lock period in months for new reps (default: 6)
   * New members cannot be demoted for this period
   */
  rankLockMonths: number;
}

// =============================================
// WATERFALL CONFIGURATION
// =============================================

/**
 * Revenue waterfall configuration per product type
 *
 * Defines how revenue is split between:
 * - BotMakers (platform fee)
 * - Apex (company margin)
 * - Bonus Pool (3.5% for rank achievers)
 * - Leadership Pool (1.5% for Elite members)
 * - Seller Commission (60% of commission pool)
 * - Override Pool (40% of commission pool)
 *
 * Standard products use percentage-based waterfall.
 * Business Center uses fixed dollar amounts.
 *
 * @see WATERFALL_CONFIG in config.ts for standard waterfall
 * @see BUSINESS_CENTER_CONFIG in config.ts for fixed amounts
 */
export interface WaterfallConfig {
  /** Unique identifier for this waterfall configuration */
  id: string;

  /** Reference to parent compensation plan */
  planConfigId: string;

  /** Product type this waterfall applies to */
  productType: ProductType;

  /** BotMakers platform fee percentage (0.0-1.0) */
  botmakersPct: number;

  /** Apex company margin percentage (0.0-1.0) */
  apexPct: number;

  /** Bonus pool percentage (0.0-1.0, typically 0.035 = 3.5%) */
  bonusPoolPct: number;

  /** Leadership pool percentage (0.0-1.0, typically 0.015 = 1.5%) */
  leadershipPoolPct: number;

  /** Seller commission percentage of commission pool (0.0-1.0, typically 0.60 = 60%) */
  sellerCommissionPct: number;

  /** Override pool percentage of commission pool (0.0-1.0, typically 0.40 = 40%) */
  overridePoolPct: number;
}

// =============================================
// BONUS PROGRAM CONFIGURATION
// =============================================

/**
 * Configuration for bonus programs
 *
 * Supports various bonus types:
 * - Rank bonuses (one-time for rank advancement)
 * - Bonus pool sharing (equal share among qualified members)
 * - Leadership pool (proportional for Elite members)
 * - Custom bonus programs (flexible JSON config)
 *
 * @example
 * {
 *   id: 'bonus-rank-123',
 *   planConfigId: 'plan-123',
 *   programName: 'rank_advancement_bonuses',
 *   enabled: true,
 *   configJson: {
 *     oneTimeOnly: true,
 *     requiresOverrideQualification: true
 *   }
 * }
 *
 * @example
 * {
 *   id: 'bonus-leadership-123',
 *   planConfigId: 'plan-123',
 *   programName: 'leadership_pool',
 *   enabled: true,
 *   configJson: {
 *     eligibleRanks: ['elite'],
 *     distributionMethod: 'proportional_by_production'
 *   }
 * }
 */
export interface BonusProgramConfig {
  /** Unique identifier for this bonus program */
  id: string;

  /** Reference to parent compensation plan */
  planConfigId: string;

  /**
   * Program identifier
   *
   * Common programs:
   * - 'rank_advancement_bonuses'
   * - 'bonus_pool_sharing'
   * - 'leadership_pool'
   * - 'sponsor_bonus' (Business Center only)
   */
  programName: string;

  /** Whether this program is currently active */
  enabled: boolean;

  /**
   * Flexible JSON configuration specific to this program
   * Schema varies by programName
   */
  configJson: Record<string, unknown>;
}

// =============================================
// AUDIT LOG
// =============================================

/**
 * Audit log entry for compensation configuration changes
 *
 * Tracks all administrative changes to compensation plans:
 * - Plan creation/updates
 * - Activation/deactivation
 * - Field-level changes
 *
 * @example
 * {
 *   id: 'audit-123',
 *   adminId: 'user-456',
 *   action: 'updated',
 *   configId: 'plan-789',
 *   changes: {
 *     bonusPoolPct: { old: 0.035, new: 0.04 }
 *   },
 *   timestamp: '2026-03-16T10:30:00Z'
 * }
 */
export interface CompensationConfigAuditLog {
  /** Unique identifier for this audit entry */
  id: string;

  /** User ID who performed the action (null for system actions) */
  adminId?: string;

  /** Type of action performed */
  action: AuditAction;

  /** ID of the config that was changed (if applicable) */
  configId?: string;

  /**
   * Detailed changes (for 'updated' actions)
   * Format: { fieldName: { old: value, new: value } }
   */
  changes?: Record<string, { old: unknown; new: unknown }>;

  /** ISO 8601 timestamp when action occurred */
  timestamp: string;

  /** Optional notes or reason for change */
  notes?: string;
}

// =============================================
// COMPOSITE TYPES
// =============================================

/**
 * Full compensation configuration with all related data
 *
 * Combines all configuration tables into a single object
 * for easier access and validation.
 *
 * Used by commission run engine to load active configuration.
 */
export interface FullCompensationConfig {
  /** The compensation plan metadata */
  plan: CompensationPlanConfig;

  /** All tech rank configurations for this plan (9 ranks) */
  techRanks: TechRankConfig[];

  /** Waterfall configurations (standard + business_center) */
  waterfalls: WaterfallConfig[];

  /** All bonus programs for this plan */
  bonusPrograms: BonusProgramConfig[];
}

// =============================================
// API REQUEST/RESPONSE TYPES
// =============================================

/**
 * Request to create a new compensation plan configuration
 */
export interface CreateConfigRequest {
  /** Human-readable plan name */
  name: string;

  /** Optional description */
  description?: string;

  /** ISO 8601 date when plan becomes effective */
  effectiveDate: string;

  /**
   * Whether to copy from existing plan (optional)
   * If provided, copies all rank/waterfall/bonus configs from that plan
   */
  copyFromPlanId?: string;
}

/**
 * Response after creating a new compensation plan
 */
export interface CreateConfigResponse {
  /** The created plan configuration */
  plan: CompensationPlanConfig;

  /** Whether data was copied from another plan */
  copiedFrom?: string;
}

/**
 * Request to update an existing compensation plan
 */
export interface UpdateConfigRequest {
  /** New plan name (optional) */
  name?: string;

  /** New description (optional) */
  description?: string;

  /** New effective date (optional) */
  effectiveDate?: string;
}

/**
 * Request to activate a specific compensation plan
 * Deactivates all other plans automatically
 */
export interface ActivateConfigRequest {
  /** ID of the plan to activate */
  configId: string;

  /** Optional reason for activation */
  reason?: string;
}

/**
 * Response after activating a plan
 */
export interface ActivateConfigResponse {
  /** The activated plan */
  activatedPlan: CompensationPlanConfig;

  /** IDs of plans that were deactivated */
  deactivatedPlanIds: string[];
}

/**
 * Request to update tech rank configuration
 */
export interface UpdateTechRankRequest {
  /** New personal credits requirement (optional) */
  personalCreditsRequired?: number;

  /** New group credits requirement (optional) */
  groupCreditsRequired?: number;

  /** New downline requirements (optional) */
  downlineRequirements?: Record<string, number> | Record<string, number>[];

  /** New rank bonus amount in cents (optional) */
  rankBonusCents?: number;

  /** New override schedule (optional) */
  overrideSchedule?: [number, number, number, number, number];

  /** New grace period in months (optional) */
  gracePeriodMonths?: number;

  /** New rank lock period in months (optional) */
  rankLockMonths?: number;
}

/**
 * Request to update waterfall configuration
 */
export interface UpdateWaterfallRequest {
  /** New BotMakers percentage (optional) */
  botmakersPct?: number;

  /** New Apex percentage (optional) */
  apexPct?: number;

  /** New bonus pool percentage (optional) */
  bonusPoolPct?: number;

  /** New leadership pool percentage (optional) */
  leadershipPoolPct?: number;

  /** New seller commission percentage (optional) */
  sellerCommissionPct?: number;

  /** New override pool percentage (optional) */
  overridePoolPct?: number;
}

// =============================================
// COMMISSION RUN TYPES
// =============================================

/**
 * Commission run record
 *
 * Represents a monthly commission calculation cycle.
 * Immutable after locking.
 */
export interface CommissionRun {
  /** Unique identifier for this commission run */
  id: string;

  /** Month (1-12) this run is for */
  month: number;

  /** Year this run is for */
  year: number;

  /** Current processing status */
  status: CommissionRunStatus;

  /** Compensation plan used for this run */
  planConfigId: string;

  /** ISO 8601 timestamp when run was created */
  createdAt: string;

  /** ISO 8601 timestamp when processing started */
  processingStartedAt?: string;

  /** ISO 8601 timestamp when processing completed */
  completedAt?: string;

  /** ISO 8601 timestamp when run was locked (immutable) */
  lockedAt?: string;

  /** User who locked the run */
  lockedBy?: string;

  /** Total members processed */
  totalMembers?: number;

  /** Total payout amount in cents */
  totalPayoutCents?: number;

  /** Total seller commissions in cents */
  totalSellerCommissionsCents?: number;

  /** Total override commissions in cents */
  totalOverridesCents?: number;

  /** Total rank bonuses paid in cents */
  totalRankBonusesCents?: number;

  /** Total bonus pool distributions in cents */
  totalBonusPoolCents?: number;

  /** Total leadership pool distributions in cents */
  totalLeadershipPoolCents?: number;

  /** Processing errors (if status = 'failed') */
  errors?: string[];
}

/**
 * Individual earning line item within a commission run
 */
export interface EarningLineItem {
  /** Unique identifier */
  id: string;

  /** Commission run this belongs to */
  runId: string;

  /** Member who earned this */
  memberId: string;

  /**
   * Type of earning
   *
   * Common types:
   * - 'seller_commission' - Direct sales commission
   * - 'override_l1' through 'override_l5' - Override levels
   * - 'rank_bonus' - One-time rank advancement bonus
   * - 'bonus_pool_share' - Share of bonus pool
   * - 'leadership_pool_share' - Share of leadership pool
   * - 'sponsor_bonus' - Business Center sponsor bonus
   */
  earningType: string;

  /** Amount in cents (can be negative for clawbacks) */
  amountCents: number;

  /** Source transaction ID (subscription, sale, etc.) */
  sourceTransactionId?: string;

  /** Source member ID (for overrides - who generated the sale) */
  sourceMemberId?: string;

  /** Override level (1-5, if applicable) */
  overrideLevel?: number;

  /** Product type (if applicable) */
  productType?: ProductType;

  /** Notes or calculation details */
  notes?: string;

  /** ISO 8601 timestamp when created */
  createdAt: string;
}

// =============================================
// VALIDATION TYPES
// =============================================

/**
 * Validation result for compensation configuration
 */
export interface ConfigValidationResult {
  /** Whether configuration is valid */
  valid: boolean;

  /** Validation errors (if any) */
  errors: ConfigValidationError[];

  /** Validation warnings (non-blocking issues) */
  warnings: ConfigValidationWarning[];
}

/**
 * Validation error
 */
export interface ConfigValidationError {
  /** Field or section with error */
  field: string;

  /** Error message */
  message: string;

  /** Current invalid value */
  currentValue?: unknown;

  /** Expected value or constraint */
  expected?: string;
}

/**
 * Validation warning
 */
export interface ConfigValidationWarning {
  /** Field or section with warning */
  field: string;

  /** Warning message */
  message: string;

  /** Suggestion for improvement */
  suggestion?: string;
}

// =============================================
// TYPE GUARDS
// =============================================

/**
 * Check if value is a valid ProductType
 */
export function isProductType(value: unknown): value is ProductType {
  return value === 'standard' || value === 'business_center';
}

/**
 * Check if value is a valid MemberStatus
 */
export function isMemberStatus(value: unknown): value is MemberStatus {
  return (
    value === 'active' ||
    value === 'inactive' ||
    value === 'suspended' ||
    value === 'terminated'
  );
}

/**
 * Check if value is a valid CommissionRunStatus
 */
export function isCommissionRunStatus(value: unknown): value is CommissionRunStatus {
  return (
    value === 'pending' ||
    value === 'processing' ||
    value === 'completed' ||
    value === 'locked' ||
    value === 'failed'
  );
}

/**
 * Check if value is a valid AuditAction
 */
export function isAuditAction(value: unknown): value is AuditAction {
  return (
    value === 'created' ||
    value === 'updated' ||
    value === 'activated' ||
    value === 'deactivated' ||
    value === 'deleted'
  );
}

// =============================================
// UTILITY TYPES
// =============================================

/**
 * Partial update type for any config entity
 */
export type PartialUpdate<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * ID reference types for foreign keys
 */
export type PlanConfigId = string;
export type MemberId = string;
export type RunId = string;
export type TransactionId = string;

/**
 * Override level (1-5)
 */
export type OverrideLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Month (1-12)
 */
export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
