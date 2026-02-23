'use client';

// =============================================
// Team Statistics User Component
// Shows comprehensive team performance metrics
// =============================================

import type { Distributor } from '@/lib/types';

interface TeamStatisticsUserProps {
  recruits: Distributor[];
  matrixChildren: Distributor[];
}

export default function TeamStatisticsUser({ recruits, matrixChildren }: TeamStatisticsUserProps) {
  // Calculate overview statistics
  const total = recruits.length;
  const active = recruits.filter((r) => (r.status || 'active') === 'active').length;
  const suspended = recruits.filter((r) => r.status === 'suspended').length;
  const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;

  // Growth metrics
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const newLast7Days = recruits.filter(
    (r) => new Date(r.created_at) >= sevenDaysAgo
  ).length;

  const newLast30Days = recruits.filter(
    (r) => new Date(r.created_at) >= thirtyDaysAgo
  ).length;

  // Matrix statistics
  const matrixFilled = matrixChildren.length;
  const matrixEmpty = 5 - matrixFilled;
  const matrixFillPercentage = Math.round((matrixFilled / 5) * 100);

  // Team depth (max level among direct recruits)
  const maxDepth = recruits.length > 0
    ? Math.max(...recruits.map((r) => r.matrix_depth || 0))
    : 0;

  const averageDepth = recruits.length > 0
    ? Math.round(
        recruits.reduce((sum, r) => sum + (r.matrix_depth || 0), 0) / recruits.length
      )
    : 0;

  // Most recent recruit
  const mostRecent = recruits.length > 0
    ? recruits.reduce((latest, current) =>
        new Date(current.created_at) > new Date(latest.created_at) ? current : latest
      )
    : null;

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
          <p className="text-xl font-bold text-blue-900">{total}</p>
        </div>
        <div className="bg-green-100 border border-green-200 rounded-lg p-2 text-center">
          <p className="text-[10px] text-green-600 font-medium mb-0.5">Active</p>
          <p className="text-xl font-bold text-green-900">{active}</p>
          <p className="text-[8px] text-green-600 font-medium">{activePercentage}%</p>
        </div>
        <div className="bg-red-100 border border-red-200 rounded-lg p-2 text-center">
          <p className="text-[10px] text-red-600 font-medium mb-0.5">Suspended</p>
          <p className="text-xl font-bold text-red-900">{suspended}</p>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="bg-purple-100 border border-purple-200 rounded-lg p-2 mb-3">
        <p className="text-[10px] text-purple-600 font-semibold mb-2">Growth Metrics</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/60 rounded p-2 text-center">
            <p className="text-[10px] text-gray-600 mb-0.5">Last 7 Days</p>
            <p className="text-lg font-bold text-purple-900">+{newLast7Days}</p>
          </div>
          <div className="bg-white/60 rounded p-2 text-center">
            <p className="text-[10px] text-gray-600 mb-0.5">Last 30 Days</p>
            <p className="text-lg font-bold text-purple-900">+{newLast30Days}</p>
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
              <p className="text-lg font-bold text-orange-900">{matrixFilled}/5</p>
              <p className="text-[8px] text-orange-600">{matrixFillPercentage}% full</p>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-orange-600 flex items-center justify-center">
              <span className="text-[10px] font-bold text-orange-600">
                {matrixFillPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Team Depth */}
        <div className="bg-teal-100 border border-teal-200 rounded-lg p-2">
          <p className="text-[10px] text-teal-600 font-semibold mb-1">Team Depth</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-lg font-bold text-teal-900">L{maxDepth}</p>
              <p className="text-[8px] text-teal-600">Avg: L{averageDepth}</p>
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
      {total === 0 && (
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
          <p className="text-[10px] text-gray-600">
            Start recruiting to see your team statistics
          </p>
        </div>
      )}
    </div>
  );
}
