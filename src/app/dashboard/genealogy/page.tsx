// =============================================
// User Genealogy Page
// Personal downline sponsor tree (distributors only)
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { buildSponsorTree } from '@/lib/genealogy/tree-service';
import TreeView, { TreeStats } from '@/components/genealogy/TreeView';
import type { Distributor } from '@/lib/types';

export const metadata = {
  title: 'My Genealogy - Apex Affinity Group',
  description: 'View your personal downline tree',
};

interface PageProps {
  searchParams: Promise<{
    depth?: string;
  }>;
}

export default async function UserGenealogyPage({ searchParams }: PageProps) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get distributor data
  const serviceClient = createServiceClient();
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    redirect('/signup');
  }

  const dist = distributor as Distributor;
  const params = await searchParams;
  const maxDepth = parseInt(params.depth || '7');

  // Build tree starting from this distributor
  const { tree, stats } = await buildSponsorTree(
    dist.id,
    maxDepth,
    serviceClient
  );

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">My Genealogy Tree</h1>
        <p className="text-sm text-gray-600 mt-1">
          Your personal downline - members you've sponsored
        </p>
      </div>

      {/* User Info */}
      <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-purple-800 mb-0.5">Your Position</p>
            <p className="font-semibold text-purple-900 text-lg">
              {dist.first_name} {dist.last_name}
            </p>
            <p className="text-sm text-purple-700">@{dist.slug}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-purple-800">Level</p>
            <p className="text-2xl font-bold text-purple-900">{dist.matrix_depth}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <TreeStats stats={stats} />

      {/* Empty State */}
      {!tree || tree.children.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Downline Yet
          </h3>
          <p className="text-gray-600 mb-4">
            You haven't sponsored any distributors yet. Share your replicated site to start building your team!
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Your Referral Link
          </a>
        </div>
      ) : (
        <>
          {/* Tree */}
          <TreeView
            rootNode={tree}
            maxInitialDepth={3}
          />

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
                    href={`/dashboard/genealogy?depth=${depth}`}
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
        </>
      )}
    </div>
  );
}
