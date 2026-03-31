// =============================================
// UNIT TESTS - BONUS PROGRAMS
// =============================================
// Phase: 5 (Testing & Validation)
// Agent: 5A
// =============================================

import { describe, it, expect } from 'vitest';
import {
  calculateRankBonus,
  calculateBonusPoolShares,
  calculateLeadershipPoolShares,
  formatBonusPoolShare,
  formatLeadershipPoolShare,
  getTotalRankBonuses,
  getTotalBonusPoolPayouts,
  getTotalLeadershipPoolPayouts,
  validateBonusPoolDistribution,
  validateLeadershipPoolDistribution,
} from '@/lib/compensation/bonus-programs';

describe('Bonus Programs', () => {
  describe('calculateRankBonus - Rank Advancement Bonuses', () => {
    it('should pay Bronze bonus ($250) on first Bronze promotion', () => {
      const result = calculateRankBonus('member-1', 'bronze', 'starter', true);

      expect(result.qualified).toBe(true);
      expect(result.bonusAmountCents).toBe(25000); // $250
      expect(result.newRank).toBe('bronze');
      expect(result.memberId).toBe('member-1');
    });

    it('should pay Silver bonus ($1,000) on first Silver promotion', () => {
      const result = calculateRankBonus('member-2', 'silver', 'bronze', true);

      expect(result.qualified).toBe(true);
      expect(result.bonusAmountCents).toBe(100000); // $1,000
    });

    it('should pay Diamond Ambassador bonus ($18,000) on first Diamond Ambassador promotion', () => {
      const result = calculateRankBonus('member-3', 'diamond_ambassador', 'ruby', true);

      expect(result.qualified).toBe(true);
      expect(result.bonusAmountCents).toBe(1800000); // $18,000
    });

    it('should NOT pay bonus if not override qualified (<50 credits)', () => {
      const result = calculateRankBonus('member-4', 'bronze', 'starter', false);

      expect(result.qualified).toBe(false);
      expect(result.bonusAmountCents).toBe(0);
      expect(result.reason).toContain('Not override qualified');
      expect(result.reason).toContain('50+ personal QV');
    });

    it('should NOT pay bonus on re-qualification (already achieved rank)', () => {
      const result = calculateRankBonus('member-5', 'silver', 'silver', true);

      expect(result.qualified).toBe(false);
      expect(result.bonusAmountCents).toBe(0);
      expect(result.reason).toContain('Already achieved silver');
    });

    it('should NOT pay bonus when re-promoted to previously achieved rank', () => {
      // Member was Elite, demoted, now back to Gold
      const result = calculateRankBonus('member-6', 'gold', 'diamond_ambassador', true);

      expect(result.qualified).toBe(false);
      expect(result.bonusAmountCents).toBe(0);
      expect(result.reason).toContain('Already achieved gold or higher');
      expect(result.reason).toContain('highest: diamond_ambassador');
    });

    it('should pay bonus when skipping ranks', () => {
      // Starter → Gold (skipped Bronze and Silver)
      const result = calculateRankBonus('member-7', 'gold', 'starter', true);

      expect(result.qualified).toBe(true);
      expect(result.bonusAmountCents).toBe(300000); // $3,000 Gold bonus
    });

    it('should NOT pay bonus for Starter rank', () => {
      const result = calculateRankBonus('member-8', 'starter', 'starter', true);

      expect(result.bonusAmountCents).toBe(0);
      // Logic checks shouldPayRankBonus first, which returns false for same rank
      expect(result.reason).toContain('Already achieved starter');
    });
  });

  describe('calculateBonusPoolShares - 3.5% Equal Distribution', () => {
    it('should divide pool equally among qualified members', () => {
      const totalPoolCents = 100000; // $1,000
      const qualifiedMembers = [
        { memberId: 'm1', memberName: 'Alice' },
        { memberId: 'm2', memberName: 'Bob' },
        { memberId: 'm3', memberName: 'Charlie' },
        { memberId: 'm4', memberName: 'Diana' },
      ];

      const shares = calculateBonusPoolShares(totalPoolCents, qualifiedMembers, '2026-03');

      expect(shares).toHaveLength(4);
      expect(shares[0].shareAmountCents).toBe(25000); // $250 each
      expect(shares[1].shareAmountCents).toBe(25000);
      expect(shares[2].shareAmountCents).toBe(25000);
      expect(shares[3].shareAmountCents).toBe(25000);

      expect(shares[0].periodLabel).toBe('2026-03');
      expect(shares[0].memberName).toBe('Alice');
    });

    it('should handle uneven division with floor rounding', () => {
      const totalPoolCents = 10000; // $100
      const qualifiedMembers = [
        { memberId: 'm1', memberName: 'Alice' },
        { memberId: 'm2', memberName: 'Bob' },
        { memberId: 'm3', memberName: 'Charlie' },
      ];

      const shares = calculateBonusPoolShares(totalPoolCents, qualifiedMembers, '2026-03');

      expect(shares).toHaveLength(3);
      expect(shares[0].shareAmountCents).toBe(3333); // Floor($100/3) = $33.33
      expect(shares[1].shareAmountCents).toBe(3333);
      expect(shares[2].shareAmountCents).toBe(3333);

      // Total paid: 9999, remainder: 1 cent
      const totalPaid = shares.reduce((sum, s) => sum + s.shareAmountCents, 0);
      expect(totalPaid).toBe(9999);
    });

    it('should return empty array if no qualified members', () => {
      const shares = calculateBonusPoolShares(50000, [], '2026-03');

      expect(shares).toHaveLength(0);
    });

    it('should handle single qualified member (gets entire pool)', () => {
      const totalPoolCents = 50000; // $500
      const qualifiedMembers = [{ memberId: 'm1', memberName: 'Solo Winner' }];

      const shares = calculateBonusPoolShares(totalPoolCents, qualifiedMembers, '2026-03');

      expect(shares).toHaveLength(1);
      expect(shares[0].shareAmountCents).toBe(50000); // Gets full pool
      expect(shares[0].memberName).toBe('Solo Winner');
    });

    it('should handle large number of qualified members', () => {
      const totalPoolCents = 1000000; // $10,000
      const qualifiedMembers = Array.from({ length: 100 }, (_, i) => ({
        memberId: `m${i}`,
        memberName: `Member ${i}`,
      }));

      const shares = calculateBonusPoolShares(totalPoolCents, qualifiedMembers, '2026-03');

      expect(shares).toHaveLength(100);
      expect(shares[0].shareAmountCents).toBe(10000); // $100 each
    });
  });

  describe('calculateLeadershipPoolShares - 1.5% Elite Distribution', () => {
    it('should divide pool proportionally based on production points', () => {
      const totalPoolCents = 150000; // $1,500
      const eliteMembers = [
        {
          memberId: 'e1',
          memberName: 'Elite Alice',
          personalCredits: 1000,
          teamCredits: 4000,
          overrideQualified: true,
        }, // 5,000 points (50%)
        {
          memberId: 'e2',
          memberName: 'Elite Bob',
          personalCredits: 2000,
          teamCredits: 3000,
          overrideQualified: true,
        }, // 5,000 points (50%)
      ];

      const shares = calculateLeadershipPoolShares(totalPoolCents, eliteMembers, '2026-03');

      expect(shares).toHaveLength(2);

      // Each has 5,000 points (50% each)
      expect(shares[0].sharePoints).toBe(5000);
      expect(shares[0].sharePercentage).toBe(50);
      expect(shares[0].payoutCents).toBe(75000); // $750 (50%)

      expect(shares[1].sharePoints).toBe(5000);
      expect(shares[1].sharePercentage).toBe(50);
      expect(shares[1].payoutCents).toBe(75000);
    });

    it('should handle unequal production distribution', () => {
      const totalPoolCents = 100000; // $1,000
      const eliteMembers = [
        {
          memberId: 'e1',
          memberName: 'High Producer',
          personalCredits: 3000,
          teamCredits: 7000,
          overrideQualified: true,
        }, // 10,000 points (80%)
        {
          memberId: 'e2',
          memberName: 'Lower Producer',
          personalCredits: 1000,
          teamCredits: 1500,
          overrideQualified: true,
        }, // 2,500 points (20%)
      ];

      const shares = calculateLeadershipPoolShares(totalPoolCents, eliteMembers, '2026-03');

      expect(shares).toHaveLength(2);

      // High Producer: 80%
      expect(shares[0].sharePoints).toBe(10000);
      expect(shares[0].sharePercentage).toBe(80);
      expect(shares[0].payoutCents).toBe(80000); // $800

      // Lower Producer: 20%
      expect(shares[1].sharePoints).toBe(2500);
      expect(shares[1].sharePercentage).toBe(20);
      expect(shares[1].payoutCents).toBe(20000); // $200
    });

    it('should exclude non-qualified Elite members (<50 credits)', () => {
      const totalPoolCents = 100000;
      const eliteMembers = [
        {
          memberId: 'e1',
          memberName: 'Qualified Elite',
          personalCredits: 2000,
          teamCredits: 3000,
          overrideQualified: true,
        },
        {
          memberId: 'e2',
          memberName: 'Unqualified Elite',
          personalCredits: 30, // Below 50
          teamCredits: 5000,
          overrideQualified: false,
        },
      ];

      const shares = calculateLeadershipPoolShares(totalPoolCents, eliteMembers, '2026-03');

      expect(shares).toHaveLength(1); // Only qualified member
      expect(shares[0].memberId).toBe('e1');
      expect(shares[0].payoutCents).toBe(100000); // Gets entire pool
    });

    it('should return empty array if no qualified Elite members', () => {
      const shares = calculateLeadershipPoolShares(50000, [], '2026-03');

      expect(shares).toHaveLength(0);
    });

    it('should return empty array if total production is zero', () => {
      const eliteMembers = [
        {
          memberId: 'e1',
          memberName: 'Zero Production',
          personalCredits: 0,
          teamCredits: 0,
          overrideQualified: true,
        },
      ];

      const shares = calculateLeadershipPoolShares(50000, eliteMembers, '2026-03');

      expect(shares).toHaveLength(0);
    });

    it('should include personal and team credits in calculation', () => {
      const totalPoolCents = 100000;
      const eliteMembers = [
        {
          memberId: 'e1',
          memberName: 'Elite 1',
          personalCredits: 500,
          teamCredits: 500,
          overrideQualified: true,
        }, // 1,000 points
      ];

      const shares = calculateLeadershipPoolShares(totalPoolCents, eliteMembers, '2026-03');

      expect(shares[0].personalCredits).toBe(500);
      expect(shares[0].teamCredits).toBe(500);
      expect(shares[0].sharePoints).toBe(1000);
      expect(shares[0].sharePercentage).toBe(100);
    });
  });

  describe('Validation Functions', () => {
    it('should validate bonus pool distribution', () => {
      const totalPoolCents = 100000;
      const shares = [
        { memberId: 'm1', memberName: 'Alice', shareAmountCents: 25000, periodLabel: '2026-03' },
        { memberId: 'm2', memberName: 'Bob', shareAmountCents: 25000, periodLabel: '2026-03' },
        { memberId: 'm3', memberName: 'Charlie', shareAmountCents: 25000, periodLabel: '2026-03' },
        { memberId: 'm4', memberName: 'Diana', shareAmountCents: 25000, periodLabel: '2026-03' },
      ];

      const validation = validateBonusPoolDistribution(totalPoolCents, shares);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.totalPaidCents).toBe(100000);
      expect(validation.remainderCents).toBe(0);
    });

    it('should detect when bonus pool payouts exceed pool', () => {
      const totalPoolCents = 50000;
      const shares = [
        { memberId: 'm1', memberName: 'Alice', shareAmountCents: 30000, periodLabel: '2026-03' },
        { memberId: 'm2', memberName: 'Bob', shareAmountCents: 30000, periodLabel: '2026-03' },
      ];

      const validation = validateBonusPoolDistribution(totalPoolCents, shares);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('exceed pool');
      expect(validation.totalPaidCents).toBe(60000);
      expect(validation.totalPoolCents).toBe(50000);
    });

    it('should validate leadership pool distribution', () => {
      const totalPoolCents = 100000;
      const shares = [
        {
          memberId: 'e1',
          memberName: 'Elite 1',
          personalCredits: 1000,
          teamCredits: 4000,
          sharePoints: 5000,
          sharePercentage: 50,
          payoutCents: 50000,
          periodLabel: '2026-03',
        },
        {
          memberId: 'e2',
          memberName: 'Elite 2',
          personalCredits: 2000,
          teamCredits: 3000,
          sharePoints: 5000,
          sharePercentage: 50,
          payoutCents: 50000,
          periodLabel: '2026-03',
        },
      ];

      const validation = validateLeadershipPoolDistribution(totalPoolCents, shares);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect when leadership pool payouts exceed pool', () => {
      const totalPoolCents = 50000;
      const shares = [
        {
          memberId: 'e1',
          memberName: 'Elite 1',
          personalCredits: 5000,
          teamCredits: 20000,
          sharePoints: 25000,
          sharePercentage: 100,
          payoutCents: 80000, // Exceeds pool
          periodLabel: '2026-03',
        },
      ];

      const validation = validateLeadershipPoolDistribution(totalPoolCents, shares);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('exceed pool');
    });
  });

  describe('Total Calculation Functions', () => {
    it('should calculate total rank bonuses', () => {
      const bonuses = [
        { memberId: 'm1', newRank: 'bronze' as const, bonusAmountCents: 25000, qualified: true },
        { memberId: 'm2', newRank: 'silver' as const, bonusAmountCents: 100000, qualified: true },
        { memberId: 'm3', newRank: 'gold' as const, bonusAmountCents: 0, qualified: false }, // Not qualified
      ];

      const total = getTotalRankBonuses(bonuses);

      expect(total).toBe(125000); // $250 + $1,000 = $1,250
    });

    it('should calculate total bonus pool payouts', () => {
      const shares = [
        { memberId: 'm1', memberName: 'Alice', shareAmountCents: 25000, periodLabel: '2026-03' },
        { memberId: 'm2', memberName: 'Bob', shareAmountCents: 25000, periodLabel: '2026-03' },
      ];

      const total = getTotalBonusPoolPayouts(shares);

      expect(total).toBe(50000);
    });

    it('should calculate total leadership pool payouts', () => {
      const shares = [
        {
          memberId: 'e1',
          memberName: 'Elite 1',
          personalCredits: 1000,
          teamCredits: 4000,
          sharePoints: 5000,
          sharePercentage: 60,
          payoutCents: 60000,
          periodLabel: '2026-03',
        },
        {
          memberId: 'e2',
          memberName: 'Elite 2',
          personalCredits: 1000,
          teamCredits: 2333,
          sharePoints: 3333,
          sharePercentage: 40,
          payoutCents: 40000,
          periodLabel: '2026-03',
        },
      ];

      const total = getTotalLeadershipPoolPayouts(shares);

      expect(total).toBe(100000);
    });
  });

  describe('Format Functions', () => {
    it('should format bonus pool share', () => {
      const share = {
        memberId: 'm1',
        memberName: 'Alice Johnson',
        shareAmountCents: 33333,
        periodLabel: '2026-03',
      };

      const formatted = formatBonusPoolShare(share);

      expect(formatted).toContain('Alice Johnson');
      expect(formatted).toContain('$333.33');
      expect(formatted).toContain('2026-03');
    });

    it('should format leadership pool share', () => {
      const share = {
        memberId: 'e1',
        memberName: 'Elite Bob',
        personalCredits: 2000,
        teamCredits: 3000,
        sharePoints: 5000,
        sharePercentage: 62.5,
        payoutCents: 62500,
        periodLabel: '2026-03',
      };

      const formatted = formatLeadershipPoolShare(share);

      expect(formatted).toContain('Elite Bob');
      expect(formatted).toContain('$625.00');
      expect(formatted).toContain('62.50%');
      expect(formatted).toContain('5000 points');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small bonus pool amounts', () => {
      const shares = calculateBonusPoolShares(10, [{ memberId: 'm1', memberName: 'Alice' }], '2026-03');

      expect(shares[0].shareAmountCents).toBe(10); // 10 cents
    });

    it('should handle very large bonus pool amounts', () => {
      const totalPoolCents = 10000000; // $100,000
      const qualifiedMembers = Array.from({ length: 10 }, (_, i) => ({
        memberId: `m${i}`,
        memberName: `Member ${i}`,
      }));

      const shares = calculateBonusPoolShares(totalPoolCents, qualifiedMembers, '2026-03');

      expect(shares).toHaveLength(10);
      expect(shares[0].shareAmountCents).toBe(1000000); // $10,000 each
    });

    it('should handle Elite member with only personal credits (no team)', () => {
      const totalPoolCents = 100000;
      const eliteMembers = [
        {
          memberId: 'e1',
          memberName: 'Solo Producer',
          personalCredits: 5000,
          teamCredits: 0,
          overrideQualified: true,
        },
      ];

      const shares = calculateLeadershipPoolShares(totalPoolCents, eliteMembers, '2026-03');

      expect(shares[0].sharePoints).toBe(5000);
      expect(shares[0].payoutCents).toBe(100000);
    });

    it('should handle Elite member with only team credits (no personal, but qualified)', () => {
      // This is theoretical - they'd need 50+ personal to be override qualified
      // But testing the calculation logic
      const totalPoolCents = 100000;
      const eliteMembers = [
        {
          memberId: 'e1',
          memberName: 'Team Builder',
          personalCredits: 50, // Minimum to be qualified
          teamCredits: 10000,
          overrideQualified: true,
        },
      ];

      const shares = calculateLeadershipPoolShares(totalPoolCents, eliteMembers, '2026-03');

      expect(shares[0].sharePoints).toBe(10050);
      expect(shares[0].payoutCents).toBe(100000);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle realistic bonus pool scenario', () => {
      // 10 members earned rank bonuses in March 2026
      // Total bonus pool: $3,500
      const totalPoolCents = 350000;
      const qualifiedMembers = Array.from({ length: 10 }, (_, i) => ({
        memberId: `march-${i}`,
        memberName: `March Promotee ${i}`,
      }));

      const shares = calculateBonusPoolShares(totalPoolCents, qualifiedMembers, '2026-03');

      expect(shares).toHaveLength(10);
      expect(shares[0].shareAmountCents).toBe(35000); // $350 each
    });

    it('should handle realistic leadership pool scenario', () => {
      // 5 Elite members, varying production levels
      // Total leadership pool: $1,500
      const totalPoolCents = 150000;
      const eliteMembers = [
        {
          memberId: 'elite-1',
          memberName: 'Top Producer',
          personalCredits: 5000,
          teamCredits: 20000,
          overrideQualified: true,
        }, // 25,000 points
        {
          memberId: 'elite-2',
          memberName: 'Strong Producer',
          personalCredits: 3000,
          teamCredits: 12000,
          overrideQualified: true,
        }, // 15,000 points
        {
          memberId: 'elite-3',
          memberName: 'Mid Producer',
          personalCredits: 2000,
          teamCredits: 8000,
          overrideQualified: true,
        }, // 10,000 points
        {
          memberId: 'elite-4',
          memberName: 'Growing Producer',
          personalCredits: 1000,
          teamCredits: 4000,
          overrideQualified: true,
        }, // 5,000 points
        {
          memberId: 'elite-5',
          memberName: 'New Elite',
          personalCredits: 500,
          teamCredits: 2500,
          overrideQualified: true,
        }, // 3,000 points
      ];
      // Total: 58,000 points

      const shares = calculateLeadershipPoolShares(totalPoolCents, eliteMembers, '2026-03');

      expect(shares).toHaveLength(5);

      // Top Producer: 25,000/58,000 = 43.1%
      expect(shares[0].sharePercentage).toBeCloseTo(43.1, 1);
      expect(shares[0].payoutCents).toBeCloseTo(64655, -2); // ~$646.55

      // New Elite: 3,000/58,000 = 5.17%
      expect(shares[4].sharePercentage).toBeCloseTo(5.17, 1);
      expect(shares[4].payoutCents).toBeCloseTo(7758, -2); // ~$77.58
    });
  });
});
