/**
 * Feature Gating Middleware
 *
 * Checks if features require Business Center subscription
 * and provides utilities for gating UI components.
 *
 * @module lib/subscription/feature-gate
 */

/**
 * Features gated after grace period (Day 22+)
 */
export const GATED_FEATURES = {
  // AI Tools
  AI_ASSISTANT: '/dashboard/ai-assistant',
  AI_CALLS: '/dashboard/ai-calls',
  AI_CHAT: '/dashboard/ai-chat',

  // CRM & Team Management
  CRM: '/dashboard/crm',
  GENEALOGY: '/dashboard/genealogy',
  TEAM: '/dashboard/team',
  MATRIX_V2: '/dashboard/matrix-v2',

  // Advanced Reports
  REPORTS: '/dashboard/reports',
  COMPENSATION_DETAIL: '/dashboard/compensation',

  // Training & Tools
  TRAINING: '/dashboard/training',
  TOOLS: '/dashboard/tools',
  SOCIAL_MEDIA: '/dashboard/social-media',
} as const;

/**
 * Always accessible features (even without subscription)
 */
export const FREE_FEATURES = {
  // Basic Access
  HOME: '/dashboard',
  PROFILE: '/dashboard/profile',
  SETTINGS: '/dashboard/settings',

  // Store & Upgrades
  STORE: '/dashboard/store',
  UPGRADE: '/dashboard/upgrade',

  // Basic Compensation View
  COMPENSATION_OVERVIEW: '/dashboard/compensation/overview',

  // Support
  SUPPORT: '/dashboard/support',
  DOWNLOADS: '/dashboard/downloads',
} as const;

/**
 * Check if a route requires Business Center subscription
 *
 * @param pathname - Current route path
 * @returns True if route is gated, false if free access
 */
export function isFeatureGated(pathname: string): boolean {
  // Check if path starts with any gated feature
  return Object.values(GATED_FEATURES).some(gatedPath =>
    pathname.startsWith(gatedPath)
  );
}

/**
 * Check if a route is always accessible
 *
 * @param pathname - Current route path
 * @returns True if route is free, false if potentially gated
 */
export function isFreeFeature(pathname: string): boolean {
  // Check if path starts with any free feature
  return Object.values(FREE_FEATURES).some(freePath =>
    pathname.startsWith(freePath)
  );
}

/**
 * Get feature name from path
 *
 * @param pathname - Current route path
 * @returns Human-readable feature name
 */
export function getFeatureName(pathname: string): string {
  const featureMap: Record<string, string> = {
    [GATED_FEATURES.AI_ASSISTANT]: 'AI Assistant',
    [GATED_FEATURES.AI_CALLS]: 'AI Phone Agent',
    [GATED_FEATURES.AI_CHAT]: 'AI Chat',
    [GATED_FEATURES.CRM]: 'CRM System',
    [GATED_FEATURES.GENEALOGY]: 'Genealogy',
    [GATED_FEATURES.TEAM]: 'Team Management',
    [GATED_FEATURES.MATRIX_V2]: 'Matrix View',
    [GATED_FEATURES.REPORTS]: 'Advanced Reports',
    [GATED_FEATURES.COMPENSATION_DETAIL]: 'Compensation Details',
    [GATED_FEATURES.TRAINING]: 'Training Resources',
    [GATED_FEATURES.TOOLS]: 'Business Tools',
    [GATED_FEATURES.SOCIAL_MEDIA]: 'Social Media Hub',
  };

  for (const [path, name] of Object.entries(featureMap)) {
    if (pathname.startsWith(path)) {
      return name;
    }
  }

  return 'This Feature';
}

/**
 * Get upgrade message for a gated feature
 *
 * @param pathname - Current route path
 * @returns Upgrade message with feature name
 */
export function getUpgradeMessage(pathname: string): string {
  const featureName = getFeatureName(pathname);
  return `Unlock ${featureName} with Business Center subscription for just $39/month`;
}

/**
 * Benefits included in Business Center subscription
 */
export const BUSINESS_CENTER_BENEFITS = [
  'Full back office access',
  'AI Chatbot (knows your organization data)',
  'AI Phone Agent (answers calls, books appointments)',
  'CRM System (lead management, follow-ups)',
  'Advanced reports and analytics',
  'Training resources and videos',
  'Marketing tools and templates',
  'Genealogy and team tracking',
  'Social media management',
] as const;
