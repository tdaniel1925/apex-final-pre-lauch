/**
 * Tests for Usage Limits
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FREE_TIER_LIMITS } from '@/lib/usage/limits';

describe('Usage Limits', () => {
  describe('FREE_TIER_LIMITS', () => {
    it('should have correct daily chatbot limit', () => {
      expect(FREE_TIER_LIMITS.ai_chatbot_daily).toBe(20);
    });

    it('should have correct monthly voice limit', () => {
      expect(FREE_TIER_LIMITS.ai_voice_monthly).toBe(50);
    });
  });

  // Note: Full tests for checkChatbotLimit and checkVoiceLimit would require
  // mocking Supabase and subscription checks. These are integration tests
  // that should be run with a test database.
});
