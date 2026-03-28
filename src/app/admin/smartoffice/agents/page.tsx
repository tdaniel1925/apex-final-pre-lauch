/**
 * SmartOffice Agents List Page
 * Displays all SmartOffice agents with search, filters, and stats
 */

import { requireAdmin } from '@/lib/auth/admin';
import { Metadata } from 'next';
import AgentsClient from '@/components/admin/smartoffice/AgentsClient';

export const metadata: Metadata = {
  title: 'SmartOffice Agents | Apex Back Office',
  description: 'Manage SmartOffice CRM agents',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    mapped?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default async function SmartOfficeAgentsPage({
  searchParams,
}: PageProps) {
  await requireAdmin();

  const page = parseInt(searchParams.page || '1');
  const search = searchParams.search || '';
  const status = searchParams.status || 'all';
  const mapped = searchParams.mapped || 'all';
  const sortBy = searchParams.sortBy || 'synced_at';
  const sortOrder = searchParams.sortOrder || 'desc';

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">SmartOffice Agents</h1>
        <p className="text-slate-600 mt-1">
          Manage and view all agents synced from SmartOffice CRM
        </p>
      </div>

      <AgentsClient
        initialPage={page}
        initialSearch={search}
        initialStatus={status}
        initialMapped={mapped}
        initialSortBy={sortBy}
        initialSortOrder={sortOrder as 'asc' | 'desc'}
      />
    </div>
  );
}
