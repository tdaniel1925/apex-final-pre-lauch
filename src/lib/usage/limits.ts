// =============================================
// Usage Limits Library
// Check if user has exceeded free tier limits
// Business Center subscribers have unlimited access
// =============================================

import { getTodayUsage, getMonthlyUsage, UsageType } from './tracking';
import { checkBusinessCenterAccess } from '@/lib/subscription/check-business-center';

// Free tier limits
export const FREE_TIER_LIMITS = {
  ai_chatbot_daily: 20, // 20 messages per day
  ai_voice_monthly: 50, // 50 minutes per month
};

export interface UsageLimitCheck {
  allowed: boolean;
  current: number;
  limit: number;
  isUnlimited: boolean;
  reason?: string;
}

/**
 * Check if chatbot usage is allowed
 * Returns true if user can send another message
 */
export async function checkChatbotLimit(
  distributorId: string
): Promise<UsageLimitCheck> {
  // Check if user has Business Center (unlimited)
  const hasBusinessCenter = await checkBusinessCenterAccess(distributorId);

  if (hasBusinessCenter) {
    return {
      allowed: true,
      current: 0,
      limit: 0,
      isUnlimited: true,
    };
  }

  // Get today's usage
  const todayUsage = await getTodayUsage(distributorId, 'ai_chatbot_message');
  const limit = FREE_TIER_LIMITS.ai_chatbot_daily;

  if (todayUsage >= limit) {
    return {
      allowed: false,
      current: todayUsage,
      limit,
      isUnlimited: false,
      reason: `You've reached your daily limit of ${limit} AI chatbot messages. Upgrade to Business Center for unlimited access.`,
    };
  }

  return {
    allowed: true,
    current: todayUsage,
    limit,
    isUnlimited: false,
  };
}

/**
 * Check if voice usage is allowed
 * Returns true if user can make another call
 */
export async function checkVoiceLimit(
  distributorId: string,
  minutesRequested: number = 1
): Promise<UsageLimitCheck> {
  // Check if user has Business Center (unlimited)
  const hasBusinessCenter = await checkBusinessCenterAccess(distributorId);

  if (hasBusinessCenter) {
    return {
      allowed: true,
      current: 0,
      limit: 0,
      isUnlimited: true,
    };
  }

  // Get this month's usage
  const monthlyUsage = await getMonthlyUsage(distributorId, 'ai_voice_minute');
  const limit = FREE_TIER_LIMITS.ai_voice_monthly;

  if (monthlyUsage + minutesRequested > limit) {
    return {
      allowed: false,
      current: monthlyUsage,
      limit,
      isUnlimited: false,
      reason: `You've reached your monthly limit of ${limit} AI voice minutes. Upgrade to Business Center for unlimited access.`,
    };
  }

  return {
    allowed: true,
    current: monthlyUsage,
    limit,
    isUnlimited: false,
  };
}

/**
 * Get usage limits status for dashboard display
 */
export async function getUsageLimitsStatus(distributorId: string): Promise<{
  chatbot: UsageLimitCheck;
  voice: UsageLimitCheck;
}> {
  const chatbot = await checkChatbotLimit(distributorId);
  const voice = await checkVoiceLimit(distributorId);

  return {
    chatbot,
    voice,
  };
}
