// =============================================
// Admin Distributors List Page
// View, search, and manage all distributors
// Includes admin impersonation feature - 2026-03-09
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { getDistributors } from '@/lib/admin/distributor-service';
import DistributorsTable from '@/components/admin/DistributorsTable';
import Link from 'next/link';

export const metadata = {
  title: 'Manage Distributors - Admin Portal',
};

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function DistributorsPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const search = params.search || '';
  const status = (params.status as any) || 'all';

  const result = await getDistributors(
    { search, status },
    { page, pageSize: 50 }
  );

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      {/* Header */}
      <div className="mb-4 lg:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Manage Distributors</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            View and manage all distributors in the system
          </p>
        </div>
        <Link
          href="/admin/distributors/new"
          className="px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base text-center min-h-[44px] flex items-center justify-center whitespace-nowrap"
        >
          + Add Distributor
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-8">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Total</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{result.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Active</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
            {result.distributors.filter((d) => d.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Suspended</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">
            {result.distributors.filter((d) => d.status === 'suspended').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Page</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
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
