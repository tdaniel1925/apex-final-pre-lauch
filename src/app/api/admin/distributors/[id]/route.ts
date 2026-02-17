// =============================================
// Admin Distributor Detail API
// Get, update, delete individual distributor
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import {
  getDistributorById,
  updateDistributor,
  deleteDistributor,
} from '@/lib/admin/distributor-service';

// GET /api/admin/distributors/[id] - Get single distributor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const distributor = await getDistributorById(id);

    if (!distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    return NextResponse.json(distributor);
  } catch (error: any) {
    console.error('Error fetching distributor:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/distributors/[id] - Update distributor
export async function PATCH(
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
    const result = await updateDistributor(id, body, admin.distributor.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.distributor);
  } catch (error: any) {
    console.error('Error updating distributor:', error);
    return NextResponse.json({ error: 'Failed to update distributor' }, { status: 500 });
  }
}

// DELETE /api/admin/distributors/[id] - Soft delete distributor
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
    const result = await deleteDistributor(id, admin.distributor.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting distributor:', error);
    return NextResponse.json({ error: 'Failed to delete distributor' }, { status: 500 });
  }
}
