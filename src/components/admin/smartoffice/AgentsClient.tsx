'use client';

/**
 * SmartOffice Agents Client Component
 * Table view with filtering, sorting, and navigation
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';
import DataTable, { Column } from '@/components/admin/smartoffice/DataTable';
import FilterBar, { Filter } from '@/components/admin/smartoffice/FilterBar';
import type {
  AgentWithStats,
  PaginatedResponse,
} from '@/lib/smartoffice/types';

interface AgentsClientProps {
  initialPage: number;
  initialSearch: string;
  initialStatus: string;
  initialMapped: string;
  initialSortBy: string;
  initialSortOrder: 'asc' | 'desc';
}

export default function AgentsClient({
  initialPage,
  initialSearch,
  initialStatus,
  initialMapped,
  initialSortBy,
  initialSortOrder,
}: AgentsClientProps) {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<AgentWithStats> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [mapped, setMapped] = useState(initialMapped);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  // Fetch data
  useEffect(() => {
    fetchAgents();
  }, [page, search, status, mapped, sortBy, sortOrder]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '100',
        ...(search && { search }),
        ...(status !== 'all' && { status }),
        ...(mapped !== 'all' && { mapped }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(
        `/api/admin/smartoffice/agents?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    updateURL(1, value, status, mapped, sortBy, sortOrder);
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') {
      setStatus(value);
      setPage(1);
      updateURL(1, search, value, mapped, sortBy, sortOrder);
    } else if (key === 'mapped') {
      setMapped(value);
      setPage(1);
      updateURL(1, search, status, value, sortBy, sortOrder);
    }
  };

  const handleSort = (column: string) => {
    const newSortOrder =
      sortBy === column && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortBy(column);
    setSortOrder(newSortOrder);
    updateURL(page, search, status, mapped, column, newSortOrder);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURL(newPage, search, status, mapped, sortBy, sortOrder);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClear = () => {
    setSearch('');
    setStatus('all');
    setMapped('all');
    setPage(1);
    updateURL(1, '', 'all', 'all', sortBy, sortOrder);
  };

  const updateURL = (
    p: number,
    s: string,
    st: string,
    m: string,
    sb: string,
    so: string
  ) => {
    const params = new URLSearchParams();
    if (p > 1) params.set('page', p.toString());
    if (s) params.set('search', s);
    if (st !== 'all') params.set('status', st);
    if (m !== 'all') params.set('mapped', m);
    if (sb !== 'synced_at') params.set('sortBy', sb);
    if (so !== 'desc') params.set('sortOrder', so);

    const query = params.toString();
    router.push(`/admin/smartoffice/agents${query ? `?${query}` : ''}`);
  };

  const filters: Filter[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
      defaultValue: 'all',
    },
    {
      key: 'mapped',
      label: 'Mapping',
      options: [
        { value: 'all', label: 'All Agents' },
        { value: 'yes', label: 'Mapped to Apex' },
        { value: 'no', label: 'Unmapped' },
      ],
      defaultValue: 'all',
    },
  ];

  const columns: Column<AgentWithStats>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (agent) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">
            {agent.first_name || ''} {agent.last_name || ''}
          </span>
          <span className="text-xs text-slate-500">
            ID: {agent.smartoffice_id}
          </span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Contact',
      render: (agent) => (
        <div className="flex flex-col">
          {agent.email && (
            <span className="text-sm text-slate-900">{agent.email}</span>
          )}
          {agent.phone && (
            <span className="text-xs text-slate-500">{agent.phone}</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (agent) =>
        agent.status === 1 ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-slate-100 text-slate-800 rounded-full">
            <XCircle className="w-3 h-3" />
            Inactive
          </span>
        ),
    },
    {
      key: 'apex_agent_id',
      label: 'Apex Link',
      sortable: true,
      render: (agent) =>
        agent.apex_agent_id ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              <LinkIcon className="w-3 h-3" />
              Linked
            </span>
            {agent.distributor && (
              <Link
                href={`/admin/distributors/${agent.apex_agent_id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
            <XCircle className="w-3 h-3" />
            Unmapped
          </span>
        ),
    },
    {
      key: 'policy_count',
      label: 'Policies',
      sortable: true,
      render: (agent) => (
        <span className="font-medium text-slate-900">
          {agent.policy_count || 0}
        </span>
      ),
    },
    {
      key: 'total_commissions',
      label: 'Commissions',
      sortable: true,
      render: (agent) => (
        <span className="font-medium text-slate-900">
          ${(agent.total_commissions || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Agents</p>
              <p className="text-2xl font-bold text-slate-900">
                {data?.pagination.total || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Mapped to Apex
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {data?.data.filter((a) => a.apex_agent_id).length || 0}
              </p>
            </div>
            <LinkIcon className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Unmapped</p>
              <p className="text-2xl font-bold text-slate-900">
                {data?.data.filter((a) => !a.apex_agent_id).length || 0}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Active Agents
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {data?.data.filter((a) => a.status === 1).length || 0}
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <FilterBar
          searchPlaceholder="Search by name, email, or SmartOffice ID..."
          searchValue={search}
          filters={filters}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          onClear={handleClear}
        />

        {/* Table */}
        <DataTable
          columns={columns}
          data={data?.data || []}
          pagination={data?.pagination}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onPageChange={handlePageChange}
          onRowClick={(agent) =>
            router.push(`/admin/smartoffice/agents/${agent.smartoffice_id}`)
          }
          loading={loading}
          emptyMessage="No agents found. Try adjusting your search or filters."
        />
      </div>
    </div>
  );
}
