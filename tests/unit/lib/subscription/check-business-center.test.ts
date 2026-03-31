/**
 * Tests for Business Center Subscription Checking
 *
 * @module tests/unit/lib/subscription/check-business-center
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkBusinessCenterSubscription, shouldShowBusinessCenterNag, hasFeatureAccess } from '@/lib/subscription/check-business-center';

// Mock Supabase
vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn((table: string) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  })),
}));

describe('Business Center Subscription Checking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkBusinessCenterSubscription', () => {
    it('should return no nag for days 0-7 (grace period)', async () => {
      // Mock: Distributor created 5 days ago, no subscription
      const mockDistributor = {
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const mockProduct = { id: 'product-123' };

      // Mock implementation
      const { createServiceClient } = await import('@/lib/supabase/service');
      const supabase = createServiceClient();

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'distributors') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({ data: mockDistributor, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'products') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({ data: mockProduct, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'service_access') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn(async () => ({ data: null, error: null })),
                  })),
                })),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await checkBusinessCenterSubscription('distributor-123');

      expect(result.hasSubscription).toBe(false);
      expect(result.daysWithout).toBe(5);
      expect(result.nagLevel).toBe('none');
    });

    it('should return soft nag for days 8-21', async () => {
      // Mock: Distributor created 10 days ago, no subscription
      const mockDistributor = {
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const mockProduct = { id: 'product-123' };

      const { createServiceClient } = await import('@/lib/supabase/service');
      const supabase = createServiceClient();

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'distributors') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({ data: mockDistributor, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'products') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({ data: mockProduct, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'service_access') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn(async () => ({ data: null, error: null })),
                  })),
                })),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await checkBusinessCenterSubscription('distributor-123');

      expect(result.hasSubscription).toBe(false);
      expect(result.daysWithout).toBe(10);
      expect(result.nagLevel).toBe('soft');
    });

    it('should return hard nag for day 22+', async () => {
      // Mock: Distributor created 25 days ago, no subscription
      const mockDistributor = {
        created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const mockProduct = { id: 'product-123' };

      const { createServiceClient } = await import('@/lib/supabase/service');
      const supabase = createServiceClient();

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'distributors') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({ data: mockDistributor, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'products') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({ data: mockProduct, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'service_access') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn(async () => ({ data: null, error: null })),
                  })),
                })),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await checkBusinessCenterSubscription('distributor-123');

      expect(result.hasSubscription).toBe(false);
      expect(result.daysWithout).toBe(25);
      expect(result.nagLevel).toBe('hard');
    });

    it('should return no nag with active subscription', async () => {
      // Mock: Distributor created 30 days ago, HAS subscription
      const mockDistributor = {
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const mockProduct = { id: 'product-123' };

      const mockServiceAccess = {
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_trial: false,
        trial_ends_at: null,
      };

      const { createServiceClient } = await import('@/lib/supabase/service');
      const supabase = createServiceClient();

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'distributors') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({ data: mockDistributor, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'products') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({ data: mockProduct, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'service_access') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn(async () => ({ data: mockServiceAccess, error: null })),
                  })),
                })),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await checkBusinessCenterSubscription('distributor-123');

      expect(result.hasSubscription).toBe(true);
      expect(result.daysWithout).toBe(0);
      expect(result.nagLevel).toBe('none');
      expect(result.subscriptionStatus).toBe('active');
    });
  });

  describe('shouldShowBusinessCenterNag', () => {
    it('should return false during grace period', async () => {
      // Test with 5 days old distributor (grace period)
      const mockDistributor = {
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const mockProduct = { id: 'product-123' };

      const { createServiceClient } = await import('@/lib/supabase/service');
      const supabase = createServiceClient();

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'distributors') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({ data: mockDistributor, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'products') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({ data: mockProduct, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'service_access') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn(async () => ({ data: null, error: null })),
                  })),
                })),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await shouldShowBusinessCenterNag('distributor-123');
      expect(result).toBe(false);
    });

    it('should return true after grace period', async () => {
      // Test with 10 days old distributor (soft nag)
      const mockDistributor = {
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const mockProduct = { id: 'product-123' };

      const { createServiceClient } = await import('@/lib/supabase/service');
      const supabase = createServiceClient();

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'distributors') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({ data: mockDistributor, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'products') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({ data: mockProduct, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'service_access') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn(async () => ({ data: null, error: null })),
                  })),
                })),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const result = await shouldShowBusinessCenterNag('distributor-123');
      expect(result).toBe(true);
    });
  });

  describe('hasFeatureAccess', () => {
    it('should allow access to gated features during grace period', async () => {
      // Test with 5 days old distributor (grace period)
      const mockDistributor = {
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const mockProduct = { id: 'product-123' };

      const { createServiceClient } = await import('@/lib/supabase/service');
      const supabase = createServiceClient();

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'distributors') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({ data: mockDistributor, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'products') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({ data: mockProduct, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'service_access') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn(async () => ({ data: null, error: null })),
                  })),
                })),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const hasAccess = await hasFeatureAccess('distributor-123', '/dashboard/ai-assistant');
      expect(hasAccess).toBe(true);
    });

    it('should block access to gated features after day 22', async () => {
      // Test with 25 days old distributor (hard nag)
      const mockDistributor = {
        created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const mockProduct = { id: 'product-123' };

      const { createServiceClient } = await import('@/lib/supabase/service');
      const supabase = createServiceClient();

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'distributors') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({ data: mockDistributor, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'products') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({ data: mockProduct, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'service_access') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn(async () => ({ data: null, error: null })),
                  })),
                })),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const hasAccess = await hasFeatureAccess('distributor-123', '/dashboard/ai-assistant');
      expect(hasAccess).toBe(false);
    });

    it('should always allow access to free features', async () => {
      // Test with 25 days old distributor (hard nag)
      const mockDistributor = {
        created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const mockProduct = { id: 'product-123' };

      const { createServiceClient } = await import('@/lib/supabase/service');
      const supabase = createServiceClient();

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'distributors') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({ data: mockDistributor, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'products') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({ data: mockProduct, error: null })),
              })),
            })),
          } as any;
        }
        if (table === 'service_access') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn(async () => ({ data: null, error: null })),
                  })),
                })),
              })),
            })),
          } as any;
        }
        return {} as any;
      });

      const hasAccess = await hasFeatureAccess('distributor-123', '/dashboard/profile');
      expect(hasAccess).toBe(true);
    });
  });
});
