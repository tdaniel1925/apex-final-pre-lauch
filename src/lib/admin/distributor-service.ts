// =============================================
// Distributor Service
// Business logic for distributor CRUD operations
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import { logAdminActivity, AdminActions } from './activity-logger';
import type { Distributor, DistributorInsert, DistributorUpdate } from '@/lib/types';

export interface DistributorFilters {
  status?: 'active' | 'suspended' | 'deleted' | 'all';
  search?: string;
  sponsorId?: string;
  matrixDepth?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface DistributorListResult {
  distributors: Distributor[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Get paginated list of distributors with filters
 */
export async function getDistributors(
  filters: DistributorFilters = {},
  pagination: PaginationParams = { page: 1, pageSize: 50 }
): Promise<DistributorListResult> {
  const serviceClient = createServiceClient();

  // Build query
  let query = serviceClient.from('distributors').select('*', { count: 'exact' });

  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  } else if (!filters.status || filters.status === 'all') {
    // By default, exclude deleted
    query = query.neq('status', 'deleted');
  }

  // Apply search filter (name, email, or slug)
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.or(
      `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm},slug.ilike.${searchTerm}`
    );
  }

  // Apply sponsor filter
  if (filters.sponsorId) {
    query = query.eq('sponsor_id', filters.sponsorId);
  }

  // Apply matrix depth filter
  if (filters.matrixDepth !== undefined) {
    query = query.eq('matrix_depth', filters.matrixDepth);
  }

  // Apply date range filters
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  // Apply pagination
  const from = (pagination.page - 1) * pagination.pageSize;
  const to = from + pagination.pageSize - 1;
  query = query.range(from, to);

  // Order by created_at descending
  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching distributors:', error);
    throw new Error('Failed to fetch distributors');
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / pagination.pageSize);

  return {
    distributors: data || [],
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages,
  };
}

/**
 * Get single distributor by ID
 */
export async function getDistributorById(id: string): Promise<Distributor | null> {
  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient
    .from('distributors')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching distributor:', error);
    return null;
  }

  return data;
}

/**
 * Create a new distributor manually (admin only)
 */
export async function createDistributor(
  distributorData: Partial<DistributorInsert>,
  adminId: string
): Promise<{ success: boolean; distributor?: Distributor; error?: string }> {
  const serviceClient = createServiceClient();

  // Validate required fields
  if (!distributorData.email || !distributorData.first_name || !distributorData.last_name) {
    return { success: false, error: 'Email, first name, and last name are required' };
  }

  // Check if email already exists
  const { data: existing } = await serviceClient
    .from('distributors')
    .select('id')
    .eq('email', distributorData.email)
    .single();

  if (existing) {
    return { success: false, error: 'Email already exists' };
  }

  // Check if slug already exists (if provided)
  if (distributorData.slug) {
    const { data: existingSlug } = await serviceClient
      .from('distributors')
      .select('id')
      .eq('slug', distributorData.slug)
      .single();

    if (existingSlug) {
      return { success: false, error: 'Username already exists' };
    }
  }

  // Create distributor
  const { data, error } = await serviceClient
    .from('distributors')
    .insert({
      ...distributorData,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating distributor:', error);
    return { success: false, error: 'Failed to create distributor' };
  }

  // Log activity
  await logAdminActivity({
    adminId,
    action: AdminActions.DISTRIBUTOR_CREATE,
    targetType: 'distributor',
    targetId: data.id,
    details: {
      email: data.email,
      name: `${data.first_name} ${data.last_name}`,
    },
  });

  return { success: true, distributor: data };
}

/**
 * Update distributor information
 */
export async function updateDistributor(
  id: string,
  updates: Partial<DistributorUpdate>,
  adminId: string
): Promise<{ success: boolean; distributor?: Distributor; error?: string }> {
  const serviceClient = createServiceClient();

  // Get current distributor for logging
  const current = await getDistributorById(id);
  if (!current) {
    return { success: false, error: 'Distributor not found' };
  }

  // Update distributor
  const { data, error } = await serviceClient
    .from('distributors')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating distributor:', error);
    return { success: false, error: 'Failed to update distributor' };
  }

  // Log activity
  await logAdminActivity({
    adminId,
    action: AdminActions.DISTRIBUTOR_UPDATE,
    targetType: 'distributor',
    targetId: id,
    details: {
      updated_fields: Object.keys(updates),
      before: current,
      after: data,
    },
  });

  return { success: true, distributor: data };
}

/**
 * Suspend a distributor
 */
export async function suspendDistributor(
  id: string,
  reason: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  const serviceClient = createServiceClient();

  const { error } = await serviceClient
    .from('distributors')
    .update({
      status: 'suspended',
      suspended_at: new Date().toISOString(),
      suspended_by: adminId,
      suspension_reason: reason,
    })
    .eq('id', id);

  if (error) {
    console.error('Error suspending distributor:', error);
    return { success: false, error: 'Failed to suspend distributor' };
  }

  // Log activity
  await logAdminActivity({
    adminId,
    action: AdminActions.DISTRIBUTOR_SUSPEND,
    targetType: 'distributor',
    targetId: id,
    details: { reason },
  });

  return { success: true };
}

/**
 * Activate a suspended distributor
 */
export async function activateDistributor(
  id: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  const serviceClient = createServiceClient();

  const { error } = await serviceClient
    .from('distributors')
    .update({
      status: 'active',
      suspended_at: null,
      suspended_by: null,
      suspension_reason: null,
    })
    .eq('id', id);

  if (error) {
    console.error('Error activating distributor:', error);
    return { success: false, error: 'Failed to activate distributor' };
  }

  // Log activity
  await logAdminActivity({
    adminId,
    action: AdminActions.DISTRIBUTOR_ACTIVATE,
    targetType: 'distributor',
    targetId: id,
  });

  return { success: true };
}

/**
 * Soft delete a distributor
 */
export async function deleteDistributor(
  id: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  const serviceClient = createServiceClient();

  const { error } = await serviceClient
    .from('distributors')
    .update({
      status: 'deleted',
      deleted_at: new Date().toISOString(),
      deleted_by: adminId,
    })
    .eq('id', id);

  if (error) {
    console.error('Error deleting distributor:', error);
    return { success: false, error: 'Failed to delete distributor' };
  }

  // Log activity
  await logAdminActivity({
    adminId,
    action: AdminActions.DISTRIBUTOR_DELETE,
    targetType: 'distributor',
    targetId: id,
  });

  return { success: true };
}

/**
 * Get distributor statistics
 */
export async function getDistributorStats() {
  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient.rpc('get_distributor_counts');

  if (error) {
    console.error('Error fetching distributor stats:', error);
    return {
      total: 0,
      active: 0,
      suspended: 0,
      deleted: 0,
    };
  }

  return data || { total: 0, active: 0, suspended: 0, deleted: 0 };
}
