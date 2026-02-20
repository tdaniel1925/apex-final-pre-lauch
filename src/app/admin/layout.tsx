// =============================================
// Admin Portal Layout
// Protects admin routes and provides consistent layout
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = {
  title: 'Admin Portal - Apex Affinity Group',
  description: 'Administrative portal for managing distributors and network',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin } = await requireAdmin();

  // Note: Removed admin portal access logging from layout for performance
  // Only log significant actions (create, update, delete) in specific routes

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
