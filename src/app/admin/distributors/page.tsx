// =============================================
// Admin Distributors List Page
// View, search, and manage all distributors
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { getDistributors } from '@/lib/admin/distributor-service';
import DistributorsTable from '@/components/admin/DistributorsTable';
import Link from 'next/link';

export const metadata = {
  title: 'Manage Distributors - Admin Portal',
};

interface PageProps {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
  };
}

export default async function DistributorsPage({ searchParams }: PageProps) {
  await requireAdmin();

  const page = parseInt(searchParams.page || '1');
  const search = searchParams.search || '';
  const status = (searchParams.status as any) || 'all';

  const result = await getDistributors(
    { search, status },
    { page, pageSize: 50 }
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Distributors</h1>
          <p className="text-gray-600 mt-1">
            View and manage all distributors in the system
          </p>
        </div>
        <Link
          href="/admin/distributors/new"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Add Distributor
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{result.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {result.distributors.filter((d) => d.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Suspended</p>
          <p className="text-2xl font-bold text-red-600">
            {result.distributors.filter((d) => d.status === 'suspended').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Page</p>
          <p className="text-2xl font-bold text-blue-600">
            {page} / {result.totalPages}
          </p>
        </div>
      </div>

      {/* Table */}
      <DistributorsTable
        distributors={result.distributors}
        currentPage={page}
        totalPages={result.totalPages}
        search={search}
        status={status}
      />
    </div>
  );
}
