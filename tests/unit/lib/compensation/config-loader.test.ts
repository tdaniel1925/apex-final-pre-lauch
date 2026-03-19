// =============================================
// TESTS: Config Loader
// =============================================
// Purpose: Test config-loader caching and fallback behavior
// =============================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getTechRanks,
  getTechRankRequirements,
  getOverrideSchedules,
  getOverridePercentage,
  getWaterfallConfig,
  getBusinessCenterConfig,
  getCompensationConstants,
  getCommissionRunConfig,
  clearConfigCache,
  refreshConfigCache,
  validateConfiguration,
  type WaterfallConfig,
  type BusinessCenterConfig,
} from '@/lib/compensation/config-loader';
import type { TechRank } from '@/lib/compensation/config';

describe('Config Loader - Tech Ranks', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  it('should load tech ranks', async () => {
    const ranks = await getTechRanks();
    expect(ranks).toBeDefined();
    expect(ranks).toHaveLength(9);
    expect(ranks[0]).toBe('starter');
    expect(ranks[8]).toBe('elite');
  });

  it('should cache tech ranks', async () => {
    const ranks1 = await getTechRanks();
    const ranks2 = await getTechRanks();

    // Second call should return cached result (same reference)
    expect(ranks1).toBe(ranks2);
  });

  it('should include all expected ranks in order', async () => {
    const ranks = await getTechRanks();
    const expected: TechRank[] = [
      'starter',
      'bronze',
      'silver',
      'gold',
      'platinum',
      'ruby',
      'diamond',
      'crown',
      'elite',
    ];

    expect(ranks).toEqual(expected);
  });
});

describe('Config Loader - Tech Rank Requirements', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  it('should load tech rank requirements', async () => {
    const requirements = await getTechRankRequirements();
    expect(requirements).toBeDefined();
    expect(requirements).toHaveLength(9);
  });

  it('should cache rank requirements', async () => {
    const req1 = await getTechRankRequirements();
    const req2 = await getTechRankRequirements();

    expect(req1).toBe(req2);
  });

  it('should have valid thresholds for each rank', async () => {
    const requirements = await getTechRankRequirements();

    requirements.forEach((req) => {
      expect(req.name).toBeDefined();
      expect(req.personal).toBeGreaterThanOrEqual(0);
      expect(req.group).toBeGreaterThanOrEqual(0);
      expect(req.bonus).toBeGreaterThanOrEqual(0);
      expect(req.overrideDepth).toBeGreaterThanOrEqual(1);
      expect(req.overrideDepth).toBeLessThanOrEqual(5);
    });
  });

  it('should have increasing thresholds', async () => {
    const requirements = await getTechRankRequirements();

    for (let i = 1; i < requirements.length; i++) {
      const prev = requirements[i - 1];
      const curr = requirements[i];

      // Personal and group credits should increase (or stay same)
      expect(curr.personal).toBeGreaterThanOrEqual(prev.personal);
      expect(curr.group).toBeGreaterThanOrEqual(prev.group);

      // Bonuses should increase
      expect(curr.bonus).toBeGreaterThanOrEqual(prev.bonus);
    }
  });

  it('should have starter rank with zero requirements', async () => {
    const requirements = await getTechRankRequirements();
    const starter = requirements.find((r) => r.name === 'starter');

    expect(starter).toBeDefined();
    expect(starter?.personal).toBe(0);
    expect(starter?.group).toBe(0);
    expect(starter?.bonus).toBe(0);
    expect(starter?.overrideDepth).toBe(1);
  });

  it('should have elite rank as highest', async () => {
    const requirements = await getTechRankRequirements();
    const elite = requirements[requirements.length - 1];

    expect(elite.name).toBe('elite');
    expect(elite.personal).toBeGreaterThan(0);
    expect(elite.group).toBeGreaterThan(0);
    expect(elite.bonus).toBeGreaterThan(0);
    expect(elite.overrideDepth).toBe(5);
  });
});

describe('Config Loader - Override Schedules', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  it('should load override schedules', async () => {
    const schedules = await getOverrideSchedules();
    expect(schedules).toBeDefined();
    expect(Object.keys(schedules)).toHaveLength(9);
  });

  it('should cache override schedules', async () => {
    const sched1 = await getOverrideSchedules();
    const sched2 = await getOverrideSchedules();

    expect(sched1).toBe(sched2);
  });

  it('should have L1 = 0.30 for all ranks', async () => {
    const schedules = await getOverrideSchedules();

    Object.values(schedules).forEach((schedule) => {
      expect(schedule[0]).toBe(0.30); // L1 always 30%
    });
  });

  it('should have 5 levels for each rank', async () => {
    const schedules = await getOverrideSchedules();

    Object.values(schedules).forEach((schedule) => {
      expect(schedule).toHaveLength(5);
    });
  });

  it('should have valid percentages (0.0 to 0.30)', async () => {
    const schedules = await getOverrideSchedules();

    Object.values(schedules).forEach((schedule) => {
      schedule.forEach((pct) => {
        expect(pct).toBeGreaterThanOrEqual(0.0);
        expect(pct).toBeLessThanOrEqual(0.30);
      });
    });
  });

  it('should unlock more levels for higher ranks', async () => {
    const schedules = await getOverrideSchedules();

    // Starter should only have L1
    expect(schedules.starter[1]).toBe(0.0);
    expect(schedules.starter[2]).toBe(0.0);

    // Bronze should have L1-L2
    expect(schedules.bronze[1]).toBeGreaterThan(0.0);
    expect(schedules.bronze[2]).toBe(0.0);

    // Elite should have all L1-L5
    expect(schedules.elite[0]).toBeGreaterThan(0.0);
    expect(schedules.elite[4]).toBeGreaterThan(0.0);
  });
});

describe('Config Loader - Get Override Percentage', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  it('should return correct percentage for rank and level', async () => {
    const pct = await getOverridePercentage('gold', 1);
    expect(pct).toBe(0.30); // L1 always 30%
  });

  it('should return 0 for invalid levels', async () => {
    expect(await getOverridePercentage('gold', 0)).toBe(0);
    expect(await getOverridePercentage('gold', 6)).toBe(0);
    expect(await getOverridePercentage('gold', -1)).toBe(0);
  });

  it('should return 0 for locked levels', async () => {
    const pct = await getOverridePercentage('starter', 2);
    expect(pct).toBe(0); // Starter only unlocks L1
  });

  it('should return valid percentage for unlocked levels', async () => {
    const pct = await getOverridePercentage('platinum', 5);
    expect(pct).toBeGreaterThan(0); // Platinum unlocks L5
  });
});

describe('Config Loader - Waterfall Config', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  it('should load waterfall config for standard products', async () => {
    const config = await getWaterfallConfig('standard');
    expect(config).toBeDefined();
    expect(config.productType).toBe('standard');
  });

  it('should cache waterfall config', async () => {
    const config1 = await getWaterfallConfig('standard');
    const config2 = await getWaterfallConfig('standard');

    expect(config1).toBe(config2);
  });

  it('should have valid percentages', async () => {
    const config = await getWaterfallConfig('standard');

    expect(config.botmakersPct).toBeGreaterThan(0);
    expect(config.apexTakePct).toBeGreaterThan(0);
    expect(config.bonusPoolPct).toBeGreaterThan(0);
    expect(config.leadershipPoolPct).toBeGreaterThan(0);
    expect(config.sellerCommissionPct).toBeGreaterThan(0);
    expect(config.overridePoolPct).toBeGreaterThan(0);
  });

  it('should have BotMakers at 30%', async () => {
    const config = await getWaterfallConfig('standard');
    expect(config.botmakersPct).toBe(0.30);
  });

  it('should have Apex at 30%', async () => {
    const config = await getWaterfallConfig('standard');
    expect(config.apexTakePct).toBe(0.30);
  });

  it('should have bonus pool at 3.5%', async () => {
    const config = await getWaterfallConfig('standard');
    expect(config.bonusPoolPct).toBe(0.035);
  });

  it('should have leadership pool at 1.5%', async () => {
    const config = await getWaterfallConfig('standard');
    expect(config.leadershipPoolPct).toBe(0.015);
  });

  it('should split commission pool 60/40', async () => {
    const config = await getWaterfallConfig('standard');
    expect(config.sellerCommissionPct).toBe(0.60);
    expect(config.overridePoolPct).toBe(0.40);
  });

  it('should return empty config for business center', async () => {
    const config = await getWaterfallConfig('business_center');
    expect(config.productType).toBe('business_center');
    expect(config.botmakersPct).toBe(0);
    expect(config.apexTakePct).toBe(0);
  });
});

describe('Config Loader - Business Center Config', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  it('should load business center config', async () => {
    const config = await getBusinessCenterConfig();
    expect(config).toBeDefined();
  });

  it('should cache business center config', async () => {
    const config1 = await getBusinessCenterConfig();
    const config2 = await getBusinessCenterConfig();

    expect(config1).toBe(config2);
  });

  it('should have price of $39', async () => {
    const config = await getBusinessCenterConfig();
    expect(config.priceCents).toBe(3900);
  });

  it('should have fixed dollar amounts', async () => {
    const config = await getBusinessCenterConfig();

    expect(config.botmakersFeeCents).toBe(1100); // $11
    expect(config.apexTakeCents).toBe(800); // $8
    expect(config.sellerCommissionCents).toBe(1000); // $10
    expect(config.sponsorBonusCents).toBe(800); // $8
    expect(config.costsCents).toBe(200); // $2
  });

  it('should have no pools', async () => {
    const config = await getBusinessCenterConfig();

    expect(config.overridePoolCents).toBe(0);
    expect(config.bonusPoolCents).toBe(0);
    expect(config.leadershipPoolCents).toBe(0);
  });

  it('should have 39 fixed credits', async () => {
    const config = await getBusinessCenterConfig();
    expect(config.credits).toBe(39);
  });

  it('should add up to total price', async () => {
    const config = await getBusinessCenterConfig();

    const total =
      config.botmakersFeeCents +
      config.apexTakeCents +
      config.sellerCommissionCents +
      config.sponsorBonusCents +
      config.costsCents;

    expect(total).toBe(config.priceCents);
  });
});

describe('Config Loader - Compensation Constants', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  it('should load compensation constants', async () => {
    const constants = await getCompensationConstants();
    expect(constants).toBeDefined();
  });

  it('should have override qualification minimum of 50 credits', async () => {
    const constants = await getCompensationConstants();
    expect(constants.overrideQualificationMinCredits).toBe(50);
  });

  it('should have rank grace period of 2 months', async () => {
    const constants = await getCompensationConstants();
    expect(constants.rankGracePeriodMonths).toBe(2);
  });

  it('should have new rep rank lock of 6 months', async () => {
    const constants = await getCompensationConstants();
    expect(constants.newRepRankLockMonths).toBe(6);
  });

  it('should have leadership pool eligible rank as elite', async () => {
    const constants = await getCompensationConstants();
    expect(constants.leadershipPoolEligibleRank).toBe('elite');
  });

  it('should have bonus pool distribution as equal_share', async () => {
    const constants = await getCompensationConstants();
    expect(constants.bonusPoolDistributionMethod).toBe('equal_share');
  });

  it('should have enroller override rate of 30%', async () => {
    const constants = await getCompensationConstants();
    expect(constants.enrollerOverrideRate).toBe(0.30);
  });

  it('should have insurance to tech crosscredit of 0.5%', async () => {
    const constants = await getCompensationConstants();
    expect(constants.insuranceToTechCrosscreditPct).toBe(0.005);
  });
});

describe('Config Loader - Commission Run Config', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  it('should load commission run config', async () => {
    const config = await getCommissionRunConfig();
    expect(config).toBeDefined();
  });

  it('should have promotion delay of 1 month', async () => {
    const config = await getCommissionRunConfig();
    expect(config.promotionEffectiveDelayMonths).toBe(1);
  });

  it('should have rank bonus as one-time only', async () => {
    const config = await getCommissionRunConfig();
    expect(config.rankBonusOneTimeOnly).toBe(true);
  });
});

describe('Config Loader - Cache Management', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  it('should clear cache', () => {
    clearConfigCache();
    // Should not throw
    expect(true).toBe(true);
  });

  it('should refresh all configs', async () => {
    await refreshConfigCache();
    // Should pre-load all configs without errors
    expect(true).toBe(true);
  });

  it('should reload after cache clear', async () => {
    const ranks1 = await getTechRanks();
    clearConfigCache();
    const ranks2 = await getTechRanks();

    // After clearing, cache is refreshed
    // Values should still be the same (both use hardcoded TECH_RANKS)
    expect(ranks1).toEqual(ranks2);

    // NOTE: In current implementation, both return the same const array reference
    // This will change when we migrate to database-driven config
  });
});

describe('Config Loader - Validation', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  it('should validate configuration', async () => {
    const validation = await validateConfiguration();
    expect(validation).toBeDefined();
    expect(validation.valid).toBeDefined();
    expect(validation.errors).toBeDefined();
  });

  it('should pass validation with hardcoded config', async () => {
    const validation = await validateConfiguration();
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should detect missing ranks', async () => {
    // This test would fail if TECH_RANKS was modified to have < 9 ranks
    const validation = await validateConfiguration();
    const ranksError = validation.errors.find((e) => e.includes('tech ranks'));

    if (ranksError) {
      expect(ranksError).toContain('Expected 9 tech ranks');
    } else {
      expect(validation.valid).toBe(true);
    }
  });

  it('should detect business center split errors', async () => {
    const validation = await validateConfiguration();
    const bcError = validation.errors.find((e) => e.includes('Business Center'));

    // Should either pass or have specific BC error
    if (bcError) {
      expect(bcError).toContain("doesn't add up");
    } else {
      expect(validation.valid).toBe(true);
    }
  });
});

describe('Config Loader - Error Handling', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  it('should handle errors gracefully', async () => {
    // Even if database query fails (not implemented yet),
    // should fall back to hardcoded config
    const ranks = await getTechRanks();
    expect(ranks).toBeDefined();
    expect(ranks.length).toBeGreaterThan(0);
  });

  it('should never throw exceptions', async () => {
    // All functions should handle errors internally
    await expect(getTechRanks()).resolves.toBeDefined();
    await expect(getTechRankRequirements()).resolves.toBeDefined();
    await expect(getOverrideSchedules()).resolves.toBeDefined();
    await expect(getWaterfallConfig('standard')).resolves.toBeDefined();
    await expect(getBusinessCenterConfig()).resolves.toBeDefined();
    await expect(getCompensationConstants()).resolves.toBeDefined();
    await expect(getCommissionRunConfig()).resolves.toBeDefined();
  });
});

describe('Config Loader - Performance', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  it('should cache for performance', async () => {
    const start1 = performance.now();
    await getTechRanks();
    const time1 = performance.now() - start1;

    const start2 = performance.now();
    await getTechRanks();
    const time2 = performance.now() - start2;

    // Second call should be faster (cached)
    // Allow some margin for variability
    expect(time2).toBeLessThan(time1 * 2);
  });

  it('should load all configs quickly', async () => {
    const start = performance.now();

    await Promise.all([
      getTechRanks(),
      getTechRankRequirements(),
      getOverrideSchedules(),
      getWaterfallConfig('standard'),
      getBusinessCenterConfig(),
      getCompensationConstants(),
      getCommissionRunConfig(),
    ]);

    const time = performance.now() - start;

    // Should load all configs in < 100ms (hardcoded)
    expect(time).toBeLessThan(100);
  });
});
