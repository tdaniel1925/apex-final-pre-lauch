// =============================================
// Admin Authentication & Authorization
// Protects admin routes and provides admin context
// =============================================

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { redirect } from 'next/navigation';

export type AdminRole = 'super_admin' | 'admin' | 'support' | 'viewer';

export interface Admin {
  id: string;
  auth_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: AdminRole;
  is_active: boolean;
}

export interface AdminContext {
  user: {
    id: string;
    email: string;
  };
  admin: Admin;
}

/**
 * Requires admin authentication for a route
 * Redirects to login if not authenticated
 * Redirects to dashboard if not an admin
 * Returns admin context with user and admin info
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

  // Check if user is an admin (use service client to bypass RLS)
  const serviceClient = createServiceClient();
  const { data: admin } = await serviceClient
    .from('admins')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  // If not admin, redirect to dashboard (they might be a distributor)
  if (!admin) {
    redirect('/dashboard');
  }

  return {
    user: {
      id: user.id,
      email: user.email!,
    },
    admin: admin as Admin,
  };
}

/**
 * Checks if user has a specific admin role or higher
 */
export function hasAdminRole(
  admin: Admin,
  requiredRole: AdminRole
): boolean {
  const roleHierarchy: Record<AdminRole, number> = {
    super_admin: 4,
    admin: 3,
    support: 2,
    viewer: 1,
  };

  const userRoleLevel = roleHierarchy[admin.role] || 0;
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
  const { data: admin } = await serviceClient
    .from('admins')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (!admin) {
    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.email!,
    },
    admin: admin as Admin,
  };
}
