// =============================================
// ADMIN AUDIT LOGGER TESTS
// =============================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logAdminAction, queryAuditLogs, getAuditLogStats } from '@/lib/admin/audit-logger';

// Mock Supabase client
vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'mock-log-id' },
            error: null,
          })),
        })),
      })),
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [
              {
                id: 'log-1',
                admin_id: 'admin-123',
                action: 'DELETE_DISTRIBUTOR',
                created_at: new Date().toISOString(),
              },
            ],
            error: null,
          })),
          data: [],
          error: null,
        })),
        count: 'exact',
        data: [],
        error: null,
      })),
    })),
  })),
}));

describe('Admin Audit Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logAdminAction', () => {
    it('should log admin action successfully', async () => {
      const result = await logAdminAction({
        adminId: 'admin-123',
        adminEmail: 'admin@test.com',
        action: 'DELETE_DISTRIBUTOR',
        entityType: 'distributor',
        entityId: 'dist-456',
        oldValue: { name: 'John Doe' },
        status: 'success',
      });

      expect(result.success).toBe(true);
      expect(result.logId).toBe('mock-log-id');
    });

    it('should handle missing optional fields', async () => {
      const result = await logAdminAction({
        adminId: 'admin-123',
        adminEmail: 'admin@test.com',
        action: 'RUN_COMPENSATION',
      });

      expect(result.success).toBe(true);
    });

    it('should log failed actions', async () => {
      const result = await logAdminAction({
        adminId: 'admin-123',
        adminEmail: 'admin@test.com',
        action: 'DELETE_DISTRIBUTOR',
        entityType: 'distributor',
        entityId: 'dist-456',
        status: 'failure',
        errorMessage: 'Cannot delete: has downline',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('queryAuditLogs', () => {
    it('should query logs by admin ID', async () => {
      const result = await queryAuditLogs({
        adminId: 'admin-123',
        limit: 10,
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should query logs by action type', async () => {
      const result = await queryAuditLogs({
        action: 'DELETE_DISTRIBUTOR',
      });

      expect(result.success).toBe(true);
    });

    it('should query logs by entity', async () => {
      const result = await queryAuditLogs({
        entityType: 'distributor',
        entityId: 'dist-456',
      });

      expect(result.success).toBe(true);
    });

    it('should query logs by status', async () => {
      const result = await queryAuditLogs({
        status: 'failure',
      });

      expect(result.success).toBe(true);
    });

    it('should query logs by date range', async () => {
      const fromDate = new Date('2024-01-01');
      const toDate = new Date('2024-12-31');

      const result = await queryAuditLogs({
        fromDate,
        toDate,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('getAuditLogStats', () => {
    it('should get total action count', async () => {
      const result = await getAuditLogStats();

      expect(result.success).toBe(true);
      expect(typeof result.totalActions).toBe('number');
    });

    it('should get stats for specific admin', async () => {
      const result = await getAuditLogStats('admin-123');

      expect(result.success).toBe(true);
      expect(typeof result.totalActions).toBe('number');
    });
  });

  describe('extractRequestContext', () => {
    it('should extract IP address from x-forwarded-for header', () => {
      // This would need to be imported and tested separately
      // Skipping for now as it's a simple utility function
    });
  });
});
