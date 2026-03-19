// =============================================
// UNIT TESTS - OVERRIDE RESOLUTION
// =============================================
// Phase: 5 (Testing & Validation)
// Agent: 5A
// =============================================

import { describe, it, expect } from 'vitest';
import {
  calculateOverride,
  calculateAllOverrides,
  getTotalOverrides,
  formatOverrideResult,
  validateOverrides,
  isOverrideQualified,
  type OverrideMember,
  type SaleInfo,
} from '@/lib/compensation/override-resolution';

describe('Override Resolution', () => {
  describe('50 Credit Minimum Qualification', () => {
    it('should pay override when member has 50+ personal credits', () => {
      const member: OverrideMember = {
        memberId: 'member-1',
        techRank: 'gold',
        personalCreditsMonthly: 50,
        overrideQualified: true,
      };

      const sale: SaleInfo = {
        orderId: 'order-1',
        sellerMemberId: 'seller-1',
        priceCents: 7900,
        productType: 'standard',
      };

      const result = calculateOverride(member, sale, true, 1); // Enroller, L1

      expect(result.qualified).toBe(true);
      expect(result.amountCents).toBeGreaterThan(0);
    });

    it('should NOT pay override when member has <50 personal credits', () => {
      const member: OverrideMember = {
        memberId: 'member-2',
        techRank: 'gold',
        personalCreditsMonthly: 49,
        overrideQualified: false,
      };

      const sale: SaleInfo = {
        orderId: 'order-2',
        sellerMemberId: 'seller-2',
        priceCents: 7900,
        productType: 'standard',
      };

      const result = calculateOverride(member, sale, true, 1);

      expect(result.qualified).toBe(false);
      expect(result.amountCents).toBe(0);
      expect(result.reason).toContain('Below 50 credit minimum');
      expect(result.reason).toContain('has 49 credits');
    });

    it('should reject override for member with exactly 49 credits', () => {
      expect(isOverrideQualified(49)).toBe(false);
      expect(isOverrideQualified(50)).toBe(true);
      expect(isOverrideQualified(51)).toBe(true);
      expect(isOverrideQualified(0)).toBe(false);
    });
  });

  describe('Enroller Override Rule (IMMUTABLE)', () => {
    it('should ALWAYS pay L1 (30%) to enroller regardless of matrix position', () => {
      const member: OverrideMember = {
        memberId: 'enroller-1',
        techRank: 'starter', // Lowest rank
        personalCreditsMonthly: 50,
        overrideQualified: true,
      };

      const sale: SaleInfo = {
        orderId: 'order-3',
        sellerMemberId: 'seller-3',
        priceCents: 7900, // Override pool: ~$14.71
        productType: 'standard',
      };

      const result = calculateOverride(member, sale, true); // isEnroller = true

      expect(result.rule).toBe('enroller');
      expect(result.level).toBe(1);
      expect(result.percentage).toBe(0.30); // 30%
      expect(result.qualified).toBe(true);
      // Expected: 30% of $14.71 = $4.41
      expect(result.amountCents).toBeCloseTo(441, 5);
    });

    it('should pay L1 to enroller even if they are Starter rank', () => {
      const starter: OverrideMember = {
        memberId: 'starter-enroller',
        techRank: 'starter',
        personalCreditsMonthly: 50,
        overrideQualified: true,
      };

      const sale: SaleInfo = {
        orderId: 'order-4',
        sellerMemberId: 'seller-4',
        priceCents: 9900,
        productType: 'standard',
      };

      const result = calculateOverride(starter, sale, true);

      expect(result.rule).toBe('enroller');
      expect(result.memberTechRank).toBe('starter');
      expect(result.percentage).toBe(0.30);
      expect(result.amountCents).toBeGreaterThan(0);
    });

    it('should pay L1 to enroller even if they are in L5 matrix position', () => {
      const member: OverrideMember = {
        memberId: 'enroller-far',
        techRank: 'bronze',
        personalCreditsMonthly: 50,
        overrideQualified: true,
      };

      const sale: SaleInfo = {
        orderId: 'order-5',
        sellerMemberId: 'seller-5',
        priceCents: 7900,
        productType: 'standard',
      };

      // Even though matrixLevel is 5, enroller rule overrides
      const result = calculateOverride(member, sale, true, 5);

      expect(result.rule).toBe('enroller');
      expect(result.level).toBe(1); // Always L1 for enroller
      expect(result.percentage).toBe(0.30);
    });
  });

  describe('Positional (Matrix) Overrides', () => {
    it('should pay Bronze L1 (30%) and L2 (5%)', () => {
      const bronze: OverrideMember = {
        memberId: 'bronze-1',
        techRank: 'bronze',
        personalCreditsMonthly: 150,
        overrideQualified: true,
      };

      const sale: SaleInfo = {
        orderId: 'order-6',
        sellerMemberId: 'seller-6',
        priceCents: 7900,
        productType: 'standard',
      };

      // L1 positional (not enroller)
      const l1Result = calculateOverride(bronze, sale, false, 1);
      expect(l1Result.rule).toBe('positional');
      expect(l1Result.level).toBe(1);
      expect(l1Result.percentage).toBe(0.30);

      // L2 positional
      const l2Result = calculateOverride(bronze, sale, false, 2);
      expect(l2Result.rule).toBe('positional');
      expect(l2Result.level).toBe(2);
      expect(l2Result.percentage).toBe(0.05);

      // L3 not unlocked for Bronze
      const l3Result = calculateOverride(bronze, sale, false, 3);
      expect(l3Result.percentage).toBe(0);
      expect(l3Result.amountCents).toBe(0);
      expect(l3Result.reason).toContain('does not unlock L3');
    });

    it('should pay Silver L1 (30%), L2 (10%), L3 (5%)', () => {
      const silver: OverrideMember = {
        memberId: 'silver-1',
        techRank: 'silver',
        personalCreditsMonthly: 500,
        overrideQualified: true,
      };

      const sale: SaleInfo = {
        orderId: 'order-7',
        sellerMemberId: 'seller-7',
        priceCents: 7900,
        productType: 'standard',
      };

      const l1 = calculateOverride(silver, sale, false, 1);
      expect(l1.percentage).toBe(0.30);

      const l2 = calculateOverride(silver, sale, false, 2);
      expect(l2.percentage).toBe(0.10);

      const l3 = calculateOverride(silver, sale, false, 3);
      expect(l3.percentage).toBe(0.05);

      // L4 not unlocked
      const l4 = calculateOverride(silver, sale, false, 4);
      expect(l4.percentage).toBe(0);
      expect(l4.amountCents).toBe(0);
    });

    it('should pay Elite all 5 levels (30%, 25%, 20%, 15%, 10%)', () => {
      const elite: OverrideMember = {
        memberId: 'elite-1',
        techRank: 'elite',
        personalCreditsMonthly: 5000,
        overrideQualified: true,
      };

      const sale: SaleInfo = {
        orderId: 'order-8',
        sellerMemberId: 'seller-8',
        priceCents: 7900,
        productType: 'standard',
      };

      const l1 = calculateOverride(elite, sale, false, 1);
      expect(l1.percentage).toBe(0.30);

      const l2 = calculateOverride(elite, sale, false, 2);
      expect(l2.percentage).toBe(0.25);

      const l3 = calculateOverride(elite, sale, false, 3);
      expect(l3.percentage).toBe(0.20);

      const l4 = calculateOverride(elite, sale, false, 4);
      expect(l4.percentage).toBe(0.15);

      const l5 = calculateOverride(elite, sale, false, 5);
      expect(l5.percentage).toBe(0.10);

      // All levels should be qualified
      expect(l1.qualified).toBe(true);
      expect(l2.qualified).toBe(true);
      expect(l3.qualified).toBe(true);
      expect(l4.qualified).toBe(true);
      expect(l5.qualified).toBe(true);
    });

    it('should NOT pay levels beyond rank unlock', () => {
      const gold: OverrideMember = {
        memberId: 'gold-1',
        techRank: 'gold',
        personalCreditsMonthly: 1500,
        overrideQualified: true,
      };

      const sale: SaleInfo = {
        orderId: 'order-9',
        sellerMemberId: 'seller-9',
        priceCents: 7900,
        productType: 'standard',
      };

      // Gold unlocks L1-L4 only
      const l4 = calculateOverride(gold, sale, false, 4);
      expect(l4.percentage).toBe(0.05); // L4 is unlocked

      const l5 = calculateOverride(gold, sale, false, 5);
      expect(l5.percentage).toBe(0); // L5 NOT unlocked
      expect(l5.amountCents).toBe(0);
      expect(l5.reason).toContain('does not unlock L5');
    });
  });

  describe('Business Center Exception', () => {
    it('should pay $8 flat to enroller (sponsor)', () => {
      const sponsor: OverrideMember = {
        memberId: 'sponsor-bc',
        techRank: 'silver',
        personalCreditsMonthly: 500,
        overrideQualified: true,
      };

      const bcSale: SaleInfo = {
        orderId: 'bc-order-1',
        sellerMemberId: 'seller-bc',
        priceCents: 3900,
        productType: 'business_center',
      };

      const result = calculateOverride(sponsor, bcSale, true);

      expect(result.rule).toBe('business_center');
      expect(result.amountCents).toBe(800); // $8 flat
      expect(result.percentage).toBe(0); // Fixed amount, not percentage
      expect(result.level).toBe(1);
      expect(result.qualified).toBe(true);
    });

    it('should pay $0 to non-enroller (no override pool for BC)', () => {
      const upline: OverrideMember = {
        memberId: 'upline-bc',
        techRank: 'gold',
        personalCreditsMonthly: 1500,
        overrideQualified: true,
      };

      const bcSale: SaleInfo = {
        orderId: 'bc-order-2',
        sellerMemberId: 'seller-bc-2',
        priceCents: 3900,
        productType: 'business_center',
      };

      const result = calculateOverride(upline, bcSale, false, 2);

      expect(result.rule).toBe('business_center');
      expect(result.amountCents).toBe(0);
      expect(result.qualified).toBe(true);
      expect(result.reason).toContain('no override pool beyond sponsor bonus');
    });
  });

  describe('calculateAllOverrides', () => {
    it('should calculate overrides for all upline members', () => {
      const sale: SaleInfo = {
        orderId: 'order-10',
        sellerMemberId: 'seller-10',
        priceCents: 7900,
        productType: 'standard',
      };

      const upline: OverrideMember[] = [
        { memberId: 'l1', techRank: 'silver', personalCreditsMonthly: 500, overrideQualified: true },
        { memberId: 'l2', techRank: 'gold', personalCreditsMonthly: 1500, overrideQualified: true },
        { memberId: 'l3', techRank: 'platinum', personalCreditsMonthly: 2500, overrideQualified: true },
        { memberId: 'l4', techRank: 'ruby', personalCreditsMonthly: 3500, overrideQualified: true },
        { memberId: 'l5', techRank: 'elite', personalCreditsMonthly: 5000, overrideQualified: true },
      ];

      const enrollerId = 'l2'; // L2 is the enroller

      const results = calculateAllOverrides(sale, upline, enrollerId);

      expect(results).toHaveLength(5);

      // L1: Positional Silver (L1 = 30%)
      expect(results[0].rule).toBe('positional');
      expect(results[0].level).toBe(1);
      expect(results[0].percentage).toBe(0.30);

      // L2: ENROLLER - Always L1 (30%)
      expect(results[1].rule).toBe('enroller');
      expect(results[1].level).toBe(1);
      expect(results[1].percentage).toBe(0.30);

      // L3: Positional Platinum (L3 = 12%)
      expect(results[2].rule).toBe('positional');
      expect(results[2].level).toBe(3);
      expect(results[2].percentage).toBe(0.12);

      // L4: Positional Ruby (L4 = 10%)
      expect(results[3].rule).toBe('positional');
      expect(results[3].level).toBe(4);
      expect(results[3].percentage).toBe(0.10);

      // L5: Positional Elite (L5 = 10%)
      expect(results[4].rule).toBe('positional');
      expect(results[4].level).toBe(5);
      expect(results[4].percentage).toBe(0.10);
    });

    it('should skip unqualified members (below 50 credits)', () => {
      const sale: SaleInfo = {
        orderId: 'order-11',
        sellerMemberId: 'seller-11',
        priceCents: 7900,
        productType: 'standard',
      };

      const upline: OverrideMember[] = [
        { memberId: 'l1', techRank: 'silver', personalCreditsMonthly: 500, overrideQualified: true },
        { memberId: 'l2', techRank: 'gold', personalCreditsMonthly: 30, overrideQualified: false }, // Below 50
        { memberId: 'l3', techRank: 'platinum', personalCreditsMonthly: 2500, overrideQualified: true },
      ];

      const results = calculateAllOverrides(sale, upline, 'l1');

      expect(results[0].qualified).toBe(true);
      expect(results[0].amountCents).toBeGreaterThan(0);

      expect(results[1].qualified).toBe(false); // Not qualified
      expect(results[1].amountCents).toBe(0);

      expect(results[2].qualified).toBe(true);
      expect(results[2].amountCents).toBeGreaterThan(0);
    });
  });

  describe('getTotalOverrides', () => {
    it('should sum all override amounts', () => {
      const results = [
        {
          memberId: 'm1',
          memberTechRank: 'silver' as const,
          amountCents: 441,
          level: 1,
          percentage: 0.30,
          rule: 'positional' as const,
          qualified: true,
        },
        {
          memberId: 'm2',
          memberTechRank: 'gold' as const,
          amountCents: 147,
          level: 2,
          percentage: 0.10,
          rule: 'positional' as const,
          qualified: true,
        },
        {
          memberId: 'm3',
          memberTechRank: 'platinum' as const,
          amountCents: 0,
          level: 3,
          percentage: 0,
          rule: 'positional' as const,
          qualified: false,
        },
      ];

      const total = getTotalOverrides(results);
      expect(total).toBe(588); // 441 + 147 + 0
    });
  });

  describe('validateOverrides', () => {
    it('should validate override total does not exceed pool', () => {
      const sale: SaleInfo = {
        orderId: 'order-12',
        sellerMemberId: 'seller-12',
        priceCents: 7900,
        productType: 'standard',
      };

      const results = [
        {
          memberId: 'm1',
          memberTechRank: 'elite' as const,
          amountCents: 441, // 30%
          level: 1,
          percentage: 0.30,
          rule: 'enroller' as const,
          qualified: true,
        },
      ];

      const validation = validateOverrides(sale, results);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.totalPaidCents).toBe(441);
      expect(validation.overridePoolCents).toBeGreaterThan(441);
    });

    it('should detect when override total exceeds pool', () => {
      const sale: SaleInfo = {
        orderId: 'order-13',
        sellerMemberId: 'seller-13',
        priceCents: 1000,
        productType: 'standard',
      };

      // Manually create invalid overrides that exceed pool
      const results = [
        {
          memberId: 'm1',
          memberTechRank: 'elite' as const,
          amountCents: 10000, // Impossible amount
          level: 1,
          percentage: 0.30,
          rule: 'positional' as const,
          qualified: true,
        },
      ];

      const validation = validateOverrides(sale, results);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('exceed');
    });

    it('should validate Business Center correctly', () => {
      const bcSale: SaleInfo = {
        orderId: 'bc-order-3',
        sellerMemberId: 'seller-bc-3',
        priceCents: 3900,
        productType: 'business_center',
      };

      const results = [
        {
          memberId: 'sponsor',
          memberTechRank: 'silver' as const,
          amountCents: 800, // $8 sponsor bonus
          level: 1,
          percentage: 0,
          rule: 'business_center' as const,
          qualified: true,
        },
      ];

      const validation = validateOverrides(bcSale, results);

      expect(validation.valid).toBe(true);
      expect(validation.overridePoolCents).toBe(0); // BC has no percentage pool
      expect(validation.totalPaidCents).toBe(800);
    });
  });

  describe('formatOverrideResult', () => {
    it('should format qualified override result', () => {
      const result = {
        memberId: 'm1',
        memberTechRank: 'gold' as const,
        amountCents: 441,
        level: 1,
        percentage: 0.30,
        rule: 'enroller' as const,
        qualified: true,
      };

      const formatted = formatOverrideResult(result);

      expect(formatted).toContain('ENROLLER');
      expect(formatted).toContain('gold');
      expect(formatted).toContain('$4.41');
      expect(formatted).toContain('30.0%');
    });

    it('should format unqualified override result', () => {
      const result = {
        memberId: 'm2',
        memberTechRank: 'silver' as const,
        amountCents: 0,
        level: 2,
        percentage: 0,
        rule: 'positional' as const,
        qualified: false,
        reason: 'Below 50 credit minimum',
      };

      const formatted = formatOverrideResult(result);

      expect(formatted).toContain('L2');
      expect(formatted).toContain('silver');
      expect(formatted).toContain('$0.00');
      expect(formatted).toContain('NOT QUALIFIED');
      expect(formatted).toContain('Below 50 credit minimum');
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid matrix level', () => {
      const member: OverrideMember = {
        memberId: 'member-edge',
        techRank: 'gold',
        personalCreditsMonthly: 1500,
        overrideQualified: true,
      };

      const sale: SaleInfo = {
        orderId: 'order-edge',
        sellerMemberId: 'seller-edge',
        priceCents: 7900,
        productType: 'standard',
      };

      // Test invalid levels
      const l0 = calculateOverride(member, sale, false, 0);
      expect(l0.amountCents).toBe(0);
      expect(l0.reason).toContain('out of range');

      const l6 = calculateOverride(member, sale, false, 6);
      expect(l6.amountCents).toBe(0);
      expect(l6.reason).toContain('out of range');
    });

    it('should handle member with exactly 50 credits', () => {
      const member: OverrideMember = {
        memberId: 'member-50',
        techRank: 'bronze',
        personalCreditsMonthly: 50,
        overrideQualified: true,
      };

      const sale: SaleInfo = {
        orderId: 'order-50',
        sellerMemberId: 'seller-50',
        priceCents: 7900,
        productType: 'standard',
      };

      const result = calculateOverride(member, sale, true, 1);

      expect(result.qualified).toBe(true);
      expect(result.amountCents).toBeGreaterThan(0);
    });
  });
});
