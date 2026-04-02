'use client';

// =============================================
// Organization Filters Component
// Search, filter, and sort controls for organization table
// =============================================

import { Search } from 'lucide-react';

export interface FilterState {
  searchQuery: string;
  rankFilter: string;
  statusFilter: string;
  sortBy: 'name' | 'rank' | 'personalBV' | 'teamBV' | 'joinDate';
  sortOrder: 'asc' | 'desc';
}

interface OrganizationFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableRanks: string[];
  resultCount: number;
  totalCount: number;
}

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

export default function OrganizationFilters({
  filters,
  onFiltersChange,
  availableRanks,
  resultCount,
  totalCount,
}: OrganizationFiltersProps) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleSortOrder = () => {
    onFiltersChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email, or rep number..."
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            value={filters.rankFilter}
            onChange={(e) => updateFilter('rankFilter', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">All Ranks</option>
            {availableRanks
              .sort((a, b) => RANK_ORDER.indexOf(a) - RANK_ORDER.indexOf(b))
              .map((rank) => (
                <option key={rank} value={rank}>
                  {rank.charAt(0).toUpperCase() + rank.slice(1)}
                </option>
              ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Filter by Status
          </label>
          <select
            value={filters.statusFilter}
            onChange={(e) => updateFilter('statusFilter', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value as FilterState['sortBy'])}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="name">Name</option>
            <option value="rank">Rank</option>
            <option value="personalBV">Personal BV</option>
            <option value="teamBV">Team BV</option>
            <option value="joinDate">Join Date</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Order</label>
          <button
            onClick={toggleSortOrder}
            className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors text-sm font-medium text-slate-700 flex items-center justify-center gap-2"
          >
            {filters.sortOrder === 'asc' ? (
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

      {/* Results Count */}
      <div className="text-sm text-slate-600">
        Showing {resultCount} of {totalCount} members
      </div>
    </div>
  );
}
