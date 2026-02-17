// =============================================
// Get Personal Downline API
// Returns all distributors personally recruited by this distributor
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
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const serviceClient = createServiceClient();

    // Get all personal recruits (where sponsor_id = this distributor's id)
    let query = serviceClient
      .from('distributors')
      .select('*')
      .eq('sponsor_id', id);

    // Apply status filter
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    } else {
      // Exclude deleted by default
      query = query.neq('status', 'deleted');
    }

    // Apply sorting
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });

    const { data: downline, error } = await query;

    if (error) {
      console.error('Error fetching downline:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch downline' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const total = downline?.length || 0;
    const statusCounts = {
      active: downline?.filter((d) => d.status === 'active').length || 0,
      suspended: downline?.filter((d) => d.status === 'suspended').length || 0,
      deleted: 0, // Not shown by default
    };

    // Get most recent recruit
    const mostRecent = downline && downline.length > 0 ? downline[0] : null;

    return NextResponse.json({
      success: true,
      data: {
        downline: downline || [],
        statistics: {
          total,
          active: statusCounts.active,
          suspended: statusCounts.suspended,
          deleted: statusCounts.deleted,
        },
        mostRecent,
      },
    });
  } catch (error) {
    console.error('Error fetching downline:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch downline' },
      { status: 500 }
    );
  }
}
