// =============================================
// RBAC TESTS
// =============================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkPermission, hasRole, getAdminRoles, getAdminPriority } from '@/lib/admin/rbac';

// Mock Supabase client
vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(() => ({
    rpc: vi.fn((funcName, params) => {
      if (funcName === 'admin_has_permission') {
        // Mock: super_admin has all permissions
        return Promise.resolve({ data: true, error: null });
      }
      if (funcName === 'admin_highest_priority') {
        return Promise.resolve({ data: 100, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    }),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [
            {
              role: {
                id: 'role-1',
                name: 'super_admin',
                display_name: 'Super Admin',
                description: 'Full access',
                priority: 100,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            },
          ],
          error: null,
        })),
      })),
    })),
  })),
}));

describe('RBAC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkPermission', () => {
    it('should return true for valid permission', async () => {
      const result = await checkPermission('admin-123', 'delete_distributors');
      expect(result).toBe(true);
    });

    it('should handle permission check errors gracefully', async () => {
      const result = await checkPermission('invalid-id', 'delete_distributors');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('hasRole', () => {
    it('should check if admin has specific role', async () => {
      const result = await hasRole('admin-123', 'super_admin');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getAdminRoles', () => {
    it('should return array of roles', async () => {
      const roles = await getAdminRoles('admin-123');
      expect(Array.isArray(roles)).toBe(true);
    });
  });

  describe('getAdminPriority', () => {
    it('should return priority number', async () => {
      const priority = await getAdminPriority('admin-123');
      expect(typeof priority).toBe('number');
      expect(priority).toBeGreaterThanOrEqual(0);
    });
  });
});
