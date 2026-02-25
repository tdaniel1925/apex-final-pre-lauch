// =============================================
// Admin Prospect Detail API
// Update or delete individual prospect
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';

// PATCH /api/admin/prospects/[id] - Update prospect status
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
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    const { error } = await serviceClient
      .from('prospects')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating prospect:', error);
      return NextResponse.json(
        { error: 'Failed to update prospect' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Prospect updated successfully',
    });
  } catch (error: any) {
    console.error('Error in PATCH prospect API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/prospects/[id] - Delete prospect
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
    const serviceClient = createServiceClient();

    const { error } = await serviceClient
      .from('prospects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting prospect:', error);
      return NextResponse.json(
        { error: 'Failed to delete prospect' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Prospect deleted successfully',
    });
  } catch (error: any) {
    console.error('Error in DELETE prospect API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
