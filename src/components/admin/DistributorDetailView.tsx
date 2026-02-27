'use client';

// =============================================
// Distributor Detail View Component
// Edit distributor, suspend, delete
// =============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Distributor } from '@/lib/types';
import type { AdminRole } from '@/lib/auth/admin';
import SponsorLineage from './SponsorLineage';
import PersonalDownline from './PersonalDownline';
import MatrixChildren from './MatrixChildren';
import TeamStatistics from './TeamStatistics';
import EnrolleeStats from './EnrolleeStats';
import MatrixPositionManager from './MatrixPositionManager';
import { LicensingStatusBadge } from '@/components/common';
import ResendWelcomeButton from '@/components/dashboard/ResendWelcomeButton';
import NotesPanel from './NotesPanel';
import ActivityLogPanel from './ActivityLogPanel';
import PasswordResetModal from './PasswordResetModal';

interface DistributorDetailViewProps {
  distributor: Distributor;
  currentAdminRole: AdminRole;
}

export default function DistributorDetailView({
  distributor: initialDistributor,
  currentAdminRole,
}: DistributorDetailViewProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLicenseStatusModal, setShowLicenseStatusModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [isVerifyingLicense, setIsVerifyingLicense] = useState(false);
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

  const handleVerifyLicense = async () => {
    setIsVerifyingLicense(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/distributors/${initialDistributor.id}/licensing-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to verify license');
      }

      setSuccess('License verified successfully');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVerifyingLicense(false);
    }
  };

  const handleChangeLicensingStatus = async (newStatus: 'licensed' | 'non_licensed') => {
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/distributors/${initialDistributor.id}/licensing-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_status', licensing_status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change licensing status');
      }

      setSuccess('Licensing status updated successfully');
      setShowLicenseStatusModal(false);
      router.refresh();
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
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push('/admin/distributors')}
            className="px-3 py-1.5 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
          >
            Back to List
          </button>
          <ResendWelcomeButton variant="admin" distributorId={initialDistributor.id} />
          <button
            onClick={() => setShowPasswordResetModal(true)}
            className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700"
          >
            Reset Password
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
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmailChangeModal(true)}
                    className="px-3 py-1.5 bg-orange-600 text-white text-xs rounded-md hover:bg-orange-700 whitespace-nowrap"
                  >
                    Change Email
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Admin can change email address</p>
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

          {/* Team Statistics */}
          <TeamStatistics distributorId={initialDistributor.id} />

          {/* Enrollee Statistics */}
          <EnrolleeStats distributorId={initialDistributor.id} />

          {/* Licensing Status */}
          <div className="bg-white rounded-lg shadow p-3">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Licensing Status</h2>
            <div className="space-y-3">
              {/* Current Status Badge */}
              <div>
                <p className="text-xs text-gray-600 mb-2">Current Status</p>
                <LicensingStatusBadge
                  status={initialDistributor.licensing_status}
                  verified={initialDistributor.licensing_verified}
                  size="md"
                />
              </div>

              {/* Status Details */}
              <div className="pt-2 space-y-2 text-sm">
                {initialDistributor.licensing_status_set_at && (
                  <div>
                    <p className="text-xs text-gray-600">Status Set</p>
                    <p className="text-gray-900">
                      {new Date(initialDistributor.licensing_status_set_at).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {initialDistributor.licensing_verified && initialDistributor.licensing_verified_at && (
                  <div>
                    <p className="text-xs text-gray-600">Verified On</p>
                    <p className="text-gray-900">
                      {new Date(initialDistributor.licensing_verified_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 space-y-2">
                {/* Verify Button - Only show for licensed users who aren't verified */}
                {initialDistributor.licensing_status === 'licensed' && !initialDistributor.licensing_verified && (
                  <button
                    onClick={handleVerifyLicense}
                    disabled={isVerifyingLicense}
                    className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isVerifyingLicense ? 'Verifying...' : '✓ Verify License'}
                  </button>
                )}

                {/* Change Status Button */}
                <button
                  onClick={() => setShowLicenseStatusModal(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Change Licensing Status
                </button>
              </div>

              {/* Help Text */}
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  {initialDistributor.licensing_status === 'licensed'
                    ? 'Licensed agents have access to insurance features and advanced tools.'
                    : 'Non-licensed distributors have access to team building and marketing tools.'}
                </p>
              </div>
            </div>
          </div>

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
                {/* Only super admins can delete accounts */}
                {initialDistributor.status !== 'deleted' && currentAdminRole === 'super_admin' && (
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

          {/* Matrix Position Management */}
          <MatrixPositionManager distributor={initialDistributor} />

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

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          {/* Admin Notes */}
          <NotesPanel distributorId={initialDistributor.id} currentAdminRole={currentAdminRole} />

          {/* Activity Log */}
          <ActivityLogPanel distributorId={initialDistributor.id} />
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

      {/* Licensing Status Modal */}
      {showLicenseStatusModal && (
        <LicensingStatusModal
          onClose={() => setShowLicenseStatusModal(false)}
          onConfirm={handleChangeLicensingStatus}
          currentStatus={initialDistributor.licensing_status}
          distributorName={`${initialDistributor.first_name} ${initialDistributor.last_name}`}
        />
      )}

      {/* Password Reset Modal */}
      {showPasswordResetModal && (
        <PasswordResetModal
          distributorId={initialDistributor.id}
          distributorName={`${initialDistributor.first_name} ${initialDistributor.last_name}`}
          distributorEmail={initialDistributor.email}
          onClose={() => setShowPasswordResetModal(false)}
        />
      )}

      {/* Email Change Modal */}
      {showEmailChangeModal && (
        <EmailChangeModal
          distributorId={initialDistributor.id}
          currentEmail={initialDistributor.email}
          distributorName={`${initialDistributor.first_name} ${initialDistributor.last_name}`}
          onClose={() => setShowEmailChangeModal(false)}
          onSuccess={() => {
            setSuccess('Email updated successfully. User will receive a verification email.');
            setShowEmailChangeModal(false);
            router.refresh();
          }}
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

// Email Change Modal Component
function EmailChangeModal({
  distributorId,
  currentEmail,
  distributorName,
  onClose,
  onSuccess,
}: {
  distributorId: string;
  currentEmail: string;
  distributorName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (newEmail !== confirmEmail) {
      setError('Email addresses do not match');
      return;
    }

    if (newEmail === currentEmail) {
      setError('New email must be different from current email');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/distributors/${distributorId}/change-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update email');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Change Email Address</h3>
        <p className="text-gray-600 mb-4">
          Change the email address for <strong>{distributorName}</strong>. The user will receive
          a verification email at the new address and must verify it before it takes effect.
        </p>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Current Email:</strong> {currentEmail}
          </p>
        </div>

        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Email Address *
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Email *
            </label>
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ The user will need to verify the new email address. They will receive a verification
            link and won't be able to log in until they verify it.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !newEmail || !confirmEmail}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Updating...' : 'Change Email'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Licensing Status Modal Component
function LicensingStatusModal({
  onClose,
  onConfirm,
  currentStatus,
  distributorName,
}: {
  onClose: () => void;
  onConfirm: (newStatus: 'licensed' | 'non_licensed') => void;
  currentStatus: 'licensed' | 'non_licensed';
  distributorName: string;
}) {
  const [selectedStatus, setSelectedStatus] = useState<'licensed' | 'non_licensed'>(currentStatus);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Change Licensing Status</h3>
        <p className="text-gray-600 mb-4">
          Update the licensing status for <strong>{distributorName}</strong>. This will affect
          which features they can access in their dashboard.
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
                <span className="font-semibold text-gray-900">Licensed Agent</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Full access to insurance features, advanced commissions, and client tools.
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
                <span className="font-semibold text-gray-900">Non-Licensed</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Access to team building, marketing tools, and referral features.
              </p>
            </div>
          </label>
        </div>

        {currentStatus !== selectedStatus && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Changing the licensing status will immediately affect the distributor's dashboard
              access and available features.
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedStatus)}
            disabled={currentStatus === selectedStatus}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
}
