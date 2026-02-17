// =============================================
// Admin Activity Logger
// Logs all admin actions for audit trail
// =============================================

import { createServiceClient } from '@/lib/supabase/service';

export type ActivityTargetType = 'distributor' | 'commission' | 'system' | 'settings' | 'report';

export interface LogActivityParams {
  adminId: string;
  action: string;
  targetType?: ActivityTargetType;
  targetId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Logs an admin action to the activity log
 */
export async function logAdminActivity(params: LogActivityParams): Promise<void> {
  try {
    const serviceClient = createServiceClient();

    await serviceClient.from('admin_activity_log').insert({
      admin_id: params.adminId,
      action: params.action,
      target_type: params.targetType,
      target_id: params.targetId,
      details: params.details,
      ip_address: params.ipAddress,
      user_agent: params.userAgent,
    });
  } catch (error) {
    // Log error but don't throw - activity logging shouldn't break functionality
    console.error('Failed to log admin activity:', error);
  }
}

/**
 * Common admin actions for consistent logging
 */
export const AdminActions = {
  // Distributor actions
  DISTRIBUTOR_CREATE: 'distributor.create',
  DISTRIBUTOR_UPDATE: 'distributor.update',
  DISTRIBUTOR_DELETE: 'distributor.delete',
  DISTRIBUTOR_SUSPEND: 'distributor.suspend',
  DISTRIBUTOR_ACTIVATE: 'distributor.activate',
  DISTRIBUTOR_VIEW: 'distributor.view',

  // Commission actions
  COMMISSION_APPROVE: 'commission.approve',
  COMMISSION_REJECT: 'commission.reject',
  COMMISSION_CREATE: 'commission.create',
  COMMISSION_UPDATE: 'commission.update',
  COMMISSION_PAYOUT: 'commission.payout',

  // System actions
  SYSTEM_LOGIN: 'system.login',
  SYSTEM_LOGOUT: 'system.logout',
  SYSTEM_SETTINGS_UPDATE: 'system.settings.update',
  SYSTEM_BACKUP: 'system.backup',
  SYSTEM_RESTORE: 'system.restore',

  // Report actions
  REPORT_GENERATE: 'report.generate',
  REPORT_EXPORT: 'report.export',
  REPORT_VIEW: 'report.view',

  // Bulk actions
  BULK_IMPORT: 'bulk.import',
  BULK_EXPORT: 'bulk.export',
  BULK_UPDATE: 'bulk.update',
  BULK_EMAIL: 'bulk.email',
} as const;

/**
 * Helper to extract IP address from request headers
 */
export function getIpAddress(headers: Headers): string | undefined {
  return (
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    undefined
  );
}

/**
 * Helper to get user agent from request headers
 */
export function getUserAgent(headers: Headers): string | undefined {
  return headers.get('user-agent') || undefined;
}
