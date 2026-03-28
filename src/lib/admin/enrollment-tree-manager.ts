// =============================================
// Enrollment Tree Manager Service
// Uses sponsor_id (enrollment hierarchy) NOT matrix_parent_id
// Single Source of Truth compliant
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import type { Distributor } from '@/lib/types';

export interface EnrollmentTreeStats {
  total_enrolled: number;
  active_enrolled: number;
  max_depth: number;
  by_level: Array<{
    level: number;
    count: number;
    active_count: number;
  }>;
}

/**
 * Calculate enrollment depth for a distributor
 * Recursively traverse up the sponsor chain
 */
async function calculateEnrollmentDepth(
  distributorId: string,
  visited = new Set<string>()
): Promise<number> {
  // Prevent infinite loops
  if (visited.has(distributorId) || visited.size > 20) {
    return 0;
  }
  visited.add(distributorId);

  const serviceClient = createServiceClient();

  // Get sponsor
  const { data } = await serviceClient
    .from('distributors')
    .select('sponsor_id')
    .eq('id', distributorId)
    .neq('status', 'deleted')
    .single();

  // If no sponsor (root level), depth is 0
  if (!data || !data.sponsor_id) {
    return 0;
  }

  // Depth is 1 + parent's depth
  const parentDepth = await calculateEnrollmentDepth(data.sponsor_id, visited);
  return parentDepth + 1;
}

/**
 * Get enrollment tree statistics
 * Uses sponsor_id hierarchy (single source of truth)
 */
export async function getEnrollmentTreeStatistics(): Promise<EnrollmentTreeStats> {
  const serviceClient = createServiceClient();

  // Get all distributors with sponsors
  const { data: distributors } = await serviceClient
    .from('distributors')
    .select('id, status, sponsor_id')
    .neq('status', 'deleted')
    .not('sponsor_id', 'is', null);

  if (!distributors || distributors.length === 0) {
    return {
      total_enrolled: 0,
      active_enrolled: 0,
      max_depth: 0,
      by_level: [],
    };
  }

  // Calculate depth for each distributor
  const depthMap = new Map<number, { count: number; active_count: number }>();
  let maxDepth = 0;

  for (const dist of distributors) {
    const depth = await calculateEnrollmentDepth(dist.id);
    maxDepth = Math.max(maxDepth, depth);

    const current = depthMap.get(depth) || { count: 0, active_count: 0 };
    current.count++;
    if (dist.status === 'active') {
      current.active_count++;
    }
    depthMap.set(depth, current);
  }

  // Convert to array
  const by_level = Array.from(depthMap.entries())
    .map(([level, stats]) => ({
      level,
      count: stats.count,
      active_count: stats.active_count,
    }))
    .sort((a, b) => a.level - b.level);

  return {
    total_enrolled: distributors.length,
    active_enrolled: distributors.filter((d) => d.status === 'active').length,
    max_depth: maxDepth,
    by_level,
  };
}

/**
 * Get distributors at a specific enrollment depth
 */
export async function getDistributorsByDepth(depth: number): Promise<Distributor[]> {
  const serviceClient = createServiceClient();

  // Get all distributors
  const { data: distributors } = await serviceClient
    .from('distributors')
    .select('*')
    .neq('status', 'deleted')
    .not('sponsor_id', 'is', null);

  if (!distributors) return [];

  // Filter by calculated depth
  const result: Distributor[] = [];
  for (const dist of distributors) {
    const distDepth = await calculateEnrollmentDepth(dist.id);
    if (distDepth === depth) {
      result.push(dist);
    }
  }

  return result;
}

/**
 * Get direct enrollees of a distributor (Level 1 under them)
 */
export async function getDirectEnrollees(distributorId: string): Promise<Distributor[]> {
  const serviceClient = createServiceClient();

  const { data } = await serviceClient
    .from('distributors')
    .select('*')
    .eq('sponsor_id', distributorId) // ✅ CORRECT - uses sponsor_id
    .neq('status', 'deleted')
    .order('created_at', { ascending: true });

  return data || [];
}

/**
 * Get all downline of a distributor (recursive)
 */
export async function getAllDownline(distributorId: string): Promise<Distributor[]> {
  const serviceClient = createServiceClient();

  const result: Distributor[] = [];
  const queue: string[] = [distributorId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (visited.has(currentId)) continue;
    visited.add(currentId);

    // Get direct enrollees
    const { data: children } = await serviceClient
      .from('distributors')
      .select('*')
      .eq('sponsor_id', currentId) // ✅ CORRECT - uses sponsor_id
      .neq('status', 'deleted');

    if (children) {
      result.push(...children);
      queue.push(...children.map((c) => c.id));
    }
  }

  return result;
}
