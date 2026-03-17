'use client';

// =============================================
// Replicated Sites Panel
// Shows distributor's replicated sites on external platforms
// Allows manual sync/retry for failed sites
// =============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { DistributorReplicatedSiteWithIntegration } from '@/lib/types';

interface ReplicatedSitesPanelProps {
  distributorId: string;
}

export default function ReplicatedSitesPanel({ distributorId }: ReplicatedSitesPanelProps) {
  const router = useRouter();
  const [sites, setSites] = useState<DistributorReplicatedSiteWithIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);

  useEffect(() => {
    fetchSites();
  }, [distributorId]);

  const fetchSites = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/distributors/${distributorId}/replicated-sites`);

      if (!response.ok) {
        throw new Error('Failed to fetch replicated sites');
      }

      const data = await response.json();
      setSites(data.data || []);
    } catch (err) {
      console.error('Error fetching replicated sites:', err);
      setError(err instanceof Error ? err.message : 'Failed to load replicated sites');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (integrationId: string) => {
    try {
      setRetryingId(integrationId);
      setError(null);

      const response = await fetch('/api/admin/integrations/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distributor_id: distributorId,
          integration_id: integrationId,
          action: 'retry_failed',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to retry sync');
      }

      // Refresh sites list
      await fetchSites();
      router.refresh();
    } catch (err) {
      console.error('Error retrying sync:', err);
      setError(err instanceof Error ? err.message : 'Failed to retry sync');
    } finally {
      setRetryingId(null);
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncingAll(true);
      setError(null);

      const response = await fetch('/api/admin/integrations/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distributor_id: distributorId,
          action: 'sync_all',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to sync sites');
      }

      // Refresh sites list
      await fetchSites();
      router.refresh();
    } catch (err) {
      console.error('Error syncing all:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync all sites');
    } finally {
      setSyncingAll(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '✓';
      case 'failed':
        return '✗';
      case 'pending':
        return '⏳';
      case 'suspended':
        return '⊗';
      default:
        return '?';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Replicated Sites</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Replicated Sites</h2>
        <button
          onClick={handleSyncAll}
          disabled={syncingAll}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {syncingAll ? 'Syncing...' : 'Sync All'}
        </button>
      </div>

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-md text-sm">
          {error}
        </div>
      )}

      {sites.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No replicated sites found</p>
          <button
            onClick={handleSyncAll}
            className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            Create Replicated Sites
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sites.map((site) => (
            <div
              key={site.id}
              className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">
                      {site.integration?.platform_display_name || 'Unknown Platform'}
                    </h3>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(
                        site.status
                      )}`}
                    >
                      {getStatusIcon(site.status)} {site.status.toUpperCase()}
                    </span>
                  </div>

                  {site.status === 'active' && site.site_url && (
                    <a
                      href={site.site_url.startsWith('http') ? site.site_url : `https://${site.site_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {site.site_url} →
                    </a>
                  )}

                  {site.status === 'failed' && site.last_sync_error && (
                    <p className="text-xs text-red-600 mt-1">
                      Error: {site.last_sync_error}
                    </p>
                  )}

                  <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                    {site.external_user_id && (
                      <p>External User ID: {site.external_user_id}</p>
                    )}
                    {site.external_username && (
                      <p>Username: {site.external_username}</p>
                    )}
                    <p>Sync Attempts: {site.sync_attempts}</p>
                    {site.last_sync_attempt_at && (
                      <p>
                        Last Sync:{' '}
                        {new Date(site.last_sync_attempt_at).toLocaleString()}
                      </p>
                    )}
                    {site.activated_at && (
                      <p>
                        Activated: {new Date(site.activated_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {site.status === 'failed' && (
                  <button
                    onClick={() => handleRetry(site.integration_id)}
                    disabled={retryingId === site.integration_id}
                    className="ml-3 px-3 py-1.5 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 disabled:opacity-50"
                  >
                    {retryingId === site.integration_id ? 'Retrying...' : 'Retry'}
                  </button>
                )}

                {site.status === 'pending' && (
                  <button
                    onClick={() => handleRetry(site.integration_id)}
                    disabled={retryingId === site.integration_id}
                    className="ml-3 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {retryingId === site.integration_id ? 'Creating...' : 'Create Now'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
