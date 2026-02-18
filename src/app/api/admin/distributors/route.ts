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
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await createDistributor(body, admin.admin.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.distributor, { status: 201 });
  } catch (error: any) {
    console.error('Error creating distributor:', error);
    return NextResponse.json({ error: 'Failed to create distributor' }, { status: 500 });
  }
}
