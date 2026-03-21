/**
 * Meeting slug generator utility
 * Generates URL-safe slugs from meeting titles with uniqueness checking
 */

import { createServiceClient } from '@/lib/supabase/service';

/**
 * Convert a string to a URL-safe slug
 * @param text - Text to slugify
 * @returns URL-safe slug (lowercase, hyphens, no special characters)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove all non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Replace multiple consecutive hyphens with a single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Truncate to 80 characters max
    .substring(0, 80);
}

/**
 * Generate a random string suffix
 * @param length - Length of random string (default: 4)
 * @returns Random lowercase alphanumeric string
 */
export function generateRandomSuffix(length: number = 4): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if a slug exists for a distributor
 * @param distributorId - ID of the distributor
 * @param slug - Slug to check
 * @param excludeMeetingId - Optional meeting ID to exclude (for updates)
 * @returns True if slug exists, false otherwise
 */
export async function slugExists(
  distributorId: string,
  slug: string,
  excludeMeetingId?: string
): Promise<boolean> {
  const supabase = createServiceClient();

  let query = supabase
    .from('meeting_events')
    .select('id')
    .eq('distributor_id', distributorId)
    .eq('registration_slug', slug);

  // Exclude specific meeting ID (for update operations)
  if (excludeMeetingId) {
    query = query.neq('id', excludeMeetingId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('[Slug Check] Error checking slug existence:', error);
    return false;
  }

  return data !== null;
}

/**
 * Generate a unique slug for a meeting
 * @param distributorId - ID of the distributor
 * @param title - Meeting title to generate slug from
 * @param excludeMeetingId - Optional meeting ID to exclude (for updates)
 * @returns Unique slug for the meeting
 */
export async function generateUniqueSlug(
  distributorId: string,
  title: string,
  excludeMeetingId?: string
): Promise<string> {
  // Generate base slug from title
  const baseSlug = slugify(title);

  if (!baseSlug) {
    // Fallback if title produces empty slug
    return `meeting-${generateRandomSuffix(8)}`;
  }

  // Check if base slug is available
  const isBaseSlugTaken = await slugExists(distributorId, baseSlug, excludeMeetingId);

  if (!isBaseSlugTaken) {
    return baseSlug;
  }

  // Base slug is taken, try with suffixes
  const maxAttempts = 10;
  for (let i = 0; i < maxAttempts; i++) {
    const suffix = generateRandomSuffix(4);
    const slugWithSuffix = `${baseSlug}-${suffix}`;

    const isTaken = await slugExists(distributorId, slugWithSuffix, excludeMeetingId);

    if (!isTaken) {
      return slugWithSuffix;
    }
  }

  // Fallback: use timestamp-based suffix (guaranteed unique)
  const timestampSuffix = Date.now().toString(36);
  return `${baseSlug}-${timestampSuffix}`;
}

/**
 * Validate slug format
 * @param slug - Slug to validate
 * @returns True if slug is valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  // Must be 3-100 characters, lowercase letters, numbers, and hyphens only
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 100;
}

/**
 * Suggest alternative slugs if provided slug is taken
 * @param distributorId - ID of the distributor
 * @param slug - Original slug that was taken
 * @param count - Number of suggestions to generate (default: 3)
 * @returns Array of alternative slug suggestions
 */
export async function suggestAlternativeSlugs(
  distributorId: string,
  slug: string,
  count: number = 3
): Promise<string[]> {
  const suggestions: string[] = [];

  for (let i = 0; i < count; i++) {
    const suffix = generateRandomSuffix(4);
    const alternative = `${slug}-${suffix}`;

    // Verify it's available
    const isTaken = await slugExists(distributorId, alternative);
    if (!isTaken) {
      suggestions.push(alternative);
    }
  }

  return suggestions;
}
