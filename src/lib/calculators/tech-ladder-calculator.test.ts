import { describe, it, expect } from 'vitest';
import {
  calculateTechLadder,
  calculateQualifiedRank,
  formatCurrency,
  formatPercentage,
  type TechCalculatorInput,
} from './tech-ladder-calculator';

describe('Tech Ladder Calculator', () => {
  describe('calculateQualifiedRank', () => {
    it('should qualify for Starter with no QV', () => {
      const input: TechCalculatorInput = {
        personalQV: 0,
        teamQV: 0,
        personalEnrollees: 0,
      };

      const rank = calculateQualifiedRank(input);
      expect(rank).toBe('starter');
    });

    it('should qualify for Bronze with 150 personal QV and 300 team QV', () => {
      const input: TechCalculatorInput = {
        personalQV: 150,
        teamQV: 300,
        personalEnrollees: 0,
      };

      const rank = calculateQualifiedRank(input);
      expect(rank).toBe('bronze');
    });

    it('should qualify for Silver with 500 personal QV and 1500 team QV', () => {
      const input: TechCalculatorInput = {
        personalQV: 500,
        teamQV: 1500,
        personalEnrollees: 0,
      };

      const rank = calculateQualifiedRank(input);
      expect(rank).toBe('silver');
    });

    it('should qualify for Gold with downline requirements', () => {
      const input: TechCalculatorInput = {
        personalQV: 1200,
        teamQV: 5000,
        personalEnrollees: 1, // Need 1 Bronze sponsored
      };

      const rank = calculateQualifiedRank(input);
      expect(rank).toBe('gold');
    });

    it('should NOT qualify for Gold without downline requirements', () => {
      const input: TechCalculatorInput = {
        personalQV: 1200,
        teamQV: 5000,
        personalEnrollees: 0, // Missing downline requirement
      };

      const rank = calculateQualifiedRank(input);
      expect(rank).toBe('silver'); // Falls back to Silver
    });

    it('should qualify for Diamond Ambassador with top-tier metrics', () => {
      const input: TechCalculatorInput = {
        personalQV: 5000,
        teamQV: 50000,
        personalEnrollees: 3, // Meets "3 Golds" requirement
      };

      const rank = calculateQualifiedRank(input);
      expect(rank).toBe('diamond_ambassador');
    });
  });

  describe('calculateTechLadder', () => {
    it('should return complete output for Bronze rank', () => {
      const input: TechCalculatorInput = {
        personalQV: 200,
        teamQV: 500,
        personalEnrollees: 0,
      };

      const output = calculateTechLadder(input);

      expect(output.currentRankQualification.rank).toBe('bronze');
      expect(output.currentRankQualification.qualified).toBe(true);
      expect(output.overrideDepth).toBe(2); // Bronze has L1-L2
      expect(output.rankBonus).toBe(250); // $250 bonus for Bronze
      expect(output.monthlyIncomeProjection.personalCommission).toBeGreaterThan(0);
    });

    it('should calculate monthly income projection correctly', () => {
      const input: TechCalculatorInput = {
        personalQV: 500,
        teamQV: 2000,
        personalEnrollees: 2,
      };

      const output = calculateTechLadder(input);

      // Should have personal commission
      expect(output.monthlyIncomeProjection.personalCommission).toBeGreaterThan(0);

      // Should have override income (team QV > personal QV)
      expect(output.monthlyIncomeProjection.overrideIncome).toBeGreaterThan(0);

      // Should have bonus pool share (personalQV >= 50)
      expect(output.monthlyIncomeProjection.bonusPoolShare).toBeGreaterThan(0);

      // Total should equal sum of parts
      const { personalCommission, overrideIncome, bonusPoolShare, leadershipPoolShare } =
        output.monthlyIncomeProjection;
      const expectedTotal =
        personalCommission + overrideIncome + bonusPoolShare + leadershipPoolShare;
      expect(output.monthlyIncomeProjection.totalMonthly).toBeCloseTo(expectedTotal, 2);
    });

    it('should show next rank requirements for Silver to Gold', () => {
      const input: TechCalculatorInput = {
        personalQV: 500,
        teamQV: 1500,
        personalEnrollees: 0,
      };

      const output = calculateTechLadder(input);

      expect(output.currentRankQualification.rank).toBe('silver');
      expect(output.nextRankRequirements).toBeDefined();
      expect(output.nextRankRequirements?.nextRank).toBe('gold');
      expect(output.nextRankRequirements?.missingPersonalQV).toBe(700); // Need 1200 total
      expect(output.nextRankRequirements?.missingTeamQV).toBe(3500); // Need 5000 total
      expect(output.nextRankRequirements?.missingDownline).toContain('bronze');
    });

    it('should return null next rank requirements for Diamond Ambassador', () => {
      const input: TechCalculatorInput = {
        personalQV: 5000,
        teamQV: 50000,
        personalEnrollees: 3,
      };

      const output = calculateTechLadder(input);

      expect(output.currentRankQualification.rank).toBe('diamond_ambassador');
      expect(output.nextRankRequirements).toBeNull();
    });

    it('should include leadership pool share for Diamond Ambassador', () => {
      const input: TechCalculatorInput = {
        personalQV: 5000,
        teamQV: 50000,
        personalEnrollees: 3,
      };

      const output = calculateTechLadder(input);

      expect(output.currentRankQualification.rank).toBe('diamond_ambassador');
      expect(output.monthlyIncomeProjection.leadershipPoolShare).toBeGreaterThan(0);
    });

    it('should calculate all rank qualifications', () => {
      const input: TechCalculatorInput = {
        personalQV: 1200,
        teamQV: 5000,
        personalEnrollees: 1,
      };

      const output = calculateTechLadder(input);

      expect(output.allRankQualifications).toHaveLength(7); // 7 tech ranks

      // Should show progress for each rank
      output.allRankQualifications.forEach((rq) => {
        expect(rq.progress).toBeGreaterThanOrEqual(0);
        expect(rq.progress).toBeLessThanOrEqual(100);
      });
    });

    it('should handle edge case: exactly at requirement threshold', () => {
      const input: TechCalculatorInput = {
        personalQV: 150, // Exact Bronze requirement
        teamQV: 300, // Exact Bronze requirement
        personalEnrollees: 0,
      };

      const output = calculateTechLadder(input);

      expect(output.currentRankQualification.rank).toBe('bronze');
      expect(output.currentRankQualification.qualified).toBe(true);
    });

    it('should handle edge case: 1 QV below requirement', () => {
      const input: TechCalculatorInput = {
        personalQV: 149, // 1 below Bronze requirement
        teamQV: 300,
        personalEnrollees: 0,
      };

      const output = calculateTechLadder(input);

      expect(output.currentRankQualification.rank).toBe('starter');
      expect(output.currentRankQualification.qualified).toBe(true);
    });
  });

  describe('formatCurrency', () => {
    it('should format whole dollar amounts', () => {
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(50000)).toBe('$50,000');
    });

    it('should round cents to nearest dollar', () => {
      expect(formatCurrency(1234.56)).toBe('$1,235');
      expect(formatCurrency(1234.49)).toBe('$1,234');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-100)).toBe('-$100');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages with rounding', () => {
      expect(formatPercentage(75.5)).toBe('76%');
      expect(formatPercentage(75.4)).toBe('75%');
    });

    it('should handle 0% and 100%', () => {
      expect(formatPercentage(0)).toBe('0%');
      expect(formatPercentage(100)).toBe('100%');
    });

    it('should round decimals', () => {
      expect(formatPercentage(33.333)).toBe('33%');
      expect(formatPercentage(66.666)).toBe('67%');
    });
  });

  describe('Override Qualification (50 QV minimum)', () => {
    it('should not earn overrides or bonus pool below 50 QV', () => {
      const input: TechCalculatorInput = {
        personalQV: 49, // Below minimum
        teamQV: 500,
        personalEnrollees: 1,
      };

      const output = calculateTechLadder(input);

      // Personal commission should still be paid
      expect(output.monthlyIncomeProjection.personalCommission).toBeGreaterThan(0);

      // No overrides or bonus pool
      expect(output.monthlyIncomeProjection.overrideIncome).toBe(0);
      expect(output.monthlyIncomeProjection.bonusPoolShare).toBe(0);
    });

    it('should earn overrides and bonus pool at 50 QV', () => {
      const input: TechCalculatorInput = {
        personalQV: 50, // Exactly at minimum
        teamQV: 500,
        personalEnrollees: 1,
      };

      const output = calculateTechLadder(input);

      // Should have personal commission
      expect(output.monthlyIncomeProjection.personalCommission).toBeGreaterThan(0);

      // Should have overrides and bonus pool
      expect(output.monthlyIncomeProjection.overrideIncome).toBeGreaterThan(0);
      expect(output.monthlyIncomeProjection.bonusPoolShare).toBeGreaterThan(0);
    });
  });
});
