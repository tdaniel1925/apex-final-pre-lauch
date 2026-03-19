import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  AutopilotTier,
  getAutopilotProduct,
  calculateUpgradePrice,
  canUpgrade,
  canDowngrade,
} from '@/lib/stripe/autopilot-products';

/**
 * Test Suite: Autopilot Subscription Management
 * Tests product configuration, pricing calculations, and tier logic
 */

describe('Autopilot Product Configuration', () => {
  it('should return correct product for each tier', () => {
    const freeTier = getAutopilotProduct('free');
    expect(freeTier.tier).toBe('free');
    expect(freeTier.priceMonthly).toBe(0);
    expect(freeTier.priceCents).toBe(0);

    const socialTier = getAutopilotProduct('social_connector');
    expect(socialTier.tier).toBe('social_connector');
    expect(socialTier.priceMonthly).toBe(9);
    expect(socialTier.priceCents).toBe(900);

    const proTier = getAutopilotProduct('lead_autopilot_pro');
    expect(proTier.tier).toBe('lead_autopilot_pro');
    expect(proTier.priceMonthly).toBe(79);
    expect(proTier.priceCents).toBe(7900);
    expect(proTier.hasFreeTrial).toBe(true);
    expect(proTier.trialDays).toBe(14);

    const teamTier = getAutopilotProduct('team_edition');
    expect(teamTier.tier).toBe('team_edition');
    expect(teamTier.priceMonthly).toBe(119);
    expect(teamTier.priceCents).toBe(11900);
  });

  it('should have correct feature limits', () => {
    const freeTier = getAutopilotProduct('free');
    expect(freeTier.limits.emailInvites).toBe(10);
    expect(freeTier.limits.smsMessages).toBe(0);
    expect(freeTier.limits.crmContacts).toBe(0);

    const socialTier = getAutopilotProduct('social_connector');
    expect(socialTier.limits.emailInvites).toBe(50);
    expect(socialTier.limits.socialPosts).toBe(30);
    expect(socialTier.limits.eventFlyers).toBe(10);

    const proTier = getAutopilotProduct('lead_autopilot_pro');
    expect(proTier.limits.emailInvites).toBe(-1); // Unlimited
    expect(proTier.limits.smsMessages).toBe(1000);
    expect(proTier.limits.crmContacts).toBe(500);

    const teamTier = getAutopilotProduct('team_edition');
    expect(teamTier.limits.emailInvites).toBe(-1);
    expect(teamTier.limits.smsMessages).toBe(-1);
    expect(teamTier.limits.crmContacts).toBe(-1);
  });
});

describe('Upgrade Price Calculation', () => {
  it('should calculate prorated upgrade cost correctly', () => {
    // Upgrade from Social ($9) to Pro ($79) with 15 days remaining
    const cost = calculateUpgradePrice('social_connector', 'lead_autopilot_pro', 15);

    // Daily rate for Social: 900 cents / 30 = 30 cents/day
    // Daily rate for Pro: 7900 cents / 30 = 263.33 cents/day
    // Credit from Social: 30 * 15 = 450 cents
    // Cost for Pro: 263.33 * 15 = 3950 cents
    // Difference: 3950 - 450 = 3500 cents

    expect(cost).toBeGreaterThan(0);
    expect(cost).toBeLessThan(7900); // Should be less than full Pro price
  });

  it('should handle upgrade from free tier', () => {
    // Upgrade from Free to Pro with 30 days in cycle
    const cost = calculateUpgradePrice('free', 'lead_autopilot_pro', 30);

    // Free tier daily rate is 0
    // Pro daily rate: 7900 / 30 = 263.33 cents/day
    // Cost: 263.33 * 30 = 7900 cents

    expect(cost).toBe(7900); // Full Pro price
  });

  it('should handle upgrade with different cycle days', () => {
    const cost5Days = calculateUpgradePrice('social_connector', 'team_edition', 5);
    const cost20Days = calculateUpgradePrice('social_connector', 'team_edition', 20);

    // More days remaining should result in higher prorated cost
    expect(cost20Days).toBeGreaterThan(cost5Days);
  });

  it('should not return negative values for downgrades', () => {
    // Downgrade from Team to Free (should return 0, not negative)
    const cost = calculateUpgradePrice('team_edition', 'free', 15);
    expect(cost).toBe(0);
  });
});

describe('Tier Upgrade/Downgrade Logic', () => {
  it('should allow upgrades to higher tiers', () => {
    expect(canUpgrade('free', 'social_connector')).toBe(true);
    expect(canUpgrade('free', 'lead_autopilot_pro')).toBe(true);
    expect(canUpgrade('social_connector', 'lead_autopilot_pro')).toBe(true);
    expect(canUpgrade('lead_autopilot_pro', 'team_edition')).toBe(true);
  });

  it('should not allow upgrades to same tier', () => {
    expect(canUpgrade('free', 'free')).toBe(false);
    expect(canUpgrade('social_connector', 'social_connector')).toBe(false);
  });

  it('should not allow upgrades to lower tiers', () => {
    expect(canUpgrade('team_edition', 'lead_autopilot_pro')).toBe(false);
    expect(canUpgrade('lead_autopilot_pro', 'social_connector')).toBe(false);
    expect(canUpgrade('social_connector', 'free')).toBe(false);
  });

  it('should allow downgrades to lower tiers', () => {
    expect(canDowngrade('team_edition', 'lead_autopilot_pro')).toBe(true);
    expect(canDowngrade('lead_autopilot_pro', 'social_connector')).toBe(true);
    expect(canDowngrade('social_connector', 'free')).toBe(true);
  });

  it('should not allow downgrades to same or higher tiers', () => {
    expect(canDowngrade('free', 'free')).toBe(false);
    expect(canDowngrade('free', 'social_connector')).toBe(false);
    expect(canDowngrade('social_connector', 'lead_autopilot_pro')).toBe(false);
  });
});

describe('Feature Access', () => {
  it('should correctly identify included features per tier', () => {
    const freeTier = getAutopilotProduct('free');
    const emailFeature = freeTier.features.find((f) => f.name === 'Email Invitations');
    expect(emailFeature?.isIncluded).toBe(true);

    const socialFeature = freeTier.features.find((f) => f.name === 'Social Media Posting');
    expect(socialFeature?.isIncluded).toBe(false);

    const proTier = getAutopilotProduct('lead_autopilot_pro');
    const crmFeature = proTier.features.find((f) => f.name === 'CRM System');
    expect(crmFeature?.isIncluded).toBe(true);
  });

  it('should have correct trial settings', () => {
    const freeTier = getAutopilotProduct('free');
    expect(freeTier.hasFreeTrial).toBe(false);

    const socialTier = getAutopilotProduct('social_connector');
    expect(socialTier.hasFreeTrial).toBe(false);

    const proTier = getAutopilotProduct('lead_autopilot_pro');
    expect(proTier.hasFreeTrial).toBe(true);
    expect(proTier.trialDays).toBe(14);

    const teamTier = getAutopilotProduct('team_edition');
    expect(teamTier.hasFreeTrial).toBe(false);
  });
});

describe('Lookup Keys', () => {
  it('should have unique lookup keys for each tier', () => {
    const freeTier = getAutopilotProduct('free');
    const socialTier = getAutopilotProduct('social_connector');
    const proTier = getAutopilotProduct('lead_autopilot_pro');
    const teamTier = getAutopilotProduct('team_edition');

    const lookupKeys = [
      freeTier.lookupKey,
      socialTier.lookupKey,
      proTier.lookupKey,
      teamTier.lookupKey,
    ];

    // Check all lookup keys are unique
    const uniqueKeys = new Set(lookupKeys);
    expect(uniqueKeys.size).toBe(4);
  });

  it('should have descriptive lookup keys', () => {
    const freeTier = getAutopilotProduct('free');
    expect(freeTier.lookupKey).toContain('autopilot');

    const socialTier = getAutopilotProduct('social_connector');
    expect(socialTier.lookupKey).toContain('social');

    const proTier = getAutopilotProduct('lead_autopilot_pro');
    expect(proTier.lookupKey).toContain('pro');

    const teamTier = getAutopilotProduct('team_edition');
    expect(teamTier.lookupKey).toContain('team');
  });
});

describe('Badge and Popularity', () => {
  it('should mark Pro tier as popular', () => {
    const proTier = getAutopilotProduct('lead_autopilot_pro');
    expect(proTier.isPopular).toBe(true);
    expect(proTier.badge).toBe('Most Popular');
  });

  it('should mark Team tier with badge', () => {
    const teamTier = getAutopilotProduct('team_edition');
    expect(teamTier.badge).toBe('Best Value');
  });

  it('should not mark free tier as popular', () => {
    const freeTier = getAutopilotProduct('free');
    expect(freeTier.isPopular).toBeUndefined();
  });
});
