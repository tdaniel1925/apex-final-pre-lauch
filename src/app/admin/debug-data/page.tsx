// =============================================
// Debug Data Page
// Check what data is actually in the database
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';

export default async function DebugDataPage() {
  await requireAdmin();
  const serviceClient = createServiceClient();

  // Get all distributors
  const { data: allDistributors, error: allError } = await serviceClient
    .from('distributors')
    .select('*');

  // Get count
  const { count: totalCount, error: countError } = await serviceClient
    .from('distributors')
    .select('*', { count: 'exact', head: true });

  // Test the RPC functions
  let matrixStatsResult = null;
  let avgDepthResult = null;
  try {
    const { data: matrixData, error: matrixError } = await serviceClient.rpc('get_matrix_stats');
    matrixStatsResult = { data: matrixData, error: matrixError?.message };
  } catch (e: any) {
    matrixStatsResult = { error: e.message };
  }

  try {
    const { data: avgData, error: avgError } = await serviceClient.rpc('avg_matrix_depth');
    avgDepthResult = { data: avgData, error: avgError?.message };
  } catch (e: any) {
    avgDepthResult = { error: e.message };
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Debug Data</h1>

      <div className="space-y-8">
        {/* Count Query */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Count Query</h2>
          <p className="mb-2"><strong>Total Count:</strong> {totalCount ?? 'null'}</p>
          {countError && (
            <div className="bg-red-50 text-red-800 p-4 rounded">
              <strong>Error:</strong> {countError.message}
            </div>
          )}
        </div>

        {/* All Distributors */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">All Distributors Query</h2>
          <p className="mb-2"><strong>Count:</strong> {allDistributors?.length ?? 0}</p>
          {allError && (
            <div className="bg-red-50 text-red-800 p-4 rounded mb-4">
              <strong>Error:</strong> {allError.message}
            </div>
          )}
          {allDistributors && allDistributors.length > 0 && (
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
              {JSON.stringify(allDistributors, null, 2)}
            </pre>
          )}
        </div>

        {/* Matrix Stats RPC */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Matrix Stats RPC</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(matrixStatsResult, null, 2)}
          </pre>
        </div>

        {/* Avg Depth RPC */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Avg Depth RPC</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(avgDepthResult, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
