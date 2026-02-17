'use client';

// =============================================
// Distributor Detail View Component
// Edit distributor, suspend, delete
// =============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Distributor } from '@/lib/types';
import SponsorLineage from './SponsorLineage';
import PersonalDownline from './PersonalDownline';
import MatrixChildren from './MatrixChildren';

interface DistributorDetailViewProps {
  distributor: Distributor;
}

export default function DistributorDetailView({
  distributor: initialDistributor,
}: DistributorDetailViewProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: initialDistributor.first_name,
    last_name: initialDistributor.last_name,
    email: initialDistributor.email,
    company_name: initialDistributor.company_name || '',
    phone: initialDistributor.phone || '',
    address_line1: initialDistributor.address_line1 || '',
    address_line2: initialDistributor.address_line2 || '',
    city: initialDistributor.city || '',
    state: initialDistributor.state || '',
    zip: initialDistributor.zip || '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/distributors/${initialDistributor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update distributor');
      }

      setSuccess('Distributor updated successfully');
      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuspend = async (reason: string) => {
    try {
      const response = await fetch(`/api/admin/distributors/${initialDistributor.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to suspend distributor');
      }

      setSuccess('Distributor suspended successfully');
      setShowSuspendModal(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleActivate = async () => {
    try {
      const response = await fetch(`/api/admin/distributors/${initialDistributor.id}/suspend`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to activate distributor');
      }

      setSuccess('Distributor activated successfully');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/distributors/${initialDistributor.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete distributor');
      }

      router.push('/admin/distributors');
    } catch (err: any) {
      setError(err.message);
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

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {initialDistributor.first_name} {initialDistributor.last_name}
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">@{initialDistributor.slug}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/admin/distributors')}
            className="px-3 py-1.5 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
          >
            Back to List
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setError(null);
                }}
                className="px-3 py-1.5 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-md text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-3 bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-md text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-3">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow p-3">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Personal Information</h2>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md disabled:bg-gray-50"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-lg shadow p-3">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Address</h2>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={formData.address_line1}
                  onChange={(e) =>
                    setFormData({ ...formData, address_line1: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={formData.address_line2}
                  onChange={(e) =>
                    setFormData({ ...formData, address_line2: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md disabled:bg-gray-50"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">ZIP</label>
                  <input
                    type="text"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Sponsor Lineage */}
          <SponsorLineage
            distributorId={initialDistributor.id}
            distributorName={`${initialDistributor.first_name} ${initialDistributor.last_name}`}
          />

          {/* Personal Downline */}
          <PersonalDownline distributorId={initialDistributor.id} />

          {/* Matrix Children */}
          <MatrixChildren distributorId={initialDistributor.id} />

          {/* Status */}
          <div className="bg-white rounded-lg shadow p-3">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Status</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Status</p>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(
                    initialDistributor.status || 'active'
                  )}`}
                >
                  {initialDistributor.status || 'active'}
                </span>
              </div>
              {initialDistributor.status === 'suspended' && initialDistributor.suspension_reason && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-1">Suspension Reason</p>
                  <p className="text-sm text-gray-900">{initialDistributor.suspension_reason}</p>
                </div>
              )}
              <div className="pt-3 space-y-2">
                {initialDistributor.status === 'active' && (
                  <button
                    onClick={() => setShowSuspendModal(true)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Suspend Account
                  </button>
                )}
                {initialDistributor.status === 'suspended' && (
                  <button
                    onClick={handleActivate}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Activate Account
                  </button>
                )}
                {initialDistributor.status !== 'deleted' && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Delete Account
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Matrix Info */}
          <div className="bg-white rounded-lg shadow p-3">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Matrix Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Position</p>
                <p className="text-lg font-semibold text-blue-600">
                  #{initialDistributor.matrix_position || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className="text-lg font-semibold">{initialDistributor.matrix_depth || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Master Account</p>
                <p className="text-lg font-semibold">
                  {initialDistributor.is_master ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow p-3">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Account Info</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Created</p>
                <p className="text-gray-900">
                  {new Date(initialDistributor.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Last Updated</p>
                <p className="text-gray-900">
                  {new Date(initialDistributor.updated_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">User ID</p>
                <p className="text-gray-900 font-mono text-xs break-all">
                  {initialDistributor.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && (
        <SuspendModal
          onClose={() => setShowSuspendModal(false)}
          onConfirm={handleSuspend}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          distributorName={`${initialDistributor.first_name} ${initialDistributor.last_name}`}
        />
      )}
    </div>
  );
}

// Suspend Modal Component
function SuspendModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Suspend Distributor</h3>
        <p className="text-gray-600 mb-4">
          Please provide a reason for suspending this distributor. This action can be reversed.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for suspension..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (reason.trim()) {
                onConfirm(reason);
              }
            }}
            disabled={!reason.trim()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Suspend
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete Modal Component
function DeleteModal({
  onClose,
  onConfirm,
  distributorName,
}: {
  onClose: () => void;
  onConfirm: () => void;
  distributorName: string;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Distributor</h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete <strong>{distributorName}</strong>? This will
          soft-delete the account. This action can be reversed by reactivating the account.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
