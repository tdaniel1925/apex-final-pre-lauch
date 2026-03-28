/**
 * Organization Validation Middleware
 *
 * Prevents cross-organization data access by validating that the current user
 * and the target user belong to the same organization.
 *
 * An organization is defined by its root distributor - the top of the enrollment
 * tree (where sponsor_id IS NULL). All distributors in the same organization
 * share the same organization root.
 *
 * Security Fix #1: Addresses cross-organization access vulnerability
 * See: SECURITY-FIX-1-ORG-VALIDATION-PLAN.md
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Gets the organization root ID for a distributor by walking up the sponsor chain
 *
 * @param distributorId - The distributor ID to find the root for
 * @returns The organization root distributor ID, or null if not found
 */
async function getOrganizationRootId(
  distributorId: string
): Promise<string | null> {
  const supabase = await createClient();

  let currentId = distributorId;
  let depth = 0;
  const maxDepth = 50; // Safety limit to prevent infinite loops

  while (depth < maxDepth) {
    const { data, error } = await supabase
      .from('distributors')
      .select('id, sponsor_id')
      .eq('id', currentId)
      .single();

    if (error || !data) {
      console.error('[org-validation] Failed to fetch distributor:', error);
      return null;
    }

    // If sponsor_id is null, this distributor IS the organization root
    if (!data.sponsor_id) {
      return data.id;
    }

    // Move up to sponsor
    currentId = data.sponsor_id;
    depth++;
  }

  console.error('[org-validation] Exceeded max depth while finding org root');
  return null;
}

/**
 * Validates that current user and target user are in the same organization
 *
 * @param currentDistributorId - The logged-in user's distributor ID
 * @param targetDistributorId - The distributor ID being accessed
 * @returns Object with validation result and optional error message
 *
 * @example
 * ```typescript
 * const { valid, error } = await validateOrganizationAccess(
 *   currentUser.distributor_id,
 *   requestedUser.distributor_id
 * );
 *
 * if (!valid) {
 *   return NextResponse.json({ error }, { status: 403 });
 * }
 * ```
 */
export async function validateOrganizationAccess(
  currentDistributorId: string,
  targetDistributorId: string
): Promise<{ valid: boolean; error?: string }> {
  // Same distributor = always allowed
  if (currentDistributorId === targetDistributorId) {
    return { valid: true };
  }

  // Get organization root for both distributors
  const [currentOrgRoot, targetOrgRoot] = await Promise.all([
    getOrganizationRootId(currentDistributorId),
    getOrganizationRootId(targetDistributorId),
  ]);

  // Check if either lookup failed
  if (!currentOrgRoot || !targetOrgRoot) {
    console.error('[org-validation] Failed to determine organization membership', {
      currentDistributorId,
      targetDistributorId,
      currentOrgRoot,
      targetOrgRoot,
    });
    return {
      valid: false,
      error: 'Failed to determine organization membership',
    };
  }

  // Check if same organization
  if (currentOrgRoot !== targetOrgRoot) {
    console.warn('[org-validation] Cross-organization access attempt blocked', {
      currentDistributorId,
      currentOrgRoot,
      targetDistributorId,
      targetOrgRoot,
    });
    return {
      valid: false,
      error: 'Access denied: Cross-organization access not permitted',
    };
  }

  return { valid: true };
}

/**
 * Gets the current authenticated user's distributor ID
 *
 * This is a convenience function that combines authentication check
 * and distributor lookup. Used as the first step in most API routes.
 *
 * @returns Object with distributor ID or error message
 *
 * @example
 * ```typescript
 * export async function GET() {
 *   const { distributorId, error } = await getCurrentDistributorId();
 *
 *   if (error || !distributorId) {
 *     return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
 *   }
 *
 *   // Proceed with authenticated request...
 * }
 * ```
 */
export async function getCurrentDistributorId(): Promise<{
  distributorId: string | null;
  error?: string;
}> {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { distributorId: null, error: 'Unauthorized' };
  }

  // Get distributor record
  const { data: distributor, error: distError } = await supabase
    .from('distributors')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (distError || !distributor) {
    console.error('[org-validation] Distributor record not found for user:', user.id);
    return { distributorId: null, error: 'Distributor record not found' };
  }

  return { distributorId: distributor.id };
}
