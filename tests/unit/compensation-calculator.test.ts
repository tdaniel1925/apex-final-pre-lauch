/**
 * Tests for override-calculator.ts
 * Validates the compensation system uses correct tables and relationships
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateOverridesForSale, CompensationMember, Sale } from '@/lib/compensation/override-calculator';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table) => {
      if (table === 'distributors') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: mockDistributorData,
                error: null,
              })),
            })),
          })),
        };
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: null,
            })),
          })),
        })),
      };
    }),
  })),
}));

let mockDistributorData: any;

describe('Compensation Calculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Interface and Type Definitions', () => {
    it('should have CompensationMember interface with distributor fields', () => {
      const member: CompensationMember = {
        distributor_id: 'dist-123',
        sponsor_id: 'sponsor-456',
        matrix_parent_id: 'matrix-789',
        matrix_depth: 2,
        member_id: 'mem-123',
        full_name: 'Test User',
        email: 'test@example.com',
        tech_rank: 'silver',
        personal_credits_monthly: 100,
        override_qualified: true,
      };

      expect(member.distributor_id).toBe('dist-123');
      expect(member.sponsor_id).toBe('sponsor-456');
      expect(member.matrix_parent_id).toBe('matrix-789');
      expect(member.personal_credits_monthly).toBe(100);
    });
  });

  describe('Enrollment Override (L1)', () => {
    it('should query distributors table for sponsor', async () => {
      const sale: Sale = {
        sale_id: 'sale-1',
        seller_member_id: 'mem-seller',
        product_name: 'Product A',
        price_paid: 100,
        bv: 40,
      };

      const seller: CompensationMember = {
        distributor_id: 'dist-seller',
        sponsor_id: 'dist-sponsor',
        matrix_parent_id: null,
        matrix_depth: 1,
        member_id: 'mem-seller',
        full_name: 'Seller Name',
        email: 'seller@example.com',
        tech_rank: 'bronze',
        personal_credits_monthly: 60,
        override_qualified: true,
      };

      mockDistributorData = {
        id: 'dist-sponsor',
        member: {
          member_id: 'mem-sponsor',
          full_name: 'Sponsor Name',
          tech_rank: 'silver',
          personal_credits_monthly: 100,
          override_qualified: true,
        },
      };

      const result = await calculateOverridesForSale(sale, seller);

      // Should have calculated enrollment override
      expect(result.payments.length).toBeGreaterThan(0);

      // L1 enrollment override should be 30% of override pool (40 BV * 40% = 16, 16 * 30% = 4.8)
      const enrollmentOverride = result.payments.find(p => p.override_type === 'L1_enroller');
      expect(enrollmentOverride).toBeDefined();
      expect(enrollmentOverride?.override_amount).toBe(4.80);
    });

    it('should use sponsor_id from CompensationMember', async () => {
      const sale: Sale = {
        sale_id: 'sale-2',
        seller_member_id: 'mem-seller',
        product_name: 'Product B',
        price_paid: 100,
        bv: 40,
      };

      const seller: CompensationMember = {
        distributor_id: 'dist-seller',
        sponsor_id: null, // No sponsor
        matrix_parent_id: 'dist-matrix',
        matrix_depth: 2,
        member_id: 'mem-seller',
        full_name: 'Seller Name',
        email: 'seller@example.com',
        tech_rank: 'bronze',
        personal_credits_monthly: 60,
        override_qualified: true,
      };

      const result = await calculateOverridesForSale(sale, seller);

      // Should NOT have enrollment override if no sponsor
      const enrollmentOverride = result.payments.find(p => p.override_type === 'L1_enroller');
      expect(enrollmentOverride).toBeUndefined();
    });
  });

  describe('Matrix Override (L2-L5)', () => {
    it('should query distributors table for matrix_parent_id', async () => {
      const sale: Sale = {
        sale_id: 'sale-3',
        seller_member_id: 'mem-seller',
        product_name: 'Product C',
        price_paid: 100,
        bv: 40,
      };

      const seller: CompensationMember = {
        distributor_id: 'dist-seller',
        sponsor_id: null,
        matrix_parent_id: 'dist-matrix-parent',
        matrix_depth: 2,
        member_id: 'mem-seller',
        full_name: 'Seller Name',
        email: 'seller@example.com',
        tech_rank: 'bronze',
        personal_credits_monthly: 60,
        override_qualified: true,
      };

      mockDistributorData = {
        id: 'dist-matrix-parent',
        matrix_parent_id: null,
        member: {
          member_id: 'mem-matrix-parent',
          full_name: 'Matrix Parent',
          tech_rank: 'silver',
          personal_credits_monthly: 100,
          override_qualified: true,
        },
      };

      const result = await calculateOverridesForSale(sale, seller);

      // Should calculate matrix override (not enrollment)
      expect(result.payments.length).toBeGreaterThan(0);
    });
  });

  describe('No Double-Dipping', () => {
    it('should not pay same person twice if they are both sponsor and matrix parent', async () => {
      const sale: Sale = {
        sale_id: 'sale-4',
        seller_member_id: 'mem-seller',
        product_name: 'Product D',
        price_paid: 100,
        bv: 40,
      };

      const seller: CompensationMember = {
        distributor_id: 'dist-seller',
        sponsor_id: 'dist-upline',
        matrix_parent_id: 'dist-upline', // Same person!
        matrix_depth: 2,
        member_id: 'mem-seller',
        full_name: 'Seller Name',
        email: 'seller@example.com',
        tech_rank: 'bronze',
        personal_credits_monthly: 60,
        override_qualified: true,
      };

      mockDistributorData = {
        id: 'dist-upline',
        matrix_parent_id: null,
        member: {
          member_id: 'mem-upline',
          full_name: 'Upline Name',
          tech_rank: 'silver',
          personal_credits_monthly: 100,
          override_qualified: true,
        },
      };

      const result = await calculateOverridesForSale(sale, seller);

      // Should only be paid once (as sponsor/enroller)
      const paymentsToSamePerson = result.payments.filter(
        p => p.upline_member_id === 'mem-upline'
      );
      expect(paymentsToSamePerson.length).toBe(1);
      expect(paymentsToSamePerson[0].override_type).toBe('L1_enroller');
    });
  });
});
