// Activity monitoring service for proactive AI engagement
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';

interface UserActivity {
  lastLogin: Date | null;
  recentSignups: number; // Last 7 days
  rankProgress: number; // % to next rank
  inactiveDays: number;
  hasUnreadMessages: boolean;
  currentRank: string;
  personalBV: number;
  teamBV: number;
}

interface ProactiveMessage {
  type: 'motivation' | 'congratulations' | 'encouragement' | 'notification' | 'reminder';
  message: string;
}

/**
 * Analyze user activity and determine if a proactive message should be sent
 */
export async function analyzeUserActivity(distributorId: string): Promise<ProactiveMessage | null> {
  const supabase = createServiceClient();

  try {
    // Get distributor info
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select(`
        id,
        auth_user_id,
        first_name,
        current_rank,
        last_login_at,
        member:members!members_distributor_id_fkey (
          personal_credits_monthly,
          team_credits_monthly
        )
      `)
      .eq('id', distributorId)
      .single();

    if (distError || !distributor) {
      return null;
    }

    // Calculate activity metrics
    const activity = await calculateActivity(distributor);

    // Check triggers in priority order
    const message =
      await checkInactivityTrigger(activity, distributor) ||
      await checkRecentSignupsTrigger(activity, distributor) ||
      await checkRankProgressTrigger(activity, distributor) ||
      await checkPaymentReadyTrigger(distributor);

    return message;
  } catch (error) {
    console.error('Error analyzing user activity:', error);
    return null;
  }
}

/**
 * Calculate user activity metrics
 */
async function calculateActivity(distributor: any): Promise<UserActivity> {
  const supabase = createServiceClient();

  // Calculate days since last login
  const lastLogin = distributor.last_login_at ? new Date(distributor.last_login_at) : null;
  const now = new Date();
  const inactiveDays = lastLogin
    ? Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  // Count recent signups (last 7 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const { count: recentSignups } = await supabase
    .from('distributors')
    .select('*', { count: 'exact', head: true })
    .eq('sponsor_id', distributor.id)
    .gte('created_at', sevenDaysAgo.toISOString());

  // Get rank requirements
  const rankProgress = calculateRankProgress(
    distributor.current_rank,
    distributor.member?.team_credits_monthly || 0
  );

  // Check for unread AI messages
  const { count: unreadCount } = await supabase
    .from('ai_proactive_messages')
    .select('*', { count: 'exact', head: true })
    .eq('distributor_id', distributor.id)
    .is('read_at', null);

  return {
    lastLogin,
    recentSignups: recentSignups || 0,
    rankProgress,
    inactiveDays,
    hasUnreadMessages: (unreadCount || 0) > 0,
    currentRank: distributor.current_rank,
    personalBV: distributor.member?.personal_credits_monthly || 0,
    teamBV: distributor.member?.team_credits_monthly || 0,
  };
}

/**
 * Calculate progress to next rank (0-100%)
 */
function calculateRankProgress(currentRank: string, teamBV: number): number {
  const rankRequirements: Record<string, number> = {
    'Bronze': 0,
    'Silver': 3000,
    'Gold': 5000,
    'Platinum': 10000,
    'Diamond': 20000,
    'Double Diamond': 40000,
    'Triple Diamond': 80000,
    'Presidential': 150000,
  };

  const ranks = Object.keys(rankRequirements);
  const currentIndex = ranks.findIndex(r => r === currentRank);

  if (currentIndex === -1 || currentIndex === ranks.length - 1) {
    return 100; // Already at highest rank
  }

  const nextRank = ranks[currentIndex + 1];
  const currentRequired = rankRequirements[currentRank];
  const nextRequired = rankRequirements[nextRank];

  if (teamBV >= nextRequired) {
    return 100;
  }

  const progress = ((teamBV - currentRequired) / (nextRequired - currentRequired)) * 100;
  return Math.max(0, Math.min(100, progress));
}

/**
 * Trigger: User inactive for 3+ days
 */
async function checkInactivityTrigger(
  activity: UserActivity,
  distributor: any
): Promise<ProactiveMessage | null> {
  if (activity.inactiveDays >= 3 && activity.inactiveDays < 30) {
    const name = distributor.first_name || 'there';
    const dayText = activity.inactiveDays === 1 ? 'day' : 'days';

    return {
      type: 'motivation',
      message: `👋 Hey ${name}! I noticed you haven't logged in for ${activity.inactiveDays} ${dayText}. Is there anything I can help you with? I'm here 24/7 to answer questions about growing your business, checking your stats, or creating meeting pages.`
    };
  }
  return null;
}

/**
 * Trigger: Multiple new signups (3+ in last 7 days)
 */
async function checkRecentSignupsTrigger(
  activity: UserActivity,
  distributor: any
): Promise<ProactiveMessage | null> {
  if (activity.recentSignups >= 3) {
    const name = distributor.first_name || 'there';

    return {
      type: 'congratulations',
      message: `🎉 Congratulations ${name}! You've had ${activity.recentSignups} new team members join in the last week! That's incredible momentum. Want me to help you create a welcome message or training plan for them?`
    };
  }
  return null;
}

/**
 * Trigger: Close to rank advancement (80%+ progress)
 */
async function checkRankProgressTrigger(
  activity: UserActivity,
  distributor: any
): Promise<ProactiveMessage | null> {
  if (activity.rankProgress >= 80 && activity.rankProgress < 100) {
    const name = distributor.first_name || 'there';
    const remaining = Math.round(100 - activity.rankProgress);
    const ranks = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Double Diamond', 'Triple Diamond', 'Presidential'];
    const currentIndex = ranks.indexOf(activity.currentRank);
    const nextRank = currentIndex < ranks.length - 1 ? ranks[currentIndex + 1] : null;

    if (nextRank) {
      return {
        type: 'encouragement',
        message: `🚀 Amazing progress ${name}! You're ${remaining}% away from ${nextRank} rank! Want help creating a game plan to push through and hit your goal? I can show you exactly what you need to do.`
      };
    }
  }
  return null;
}

/**
 * Trigger: Payment/commission ready notification
 */
async function checkPaymentReadyTrigger(distributor: any): Promise<ProactiveMessage | null> {
  // This would integrate with your commission processing system
  // For now, returning null - implement when commission system is ready
  return null;
}

/**
 * Create and store a proactive message
 */
export async function createProactiveMessage(
  distributorId: string,
  message: ProactiveMessage
): Promise<boolean> {
  const supabase = createServiceClient();

  try {
    const { error } = await supabase
      .from('ai_proactive_messages')
      .insert({
        distributor_id: distributorId,
        message_type: message.type,
        message_content: message.message,
        triggered_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error creating proactive message:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createProactiveMessage:', error);
    return false;
  }
}

/**
 * Get unread proactive messages for a user
 */
export async function getUnreadMessages(distributorId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('ai_proactive_messages')
    .select('*')
    .eq('distributor_id', distributorId)
    .is('read_at', null)
    .order('triggered_at', { ascending: false });

  if (error) {
    console.error('Error fetching unread messages:', error);
    return [];
  }

  return data || [];
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(messageIds: string[]) {
  const supabase = createClient();

  const { error } = await supabase
    .from('ai_proactive_messages')
    .update({ read_at: new Date().toISOString() })
    .in('id', messageIds);

  if (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }

  return true;
}
