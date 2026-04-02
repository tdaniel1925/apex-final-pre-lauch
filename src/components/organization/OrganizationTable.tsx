'use client';

// =============================================
// Organization Table Component
// Searchable/filterable table with expandable rows
// Shows enrollment tree with privacy controls
// =============================================

import { useState, useMemo } from 'react';
import OrganizationFilters, { FilterState } from './OrganizationFilters';
import OrganizationRow from './OrganizationRow';
import DistributorDetailsModal from '@/components/distributor/DistributorDetailsModal';
import { Users } from 'lucide-react';

export interface OrganizationMember {
  distributor_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  slug: string;
  rep_number: number | null;
  sponsor_id: string;
  enrollment_date: string;
  tech_rank: string;
  personal_credits_monthly: number;
  team_credits_monthly: number;
  children?: OrganizationMember[];
}

interface OrganizationTableProps {
  members: OrganizationMember[];
  currentUserId: string;
}

const ITEMS_PER_PAGE = 20;

const RANK_ORDER = [
  'starter',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'ruby',
  'diamond',
  'crown',
  'elite',
];

export default function OrganizationTable({
  members,
  currentUserId,
}: OrganizationTableProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    rankFilter: 'all',
    statusFilter: 'all',
    sortBy: 'joinDate',
    sortOrder: 'desc',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDistributorId, setSelectedDistributorId] = useState<string | null>(null);

  // Error handling: Validate members array
  if (!Array.isArray(members)) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-semibold">Error: Invalid data format</p>
        <p className="text-red-600 text-sm mt-2">Please contact support if this issue persists.</p>
      </div>
    );
  }

  // Get unique ranks
  const availableRanks = useMemo(() => {
    const ranks = new Set(members.map((m) => m.tech_rank.toLowerCase()));
    return Array.from(ranks);
  }, [members]);

  // Filter and sort members
  const filteredMembers = useMemo(() => {
    let filtered = [...members];

    // Search filter (debounced via user typing)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.full_name.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query) ||
          (m.rep_number && m.rep_number.toString().includes(query)) ||
          m.slug.toLowerCase().includes(query)
      );
    }

    // Rank filter
    if (filters.rankFilter !== 'all') {
      filtered = filtered.filter((m) => m.tech_rank.toLowerCase() === filters.rankFilter);
    }

    // Status filter
    if (filters.statusFilter === 'active') {
      filtered = filtered.filter((m) => m.personal_credits_monthly >= 50);
    } else if (filters.statusFilter === 'inactive') {
      filtered = filtered.filter((m) => m.personal_credits_monthly < 50);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'name':
          comparison = a.full_name.localeCompare(b.full_name);
          break;
        case 'rank':
          comparison =
            RANK_ORDER.indexOf(a.tech_rank.toLowerCase()) -
            RANK_ORDER.indexOf(b.tech_rank.toLowerCase());
          break;
        case 'personalBV':
          comparison = a.personal_credits_monthly - b.personal_credits_monthly;
          break;
        case 'teamBV':
          comparison = a.team_credits_monthly - b.team_credits_monthly;
          break;
        case 'joinDate':
          comparison =
            new Date(a.enrollment_date).getTime() - new Date(b.enrollment_date).getTime();
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [members, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleMemberClick = (distributorId: string) => {
    setSelectedDistributorId(distributorId);
  };

  return (
    <div>
      {/* Filters */}
      <OrganizationFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableRanks={availableRanks}
        resultCount={paginatedMembers.length}
        totalCount={filteredMembers.length}
      />

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-lg py-12 text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No members found</h3>
          <p className="text-slate-600">
            {filters.searchQuery || filters.rankFilter !== 'all' || filters.statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Start building your team by sharing your referral link'}
          </p>
        </div>
      )}

      {/* Table */}
      {filteredMembers.length > 0 && (
        <>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 w-12"></th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Rep #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Personal BV
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Team BV
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Direct
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMembers.map((member) => (
                    <OrganizationRow
                      key={member.distributor_id}
                      member={member}
                      currentUserId={currentUserId}
                      onMemberClick={handleMemberClick}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first, last, current, and adjacent pages
                  if (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 text-slate-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Distributor Details Modal */}
      {selectedDistributorId && (
        <DistributorDetailsModal
          distributorId={selectedDistributorId}
          isOpen={!!selectedDistributorId}
          onClose={() => setSelectedDistributorId(null)}
        />
      )}
    </div>
  );
}
