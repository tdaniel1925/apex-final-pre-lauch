// =============================================
// Usage Tracking Library
// Track AI chatbot messages and voice minutes
// For enforcing free tier limits
// =============================================

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export type UsageType = 'ai_chatbot_message' | 'ai_voice_minute' | 'api_call';

/**
 * Track usage for a distributor
 * Inserts a record into usage_tracking table
 */
export async function trackUsage(
  distributorId: string,
  usageType: UsageType,
  amount: number = 1,
  metadata: Record<string, any> = {}
): Promise<void> {
  const supabase = createServiceClient();

  const { error } = await supabase.from('usage_tracking').insert({
    distributor_id: distributorId,
    usage_type: usageType,
    amount,
    metadata,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error tracking usage:', error);
    throw error;
  }
}

/**
 * Get usage for a distributor today (chatbot messages)
 */
export async function getTodayUsage(
  distributorId: string,
  usageType: UsageType
): Promise<number> {
  const supabase = createServiceClient();

  // Get start of today (midnight)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('usage_tracking')
    .select('amount')
    .eq('distributor_id', distributorId)
    .eq('usage_type', usageType)
    .gte('created_at', startOfToday.toISOString());

  if (error) {
    console.error('Error fetching today usage:', error);
    return 0;
  }

  // Sum all amounts
  return data?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0;
}

/**
 * Get usage for a distributor this month (voice minutes)
 */
export async function getMonthlyUsage(
  distributorId: string,
  usageType: UsageType
): Promise<number> {
  const supabase = createServiceClient();

  // Get start of current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('usage_tracking')
    .select('amount')
    .eq('distributor_id', distributorId)
    .eq('usage_type', usageType)
    .gte('created_at', startOfMonth.toISOString());

  if (error) {
    console.error('Error fetching monthly usage:', error);
    return 0;
  }

  // Sum all amounts
  return data?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0;
}

/**
 * Get all usage stats for a distributor (for Business Center page)
 */
export async function getUsageStats(distributorId: string): Promise<{
  chatbot: {
    today: number;
    thisMonth: number;
  };
  voice: {
    thisMonth: number;
  };
}> {
  const chatbotToday = await getTodayUsage(distributorId, 'ai_chatbot_message');
  const chatbotMonth = await getMonthlyUsage(distributorId, 'ai_chatbot_message');
  const voiceMonth = await getMonthlyUsage(distributorId, 'ai_voice_minute');

  return {
    chatbot: {
      today: chatbotToday,
      thisMonth: chatbotMonth,
    },
    voice: {
      thisMonth: voiceMonth,
    },
  };
}
