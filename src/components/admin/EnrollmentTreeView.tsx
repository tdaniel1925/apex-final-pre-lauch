'use client';

// =============================================
// Enrollment Tree View Component
// Shows enrollment hierarchy using sponsor_id
// Single Source of Truth compliant
// =============================================

import { useState } from 'react';
import type { EnrollmentTreeStats } from '@/lib/admin/enrollment-tree-manager';

interface EnrollmentTreeViewProps {
  stats: EnrollmentTreeStats;
}

export default function EnrollmentTreeView({ stats }: EnrollmentTreeViewProps) {
  const [selectedLevel, setSelectedLevel] = useState(1);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Enrollment Tree</h1>
        <p className="text-sm text-gray-600 mt-1">
          Enrollment hierarchy using <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">sponsor_id</code> (single source of truth)
        </p>
        <div className="mt-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
          ✅ This page uses the enrollment tree (<code>sponsor_id</code>) which is the single source of truth for all hierarchy data.
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Total Enrolled</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total_enrolled}</p>
          <p className="text-xs text-gray-500 mt-1">All distributors with sponsors</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Active Enrolled</p>
          <p className="text-2xl font-bold text-green-600">{stats.active_enrolled}</p>
          <p className="text-xs text-gray-500 mt-1">Active status only</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Max Depth</p>
          <p className="text-2xl font-bold text-blue-600">{stats.max_depth}</p>
          <p className="text-xs text-gray-500 mt-1">Deepest level in tree</p>
        </div>
      </div>

      {/* Level Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Enrollment by Level</h2>

        {stats.by_level.length === 0 ? (
          <p className="text-gray-500">No enrollment data available</p>
        ) : (
          <div className="space-y-3">
            {stats.by_level.map((level) => {
              const percentage = Math.round((level.active_count / level.count) * 100);

              return (
                <div
                  key={level.level}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedLevel === level.level
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedLevel(level.level)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setSelectedLevel(level.level);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-blue-600">L{level.level}</div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {level.count} distributor{level.count !== 1 ? 's' : ''}
                        </div>
                        <div className="text-sm text-gray-600">
                          {level.active_count} active ({percentage}%)
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-48">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {level.active_count}/{level.count}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📘 About This Page</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• This page shows the <strong>enrollment hierarchy</strong> based on who recruited whom</p>
          <p>• Uses <code className="bg-blue-100 px-2 py-0.5 rounded">sponsor_id</code> field (single source of truth)</p>
          <p>• No arbitrary limits - natural recruitment hierarchy</p>
          <p>• All compensation, team pages, and genealogy use this same tree</p>
        </div>
      </div>

      {/* Deprecated Notice */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Replaces Old Matrix Page</h3>
        <div className="text-sm text-yellow-800 space-y-1">
          <p>
            This page replaces <code className="bg-yellow-100 px-2 py-0.5 rounded">/admin/matrix</code> which used the deprecated{' '}
            <code className="bg-yellow-100 px-2 py-0.5 rounded">matrix_parent_id</code> field
          </p>
          <p>• The old "5×7 Forced Matrix" had invalid data (6/5 at Level 1 = 120% overflow)</p>
          <p>• All features now use the enrollment tree for consistency</p>
        </div>
      </div>
    </div>
  );
}
