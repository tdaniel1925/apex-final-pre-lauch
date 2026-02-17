// =============================================
// Admin Portal Layout
// Protects admin routes and provides consistent layout
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { logAdminActivity, AdminActions } from '@/lib/admin/activity-logger';

export const metadata = {
  title: 'Admin Portal - Apex Affinity Group',
  description: 'Administrative portal for managing distributors and network',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { distributor } = await requireAdmin();

  // Log admin portal access
  await logAdminActivity({
    adminId: distributor.id,
    action: AdminActions.SYSTEM_LOGIN,
    targetType: 'system',
    details: {
      admin_name: `${distributor.first_name} ${distributor.last_name}`,
      admin_role: distributor.admin_role || 'master',
    },
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
