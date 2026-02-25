'use client';

// =============================================
// Admin Prospects Management Page
// View and manage sign-up leads
// =============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Prospect {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  how_did_you_hear: string | null;
  signup_event: string | null;
  status: string;
  created_at: string;
  converted_to_distributor_id: string | null;
}

interface Distributor {
  id: string;
  first_name: string;
  last_name: string;
  slug: string;
}

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Convert modal state
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [convertUsername, setConvertUsername] = useState('');
  const [convertSponsorId, setConvertSponsorId] = useState('');
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/prospects');
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to load prospects');
      }

      setProspects(result.prospects || []);
    } catch (err: any) {
      console.error('Error fetching prospects:', err);
      setError(err.message || 'Failed to load prospects');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProspects = prospects.filter((prospect) => {
    const matchesSearch =
      prospect.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || prospect.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      converted: 'bg-purple-100 text-purple-800',
      declined: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusChange = async (prospectId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/prospects/${prospectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update status');
      }

      // Update local state
      setProspects(prospects.map(p =>
        p.id === prospectId ? { ...p, status: newStatus } : p
      ));
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (prospectId: string) => {
    if (!confirm('Are you sure you want to delete this prospect?')) return;

    try {
      const response = await fetch(`/api/admin/prospects/${prospectId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete prospect');
      }

      setProspects(prospects.filter(p => p.id !== prospectId));
    } catch (err: any) {
      console.error('Error deleting prospect:', err);
      alert('Failed to delete prospect');
    }
  };

  const handleOpenConvertModal = async (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setConvertUsername('');
    setConvertSponsorId('');
    setConvertError(null);
    setShowConvertModal(true);

    // Load distributors for sponsor selection
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data } = await supabase
        .from('distributors')
        .select('id, first_name, last_name, slug')
        .eq('status', 'active')
        .order('first_name', { ascending: true })
        .limit(100);

      setDistributors(data || []);
    } catch (err) {
      console.error('Error loading distributors:', err);
    }
  };

  const handleConvert = async () => {
    if (!selectedProspect || !convertUsername || !convertSponsorId) {
      setConvertError('Please fill in all required fields');
      return;
    }

    try {
      setIsConverting(true);
      setConvertError(null);

      const response = await fetch(`/api/admin/prospects/${selectedProspect.id}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: convertUsername,
          sponsorId: convertSponsorId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to convert');
      }

      // Update local state
      setProspects(prospects.map(p =>
        p.id === selectedProspect.id
          ? { ...p, status: 'converted', converted_to_distributor_id: data.distributor.id }
          : p
      ));

      setShowConvertModal(false);
      alert(`Successfully converted ${selectedProspect.first_name} ${selectedProspect.last_name} to distributor!`);
    } catch (err: any) {
      console.error('Error converting prospect:', err);
      setConvertError(err.message || 'Failed to convert prospect');
    } finally {
      setIsConverting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Prospects Management</h1>
        <p className="text-gray-600">Manage sign-up leads and convert to distributors</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Prospects</p>
          <p className="text-2xl font-bold text-gray-900">{prospects.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">New</p>
          <p className="text-2xl font-bold text-blue-600">
            {prospects.filter(p => p.status === 'new').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Contacted</p>
          <p className="text-2xl font-bold text-yellow-600">
            {prospects.filter(p => p.status === 'contacted').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Converted</p>
          <p className="text-2xl font-bold text-green-600">
            {prospects.filter(p => p.status === 'converted').length}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Prospects Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Signed Up
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProspects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No prospects found
                  </td>
                </tr>
              ) : (
                filteredProspects.map((prospect) => (
                  <tr key={prospect.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {prospect.first_name} {prospect.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{prospect.email}</div>
                      {prospect.phone && (
                        <div className="text-sm text-gray-500">{prospect.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {prospect.city && prospect.state ? (
                          `${prospect.city}, ${prospect.state}`
                        ) : (
                          <span className="text-gray-400"></span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(prospect.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(prospect.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <select
                          value={prospect.status}
                          onChange={(e) => handleStatusChange(prospect.id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                          disabled={prospect.status === 'converted'}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="converted">Converted</option>
                          <option value="declined">Declined</option>
                        </select>
                        {prospect.status !== 'converted' && (
                          <button
                            onClick={() => handleOpenConvertModal(prospect)}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Convert
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(prospect.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Convert to Distributor Modal */}
      {showConvertModal && selectedProspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Convert to Distributor
            </h2>

            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Converting:</p>
              <p className="font-medium text-gray-900">
                {selectedProspect.first_name} {selectedProspect.last_name}
              </p>
              <p className="text-sm text-gray-600">{selectedProspect.email}</p>
            </div>

            {convertError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
                {convertError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username * <span className="text-xs text-gray-500">(distributor login)</span>
                </label>
                <input
                  type="text"
                  id="username"
                  value={convertUsername}
                  onChange={(e) => setConvertUsername(e.target.value)}
                  placeholder="e.g., johndoe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={isConverting}
                />
              </div>

              <div>
                <label htmlFor="sponsor" className="block text-sm font-medium text-gray-700 mb-1">
                  Sponsor *
                </label>
                <select
                  id="sponsor"
                  value={convertSponsorId}
                  onChange={(e) => setConvertSponsorId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={isConverting}
                >
                  <option value="">Select a sponsor...</option>
                  {distributors.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {dist.first_name} {dist.last_name} ({dist.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-gray-500">
                <p>Note: The new distributor will be placed in the matrix under the selected sponsor.</p>
                <p className="mt-1">They will need to set their password using the "Forgot Password" link.</p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleConvert}
                disabled={isConverting || !convertUsername || !convertSponsorId}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConverting ? 'Converting...' : 'Convert to Distributor'}
              </button>
              <button
                onClick={() => setShowConvertModal(false)}
                disabled={isConverting}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
