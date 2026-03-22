// =============================================
// Hybrid Matrix API Route
// Efficient data fetching for hybrid view:
// - Levels 1-2: Full ENROLLMENT tree structure for visual
// - Levels 3+: Flat list for table
//
// CRITICAL: Uses sponsor_id (ENROLLMENT TREE) not matrix_parent_id
// This matches Team and Genealogy views for consistency
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
  enrollment_level?: number; // Level in enrollment tree (1, 2, 3, 4)
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

    // Fetch level 1 (direct enrollees) using ENROLLMENT TREE (sponsor_id)
    // CRITICAL: Use sponsor_id NOT matrix_parent_id to match Team/Genealogy views
    const { data: level1Data, error: level1Error } = await supabase
      .from('distributors')
      .select('*')
      .eq('sponsor_id', distributorId)
      .eq('status', 'active')
      .order('created_at', { ascending: true });

    const level1 = (level1Data as MatrixMember[]) || [];
    // Add enrollment level to each member
    level1.forEach(m => m.enrollment_level = 1);

    // Fetch level 2 (grandchildren) using ENROLLMENT TREE (sponsor_id)
    let level2: MatrixMember[] = [];
    if (level1.length > 0) {
      const level1Ids = level1.map(m => m.id);
      const { data: level2Data } = await supabase
        .from('distributors')
        .select('*')
        .in('sponsor_id', level1Ids)
        .eq('status', 'active')
        .order('sponsor_id', { ascending: true })
        .order('created_at', { ascending: true });

      level2 = (level2Data as MatrixMember[]) || [];
      // Add enrollment level to each member
      level2.forEach(m => m.enrollment_level = 2);
    }

    // Attach children to level1 for visual tree
    level1.forEach(parent => {
      parent.children = level2.filter(child => child.sponsor_id === parent.id);
      parent.childCount = parent.children.length;
    });

    root.children = level1;
    root.childCount = level1.length;

    // Fetch all distributors at level 3+ for table view
    // Fetch enrollees beyond level 2 (limit to levels 3-4 for performance)
    let deepLevels: MatrixMember[] = [];

    if (level2.length > 0) {
      const level2Ids = level2.map(m => m.id);

      // Get level 3 enrollees
      const { data: level3Data } = await supabase
        .from('distributors')
        .select('*')
        .in('sponsor_id', level2Ids)
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(500);

      if (level3Data && level3Data.length > 0) {
        deepLevels = level3Data as MatrixMember[];
        // Add enrollment level to each member
        deepLevels.forEach(m => m.enrollment_level = 3);

        // Get level 4 enrollees (limited for performance)
        const level3Ids = level3Data.map((d: any) => d.id);
        const { data: level4Data } = await supabase
          .from('distributors')
          .select('*')
          .in('sponsor_id', level3Ids)
          .eq('status', 'active')
          .order('created_at', { ascending: true })
          .limit(500);

        if (level4Data) {
          const level4Members = level4Data as MatrixMember[];
          // Add enrollment level to each member
          level4Members.forEach(m => m.enrollment_level = 4);
          deepLevels = [...deepLevels, ...level4Members];
        }
      }
    }

    // Calculate stats based on enrollment tree
    // Total team = all enrollees we've fetched (level 1 + 2 + deep levels)
    const totalTeamCount = level1.length + level2.length + deepLevels.length;

    // Active members = those with activity in the fetched enrollees
    const activeMembers = [... level1, ...level2, ...deepLevels].filter(
      m => (m.personal_bv_monthly || 0) > 0
    ).length;

    // Max depth = number of levels we've fetched (1, 2, 3, 4)
    let maxDepth = 1;
    if (level2.length > 0) maxDepth = 2;
    if (deepLevels.length > 0) maxDepth = 4; // We fetch up to level 4

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
        totalTeam: totalTeamCount,
        activeMembers,
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
