// =============================================
// Matrix Placement Module
// BFS-based auto-placement in 5×7 forced matrix
// =============================================

import { createClient } from '@/lib/supabase/server';
import type { Distributor } from '@/lib/types';

/**
 * Matrix placement result from BFS algorithm
 */
export interface MatrixPlacement {
  parent_id: string;
  matrix_position: number; // 1-5
  matrix_depth: number; // 1-7
}

/**
 * Finds the next available slot in the matrix using BFS
 *
 * @param sponsorId - The distributor who referred the new member (optional, uses master if null)
 * @returns MatrixPlacement with parent_id, position, and depth
 * @throws Error if matrix is full or sponsor not found
 *
 * @example
 * ```typescript
 * const placement = await findMatrixPlacement(sponsorId);
 * // { parent_id: 'xxx', matrix_position: 3, matrix_depth: 2 }
 * ```
 */
export async function findMatrixPlacement(
  sponsorId: string | null = null
): Promise<MatrixPlacement> {
  const supabase = await createClient();

  try {
    // Call the PostgreSQL function via RPC
    const { data, error } = await supabase.rpc('find_matrix_placement', {
      p_sponsor_id: sponsorId,
    });

    if (error) {
      console.error('Matrix placement error:', error);
      throw new Error(`Failed to find matrix placement: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('No available slots in matrix');
    }

    // PostgreSQL function returns array with single row
    const placement = data[0] as MatrixPlacement;

    return placement;
  } catch (error) {
    console.error('Error in findMatrixPlacement:', error);
    throw error;
  }
}

/**
 * Places a distributor in the matrix
 *
 * Updates the distributor record with matrix placement info
 *
 * @param distributorId - The distributor to place
 * @param sponsorId - Who referred them (optional, uses master if null)
 * @returns Updated distributor record
 * @throws Error if placement fails
 *
 * @example
 * ```typescript
 * await placeDistributor(newDistributorId, sponsorId);
 * ```
 */
export async function placeDistributor(
  distributorId: string,
  sponsorId: string | null = null
): Promise<Distributor> {
  const supabase = await createClient();

  try {
    // Step 1: Find placement
    const placement = await findMatrixPlacement(sponsorId);

    // Step 2: Update distributor record
    const { data, error } = await supabase
      .from('distributors')
      .update({
        sponsor_id: sponsorId,
        matrix_parent_id: placement.parent_id,
        matrix_position: placement.matrix_position,
        matrix_depth: placement.matrix_depth,
      })
      .eq('id', distributorId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update distributor placement:', error);
      throw new Error(`Failed to place distributor: ${error.message}`);
    }

    if (!data) {
      throw new Error('Distributor not found');
    }

    return data as Distributor;
  } catch (error) {
    console.error('Error in placeDistributor:', error);
    throw error;
  }
}

/**
 * Gets the available slot count for a distributor
 *
 * @param parentId - The distributor to check
 * @returns Number of available slots (0-5)
 */
export async function getAvailableSlots(
  parentId: string
): Promise<number> {
  const supabase = await createClient();

  try {
    const { count, error } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .eq('matrix_parent_id', parentId);

    if (error) {
      console.error('Error counting children:', error);
      return 0;
    }

    const maxChildren = 5;
    return maxChildren - (count || 0);
  } catch (error) {
    console.error('Error in getAvailableSlots:', error);
    return 0;
  }
}

/**
 * Checks if a distributor can have more children
 *
 * @param parentId - The distributor to check
 * @returns True if has available slots
 */
export async function canAddChild(parentId: string): Promise<boolean> {
  const availableSlots = await getAvailableSlots(parentId);
  return availableSlots > 0;
}

/**
 * Gets all children of a distributor
 *
 * @param parentId - The distributor
 * @returns Array of child distributors (max 5)
 */
export async function getChildren(
  parentId: string
): Promise<Distributor[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('distributors')
      .select('*')
      .eq('matrix_parent_id', parentId)
      .order('matrix_position', { ascending: true });

    if (error) {
      console.error('Error fetching children:', error);
      return [];
    }

    return (data as Distributor[]) || [];
  } catch (error) {
    console.error('Error in getChildren:', error);
    return [];
  }
}
