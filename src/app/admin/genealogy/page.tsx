// =============================================
// Admin Genealogy Page
// Full network sponsor tree visualization
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { buildSponsorTree, searchDistributors } from '@/lib/genealogy/tree-service';
import { createServiceClient } from '@/lib/supabase/service';
import TreeView, { TreeStats } from '@/components/genealogy/TreeView';
import GenealogyControls from '@/components/genealogy/GenealogyControls';

export const metadata = {
  title: 'Genealogy Tree - Admin Portal',
  description: 'View network sponsor tree',
};

interface PageProps {
  searchParams: Promise<{
    start?: string;
    depth?: string;
    search?: string;
  }>;
}

export default async function AdminGenealogyPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const startDistributorId = params.start || null;
  const maxDepth = parseInt(params.depth || '7');
  const searchTerm = params.search || '';

  const serviceClient = createServiceClient();

  // If searching, show search results
  let searchResults = null;
  if (searchTerm) {
    searchResults = await searchDistributors(searchTerm, 20, serviceClient);
  }

  // Build tree
  const { tree, stats } = await buildSponsorTree(
    startDistributorId,
    maxDepth,
    serviceClient
  );

  // Get current root info for breadcrumb
  let currentRoot = null;
  if (startDistributorId && tree) {
    currentRoot = tree.distributor;
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Network Genealogy</h1>
        <p className="text-sm text-gray-600 mt-1">
          Sponsor tree showing who recruited whom
        </p>
      </div>

      {/* Stats */}
      <TreeStats stats={stats} />

      {/* Controls */}
      <GenealogyControls
        currentRootId={startDistributorId}
        currentDepth={maxDepth}
        searchTerm={searchTerm}
        searchResults={searchResults}
      />

      {/* Breadcrumb */}
      {currentRoot && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-800 mb-0.5">Viewing tree from:</p>
              <p className="font-semibold text-blue-900">
                {currentRoot.first_name} {currentRoot.last_name} (@{currentRoot.slug})
              </p>
            </div>
            <a
              href="/admin/genealogy"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Reset to Master
            </a>
          </div>
        </div>
      )}

      {/* Tree */}
      {!tree ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No distributors found</p>
        </div>
      ) : (
        <TreeView
          rootNode={tree}
          enableNavigation={true}
          baseUrl={`/admin/genealogy&depth=${maxDepth}`}
          maxInitialDepth={3}
        />
      )}

      {/* Depth Pagination */}
      {stats.maxDepth >= maxDepth && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 mb-2">
            Tree limited to {maxDepth} levels. Increase depth to see more:
          </p>
          <div className="flex gap-2">
            {[7, 10, 15, 20].map((depth) => (
              <a
                key={depth}
                href={`/admin/genealogy?${startDistributorId ? `start=${startDistributorId}&` : ''}depth=${depth}`}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  maxDepth === depth
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                }`}
              >
                {depth} Levels
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
