'use client';

// =============================================
// Team Statistics Component
// Shows comprehensive team performance metrics
// =============================================

import { useState, useEffect } from 'react';
import type { Distributor } from '@/lib/types';

interface TeamStatisticsProps {
  distributorId: string;
}

interface TeamStatisticsData {
  overview: {
    total: number;
    active: number;
    suspended: number;
    activePercentage: number;
  };
  growth: {
    last7Days: number;
    last30Days: number;
  };
  matrix: {
    filled: number;
    empty: number;
    fillPercentage: number;
  };
  depth: {
    maxLevel: number;
    averageLevel: number;
  };
  mostRecent: Distributor | null;
}

export default function TeamStatistics({ distributorId }: TeamStatisticsProps) {
  const [data, setData] = useState<TeamStatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatistics() {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/distributors/${distributorId}/team-statistics`);

        if (!response.ok) {
          throw new Error('Failed to fetch team statistics');
        }

        const result = await response.json();
        setData(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStatistics();
  }, [distributorId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-3">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Team Statistics</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-3">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Team Statistics</h2>
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { overview, growth, matrix, depth, mostRecent } = data;

  return (
    <div className="bg-white rounded-lg shadow p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900">Team Statistics</h2>
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
          Overview
        </span>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-blue-100 border border-blue-200 rounded-lg p-2 text-center">
          <p className="text-[10px] text-blue-600 font-medium mb-0.5">Total Team</p>
          <p className="text-xl font-bold text-blue-900">{overview.total}</p>
        </div>
        <div className="bg-green-100 border border-green-200 rounded-lg p-2 text-center">
          <p className="text-[10px] text-green-600 font-medium mb-0.5">Active</p>
          <p className="text-xl font-bold text-green-900">{overview.active}</p>
          <p className="text-[8px] text-green-600 font-medium">{overview.activePercentage}%</p>
        </div>
        <div className="bg-red-100 border border-red-200 rounded-lg p-2 text-center">
          <p className="text-[10px] text-red-600 font-medium mb-0.5">Suspended</p>
          <p className="text-xl font-bold text-red-900">{overview.suspended}</p>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="bg-purple-100 border border-purple-200 rounded-lg p-2 mb-3">
        <p className="text-[10px] text-purple-600 font-semibold mb-2">Growth Metrics</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/60 rounded p-2 text-center">
            <p className="text-[10px] text-gray-600 mb-0.5">Last 7 Days</p>
            <p className="text-lg font-bold text-purple-900">+{growth.last7Days}</p>
          </div>
          <div className="bg-white/60 rounded p-2 text-center">
            <p className="text-[10px] text-gray-600 mb-0.5">Last 30 Days</p>
            <p className="text-lg font-bold text-purple-900">+{growth.last30Days}</p>
          </div>
        </div>
      </div>

      {/* Matrix & Depth Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Matrix Fill */}
        <div className="bg-orange-100 border border-orange-200 rounded-lg p-2">
          <p className="text-[10px] text-orange-600 font-semibold mb-1">Matrix Fill</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-lg font-bold text-orange-900">{matrix.filled}/5</p>
              <p className="text-[8px] text-orange-600">{matrix.fillPercentage}% full</p>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-orange-600 flex items-center justify-center">
              <span className="text-[10px] font-bold text-orange-600">
                {matrix.fillPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Team Depth */}
        <div className="bg-teal-100 border border-teal-200 rounded-lg p-2">
          <p className="text-[10px] text-teal-600 font-semibold mb-1">Team Depth</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-lg font-bold text-teal-900">L{depth.maxLevel}</p>
              <p className="text-[8px] text-teal-600">Avg: L{depth.averageLevel}</p>
            </div>
            <div className="flex flex-col items-center">
              <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Most Recent Recruit */}
      {mostRecent && (
        <div className="bg-indigo-100 border border-indigo-200 rounded-lg p-2">
          <p className="text-[10px] text-indigo-600 font-semibold mb-1">Most Recent Recruit</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-white">
                {mostRecent.first_name.charAt(0)}
                {mostRecent.last_name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {mostRecent.first_name} {mostRecent.last_name}
              </p>
              <p className="text-[10px] text-gray-600">
                @{mostRecent.slug} • {new Date(mostRecent.created_at).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`px-1.5 py-0.5 text-[8px] font-semibold rounded-full ${
                mostRecent.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {mostRecent.status || 'active'}
            </span>
          </div>
        </div>
      )}

      {/* No Team Info */}
      {overview.total === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <svg
            className="w-10 h-10 text-gray-300 mx-auto mb-1"
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
          <p className="text-xs font-semibold text-gray-900">No Team Members Yet</p>
          <p className="text-[10px] text-gray-600">Statistics will appear when this distributor recruits their first member</p>
        </div>
      )}
    </div>
  );
}
