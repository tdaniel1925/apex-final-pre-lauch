'use client';

// =============================================
// Distributors Table Component
// Displays distributors with search, filters, and actions
// Last updated: 2026-03-09 - Force cache bust
// =============================================

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Distributor } from '@/lib/types';

interface DistributorsTableProps {
  distributors: Distributor[];
  currentPage: number;
  totalPages: number;
  search: string;
  status: string;
}

export default function DistributorsTable({
  distributors,
  currentPage,
  totalPages,
  search: initialSearch,
  status: initialStatus,
}: DistributorsTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only trigger search if search value has changed from initial
      if (search !== initialSearch) {
        performSearch(search, status);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [search]); // Only watch search input

  const performSearch = useCallback((searchTerm: string, statusFilter: string) => {
    setIsSearching(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    router.push(`/admin/distributors?${params.toString()}`);
    router.refresh();
    // Reset loading after a short delay to show feedback
    setTimeout(() => setIsSearching(false), 300);
  }, [router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(search, status);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    performSearch(search, newStatus);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status !== 'all') params.set('status', status);
    params.set('page', page.toString());
    router.push(`/admin/distributors?${params.toString()}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'deleted':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Filters */}
      <div className="p-3 lg:p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 sm:py-1.5 pr-8 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] sm:min-h-0"
            />
            {isSearching && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <svg
                  className="animate-spin h-4 w-4 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
            {!isSearching && search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  performSearch('', status);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </form>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 sm:py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[100px] sm:min-w-[120px] min-h-[44px] sm:min-h-0"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>
        {search && (
          <p className="text-xs text-gray-600 mt-1.5">
            Searching for &quot;{search}&quot;...
          </p>
        )}
      </div>

      {/* Table */}
      {distributors.length === 0 ? (
        <div className="p-6 sm:p-8 text-center text-gray-500">
          <p className="text-xs sm:text-sm font-semibold mb-1">No distributors found</p>
          <p className="text-[10px] sm:text-xs">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                    Email
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
                    Username
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
                    Matrix
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                    Joined
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {distributors.map((dist) => (
                  <tr key={dist.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap">
                      <div className="text-[10px] sm:text-xs font-medium text-gray-900">
                        {dist.first_name} {dist.last_name}
                      </div>
                      {dist.company_name && (
                        <div className="text-[10px] sm:text-xs text-gray-500 hidden lg:block">{dist.company_name}</div>
                      )}
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap hidden md:table-cell">
                      <div className="text-[10px] sm:text-xs text-gray-500">{dist.email}</div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap">
                      <div className="text-[10px] sm:text-xs text-gray-900">@{dist.slug}</div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap">
                      <div className="text-[10px] sm:text-xs">
                        <span className="font-semibold text-blue-600">
                          Rep #{dist.rep_number ?? 'N/A'}
                        </span>
                        <span className="text-gray-500 ml-1 hidden sm:inline">
                          L{dist.matrix_depth || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap">
                      <span
                        className={`px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full ${getStatusBadge(
                          dist.status || 'active'
                        )}`}
                      >
                        {dist.status || 'active'}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-[10px] sm:text-xs text-gray-500">
                        {new Date(dist.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-[10px] sm:text-xs">
                      <a
                        href={`/admin/distributors/${dist.id}`}
                        className="text-blue-600 hover:text-blue-900 font-medium inline-block py-1 px-2 min-h-[32px] flex items-center"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-3 lg:px-4 py-3 border-t border-gray-200 flex items-center justify-between gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>
              <span className="text-xs sm:text-sm text-gray-700 px-2">
                <span className="hidden sm:inline">Page </span>{currentPage}<span className="hidden sm:inline"> of {totalPages}</span>
                <span className="sm:hidden">/{totalPages}</span>
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
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
