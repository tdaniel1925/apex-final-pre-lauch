// Debug page to see raw matrix data
import { requireAdmin } from '@/lib/auth/admin';
import { getMatrixStatistics, getMatrixLevel } from '@/lib/admin/matrix-manager';
import { createServiceClient } from '@/lib/supabase/service';

export default async function MatrixDebugPage() {
  await requireAdmin();

  const stats = await getMatrixStatistics();
  const level0 = await getMatrixLevel(0);
  const level1 = await getMatrixLevel(1);

  // Also get raw distributor data
  const serviceClient = createServiceClient();
  const { data: allDist } = await serviceClient
    .from('distributors')
    .select('*')
    .order('matrix_depth', { ascending: true });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Matrix Debug Data</h1>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Matrix Statistics (from function)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(stats, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Level 0 Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(level0, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Level 1 Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(level1, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">All Distributors (raw)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(allDist, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
