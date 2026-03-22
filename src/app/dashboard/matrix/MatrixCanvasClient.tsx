'use client';

// =============================================
// Rep Matrix Canvas Client
// Shows rep's downline in 5×7 placement matrix
// =============================================

import { useState, useEffect } from 'react';
import HierarchyCanvas from '@/components/admin/hierarchy/HierarchyCanvas';
import type { TreeNode } from '@/components/admin/hierarchy/HierarchyCanvas';

interface MatrixCanvasClientProps {
  distributorId: string;
}

export default function MatrixCanvasClient({ distributorId }: MatrixCanvasClientProps) {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTreeData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch tree data starting from this distributor
        const url = new URL('/api/admin/matrix/tree', window.location.origin);
        url.searchParams.set('rootId', distributorId);
        url.searchParams.set('maxDepth', '3');

        const response = await fetch(url.toString());

        if (!response.ok) {
          throw new Error('Failed to fetch matrix tree');
        }

        const data = await response.json();

        if (data.success) {
          setTreeData(data.root);
        } else {
          throw new Error(data.error || 'Failed to fetch matrix tree');
        }
      } catch (err: any) {
        console.error('Error fetching tree data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTreeData();
  }, [distributorId]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-sm text-slate-400">Loading your matrix...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <div className="text-center max-w-md">
          <svg
            className="w-16 h-16 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-bold text-white mb-2">Failed to Load Matrix</h3>
          <p className="text-sm text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!treeData) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-slate-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-lg font-bold text-white mb-2">No Matrix Data</h3>
          <p className="text-sm text-slate-400">You don't have any team members yet.</p>
        </div>
      </div>
    );
  }

  return <HierarchyCanvas rootDistributor={treeData} maxDepth={3} />;
}
