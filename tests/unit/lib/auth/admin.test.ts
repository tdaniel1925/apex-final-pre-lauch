import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hasAdminRole } from '@/lib/auth/admin';
import type { AdminDistributor } from '@/lib/auth/admin';

describe('Admin Authentication', () => {
  describe('hasAdminRole', () => {
    it('should return true for master user regardless of role', () => {
      const distributor: AdminDistributor = {
        id: '1',
        auth_user_id: '1',
        email: 'admin@test.com',
        first_name: 'Admin',
        last_name: 'User',
        is_master: true,
        admin_role: null,
      };

      expect(hasAdminRole(distributor, 'viewer')).toBe(true);
      expect(hasAdminRole(distributor, 'super_admin')).toBe(true);
    });

    it('should return true if user has required role', () => {
      const distributor: AdminDistributor = {
        id: '1',
        auth_user_id: '1',
        email: 'admin@test.com',
        first_name: 'Admin',
        last_name: 'User',
        is_master: false,
        admin_role: 'admin',
      };

      expect(hasAdminRole(distributor, 'admin')).toBe(true);
      expect(hasAdminRole(distributor, 'support')).toBe(true);
      expect(hasAdminRole(distributor, 'viewer')).toBe(true);
    });

    it('should return false if user does not have required role', () => {
      const distributor: AdminDistributor = {
        id: '1',
        auth_user_id: '1',
        email: 'support@test.com',
        first_name: 'Support',
        last_name: 'User',
        is_master: false,
        admin_role: 'support',
      };

      expect(hasAdminRole(distributor, 'admin')).toBe(false);
      expect(hasAdminRole(distributor, 'super_admin')).toBe(false);
    });

    it('should return false if user has no admin role', () => {
      const distributor: AdminDistributor = {
        id: '1',
        auth_user_id: '1',
        email: 'user@test.com',
        first_name: 'Regular',
        last_name: 'User',
        is_master: false,
        admin_role: null,
      };

      expect(hasAdminRole(distributor, 'viewer')).toBe(false);
    });
  });
});
