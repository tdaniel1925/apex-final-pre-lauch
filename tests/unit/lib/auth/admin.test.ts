import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hasAdminRole } from '@/lib/auth/admin';
import type { Admin } from '@/lib/auth/admin';

describe('Admin Authentication', () => {
  describe('hasAdminRole', () => {
    it('should return true for super admin', () => {
      const admin: Admin = {
        id: '1',
        auth_user_id: '1',
        email: 'admin@test.com',
        first_name: 'Admin',
        last_name: 'User',
        role: 'super_admin',
        is_active: true,
      };

      expect(hasAdminRole(admin, 'viewer')).toBe(true);
      expect(hasAdminRole(admin, 'super_admin')).toBe(true);
    });

    it('should return true if user has required role', () => {
      const admin: Admin = {
        id: '1',
        auth_user_id: '1',
        email: 'admin@test.com',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        is_active: true,
      };

      expect(hasAdminRole(admin, 'admin')).toBe(true);
      expect(hasAdminRole(admin, 'support')).toBe(true);
      expect(hasAdminRole(admin, 'viewer')).toBe(true);
    });

    it('should return false if user does not have required role', () => {
      const admin: Admin = {
        id: '1',
        auth_user_id: '1',
        email: 'support@test.com',
        first_name: 'Support',
        last_name: 'User',
        role: 'support',
        is_active: true,
      };

      expect(hasAdminRole(admin, 'admin')).toBe(false);
      expect(hasAdminRole(admin, 'super_admin')).toBe(false);
    });

    it('should return true for viewer level if user is viewer', () => {
      const admin: Admin = {
        id: '1',
        auth_user_id: '1',
        email: 'viewer@test.com',
        first_name: 'Viewer',
        last_name: 'User',
        role: 'viewer',
        is_active: true,
      };

      expect(hasAdminRole(admin, 'viewer')).toBe(true);
      expect(hasAdminRole(admin, 'admin')).toBe(false);
    });
  });
});
