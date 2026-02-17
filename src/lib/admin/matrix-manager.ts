// =============================================
// Matrix Manager Service
// Matrix visualization, placement, and management
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import { logAdminActivity, AdminActions } from './activity-logger';
import type { Distributor } from '@/lib/types';

export interface MatrixNode {
  distributor: Distributor;
  children: MatrixNode[];
  availableSlots: number;
}

export interface MatrixLevelData {
  level: number;
  distributors: Distributor[];
  totalPositions: number;
  filledPositions: number;
  availableSlots: number;
}

export interface MatrixStats {
  totalPositions: number;
  filledPositions: number;
  availablePositions: number;
  maxDepth: number;
  byLevel: Array<{
    level: number;
    count: number;
    activeCount: number;
  }>;
}

/**
 * Get complete matrix tree structure
 */
export async function getMatrixTree(rootId?: string): Promise<MatrixNode | null> {
  const serviceClient = createServiceClient();

  // Get root (master or specified distributor)
  let root: Distributor | null;

  if (rootId) {
    const { data } = await serviceClient
      .from('distributors')
      .select('*')
      .eq('id', rootId)
      .single();
    root = data;
  } else {
    // Get master as root
    const { data } = await serviceClient
      .from('distributors')
      .select('*')
      .eq('is_master', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    root = data;
  }

  if (!root) return null;

  return buildMatrixNode(root);
}

/**
 * Recursively build matrix tree node
 */
async function buildMatrixNode(distributor: Distributor): Promise<MatrixNode> {
  const serviceClient = createServiceClient();

  // Get direct children
  const { data: children } = await serviceClient
    .from('distributors')
    .select('*')
    .eq('matrix_parent_id', distributor.id)
    .neq('status', 'deleted')
    .order('matrix_position', { ascending: true });

  const childNodes = await Promise.all(
    (children || []).map((child) => buildMatrixNode(child))
  );

  const availableSlots = 5 - (children?.length || 0);

  return {
    distributor,
    children: childNodes,
    availableSlots,
  };
}

/**
 * Get distributors at a specific matrix level
 */
export async function getMatrixLevel(level: number): Promise<MatrixLevelData> {
  const serviceClient = createServiceClient();

  const { data: distributors } = await serviceClient
    .from('distributors')
    .select('*')
    .eq('matrix_depth', level)
    .neq('status', 'deleted')
    .order('matrix_position', { ascending: true });

  const maxPositions = Math.pow(5, level); // 5^level
  const filled = distributors?.length || 0;

  return {
    level,
    distributors: distributors || [],
    totalPositions: maxPositions,
    filledPositions: filled,
    availableSlots: maxPositions - filled,
  };
}

/**
 * Get matrix statistics
 */
export async function getMatrixStatistics(): Promise<MatrixStats> {
  const serviceClient = createServiceClient();

  const { data } = await serviceClient.rpc('get_matrix_statistics');

  return data || {
    totalPositions: 0,
    filledPositions: 0,
    availablePositions: 0,
    maxDepth: 0,
    byLevel: [],
  };
}

/**
 * Find available positions for placement
 */
export async function findAvailablePositions(maxResults: number = 20): Promise<
  Array<{
    distributor: Distributor;
    availableSlots: number;
  }>
> {
  const serviceClient = createServiceClient();

  // Get distributors with available slots
  const { data: distributors } = await serviceClient
    .from('distributors')
    .select('*')
    .neq('status', 'deleted')
    .order('matrix_depth', { ascending: true })
    .order('matrix_position', { ascending: true })
    .limit(100); // Get more than needed to filter

  if (!distributors) return [];

  // Calculate available slots for each
  const withSlots = await Promise.all(
    distributors.map(async (dist) => {
      const { count } = await serviceClient
        .from('distributors')
        .select('*', { count: 'exact', head: true })
        .eq('matrix_parent_id', dist.id)
        .neq('status', 'deleted');

      return {
        distributor: dist,
        availableSlots: 5 - (count || 0),
      };
    })
  );

  // Filter to only those with available slots and limit results
  return withSlots.filter((item) => item.availableSlots > 0).slice(0, maxResults);
}

/**
 * Manually place distributor in matrix
 */
export async function placeDistributor(
  distributorId: string,
  parentId: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  const serviceClient = createServiceClient();

  // Validate parent has space
  const { count } = await serviceClient
    .from('distributors')
    .select('*', { count: 'exact', head: true })
    .eq('matrix_parent_id', parentId)
    .neq('status', 'deleted');

  if (count && count >= 5) {
    return { success: false, error: 'Parent position is full (max 5 children)' };
  }

  // Get parent info for depth calculation
  const { data: parent } = await serviceClient
    .from('distributors')
    .select('matrix_depth, matrix_position')
    .eq('id', parentId)
    .single();

  if (!parent) {
    return { success: false, error: 'Parent not found' };
  }

  // Calculate new position
  const newDepth = (parent.matrix_depth || 0) + 1;
  const newPosition = (count || 0) + 1;

  // Update distributor
  const { error } = await serviceClient
    .from('distributors')
    .update({
      matrix_parent_id: parentId,
      matrix_depth: newDepth,
      matrix_position: newPosition,
    })
    .eq('id', distributorId);

  if (error) {
    console.error('Error placing distributor:', error);
    return { success: false, error: 'Failed to place distributor' };
  }

  // Log activity
  await logAdminActivity({
    adminId,
    action: 'matrix.place',
    targetType: 'distributor',
    targetId: distributorId,
    details: {
      parent_id: parentId,
      new_depth: newDepth,
      new_position: newPosition,
    },
  });

  return { success: true };
}

/**
 * Move distributor to different position
 */
export async function moveDistributor(
  distributorId: string,
  newParentId: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  const serviceClient = createServiceClient();

  // Validate move is possible
  const { data: canMove, error: validateError } = await serviceClient.rpc(
    'can_move_to_position',
    {
      dist_id: distributorId,
      new_parent_id: newParentId,
    }
  );

  if (validateError || !canMove) {
    return {
      success: false,
      error: 'Cannot move to this position (full or would create cycle)',
    };
  }

  // Get old position for logging
  const { data: oldData } = await serviceClient
    .from('distributors')
    .select('matrix_parent_id, matrix_depth, matrix_position')
    .eq('id', distributorId)
    .single();

  // Get new parent info
  const { data: newParent } = await serviceClient
    .from('distributors')
    .select('matrix_depth')
    .eq('id', newParentId)
    .single();

  if (!newParent) {
    return { success: false, error: 'New parent not found' };
  }

  // Count children of new parent
  const { count } = await serviceClient
    .from('distributors')
    .select('*', { count: 'exact', head: true })
    .eq('matrix_parent_id', newParentId)
    .neq('status', 'deleted');

  const newDepth = (newParent.matrix_depth || 0) + 1;
  const newPosition = (count || 0) + 1;

  // Perform move
  const { error } = await serviceClient
    .from('distributors')
    .update({
      matrix_parent_id: newParentId,
      matrix_depth: newDepth,
      matrix_position: newPosition,
    })
    .eq('id', distributorId);

  if (error) {
    console.error('Error moving distributor:', error);
    return { success: false, error: 'Failed to move distributor' };
  }

  // Log activity
  await logAdminActivity({
    adminId,
    action: 'matrix.move',
    targetType: 'distributor',
    targetId: distributorId,
    details: {
      old_parent_id: oldData?.matrix_parent_id,
      new_parent_id: newParentId,
      old_depth: oldData?.matrix_depth,
      new_depth: newDepth,
    },
  });

  return { success: true };
}

/**
 * Lock/unlock distributor position
 */
export async function togglePositionLock(
  distributorId: string,
  adminId: string,
  lock: boolean
): Promise<{ success: boolean; error?: string }> {
  const serviceClient = createServiceClient();

  const updates: any = {
    position_locked: lock,
  };

  if (lock) {
    updates.position_locked_by = adminId;
    updates.position_locked_at = new Date().toISOString();
  } else {
    updates.position_locked_by = null;
    updates.position_locked_at = null;
  }

  const { error } = await serviceClient
    .from('distributors')
    .update(updates)
    .eq('id', distributorId);

  if (error) {
    console.error('Error toggling position lock:', error);
    return { success: false, error: 'Failed to toggle position lock' };
  }

  // Log activity
  await logAdminActivity({
    adminId,
    action: lock ? 'matrix.lock_position' : 'matrix.unlock_position',
    targetType: 'distributor',
    targetId: distributorId,
  });

  return { success: true };
}
