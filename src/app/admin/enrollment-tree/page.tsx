// =============================================
// Admin Enrollment Tree Page
// Visual enrollment hierarchy using sponsor_id
// REPLACES: /admin/matrix (which used broken matrix_parent_id)
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { getEnrollmentTreeStatistics } from '@/lib/admin/enrollment-tree-manager';
import EnrollmentTreeView from '@/components/admin/EnrollmentTreeView';

export const metadata = {
  title: 'Enrollment Tree - Admin Portal',
};

export default async function EnrollmentTreePage() {
  await requireAdmin();

  const stats = await getEnrollmentTreeStatistics();

  return (
    <div className="p-4">
      <EnrollmentTreeView stats={stats} />
    </div>
  );
}
