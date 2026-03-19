// =============================================
// Apex Lead Autopilot - Social Platform Helpers
// Helper functions for social media platform operations
// =============================================

export type SocialPlatform = 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'x';

export type SocialPostStatus = 'draft' | 'scheduled' | 'posting' | 'posted' | 'failed' | 'canceled';

export interface EngagementMetrics {
  likes: number;
  shares: number;
  comments: number;
  clicks: number;
  impressions: number;
  reach: number;
}

/**
 * Get character limit for a specific platform
 */
export function getCharacterLimit(platform: SocialPlatform): number {
  const limits: Record<SocialPlatform, number> = {
    twitter: 280,
    x: 280,
    facebook: 63206, // Effectively unlimited
    instagram: 2200,
    linkedin: 3000,
  };

  return limits[platform];
}

/**
 * Validate post content against platform rules
 */
export function validatePostContent(
  content: string,
  platform: SocialPlatform
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check content length
  const limit = getCharacterLimit(platform);
  if (content.length > limit) {
    errors.push(`Post exceeds ${limit} character limit for ${platform}`);
  }

  // Check minimum length
  if (content.trim().length < 1) {
    errors.push('Post content cannot be empty');
  }

  // Platform-specific validations
  if (platform === 'instagram') {
    // Instagram posts should have hashtags or be descriptive
    if (content.length < 10 && !content.includes('#')) {
      errors.push('Instagram posts should be more descriptive or include hashtags');
    }
  }

  if (platform === 'linkedin') {
    // LinkedIn encourages professional content
    if (content.length < 20) {
      errors.push('LinkedIn posts should be at least 20 characters for better engagement');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get platform display name
 */
export function getPlatformDisplayName(platform: SocialPlatform): string {
  const names: Record<SocialPlatform, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
    x: 'X (Twitter)',
  };

  return names[platform];
}

/**
 * Get platform icon name (for use with icon libraries)
 */
export function getPlatformIcon(platform: SocialPlatform): string {
  const icons: Record<SocialPlatform, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'Linkedin',
    twitter: 'Twitter',
    x: 'Twitter', // Use Twitter icon for X
  };

  return icons[platform];
}

/**
 * Get platform color (for branding)
 */
export function getPlatformColor(platform: SocialPlatform): string {
  const colors: Record<SocialPlatform, string> = {
    facebook: '#1877F2',
    instagram: '#E4405F',
    linkedin: '#0A66C2',
    twitter: '#1DA1F2',
    x: '#000000',
  };

  return colors[platform];
}

/**
 * Format engagement metrics for display
 */
export function formatEngagementMetrics(metrics: Partial<EngagementMetrics>): string[] {
  const formatted: string[] = [];

  if (metrics.likes && metrics.likes > 0) {
    formatted.push(`${formatNumber(metrics.likes)} likes`);
  }
  if (metrics.shares && metrics.shares > 0) {
    formatted.push(`${formatNumber(metrics.shares)} shares`);
  }
  if (metrics.comments && metrics.comments > 0) {
    formatted.push(`${formatNumber(metrics.comments)} comments`);
  }
  if (metrics.clicks && metrics.clicks > 0) {
    formatted.push(`${formatNumber(metrics.clicks)} clicks`);
  }
  if (metrics.impressions && metrics.impressions > 0) {
    formatted.push(`${formatNumber(metrics.impressions)} impressions`);
  }
  if (metrics.reach && metrics.reach > 0) {
    formatted.push(`${formatNumber(metrics.reach)} reach`);
  }

  return formatted;
}

/**
 * Format large numbers with K, M, B suffixes
 */
function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Check if platform supports scheduling (all do for our purposes)
 */
export function canSchedulePost(platform: SocialPlatform): boolean {
  // For now, all platforms support scheduling in our system
  // In production, this would check if the platform API supports it
  return true;
}

/**
 * Get optimal posting times for platform
 */
export function getOptimalPostingTimes(platform: SocialPlatform): string[] {
  // These are general best practice times (in 24h format)
  const times: Record<SocialPlatform, string[]> = {
    facebook: ['13:00', '15:00', '19:00'],
    instagram: ['11:00', '13:00', '19:00', '20:00'],
    linkedin: ['08:00', '12:00', '17:00'],
    twitter: ['09:00', '12:00', '18:00'],
    x: ['09:00', '12:00', '18:00'],
  };

  return times[platform];
}

/**
 * Extract hashtags from post content
 */
export function extractHashtags(content: string): string[] {
  const hashtagRegex = /#[\w]+/g;
  const matches = content.match(hashtagRegex);
  return matches || [];
}

/**
 * Count characters (excluding URLs which are auto-shortened on some platforms)
 */
export function countCharacters(content: string, platform: SocialPlatform): number {
  let count = content.length;

  // Twitter/X auto-shortens URLs to 23 characters
  if (platform === 'twitter' || platform === 'x') {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex);
    if (urls) {
      urls.forEach((url) => {
        count = count - url.length + 23; // Twitter's t.co length
      });
    }
  }

  return count;
}

/**
 * Validate image for platform
 */
export function validateImage(
  imageUrl: string,
  platform: SocialPlatform
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic URL validation
  try {
    new URL(imageUrl);
  } catch {
    errors.push('Invalid image URL');
    return { valid: false, errors };
  }

  // Platform-specific image requirements
  // In production, you'd check actual image dimensions and file size
  if (platform === 'instagram') {
    // Instagram prefers square or vertical images
    // This is a placeholder - in production, fetch and check actual dimensions
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get status badge color
 */
export function getStatusColor(status: SocialPostStatus): string {
  const colors: Record<SocialPostStatus, string> = {
    draft: 'gray',
    scheduled: 'blue',
    posting: 'yellow',
    posted: 'green',
    failed: 'red',
    canceled: 'gray',
  };

  return colors[status];
}

/**
 * Get status display text
 */
export function getStatusDisplayText(status: SocialPostStatus): string {
  const text: Record<SocialPostStatus, string> = {
    draft: 'Draft',
    scheduled: 'Scheduled',
    posting: 'Posting...',
    posted: 'Posted',
    failed: 'Failed',
    canceled: 'Canceled',
  };

  return text[status];
}

/**
 * Check if post can be edited
 */
export function canEditPost(status: SocialPostStatus): boolean {
  return status === 'draft' || status === 'scheduled' || status === 'failed';
}

/**
 * Check if post can be deleted
 */
export function canDeletePost(status: SocialPostStatus): boolean {
  return status === 'draft' || status === 'scheduled' || status === 'failed';
}

/**
 * Check if post can be posted now
 */
export function canPostNow(status: SocialPostStatus): boolean {
  return status === 'draft' || status === 'scheduled';
}
