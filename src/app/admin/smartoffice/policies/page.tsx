/**
 * SmartOffice Policies List Page
 */

import { requireAdmin } from '@/lib/auth/admin';
import { Metadata } from 'next';
import PoliciesClient from '@/components/admin/smartoffice/PoliciesClient';

export const metadata: Metadata = {
  title: 'SmartOffice Policies | Apex Back Office',
  description: 'Manage SmartOffice CRM policies',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: {
    page?: string;
    search?: string;
    carrier?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default async function SmartOfficePoliciesPage({
  searchParams,
}: PageProps) {
  await requireAdmin();

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">SmartOffice Policies</h1>
        <p className="text-slate-600 mt-1">
          Manage and view all policies synced from SmartOffice CRM
        </p>
      </div>

      <PoliciesClient
        initialPage={parseInt(searchParams.page || '1')}
        initialSearch={searchParams.search || ''}
        initialCarrier={searchParams.carrier || ''}
        initialSortBy={searchParams.sortBy || 'issue_date'}
        initialSortOrder={(searchParams.sortOrder || 'desc') as 'asc' | 'desc'}
      />
    </div>
  );
}
