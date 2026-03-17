// =============================================
// COMPENSATION CONFIG API TESTS
// =============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock modules before importing the route handlers
vi.mock('@/lib/auth/admin', () => ({
  getAdminUser: vi.fn(),
  hasAdminRole: vi.fn(),
}));

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(),
}));

vi.mock('@/lib/compensation/waterfall', () => ({
  calculateWaterfall: vi.fn(),
}));

vi.mock('@/lib/compensation/rank', () => ({
  evaluateTechRank: vi.fn(),
}));

vi.mock('@/lib/compensation/override-resolution', () => ({
  calculateOverride: vi.fn(),
}));

vi.mock('@/lib/compensation/bonus-programs', () => ({
  calculateRankBonus: vi.fn(),
}));

import { getAdminUser, hasAdminRole } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { calculateWaterfall } from '@/lib/compensation/waterfall';
import { evaluateTechRank } from '@/lib/compensation/rank';
import { calculateOverride } from '@/lib/compensation/override-resolution';
import { calculateRankBonus } from '@/lib/compensation/bonus-programs';

// Helper to create mock request
function createMockRequest(body?: any, searchParams?: Record<string, string>) {
  const url = new URL('http://localhost:3000/api/admin/compensation/config');
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return {
    json: async () => body || {},
    url: url.toString(),
  } as any;
}

// Helper to create mock supabase client
function createMockSupabaseClient(mockResponses: Record<string, any> = {}) {
  return {
    from: (table: string) => ({
      select: (fields: string, options?: any) => ({
        eq: (field: string, value: any) => ({
          single: async () => mockResponses[`${table}.single`] || { data: null, error: null },
          maybeSingle: async () => mockResponses[`${table}.maybeSingle`] || { data: null, error: null },
        }),
        order: (field: string, options?: any) => ({
          then: async (callback: any) => {
            const result = mockResponses[`${table}.select`] || { data: [], error: null };
            return callback(result);
          },
          range: (from: number, to: number) => mockResponses[`${table}.select`] || { data: [], error: null, count: 0 },
        }),
        range: (from: number, to: number) => mockResponses[`${table}.select`] || { data: [], error: null, count: 0 },
        in: (field: string, values: any[]) => mockResponses[`${table}.select`] || { data: [], error: null },
      }),
      insert: (data: any) => ({
        select: () => ({
          single: async () => mockResponses[`${table}.insert`] || { data, error: null },
        }),
        then: async (callback: any) => {
          const result = mockResponses[`${table}.insert`] || { data, error: null };
          return callback(result);
        },
      }),
      update: (data: any) => ({
        eq: (field: string, value: any) => ({
          select: () => ({
            single: async () => mockResponses[`${table}.update`] || { data, error: null },
          }),
        }),
      }),
      upsert: (data: any, options?: any) => ({
        select: () => ({
          single: async () => mockResponses[`${table}.upsert`] || { data, error: null },
        }),
      }),
      delete: () => ({
        eq: (field: string, value: any) => mockResponses[`${table}.delete`] || { error: null },
      }),
    }),
    auth: {
      getUser: async () => mockResponses.auth || { data: { user: null }, error: null },
    },
  } as any;
}

describe('Compensation Config API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/admin/compensation/config', () => {
    it('should return 401 if not authenticated', async () => {
      vi.mocked(getAdminUser).mockResolvedValue(null);

      const { GET } = await import('@/app/api/admin/compensation/config/route');
      const response = await GET(createMockRequest());
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Unauthorized');
    });

    it('should return active configuration for authenticated admin', async () => {
      vi.mocked(getAdminUser).mockResolvedValue({
        user: { id: 'user-123', email: 'admin@test.com' },
        admin: {
          id: 'admin-123',
          auth_user_id: 'user-123',
          email: 'admin@test.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          is_active: true,
        },
      });

      const mockSaasConfig = [
        { key: 'waterfall.botmakers_pct', value: 0.30 },
        { key: 'waterfall.apex_take_pct', value: 0.30 },
      ];

      const mockInsuranceConfig = [
        { key: 'rank.associate.required_sales', value: 10 },
      ];

      vi.mocked(createServiceClient).mockReturnValue(
        createMockSupabaseClient({
          'saas_comp_engine_config.select': { data: mockSaasConfig, error: null },
          'insurance_comp_engine_config.select': { data: mockInsuranceConfig, error: null },
        })
      );

      const { GET } = await import('@/app/api/admin/compensation/config/route');
      const response = await GET(createMockRequest());
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.saas).toBeDefined();
      expect(data.data.insurance).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(getAdminUser).mockResolvedValue({
        user: { id: 'user-123', email: 'admin@test.com' },
        admin: {
          id: 'admin-123',
          auth_user_id: 'user-123',
          email: 'admin@test.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          is_active: true,
        },
      });

      vi.mocked(createServiceClient).mockReturnValue(
        createMockSupabaseClient({
          'saas_comp_engine_config.select': { data: null, error: { message: 'Database error' } },
        })
      );

      const { GET } = await import('@/app/api/admin/compensation/config/route');
      const response = await GET(createMockRequest());
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to fetch');
    });
  });

  describe('POST /api/admin/compensation/config', () => {
    it('should return 401 if not authenticated', async () => {
      vi.mocked(getAdminUser).mockResolvedValue(null);

      const { POST } = await import('@/app/api/admin/compensation/config/route');
      const response = await POST(
        createMockRequest({
          engineType: 'saas',
          key: 'test.key',
          value: { test: 'value' },
        })
      );
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should validate required fields', async () => {
      vi.mocked(getAdminUser).mockResolvedValue({
        user: { id: 'user-123', email: 'admin@test.com' },
        admin: {
          id: 'admin-123',
          auth_user_id: 'user-123',
          email: 'admin@test.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          is_active: true,
        },
      });

      const { POST } = await import('@/app/api/admin/compensation/config/route');
      const response = await POST(createMockRequest({ engineType: 'saas' })); // Missing key and value
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should validate engineType', async () => {
      vi.mocked(getAdminUser).mockResolvedValue({
        user: { id: 'user-123', email: 'admin@test.com' },
        admin: {
          id: 'admin-123',
          auth_user_id: 'user-123',
          email: 'admin@test.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          is_active: true,
        },
      });

      const { POST } = await import('@/app/api/admin/compensation/config/route');
      const response = await POST(
        createMockRequest({
          engineType: 'invalid',
          key: 'test.key',
          value: { test: 'value' },
        })
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid engineType');
    });

    it('should create new config and log change', async () => {
      vi.mocked(getAdminUser).mockResolvedValue({
        user: { id: 'user-123', email: 'admin@test.com' },
        admin: {
          id: 'admin-123',
          auth_user_id: 'user-123',
          email: 'admin@test.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          is_active: true,
        },
      });

      const newConfig = {
        id: 'config-123',
        key: 'test.key',
        value: { test: 'value' },
        effective_date: new Date().toISOString(),
        created_by: 'user-123',
      };

      vi.mocked(createServiceClient).mockReturnValue(
        createMockSupabaseClient({
          'saas_comp_engine_config.single': { data: null, error: null }, // No existing config
          'saas_comp_engine_config.upsert': { data: newConfig, error: null },
          'comp_engine_change_log.insert': { error: null },
        })
      );

      const { POST } = await import('@/app/api/admin/compensation/config/route');
      const response = await POST(
        createMockRequest({
          engineType: 'saas',
          key: 'test.key',
          value: { test: 'value' },
        })
      );
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message).toContain('created');
    });
  });

  describe('Test Calculator API', () => {
    it('should test waterfall calculation', async () => {
      vi.mocked(getAdminUser).mockResolvedValue({
        user: { id: 'user-123', email: 'admin@test.com' },
        admin: {
          id: 'admin-123',
          auth_user_id: 'user-123',
          email: 'admin@test.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          is_active: true,
        },
      });

      const mockWaterfallResult = {
        botmakersFee: 30000,
        adjustedGross: 70000,
        apexTake: 21000,
        remainder: 49000,
        bonusPool: 1715,
        leadershipPool: 735,
        commissionPool: 46550,
        sellerCommission: 27930,
        overridePool: 18620,
      };

      vi.mocked(calculateWaterfall).mockReturnValue(mockWaterfallResult);

      const { POST } = await import('@/app/api/admin/compensation/config/test/route');
      const response = await POST(
        createMockRequest({
          scenario: 'waterfall',
          testData: {
            priceCents: 100000,
            productType: 'standard',
          },
        })
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.scenario).toBe('waterfall');
      expect(data.result).toEqual(mockWaterfallResult);
      expect(calculateWaterfall).toHaveBeenCalledWith(100000, 'standard');
    });

    it('should test rank evaluation', async () => {
      vi.mocked(getAdminUser).mockResolvedValue({
        user: { id: 'user-123', email: 'admin@test.com' },
        admin: {
          id: 'admin-123',
          auth_user_id: 'user-123',
          email: 'admin@test.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          is_active: true,
        },
      });

      const mockRankResult = {
        currentRank: 'starter' as any,
        qualifiedRank: 'silver' as any,
        action: 'promote' as any,
        reasons: [],
        nextEvalDate: new Date(),
      };

      vi.mocked(evaluateTechRank).mockReturnValue(mockRankResult);

      const { POST } = await import('@/app/api/admin/compensation/config/test/route');
      const response = await POST(
        createMockRequest({
          scenario: 'rank',
          testData: {
            personalCredits: 500,
            teamCredits: 1500,
            sponsoredMembers: [],
          },
        })
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.scenario).toBe('rank');
      expect(evaluateTechRank).toHaveBeenCalled();
    });

    it('should return 400 for invalid scenario', async () => {
      vi.mocked(getAdminUser).mockResolvedValue({
        user: { id: 'user-123', email: 'admin@test.com' },
        admin: {
          id: 'admin-123',
          auth_user_id: 'user-123',
          email: 'admin@test.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          is_active: true,
        },
      });

      const { POST } = await import('@/app/api/admin/compensation/config/test/route');
      const response = await POST(
        createMockRequest({
          scenario: 'invalid',
          testData: {},
        })
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid scenario');
    });
  });

  describe('History API', () => {
    it('should return config change history with pagination', async () => {
      vi.mocked(getAdminUser).mockResolvedValue({
        user: { id: 'user-123', email: 'admin@test.com' },
        admin: {
          id: 'admin-123',
          auth_user_id: 'user-123',
          email: 'admin@test.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          is_active: true,
        },
      });

      const mockHistory = [
        {
          id: 'log-1',
          engine_type: 'saas',
          field_key: 'waterfall.apex_take_pct',
          old_value: 0.25,
          new_value: 0.30,
          changed_by: 'user-123',
          changed_at: new Date().toISOString(),
        },
      ];

      vi.mocked(createServiceClient).mockReturnValue(
        createMockSupabaseClient({
          'comp_engine_change_log.select': { data: mockHistory, error: null, count: 1 },
          'admins.select': { data: [], error: null },
        })
      );

      const { GET } = await import('@/app/api/admin/compensation/config/history/route');
      const response = await GET(createMockRequest(undefined, { limit: '50', offset: '0' }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.pagination.total).toBe(1);
    });
  });

  describe('Export API', () => {
    it('should export all config as JSON', async () => {
      vi.mocked(getAdminUser).mockResolvedValue({
        user: { id: 'user-123', email: 'admin@test.com' },
        admin: {
          id: 'admin-123',
          auth_user_id: 'user-123',
          email: 'admin@test.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          is_active: true,
        },
      });

      const mockSaasConfig = [{ key: 'test', value: 123 }];
      const mockInsuranceConfig = [{ key: 'test2', value: 456 }];

      vi.mocked(createServiceClient).mockReturnValue(
        createMockSupabaseClient({
          'saas_comp_engine_config.select': { data: mockSaasConfig, error: null },
          'insurance_comp_engine_config.select': { data: mockInsuranceConfig, error: null },
        })
      );

      const { GET } = await import('@/app/api/admin/compensation/config/export/route');
      const response = await GET(createMockRequest(undefined, { engineType: 'all' }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.data.saas).toEqual(mockSaasConfig);
      expect(data.data.data.insurance).toEqual(mockInsuranceConfig);
    });
  });
});
