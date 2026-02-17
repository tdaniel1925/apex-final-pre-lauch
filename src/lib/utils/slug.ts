// =============================================
// Slug Utilities
// For generating and validating distributor slugs
// =============================================

import { RESERVED_SLUGS, slugSchema } from '@/lib/validations/signup';
import { createClient } from '@/lib/supabase/server';

/**
 * Generates a slug from a name
 *
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Generated slug (e.g., "john-doe")
 *
 * @example
 * generateSlug("John", "Doe") // "john-doe"
 * generateSlug("Mary-Jane", "O'Brien") // "mary-jane-obrien"
 */
export function generateSlug(firstName: string, lastName: string): string {
  const combined = `${firstName} ${lastName}`
    .toLowerCase()
    .trim()
    // Remove special characters except spaces and hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');

  return combined;
}

/**
 * Validates slug format (client-side)
 *
 * @param slug - The slug to validate
 * @returns Validation result with error message if invalid
 */
export function validateSlugFormat(slug: string): {
  valid: boolean;
  error?: string;
} {
  try {
    slugSchema.parse(slug);
    return { valid: true };
  } catch (error: any) {
    return {
      valid: false,
      error: error.errors?.[0]?.message || 'Invalid username format',
    };
  }
}

/**
 * Checks if a slug is reserved
 *
 * @param slug - The slug to check
 * @returns True if reserved
 */
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug as any);
}

/**
 * Checks if a slug is available in the database
 *
 * @param slug - The slug to check
 * @returns True if available (not taken)
 */
export async function checkSlugAvailability(
  slug: string
): Promise<boolean> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('distributors')
      .select('slug')
      .eq('slug', slug.toLowerCase())
      .single();

    // If error with code PGRST116, it means no rows found (available)
    if (error && error.code === 'PGRST116') {
      return true; // Available
    }

    // If data exists, slug is taken
    if (data) {
      return false; // Taken
    }

    // No error and no data = available
    return true;
  } catch (error) {
    console.error('Error checking slug availability:', error);
    // On error, assume not available (safer)
    return false;
  }
}

/**
 * Suggests alternative slugs if the desired one is taken
 *
 * @param baseSlug - The original slug attempt
 * @returns Array of suggested alternatives
 *
 * @example
 * suggestAlternativeSlugs("johndoe")
 * // ["johndoe2", "johndoe3", "johndoe123", "j-doe"]
 */
export function suggestAlternativeSlugs(baseSlug: string): string[] {
  const suggestions: string[] = [];

  // Numeric suffixes
  suggestions.push(`${baseSlug}2`);
  suggestions.push(`${baseSlug}3`);
  suggestions.push(`${baseSlug}${Math.floor(Math.random() * 1000)}`);

  // If slug has parts, try variations
  const parts = baseSlug.split('-');
  if (parts.length > 1) {
    // First initial + last name
    suggestions.push(`${parts[0][0]}-${parts[parts.length - 1]}`);
    // First name + last initial
    suggestions.push(`${parts[0]}-${parts[parts.length - 1][0]}`);
  }

  // Remove duplicates and filter invalid
  return Array.from(new Set(suggestions)).filter((slug) => {
    const validation = validateSlugFormat(slug);
    return validation.valid && !isReservedSlug(slug);
  });
}
