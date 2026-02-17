'use client';

// =============================================
// Matrix View Component
// Interactive 5×7 matrix visualization
// =============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Distributor } from '@/lib/types';
import type { MatrixStats, MatrixLevelData } from '@/lib/admin/matrix-manager';

interface MatrixViewProps {
  stats: MatrixStats;
  initialLevel: number;
  initialLevelData: MatrixLevelData;
}

export default function MatrixView({ stats, initialLevel, initialLevelData }: MatrixViewProps) {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState(initialLevel);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);

  const handleLevelChange = (level: number) => {
    setSelectedLevel(level);
    router.push(`/admin/matrix?level=${level}`);
  };

  const maxCapacity = Math.pow(5, selectedLevel);
  const fillPercentage = (initialLevelData.filledPositions / maxCapacity) * 100;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Matrix Management</h1>
        <p className="text-gray-600 mt-1">5×7 Forced Matrix Visualization</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Positions</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total_positions}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Filled Positions</p>
          <p className="text-2xl font-bold text-green-600">{stats.filled_positions}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Available Slots</p>
          <p className="text-2xl font-bold text-blue-600">{stats.available_positions}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Max Depth</p>
          <p className="text-2xl font-bold text-purple-600">{stats.max_depth}</p>
        </div>
      </div>

      {/* Level Selector */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Select Matrix Level</h2>
        <div className="flex gap-2 flex-wrap">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((level) => {
            const levelStats = stats.by_level?.find((l) => l.level === level);
            const capacity = Math.pow(5, level);
            const filled = levelStats?.count || 0;

            return (
              <button
                key={level}
                onClick={() => handleLevelChange(level)}
                className={`px-6 py-4 rounded-lg border-2 transition-all ${
                  selectedLevel === level
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-sm text-gray-600">Level {level}</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {filled}/{capacity}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round((filled / capacity) * 100)}% Full
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Level View */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Level {selectedLevel} - Distributors
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {initialLevelData.filledPositions} of {maxCapacity} positions filled (
                {Math.round(fillPercentage)}%)
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Available Slots</p>
              <p className="text-3xl font-bold text-blue-600">
                {initialLevelData.availableSlots}
              </p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>

        {/* Matrix Grid */}
        {initialLevelData.distributors.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No distributors at this level</h3>
            <p className="text-gray-600">This level is empty</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {initialLevelData.distributors.map((distributor) => (
                <div
                  key={distributor.id}
                  onClick={() => setSelectedDistributor(distributor)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
                    selectedDistributor?.id === distributor.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {distributor.first_name.charAt(0)}
                      {distributor.last_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {distributor.first_name} {distributor.last_name}
                      </p>
                      <p className="text-sm text-gray-600 truncate">@{distributor.slug}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Position:</span>
                      <span className="font-semibold text-blue-600">
                        #{distributor.matrix_position}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          distributor.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {distributor.status || 'active'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <a
                      href={`/admin/distributors/${distributor.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Details →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Distributor Details */}
      {selectedDistributor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedDistributor.first_name} {selectedDistributor.last_name}
                </h3>
                <p className="text-gray-600">@{selectedDistributor.slug}</p>
              </div>
              <button
                onClick={() => setSelectedDistributor(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedDistributor.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-medium">{selectedDistributor.company_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Matrix Position</p>
                  <p className="font-medium text-blue-600">
                    #{selectedDistributor.matrix_position}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Matrix Level</p>
                  <p className="font-medium">{selectedDistributor.matrix_depth}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium">{selectedDistributor.status || 'active'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Joined</p>
                  <p className="font-medium">
                    {new Date(selectedDistributor.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <a
                  href={`/admin/distributors/${selectedDistributor.id}`}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
                >
                  View Full Details
                </a>
                <button
                  onClick={() => setSelectedDistributor(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
