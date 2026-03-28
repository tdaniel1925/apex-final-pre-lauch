'use client';

// =============================================
// Hierarchy Canvas Client Component
// Fetches and displays the matrix tree
// =============================================

import { useState, useEffect } from 'react';
import HierarchyCanvas from '@/components/admin/hierarchy/HierarchyCanvas';

interface TreeNode {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  slug: string;
  rep_number: string | null;
  status: string;
  profile_image: string | null;
  matrix_parent_id: string | null;
  matrix_position: number | null;
  matrix_depth: number;
  sponsor_id: string | null;

  // ⚠️ CACHED FIELDS - Display only, may be stale
  // For live BV data, JOIN with members table:
  // members.personal_credits_monthly, members.team_credits_monthly
  /** @deprecated Display only - cached/stale, use members.personal_credits_monthly for live data */
  personal_bv_monthly: number | null;
  /** @deprecated Display only - cached/stale, use members.team_credits_monthly for live data */
  group_bv_monthly: number | null;

  created_at: string;
  children?: TreeNode[];
  childCount?: number;
}

interface HierarchyCanvasClientProps {
  rootId: string | null;
  maxDepth: number;
}

export default function HierarchyCanvasClient({ rootId, maxDepth }: HierarchyCanvasClientProps) {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTreeData() {
      try {
        setLoading(true);
        setError(null);

        const url = new URL('/api/admin/matrix/tree', window.location.origin);
        if (rootId) {
          url.searchParams.set('rootId', rootId);
        }
        url.searchParams.set('maxDepth', maxDepth.toString());

        const response = await fetch(url.toString());

        if (!response.ok) {
          throw new Error('Failed to fetch tree data');
        }

        const data = await response.json();

        if (data.success) {
          setTreeData(data.root);
        } else {
          throw new Error(data.error || 'Failed to fetch tree data');
        }
      } catch (err: any) {
        console.error('Error fetching tree data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTreeData();
  }, [rootId, maxDepth]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-sm text-slate-600">Loading hierarchy tree...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50">
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
          <h3 className="text-lg font-bold text-slate-900 mb-2">Failed to Load Hierarchy</h3>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
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
      <div className="h-full w-full flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-slate-300 mx-auto mb-4"
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
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Data Available</h3>
          <p className="text-sm text-slate-600">No distributors found in the matrix.</p>
        </div>
      </div>
    );
  }

  return <HierarchyCanvas rootDistributor={treeData} maxDepth={maxDepth} />;
}
