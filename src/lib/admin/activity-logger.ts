// =============================================
// Admin Activity Logger Service
// Centralized logging for all admin actions
// =============================================

import { createServiceClient } from '@/lib/supabase/service';

export interface LogAdminActivityParams {
  adminId: string;
  adminEmail: string;
  adminName: string;
  distributorId?: string;
  distributorName?: string;
  actionType: string;
  actionDescription: string;
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
    fields: string[];
  };
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an admin action to the activity log
 * This creates an immutable audit trail
 */
export async function logAdminActivity(
  params: LogAdminActivityParams
): Promise<{ success: boolean; logId?: string; error?: string }> {
  try {
    const serviceClient = createServiceClient();

    // Use the database function for consistency
    const { data, error } = await serviceClient.rpc('log_admin_activity', {
      p_admin_id: params.adminId,
      p_admin_email: params.adminEmail,
      p_admin_name: params.adminName,
      p_distributor_id: params.distributorId || null,
      p_distributor_name: params.distributorName || null,
      p_action_type: params.actionType,
      p_action_description: params.actionDescription,
      p_changes: params.changes ? JSON.stringify(params.changes) : null,
      p_ip_address: params.ipAddress || null,
      p_user_agent: params.userAgent || null,
    });

    if (error) {
      console.error('Failed to log admin activity:', error);
      return { success: false, error: error.message };
    }

    return { success: true, logId: data };
  } catch (error) {
    console.error('Activity logging error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get activity logs for a specific distributor
 */
export async function getDistributorActivity(
  distributorId: string,
  options: {
    page?: number;
    pageSize?: number;
    actionType?: string;
  } = {}
): Promise<{
  success: boolean;
  activities?: any[];
  total?: number;
  error?: string;
}> {
  try {
    const serviceClient = createServiceClient();
    const { page = 1, pageSize = 20, actionType } = options;
    const offset = (page - 1) * pageSize;

    // Build query
    let query = serviceClient
      .from('admin_activity_log')
      .select('*', { count: 'exact' })
      .eq('distributor_id', distributorId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    // Filter by action type if provided
    if (actionType) {
      query = query.eq('action_type', actionType);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Failed to get distributor activity:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      activities: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Get distributor activity error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get recent activity across all distributors
 */
export async function getRecentActivity(
  limit: number = 50
): Promise<{
  success: boolean;
  activities?: any[];
  error?: string;
}> {
  try {
    const serviceClient = createServiceClient();

    const { data, error } = await serviceClient
      .from('admin_recent_activity')
      .select('*')
      .limit(limit);

    if (error) {
      console.error('Failed to get recent activity:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      activities: data || [],
    };
  } catch (error) {
    console.error('Get recent activity error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get activity logs by admin
 */
export async function getAdminActivity(
  adminId: string,
  options: {
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{
  success: boolean;
  activities?: any[];
  total?: number;
  error?: string;
}> {
  try {
    const serviceClient = createServiceClient();
    const { page = 1, pageSize = 20 } = options;
    const offset = (page - 1) * pageSize;

    const { data, error, count } = await serviceClient
      .from('admin_activity_log')
      .select('*', { count: 'exact' })
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Failed to get admin activity:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      activities: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Get admin activity error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
