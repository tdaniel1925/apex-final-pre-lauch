// =============================================
// Get Team Statistics API
// Returns comprehensive team statistics for this distributor
// =============================================

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getAdminUser } from '@/lib/auth/admin';
import type { Distributor } from '@/lib/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Check admin auth
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const serviceClient = createServiceClient();

    // Get all team members (where sponsor_id = this distributor's id)
    const { data: directRecruits, error: directError } = await serviceClient
      .from('distributors')
      .select('*')
      .eq('sponsor_id', id)
      .neq('status', 'deleted');

    if (directError) {
      console.error('Error fetching direct recruits:', directError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch team statistics' },
        { status: 500 }
      );
    }

    const recruits = (directRecruits || []) as Distributor[];

    // Calculate statistics
    const total = recruits.length;
    const active = recruits.filter((r) => (r.status || 'active') === 'active').length;
    const suspended = recruits.filter((r) => r.status === 'suspended').length;

    // Growth metrics
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newLast7Days = recruits.filter(
      (r) => new Date(r.created_at) >= sevenDaysAgo
    ).length;

    const newLast30Days = recruits.filter(
      (r) => new Date(r.created_at) >= thirtyDaysAgo
    ).length;

    // Matrix statistics
    const { data: matrixChildren, error: matrixError } = await serviceClient
      .from('distributors')
      .select('*')
      .eq('matrix_parent_id', id)
      .neq('status', 'deleted');

    if (matrixError) {
      console.error('Error fetching matrix children:', matrixError);
    }

    const matrixFilled = (matrixChildren || []).length;
    const matrixEmpty = 5 - matrixFilled;
    const matrixFillPercentage = Math.round((matrixFilled / 5) * 100);

    // Team depth (max level among direct recruits)
    const maxDepth = recruits.length > 0
      ? Math.max(...recruits.map((r) => r.matrix_depth || 0))
      : 0;

    // Most recent recruit
    const mostRecent = recruits.length > 0
      ? recruits.reduce((latest, current) =>
          new Date(current.created_at) > new Date(latest.created_at) ? current : latest
        )
      : null;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          total,
          active,
          suspended,
          activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
        },
        growth: {
          last7Days: newLast7Days,
          last30Days: newLast30Days,
        },
        matrix: {
          filled: matrixFilled,
          empty: matrixEmpty,
          fillPercentage: matrixFillPercentage,
        },
        depth: {
          maxLevel: maxDepth,
          averageLevel: recruits.length > 0
            ? Math.round(
                recruits.reduce((sum, r) => sum + (r.matrix_depth || 0), 0) / recruits.length
              )
            : 0,
        },
        mostRecent,
      },
    });
  } catch (error) {
    console.error('Error fetching team statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team statistics' },
      { status: 500 }
    );
  }
}
