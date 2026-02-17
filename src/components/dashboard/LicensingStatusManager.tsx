'use client';

// =============================================
// Licensing Status Manager Component
// Allows users to view and change their licensing status
// =============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LicensingStatusBadge } from '@/components/common';
import type { Distributor } from '@/lib/types';

interface LicensingStatusManagerProps {
  distributor: Distributor;
}

export default function LicensingStatusManager({ distributor }: LicensingStatusManagerProps) {
  const router = useRouter();
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangeStatus = async (newStatus: 'licensed' | 'non_licensed') => {
    setIsUpdating(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile/licensing-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licensing_status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Licensing status updated successfully!' });
        setShowChangeModal(false);
        router.refresh();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update licensing status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-3">
      <h2 className="text-lg font-bold text-gray-900 mb-2">Licensing Status</h2>

      {/* Message */}
      {message && (
        <div
          className={`mb-3 p-2 rounded-md text-xs ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <LicensingStatusBadge
            status={distributor.licensing_status}
            verified={distributor.licensing_verified}
            size="lg"
          />
          {distributor.licensing_status === 'licensed' && !distributor.licensing_verified && (
            <p className="text-xs text-orange-600 mt-2">
              ⏳ License verification pending - please upload your license documents
            </p>
          )}
          {distributor.licensing_verified && (
            <p className="text-xs text-green-600 mt-2">✓ License verified by administrator</p>
          )}
        </div>
        {distributor.licensing_status_set_at && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Status set on</p>
            <p className="text-xs text-gray-700 font-medium">
              {new Date(distributor.licensing_status_set_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Change Status Button */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={() => setShowChangeModal(true)}
          className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          Change Licensing Status
        </button>
        <p className="text-xs text-gray-600 mt-2">
          <strong>Note:</strong> Your licensing status determines which features are available in
          your dashboard. You can change this at any time.
        </p>
      </div>

      {/* Change Status Modal */}
      {showChangeModal && (
        <ChangeStatusModal
          currentStatus={distributor.licensing_status}
          onClose={() => setShowChangeModal(false)}
          onConfirm={handleChangeStatus}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
}

// Change Status Modal Component
interface ChangeStatusModalProps {
  currentStatus: 'licensed' | 'non_licensed';
  onClose: () => void;
  onConfirm: (newStatus: 'licensed' | 'non_licensed') => void;
  isUpdating: boolean;
}

function ChangeStatusModal({
  currentStatus,
  onClose,
  onConfirm,
  isUpdating,
}: ChangeStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<'licensed' | 'non_licensed'>(currentStatus);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Change Licensing Status</h3>
        <p className="text-gray-600 mb-4">
          Select your licensing status. This will affect which features are available in your
          dashboard.
        </p>

        <div className="space-y-3 mb-6">
          {/* Licensed Option */}
          <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:border-blue-600 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
            <input
              type="radio"
              name="licensing_status"
              value="licensed"
              checked={selectedStatus === 'licensed'}
              onChange={(e) => setSelectedStatus(e.target.value as 'licensed' | 'non_licensed')}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold text-gray-900">Yes, I am licensed</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                I hold an active insurance license. I'll have access to all features including
                license management, advanced commissions, and client tools.
              </p>
            </div>
          </label>

          {/* Non-Licensed Option */}
          <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:border-blue-600 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
            <input
              type="radio"
              name="licensing_status"
              value="non_licensed"
              checked={selectedStatus === 'non_licensed'}
              onChange={(e) => setSelectedStatus(e.target.value as 'licensed' | 'non_licensed')}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold text-gray-900">No, I am not licensed</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                I'll participate in referral and team-building activities. I'll have access to
                training materials, marketing tools, and team management features.
              </p>
            </div>
          </label>
        </div>

        {/* Warning when changing status */}
        {currentStatus !== selectedStatus && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Changing your licensing status will immediately affect your dashboard access and
              available features.
            </p>
            {currentStatus === 'licensed' && selectedStatus === 'non_licensed' && (
              <p className="text-sm text-yellow-800 mt-2">
                Note: Your license verification will be reset if you change to non-licensed.
              </p>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedStatus)}
            disabled={currentStatus === selectedStatus || isUpdating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
}
