// =============================================
// Admin Distributors API
// List and create distributors
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import {
  getDistributors,
  createDistributor,
  type DistributorFilters,
} from '@/lib/admin/distributor-service';
import { findNextAvailablePosition } from '@/lib/matrix/placement-algorithm';

// GET /api/admin/distributors - List distributors with filters
export async function GET(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;

  // Parse filters from query params
  const filters: DistributorFilters = {
    status: (searchParams.get('status') as any) || 'all',
    search: searchParams.get('search') || undefined,
    sponsorId: searchParams.get('sponsorId') || undefined,
    matrixDepth: searchParams.get('matrixDepth')
      ? parseInt(searchParams.get('matrixDepth')!)
      : undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
  };

  // Parse pagination
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '50');

  try {
    const result = await getDistributors(filters, { page, pageSize });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching distributors:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/distributors - Create new distributor
// Security Fix #3: Finds matrix placement first, then creates atomically
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate sponsor_id is provided
    if (!body.sponsor_id) {
      return NextResponse.json({ error: 'Sponsor is required' }, { status: 400 });
    }

    // Find available matrix position
    const placement = await findNextAvailablePosition(body.sponsor_id);
    if (!placement) {
      return NextResponse.json(
        { error: 'Matrix is full (all 19,531 positions filled)' },
        { status: 400 }
      );
    }

    // Call atomic creation with placement info
    const result = await createDistributor(
      {
        ...body,
        matrix_parent_id: placement.parent_id,
        matrix_position: placement.position,
        matrix_depth: placement.depth,
      },
      admin.admin.id
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.distributor, { status: 201 });
  } catch (error: any) {
    console.error('[Admin/Distributors] Error creating distributor:', error);
    return NextResponse.json(
      { error: 'Failed to create distributor', details: error.message },
      { status: 500 }
    );
  }
}
