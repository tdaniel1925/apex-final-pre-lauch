// =============================================
// ADMIN AUDIT LOGGER
// =============================================
// Security Fix #6: Track all admin actions
// Usage: await logAdminAction({ ... })
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import { NextRequest } from 'next/server';

/**
 * Standard admin action types
 */
export type AdminAction =
  // Distributor management
  | 'CREATE_DISTRIBUTOR'
  | 'UPDATE_DISTRIBUTOR'
  | 'DELETE_DISTRIBUTOR'
  | 'CHANGE_EMAIL'
  | 'CHANGE_SPONSOR'
  | 'CHANGE_MATRIX_POSITION'
  // Insurance licensing
  | 'APPROVE_LICENSE'
  | 'REVOKE_LICENSE'
  | 'REASSIGN_AGENT'
  // Compensation
  | 'RUN_COMPENSATION'
  | 'UPDATE_COMPENSATION_CONFIG'
  | 'OVERRIDE_COMMISSION'
  | 'ADJUST_PAYOUT'
  // Sensitive data access
  | 'VIEW_SSN'
  | 'UPDATE_SSN'
  | 'VIEW_BANK_INFO'
  | 'UPDATE_BANK_INFO'
  // Communication
  | 'SEND_EMAIL'
  | 'SEND_BULK_EMAIL'
  // Events
  | 'CREATE_EVENT'
  | 'UPDATE_EVENT'
  | 'DELETE_EVENT'
  // Permissions
  | 'GRANT_ADMIN'
  | 'REVOKE_ADMIN'
  | 'UPDATE_PERMISSIONS'
  // System
  | 'UPDATE_SETTINGS'
  | 'EXPORT_DATA'
  | 'BULK_IMPORT'
  | 'PURGE_DATA'
  // Downloads
  | 'CREATE_DOWNLOAD'
  | 'UPDATE_DOWNLOAD'
  | 'DELETE_DOWNLOAD'
  // Support Tickets
  | 'UPDATE_SUPPORT_TICKET'
  | 'ASSIGN_SUPPORT_TICKET'
  | 'RESOLVE_SUPPORT_TICKET';

/**
 * Audit log entry data
 */
export interface AuditLogEntry {
  // Required fields
  adminId: string;
  adminEmail: string;
  action: AdminAction;

  // Optional entity reference
  entityType?: string;
  entityId?: string;

  // Change tracking
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;

  // Request context (auto-extracted from NextRequest if provided)
  ipAddress?: string;
  userAgent?: string;
  requestPath?: string;
  requestMethod?: string;

  // Result
  status?: 'success' | 'failure' | 'partial';
  errorMessage?: string;

  // Additional metadata
  metadata?: Record<string, any>;
}

/**
 * Audit log result
 */
export interface AuditLogResult {
  success: boolean;
  logId?: string;
  error?: string;
}

/**
 * Log an admin action to the audit log
 *
 * @param entry - Audit log entry data
 * @returns Promise with log result
 *
 * @example
 * ```typescript
 * await logAdminAction({
 *   adminId: currentUser.id,
 *   adminEmail: currentUser.email,
 *   action: 'DELETE_DISTRIBUTOR',
 *   entityType: 'distributor',
 *   entityId: distributorId,
 *   oldValue: { name: 'John Doe', email: 'john@example.com' },
 *   status: 'success'
 * });
 * ```
 */
export async function logAdminAction(entry: AuditLogEntry): Promise<AuditLogResult> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('admin_audit_log')
      .insert({
        admin_id: entry.adminId,
        admin_email: entry.adminEmail,
        action: entry.action,
        entity_type: entry.entityType,
        entity_id: entry.entityId,
        old_value: entry.oldValue,
        new_value: entry.newValue,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        request_path: entry.requestPath,
        request_method: entry.requestMethod,
        status: entry.status || 'success',
        error_message: entry.errorMessage,
        metadata: entry.metadata || {},
      })
      .select('id')
      .single();

    if (error) {
      console.error('[AUDIT] Failed to log admin action:', error);
      return { success: false, error: error.message };
    }

    return { success: true, logId: data.id };
  } catch (error) {
    console.error('[AUDIT] Exception logging admin action:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extract request context from NextRequest
 *
 * @param req - Next.js request object
 * @returns Request context for audit logging
 */
export function extractRequestContext(req: NextRequest) {
  return {
    ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
    requestPath: req.nextUrl.pathname,
    requestMethod: req.method,
  };
}

/**
 * Log admin action with automatic request context extraction
 *
 * @param req - Next.js request object
 * @param entry - Audit log entry data (without request context)
 * @returns Promise with log result
 *
 * @example
 * ```typescript
 * await logAdminActionWithContext(req, {
 *   adminId: currentUser.id,
 *   adminEmail: currentUser.email,
 *   action: 'DELETE_DISTRIBUTOR',
 *   entityType: 'distributor',
 *   entityId: distributorId,
 *   oldValue: distributorData
 * });
 * ```
 */
export async function logAdminActionWithContext(
  req: NextRequest,
  entry: Omit<AuditLogEntry, 'ipAddress' | 'userAgent' | 'requestPath' | 'requestMethod'>
): Promise<AuditLogResult> {
  const context = extractRequestContext(req);

  return logAdminAction({
    ...entry,
    ...context,
  });
}

/**
 * Query audit logs
 *
 * @param filters - Query filters
 * @returns Promise with audit log entries
 *
 * @example
 * ```typescript
 * // Get all actions by an admin
 * const logs = await queryAuditLogs({ adminId: user.id });
 *
 * // Get all actions on a specific entity
 * const logs = await queryAuditLogs({ entityType: 'distributor', entityId: distId });
 *
 * // Get failed actions
 * const logs = await queryAuditLogs({ status: 'failure' });
 * ```
 */
export async function queryAuditLogs(filters: {
  adminId?: string;
  action?: AdminAction;
  entityType?: string;
  entityId?: string;
  status?: 'success' | 'failure' | 'partial';
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
}) {
  try {
    const supabase = createServiceClient();

    let query = supabase
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.adminId) {
      query = query.eq('admin_id', filters.adminId);
    }

    if (filters.action) {
      query = query.eq('action', filters.action);
    }

    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }

    if (filters.entityId) {
      query = query.eq('entity_id', filters.entityId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.fromDate) {
      query = query.gte('created_at', filters.fromDate.toISOString());
    }

    if (filters.toDate) {
      query = query.lte('created_at', filters.toDate.toISOString());
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[AUDIT] Failed to query audit logs:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[AUDIT] Exception querying audit logs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
    };
  }
}

/**
 * Get audit log statistics
 *
 * @param adminId - Optional admin ID to filter by
 * @returns Promise with statistics
 */
export async function getAuditLogStats(adminId?: string) {
  try {
    const supabase = createServiceClient();

    let query = supabase.from('admin_audit_log').select('action, status', { count: 'exact' });

    if (adminId) {
      query = query.eq('admin_id', adminId);
    }

    const { count, error } = await query;

    if (error) {
      console.error('[AUDIT] Failed to get audit log stats:', error);
      return { success: false, error: error.message, totalActions: 0 };
    }

    return { success: true, totalActions: count || 0 };
  } catch (error) {
    console.error('[AUDIT] Exception getting audit log stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      totalActions: 0,
    };
  }
}
