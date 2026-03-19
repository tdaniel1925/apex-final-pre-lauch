'use client';

// =============================================
// Version History Component
// View and manage compensation configuration versions
// Now with REAL API integration!
// =============================================

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ConfigVersion {
  id: string;
  version: string;
  name: string;
  createdAt: string;
  createdBy: string;
  effectiveDate: string | null;
  status: 'draft' | 'active' | 'archived';
  description?: string;
}

export default function VersionHistory() {
  const [versions, setVersions] = useState<ConfigVersion[]>([
    {
      id: '1',
      version: '1.0.0',
      name: 'Default Configuration',
      createdAt: '2026-01-01T00:00:00Z',
      createdBy: 'Bill Propper',
      effectiveDate: '2026-01-01',
      status: 'active',
      description: 'Initial compensation plan configuration',
    },
    {
      id: '2',
      version: '1.1.0',
      name: 'Q1 2026 Adjustments',
      createdAt: '2026-02-15T10:30:00Z',
      createdBy: 'Bill Propper',
      effectiveDate: null,
      status: 'draft',
      description: 'Increased bonus pool percentages for Q1 promotion',
    },
    {
      id: '3',
      version: '0.9.0',
      name: 'Pre-Launch Test Configuration',
      createdAt: '2025-12-15T08:00:00Z',
      createdBy: 'Bill Propper',
      effectiveDate: '2025-12-15',
      status: 'archived',
      description: 'Test configuration used during pre-launch phase',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'active' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch version history from API on mount
  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/admin/compensation/config/history?limit=50');
        const data = await res.json();

        if (data.success && data.data && data.data.history) {
          // Convert from database format to component format
          const fetchedVersions = data.data.history.map((h: any) => ({
            id: h.id,
            version: h.version || '1.0.0',
            name: h.name || 'Configuration Version',
            createdAt: h.changed_at || h.created_at,
            createdBy: h.changed_by || h.admin_email || 'System',
            effectiveDate: h.effective_date || null,
            status: h.is_active ? 'active' : 'draft',
            description: h.changes_summary || '',
          }));
          setVersions(fetchedVersions);
        } else {
          setError(data.error || 'Failed to load version history');
        }
      } catch (err) {
        console.error('Error fetching version history:', err);
        setError('Network error while loading version history');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const filteredVersions = versions.filter(v => {
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.version.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleView = (versionId: string) => {
    // TODO: Load version details and show in modal
    // await fetch(`/api/admin/compensation/versions/${versionId}`)
  };

  const handleActivate = (versionId: string) => {
    // TODO: Confirm and activate version via API
    // await fetch(`/api/admin/compensation/versions/${versionId}/activate`, { method: 'POST' })
    setVersions(prev =>
      prev.map(v => ({
        ...v,
        status: v.id === versionId ? 'active' : v.status === 'active' ? 'archived' : v.status,
        effectiveDate: v.id === versionId ? new Date().toISOString().split('T')[0] : v.effectiveDate,
      }))
    );
  };

  const handleDuplicate = (versionId: string) => {
    const versionToDuplicate = versions.find(v => v.id === versionId);
    if (versionToDuplicate) {
      const newVersion: ConfigVersion = {
        ...versionToDuplicate,
        id: String(versions.length + 1),
        version: `${versionToDuplicate.version}-copy`,
        name: `${versionToDuplicate.name} (Copy)`,
        createdAt: new Date().toISOString(),
        createdBy: 'Current User',
        effectiveDate: null,
        status: 'draft',
      };
      setVersions(prev => [newVersion, ...prev]);
    }
  };

  const handleDelete = (versionId: string) => {
    if (confirm('Are you sure you want to delete this version? This action cannot be undone.')) {
      setVersions(prev => prev.filter(v => v.id !== versionId));
    }
  };

  const getStatusBadge = (status: ConfigVersion['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            ACTIVE
          </span>
        );
      case 'draft':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            DRAFT
          </span>
        );
      case 'archived':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
            ARCHIVED
          </span>
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading version history...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Version History</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Version History</h2>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or version..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('active')}
              >
                Active
              </Button>
              <Button
                variant={filterStatus === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('draft')}
              >
                Drafts
              </Button>
              <Button
                variant={filterStatus === 'archived' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('archived')}
              >
                Archived
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Effective Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVersions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No versions found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredVersions.map((version) => (
                  <tr key={version.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{version.version}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{version.name}</div>
                      {version.description && (
                        <div className="text-xs text-gray-500 mt-1">{version.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(version.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(version.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{version.createdBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {version.effectiveDate ? new Date(version.effectiveDate).toLocaleDateString() : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(version.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(version.id)}
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Button>
                        {version.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivate(version.id)}
                            title="Activate"
                          >
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(version.id)}
                          title="Duplicate"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </Button>
                        {version.status !== 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(version.id)}
                            title="Delete"
                          >
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
