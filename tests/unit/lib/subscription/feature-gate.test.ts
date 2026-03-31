/**
 * Tests for Feature Gating System
 *
 * @module tests/unit/lib/subscription/feature-gate
 */

import { describe, it, expect } from 'vitest';
import {
  isFeatureGated,
  isFreeFeature,
  getFeatureName,
  getUpgradeMessage,
  GATED_FEATURES,
  FREE_FEATURES,
  BUSINESS_CENTER_BENEFITS,
} from '@/lib/subscription/feature-gate';

describe('Feature Gating System', () => {
  describe('isFeatureGated', () => {
    it('should identify gated features', () => {
      expect(isFeatureGated('/dashboard/ai-assistant')).toBe(true);
      expect(isFeatureGated('/dashboard/ai-calls')).toBe(true);
      expect(isFeatureGated('/dashboard/team')).toBe(true);
      expect(isFeatureGated('/dashboard/crm')).toBe(true);
      expect(isFeatureGated('/dashboard/genealogy')).toBe(true);
      expect(isFeatureGated('/dashboard/reports')).toBe(true);
    });

    it('should identify non-gated features', () => {
      expect(isFeatureGated('/dashboard')).toBe(false);
      expect(isFeatureGated('/dashboard/profile')).toBe(false);
      expect(isFeatureGated('/dashboard/settings')).toBe(false);
      expect(isFeatureGated('/dashboard/store')).toBe(false);
    });

    it('should handle nested paths correctly', () => {
      expect(isFeatureGated('/dashboard/team/member/123')).toBe(true);
      expect(isFeatureGated('/dashboard/profile/edit')).toBe(false);
    });
  });

  describe('isFreeFeature', () => {
    it('should identify free features', () => {
      expect(isFreeFeature('/dashboard')).toBe(true);
      expect(isFreeFeature('/dashboard/profile')).toBe(true);
      expect(isFreeFeature('/dashboard/settings')).toBe(true);
      expect(isFreeFeature('/dashboard/store')).toBe(true);
      expect(isFreeFeature('/dashboard/support')).toBe(true);
    });

    it('should return false for gated features', () => {
      expect(isFreeFeature('/dashboard/ai-assistant')).toBe(false);
      expect(isFreeFeature('/dashboard/team')).toBe(false);
      expect(isFreeFeature('/dashboard/crm')).toBe(false);
    });
  });

  describe('getFeatureName', () => {
    it('should return human-readable names for gated features', () => {
      expect(getFeatureName('/dashboard/ai-assistant')).toBe('AI Assistant');
      expect(getFeatureName('/dashboard/ai-calls')).toBe('AI Phone Agent');
      expect(getFeatureName('/dashboard/team')).toBe('Team Management');
      expect(getFeatureName('/dashboard/crm')).toBe('CRM System');
      expect(getFeatureName('/dashboard/genealogy')).toBe('Genealogy');
    });

    it('should return default name for unknown features', () => {
      expect(getFeatureName('/dashboard/unknown')).toBe('This Feature');
    });
  });

  describe('getUpgradeMessage', () => {
    it('should generate upgrade message with feature name', () => {
      const message = getUpgradeMessage('/dashboard/ai-assistant');
      expect(message).toContain('AI Assistant');
      expect(message).toContain('Business Center');
      expect(message).toContain('$39/month');
    });
  });

  describe('GATED_FEATURES constant', () => {
    it('should define all gated features', () => {
      expect(GATED_FEATURES.AI_ASSISTANT).toBe('/dashboard/ai-assistant');
      expect(GATED_FEATURES.AI_CALLS).toBe('/dashboard/ai-calls');
      expect(GATED_FEATURES.CRM).toBe('/dashboard/crm');
      expect(GATED_FEATURES.TEAM).toBe('/dashboard/team');
      expect(GATED_FEATURES.GENEALOGY).toBe('/dashboard/genealogy');
      expect(GATED_FEATURES.REPORTS).toBe('/dashboard/reports');
    });
  });

  describe('FREE_FEATURES constant', () => {
    it('should define all free features', () => {
      expect(FREE_FEATURES.HOME).toBe('/dashboard');
      expect(FREE_FEATURES.PROFILE).toBe('/dashboard/profile');
      expect(FREE_FEATURES.SETTINGS).toBe('/dashboard/settings');
      expect(FREE_FEATURES.STORE).toBe('/dashboard/store');
      expect(FREE_FEATURES.SUPPORT).toBe('/dashboard/support');
    });
  });

  describe('BUSINESS_CENTER_BENEFITS constant', () => {
    it('should list all benefits', () => {
      expect(BUSINESS_CENTER_BENEFITS).toContain('Full back office access');
      expect(BUSINESS_CENTER_BENEFITS).toContain('AI Chatbot (knows your organization data)');
      expect(BUSINESS_CENTER_BENEFITS).toContain('AI Phone Agent (answers calls, books appointments)');
      expect(BUSINESS_CENTER_BENEFITS).toContain('CRM System (lead management, follow-ups)');
    });

    it('should have at least 5 benefits', () => {
      expect(BUSINESS_CENTER_BENEFITS.length).toBeGreaterThanOrEqual(5);
    });
  });
});
