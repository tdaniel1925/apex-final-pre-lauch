// =============================================
// Genealogy Tree Service
// Recursive tree data fetching for sponsor hierarchy
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Distributor } from '@/lib/types';

export interface TreeNode {
  distributor: Distributor;
  children: TreeNode[];
  depth: number;
  totalDownline: number;
  directReferrals: number;
}

export interface TreeStats {
  totalDistributors: number;
  maxDepth: number;
  totalLevels: number;
}

/**
 * Recursively builds sponsor tree starting from a distributor
 * @param startDistributorId - Root distributor ID (null for master)
 * @param maxDepth - Maximum depth to fetch (for pagination)
 * @param client - Supabase client (service for admin, regular for users)
 */
export async function buildSponsorTree(
  startDistributorId: string | null,
  maxDepth: number = 7,
  client?: SupabaseClient
): Promise<{ tree: TreeNode | null; stats: TreeStats }> {
  const supabase = client || createServiceClient();

  // If no start ID, find the master distributor (oldest, or lowest position)
  let rootDistributor: Distributor | null = null;

  if (!startDistributorId) {
    const { data } = await supabase
      .from('distributors')
      .select('*')
      .is('sponsor_id', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    rootDistributor = data as Distributor | null;
  } else {
    const { data } = await supabase
      .from('distributors')
      .select('*')
      .eq('id', startDistributorId)
      .single();

    rootDistributor = data as Distributor | null;
  }

  if (!rootDistributor) {
    return {
      tree: null,
      stats: { totalDistributors: 0, maxDepth: 0, totalLevels: 0 },
    };
  }

  // Build tree recursively
  const stats = { totalDistributors: 0, maxDepth: 0, totalLevels: 0 };
  const tree = await buildNodeRecursive(rootDistributor, 0, maxDepth, supabase, stats);

  return { tree, stats };
}

/**
 * Recursively builds a tree node and its children
 */
async function buildNodeRecursive(
  distributor: Distributor,
  currentDepth: number,
  maxDepth: number,
  supabase: SupabaseClient,
  stats: TreeStats
): Promise<TreeNode> {
  stats.totalDistributors++;
  stats.maxDepth = Math.max(stats.maxDepth, currentDepth);
  stats.totalLevels = Math.max(stats.totalLevels, currentDepth + 1);

  // Fetch direct referrals (children in sponsor tree)
  const { data: children } = await supabase
    .from('distributors')
    .select('*')
    .eq('sponsor_id', distributor.id)
    .order('created_at', { ascending: true });

  const childDistributors = (children || []) as Distributor[];

  // Build child nodes recursively (if within depth limit)
  const childNodes: TreeNode[] = [];
  if (currentDepth < maxDepth) {
    for (const child of childDistributors) {
      const childNode = await buildNodeRecursive(
        child,
        currentDepth + 1,
        maxDepth,
        supabase,
        stats
      );
      childNodes.push(childNode);
    }
  }

  // Calculate total downline (recursive count)
  const totalDownline = childNodes.reduce((sum, node) => sum + node.totalDownline + 1, 0);

  return {
    distributor,
    children: childNodes,
    depth: currentDepth,
    totalDownline,
    directReferrals: childDistributors.length,
  };
}

/**
 * Fetch children for a specific node (for pagination/lazy loading)
 */
export async function fetchNodeChildren(
  distributorId: string,
  currentDepth: number,
  maxDepth: number = 7,
  client?: SupabaseClient
): Promise<TreeNode[]> {
  const supabase = client || createServiceClient();

  const { data: children } = await supabase
    .from('distributors')
    .select('*')
    .eq('sponsor_id', distributorId)
    .order('created_at', { ascending: true });

  const childDistributors = (children || []) as Distributor[];

  const stats = { totalDistributors: 0, maxDepth: 0, totalLevels: 0 };
  const childNodes: TreeNode[] = [];

  for (const child of childDistributors) {
    const childNode = await buildNodeRecursive(
      child,
      currentDepth + 1,
      maxDepth,
      supabase,
      stats
    );
    childNodes.push(childNode);
  }

  return childNodes;
}

/**
 * Get upline path from distributor to root
 */
export async function getUplinePath(
  distributorId: string,
  client?: SupabaseClient
): Promise<Distributor[]> {
  const supabase = client || createServiceClient();
  const path: Distributor[] = [];

  let currentId: string | null = distributorId;

  while (currentId) {
    const { data: distributorData } = await supabase
      .from('distributors')
      .select('*')
      .eq('id', currentId)
      .single();

    if (!distributorData) break;

    const distributor = distributorData as Distributor;

    path.unshift(distributor as Distributor);
    currentId = (distributor as Distributor).sponsor_id;
  }

  return path;
}

/**
 * Search distributors by name/email
 */
export async function searchDistributors(
  searchTerm: string,
  limit: number = 20,
  client?: SupabaseClient
): Promise<Distributor[]> {
  const supabase = client || createServiceClient();

  const { data } = await supabase
    .from('distributors')
    .select('*')
    .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    .limit(limit);

  return (data || []) as Distributor[];
}
