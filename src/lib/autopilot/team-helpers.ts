// =============================================
// Apex Lead Autopilot - Team Communication Helpers
// Helper functions for team broadcasts and training shares
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import { hasReachedLimit } from '@/lib/stripe/autopilot-helpers';

export type BroadcastType = 'email' | 'sms' | 'in_app' | 'push';
export type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'canceled';

export interface TeamBroadcast {
  id: string;
  distributor_id: string;
  sender_name: string | null;
  broadcast_type: BroadcastType;
  subject: string | null;
  content: string;
  send_to_all_downline: boolean;
  send_to_downline_levels: number[] | null;
  send_to_specific_ranks: string[] | null;
  send_to_specific_distributors: string[] | null;
  scheduled_for: string | null;
  sent_at: string | null;
  status: BroadcastStatus;
  total_recipients: number;
  total_sent: number;
  total_delivered: number;
  total_failed: number;
  total_opened: number;
  total_clicked: number;
  created_at: string;
  updated_at: string;
}

export interface TrainingShare {
  id: string;
  shared_by_distributor_id: string;
  shared_by_name: string | null;
  shared_with_distributor_id: string;
  shared_with_name: string | null;
  training_video_id: string;
  training_title: string | null;
  personal_message: string | null;
  accessed: boolean;
  accessed_at: string | null;
  watch_progress_percent: number;
  completed: boolean;
  completed_at: string | null;
  notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface DownlineMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  current_rank: string | null;
  level: number;
  sponsor_id: string | null;
}

/**
 * Check if distributor has Team Edition access
 */
export async function canSendTeamBroadcast(distributorId: string): Promise<boolean> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('autopilot_subscriptions')
      .select('tier, status')
      .eq('distributor_id', distributorId)
      .single();

    if (error || !data) {
      console.error('[Team Helpers] Error checking subscription:', error);
      return false;
    }

    // Only Team Edition tier can send broadcasts
    return data.tier === 'team_edition' && data.status === 'active';
  } catch (error) {
    console.error('[Team Helpers] Error checking team access:', error);
    return false;
  }
}

/**
 * Get all downline members for a distributor at specified levels
 */
export async function getDownlineMembers(
  distributorId: string,
  levels?: number[]
): Promise<DownlineMember[]> {
  try {
    const supabase = createServiceClient();

    // First, get the member_id for this distributor
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('member_id')
      .eq('distributor_id', distributorId)
      .single();

    if (memberError || !member) {
      console.error('[Team Helpers] Error fetching member:', memberError);
      return [];
    }

    // Recursive CTE to get all downline members
    // This traverses the sponsor tree to find all downline members
    const query = `
      WITH RECURSIVE downline AS (
        -- Start with direct downline (level 1)
        SELECT
          m.member_id,
          m.distributor_id,
          d.first_name,
          d.last_name,
          d.email,
          m.tech_rank as current_rank,
          m.sponsor_id,
          1 as level
        FROM members m
        JOIN distributors d ON m.distributor_id = d.id
        WHERE m.sponsor_id = '${member.member_id}'
        AND m.status = 'active'

        UNION ALL

        -- Recursively get deeper levels
        SELECT
          m.member_id,
          m.distributor_id,
          d.first_name,
          d.last_name,
          d.email,
          m.tech_rank as current_rank,
          m.sponsor_id,
          dl.level + 1
        FROM members m
        JOIN distributors d ON m.distributor_id = d.id
        JOIN downline dl ON m.sponsor_id = dl.member_id
        WHERE m.status = 'active'
        AND dl.level < 10 -- Prevent infinite recursion
      )
      SELECT
        distributor_id as id,
        first_name,
        last_name,
        email,
        current_rank,
        sponsor_id,
        level
      FROM downline
      ${levels && levels.length > 0 ? `WHERE level = ANY(ARRAY[${levels.join(',')}])` : ''}
      ORDER BY level, last_name, first_name
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });

    if (error) {
      console.error('[Team Helpers] Error fetching downline:', error);

      // Fallback: Try direct query for level 1 only
      const { data: directDownline, error: directError } = await supabase
        .from('members')
        .select(`
          member_id,
          distributor_id,
          distributors!inner(first_name, last_name, email),
          tech_rank,
          sponsor_id
        `)
        .eq('sponsor_id', member.member_id)
        .eq('status', 'active');

      if (directError || !directDownline) {
        return [];
      }

      return directDownline.map((m: any) => ({
        id: m.distributor_id,
        first_name: m.distributors.first_name,
        last_name: m.distributors.last_name,
        email: m.distributors.email,
        current_rank: m.tech_rank,
        level: 1,
        sponsor_id: m.sponsor_id,
      }));
    }

    return data || [];
  } catch (error) {
    console.error('[Team Helpers] Error in getDownlineMembers:', error);
    return [];
  }
}

/**
 * Count downline members at specified levels
 */
export async function countDownlineMembers(
  distributorId: string,
  levels?: number[]
): Promise<number> {
  const members = await getDownlineMembers(distributorId, levels);
  return members.length;
}

/**
 * Track broadcast delivery status
 */
export async function trackBroadcastDelivery(
  broadcastId: string,
  recipientId: string,
  status: 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked'
): Promise<boolean> {
  try {
    const supabase = createServiceClient();

    // Get current broadcast stats
    const { data: broadcast, error: fetchError } = await supabase
      .from('team_broadcasts')
      .select('total_sent, total_delivered, total_failed, total_opened, total_clicked')
      .eq('id', broadcastId)
      .single();

    if (fetchError || !broadcast) {
      console.error('[Team Helpers] Error fetching broadcast:', fetchError);
      return false;
    }

    // Increment appropriate counter
    const updates: Record<string, number> = {};

    switch (status) {
      case 'sent':
        updates.total_sent = broadcast.total_sent + 1;
        break;
      case 'delivered':
        updates.total_delivered = broadcast.total_delivered + 1;
        break;
      case 'failed':
        updates.total_failed = broadcast.total_failed + 1;
        break;
      case 'opened':
        updates.total_opened = broadcast.total_opened + 1;
        break;
      case 'clicked':
        updates.total_clicked = broadcast.total_clicked + 1;
        break;
    }

    const { error: updateError } = await supabase
      .from('team_broadcasts')
      .update(updates)
      .eq('id', broadcastId);

    if (updateError) {
      console.error('[Team Helpers] Error updating broadcast stats:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Team Helpers] Error tracking delivery:', error);
    return false;
  }
}

/**
 * Get training videos available for sharing
 */
export async function getAvailableTrainingVideos() {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('training_videos')
      .select('id, title, description, video_url, thumbnail_url, duration_seconds, category')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Team Helpers] Error fetching training videos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Team Helpers] Error in getAvailableTrainingVideos:', error);
    return [];
  }
}

/**
 * Check if distributor can share training
 */
export async function canShareTraining(distributorId: string): Promise<boolean> {
  try {
    const hasReached = await hasReachedLimit(distributorId, 'training');
    return !hasReached;
  } catch (error) {
    console.error('[Team Helpers] Error checking training limit:', error);
    return false;
  }
}

/**
 * Increment training share usage counter
 */
export async function incrementTrainingShareUsage(distributorId: string): Promise<boolean> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase.rpc('increment_autopilot_usage', {
      p_distributor_id: distributorId,
      p_limit_type: 'training',
      p_increment: 1,
    });

    if (error) {
      console.error('[Team Helpers] Error incrementing training usage:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('[Team Helpers] Error incrementing training usage:', error);
    return false;
  }
}

/**
 * Increment broadcast usage counter
 */
export async function incrementBroadcastUsage(distributorId: string): Promise<boolean> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase.rpc('increment_autopilot_usage', {
      p_distributor_id: distributorId,
      p_limit_type: 'broadcasts',
      p_increment: 1,
    });

    if (error) {
      console.error('[Team Helpers] Error incrementing broadcast usage:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('[Team Helpers] Error incrementing broadcast usage:', error);
    return false;
  }
}

/**
 * Get broadcast statistics for a distributor
 */
export async function getBroadcastStats(distributorId: string) {
  try {
    const supabase = createServiceClient();

    // Get current month's start date
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all broadcasts for this month
    const { data: broadcasts, error } = await supabase
      .from('team_broadcasts')
      .select('status, total_recipients, total_sent, total_delivered, total_opened, total_clicked')
      .eq('distributor_id', distributorId)
      .gte('created_at', monthStart.toISOString());

    if (error) {
      console.error('[Team Helpers] Error fetching broadcast stats:', error);
      return null;
    }

    // Calculate statistics
    const totalBroadcasts = broadcasts?.length || 0;
    const totalRecipients = broadcasts?.reduce((sum, b) => sum + b.total_recipients, 0) || 0;
    const totalSent = broadcasts?.reduce((sum, b) => sum + b.total_sent, 0) || 0;
    const totalDelivered = broadcasts?.reduce((sum, b) => sum + b.total_delivered, 0) || 0;
    const totalOpened = broadcasts?.reduce((sum, b) => sum + b.total_opened, 0) || 0;
    const totalClicked = broadcasts?.reduce((sum, b) => sum + b.total_clicked, 0) || 0;

    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
    const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

    return {
      totalBroadcasts,
      totalRecipients,
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      deliveryRate: Math.round(deliveryRate * 10) / 10,
      openRate: Math.round(openRate * 10) / 10,
      clickRate: Math.round(clickRate * 10) / 10,
    };
  } catch (error) {
    console.error('[Team Helpers] Error calculating broadcast stats:', error);
    return null;
  }
}

/**
 * Get training share statistics for a distributor
 */
export async function getTrainingShareStats(distributorId: string) {
  try {
    const supabase = createServiceClient();

    // Get all shares sent by this distributor
    const { data: shares, error } = await supabase
      .from('training_shares')
      .select('accessed, completed, watch_progress_percent')
      .eq('shared_by_distributor_id', distributorId);

    if (error) {
      console.error('[Team Helpers] Error fetching training share stats:', error);
      return null;
    }

    // Calculate statistics
    const totalShared = shares?.length || 0;
    const totalAccessed = shares?.filter(s => s.accessed).length || 0;
    const totalCompleted = shares?.filter(s => s.completed).length || 0;

    const accessRate = totalShared > 0 ? (totalAccessed / totalShared) * 100 : 0;
    const completionRate = totalAccessed > 0 ? (totalCompleted / totalAccessed) * 100 : 0;

    const avgProgress = totalShared > 0
      ? shares.reduce((sum, s) => sum + s.watch_progress_percent, 0) / totalShared
      : 0;

    return {
      totalShared,
      totalAccessed,
      totalCompleted,
      accessRate: Math.round(accessRate * 10) / 10,
      completionRate: Math.round(completionRate * 10) / 10,
      avgProgress: Math.round(avgProgress * 10) / 10,
    };
  } catch (error) {
    console.error('[Team Helpers] Error calculating training share stats:', error);
    return null;
  }
}

/**
 * Validate broadcast data before sending
 */
export function validateBroadcastData(data: {
  broadcast_type: string;
  content: string;
  subject?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate broadcast type
  const validTypes: BroadcastType[] = ['email', 'sms', 'in_app', 'push'];
  if (!validTypes.includes(data.broadcast_type as BroadcastType)) {
    errors.push('Invalid broadcast type');
  }

  // Validate content
  if (!data.content || data.content.trim().length < 5) {
    errors.push('Content must be at least 5 characters');
  }

  // Email broadcasts require subject
  if (data.broadcast_type === 'email' && (!data.subject || data.subject.trim().length < 3)) {
    errors.push('Email broadcasts require a subject line');
  }

  // SMS character limit
  if (data.broadcast_type === 'sms' && data.content.length > 1600) {
    errors.push('SMS content must be 1600 characters or less');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
