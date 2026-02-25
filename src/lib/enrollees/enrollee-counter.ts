// =============================================
// Enrollee Counter Utility
// Calculate personal and organization enrollee counts
// =============================================

import { createServiceClient } from '@/lib/supabase/service';

export interface EnrolleeStats {
  personalEnrollees: number;
  organizationEnrollees: number;
}

/**
 * Get personal enrollee count (direct recruits only)
 * These are people directly signed up by this distributor
 */
export async function getPersonalEnrolleeCount(distributorId: string): Promise<number> {
  const serviceClient = createServiceClient();

  const { count, error } = await serviceClient
    .from('distributors')
    .select('*', { count: 'exact', head: true })
    .eq('sponsor_id', distributorId)
    .neq('status', 'deleted');

  if (error) {
    console.error('Error getting personal enrollee count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get organization enrollee count (all downline via sponsor tree)
 * Recursively counts everyone in the sponsor tree below this distributor
 */
export async function getOrganizationEnrolleeCount(distributorId: string): Promise<number> {
  const serviceClient = createServiceClient();

  // Get all direct personal enrollees
  const { data: directEnrollees, error } = await serviceClient
    .from('distributors')
    .select('id')
    .eq('sponsor_id', distributorId)
    .neq('status', 'deleted');

  if (error || !directEnrollees) {
    console.error('Error getting organization enrollees:', error);
    return 0;
  }

  // Start with count of direct enrollees
  let totalCount = directEnrollees.length;

  // Recursively count each direct enrollee's organization
  for (const enrollee of directEnrollees) {
    const subCount = await getOrganizationEnrolleeCount(enrollee.id);
    totalCount += subCount;
  }

  return totalCount;
}

/**
 * Get both personal and organization enrollee counts
 * More efficient than calling separately
 */
export async function getEnrolleeStats(distributorId: string): Promise<EnrolleeStats> {
  const [personalCount, orgCount] = await Promise.all([
    getPersonalEnrolleeCount(distributorId),
    getOrganizationEnrolleeCount(distributorId),
  ]);

  return {
    personalEnrollees: personalCount,
    organizationEnrollees: orgCount,
  };
}

/**
 * Get enrollee stats for multiple distributors at once
 * Useful for admin tables showing many distributors
 */
export async function getBulkEnrolleeStats(
  distributorIds: string[]
): Promise<Map<string, EnrolleeStats>> {
  const results = new Map<string, EnrolleeStats>();

  // Process in parallel for better performance
  await Promise.all(
    distributorIds.map(async (id) => {
      const stats = await getEnrolleeStats(id);
      results.set(id, stats);
    })
  );

  return results;
}

/**
 * Get list of all personal enrollees with details
 */
export async function getPersonalEnrollees(distributorId: string) {
  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient
    .from('distributors')
    .select('id, first_name, last_name, email, slug, created_at, status')
    .eq('sponsor_id', distributorId)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting personal enrollees:', error);
    return [];
  }

  return data || [];
}

/**
 * Get list of all organization enrollees (recursive)
 */
export async function getOrganizationEnrollees(
  distributorId: string,
  level: number = 0
): Promise<Array<{ id: string; first_name: string; last_name: string; email: string; level: number }>> {
  const serviceClient = createServiceClient();

  // Get direct enrollees
  const { data: directEnrollees, error } = await serviceClient
    .from('distributors')
    .select('id, first_name, last_name, email')
    .eq('sponsor_id', distributorId)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });

  if (error || !directEnrollees) {
    console.error('Error getting organization enrollees:', error);
    return [];
  }

  // Start with direct enrollees
  const allEnrollees = directEnrollees.map((e) => ({
    id: e.id,
    first_name: e.first_name,
    last_name: e.last_name,
    email: e.email,
    level: level + 1,
  }));

  // Recursively get their enrollees
  for (const enrollee of directEnrollees) {
    const subEnrollees = await getOrganizationEnrollees(enrollee.id, level + 1);
    allEnrollees.push(...subEnrollees);
  }

  return allEnrollees;
}
