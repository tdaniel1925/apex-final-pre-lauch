// =============================================
// INSURANCE LADDER CALCULATOR - PROJECTION LOGIC
// =============================================
// Calculates earnings potential for insurance ladder ranks
// Based on: CLAUDE.md - Insurance Ladder Compensation Plan
// =============================================

/**
 * Insurance ladder ranks (6 base + 7 MGA tiers)
 */
export const INSURANCE_RANKS = [
  'pre_associate', // 50% commission
  'associate', // 60% commission
  'sr_associate', // 70% commission
  'agent', // 75% commission
  'sr_agent', // 80% commission
  'mga', // 90% commission
  'associate_mga', // 90% + Gen 1: 5%
  'senior_mga', // 90% + Gen 1-2: 5%, 3%
  'regional_mga', // 90% + Gen 1-3: 5%, 3%, 2%
  'national_mga', // 90% + Gen 1-4: 5%, 3%, 2%, 1%
  'executive_mga', // 90% + Gen 1-5: 5%, 3%, 2%, 1%, 1%
  'premier_mga', // 90% + Gen 1-6: 5%, 3%, 2%, 1%, 1%, 0.5%
  'crown_mga', // 90% + Gen 1-6: 5%, 3%, 2%, 1%, 1%, 0.5%
] as const;

export type InsuranceRank = (typeof INSURANCE_RANKS)[number];

/**
 * Rank display names
 */
export const INSURANCE_RANK_DISPLAY_NAMES: Record<InsuranceRank, string> = {
  pre_associate: 'Pre-Associate',
  associate: 'Associate',
  sr_associate: 'Sr. Associate',
  agent: 'Agent',
  sr_agent: 'Sr. Agent',
  mga: 'MGA',
  associate_mga: 'Associate MGA',
  senior_mga: 'Senior MGA',
  regional_mga: 'Regional MGA',
  national_mga: 'National MGA',
  executive_mga: 'Executive MGA',
  premier_mga: 'Premier MGA',
  crown_mga: 'Crown MGA',
};

/**
 * Direct commission rates by rank
 */
export const COMMISSION_RATES: Record<InsuranceRank, number> = {
  pre_associate: 0.50,
  associate: 0.60,
  sr_associate: 0.70,
  agent: 0.75,
  sr_agent: 0.80,
  mga: 0.90,
  associate_mga: 0.90,
  senior_mga: 0.90,
  regional_mga: 0.90,
  national_mga: 0.90,
  executive_mga: 0.90,
  premier_mga: 0.90,
  crown_mga: 0.90,
};

/**
 * Generational override schedules by MGA tier
 */
export const GENERATIONAL_OVERRIDES: Record<InsuranceRank, number[]> = {
  pre_associate: [],
  associate: [],
  sr_associate: [],
  agent: [],
  sr_agent: [],
  mga: [],
  associate_mga: [0.05], // Gen 1: 5%
  senior_mga: [0.05, 0.03], // Gen 1-2
  regional_mga: [0.05, 0.03, 0.02], // Gen 1-3
  national_mga: [0.05, 0.03, 0.02, 0.01], // Gen 1-4
  executive_mga: [0.05, 0.03, 0.02, 0.01, 0.01], // Gen 1-5
  premier_mga: [0.05, 0.03, 0.02, 0.01, 0.01, 0.005], // Gen 1-6
  crown_mga: [0.05, 0.03, 0.02, 0.01, 0.01, 0.005], // Gen 1-6
};

/**
 * Weekly production bonus tiers
 */
export const WEEKLY_PRODUCTION_BONUSES = [
  { threshold: 2500, bonus: 500 },
  { threshold: 5000, bonus: 1250 },
  { threshold: 10000, bonus: 3000 },
];

/**
 * Rank requirements (simplified for calculator)
 */
export interface InsuranceRankRequirement {
  rank: InsuranceRank;
  premiumVolume90Day: number; // Minimum 90-day premium volume
  licensedRecruits?: number; // Minimum licensed recruits (for MGA tiers)
  description: string;
}

export const INSURANCE_RANK_REQUIREMENTS: InsuranceRankRequirement[] = [
  {
    rank: 'pre_associate',
    premiumVolume90Day: 0,
    description: 'Entry level - just getting started',
  },
  {
    rank: 'associate',
    premiumVolume90Day: 10000,
    description: '$10K+ in 90-day premium volume',
  },
  {
    rank: 'sr_associate',
    premiumVolume90Day: 30000,
    description: '$30K+ in 90-day premium volume',
  },
  {
    rank: 'agent',
    premiumVolume90Day: 75000,
    description: '$75K+ in 90-day premium volume',
  },
  {
    rank: 'sr_agent',
    premiumVolume90Day: 150000,
    description: '$150K+ in 90-day premium volume',
  },
  {
    rank: 'mga',
    premiumVolume90Day: 250000,
    description: '$250K+ in 90-day premium volume',
  },
  {
    rank: 'associate_mga',
    premiumVolume90Day: 400000,
    licensedRecruits: 3,
    description: '$400K+ volume, 3+ licensed recruits',
  },
  {
    rank: 'senior_mga',
    premiumVolume90Day: 750000,
    licensedRecruits: 5,
    description: '$750K+ volume, 5+ licensed recruits',
  },
  {
    rank: 'regional_mga',
    premiumVolume90Day: 1500000,
    licensedRecruits: 10,
    description: '$1.5M+ volume, 10+ licensed recruits',
  },
  {
    rank: 'national_mga',
    premiumVolume90Day: 3000000,
    licensedRecruits: 20,
    description: '$3M+ volume, 20+ licensed recruits',
  },
  {
    rank: 'executive_mga',
    premiumVolume90Day: 5000000,
    licensedRecruits: 35,
    description: '$5M+ volume, 35+ licensed recruits',
  },
  {
    rank: 'premier_mga',
    premiumVolume90Day: 10000000,
    licensedRecruits: 50,
    description: '$10M+ volume, 50+ licensed recruits',
  },
  {
    rank: 'crown_mga',
    premiumVolume90Day: 20000000,
    licensedRecruits: 100,
    description: '$20M+ volume, 100+ licensed recruits',
  },
];

/**
 * Calculator input
 */
export interface InsuranceCalculatorInput {
  monthlyPremiumVolume: number;
  licensedRecruits: number;
  currentRank?: InsuranceRank;
}

/**
 * Rank qualification status
 */
export interface InsuranceRankQualification {
  rank: InsuranceRank;
  qualified: boolean;
  requirements: {
    premiumVolume: { required: number; current: number; met: boolean };
    licensedRecruits: { required: number; current: number; met: boolean } | null;
  };
  progress: number;
}

/**
 * Monthly income projection
 */
export interface InsuranceIncomeProjection {
  directCommission: number;
  generationalOverrides: number;
  weeklyBonuses: number;
  totalMonthly: number;
}

/**
 * Next rank requirements
 */
export interface InsuranceNextRankRequirements {
  nextRank: InsuranceRank | null;
  missingPremiumVolume: number;
  missingLicensedRecruits: number;
  progressPercentage: number;
}

/**
 * Complete calculator output
 */
export interface InsuranceCalculatorOutput {
  currentRankQualification: InsuranceRankQualification;
  allRankQualifications: InsuranceRankQualification[];
  monthlyIncomeProjection: InsuranceIncomeProjection;
  nextRankRequirements: InsuranceNextRankRequirements | null;
  commissionRate: number;
  generationalDepth: number;
}

/**
 * Calculate what rank the user qualifies for
 */
export function calculateQualifiedInsuranceRank(
  input: InsuranceCalculatorInput
): InsuranceRank {
  const premiumVolume90Day = input.monthlyPremiumVolume * 3; // Approximate 90-day

  // Check from highest to lowest rank
  for (let i = INSURANCE_RANK_REQUIREMENTS.length - 1; i >= 0; i--) {
    const rankReq = INSURANCE_RANK_REQUIREMENTS[i];

    // Check premium volume
    if (premiumVolume90Day < rankReq.premiumVolume90Day) {
      continue;
    }

    // Check licensed recruits (if required)
    if (rankReq.licensedRecruits && input.licensedRecruits < rankReq.licensedRecruits) {
      continue;
    }

    // Qualifies for this rank
    return rankReq.rank;
  }

  return 'pre_associate';
}

/**
 * Calculate qualification status for all ranks
 */
export function calculateAllInsuranceRankQualifications(
  input: InsuranceCalculatorInput
): InsuranceRankQualification[] {
  const premiumVolume90Day = input.monthlyPremiumVolume * 3;

  return INSURANCE_RANK_REQUIREMENTS.map((rankReq) => {
    const premiumMet = premiumVolume90Day >= rankReq.premiumVolume90Day;

    let recruitsStatus: { required: number; current: number; met: boolean } | null = null;

    if (rankReq.licensedRecruits) {
      recruitsStatus = {
        required: rankReq.licensedRecruits,
        current: input.licensedRecruits,
        met: input.licensedRecruits >= rankReq.licensedRecruits,
      };
    }

    const qualified = premiumMet && (recruitsStatus ? recruitsStatus.met : true);

    // Calculate progress
    const premiumProgress = rankReq.premiumVolume90Day > 0
      ? (premiumVolume90Day / rankReq.premiumVolume90Day) * 100
      : 100;
    const recruitsProgress = recruitsStatus
      ? (input.licensedRecruits / recruitsStatus.required) * 100
      : 100;

    const progress = Math.min(100, Math.min(premiumProgress, recruitsProgress));

    return {
      rank: rankReq.rank,
      qualified,
      requirements: {
        premiumVolume: {
          required: rankReq.premiumVolume90Day,
          current: premiumVolume90Day,
          met: premiumMet,
        },
        licensedRecruits: recruitsStatus,
      },
      progress,
    };
  });
}

/**
 * Calculate monthly income projection
 */
export function calculateInsuranceIncome(
  input: InsuranceCalculatorInput,
  qualifiedRank: InsuranceRank
): InsuranceIncomeProjection {
  const { monthlyPremiumVolume, licensedRecruits } = input;

  // Direct commission (commission rate × premium volume)
  const commissionRate = COMMISSION_RATES[qualifiedRank];
  const directCommission = monthlyPremiumVolume * commissionRate;

  // Generational overrides (simplified estimate)
  // Assume each recruit generates 30% of your premium volume
  const generationalOverrides = GENERATIONAL_OVERRIDES[qualifiedRank];
  let overrideIncome = 0;

  if (generationalOverrides.length > 0 && licensedRecruits > 0) {
    const avgRecruitVolume = monthlyPremiumVolume * 0.3;
    const totalDownlineVolume = avgRecruitVolume * licensedRecruits;

    // Apply generational rates
    const totalOverrideRate = generationalOverrides.reduce((sum, rate) => sum + rate, 0);
    overrideIncome = totalDownlineVolume * totalOverrideRate;
  }

  // Weekly production bonuses (calculate for 4 weeks)
  let weeklyBonuses = 0;
  const weeklyPremium = monthlyPremiumVolume / 4;

  for (const tier of WEEKLY_PRODUCTION_BONUSES) {
    if (weeklyPremium >= tier.threshold) {
      weeklyBonuses = tier.bonus * 4; // 4 weeks per month
    }
  }

  const totalMonthly = directCommission + overrideIncome + weeklyBonuses;

  return {
    directCommission,
    generationalOverrides: overrideIncome,
    weeklyBonuses,
    totalMonthly,
  };
}

/**
 * Calculate next rank requirements
 */
export function calculateInsuranceNextRankRequirements(
  input: InsuranceCalculatorInput,
  currentQualifiedRank: InsuranceRank
): InsuranceNextRankRequirements | null {
  const currentRankIndex = INSURANCE_RANK_REQUIREMENTS.findIndex(
    (r) => r.rank === currentQualifiedRank
  );

  if (currentRankIndex === INSURANCE_RANK_REQUIREMENTS.length - 1) {
    return null; // Already at highest rank
  }

  const nextRankReq = INSURANCE_RANK_REQUIREMENTS[currentRankIndex + 1];
  const premiumVolume90Day = input.monthlyPremiumVolume * 3;

  const missingPremiumVolume = Math.max(0, nextRankReq.premiumVolume90Day - premiumVolume90Day);
  const missingLicensedRecruits = Math.max(
    0,
    (nextRankReq.licensedRecruits || 0) - input.licensedRecruits
  );

  // Calculate progress
  const premiumProgress = nextRankReq.premiumVolume90Day > 0
    ? (premiumVolume90Day / nextRankReq.premiumVolume90Day) * 100
    : 100;
  const recruitsProgress = nextRankReq.licensedRecruits
    ? (input.licensedRecruits / nextRankReq.licensedRecruits) * 100
    : 100;

  const progressPercentage = Math.min(100, Math.min(premiumProgress, recruitsProgress));

  return {
    nextRank: nextRankReq.rank,
    missingPremiumVolume,
    missingLicensedRecruits,
    progressPercentage,
  };
}

/**
 * Main calculator function
 */
export function calculateInsuranceLadder(
  input: InsuranceCalculatorInput
): InsuranceCalculatorOutput {
  const qualifiedRank = calculateQualifiedInsuranceRank(input);
  const allRankQualifications = calculateAllInsuranceRankQualifications(input);
  const currentRankQualification = allRankQualifications.find((rq) => rq.rank === qualifiedRank)!;
  const monthlyIncomeProjection = calculateInsuranceIncome(input, qualifiedRank);
  const nextRankRequirements = calculateInsuranceNextRankRequirements(input, qualifiedRank);
  const commissionRate = COMMISSION_RATES[qualifiedRank];
  const generationalDepth = GENERATIONAL_OVERRIDES[qualifiedRank].length;

  return {
    currentRankQualification,
    allRankQualifications,
    monthlyIncomeProjection,
    nextRankRequirements,
    commissionRate,
    generationalDepth,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}
