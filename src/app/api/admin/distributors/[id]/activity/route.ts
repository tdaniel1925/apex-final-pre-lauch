// =============================================
// Admin - Distributor Activity Log API
// GET: List activity log for a distributor
// =============================================

import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { getDistributorActivity } from '@/lib/admin/activity-logger';

// GET /api/admin/distributors/[id]/activity
// List activity log for a distributor
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin session
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: distributorId } = await params;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const actionType = searchParams.get('actionType') || undefined;

    // Get activity log
    const result = await getDistributorActivity(distributorId, {
      page,
      pageSize,
      actionType,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      activities: result.activities,
      total: result.total,
      page,
      pageSize,
      totalPages: Math.ceil((result.total || 0) / pageSize),
    });
  } catch (error) {
    console.error('Error in GET activity API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
