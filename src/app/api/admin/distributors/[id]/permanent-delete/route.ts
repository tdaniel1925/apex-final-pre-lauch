// =============================================
// Permanent Delete Distributor API
// HARD DELETE - Cannot be undone!
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { permanentlyDeleteDistributor } from '@/lib/admin/distributor-service';

// POST /api/admin/distributors/[id]/permanent-delete - Permanently delete distributor
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const result = await permanentlyDeleteDistributor(id, admin.admin.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, downlineCount: result.downlineCount },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Distributor permanently deleted' });
  } catch (error: any) {
    console.error('Error permanently deleting distributor:', error);
    return NextResponse.json(
      { error: 'Failed to permanently delete distributor' },
      { status: 500 }
    );
  }
}
