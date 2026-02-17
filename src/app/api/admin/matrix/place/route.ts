// =============================================
// Admin Matrix Placement API
// Manually place and move distributors
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { placeDistributor, moveDistributor, togglePositionLock } from '@/lib/admin/matrix-manager';

// POST /api/admin/matrix/place - Manually place distributor
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { distributorId, parentId, action } = body;

    if (!distributorId) {
      return NextResponse.json({ error: 'Distributor ID required' }, { status: 400 });
    }

    // Handle different actions
    if (action === 'move') {
      if (!parentId) {
        return NextResponse.json({ error: 'Parent ID required for move' }, { status: 400 });
      }
      const result = await moveDistributor(distributorId, parentId, admin.distributor.id);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'Distributor moved successfully' });
    }

    if (action === 'lock' || action === 'unlock') {
      const lock = action === 'lock';
      const result = await togglePositionLock(distributorId, admin.distributor.id, lock);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: `Position ${lock ? 'locked' : 'unlocked'} successfully`,
      });
    }

    // Default: place distributor
    if (!parentId) {
      return NextResponse.json({ error: 'Parent ID required' }, { status: 400 });
    }
    const result = await placeDistributor(distributorId, parentId, admin.distributor.id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Distributor placed successfully' });
  } catch (error: any) {
    console.error('Error in matrix placement:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
