// =============================================
// RBAC - Role-Based Access Control
// =============================================
// Security Fix #7: Granular admin permissions
// Usage: const allowed = await checkPermission(adminId, 'delete_distributors')
// =============================================

import { createServiceClient } from '@/lib/supabase/service';

/**
 * Admin Permission Names
 */
export type Permission =
  // Distributor Management
  | 'view_distributors'
  | 'create_distributors'
  | 'edit_distributors'
  | 'delete_distributors'
  | 'permanent_delete_distributors'
  | 'change_distributor_email'
  | 'change_distributor_sponsor'
  | 'change_distributor_matrix'
  // Compensation
  | 'view_compensation'
  | 'run_compensation'
  | 'edit_compensation_config'
  | 'override_commissions'
  | 'approve_payouts'
  // Insurance Licensing
  | 'view_licenses'
  | 'approve_licenses'
  | 'revoke_licenses'
  | 'reassign_agents'
  // Sensitive Data
  | 'view_ssn'
  | 'edit_ssn'
  | 'view_bank_info'
  | 'edit_bank_info'
  // Communication
  | 'send_emails'
  | 'send_bulk_emails'
  // Events
  | 'view_events'
  | 'create_events'
  | 'edit_events'
  | 'delete_events'
  // Admin Management
  | 'view_admins'
  | 'create_admins'
  | 'edit_admin_roles'
  | 'revoke_admin'
  // System
  | 'view_settings'
  | 'edit_settings'
  | 'view_audit_logs'
  | 'export_data'
  | 'import_data';

/**
 * Admin Role Names
 */
export type RoleName = 'super_admin' | 'admin' | 'manager' | 'support' | 'readonly';

/**
 * Admin Role
 */
export interface AdminRole {
  id: string;
  name: RoleName;
  display_name: string;
  description: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
}

/**
 * Admin Permission
 */
export interface AdminPermission {
  id: string;
  name: Permission;
  display_name: string;
  description: string | null;
  category: string | null;
  created_at: string;
}

/**
 * Check if admin has a specific permission
 *
 * @param adminId - Admin user ID (auth.users.id)
 * @param permission - Permission name to check
 * @returns Promise<boolean>
 *
 * @example
 * ```typescript
 * const canDelete = await checkPermission(adminUser.id, 'delete_distributors');
 * if (!canDelete) {
 *   return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
 * }
 * ```
 */
export async function checkPermission(adminId: string, permission: Permission): Promise<boolean> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase.rpc('admin_has_permission', {
      p_admin_id: adminId,
      p_permission_name: permission,
    });

    if (error) {
      console.error('[RBAC] Error checking permission:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('[RBAC] Exception checking permission:', error);
    return false;
  }
}

/**
 * Check if admin has ANY of the specified permissions
 *
 * @param adminId - Admin user ID
 * @param permissions - Array of permission names
 * @returns Promise<boolean>
 */
export async function checkAnyPermission(adminId: string, permissions: Permission[]): Promise<boolean> {
  const results = await Promise.all(permissions.map((p) => checkPermission(adminId, p)));
  return results.some((result) => result === true);
}

/**
 * Check if admin has ALL of the specified permissions
 *
 * @param adminId - Admin user ID
 * @param permissions - Array of permission names
 * @returns Promise<boolean>
 */
export async function checkAllPermissions(adminId: string, permissions: Permission[]): Promise<boolean> {
  const results = await Promise.all(permissions.map((p) => checkPermission(adminId, p)));
  return results.every((result) => result === true);
}

/**
 * Get admin's roles
 *
 * @param adminId - Admin user ID
 * @returns Promise with array of roles
 */
export async function getAdminRoles(adminId: string): Promise<AdminRole[]> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('admin_user_roles')
      .select('role:admin_roles(*)')
      .eq('admin_id', adminId);

    if (error) {
      console.error('[RBAC] Error fetching admin roles:', error);
      return [];
    }

    return (data || []).map((item: any) => item.role).filter(Boolean);
  } catch (error) {
    console.error('[RBAC] Exception fetching admin roles:', error);
    return [];
  }
}

/**
 * Get admin's permissions
 *
 * @param adminId - Admin user ID
 * @returns Promise with array of permissions
 */
export async function getAdminPermissions(adminId: string): Promise<AdminPermission[]> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('admin_user_roles')
      .select(`
        role:admin_roles!inner(
          role_permissions:admin_role_permissions!inner(
            permission:admin_permissions(*)
          )
        )
      `)
      .eq('admin_id', adminId);

    if (error) {
      console.error('[RBAC] Error fetching admin permissions:', error);
      return [];
    }

    // Flatten nested structure and deduplicate
    const permissions = new Map<string, AdminPermission>();

    data?.forEach((item: any) => {
      item.role?.role_permissions?.forEach((rp: any) => {
        if (rp.permission) {
          permissions.set(rp.permission.id, rp.permission);
        }
      });
    });

    return Array.from(permissions.values());
  } catch (error) {
    console.error('[RBAC] Exception fetching admin permissions:', error);
    return [];
  }
}

/**
 * Get admin's highest role priority
 *
 * @param adminId - Admin user ID
 * @returns Promise<number> - Priority (higher = more powerful)
 */
export async function getAdminPriority(adminId: string): Promise<number> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase.rpc('admin_highest_priority', {
      p_admin_id: adminId,
    });

    if (error) {
      console.error('[RBAC] Error fetching admin priority:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('[RBAC] Exception fetching admin priority:', error);
    return 0;
  }
}

/**
 * Check if admin has a specific role
 *
 * @param adminId - Admin user ID
 * @param roleName - Role name to check
 * @returns Promise<boolean>
 */
export async function hasRole(adminId: string, roleName: RoleName): Promise<boolean> {
  const roles = await getAdminRoles(adminId);
  return roles.some((role) => role.name === roleName);
}

/**
 * Assign role to admin
 *
 * @param adminId - Admin user ID to assign role to
 * @param roleName - Role name to assign
 * @param assignedBy - Admin user ID performing the assignment
 * @returns Promise with result
 */
export async function assignRole(
  adminId: string,
  roleName: RoleName,
  assignedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();

    // Get role ID
    const { data: role, error: roleError } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('name', roleName)
      .single();

    if (roleError || !role) {
      return { success: false, error: 'Role not found' };
    }

    // Assign role
    const { error: assignError } = await supabase.from('admin_user_roles').insert({
      admin_id: adminId,
      role_id: role.id,
      assigned_by: assignedBy,
    });

    if (assignError) {
      // Check if already assigned
      if (assignError.message?.includes('duplicate')) {
        return { success: true }; // Already has role
      }
      console.error('[RBAC] Error assigning role:', assignError);
      return { success: false, error: assignError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[RBAC] Exception assigning role:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Revoke role from admin
 *
 * @param adminId - Admin user ID to revoke role from
 * @param roleName - Role name to revoke
 * @returns Promise with result
 */
export async function revokeRole(
  adminId: string,
  roleName: RoleName
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();

    // Get role ID
    const { data: role, error: roleError } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('name', roleName)
      .single();

    if (roleError || !role) {
      return { success: false, error: 'Role not found' };
    }

    // Revoke role
    const { error: revokeError } = await supabase
      .from('admin_user_roles')
      .delete()
      .eq('admin_id', adminId)
      .eq('role_id', role.id);

    if (revokeError) {
      console.error('[RBAC] Error revoking role:', revokeError);
      return { success: false, error: revokeError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[RBAC] Exception revoking role:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get all available roles
 *
 * @returns Promise with array of roles
 */
export async function getAllRoles(): Promise<AdminRole[]> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('admin_roles')
      .select('*')
      .order('priority', { ascending: false });

    if (error) {
      console.error('[RBAC] Error fetching roles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[RBAC] Exception fetching roles:', error);
    return [];
  }
}

/**
 * Get all available permissions
 *
 * @param category - Optional category filter
 * @returns Promise with array of permissions
 */
export async function getAllPermissions(category?: string): Promise<AdminPermission[]> {
  try {
    const supabase = createServiceClient();

    let query = supabase.from('admin_permissions').select('*').order('category', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[RBAC] Error fetching permissions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[RBAC] Exception fetching permissions:', error);
    return [];
  }
}

/**
 * Require permission middleware helper
 * Returns 403 error if admin doesn't have permission
 *
 * @param adminId - Admin user ID
 * @param permission - Required permission
 * @returns Promise<boolean> - true if allowed, false if denied
 *
 * @example
 * ```typescript
 * const allowed = await requirePermission(adminUser.id, 'delete_distributors');
 * if (!allowed) {
 *   return NextResponse.json(
 *     { error: 'Permission denied: delete_distributors required' },
 *     { status: 403 }
 *   );
 * }
 * ```
 */
export async function requirePermission(adminId: string, permission: Permission): Promise<boolean> {
  return checkPermission(adminId, permission);
}
