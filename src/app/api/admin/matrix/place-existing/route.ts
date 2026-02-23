// =============================================
// Place Existing Rep API
// Places an existing distributor into matrix
// =============================================

import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { placeDistributor } from '@/lib/admin/matrix-manager';

export async function POST(request: Request) {
  try {
    // Verify admin session
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { distributorId, parentId } = body;

    // Validate inputs
    if (!distributorId || !parentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Place the distributor
    const result = await placeDistributor(distributorId, parentId, admin.admin.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Distributor placed successfully',
    });
  } catch (error) {
    console.error('Error in place-existing API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
