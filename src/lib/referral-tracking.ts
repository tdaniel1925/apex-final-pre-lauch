import { createClient } from '@/lib/supabase/client';
import { cookies } from 'next/headers';

const REFERRER_COOKIE_NAME = 'apex_referrer_slug';
const REFERRER_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Validates that a distributor slug exists in the database
 * @param slug - The distributor slug to validate
 * @returns Promise<boolean> - True if valid, false otherwise
 */
export async function validateDistributorSlug(slug: string): Promise<boolean> {
  if (!slug || typeof slug !== 'string') {
    return false;
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from('distributors')
    .select('id, slug')
    .eq('slug', slug.toLowerCase())
    .single();

  if (error || !data) {
    return false;
  }

  return true;
}

/**
 * Gets the distributor ID from a slug
 * @param slug - The distributor slug
 * @returns Promise<string | null> - The distributor ID or null if not found
 */
export async function getDistributorIdBySlug(slug: string): Promise<string | null> {
  if (!slug || typeof slug !== 'string') {
    return null;
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from('distributors')
    .select('id')
    .eq('slug', slug.toLowerCase())
    .single();

  if (error || !data) {
    return null;
  }

  return data.id;
}

/**
 * Sets the referrer slug in a cookie (server-side)
 * @param slug - The referrer's distributor slug
 */
export async function setReferrerCookie(slug: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(REFERRER_COOKIE_NAME, slug.toLowerCase(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFERRER_COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Gets the referrer slug from cookies (server-side)
 * @returns Promise<string | null> - The referrer slug or null if not set
 */
export async function getReferrerCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const referrerCookie = cookieStore.get(REFERRER_COOKIE_NAME);

  return referrerCookie?.value || null;
}

/**
 * Clears the referrer cookie (server-side)
 */
export async function clearReferrerCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(REFERRER_COOKIE_NAME);
}

/**
 * Client-side cookie management
 */
export const clientReferralTracking = {
  /**
   * Sets the referrer slug in a cookie (client-side)
   * @param slug - The referrer's distributor slug
   */
  setReferrer(slug: string): void {
    if (typeof document === 'undefined') return;

    const maxAge = REFERRER_COOKIE_MAX_AGE;
    const secure = window.location.protocol === 'https:';

    document.cookie = `${REFERRER_COOKIE_NAME}=${encodeURIComponent(slug.toLowerCase())}; max-age=${maxAge}; path=/; samesite=lax${secure ? '; secure' : ''}`;
  },

  /**
   * Gets the referrer slug from cookies (client-side)
   * @returns string | null - The referrer slug or null if not set
   */
  getReferrer(): string | null {
    if (typeof document === 'undefined') return null;

    const match = document.cookie.match(new RegExp(`(^| )${REFERRER_COOKIE_NAME}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  },

  /**
   * Clears the referrer cookie (client-side)
   */
  clearReferrer(): void {
    if (typeof document === 'undefined') return;

    document.cookie = `${REFERRER_COOKIE_NAME}=; max-age=0; path=/`;
  },
};

/**
 * Tracks a referral by storing the slug and validating it
 * @param slug - The distributor slug from the URL
 * @returns Promise<{ success: boolean; distributorId?: string; error?: string }>
 */
export async function trackReferral(slug: string): Promise<{
  success: boolean;
  distributorId?: string;
  error?: string
}> {
  // Validate the slug exists in the database
  const isValid = await validateDistributorSlug(slug);

  if (!isValid) {
    return {
      success: false,
      error: 'Invalid distributor slug',
    };
  }

  // Get the distributor ID
  const distributorId = await getDistributorIdBySlug(slug);

  if (!distributorId) {
    return {
      success: false,
      error: 'Distributor not found',
    };
  }

  // Store in cookie
  await setReferrerCookie(slug);

  return {
    success: true,
    distributorId,
  };
}
