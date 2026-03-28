/**
 * Dual-Tree Utility Functions
 *
 * This file provides type-safe utilities for working with the MLM dual-tree system.
 *
 * CRITICAL CONCEPTS:
 *
 * 1. ENROLLMENT TREE (distributors.sponsor_id)
 *    - Represents who enrolled whom
 *    - Used for: L1 overrides (30%), team counting, enrollment relationships
 *    - Unlimited width (no position limit)
 *
 * 2. MATRIX TREE (distributors.matrix_parent_id)
 *    - Represents 5×7 forced matrix placement
 *    - Used for: L2-L5 overrides (varies by rank), spillover mechanics
 *    - Limited width: 5 positions per level
 *    - Includes spillover (not just your direct enrollees)
 *
 * THE IRON RULE: NEVER MIX THESE TREES!
 *
 * @module lib/genealogy/tree-utils
 */

import { createClient } from '@supabase/supabase-js';

// =============================================
// TYPES
// =============================================

export interface DistributorNode {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  slug: string;
  sponsor_id: string | null;
  matrix_parent_id: string | null;
  matrix_position: number | null;
  matrix_depth: number;
  status: string;
  created_at: string;
}

export interface EnrollmentChild extends DistributorNode {
  // Children fetched via sponsor_id (enrollment tree)
  // These are people this distributor personally enrolled
}

export interface MatrixChild extends DistributorNode {
  // Children fetched via matrix_parent_id (matrix tree)
  // These are people placed in matrix positions (may include spillover)
}

// =============================================
// ENROLLMENT TREE FUNCTIONS
// =============================================

/**
 * Get direct enrollees of a distributor (enrollment tree)
 *
 * Uses: distributors.sponsor_id
 * Returns: People this distributor personally enrolled
 *
 * Use this for:
 * - Team counting (personal recruits)
 * - L1 override calculations
 * - Enrollment reports
 * - Personal team displays
 *
 * @param distributorId - Distributor whose enrollees to fetch
 * @returns Array of directly enrolled distributors
 *
 * @example
 * ```typescript
 * // Get John's personal enrollees
 * const enrollees = await getEnrollmentChildren(johnId);
 * console.log(`John enrolled ${enrollees.length} people`);
 * ```
 */
export async function getEnrollmentChildren(
  distributorId: string
): Promise<EnrollmentChild[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { data, error } = await supabase
    .from('distributors')
    .select(`
      id,
      first_name,
      last_name,
      email,
      slug,
      sponsor_id,
      matrix_parent_id,
      matrix_position,
      matrix_depth,
      status,
      created_at
    `)
    .eq('sponsor_id', distributorId)
    .neq('status', 'deleted')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching enrollment children:', error);
    return [];
  }

  return (data || []) as EnrollmentChild[];
}

/**
 * Get enrollment sponsor (upline in enrollment tree)
 *
 * Uses: distributors.sponsor_id
 * Returns: Person who enrolled this distributor
 *
 * Use this for:
 * - Finding who gets L1 override (30%)
 * - Displaying enrollment upline
 * - Verification of enrollment relationships
 *
 * @param distributorId - Distributor whose sponsor to fetch
 * @returns Sponsor distributor or null if no sponsor
 *
 * @example
 * ```typescript
 * // Find who enrolled Jane
 * const sponsor = await getEnrollmentSponsor(janeId);
 * if (sponsor) {
 *   console.log(`${sponsor.first_name} gets L1 override on Jane's sales`);
 * }
 * ```
 */
export async function getEnrollmentSponsor(
  distributorId: string
): Promise<DistributorNode | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // First get the distributor to find their sponsor_id
  const { data: distributor, error: distError } = await supabase
    .from('distributors')
    .select('sponsor_id')
    .eq('id', distributorId)
    .single();

  if (distError || !distributor || !distributor.sponsor_id) {
    return null;
  }

  // Then fetch the sponsor
  const { data: sponsor, error: sponsorError } = await supabase
    .from('distributors')
    .select(`
      id,
      first_name,
      last_name,
      email,
      slug,
      sponsor_id,
      matrix_parent_id,
      matrix_position,
      matrix_depth,
      status,
      created_at
    `)
    .eq('id', distributor.sponsor_id)
    .single();

  if (sponsorError) {
    console.error('Error fetching enrollment sponsor:', sponsorError);
    return null;
  }

  return sponsor as DistributorNode;
}

/**
 * Count total personal enrollees (enrollment tree)
 *
 * Uses: distributors.sponsor_id
 * Returns: Count of people personally enrolled (not including their downline)
 *
 * @param distributorId - Distributor to count enrollees for
 * @returns Number of direct enrollees
 *
 * @example
 * ```typescript
 * const count = await countEnrollmentChildren(userId);
 * console.log(`You've enrolled ${count} people`);
 * ```
 */
export async function countEnrollmentChildren(
  distributorId: string
): Promise<number> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { count, error } = await supabase
    .from('distributors')
    .select('id', { count: 'exact', head: true })
    .eq('sponsor_id', distributorId)
    .neq('status', 'deleted');

  if (error) {
    console.error('Error counting enrollment children:', error);
    return 0;
  }

  return count || 0;
}

// =============================================
// MATRIX TREE FUNCTIONS
// =============================================

/**
 * Get matrix children (matrix tree)
 *
 * Uses: distributors.matrix_parent_id
 * Returns: People placed in matrix positions under this distributor
 *
 * IMPORTANT: This includes spillover! These may NOT be people you enrolled.
 *
 * Use this for:
 * - L2-L5 override calculations
 * - Matrix visualization
 * - Spillover tracking
 *
 * DO NOT use this for:
 * - Team counting (use getEnrollmentChildren instead)
 * - "Personal recruits" reporting (use getEnrollmentChildren instead)
 *
 * @param distributorId - Distributor whose matrix children to fetch
 * @returns Array of distributors in matrix positions (includes spillover)
 *
 * @example
 * ```typescript
 * // Get matrix positions under John
 * const matrixChildren = await getMatrixChildren(johnId);
 * // This may include people John didn't enroll (spillover from upline)
 * ```
 */
export async function getMatrixChildren(
  distributorId: string
): Promise<MatrixChild[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { data, error } = await supabase
    .from('distributors')
    .select(`
      id,
      first_name,
      last_name,
      email,
      slug,
      sponsor_id,
      matrix_parent_id,
      matrix_position,
      matrix_depth,
      status,
      created_at
    `)
    .eq('matrix_parent_id', distributorId)
    .neq('status', 'deleted')
    .order('matrix_position', { ascending: true });

  if (error) {
    console.error('Error fetching matrix children:', error);
    return [];
  }

  return (data || []) as MatrixChild[];
}

/**
 * Get matrix parent (upline in matrix tree)
 *
 * Uses: distributors.matrix_parent_id
 * Returns: Person above this distributor in matrix tree
 *
 * IMPORTANT: This may NOT be the person who enrolled you!
 *
 * Use this for:
 * - L2-L5 override calculations
 * - Matrix upline display
 * - Spillover chain tracking
 *
 * DO NOT use this for:
 * - Finding enrollment sponsor (use getEnrollmentSponsor instead)
 * - L1 override calculations (use getEnrollmentSponsor instead)
 *
 * @param distributorId - Distributor whose matrix parent to fetch
 * @returns Matrix parent or null if at top of tree
 *
 * @example
 * ```typescript
 * // Find matrix parent for L2-L5 override calculations
 * const matrixParent = await getMatrixParent(sellerId);
 * if (matrixParent) {
 *   // This person gets L2 override (if qualified)
 * }
 * ```
 */
export async function getMatrixParent(
  distributorId: string
): Promise<DistributorNode | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // First get the distributor to find their matrix_parent_id
  const { data: distributor, error: distError } = await supabase
    .from('distributors')
    .select('matrix_parent_id')
    .eq('id', distributorId)
    .single();

  if (distError || !distributor || !distributor.matrix_parent_id) {
    return null;
  }

  // Then fetch the matrix parent
  const { data: parent, error: parentError } = await supabase
    .from('distributors')
    .select(`
      id,
      first_name,
      last_name,
      email,
      slug,
      sponsor_id,
      matrix_parent_id,
      matrix_position,
      matrix_depth,
      status,
      created_at
    `)
    .eq('id', distributor.matrix_parent_id)
    .single();

  if (parentError) {
    console.error('Error fetching matrix parent:', parentError);
    return null;
  }

  return parent as DistributorNode;
}

/**
 * Walk up enrollment tree to root
 *
 * Uses: distributors.sponsor_id
 * Returns: All upline sponsors from this distributor to the root
 *
 * @param distributorId - Starting distributor
 * @param maxLevels - Maximum levels to walk up (default: 100)
 * @returns Array of upline distributors in order (immediate sponsor first)
 */
export async function walkEnrollmentTreeUp(
  distributorId: string,
  maxLevels: number = 100
): Promise<DistributorNode[]> {
  const upline: DistributorNode[] = [];
  let currentId: string | null = distributorId;
  let level = 0;

  while (currentId && level < maxLevels) {
    const sponsor = await getEnrollmentSponsor(currentId);
    if (!sponsor) break;

    upline.push(sponsor);
    currentId = sponsor.id;
    level++;
  }

  return upline;
}

/**
 * Walk up matrix tree to root
 *
 * Uses: distributors.matrix_parent_id
 * Returns: All upline matrix parents from this distributor to the root
 *
 * @param distributorId - Starting distributor
 * @param maxLevels - Maximum levels to walk up (default: 7 for 5×7 matrix)
 * @returns Array of upline distributors in order (immediate parent first)
 */
export async function walkMatrixTreeUp(
  distributorId: string,
  maxLevels: number = 7
): Promise<DistributorNode[]> {
  const upline: DistributorNode[] = [];
  let currentId: string | null = distributorId;
  let level = 0;

  while (currentId && level < maxLevels) {
    const parent = await getMatrixParent(currentId);
    if (!parent) break;

    upline.push(parent);
    currentId = parent.id;
    level++;
  }

  return upline;
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Check if distributor A is in distributor B's enrollment downline
 *
 * @param possibleDownlineId - Distributor who might be in downline
 * @param possibleUplineId - Distributor who might be upline
 * @returns true if possibleDownlineId is in possibleUplineId's enrollment downline
 */
export async function isInEnrollmentDownline(
  possibleDownlineId: string,
  possibleUplineId: string
): Promise<boolean> {
  const upline = await walkEnrollmentTreeUp(possibleDownlineId);
  return upline.some((dist) => dist.id === possibleUplineId);
}

/**
 * Check if distributor A is in distributor B's matrix downline
 *
 * @param possibleDownlineId - Distributor who might be in matrix downline
 * @param possibleUplineId - Distributor who might be matrix upline
 * @returns true if possibleDownlineId is in possibleUplineId's matrix downline
 */
export async function isInMatrixDownline(
  possibleDownlineId: string,
  possibleUplineId: string
): Promise<boolean> {
  const upline = await walkMatrixTreeUp(possibleDownlineId);
  return upline.some((dist) => dist.id === possibleUplineId);
}

// =============================================
// EXPORTS
// =============================================

export default {
  // Enrollment tree
  getEnrollmentChildren,
  getEnrollmentSponsor,
  countEnrollmentChildren,
  walkEnrollmentTreeUp,
  isInEnrollmentDownline,

  // Matrix tree
  getMatrixChildren,
  getMatrixParent,
  walkMatrixTreeUp,
  isInMatrixDownline,
};
