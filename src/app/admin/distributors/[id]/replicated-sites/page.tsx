// =============================================
// Admin Distributor Replicated Sites Page
// View and manage distributor's replicated sites
// =============================================

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { DistributorReplicatedSiteWithIntegration, Distributor } from '@/lib/types';

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    suspended: 'bg-gray-100 text-gray-800',
  };

  const color = colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
      {status}
    </span>
  );
}

export default function DistributorReplicatedSitesPage() {
  const params = useParams();
  const distributorId = params.id as string;

  const [distributor, setDistributor] = useState<Distributor | null>(null);
  const [sites, setSites] = useState<DistributorReplicatedSiteWithIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [distributorId]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      // Fetch distributor
      const { data: distributorData, error: distributorError } = await supabase
        .from('distributors')
        .select('*')
        .eq('id', distributorId)
        .single();

      if (distributorError) throw distributorError;

      setDistributor(distributorData);

      // Fetch replicated sites
      const { data: sitesData, error: sitesError } = await supabase
        .from('distributor_replicated_sites')
        .select(`
          *,
          integration:platform_integrations(*)
        `)
        .eq('distributor_id', distributorId)
        .order('created_at', { ascending: false });

      if (sitesError) throw sitesError;

      setSites(sitesData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleSync(action: 'sync_all' | 'sync_specific' | 'retry_failed', integrationId?: string) {
    try {
      setSyncing(integrationId || 'all');
      setError(null);

      const response = await fetch('/api/admin/integrations/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distributor_id: distributorId,
          integration_id: integrationId,
          action,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Sync failed');
      }

      // Reload data to show updated status
      await loadData();
    } catch (err) {
      console.error('Sync error:', err);
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!distributor) {
    return (
      <div className="p-8">
        <div className="text-gray-500">Distributor not found</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link href="/admin/distributors" className="hover:text-blue-600">
            Distributors
          </Link>
          <span>/</span>
          <Link href={`/admin/distributors/${distributorId}`} className="hover:text-blue-600">
            {distributor.first_name} {distributor.last_name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">Replicated Sites</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Replicated Sites
            </h1>
            <p className="text-gray-600 mt-1">
              {distributor.first_name} {distributor.last_name} (@{distributor.slug})
            </p>
          </div>

          <button
            onClick={() => handleSync('sync_all')}
            disabled={syncing !== null}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {syncing === 'all' ? 'Syncing...' : 'Sync All'}
          </button>
        </div>
      </div>

      {/* Sites List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {sites.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-medium mb-2">No replicated sites yet</p>
            <p className="text-gray-500 text-sm mb-4">
              Click &quot;Sync All&quot; to create sites on all enabled platforms
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Sync
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sites.map((site) => (
                  <tr key={site.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {site.integration.platform_display_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {site.integration.platform_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {site.status === 'active' ? (
                        <a
                          href={`https://${site.site_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {site.site_url}
                        </a>
                      ) : (
                        <span className="text-gray-500">{site.site_url}</span>
                      )}
                      {site.external_user_id && (
                        <div className="text-xs text-gray-400 mt-1">
                          ID: {site.external_user_id}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={site.status} />
                      {site.status === 'failed' && site.last_sync_error && (
                        <div className="text-xs text-red-600 mt-1">
                          {site.last_sync_error.substring(0, 50)}
                          {site.last_sync_error.length > 50 ? '...' : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {site.last_sync_attempt_at ? (
                        <>
                          {new Date(site.last_sync_attempt_at).toLocaleDateString()}
                          <div className="text-xs text-gray-400">
                            {site.sync_attempts} attempt{site.sync_attempts !== 1 ? 's' : ''}
                          </div>
                        </>
                      ) : (
                        'Never'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {site.status === 'failed' && (
                        <button
                          onClick={() => handleSync('retry_failed', site.integration_id)}
                          disabled={syncing !== null}
                          className="text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          {syncing === site.integration_id ? 'Retrying...' : 'Retry'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
