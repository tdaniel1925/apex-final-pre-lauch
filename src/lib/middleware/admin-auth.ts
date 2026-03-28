/**
 * Admin Authorization Middleware
 *
 * Provides helper functions to verify admin access in API routes.
 * Use this BEFORE using createServiceClient() to ensure only admins
 * can access admin-only routes.
 *
 * @module lib/middleware/admin-auth
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export interface AdminAuthResult {
  authorized: boolean;
  user?: User;
  distributorId?: string;
  error?: NextResponse;
}

/**
 * Require admin role for API route
 *
 * Verifies user is authenticated and has admin role.
 * Returns error response if not authorized.
 *
 * @param request - Next.js request object
 * @returns Authorization result with user info or error
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const auth = await requireAdmin(request);
 *   if (!auth.authorized) {
 *     return auth.error!;
 *   }
 *
 *   // Authorized - safe to use service client
 *   const supabase = createServiceClient();
 *   // ...
 * }
 * ```
 */
export async function requireAdmin(request: NextRequest): Promise<AdminAuthResult> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  // Check if user is an admin
  const { data: distributor, error: distError } = await supabase
    .from('distributors')
    .select('id, role')
    .eq('id', user.id)
    .single();

  if (distError || !distributor) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Distributor not found' }, { status: 404 }),
    };
  }

  if (distributor.role !== 'admin') {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 }),
    };
  }

  return {
    authorized: true,
    user,
    distributorId: distributor.id,
  };
}

/**
 * Require admin or self access
 *
 * Allows access if user is admin OR accessing their own data.
 * Useful for routes like /api/distributors/[id] where admins can access
 * anyone's data, but regular users can only access their own.
 *
 * @param request - Next.js request object
 * @param targetDistributorId - ID of distributor being accessed
 * @returns Authorization result
 *
 * @example
 * ```typescript
 * export async function GET(
 *   request: NextRequest,
 *   { params }: { params: { id: string } }
 * ) {
 *   const auth = await requireAdminOrSelf(request, params.id);
 *   if (!auth.authorized) {
 *     return auth.error!;
 *   }
 *
 *   const isAdmin = auth.isAdmin;
 *   // If admin, use service client. If self, use regular client.
 * }
 * ```
 */
export async function requireAdminOrSelf(
  request: NextRequest,
  targetDistributorId: string
): Promise<AdminAuthResult & { isAdmin: boolean }> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false,
      isAdmin: false,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  // Check if user is accessing their own data
  if (user.id === targetDistributorId) {
    return {
      authorized: true,
      isAdmin: false,
      user,
      distributorId: user.id,
    };
  }

  // Not accessing own data - must be admin
  const { data: distributor } = await supabase
    .from('distributors')
    .select('role')
    .eq('id', user.id)
    .single();

  if (distributor?.role === 'admin') {
    return {
      authorized: true,
      isAdmin: true,
      user,
      distributorId: user.id,
    };
  }

  return {
    authorized: false,
    isAdmin: false,
    error: NextResponse.json(
      { error: 'Forbidden: Cannot access other users data' },
      { status: 403 }
    ),
  };
}

/**
 * Get current user from request
 *
 * Simple helper to get authenticated user without role check.
 *
 * @param request - Next.js request object
 * @returns User info or error
 */
export async function getCurrentUser(request: NextRequest): Promise<{
  user?: User;
  distributorId?: string;
  error?: NextResponse;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return {
    user,
    distributorId: user.id,
  };
}

/**
 * Log admin action for audit trail
 *
 * Records admin actions to audit log for compliance.
 *
 * @param params - Admin action details
 */
export async function logAdminAction(params: {
  admin_id: string;
  admin_email: string;
  action_type: string;
  action_description: string;
  target_distributor_id?: string;
  target_distributor_name?: string;
  changes?: Record<string, any>;
  ip_address?: string;
}) {
  try {
    const supabase = await createClient();

    await supabase.rpc('log_admin_activity', {
      p_admin_id: params.admin_id,
      p_admin_email: params.admin_email,
      p_admin_name: 'Admin', // Could fetch from distributor table
      p_distributor_id: params.target_distributor_id || null,
      p_distributor_name: params.target_distributor_name || null,
      p_action_type: params.action_type,
      p_action_description: params.action_description,
      p_changes: params.changes ? JSON.stringify(params.changes) : null,
      p_ip_address: params.ip_address || null,
      p_user_agent: null,
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't throw - logging failure shouldn't break the request
  }
}

export default {
  requireAdmin,
  requireAdminOrSelf,
  getCurrentUser,
  logAdminAction,
};
