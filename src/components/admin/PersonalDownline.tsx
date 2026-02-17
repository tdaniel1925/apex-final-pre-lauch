'use client';

// =============================================
// Personal Downline Component
// Shows all distributors personally recruited by this distributor
// =============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Distributor } from '@/lib/types';

interface PersonalDownlineProps {
  distributorId: string;
}

interface DownlineData {
  downline: Distributor[];
  statistics: {
    total: number;
    active: number;
    suspended: number;
    deleted: number;
  };
  mostRecent: Distributor | null;
}

export default function PersonalDownline({ distributorId }: PersonalDownlineProps) {
  const router = useRouter();
  const [data, setData] = useState<DownlineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchDownline();
  }, [distributorId, statusFilter, sortBy, sortOrder]);

  async function fetchDownline() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        sortBy,
        sortOrder,
      });

      const response = await fetch(
        `/api/admin/distributors/${distributorId}/downline?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch downline');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSort = (field: string) => {
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
      case 'deleted':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-3">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Personal Downline</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-3">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Personal Downline</h2>
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { downline, statistics } = data;

  return (
    <div className="bg-white rounded-lg shadow p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900">Personal Downline</h2>
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
          {statistics.total} recruit{statistics.total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-2 text-center">
          <p className="text-[10px] text-blue-600 font-medium mb-0.5">Total</p>
          <p className="text-xl font-bold text-blue-900">{statistics.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-2 text-center">
          <p className="text-[10px] text-green-600 font-medium mb-0.5">Active</p>
          <p className="text-xl font-bold text-green-900">{statistics.active}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-2 text-center">
          <p className="text-[10px] text-red-600 font-medium mb-0.5">Suspended</p>
          <p className="text-xl font-bold text-red-900">{statistics.suspended}</p>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex items-center gap-2 mb-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="suspended">Suspended Only</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="created_at">Date Joined</option>
          <option value="first_name">Name</option>
          <option value="status">Status</option>
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
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

      {/* Downline List */}
      {downline.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <svg
            className="w-10 h-10 text-gray-300 mx-auto mb-2"
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
          <p className="text-sm font-semibold text-gray-900 mb-1">No Personal Recruits</p>
          <p className="text-xs text-gray-600">This distributor hasn't recruited anyone yet</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-2 py-1.5 text-left font-medium text-gray-600">Name</th>
                  <th className="px-2 py-1.5 text-left font-medium text-gray-600">Status</th>
                  <th className="px-2 py-1.5 text-left font-medium text-gray-600">Joined</th>
                  <th className="px-2 py-1.5 text-left font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {downline.map((dist) => (
                  <tr
                    key={dist.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/admin/distributors/${dist.id}`)}
                  >
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                          {dist.first_name.charAt(0)}
                          {dist.last_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {dist.first_name} {dist.last_name}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate">@{dist.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${getStatusBadge(
                          dist.status || 'active'
                        )}`}
                      >
                        {dist.status || 'active'}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-gray-600">
                      {new Date(dist.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-2 py-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/distributors/${dist.id}`);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
