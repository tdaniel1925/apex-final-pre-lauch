// =============================================
// Hybrid Matrix API Route
// Efficient data fetching for hybrid view:
// - Levels 1-2: Full tree structure for visual
// - Levels 3+: Flat list for table
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface MatrixMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  slug: string;
  rep_number: string | null;
  status: string;
  profile_image?: string | null;
  profile_photo_url?: string | null;
  matrix_parent_id: string | null;
  matrix_position: number | null;
  matrix_depth: number;
  sponsor_id: string | null;
  personal_bv_monthly?: number | null;
  group_bv_monthly?: number | null;
  created_at: string;
  children?: MatrixMember[];
  childCount?: number;
}

interface HybridMatrixResponse {
  success: boolean;
  root: MatrixMember;
  level1: MatrixMember[];
  level2: MatrixMember[];
  deepLevels: MatrixMember[]; // Levels 3+
  stats: {
    totalTeam: number;
    activeMembers: number;
    totalBV: number;
    maxDepth: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get distributor ID from query params
    const { searchParams } = new URL(request.url);
    const distributorId = searchParams.get('distributorId');

    if (!distributorId) {
      return NextResponse.json(
        { error: 'distributorId is required' },
        { status: 400 }
      );
    }

    // Fetch root distributor
    const { data: rootData, error: rootError } = await supabase
      .from('distributors')
      .select('*')
      .eq('id', distributorId)
      .eq('status', 'active')
      .single();

    if (rootError || !rootData) {
      return NextResponse.json(
        { error: 'Distributor not found' },
        { status: 404 }
      );
    }

    const root = rootData as MatrixMember;

    // Fetch level 1 (direct downline)
    const { data: level1Data, error: level1Error } = await supabase
      .from('distributors')
      .select('*')
      .eq('matrix_parent_id', distributorId)
      .eq('status', 'active')
      .order('matrix_position', { ascending: true });

    const level1 = (level1Data as MatrixMember[]) || [];

    // Fetch level 2 (grandchildren)
    let level2: MatrixMember[] = [];
    if (level1.length > 0) {
      const level1Ids = level1.map(m => m.id);
      const { data: level2Data } = await supabase
        .from('distributors')
        .select('*')
        .in('matrix_parent_id', level1Ids)
        .eq('status', 'active')
        .order('matrix_parent_id', { ascending: true })
        .order('matrix_position', { ascending: true });

      level2 = (level2Data as MatrixMember[]) || [];
    }

    // Attach children to level1 for visual tree
    level1.forEach(parent => {
      parent.children = level2.filter(child => child.matrix_parent_id === parent.id);
      parent.childCount = parent.children.length;
    });

    root.children = level1;
    root.childCount = level1.length;

    // Fetch all distributors at level 3+ for table view
    const { data: deepLevelsData } = await supabase
      .from('distributors')
      .select('*')
      .eq('status', 'active')
      .gte('matrix_depth', root.matrix_depth + 3)
      .order('matrix_depth', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(1000); // Cap at 1000 for performance

    const deepLevels = (deepLevelsData as MatrixMember[]) || [];

    // Calculate stats
    const { count: totalTeam } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: activeMembers } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('matrix_depth', root.matrix_depth + 1);

    // Get max depth
    const { data: maxDepthData } = await supabase
      .from('distributors')
      .select('matrix_depth')
      .eq('status', 'active')
      .order('matrix_depth', { ascending: false })
      .limit(1)
      .single();

    const maxDepth = maxDepthData?.matrix_depth || 0;

    // Calculate total BV (if we have BV data)
    let totalBV = 0;
    if (root.group_bv_monthly) {
      totalBV = root.group_bv_monthly;
    }

    const response: HybridMatrixResponse = {
      success: true,
      root,
      level1,
      level2,
      deepLevels,
      stats: {
        totalTeam: totalTeam || 0,
        activeMembers: activeMembers || 0,
        totalBV,
        maxDepth,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch matrix data', details: errorMessage },
      { status: 500 }
    );
  }
}
