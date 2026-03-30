'use client';

// =============================================
// Bulk Sync Client Component
// UI for bulk syncing distributors to external platforms
// =============================================

import { useState, useEffect } from 'react';

interface DistributorWithoutSites {
  id: string;
  slug: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

interface SyncResult {
  distributorId: string;
  distributorName: string;
  success: boolean;
  error?: string;
}

export default function BulkSyncClient() {
  const [distributors, setDistributors] = useState<DistributorWithoutSites[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<SyncResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDistributorsWithoutSites();
  }, []);

  const fetchDistributorsWithoutSites = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/integrations/bulk-sync/distributors-without-sites');

      if (!response.ok) {
        throw new Error('Failed to fetch distributors');
      }

      const data = await response.json();
      setDistributors(data.data || []);
    } catch (err) {
      console.error('Error fetching distributors:', err);
      setError(err instanceof Error ? err.message : 'Failed to load distributors');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    setResults([]);
    setError(null);
    setProgress({ current: 0, total: distributors.length });

    const syncResults: SyncResult[] = [];

    for (let i = 0; i < distributors.length; i++) {
      const distributor = distributors[i];

      try {
        const response = await fetch('/api/admin/integrations/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            distributor_id: distributor.id,
            action: 'sync_all',
          }),
        });

        const data = await response.json();

        syncResults.push({
          distributorId: distributor.id,
          distributorName: `${distributor.first_name} ${distributor.last_name}`,
          success: response.ok && data.success,
          error: data.message || (response.ok ? undefined : 'Sync failed'),
        });
      } catch (err) {
        syncResults.push({
          distributorId: distributor.id,
          distributorName: `${distributor.first_name} ${distributor.last_name}`,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }

      setProgress({ current: i + 1, total: distributors.length });
      setResults([...syncResults]);

      // Small delay to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setSyncing(false);

    // Refresh the list after sync completes
    await fetchDistributorsWithoutSites();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Total Enrollees</p>
            <p className="text-3xl font-bold text-blue-900">{distributors.length}</p>
          </div>

          {syncing && (
            <>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-600 font-medium">Progress</p>
                <p className="text-3xl font-bold text-yellow-900">
                  {progress.current} / {progress.total}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-purple-900">
                  {progress.current > 0
                    ? Math.round((results.filter((r) => r.success).length / progress.current) * 100)
                    : 0}
                  %
                </p>
              </div>
            </>
          )}

          {!syncing && results.length > 0 && (
            <>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Successful</p>
                <p className="text-3xl font-bold text-green-900">
                  {results.filter((r) => r.success).length}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-600 font-medium">Failed</p>
                <p className="text-3xl font-bold text-red-900">
                  {results.filter((r) => !r.success).length}
                </p>
              </div>
            </>
          )}
        </div>

        {distributors.length === 0 && !syncing && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            ✓ All distributors have replicated sites!
          </div>
        )}

        {distributors.length > 0 && !syncing && (
          <div className="mt-6">
            <button
              onClick={handleSyncAll}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Sync All {distributors.length} Distributor{distributors.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}

        {syncing && (
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{
                  width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Syncing... {progress.current} of {progress.total} complete
            </p>
          </div>
        )}
      </div>

      {/* Distributors Without Sites */}
      {distributors.length > 0 && !syncing && results.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Distributors Without Replicated Sites
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {distributors.map((distributor) => (
                  <tr key={distributor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {distributor.first_name} {distributor.last_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      @{distributor.slug}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {distributor.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {new Date(distributor.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sync Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sync Results</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <div>
                  <p className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                    {result.distributorName}
                  </p>
                  {result.error && (
                    <p className="text-sm text-red-600 mt-1">{result.error}</p>
                  )}
                </div>
                <span className="text-2xl">
                  {result.success ? '✓' : '✗'}
                </span>
              </div>
            ))}
          </div>

          {!syncing && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setResults([]);
                  fetchDistributorsWithoutSites();
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Clear Results
              </button>
              {results.some((r) => !r.success) && (
                <button
                  onClick={handleSyncAll}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Retry Failed
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
