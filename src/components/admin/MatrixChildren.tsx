'use client';

// =============================================
// Matrix Children Component
// Shows 5 matrix positions under this distributor
// =============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Distributor } from '@/lib/types';

interface MatrixChildrenProps {
  distributorId: string;
}

interface MatrixSlot {
  position: number;
  distributor: Distributor | null;
  isEmpty: boolean;
}

interface MatrixData {
  slots: MatrixSlot[];
  statistics: {
    total: number;
    filled: number;
    empty: number;
    fillPercentage: number;
  };
}

export default function MatrixChildren({ distributorId }: MatrixChildrenProps) {
  const router = useRouter();
  const [data, setData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatrixChildren() {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/distributors/${distributorId}/matrix-children`);

        if (!response.ok) {
          throw new Error('Failed to fetch matrix children');
        }

        const result = await response.json();
        setData(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMatrixChildren();
  }, [distributorId]);

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
        <h2 className="text-lg font-bold text-gray-900 mb-2">Matrix Children (5 Slots)</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-3">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Matrix Children (5 Slots)</h2>
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { slots, statistics } = data;

  return (
    <div className="bg-white rounded-lg shadow p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900">Matrix Children (5 Slots)</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
            {statistics.filled}/5 filled
          </span>
          <span className="text-xs font-semibold text-blue-600">
            {statistics.fillPercentage}%
          </span>
        </div>
      </div>

      {/* Fill Progress Bar */}
      <div className="mb-3">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${statistics.fillPercentage}%` }}
          />
        </div>
      </div>

      {/* 5-Slot Grid */}
      <div className="grid grid-cols-5 gap-2">
        {slots.map((slot) => (
          <div key={slot.position} className="relative">
            {slot.isEmpty ? (
              // Empty Slot
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-50 hover:border-gray-400 transition-colors">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-1">
                    <span className="text-xs font-bold text-gray-400">{slot.position}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">Available</p>
                </div>
              </div>
            ) : (
              // Filled Slot
              <div
                onClick={() => router.push(`/admin/distributors/${slot.distributor!.id}`)}
                className="border-2 border-blue-200 rounded-lg p-2 bg-gradient-to-br from-blue-50 to-purple-50 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="text-center">
                  {/* Position Badge */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">{slot.position}</span>
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-1">
                    <span className="text-[10px] font-bold text-white">
                      {slot.distributor!.first_name.charAt(0)}
                      {slot.distributor!.last_name.charAt(0)}
                    </span>
                  </div>

                  {/* Name */}
                  <p className="text-[10px] font-semibold text-gray-900 truncate mb-0.5">
                    {slot.distributor!.first_name} {slot.distributor!.last_name}
                  </p>

                  {/* Slug */}
                  <p className="text-[8px] text-gray-600 truncate mb-1">
                    @{slot.distributor!.slug}
                  </p>

                  {/* Status Badge */}
                  <span
                    className={`inline-block px-1 py-0.5 text-[8px] font-semibold rounded-full ${getStatusBadge(
                      slot.distributor!.status || 'active'
                    )}`}
                  >
                    {slot.distributor!.status || 'active'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Statistics Summary */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] text-gray-600">Total Slots</p>
            <p className="text-sm font-bold text-gray-900">{statistics.total}</p>
          </div>
          <div>
            <p className="text-[10px] text-green-600">Filled</p>
            <p className="text-sm font-bold text-green-600">{statistics.filled}</p>
          </div>
          <div>
            <p className="text-[10px] text-orange-600">Available</p>
            <p className="text-sm font-bold text-orange-600">{statistics.empty}</p>
          </div>
        </div>
      </div>

      {/* Empty State Info */}
      {statistics.empty > 0 && (
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2">
          <p className="text-[10px] text-blue-800">
            <span className="font-semibold">{statistics.empty} slot{statistics.empty !== 1 ? 's' : ''}</span>{' '}
            available for new placements
          </p>
        </div>
      )}

      {/* Full Matrix Info */}
      {statistics.empty === 0 && (
        <div className="mt-2 bg-green-50 border border-green-200 rounded p-2">
          <p className="text-[10px] text-green-800 font-semibold">
            ✓ Matrix full - All 5 positions filled
          </p>
        </div>
      )}
    </div>
  );
}
