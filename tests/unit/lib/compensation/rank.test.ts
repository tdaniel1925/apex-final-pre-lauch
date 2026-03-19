// =============================================
// UNIT TESTS - RANK EVALUATION
// =============================================
// Phase: 5 (Testing & Validation)
// Agent: 5A
// =============================================

import { describe, it, expect } from 'vitest';
import {
  evaluateTechRank,
  calculateRankLockDate,
  shouldPayRankBonus,
  getRankBonus,
  type MemberRankData,
  type SponsoredMember,
} from '@/lib/compensation/rank';

describe('Rank Evaluation', () => {
  describe('evaluateTechRank - Promotions', () => {
    it('should promote Starter to Bronze with 150 personal and 300 group credits', () => {
      const member: MemberRankData = {
        memberId: 'test-member-1',
        personalCreditsMonthly: 150,
        groupCreditsMonthly: 300,
        currentTechRank: 'starter',
        enrollmentDate: new Date('2026-01-01'),
        techGraceMonths: 0,
        highestTechRank: 'starter',
      };

      const result = evaluateTechRank(member, []);

      expect(result.action).toBe('promote');
      expect(result.qualifiedRank).toBe('bronze');
      expect(result.currentRank).toBe('starter');
      expect(result.effectiveDate).toBeDefined();
      expect(result.effectiveDate!.getDate()).toBe(1); // First of next month
    });

    it('should promote Bronze to Silver with sufficient credits', () => {
      const member: MemberRankData = {
        memberId: 'test-member-2',
        personalCreditsMonthly: 500,
        groupCreditsMonthly: 1500, // Silver requires 1500 group credits
        currentTechRank: 'bronze',
        enrollmentDate: new Date('2025-06-01'),
        techGraceMonths: 0,
        highestTechRank: 'bronze',
      };

      const result = evaluateTechRank(member, []);

      expect(result.action).toBe('promote');
      expect(result.qualifiedRank).toBe('silver');
      expect(result.currentRank).toBe('bronze');
    });

    it('should NOT promote to Gold without downline requirements', () => {
      const member: MemberRankData = {
        memberId: 'test-member-3',
        personalCreditsMonthly: 1500,
        groupCreditsMonthly: 5000,
        currentTechRank: 'silver',
        enrollmentDate: new Date('2025-01-01'),
        techGraceMonths: 0,
        highestTechRank: 'silver',
      };

      // No sponsored members provided
      const result = evaluateTechRank(member, []);

      // Should only qualify for Silver (credits met but no downline)
      expect(result.qualifiedRank).toBe('silver');
      expect(result.action).toBe('maintain');
    });

    it('should promote to Gold with 2 Bronze downline members', () => {
      const member: MemberRankData = {
        memberId: 'test-member-4',
        personalCreditsMonthly: 1500,
        groupCreditsMonthly: 5000,
        currentTechRank: 'silver',
        enrollmentDate: new Date('2025-01-01'),
        techGraceMonths: 0,
        highestTechRank: 'silver',
      };

      const sponsoredMembers: SponsoredMember[] = [
        { memberId: 'downline-1', techRank: 'bronze', personallySponsored: true },
        { memberId: 'downline-2', techRank: 'silver', personallySponsored: true },
      ];

      const result = evaluateTechRank(member, sponsoredMembers);

      expect(result.action).toBe('promote');
      expect(result.qualifiedRank).toBe('gold');
    });
  });

  describe('evaluateTechRank - Demotions', () => {
    it('should apply grace period before demotion (month 1)', () => {
      const member: MemberRankData = {
        memberId: 'test-member-5',
        personalCreditsMonthly: 100, // Below Bronze requirement (150)
        groupCreditsMonthly: 200, // Below Bronze requirement (300)
        currentTechRank: 'bronze',
        enrollmentDate: new Date('2025-06-01'),
        techGraceMonths: 0, // First month below requirements
        highestTechRank: 'bronze',
      };

      const result = evaluateTechRank(member, []);

      expect(result.action).toBe('grace_period');
      expect(result.currentRank).toBe('bronze');
      expect(result.qualifiedRank).toBe('starter'); // Would demote to starter
      expect(result.graceMonthsUsed).toBe(1);
      expect(result.graceMonthsRemaining).toBe(1); // 2 month grace period
    });

    it('should demote after 2 months grace period expires', () => {
      const member: MemberRankData = {
        memberId: 'test-member-6',
        personalCreditsMonthly: 100,
        groupCreditsMonthly: 200,
        currentTechRank: 'bronze',
        enrollmentDate: new Date('2025-06-01'),
        techGraceMonths: 1, // Second month - grace expires after this
        highestTechRank: 'bronze',
      };

      const result = evaluateTechRank(member, []);

      // After 2 months (0 → 1 → 2), grace expires and demotion occurs
      expect(result.action).toBe('demote');
      expect(result.graceMonthsUsed).toBe(2);
      expect(result.graceMonthsRemaining).toBe(0);
    });

    it('should demote after grace period expires (month 3)', () => {
      const member: MemberRankData = {
        memberId: 'test-member-7',
        personalCreditsMonthly: 100,
        groupCreditsMonthly: 200,
        currentTechRank: 'bronze',
        enrollmentDate: new Date('2025-06-01'),
        techGraceMonths: 2, // Third month - grace expired
        highestTechRank: 'bronze',
      };

      const result = evaluateTechRank(member, []);

      expect(result.action).toBe('demote');
      expect(result.currentRank).toBe('bronze');
      expect(result.qualifiedRank).toBe('starter');
      expect(result.effectiveDate).toBeDefined();
      expect(result.graceMonthsUsed).toBe(3);
      expect(result.graceMonthsRemaining).toBe(0);
    });

    it('should NOT demote if rank is locked (new rep protection)', () => {
      const lockDate = new Date();
      lockDate.setMonth(lockDate.getMonth() + 3); // Lock expires in 3 months

      const member: MemberRankData = {
        memberId: 'test-member-8',
        personalCreditsMonthly: 100, // Below Bronze requirement
        groupCreditsMonthly: 200,
        currentTechRank: 'bronze',
        enrollmentDate: new Date('2026-01-01'),
        techGraceMonths: 0,
        techRankLockUntil: lockDate, // Rank locked
        highestTechRank: 'bronze',
      };

      const result = evaluateTechRank(member, []);

      expect(result.action).toBe('rank_locked');
      expect(result.currentRank).toBe('bronze');
      expect(result.isRankLocked).toBe(true);
      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.reasons.some((r: string) => r.includes('locked'))).toBe(true);
    });
  });

  describe('evaluateTechRank - Maintain', () => {
    it('should maintain rank when requirements are met', () => {
      const member: MemberRankData = {
        memberId: 'test-member-9',
        personalCreditsMonthly: 200,
        groupCreditsMonthly: 400,
        currentTechRank: 'bronze',
        enrollmentDate: new Date('2025-01-01'),
        techGraceMonths: 0,
        highestTechRank: 'gold',
      };

      const result = evaluateTechRank(member, []);

      expect(result.action).toBe('maintain');
      expect(result.currentRank).toBe('bronze');
      expect(result.qualifiedRank).toBe('bronze');
    });
  });

  describe('calculateRankLockDate', () => {
    it('should return lock date if rank achieved within first 6 months', () => {
      const enrollmentDate = new Date('2026-01-01');
      const firstRankDate = new Date('2026-03-15'); // 2.5 months after enrollment

      const lockDate = calculateRankLockDate(enrollmentDate, firstRankDate);

      expect(lockDate).not.toBeNull();
      expect(lockDate!.getFullYear()).toBe(2026);
      expect(lockDate!.getMonth()).toBe(8); // September (6 months after March)
    });

    it('should return null if rank achieved after 6 months', () => {
      const enrollmentDate = new Date('2026-01-01');
      const firstRankDate = new Date('2026-08-01'); // 7 months after enrollment

      const lockDate = calculateRankLockDate(enrollmentDate, firstRankDate);

      expect(lockDate).toBeNull();
    });

    it('should lock for exactly 6 months from rank achievement', () => {
      const enrollmentDate = new Date('2026-01-01');
      const firstRankDate = new Date('2026-02-01'); // 1 month after enrollment

      const lockDate = calculateRankLockDate(enrollmentDate, firstRankDate);

      expect(lockDate).not.toBeNull();
      const monthsDiff =
        (lockDate!.getFullYear() - firstRankDate.getFullYear()) * 12 +
        (lockDate!.getMonth() - firstRankDate.getMonth());
      expect(monthsDiff).toBe(6);
    });
  });

  describe('shouldPayRankBonus', () => {
    it('should pay bonus when promoted to new highest rank', () => {
      expect(shouldPayRankBonus('bronze', 'starter')).toBe(true);
      expect(shouldPayRankBonus('silver', 'bronze')).toBe(true);
      expect(shouldPayRankBonus('gold', 'silver')).toBe(true);
      expect(shouldPayRankBonus('elite', 'crown')).toBe(true);
    });

    it('should NOT pay bonus when re-qualifying for same rank', () => {
      expect(shouldPayRankBonus('bronze', 'bronze')).toBe(false);
      expect(shouldPayRankBonus('silver', 'silver')).toBe(false);
      expect(shouldPayRankBonus('gold', 'gold')).toBe(false);
    });

    it('should NOT pay bonus when promoted to previously achieved rank', () => {
      expect(shouldPayRankBonus('silver', 'gold')).toBe(false); // Was Gold, back to Silver
      expect(shouldPayRankBonus('bronze', 'platinum')).toBe(false); // Was Platinum, back to Bronze
      expect(shouldPayRankBonus('gold', 'elite')).toBe(false); // Was Elite, back to Gold
    });

    it('should pay bonus when skipping ranks', () => {
      expect(shouldPayRankBonus('silver', 'starter')).toBe(true); // Starter → Silver (skipped Bronze)
      expect(shouldPayRankBonus('gold', 'bronze')).toBe(true); // Bronze → Gold (skipped Silver)
    });
  });

  describe('getRankBonus', () => {
    it('should return correct bonus amounts for each rank', () => {
      expect(getRankBonus('starter')).toBe(0);
      expect(getRankBonus('bronze')).toBe(25000); // $250
      expect(getRankBonus('silver')).toBe(100000); // $1,000
      expect(getRankBonus('gold')).toBe(300000); // $3,000
      expect(getRankBonus('platinum')).toBe(750000); // $7,500
      expect(getRankBonus('ruby')).toBe(1200000); // $12,000
      expect(getRankBonus('diamond')).toBe(1800000); // $18,000
      expect(getRankBonus('crown')).toBe(2200000); // $22,000
      expect(getRankBonus('elite')).toBe(3000000); // $30,000
    });

    it('should accumulate to $93,750 total from Starter to Elite', () => {
      const total =
        getRankBonus('bronze') +
        getRankBonus('silver') +
        getRankBonus('gold') +
        getRankBonus('platinum') +
        getRankBonus('ruby') +
        getRankBonus('diamond') +
        getRankBonus('crown') +
        getRankBonus('elite');

      expect(total).toBe(9375000); // $93,750
    });
  });

  describe('Edge Cases', () => {
    it('should handle member with no credits', () => {
      const member: MemberRankData = {
        memberId: 'test-member-10',
        personalCreditsMonthly: 0,
        groupCreditsMonthly: 0,
        currentTechRank: 'starter',
        enrollmentDate: new Date('2026-01-01'),
        techGraceMonths: 0,
        highestTechRank: 'starter',
      };

      const result = evaluateTechRank(member, []);

      expect(result.action).toBe('maintain');
      expect(result.qualifiedRank).toBe('starter');
    });

    it('should handle Elite member with sufficient production', () => {
      const member: MemberRankData = {
        memberId: 'test-member-11',
        personalCreditsMonthly: 8000, // Elite requires 8000
        groupCreditsMonthly: 120000, // Elite requires 120000
        currentTechRank: 'elite',
        enrollmentDate: new Date('2024-01-01'),
        techGraceMonths: 0,
        highestTechRank: 'elite',
      };

      const sponsoredMembers: SponsoredMember[] = [
        { memberId: 'downline-1', techRank: 'platinum', personallySponsored: true },
        { memberId: 'downline-2', techRank: 'platinum', personallySponsored: true },
        { memberId: 'downline-3', techRank: 'platinum', personallySponsored: true },
      ];

      const result = evaluateTechRank(member, sponsoredMembers);

      expect(result.action).toBe('maintain');
      expect(result.qualifiedRank).toBe('elite');
    });

    it('should only count personally sponsored members for downline requirements', () => {
      const member: MemberRankData = {
        memberId: 'test-member-12',
        personalCreditsMonthly: 1500,
        groupCreditsMonthly: 5000,
        currentTechRank: 'silver',
        enrollmentDate: new Date('2025-01-01'),
        techGraceMonths: 0,
        highestTechRank: 'silver',
      };

      const sponsoredMembers: SponsoredMember[] = [
        { memberId: 'downline-1', techRank: 'bronze', personallySponsored: true },
        { memberId: 'downline-2', techRank: 'bronze', personallySponsored: false }, // Not personally sponsored
      ];

      const result = evaluateTechRank(member, sponsoredMembers);

      // Gold requires 1 Bronze - and 1 is personally sponsored, so qualifies for Gold
      expect(result.qualifiedRank).toBe('gold');
      expect(result.action).toBe('promote');
    });
  });

  describe('Downline Requirements', () => {
    it('should handle Diamond OR requirements (3 Gold OR 2 Platinum)', () => {
      const member: MemberRankData = {
        memberId: 'test-diamond',
        personalCreditsMonthly: 5000, // Diamond requires 5000
        groupCreditsMonthly: 50000, // Diamond requires 50000
        currentTechRank: 'ruby',
        enrollmentDate: new Date('2024-01-01'),
        techGraceMonths: 0,
        highestTechRank: 'ruby',
      };

      // Test with 3 Gold members
      const threeGold: SponsoredMember[] = [
        { memberId: 'd1', techRank: 'gold', personallySponsored: true },
        { memberId: 'd2', techRank: 'gold', personallySponsored: true },
        { memberId: 'd3', techRank: 'gold', personallySponsored: true },
      ];

      const result1 = evaluateTechRank(member, threeGold);
      expect(result1.qualifiedRank).toBe('diamond');

      // Test with 2 Platinum members
      const twoPlatinum: SponsoredMember[] = [
        { memberId: 'd4', techRank: 'platinum', personallySponsored: true },
        { memberId: 'd5', techRank: 'platinum', personallySponsored: true },
      ];

      const result2 = evaluateTechRank(member, twoPlatinum);
      expect(result2.qualifiedRank).toBe('diamond');
    });

    it('should handle Elite OR requirements (3 Platinum OR 2 Diamond)', () => {
      const member: MemberRankData = {
        memberId: 'test-elite',
        personalCreditsMonthly: 8000, // Elite requires 8000
        groupCreditsMonthly: 120000, // Elite requires 120000
        currentTechRank: 'crown',
        enrollmentDate: new Date('2024-01-01'),
        techGraceMonths: 0,
        highestTechRank: 'crown',
      };

      // Test with 3 Platinum members
      const threePlatinum: SponsoredMember[] = [
        { memberId: 'e1', techRank: 'platinum', personallySponsored: true },
        { memberId: 'e2', techRank: 'platinum', personallySponsored: true },
        { memberId: 'e3', techRank: 'platinum', personallySponsored: true },
      ];

      const result1 = evaluateTechRank(member, threePlatinum);
      expect(result1.qualifiedRank).toBe('elite');

      // Test with 2 Diamond members
      const twoDiamond: SponsoredMember[] = [
        { memberId: 'e4', techRank: 'diamond', personallySponsored: true },
        { memberId: 'e5', techRank: 'diamond', personallySponsored: true },
      ];

      const result2 = evaluateTechRank(member, twoDiamond);
      expect(result2.qualifiedRank).toBe('elite');
    });
  });
});
