/**
 * Tech Ladder Matrix - Spillover Placement Algorithm
 *
 * Implements breadth-first search for finding next available position
 * in the 5×7 forced matrix structure.
 *
 * REF: MATRIX-SPILLOVER-ALGORITHM.md
 *
 * @module lib/matrix/placement-algorithm
 */

import { createClient } from '@/lib/supabase/server';

// =============================================
// TYPES
// =============================================

export interface MatrixPlacement {
  parent_id: string;
  position: number; // 1-5
  depth: number; // 0-7
}

export interface MatrixNode {
  member_id: string;
  matrix_parent_id: string | null;
  matrix_position: number | null;
  matrix_depth: number;
  full_name: string;
}

export interface PlacementResult {
  success: boolean;
  placement?: MatrixPlacement;
  error?: string;
}

// =============================================
// CONSTANTS
// =============================================

/**
 * Matrix width (positions per level)
 */
const MATRIX_WIDTH = 5;

/**
 * Maximum matrix depth (0 = root, 1-7 = levels)
 */
const MAX_DEPTH = 7;

// =============================================
// CORE PLACEMENT FUNCTIONS
// =============================================

/**
 * Find next available position in matrix starting from sponsor
 *
 * Uses breadth-first search to find the shallowest available position.
 * Algorithm: Left-to-right, top-to-bottom placement.
 *
 * @param sponsorId - Member ID of the sponsor (enroller)
 * @returns MatrixPlacement or null if matrix is full
 *
 * @example
 * ```typescript
 * const placement = await findNextAvailablePosition('sponsor-uuid');
 * if (placement) {
 *   // Place new member at placement.parent_id, position placement.position
 * }
 * ```
 */
export async function findNextAvailablePosition(
  sponsorId: string
): Promise<MatrixPlacement | null> {
  const supabase = await createClient();

  // Initialize queue with sponsor
  const queue: Array<{ member_id: string; depth: number }> = [
    { member_id: sponsorId, depth: 0 },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Get all children of current node
    const { data: children, error } = await supabase
      .from('members')
      .select('member_id, matrix_position, matrix_depth, full_name')
      .eq('matrix_parent_id', current.member_id)
      .eq('status', 'active')
      .order('matrix_position', { ascending: true });

    if (error) {
      console.error('Error querying matrix children:', error);
      return null;
    }

    // Check if this node has available positions (less than 5 children)
    if (!children || children.length < MATRIX_WIDTH) {
      // Found an open position!
      const nextPosition = children ? children.length + 1 : 1;

      return {
        parent_id: current.member_id,
        position: nextPosition,
        depth: current.depth + 1,
      };
    }

    // All 5 positions filled, add children to queue (if not at max depth)
    if (current.depth + 1 < MAX_DEPTH) {
      for (const child of children) {
        queue.push({
          member_id: child.member_id,
          depth: current.depth + 1,
        });
      }
    }
  }

  // Matrix is full (all 19,531 positions filled!)
  return null;
}

/**
 * Place a new member in the matrix
 *
 * @param memberId - New member to place
 * @param sponsorId - Sponsor (enroller) who recruited them
 * @returns PlacementResult with success status and placement details
 */
export async function placeNewMemberInMatrix(
  memberId: string,
  sponsorId: string
): Promise<PlacementResult> {
  try {
    // Find next available position
    const placement = await findNextAvailablePosition(sponsorId);

    if (!placement) {
      return {
        success: false,
        error: 'Matrix is full (all 19,531 positions filled)',
      };
    }

    // Update member with matrix placement
    const supabase = await createClient();
    const { error } = await supabase
      .from('members')
      .update({
        matrix_parent_id: placement.parent_id,
        matrix_position: placement.position,
        matrix_depth: placement.depth,
        updated_at: new Date().toISOString(),
      })
      .eq('member_id', memberId);

    if (error) {
      return {
        success: false,
        error: `Failed to update member: ${error.message}`,
      };
    }

    return {
      success: true,
      placement,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get all matrix children for a member (direct downline in matrix)
 *
 * @param memberId - Member ID
 * @returns Array of matrix children (max 5)
 */
export async function getMatrixChildren(
  memberId: string
): Promise<MatrixNode[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('members')
    .select('member_id, matrix_parent_id, matrix_position, matrix_depth, full_name')
    .eq('matrix_parent_id', memberId)
    .eq('status', 'active')
    .order('matrix_position', { ascending: true });

  if (error) {
    console.error('Error fetching matrix children:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if a member's matrix positions are full (all 5 positions filled)
 *
 * @param memberId - Member ID
 * @returns true if all 5 positions filled
 */
export async function isMatrixPositionFull(memberId: string): Promise<boolean> {
  const children = await getMatrixChildren(memberId);
  return children.length >= MATRIX_WIDTH;
}

/**
 * Get matrix level information (how many members at each level)
 *
 * @param rootMemberId - Root member ID (usually the viewing member)
 * @returns Object with member counts per level
 */
export async function getMatrixLevelCounts(
  rootMemberId: string
): Promise<Record<number, number>> {
  const supabase = await createClient();

  // Get all members in this matrix tree
  const { data, error } = await supabase.rpc('get_matrix_downline', {
    root_member_id: rootMemberId,
  });

  if (error || !data) {
    console.error('Error fetching matrix downline:', error);
    return {};
  }

  // Count members per level
  const counts: Record<number, number> = {};
  for (const member of data) {
    const level = member.matrix_depth;
    counts[level] = (counts[level] || 0) + 1;
  }

  return counts;
}

// =============================================
// MATRIX STATISTICS
// =============================================

/**
 * Calculate matrix statistics for a member
 *
 * @param memberId - Member ID
 * @returns Statistics object
 */
export async function getMatrixStatistics(memberId: string): Promise<{
  total_downline: number;
  positions_filled: number;
  positions_available: number;
  deepest_level: number;
  level_counts: Record<number, number>;
}> {
  const supabase = await createClient();

  // Get total downline count
  const { count: totalDownline, error: countError } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .or(`matrix_parent_id.eq.${memberId}`);

  if (countError) {
    console.error('Error counting downline:', countError);
  }

  // Get level counts
  const levelCounts = await getMatrixLevelCounts(memberId);

  // Calculate deepest level
  const deepestLevel = Math.max(0, ...Object.keys(levelCounts).map(Number));

  // Calculate filled vs available positions
  const positionsFilled = totalDownline || 0;

  // Maximum positions based on deepest level
  // Level 0: 1, Level 1: 5, Level 2: 25, Level 3: 125, etc.
  const maxPositions = Array.from({ length: deepestLevel + 1 }, (_, i) =>
    Math.pow(MATRIX_WIDTH, i)
  ).reduce((sum, val) => sum + val, 0);

  const positionsAvailable = maxPositions - positionsFilled;

  return {
    total_downline: positionsFilled,
    positions_filled: positionsFilled,
    positions_available: positionsAvailable,
    deepest_level: deepestLevel,
    level_counts: levelCounts,
  };
}

// =============================================
// MATRIX VALIDATION
// =============================================

/**
 * Validate matrix placement is legal
 *
 * @param placement - Proposed placement
 * @returns Validation result with error message if invalid
 */
export async function validateMatrixPlacement(
  placement: MatrixPlacement
): Promise<{ valid: boolean; error?: string }> {
  // Check depth is within bounds
  if (placement.depth < 1 || placement.depth > MAX_DEPTH) {
    return {
      valid: false,
      error: `Invalid depth ${placement.depth}. Must be between 1 and ${MAX_DEPTH}`,
    };
  }

  // Check position is within bounds
  if (placement.position < 1 || placement.position > MATRIX_WIDTH) {
    return {
      valid: false,
      error: `Invalid position ${placement.position}. Must be between 1 and ${MATRIX_WIDTH}`,
    };
  }

  // Check parent exists
  const supabase = await createClient();
  const { data: parent, error: parentError } = await supabase
    .from('members')
    .select('member_id, matrix_depth')
    .eq('member_id', placement.parent_id)
    .single();

  if (parentError || !parent) {
    return {
      valid: false,
      error: 'Parent member not found',
    };
  }

  // Check depth matches parent depth + 1
  if (parent.matrix_depth !== placement.depth - 1) {
    return {
      valid: false,
      error: `Depth mismatch. Parent is at depth ${parent.matrix_depth}, child should be at depth ${parent.matrix_depth + 1}`,
    };
  }

  // Check position is not already occupied
  const { data: existing, error: existingError } = await supabase
    .from('members')
    .select('member_id')
    .eq('matrix_parent_id', placement.parent_id)
    .eq('matrix_position', placement.position)
    .single();

  if (existing && !existingError) {
    return {
      valid: false,
      error: `Position ${placement.position} is already occupied`,
    };
  }

  return { valid: true };
}

// =============================================
// EXPORTS
// =============================================

export default {
  findNextAvailablePosition,
  placeNewMemberInMatrix,
  getMatrixChildren,
  isMatrixPositionFull,
  getMatrixLevelCounts,
  getMatrixStatistics,
  validateMatrixPlacement,
  MATRIX_WIDTH,
  MAX_DEPTH,
};
