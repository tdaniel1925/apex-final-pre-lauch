'use client';

// =============================================
// Personal Team Component (User Dashboard)
// Shows distributor's own direct recruits
// =============================================

import { useState, useMemo } from 'react';
import type { Distributor } from '@/lib/types';

interface PersonalTeamProps {
  recruits: Distributor[];
}

type SortField = 'created_at' | 'first_name' | 'status';
type SortOrder = 'asc' | 'desc';

export default function PersonalTeam({ recruits }: PersonalTeamProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = recruits.length;
    const active = recruits.filter((r) => (r.status || 'active') === 'active').length;
    const suspended = recruits.filter((r) => r.status === 'suspended').length;

    return { total, active, suspended };
  }, [recruits]);

  // Filter and sort recruits
  const filteredRecruits = useMemo(() => {
    let filtered = [...recruits];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => (r.status || 'active') === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'first_name':
          comparison = a.first_name.localeCompare(b.first_name);
          break;
        case 'status':
          comparison = (a.status || 'active').localeCompare(b.status || 'active');
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [recruits, statusFilter, sortBy, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white border border-gray-300 rounded-lg p-3 text-center shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Total Recruits</p>
          <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
        </div>
        <div className="bg-white border border-gray-300 rounded-lg p-3 text-center shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">{statistics.active}</p>
        </div>
        <div className="bg-white border border-gray-300 rounded-lg p-3 text-center shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Suspended</p>
          <p className="text-2xl font-bold text-red-600">{statistics.suspended}</p>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="bg-white rounded-lg shadow p-3 mb-3">
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B4C7E]"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortField)}
            className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B4C7E]"
          >
            <option value="created_at">Date Joined</option>
            <option value="first_name">Name</option>
            <option value="status">Status</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            <svg
              className={`w-4 h-4 text-gray-600 transition-transform ${
                sortOrder === 'asc' ? 'rotate-180' : ''
              }`}
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
          </button>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-3 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Your Direct Recruits</h2>
          <p className="text-xs text-gray-600 mt-0.5">
            {filteredRecruits.length} {filteredRecruits.length === 1 ? 'person' : 'people'} you personally referred
          </p>
        </div>

        {filteredRecruits.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-2"
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
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              {statusFilter === 'all' ? 'No team members yet' : `No ${statusFilter} members`}
            </h3>
            <p className="text-xs text-gray-600">
              {statusFilter === 'all'
                ? 'Share your referral link to start building your team'
                : 'Try changing the filter to see other team members'}
            </p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden m-3">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Username</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Matrix</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRecruits.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#2B4C7E] rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                            {member.first_name.charAt(0)}
                            {member.last_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {member.first_name} {member.last_name}
                            </p>
                            {member.company_name && (
                              <p className="text-xs text-gray-500 truncate">{member.company_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-900">@{member.slug}</td>
                      <td className="px-3 py-2">
                        <div className="text-xs">
                          <span className="font-semibold text-[#2B4C7E]">
                            Rep #{member.rep_number ?? 'N/A'}
                          </span>
                          <span className="text-gray-500 ml-1">L{member.matrix_depth || 0}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadge(
                            member.status || 'active'
                          )}`}
                        >
                          {member.status || 'active'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-600 text-xs">
                        {new Date(member.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
