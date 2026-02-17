'use client';

// =============================================
// Matrix Children User Component
// Shows 5 matrix positions under this user
// =============================================

import type { Distributor } from '@/lib/types';

interface MatrixChildrenUserProps {
  children: Distributor[];
}

interface MatrixSlot {
  position: number;
  distributor: Distributor | null;
  isEmpty: boolean;
}

export default function MatrixChildrenUser({ children }: MatrixChildrenUserProps) {
  // Create 5-slot array with filled and empty slots
  const slots: MatrixSlot[] = [];

  for (let position = 1; position <= 5; position++) {
    const child = children.find((c) => c.matrix_position === position);

    slots.push({
      position,
      distributor: child || null,
      isEmpty: !child,
    });
  }

  // Calculate statistics
  const filledCount = children.length;
  const emptyCount = 5 - filledCount;
  const fillPercentage = Math.round((filledCount / 5) * 100);

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
    <div className="bg-white rounded-lg shadow p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900">Your Matrix Positions</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
            {filledCount}/5 filled
          </span>
          <span className="text-xs font-semibold text-[#2B4C7E]">
            {fillPercentage}%
          </span>
        </div>
      </div>

      {/* Fill Progress Bar */}
      <div className="mb-3">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-[#2B4C7E] to-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${fillPercentage}%` }}
          />
        </div>
      </div>

      {/* 5-Slot Grid */}
      <div className="grid grid-cols-5 gap-2">
        {slots.map((slot) => (
          <div key={slot.position} className="relative">
            {slot.isEmpty ? (
              // Empty Slot
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-50">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-1">
                    <span className="text-xs font-bold text-gray-400">{slot.position}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">Available</p>
                </div>
              </div>
            ) : (
              // Filled Slot
              <div className="border-2 border-[#2B4C7E]/30 rounded-lg p-2 bg-gradient-to-br from-blue-50 to-purple-50 hover:border-[#2B4C7E] hover:shadow-md transition-all">
                <div className="text-center">
                  {/* Position Badge */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#2B4C7E] rounded-full flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">{slot.position}</span>
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 mx-auto bg-gradient-to-br from-[#2B4C7E] to-purple-600 rounded-full flex items-center justify-center mb-1">
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
            <p className="text-sm font-bold text-gray-900">5</p>
          </div>
          <div>
            <p className="text-[10px] text-green-600">Filled</p>
            <p className="text-sm font-bold text-green-600">{filledCount}</p>
          </div>
          <div>
            <p className="text-[10px] text-orange-600">Available</p>
            <p className="text-sm font-bold text-orange-600">{emptyCount}</p>
          </div>
        </div>
      </div>

      {/* Empty State Info */}
      {emptyCount > 0 && (
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2">
          <p className="text-[10px] text-blue-800">
            <span className="font-semibold">{emptyCount} slot{emptyCount !== 1 ? 's' : ''}</span>{' '}
            available for new placements
          </p>
        </div>
      )}

      {/* Full Matrix Info */}
      {emptyCount === 0 && (
        <div className="mt-2 bg-green-50 border border-green-200 rounded p-2">
          <p className="text-[10px] text-green-800 font-semibold">
            ✓ Matrix full - All 5 positions filled!
          </p>
        </div>
      )}
    </div>
  );
}
