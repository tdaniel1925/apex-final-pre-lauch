// =====================================================
// Autopilot Configuration
// Control free trial and feature access
// =====================================================

/**
 * FREE TRIAL CONFIGURATION
 *
 * Set to true: Everyone gets full Autopilot access for free
 * Set to false: Tier-based restrictions apply (users must subscribe)
 *
 * To end the free trial: Change this to false
 */
export const AUTOPILOT_FREE_TRIAL_ACTIVE = true;

/**
 * When free trial is active, this is the tier everyone gets
 */
export const FREE_TRIAL_TIER = 'team_edition'; // Highest tier with all features

/**
 * Feature limits by tier (when free trial is OFF)
 */
export const AUTOPILOT_TIER_LIMITS = {
  free: {
    contacts: 25,
    emailInvites: 10,
    smsInvites: 0,
    socialPosts: 5,
    flyers: 3,
    aiScoring: false,
    teamBroadcasts: false,
  },
  social_connector: {
    contacts: 100,
    emailInvites: 50,
    smsInvites: 0,
    socialPosts: 30,
    flyers: 10,
    aiScoring: false,
    teamBroadcasts: false,
  },
  lead_autopilot_pro: {
    contacts: 500,
    emailInvites: -1, // Unlimited
    smsInvites: 1000,
    socialPosts: -1, // Unlimited
    flyers: -1, // Unlimited
    aiScoring: true,
    teamBroadcasts: false,
  },
  team_edition: {
    contacts: -1, // Unlimited
    emailInvites: -1,
    smsInvites: -1,
    socialPosts: -1,
    flyers: -1,
    aiScoring: true,
    teamBroadcasts: true,
  },
};

/**
 * Get effective tier for a distributor
 */
export function getEffectiveTier(actualTier: string): string {
  if (AUTOPILOT_FREE_TRIAL_ACTIVE) {
    return FREE_TRIAL_TIER;
  }
  return actualTier || 'free';
}

/**
 * Check if free trial is active
 */
export function isAutopilotFreeTrial(): boolean {
  return AUTOPILOT_FREE_TRIAL_ACTIVE;
}
