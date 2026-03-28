// =============================================
// Admin Users Management Page
// Create and manage admin user accounts
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import AdminUsersClient from '@/components/admin/AdminUsersClient';

export const metadata = {
  title: 'Admin Users | Apex Back Office',
  description: 'Manage admin user accounts and permissions',
};

export default async function AdminUsersPage() {
  // Require admin authentication
  const adminContext = await requireAdmin();

  const serviceClient = createServiceClient();

  // Fetch all admin users
  const { data: admins } = await serviceClient
    .from('admins')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <AdminUsersClient
      initialAdmins={admins || []}
      currentAdminRole={adminContext.admin.role}
    />
  );
}
