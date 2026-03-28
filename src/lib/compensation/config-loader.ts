// =============================================
// DUAL-LADDER COMPENSATION ENGINE - CONFIG LOADER
// =============================================
// Source: APEX_COMP_ENGINE_SPEC_FINAL.md
// Phase: 3 (Build New TypeScript Code)
// Agent: 5 (Integration Engineer)
// =============================================
//
// PURPOSE: Database-ready configuration loader with in-memory caching
//
// ARCHITECTURE:
// - Layer between hardcoded config and future database-driven config
// - In-memory cache (5-minute TTL)
// - Graceful fallback to hardcoded defaults
// - Type-safe loading and validation
// - Zero-downtime migration path
//
// FUTURE MIGRATION:
// When database config is ready, update loadFromDatabase() functions
// to query actual DB tables. Cache layer remains unchanged.
// =============================================

import { createClient } from '@/lib/supabase/client';
import {
  TECH_RANKS,
  TECH_RANK_REQUIREMENTS,
  RANKED_OVERRIDE_SCHEDULES,
  WATERFALL_CONFIG,
  BUSINESS_CENTER_CONFIG,
  OVERRIDE_QUALIFICATION_MIN_CREDITS,
  PAY_LEVEL_GRACE_PERIOD_DAYS,
  LEADERSHIP_POOL_ELIGIBLE_RANK,
  BONUS_POOL_DISTRIBUTION_METHOD,
  ENROLLER_OVERRIDE_RATE,
  INSURANCE_TO_TECH_CROSSCREDIT_PCT,
  COMMISSION_RUN_CONFIG,
  TechRank,
  TechRankRequirements,
  ProductType,
} from './config';

// =============================================
// CACHE CONFIGURATION
// =============================================

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface ConfigCache {
  techRanks: CacheEntry<readonly TechRank[]> | null;
  techRankRequirements: CacheEntry<TechRankRequirements[]> | null;
  overrideSchedules: CacheEntry<Record<TechRank, [number, number, number, number, number]>> | null;
  waterfallConfig: CacheEntry<WaterfallConfig> | null;
  businessCenterConfig: CacheEntry<BusinessCenterConfig> | null;
}

const cache: ConfigCache = {
  techRanks: null,
  techRankRequirements: null,
  overrideSchedules: null,
  waterfallConfig: null,
  businessCenterConfig: null,
};

// =============================================
// TYPE DEFINITIONS
// =============================================

export interface WaterfallConfig {
  botmakersPct: number;
  apexTakePct: number;
  bonusPoolPct: number;
  leadershipPoolPct: number;
  sellerCommissionPct: number;
  overridePoolPct: number;
  productType?: ProductType;
}

export interface BusinessCenterConfig {
  priceCents: number;
  botmakersFeeCents: number;
  apexTakeCents: number;
  sellerCommissionCents: number;
  sponsorBonusCents: number;
  costsCents: number;
  overridePoolCents: number;
  bonusPoolCents: number;
  leadershipPoolCents: number;
  credits: number;
}

export interface CompensationConstants {
  overrideQualificationMinCredits: number;
  rankGracePeriodDays: number;
  leadershipPoolEligibleRank: TechRank;
  bonusPoolDistributionMethod: 'equal_share';
  enrollerOverrideRate: number;
  insuranceToTechCrosscreditPct: number;
}

export interface CommissionRunConfig {
  promotionEffectiveDelayMonths: number;
  rankBonusOneTimeOnly: boolean;
}

// =============================================
// CACHE UTILITIES
// =============================================

/**
 * Check if cached data is still valid
 */
function isCacheValid<T>(entry: CacheEntry<T> | null): boolean {
  if (!entry) return false;
  const age = Date.now() - entry.timestamp;
  return age < CACHE_TTL_MS;
}

/**
 * Create cache entry
 */
function createCacheEntry<T>(data: T): CacheEntry<T> {
  return {
    data,
    timestamp: Date.now(),
  };
}

/**
 * Clear all cache entries
 */
export function clearConfigCache(): void {
  cache.techRanks = null;
  cache.techRankRequirements = null;
  cache.overrideSchedules = null;
  cache.waterfallConfig = null;
  cache.businessCenterConfig = null;
}

// =============================================
// TECH RANKS
// =============================================

/**
 * Get Tech Ladder Ranks
 *
 * Current: Returns hardcoded TECH_RANKS from config.ts
 * Future: Load from compensation_plan_config table
 *
 * @returns Array of tech ranks in order (lowest to highest)
 */
export async function getTechRanks(): Promise<readonly TechRank[]> {
  // Check cache first
  if (isCacheValid(cache.techRanks)) {
    return cache.techRanks!.data;
  }

  try {
    // FUTURE: Load from database
    // const ranks = await loadTechRanksFromDatabase();
    // if (ranks) {
    //   cache.techRanks = createCacheEntry(ranks);
    //   return ranks;
    // }

    // Fallback to hardcoded config
    const ranks = TECH_RANKS;
    cache.techRanks = createCacheEntry(ranks);
    return ranks;
  } catch (error) {
    // Log error (future: send to monitoring system)
    // console.error('Error loading tech ranks:', error);
    // Always fallback to hardcoded
    return TECH_RANKS;
  }
}

/**
 * FUTURE: Load tech ranks from database
 *
 * Uncomment and implement when compensation_plan_config table is ready
 */
// async function loadTechRanksFromDatabase(): Promise<readonly TechRank[] | null> {
//   const supabase = createClient();
//   const { data, error } = await supabase
//     .from('compensation_plan_config')
//     .select('tech_ranks')
//     .eq('active', true)
//     .single();
//
//   if (error || !data) return null;
//   return data.tech_ranks as readonly TechRank[];
// }

// =============================================
// TECH RANK REQUIREMENTS
// =============================================

/**
 * Get Tech Rank Requirements
 *
 * Current: Returns hardcoded TECH_RANK_REQUIREMENTS from config.ts
 * Future: Load from rank_requirements table
 *
 * @returns Array of rank requirements with thresholds
 */
export async function getTechRankRequirements(): Promise<TechRankRequirements[]> {
  // Check cache first
  if (isCacheValid(cache.techRankRequirements)) {
    return cache.techRankRequirements!.data;
  }

  try {
    // FUTURE: Load from database
    // const requirements = await loadRankRequirementsFromDatabase();
    // if (requirements) {
    //   cache.techRankRequirements = createCacheEntry(requirements);
    //   return requirements;
    // }

    // Fallback to hardcoded config
    const requirements = TECH_RANK_REQUIREMENTS;
    cache.techRankRequirements = createCacheEntry(requirements);
    return requirements;
  } catch (error) {
    // Log error (future: send to monitoring system)
    // console.error('Error loading tech rank requirements:', error);
    // Always fallback to hardcoded
    return TECH_RANK_REQUIREMENTS;
  }
}

/**
 * FUTURE: Load rank requirements from database
 *
 * Uncomment and implement when rank_requirements table is ready
 */
// async function loadRankRequirementsFromDatabase(): Promise<TechRankRequirements[] | null> {
//   const supabase = createClient();
//   const { data, error } = await supabase
//     .from('rank_requirements')
//     .select('*')
//     .order('rank_value', { ascending: true });
//
//   if (error || !data) return null;
//   return data.map((row) => ({
//     name: row.rank_name as TechRank,
//     personal: row.personal_credits_required,
//     group: row.group_credits_required,
//     downline: row.downline_requirements ? JSON.parse(row.downline_requirements) : undefined,
//     bonus: row.rank_bonus_cents,
//     overrideDepth: row.override_depth,
//   }));
// }

// =============================================
// OVERRIDE SCHEDULES
// =============================================

/**
 * Get Ranked Override Schedules
 *
 * Current: Returns hardcoded RANKED_OVERRIDE_SCHEDULES from config.ts
 * Future: Load from override_schedules table
 *
 * @returns Map of rank → override percentages [L1, L2, L3, L4, L5]
 */
export async function getOverrideSchedules(): Promise<Record<TechRank, [number, number, number, number, number]>> {
  // Check cache first
  if (isCacheValid(cache.overrideSchedules)) {
    return cache.overrideSchedules!.data;
  }

  try {
    // FUTURE: Load from database
    // const schedules = await loadOverrideSchedulesFromDatabase();
    // if (schedules) {
    //   cache.overrideSchedules = createCacheEntry(schedules);
    //   return schedules;
    // }

    // Fallback to hardcoded config
    const schedules = RANKED_OVERRIDE_SCHEDULES;
    cache.overrideSchedules = createCacheEntry(schedules);
    return schedules;
  } catch (error) {
    // Log error (future: send to monitoring system)
    // console.error('Error loading override schedules:', error);
    // Always fallback to hardcoded
    return RANKED_OVERRIDE_SCHEDULES;
  }
}

/**
 * Get override percentage for a specific rank and level
 *
 * @param rank - Tech rank
 * @param level - Override level (1-5)
 * @returns Percentage (0.0-0.30) or 0 if level not unlocked
 */
export async function getOverridePercentage(rank: TechRank, level: number): Promise<number> {
  if (level < 1 || level > 5) return 0;
  const schedules = await getOverrideSchedules();
  const schedule = schedules[rank];
  return schedule ? schedule[level - 1] : 0;
}

// =============================================
// WATERFALL CONFIG
// =============================================

/**
 * Get Waterfall Configuration
 *
 * Current: Returns hardcoded WATERFALL_CONFIG from config.ts
 * Future: Load from waterfall_config table
 *
 * @param productType - 'standard' or 'business_center'
 * @returns Waterfall percentage configuration
 */
export async function getWaterfallConfig(productType: ProductType = 'standard'): Promise<WaterfallConfig> {
  // Business Center has special handling
  if (productType === 'business_center') {
    // Business Center doesn't use waterfall percentages
    // Return empty config (caller should use getBusinessCenterConfig instead)
    return {
      botmakersPct: 0,
      apexTakePct: 0,
      bonusPoolPct: 0,
      leadershipPoolPct: 0,
      sellerCommissionPct: 0,
      overridePoolPct: 0,
      productType: 'business_center',
    };
  }

  // Check cache first
  if (isCacheValid(cache.waterfallConfig)) {
    return cache.waterfallConfig!.data;
  }

  try {
    // FUTURE: Load from database
    // const config = await loadWaterfallConfigFromDatabase(productType);
    // if (config) {
    //   cache.waterfallConfig = createCacheEntry(config);
    //   return config;
    // }

    // Fallback to hardcoded config
    const config: WaterfallConfig = {
      botmakersPct: WATERFALL_CONFIG.BOTMAKERS_FEE_PCT,
      apexTakePct: WATERFALL_CONFIG.APEX_TAKE_PCT,
      bonusPoolPct: WATERFALL_CONFIG.BONUS_POOL_PCT,
      leadershipPoolPct: WATERFALL_CONFIG.LEADERSHIP_POOL_PCT,
      sellerCommissionPct: WATERFALL_CONFIG.SELLER_COMMISSION_PCT,
      overridePoolPct: WATERFALL_CONFIG.OVERRIDE_POOL_PCT,
      productType: 'standard',
    };

    cache.waterfallConfig = createCacheEntry(config);
    return config;
  } catch (error) {
    // Log error (future: send to monitoring system)
    // console.error('Error loading waterfall config:', error);
    // Always fallback to hardcoded
    return {
      botmakersPct: WATERFALL_CONFIG.BOTMAKERS_FEE_PCT,
      apexTakePct: WATERFALL_CONFIG.APEX_TAKE_PCT,
      bonusPoolPct: WATERFALL_CONFIG.BONUS_POOL_PCT,
      leadershipPoolPct: WATERFALL_CONFIG.LEADERSHIP_POOL_PCT,
      sellerCommissionPct: WATERFALL_CONFIG.SELLER_COMMISSION_PCT,
      overridePoolPct: WATERFALL_CONFIG.OVERRIDE_POOL_PCT,
      productType: 'standard',
    };
  }
}

// =============================================
// BUSINESS CENTER CONFIG
// =============================================

/**
 * Get Business Center Configuration
 *
 * Current: Returns hardcoded BUSINESS_CENTER_CONFIG from config.ts
 * Future: Load from business_center_config table
 *
 * @returns Business Center fixed dollar amounts
 */
export async function getBusinessCenterConfig(): Promise<BusinessCenterConfig> {
  // Check cache first
  if (isCacheValid(cache.businessCenterConfig)) {
    return cache.businessCenterConfig!.data;
  }

  try {
    // FUTURE: Load from database
    // const config = await loadBusinessCenterConfigFromDatabase();
    // if (config) {
    //   cache.businessCenterConfig = createCacheEntry(config);
    //   return config;
    // }

    // Fallback to hardcoded config
    const config: BusinessCenterConfig = {
      priceCents: BUSINESS_CENTER_CONFIG.PRICE_CENTS,
      botmakersFeeCents: BUSINESS_CENTER_CONFIG.BOTMAKERS_FEE_CENTS,
      apexTakeCents: BUSINESS_CENTER_CONFIG.APEX_TAKE_CENTS,
      sellerCommissionCents: BUSINESS_CENTER_CONFIG.SELLER_COMMISSION_CENTS,
      sponsorBonusCents: BUSINESS_CENTER_CONFIG.SPONSOR_BONUS_CENTS,
      costsCents: BUSINESS_CENTER_CONFIG.COSTS_CENTS,
      overridePoolCents: BUSINESS_CENTER_CONFIG.OVERRIDE_POOL_CENTS,
      bonusPoolCents: BUSINESS_CENTER_CONFIG.BONUS_POOL_CENTS,
      leadershipPoolCents: BUSINESS_CENTER_CONFIG.LEADERSHIP_POOL_CENTS,
      credits: BUSINESS_CENTER_CONFIG.CREDITS,
    };

    cache.businessCenterConfig = createCacheEntry(config);
    return config;
  } catch (error) {
    // Log error (future: send to monitoring system)
    // console.error('Error loading business center config:', error);
    // Always fallback to hardcoded
    return {
      priceCents: BUSINESS_CENTER_CONFIG.PRICE_CENTS,
      botmakersFeeCents: BUSINESS_CENTER_CONFIG.BOTMAKERS_FEE_CENTS,
      apexTakeCents: BUSINESS_CENTER_CONFIG.APEX_TAKE_CENTS,
      sellerCommissionCents: BUSINESS_CENTER_CONFIG.SELLER_COMMISSION_CENTS,
      sponsorBonusCents: BUSINESS_CENTER_CONFIG.SPONSOR_BONUS_CENTS,
      costsCents: BUSINESS_CENTER_CONFIG.COSTS_CENTS,
      overridePoolCents: BUSINESS_CENTER_CONFIG.OVERRIDE_POOL_CENTS,
      bonusPoolCents: BUSINESS_CENTER_CONFIG.BONUS_POOL_CENTS,
      leadershipPoolCents: BUSINESS_CENTER_CONFIG.LEADERSHIP_POOL_CENTS,
      credits: BUSINESS_CENTER_CONFIG.CREDITS,
    };
  }
}

// =============================================
// COMPENSATION CONSTANTS
// =============================================

/**
 * Get Compensation Constants
 *
 * Current: Returns hardcoded constants from config.ts
 * Future: Load from compensation_plan_config table
 *
 * @returns Various compensation constants
 */
export async function getCompensationConstants(): Promise<CompensationConstants> {
  // These are unlikely to change frequently, but still cacheable
  try {
    // FUTURE: Load from database
    // const constants = await loadConstantsFromDatabase();
    // if (constants) return constants;

    // Fallback to hardcoded config
    return {
      overrideQualificationMinCredits: OVERRIDE_QUALIFICATION_MIN_CREDITS,
      rankGracePeriodDays: PAY_LEVEL_GRACE_PERIOD_DAYS,
      leadershipPoolEligibleRank: LEADERSHIP_POOL_ELIGIBLE_RANK,
      bonusPoolDistributionMethod: BONUS_POOL_DISTRIBUTION_METHOD,
      enrollerOverrideRate: ENROLLER_OVERRIDE_RATE,
      insuranceToTechCrosscreditPct: INSURANCE_TO_TECH_CROSSCREDIT_PCT,
    };
  } catch (error) {
    // Log error (future: send to monitoring system)
    // console.error('Error loading compensation constants:', error);
    // Always fallback to hardcoded
    return {
      overrideQualificationMinCredits: OVERRIDE_QUALIFICATION_MIN_CREDITS,
      rankGracePeriodDays: PAY_LEVEL_GRACE_PERIOD_DAYS,
      leadershipPoolEligibleRank: LEADERSHIP_POOL_ELIGIBLE_RANK,
      bonusPoolDistributionMethod: BONUS_POOL_DISTRIBUTION_METHOD,
      enrollerOverrideRate: ENROLLER_OVERRIDE_RATE,
      insuranceToTechCrosscreditPct: INSURANCE_TO_TECH_CROSSCREDIT_PCT,
    };
  }
}

/**
 * Get Commission Run Configuration
 *
 * Current: Returns hardcoded COMMISSION_RUN_CONFIG from config.ts
 * Future: Load from compensation_plan_config table
 *
 * @returns Commission run settings
 */
export async function getCommissionRunConfig(): Promise<CommissionRunConfig> {
  try {
    // FUTURE: Load from database
    // const config = await loadCommissionRunConfigFromDatabase();
    // if (config) return config;

    // Fallback to hardcoded config
    return {
      promotionEffectiveDelayMonths: COMMISSION_RUN_CONFIG.PROMOTION_EFFECTIVE_DELAY_MONTHS,
      rankBonusOneTimeOnly: COMMISSION_RUN_CONFIG.RANK_BONUS_ONE_TIME_ONLY,
    };
  } catch (error) {
    // Log error (future: send to monitoring system)
    // console.error('Error loading commission run config:', error);
    // Always fallback to hardcoded
    return {
      promotionEffectiveDelayMonths: COMMISSION_RUN_CONFIG.PROMOTION_EFFECTIVE_DELAY_MONTHS,
      rankBonusOneTimeOnly: COMMISSION_RUN_CONFIG.RANK_BONUS_ONE_TIME_ONLY,
    };
  }
}

// =============================================
// CACHE MANAGEMENT
// =============================================

/**
 * Refresh all cached configuration
 *
 * Call this when config is updated in database
 * or periodically to ensure fresh data
 */
export async function refreshConfigCache(): Promise<void> {
  clearConfigCache();

  // Pre-load frequently accessed configs
  await Promise.all([
    getTechRanks(),
    getTechRankRequirements(),
    getOverrideSchedules(),
    getWaterfallConfig('standard'),
    getBusinessCenterConfig(),
    getCompensationConstants(),
    getCommissionRunConfig(),
  ]);
}

// =============================================
// VALIDATION
// =============================================

/**
 * Validate configuration integrity
 *
 * Ensures all required configs are loadable
 * and have valid values
 *
 * @returns Validation result with any errors
 */
export interface ConfigValidation {
  valid: boolean;
  errors: string[];
}

export async function validateConfiguration(): Promise<ConfigValidation> {
  const errors: string[] = [];

  try {
    // Validate tech ranks
    const ranks = await getTechRanks();
    if (ranks.length !== 9) {
      errors.push(`Expected 9 tech ranks, got ${ranks.length}`);
    }

    // Validate rank requirements
    const requirements = await getTechRankRequirements();
    if (requirements.length !== 9) {
      errors.push(`Expected 9 rank requirements, got ${requirements.length}`);
    }

    // Validate override schedules
    const schedules = await getOverrideSchedules();
    if (Object.keys(schedules).length !== 9) {
      errors.push(`Expected 9 override schedules, got ${Object.keys(schedules).length}`);
    }

    // Validate waterfall config
    const waterfall = await getWaterfallConfig('standard');
    if (waterfall.botmakersPct + waterfall.apexTakePct > 1) {
      errors.push('Waterfall percentages exceed 100%');
    }

    // Validate business center config
    const bc = await getBusinessCenterConfig();
    const total =
      bc.botmakersFeeCents +
      bc.apexTakeCents +
      bc.sellerCommissionCents +
      bc.sponsorBonusCents +
      bc.costsCents;
    if (total !== bc.priceCents) {
      errors.push(`Business Center split doesn't add up: ${total} !== ${bc.priceCents}`);
    }

    // Validate constants
    const constants = await getCompensationConstants();
    if (constants.overrideQualificationMinCredits < 0) {
      errors.push('Override qualification minimum cannot be negative');
    }
  } catch (error) {
    errors.push(`Configuration validation error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
