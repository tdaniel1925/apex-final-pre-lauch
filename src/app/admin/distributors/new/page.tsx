// =============================================
// Admin New Distributor Page
// Create new distributor manually
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import NewDistributorForm from '@/components/admin/NewDistributorForm';

export const metadata = {
  title: 'Add New Distributor - Admin Portal',
};

export default async function NewDistributorPage() {
  await requireAdmin();

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Distributor</h1>
          <p className="text-gray-600 mt-1">
            Manually create a new distributor account
          </p>
        </div>

        <NewDistributorForm />
      </div>
    </div>
  );
}
