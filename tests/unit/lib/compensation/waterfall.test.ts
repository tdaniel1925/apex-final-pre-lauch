// =============================================
// UNIT TESTS - WATERFALL CALCULATIONS
// =============================================
// Phase: 5 (Testing & Validation)
// Agent: 5A
// =============================================

import { describe, it, expect } from 'vitest';
import {
  calculateWaterfall,
  getBusinessCenterSponsorBonus,
  formatWaterfallResult,
  validateWaterfall,
  aggregatePools,
} from '@/lib/compensation/waterfall';

describe('Waterfall Calculations', () => {
  describe('calculateWaterfall - Standard Products', () => {
    it('should calculate waterfall for $79 PulseGuard member price', () => {
      const result = calculateWaterfall(7900, 'standard');

      // BotMakers: 30% of $79 = $23.70
      expect(result.botmakersFeeCents).toBe(2370);

      // Adjusted Gross: $79 - $23.70 = $55.30
      expect(result.adjustedGrossCents).toBe(5530);

      // Apex: 30% of $55.30 = $16.59
      expect(result.apexTakeCents).toBe(1659);

      // Remainder: $55.30 - $16.59 = $38.71
      expect(result.remainderCents).toBe(3871);

      // Bonus Pool: 3.5% of $38.71 = $1.35
      expect(result.bonusPoolCents).toBe(135);

      // Leadership Pool: 1.5% of $38.71 = $0.58
      expect(result.leadershipPoolCents).toBe(58);

      // Commission Pool: $38.71 - $1.35 - $0.58 = $36.78
      expect(result.commissionPoolCents).toBe(3678);

      // Seller: 60% of $36.78 = $22.07
      expect(result.sellerCommissionCents).toBe(2207);

      // Override Pool: 40% of $36.78 = $14.71
      expect(result.overridePoolCents).toBe(1471);

      // Effective percentage should be ~27.9%
      expect(result.effectivePercentage).toBeCloseTo(27.94, 1);
    });

    it('should calculate waterfall for $99 PulseGuard retail price', () => {
      const result = calculateWaterfall(9900, 'standard');

      expect(result.botmakersFeeCents).toBe(2970); // 30%
      expect(result.adjustedGrossCents).toBe(6930);
      expect(result.apexTakeCents).toBe(2079); // 30% of adjusted
      expect(result.remainderCents).toBe(4851);
      expect(result.bonusPoolCents).toBe(170); // 3.5%
      expect(result.leadershipPoolCents).toBe(73); // 1.5%
      expect(result.commissionPoolCents).toBe(4608);
      expect(result.sellerCommissionCents).toBe(2765); // 60%
      expect(result.overridePoolCents).toBe(1843); // 40%
    });

    it('should handle small amounts without rounding errors', () => {
      const result = calculateWaterfall(1000, 'standard'); // $10

      expect(result.priceCents).toBe(1000);
      expect(result.botmakersFeeCents).toBe(300);
      expect(result.adjustedGrossCents).toBe(700);
      expect(result.apexTakeCents).toBe(210);
      expect(result.remainderCents).toBe(490);
      expect(result.bonusPoolCents).toBe(17); // 3.5%
      expect(result.leadershipPoolCents).toBe(7); // 1.5%
      expect(result.commissionPoolCents).toBe(466);
      expect(result.sellerCommissionCents).toBe(280); // 60%
      expect(result.overridePoolCents).toBe(186); // 40%
    });

    it('should handle large amounts accurately', () => {
      const result = calculateWaterfall(999900, 'standard'); // $9,999

      expect(result.priceCents).toBe(999900);
      expect(result.botmakersFeeCents).toBe(299970);
      expect(result.adjustedGrossCents).toBe(699930);
      expect(result.apexTakeCents).toBe(209979);
      expect(result.remainderCents).toBe(489951);
      expect(result.bonusPoolCents).toBe(17148); // 3.5%
      expect(result.leadershipPoolCents).toBe(7349); // 1.5%
      expect(result.commissionPoolCents).toBe(465454);
      expect(result.sellerCommissionCents).toBe(279272); // 60%
      expect(result.overridePoolCents).toBe(186182); // 40%
    });
  });

  describe('calculateWaterfall - Business Center', () => {
    it('should use fixed split for Business Center ($39)', () => {
      const result = calculateWaterfall(3900, 'business_center');

      expect(result.priceCents).toBe(3900);
      expect(result.productType).toBe('business_center');

      // Fixed amounts (from spec)
      expect(result.botmakersFeeCents).toBe(1100); // $11
      expect(result.apexTakeCents).toBe(800); // $8
      expect(result.sellerCommissionCents).toBe(1000); // $10
      // Sponsor bonus is $8 (handled separately in override module)
      // Costs: $2

      // No percentage-based pools for BC
      expect(result.bonusPoolCents).toBe(0);
      expect(result.leadershipPoolCents).toBe(0);
      expect(result.overridePoolCents).toBe(0);

      // Effective percentage ($10 / $39)
      expect(result.effectivePercentage).toBeCloseTo(25.64, 2);
    });

    it('should ignore priceCents parameter for Business Center', () => {
      // BC always uses $39 regardless of input
      const result1 = calculateWaterfall(5000, 'business_center');
      const result2 = calculateWaterfall(3900, 'business_center');

      expect(result1.priceCents).toBe(3900);
      expect(result2.priceCents).toBe(3900);
      expect(result1.sellerCommissionCents).toBe(result2.sellerCommissionCents);
    });
  });

  describe('getBusinessCenterSponsorBonus', () => {
    it('should return $8 sponsor bonus', () => {
      const bonus = getBusinessCenterSponsorBonus();
      expect(bonus).toBe(800); // $8.00 in cents
    });
  });

  describe('validateWaterfall', () => {
    it('should validate standard waterfall adds up correctly', () => {
      const result = calculateWaterfall(7900, 'standard');
      const validation = validateWaterfall(result);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should validate Business Center split adds up correctly', () => {
      const result = calculateWaterfall(3900, 'business_center');
      const validation = validateWaterfall(result);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid waterfall calculations', () => {
      // Manually create an invalid waterfall
      const invalidResult = {
        priceCents: 10000,
        productType: 'standard' as const,
        botmakersFeeCents: 3000,
        adjustedGrossCents: 8000, // Should be 7000
        apexTakeCents: 2100,
        remainderCents: 4900,
        bonusPoolCents: 171,
        leadershipPoolCents: 73,
        commissionPoolCents: 4656,
        sellerCommissionCents: 2793,
        overridePoolCents: 1863,
        effectivePercentage: 27.93,
      };

      const validation = validateWaterfall(invalidResult);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('aggregatePools', () => {
    it('should aggregate multiple waterfalls correctly', () => {
      const sales = [
        calculateWaterfall(7900, 'standard'), // PulseGuard member
        calculateWaterfall(9900, 'standard'), // PulseGuard retail
        calculateWaterfall(14900, 'standard'), // AgentPulse member
        calculateWaterfall(3900, 'business_center'), // BC
      ];

      const aggregation = aggregatePools(sales);

      expect(aggregation.saleCount).toBe(4);
      expect(aggregation.totalSalesCents).toBe(36600); // $366

      // BC contributes $0 to pools, other 3 contribute
      // $79: bonus = 135, leadership = 58
      // $99: bonus = 170, leadership = 73
      // $149: bonus = 256, leadership = 110 (actual calculated values)
      expect(aggregation.totalBonusPoolCents).toBe(561); // 135 + 170 + 256 + 0
      expect(aggregation.totalLeadershipPoolCents).toBe(241); // 58 + 73 + 110 + 0
    });

    it('should handle empty sales array', () => {
      const aggregation = aggregatePools([]);

      expect(aggregation.saleCount).toBe(0);
      expect(aggregation.totalSalesCents).toBe(0);
      expect(aggregation.totalBonusPoolCents).toBe(0);
      expect(aggregation.totalLeadershipPoolCents).toBe(0);
    });
  });

  describe('formatWaterfallResult', () => {
    it('should format standard waterfall as readable string', () => {
      const result = calculateWaterfall(7900, 'standard');
      const formatted = formatWaterfallResult(result);

      expect(formatted).toContain('Standard Waterfall:');
      expect(formatted).toContain('Price:              $79.00');
      expect(formatted).toContain('BotMakers Fee:      $23.70');
      expect(formatted).toContain('Seller Commission:  $22.07');
      expect(formatted).toContain('Override Pool:      $14.71');
    });

    it('should format Business Center waterfall as readable string', () => {
      const result = calculateWaterfall(3900, 'business_center');
      const formatted = formatWaterfallResult(result);

      expect(formatted).toContain('Business Center Waterfall');
      expect(formatted).toContain('Price:              $39.00');
      expect(formatted).toContain('Seller Commission:  $10.00');
      expect(formatted).toContain('Sponsor Bonus:      $8.00');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero price (should not happen in production)', () => {
      const result = calculateWaterfall(0, 'standard');

      expect(result.priceCents).toBe(0);
      expect(result.sellerCommissionCents).toBe(0);
      expect(result.overridePoolCents).toBe(0);
      expect(result.bonusPoolCents).toBe(0);
      expect(result.leadershipPoolCents).toBe(0);
    });

    it('should maintain precision with rounding', () => {
      // Test a price that creates tricky rounding scenarios
      const result = calculateWaterfall(3333, 'standard'); // $33.33

      const validation = validateWaterfall(result);
      expect(validation.valid).toBe(true);

      // Ensure all amounts are integers (cents)
      expect(Number.isInteger(result.botmakersFeeCents)).toBe(true);
      expect(Number.isInteger(result.apexTakeCents)).toBe(true);
      expect(Number.isInteger(result.bonusPoolCents)).toBe(true);
      expect(Number.isInteger(result.leadershipPoolCents)).toBe(true);
      expect(Number.isInteger(result.sellerCommissionCents)).toBe(true);
      expect(Number.isInteger(result.overridePoolCents)).toBe(true);
    });
  });

  describe('Waterfall Consistency', () => {
    it('should ensure seller commission is always 60% of commission pool', () => {
      const prices = [1000, 5000, 7900, 9900, 14900, 50000];

      prices.forEach((price) => {
        const result = calculateWaterfall(price, 'standard');
        const expectedSeller = Math.round(result.commissionPoolCents * 0.6);

        expect(result.sellerCommissionCents).toBe(expectedSeller);
      });
    });

    it('should ensure override pool is 40% of commission pool', () => {
      const prices = [1000, 5000, 7900, 9900, 14900, 50000];

      prices.forEach((price) => {
        const result = calculateWaterfall(price, 'standard');
        const commissionPool = result.commissionPoolCents;
        const sellerAndOverride = result.sellerCommissionCents + result.overridePoolCents;

        // Allow 1 cent rounding tolerance
        expect(Math.abs(commissionPool - sellerAndOverride)).toBeLessThanOrEqual(1);
      });
    });

    it('should ensure bonus pool is always 3.5% of remainder', () => {
      const prices = [1000, 5000, 7900, 9900, 14900, 50000];

      prices.forEach((price) => {
        const result = calculateWaterfall(price, 'standard');
        const expectedBonus = Math.round(result.remainderCents * 0.035);

        expect(result.bonusPoolCents).toBe(expectedBonus);
      });
    });

    it('should ensure leadership pool is always 1.5% of remainder', () => {
      const prices = [1000, 5000, 7900, 9900, 14900, 50000];

      prices.forEach((price) => {
        const result = calculateWaterfall(price, 'standard');
        const expectedLeadership = Math.round(result.remainderCents * 0.015);

        expect(result.leadershipPoolCents).toBe(expectedLeadership);
      });
    });
  });
});
