'use client';

// =============================================
// Matrix Position Manager Component
// Allows admin to manually adjust matrix placement
// =============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Distributor } from '@/lib/types';

interface MatrixPositionManagerProps {
  distributor: Distributor;
}

export default function MatrixPositionManager({ distributor }: MatrixPositionManagerProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    matrix_parent_id: distributor.matrix_parent_id || '',
    matrix_position: distributor.matrix_position || 1,
    matrix_depth: distributor.matrix_depth || 0,
  });

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/distributors/${distributor.id}/matrix-position`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matrix_parent_id: formData.matrix_parent_id || null,
          matrix_position: formData.matrix_position,
          matrix_depth: formData.matrix_depth,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update matrix position');
      }

      setSuccess('Matrix position updated successfully');
      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    setFormData({
      matrix_parent_id: distributor.matrix_parent_id || '',
      matrix_position: distributor.matrix_position || 1,
      matrix_depth: distributor.matrix_depth || 0,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900">Matrix Position Management</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit Position
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-2 bg-red-50 border border-red-200 text-red-800 px-2 py-1.5 rounded text-xs">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-2 bg-green-50 border border-green-200 text-green-800 px-2 py-1.5 rounded text-xs">
          {success}
        </div>
      )}

      <div className="space-y-2">
        {/* Matrix Parent ID */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            Matrix Parent ID
          </label>
          {isEditing ? (
            <>
              <input
                type="text"
                value={formData.matrix_parent_id}
                onChange={(e) =>
                  setFormData({ ...formData, matrix_parent_id: e.target.value })
                }
                placeholder="Leave empty for root placement"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              />
              <p className="text-[10px] text-gray-500 mt-0.5">
                Enter the ID of the parent distributor, or leave empty for root
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-900 font-mono break-all">
              {distributor.matrix_parent_id || 'None (Root)'}
            </p>
          )}
        </div>

        {/* Matrix Position */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            Matrix Position (1-5)
          </label>
          {isEditing ? (
            <>
              <select
                value={formData.matrix_position}
                onChange={(e) =>
                  setFormData({ ...formData, matrix_position: parseInt(e.target.value) })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              >
                <option value={1}>Position 1</option>
                <option value={2}>Position 2</option>
                <option value={3}>Position 3</option>
                <option value={4}>Position 4</option>
                <option value={5}>Position 5</option>
              </select>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Select which position (1-5) under the parent
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-900">
              Position {distributor.matrix_position || 'N/A'}
            </p>
          )}
        </div>

        {/* Matrix Depth */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            Matrix Depth (0-7)
          </label>
          {isEditing ? (
            <>
              <select
                value={formData.matrix_depth}
                onChange={(e) =>
                  setFormData({ ...formData, matrix_depth: parseInt(e.target.value) })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7].map((level) => (
                  <option key={level} value={level}>
                    Level {level} {level === 0 ? '(Master)' : ''}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Select the depth level in the matrix tree
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-900">
              Level {distributor.matrix_depth || 0}
            </p>
          )}
        </div>
      </div>

      {/* Current Status */}
      {!isEditing && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-2">
            <p className="text-[10px] text-blue-600 font-semibold mb-1">Current Placement</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Rep Number:</span>
                <span className="font-semibold text-blue-900">
                  Rep #{distributor.rep_number ?? 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Level:</span>
                <span className="font-semibold text-blue-900">
                  {distributor.matrix_depth || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Parent:</span>
                <span className="font-semibold text-blue-900">
                  {distributor.matrix_parent_id ? 'Set' : 'Root'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning */}
      {isEditing && (
        <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2">
          <p className="text-[10px] text-yellow-800">
            <span className="font-semibold">⚠️ Warning:</span> Changing matrix positions can
            affect the entire tree structure. Ensure the parent ID exists and the position is
            available.
          </p>
        </div>
      )}
    </div>
  );
}
