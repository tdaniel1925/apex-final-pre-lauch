// =============================================
// Matrix Tree API Route
// Fetch distributor tree with children for hierarchy canvas
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
  personal_bv_monthly: number | null;
  group_bv_monthly: number | null;
  created_at: string;
  children?: TreeNode[];
  childCount?: number;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get root distributor ID from query params (or use the first one)
    const { searchParams } = new URL(request.url);
    const rootId = searchParams.get('rootId');
    const maxDepth = parseInt(searchParams.get('maxDepth') || '3');

    let rootDistributor: TreeNode;

    if (rootId) {
      // Fetch specific distributor as root
      const { data, error } = await supabase
        .from('distributors')
        .select('*')
        .eq('id', rootId)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Root distributor not found' }, { status: 404 });
      }

      rootDistributor = data as TreeNode;
    } else {
      // Get the top-level distributor (depth 0)
      const { data, error } = await supabase
        .from('distributors')
        .select('*')
        .eq('matrix_depth', 0)
        .eq('status', 'active')
        .limit(1)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'No root distributor found' }, { status: 404 });
      }

      rootDistributor = data as TreeNode;
    }

    // Recursively fetch children
    async function fetchChildren(parentId: string, currentDepth: number): Promise<TreeNode[]> {
      if (currentDepth >= maxDepth) {
        // At max depth, just get child count
        const { count } = await supabase
          .from('distributors')
          .select('*', { count: 'exact', head: true })
          .eq('matrix_parent_id', parentId)
          .eq('status', 'active');

        return [];
      }

      const { data, error } = await supabase
        .from('distributors')
        .select('*')
        .eq('matrix_parent_id', parentId)
        .eq('status', 'active')
        .order('matrix_position', { ascending: true });

      if (error || !data) {
        return [];
      }

      const children = data as TreeNode[];

      // Recursively fetch grandchildren for each child
      for (const child of children) {
        child.children = await fetchChildren(child.id, currentDepth + 1);

        // Get total child count for collapsed view
        const { count } = await supabase
          .from('distributors')
          .select('*', { count: 'exact', head: true })
          .eq('matrix_parent_id', child.id)
          .eq('status', 'active');

        child.childCount = count || 0;
      }

      return children;
    }

    // Fetch tree
    rootDistributor.children = await fetchChildren(rootDistributor.id, 0);

    // Get total child count for root
    const { count } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .eq('matrix_parent_id', rootDistributor.id)
      .eq('status', 'active');

    rootDistributor.childCount = count || 0;

    return NextResponse.json({
      success: true,
      root: rootDistributor,
      maxDepth,
    });
  } catch (error: any) {
    console.error('❌ Matrix tree API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matrix tree', details: error.message },
      { status: 500 }
    );
  }
}
