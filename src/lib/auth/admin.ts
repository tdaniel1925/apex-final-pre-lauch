// =============================================
// Admin Authentication & Authorization
// Protects admin routes and provides admin context
// =============================================

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { redirect } from 'next/navigation';

export type AdminRole = 'super_admin' | 'admin' | 'support' | 'viewer';

export interface AdminDistributor {
  id: string;
  auth_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_master: boolean;
  admin_role: AdminRole | null;
}

export interface AdminContext {
  user: {
    id: string;
    email: string;
  };
  distributor: AdminDistributor;
}

/**
 * Requires admin authentication for a route
 * Redirects to login if not authenticated
 * Redirects to dashboard if not an admin
 * Returns admin context with user and distributor info
 */
export async function requireAdmin(): Promise<AdminContext> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get distributor data with service client
  const serviceClient = createServiceClient();
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('id, auth_user_id, email, first_name, last_name, is_master, admin_role')
    .eq('auth_user_id', user.id)
    .single();

  // Check if user has admin access
  if (!distributor?.is_master && !distributor?.admin_role) {
    redirect('/dashboard');
  }

  return {
    user: {
      id: user.id,
      email: user.email!,
    },
    distributor: distributor as AdminDistributor,
  };
}

/**
 * Checks if user has a specific admin role or higher
 */
export function hasAdminRole(
  distributor: AdminDistributor,
  requiredRole: AdminRole
): boolean {
  // Master user has all permissions
  if (distributor.is_master) return true;

  const roleHierarchy: Record<AdminRole, number> = {
    super_admin: 4,
    admin: 3,
    support: 2,
    viewer: 1,
  };

  const userRoleLevel = distributor.admin_role
    ? roleHierarchy[distributor.admin_role]
    : 0;
  const requiredRoleLevel = roleHierarchy[requiredRole];

  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Gets admin user without redirect (for API routes)
 */
export async function getAdminUser(): Promise<AdminContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const serviceClient = createServiceClient();
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('id, auth_user_id, email, first_name, last_name, is_master, admin_role')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor?.is_master && !distributor?.admin_role) {
    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.email!,
    },
    distributor: distributor as AdminDistributor,
  };
}
