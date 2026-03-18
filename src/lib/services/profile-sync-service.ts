/**
 * Profile Sync Service
 * Handles queuing and syncing profile changes to external platforms
 */

import { createServiceClient } from '@/lib/supabase/service';
import type { ProfileSyncQueue } from '@/lib/validation/profile-schemas';

export interface SyncResult {
  success: boolean;
  platform: string;
  error?: string;
}

/**
 * Queue a profile change for syncing to external platforms
 */
export async function queueProfileSync(
  distributorId: string,
  platform: 'jordyn' | 'agentpulse' | 'winflex',
  changeType: 'email' | 'name' | 'phone' | 'address' | 'all',
  syncData: Record<string, any>,
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();

    const { error } = await supabase
      .from('profile_change_queue')
      .insert({
        distributor_id: distributorId,
        platform,
        change_type: changeType,
        sync_data: syncData,
        priority,
        status: 'pending',
        sync_attempts: 0,
        max_retries: 5,
      });

    if (error) {
      console.error(`Failed to queue sync for ${platform}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Queue profile sync error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Queue syncs to all relevant platforms based on change type
 */
export async function queueMultiPlatformSync(
  distributorId: string,
  changeType: 'email' | 'name' | 'phone' | 'address' | 'all',
  syncData: Record<string, any>,
  isLicensedAgent: boolean = false
): Promise<SyncResult[]> {
  const results: SyncResult[] = [];

  // Jordyn and AgentPulse always sync for email/name changes
  if (['email', 'name', 'all'].includes(changeType)) {
    const jordynResult = await queueProfileSync(
      distributorId,
      'jordyn',
      changeType,
      syncData,
      changeType === 'email' ? 'high' : 'medium'
    );
    results.push({
      success: jordynResult.success,
      platform: 'jordyn',
      error: jordynResult.error,
    });

    const agentpulseResult = await queueProfileSync(
      distributorId,
      'agentpulse',
      changeType,
      syncData,
      changeType === 'email' ? 'high' : 'medium'
    );
    results.push({
      success: agentpulseResult.success,
      platform: 'agentpulse',
      error: agentpulseResult.error,
    });
  }

  // WinFlex only for licensed agents
  if (isLicensedAgent && ['email', 'phone', 'address', 'all'].includes(changeType)) {
    const winflexResult = await queueProfileSync(
      distributorId,
      'winflex',
      changeType,
      syncData,
      'medium'
    );
    results.push({
      success: winflexResult.success,
      platform: 'winflex',
      error: winflexResult.error,
    });
  }

  return results;
}

/**
 * Log profile change in audit log
 */
export async function logProfileChange(
  distributorId: string,
  changedById: string,
  changeType: 'personal_info' | 'address' | 'banking' | 'tax_info' | 'email',
  oldValues: Record<string, any>,
  newValues: Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical',
  changeReason?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();

    const { error } = await supabase
      .from('profile_change_audit_log')
      .insert({
        distributor_id: distributorId,
        changed_by_id: changedById,
        change_type: changeType,
        old_values: oldValues,
        new_values: newValues,
        severity,
        change_reason: changeReason,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    if (error) {
      console.error('Failed to log profile change:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Log profile change error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Check if distributor can make more email changes (rate limiting)
 */
export async function checkEmailChangeRateLimit(
  distributorId: string
): Promise<{ allowed: boolean; remaining: number; error?: string }> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase.rpc('check_email_change_rate_limit', {
      p_distributor_id: distributorId,
    });

    if (error) {
      console.error('Failed to check email rate limit:', error);
      return { allowed: false, remaining: 0, error: error.message };
    }

    // Get current count
    const { data: limits } = await supabase
      .from('email_change_rate_limits')
      .select('change_count')
      .eq('distributor_id', distributorId)
      .gte('window_end', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const currentCount = limits?.change_count || 0;
    const remaining = Math.max(0, 3 - currentCount);

    return { allowed: data === true, remaining };
  } catch (err: any) {
    console.error('Check email rate limit error:', err);
    return { allowed: false, remaining: 0, error: err.message };
  }
}

/**
 * Increment email change count (call after successful email change)
 */
export async function incrementEmailChangeCount(
  distributorId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();

    const { error } = await supabase.rpc('increment_email_change_count', {
      p_distributor_id: distributorId,
    });

    if (error) {
      console.error('Failed to increment email change count:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Increment email change count error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Check if distributor can make more banking changes (rate limiting)
 */
export async function checkBankingChangeRateLimit(
  distributorId: string
): Promise<{ allowed: boolean; remaining: number; error?: string }> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase.rpc('check_banking_change_rate_limit', {
      p_distributor_id: distributorId,
    });

    if (error) {
      console.error('Failed to check banking rate limit:', error);
      return { allowed: false, remaining: 0, error: error.message };
    }

    // Get current count
    const { data: limits } = await supabase
      .from('banking_change_rate_limits')
      .select('change_count')
      .eq('distributor_id', distributorId)
      .gte('window_end', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const currentCount = limits?.change_count || 0;
    const remaining = Math.max(0, 5 - currentCount);

    return { allowed: data === true, remaining };
  } catch (err: any) {
    console.error('Check banking rate limit error:', err);
    return { allowed: false, remaining: 0, error: err.message };
  }
}

/**
 * Increment banking change count (call after successful banking change)
 */
export async function incrementBankingChangeCount(
  distributorId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();

    const { error } = await supabase.rpc('increment_banking_change_count', {
      p_distributor_id: distributorId,
    });

    if (error) {
      console.error('Failed to increment banking change count:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Increment banking change count error:', err);
    return { success: false, error: err.message };
  }
}
