// =============================================
// Apex Lead Autopilot - Stripe Product Configuration
// Defines the 4-tier subscription structure for Lead Autopilot
// =============================================

/**
 * Autopilot Tier Enum
 * Maps to autopilot_subscriptions.tier column
 */
export type AutopilotTier = 'free' | 'social_connector' | 'lead_autopilot_pro' | 'team_edition';

/**
 * Autopilot Subscription Status
 * Maps to autopilot_subscriptions.status column
 */
export type AutopilotStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';

/**
 * Feature Definition for Each Tier
 */
export interface AutopilotFeature {
  name: string;
  description: string;
  limit?: number; // -1 = unlimited, 0 = not included
  isIncluded: boolean;
}

/**
 * Product Definition for Each Tier
 */
export interface AutopilotProduct {
  tier: AutopilotTier;
  name: string;
  displayName: string;
  description: string;
  priceMonthly: number; // in dollars
  priceCents: number; // in cents for Stripe
  bvValue: number; // Business Volume (BV) - 1:1 with price for autopilot
  stripePriceId: string; // Stripe Price ID (use env var)
  stripeProductId?: string; // Stripe Product ID (optional)
  features: AutopilotFeature[];
  limits: {
    emailInvites: number; // -1 = unlimited
    smsMessages: number;
    crmContacts: number;
    socialPosts: number;
    eventFlyers: number;
    teamBroadcasts: number;
    trainingShares: number;
    meetings: number;
  };
  hasFreeTrial: boolean;
  trialDays?: number;
  isPopular?: boolean;
  badge?: string;
  lookupKey: string; // For easy Stripe lookup
}

/**
 * Autopilot Product Catalog
 * Define all 4 tiers with their features and limits
 */
export const AUTOPILOT_PRODUCTS: Record<AutopilotTier, AutopilotProduct> = {
  free: {
    tier: 'free',
    name: 'Free',
    displayName: 'Apex Lead Autopilot (Free)',
    description: 'Complete CRM, email invitations, social posting, and team collaboration - all free for Apex members',
    priceMonthly: 0,
    priceCents: 0,
    bvValue: 0, // No BV for free tier
    stripePriceId: '', // No Stripe price for free tier
    features: [
      {
        name: 'Unlimited Email Invitations',
        description: 'Send unlimited meeting invitations',
        limit: -1,
        isIncluded: true,
      },
      {
        name: 'CRM System',
        description: 'Unlimited contacts with full CRM features',
        limit: -1,
        isIncluded: true,
      },
      {
        name: 'SMS Campaigns',
        description: 'Unlimited SMS messages',
        limit: -1,
        isIncluded: true,
      },
      {
        name: 'Social Media Posting',
        description: 'Unlimited social posts',
        limit: -1,
        isIncluded: true,
      },
      {
        name: 'Event Flyers',
        description: 'Unlimited custom event flyers',
        limit: -1,
        isIncluded: true,
      },
      {
        name: 'Team Broadcasts',
        description: 'Communicate with your downline',
        limit: -1,
        isIncluded: true,
      },
      {
        name: 'Training Library',
        description: 'Share training videos with your team',
        limit: -1,
        isIncluded: true,
      },
      {
        name: 'AI Lead Scoring',
        description: 'Automatic lead prioritization',
        isIncluded: true,
      },
      {
        name: 'Advanced Analytics',
        description: 'Full performance dashboard',
        isIncluded: true,
      },
    ],
    limits: {
      emailInvites: -1, // Unlimited
      smsMessages: -1, // Unlimited
      crmContacts: -1, // Unlimited
      socialPosts: -1, // Unlimited
      eventFlyers: -1, // Unlimited
      teamBroadcasts: -1, // Unlimited
      trainingShares: -1, // Unlimited
      meetings: -1, // Unlimited
    },
    hasFreeTrial: false,
    lookupKey: 'autopilot_free',
  },

  social_connector: {
    tier: 'social_connector',
    name: 'Social Connector',
    displayName: 'Social Connector (Free)',
    description: 'Boost your reach with social media posting and custom event flyers - now free',
    priceMonthly: 0,
    priceCents: 0,
    bvValue: 0, // FREE - No BV
    stripePriceId: '', // FREE - No Stripe price needed
    features: [
      {
        name: 'Email Invitations',
        description: '50 meeting invitations per month',
        limit: 50,
        isIncluded: true,
      },
      {
        name: 'Social Media Posting',
        description: '30 social posts per month',
        limit: 30,
        isIncluded: true,
      },
      {
        name: 'Event Flyers',
        description: '10 custom event flyers per month',
        limit: 10,
        isIncluded: true,
      },
      {
        name: 'Response Tracking',
        description: 'Track opens and responses',
        isIncluded: true,
      },
      {
        name: 'Enhanced Analytics',
        description: 'Detailed performance metrics',
        isIncluded: true,
      },
      {
        name: 'CRM & SMS',
        description: 'Not included in this tier',
        limit: 0,
        isIncluded: false,
      },
    ],
    limits: {
      emailInvites: 50,
      smsMessages: 0,
      crmContacts: 0,
      socialPosts: 30,
      eventFlyers: 10,
      teamBroadcasts: 0,
      trainingShares: 0,
      meetings: -1,
    },
    hasFreeTrial: false,
    lookupKey: 'autopilot_social_connector',
  },

  lead_autopilot_pro: {
    tier: 'lead_autopilot_pro',
    name: 'Lead Autopilot Pro',
    displayName: 'Lead Autopilot Pro (Free)',
    description: 'Complete CRM with SMS campaigns and AI-powered lead scoring - now free',
    priceMonthly: 0,
    priceCents: 0,
    bvValue: 0, // FREE - No BV
    stripePriceId: '', // FREE - No Stripe price needed
    features: [
      {
        name: 'Unlimited Email Invitations',
        description: 'Send unlimited meeting invitations',
        limit: -1,
        isIncluded: true,
      },
      {
        name: 'CRM System',
        description: '500 contacts with full CRM features',
        limit: 500,
        isIncluded: true,
      },
      {
        name: 'SMS Campaigns',
        description: '1,000 SMS messages per month',
        limit: 1000,
        isIncluded: true,
      },
      {
        name: 'Social Media Posting',
        description: '100 social posts per month',
        limit: 100,
        isIncluded: true,
      },
      {
        name: 'Event Flyers',
        description: '50 custom event flyers per month',
        limit: 50,
        isIncluded: true,
      },
      {
        name: 'AI Lead Scoring',
        description: 'Automatic lead prioritization',
        isIncluded: true,
      },
      {
        name: 'Advanced Analytics',
        description: 'Full performance dashboard',
        isIncluded: true,
      },
      {
        name: 'Task Automation',
        description: 'Automated follow-ups and reminders',
        isIncluded: true,
      },
    ],
    limits: {
      emailInvites: -1, // Unlimited
      smsMessages: 1000,
      crmContacts: 500,
      socialPosts: 100,
      eventFlyers: 50,
      teamBroadcasts: 0,
      trainingShares: 0,
      meetings: -1,
    },
    hasFreeTrial: true,
    trialDays: 14,
    isPopular: true,
    badge: 'Most Popular',
    lookupKey: 'autopilot_lead_pro',
  },

  team_edition: {
    tier: 'team_edition',
    name: 'Team Edition',
    displayName: 'Team Edition (Free)',
    description: 'Unlimited everything plus team collaboration and training library - now free',
    priceMonthly: 0,
    priceCents: 0,
    bvValue: 0, // FREE - No BV
    stripePriceId: '', // FREE - No Stripe price needed
    features: [
      {
        name: 'Unlimited Everything',
        description: 'No limits on any features',
        limit: -1,
        isIncluded: true,
      },
      {
        name: 'Unlimited CRM Contacts',
        description: 'Store unlimited contacts',
        limit: -1,
        isIncluded: true,
      },
      {
        name: 'Unlimited SMS',
        description: 'Send unlimited SMS campaigns',
        limit: -1,
        isIncluded: true,
      },
      {
        name: 'Team Broadcasts',
        description: 'Communicate with your downline',
        limit: -1,
        isIncluded: true,
      },
      {
        name: 'Training Library',
        description: 'Share training videos with your team',
        limit: -1,
        isIncluded: true,
      },
      {
        name: 'Priority Support',
        description: '24/7 priority customer support',
        isIncluded: true,
      },
      {
        name: 'Custom Branding',
        description: 'Add your logo to all materials',
        isIncluded: true,
      },
      {
        name: 'Advanced Reporting',
        description: 'Team performance analytics',
        isIncluded: true,
      },
    ],
    limits: {
      emailInvites: -1,
      smsMessages: -1,
      crmContacts: -1,
      socialPosts: -1,
      eventFlyers: -1,
      teamBroadcasts: -1,
      trainingShares: -1,
      meetings: -1,
    },
    hasFreeTrial: false,
    badge: 'Best Value',
    lookupKey: 'autopilot_team_edition',
  },
};

/**
 * Helper to get product by tier
 */
export function getAutopilotProduct(tier: AutopilotTier): AutopilotProduct {
  return AUTOPILOT_PRODUCTS[tier];
}

/**
 * Helper to get all paid products (for pricing page)
 */
export function getPaidAutopilotProducts(): AutopilotProduct[] {
  return [
    AUTOPILOT_PRODUCTS.social_connector,
    AUTOPILOT_PRODUCTS.lead_autopilot_pro,
    AUTOPILOT_PRODUCTS.team_edition,
  ];
}

/**
 * Helper to get all products (including free)
 */
export function getAllAutopilotProducts(): AutopilotProduct[] {
  return Object.values(AUTOPILOT_PRODUCTS);
}

/**
 * Helper to check if tier is paid
 * NOTE: All Autopilot tiers are now FREE as of 2026
 */
export function isPaidTier(tier: AutopilotTier): boolean {
  return false; // All tiers are now free
}

/**
 * Helper to get tier display name
 */
export function getTierDisplayName(tier: AutopilotTier): string {
  return AUTOPILOT_PRODUCTS[tier].displayName;
}

/**
 * Helper to calculate tier upgrade pricing
 * Returns the difference in price for immediate upgrade (prorated)
 */
export function calculateUpgradePrice(
  currentTier: AutopilotTier,
  newTier: AutopilotTier,
  daysRemainingInCycle: number = 30
): number {
  const currentProduct = AUTOPILOT_PRODUCTS[currentTier];
  const newProduct = AUTOPILOT_PRODUCTS[newTier];

  // Calculate daily rates
  const currentDailyRate = currentProduct.priceCents / 30;
  const newDailyRate = newProduct.priceCents / 30;

  // Calculate prorated amount
  const creditFromCurrent = currentDailyRate * daysRemainingInCycle;
  const costForNew = newDailyRate * daysRemainingInCycle;

  // Return difference (can be negative for downgrades)
  return Math.max(0, Math.round(costForNew - creditFromCurrent));
}

/**
 * Helper to check if upgrade is allowed
 */
export function canUpgrade(currentTier: AutopilotTier, newTier: AutopilotTier): boolean {
  const tiers: AutopilotTier[] = ['free', 'social_connector', 'lead_autopilot_pro', 'team_edition'];
  const currentIndex = tiers.indexOf(currentTier);
  const newIndex = tiers.indexOf(newTier);

  // Can upgrade to higher tier or change to different tier
  return newIndex > currentIndex;
}

/**
 * Helper to check if downgrade is allowed
 */
export function canDowngrade(currentTier: AutopilotTier, newTier: AutopilotTier): boolean {
  const tiers: AutopilotTier[] = ['free', 'social_connector', 'lead_autopilot_pro', 'team_edition'];
  const currentIndex = tiers.indexOf(currentTier);
  const newIndex = tiers.indexOf(newTier);

  return newIndex < currentIndex;
}

/**
 * Stripe webhook event types for autopilot subscriptions
 */
export const AUTOPILOT_WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
] as const;

export type AutopilotWebhookEvent = typeof AUTOPILOT_WEBHOOK_EVENTS[number];
