'use client';

// =============================================
// Team Filters Component
// Client-side filtering, sorting, and pagination
// =============================================

import { useState, useMemo } from 'react';
import TeamMemberCard, { type TeamMemberData } from './TeamMemberCard';

interface TeamFiltersProps {
  members: TeamMemberData[];
  onMemberClick?: (distributorId: string) => void;
}

type SortField = 'name' | 'credits' | 'joinDate' | 'rank';
type SortOrder = 'asc' | 'desc';

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

export default function TeamFilters({ members, onMemberClick }: TeamFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [rankFilter, setRankFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortField>('joinDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Get unique ranks from members
  const availableRanks = useMemo(() => {
    const ranks = new Set(members.map((m) => m.techRank.toLowerCase()));
    return Array.from(ranks).sort(
      (a, b) => RANK_ORDER.indexOf(a) - RANK_ORDER.indexOf(b)
    );
  }, [members]);

  // Filter and sort members
  const filteredMembers = useMemo(() => {
    let filtered = [...members];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((m) =>
        m.fullName.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        (m.repNumber && m.repNumber.toString().includes(query))
      );
    }

    // Rank filter
    if (rankFilter !== 'all') {
      filtered = filtered.filter((m) => m.techRank.toLowerCase() === rankFilter);
    }

    // Active status filter
    if (activeFilter === 'active') {
      filtered = filtered.filter((m) => m.isActive);
    } else if (activeFilter === 'inactive') {
      filtered = filtered.filter((m) => !m.isActive);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case 'credits':
          comparison = a.personalCreditsMonthly - b.personalCreditsMonthly;
          break;
        case 'joinDate':
          comparison =
            new Date(a.enrollmentDate).getTime() - new Date(b.enrollmentDate).getTime();
          break;
        case 'rank':
          comparison =
            RANK_ORDER.indexOf(a.techRank.toLowerCase()) -
            RANK_ORDER.indexOf(b.techRank.toLowerCase());
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [members, searchQuery, rankFilter, activeFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  const handleFilterChange = (filterFn: () => void) => {
    filterFn();
    setCurrentPage(1);
  };

  return (
    <div>
      {/* Filter Bar */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search by name, email, or rep number..."
            value={searchQuery}
            onChange={(e) => handleFilterChange(() => setSearchQuery(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent"
          />
        </div>

        {/* Filter and Sort Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Rank Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Filter by Rank
            </label>
            <select
              value={rankFilter}
              onChange={(e) => handleFilterChange(() => setRankFilter(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent text-sm"
            >
              <option value="all">All Ranks</option>
              {availableRanks.map((rank) => (
                <option key={rank} value={rank}>
                  {rank.charAt(0).toUpperCase() + rank.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Active Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Filter by Status
            </label>
            <select
              value={activeFilter}
              onChange={(e) => handleFilterChange(() => setActiveFilter(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active (50+ credits)</option>
              <option value="inactive">Inactive (&lt;50 credits)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent text-sm"
            >
              <option value="name">Name</option>
              <option value="credits">Credits</option>
              <option value="joinDate">Join Date</option>
              <option value="rank">Rank</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Order</label>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors text-sm font-medium text-slate-700 flex items-center justify-center gap-2"
            >
              {sortOrder === 'asc' ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  Ascending
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  Descending
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-slate-600">
          Showing {paginatedMembers.length} of {filteredMembers.length} members
        </div>
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="py-12 text-center">
          <svg
            className="w-16 h-16 text-slate-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No team members found</h3>
          <p className="text-slate-600">
            {searchQuery || rankFilter !== 'all' || activeFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Start building your team by sharing your referral link'}
          </p>
        </div>
      )}

      {/* Member Cards Grid */}
      {filteredMembers.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {paginatedMembers.map((member) => (
              <TeamMemberCard key={member.memberId} member={member} onMemberClick={onMemberClick} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
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
                            ? 'bg-slate-700 text-white'
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
    </div>
  );
}
