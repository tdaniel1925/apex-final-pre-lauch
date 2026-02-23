'use client';

// =============================================
// Add Rep to Matrix Modal
// Two modes: Create new rep OR place existing rep
// =============================================

import { useState, useEffect } from 'react';
import type { Distributor } from '@/lib/types';

interface AddRepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Tab = 'create' | 'place';

export default function AddRepModal({ isOpen, onClose, onSuccess }: AddRepModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Tab 1: Create new rep state
  const [newRepForm, setNewRepForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    parentId: '',
  });

  // Tab 2: Place existing rep state
  const [selectedRepId, setSelectedRepId] = useState('');
  const [parentIdForPlacement, setParentIdForPlacement] = useState('');
  const [unplacedReps, setUnplacedReps] = useState<Distributor[]>([]);
  const [availableParents, setAvailableParents] = useState<
    Array<{ distributor: Distributor; availableSlots: number }>
  >([]);

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUnplacedReps();
      fetchAvailableParents();
    }
  }, [isOpen]);

  const fetchUnplacedReps = async () => {
    try {
      const res = await fetch('/api/admin/matrix/unplaced-reps');
      const data = await res.json();
      if (data.success) {
        setUnplacedReps(data.reps);
      }
    } catch (err) {
      console.error('Error fetching unplaced reps:', err);
    }
  };

  const fetchAvailableParents = async () => {
    try {
      const res = await fetch('/api/admin/matrix/available-parents');
      const data = await res.json();
      if (data.success) {
        setAvailableParents(data.parents);
      }
    } catch (err) {
      console.error('Error fetching available parents:', err);
    }
  };

  const handleCreateNewRep = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/matrix/create-and-place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newRepForm.firstName,
          lastName: newRepForm.lastName,
          email: newRepForm.email,
          phone: newRepForm.phone,
          companyName: newRepForm.companyName,
          parentId: newRepForm.parentId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Rep created and placed successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
          resetForm();
        }, 1500);
      } else {
        setError(data.error || 'Failed to create rep');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceExistingRep = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/matrix/place-existing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distributorId: selectedRepId,
          parentId: parentIdForPlacement,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Rep placed successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
          resetForm();
        }, 1500);
      } else {
        setError(data.error || 'Failed to place rep');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewRepForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      companyName: '',
      parentId: '',
    });
    setSelectedRepId('');
    setParentIdForPlacement('');
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Add Rep to Matrix</h2>
          <button
            onClick={handleClose}
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

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'create'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create New Rep
              </div>
            </button>
            <button
              onClick={() => setActiveTab('place')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'place'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Place Existing Rep
              </div>
            </button>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'create' ? (
            <form onSubmit={handleCreateNewRep} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newRepForm.firstName}
                    onChange={(e) =>
                      setNewRepForm({ ...newRepForm, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newRepForm.lastName}
                    onChange={(e) =>
                      setNewRepForm({ ...newRepForm, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newRepForm.email}
                  onChange={(e) =>
                    setNewRepForm({ ...newRepForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john.doe@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={newRepForm.phone}
                  onChange={(e) =>
                    setNewRepForm({ ...newRepForm, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={newRepForm.companyName}
                  onChange={(e) =>
                    setNewRepForm({ ...newRepForm, companyName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Acme Corporation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Place Under Parent <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={newRepForm.parentId}
                  onChange={(e) =>
                    setNewRepForm({ ...newRepForm, parentId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a parent...</option>
                  {availableParents.map(({ distributor, availableSlots }) => (
                    <option key={distributor.id} value={distributor.id}>
                      {distributor.first_name} {distributor.last_name} (@{distributor.slug}) - Level{' '}
                      {distributor.matrix_depth} - {availableSlots} slot
                      {availableSlots !== 1 ? 's' : ''} available
                    </option>
                  ))}
                </select>
                {availableParents.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Loading available positions...
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Creating...' : 'Create & Place Rep'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePlaceExistingRep} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Rep to Place <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedRepId}
                  onChange={(e) => setSelectedRepId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a rep...</option>
                  {unplacedReps.map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      {rep.first_name} {rep.last_name} - {rep.email}
                    </option>
                  ))}
                </select>
                {unplacedReps.length === 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ All reps are already placed in the matrix
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Place Under Parent <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={parentIdForPlacement}
                  onChange={(e) => setParentIdForPlacement(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a parent...</option>
                  {availableParents.map(({ distributor, availableSlots }) => (
                    <option key={distributor.id} value={distributor.id}>
                      {distributor.first_name} {distributor.last_name} (@{distributor.slug}) - Level{' '}
                      {distributor.matrix_depth} - {availableSlots} slot
                      {availableSlots !== 1 ? 's' : ''} available
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading || unplacedReps.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Placing...' : 'Place Rep'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
