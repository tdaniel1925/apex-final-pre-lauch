// =============================================
// Admin Distributor Suspend API
// Suspend or activate distributors
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { suspendDistributor, activateDistributor } from '@/lib/admin/distributor-service';

// POST /api/admin/distributors/[id]/suspend - Suspend distributor
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
    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json({ error: 'Suspension reason is required' }, { status: 400 });
    }

    const result = await suspendDistributor(id, reason, admin.distributor.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error suspending distributor:', error);
    return NextResponse.json({ error: 'Failed to suspend distributor' }, { status: 500 });
  }
}

// DELETE /api/admin/distributors/[id]/suspend - Activate distributor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const result = await activateDistributor(id, admin.distributor.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error activating distributor:', error);
    return NextResponse.json({ error: 'Failed to activate distributor' }, { status: 500 });
  }
}
