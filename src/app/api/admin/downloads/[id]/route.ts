// =============================================
// Admin Download Detail API
// Update and delete individual downloads
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { logAdminAction } from '@/lib/admin/audit-logger';

export const dynamic = 'force-dynamic';

// GET /api/admin/downloads/[id] - Get single download
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
    const supabase = createServiceClient();

    const { data: download, error } = await supabase
      .from('downloads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[ADMIN DOWNLOADS] Error fetching download:', error);
      return NextResponse.json({ error: 'Download not found' }, { status: 404 });
    }

    return NextResponse.json(download);
  } catch (error) {
    console.error('[ADMIN DOWNLOADS] Exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/downloads/[id] - Update download
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
    const supabase = createServiceClient();
    const body = await request.json();

    // Get old value for audit log
    const { data: oldDownload } = await supabase
      .from('downloads')
      .select('*')
      .eq('id', id)
      .single();

    // Update download
    const { data: download, error } = await supabase
      .from('downloads')
      .update({
        file_name: body.file_name,
        file_type: body.file_type,
        purpose: body.purpose,
        file_url: body.file_url,
        file_size_bytes: body.file_size_bytes,
        mime_type: body.mime_type,
        storage_bucket: body.storage_bucket,
        storage_path: body.storage_path,
        category: body.category,
        is_active: body.is_active,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[ADMIN DOWNLOADS] Error updating download:', error);
      return NextResponse.json({ error: 'Failed to update download' }, { status: 500 });
    }

    // Log admin action
    await logAdminAction({
      adminId: admin.user.id,
      adminEmail: admin.user.email || 'unknown',
      action: 'UPDATE_DOWNLOAD',
      entityType: 'download',
      entityId: id,
      oldValue: oldDownload || undefined,
      newValue: download,
      status: 'success',
    });

    return NextResponse.json(download);
  } catch (error) {
    console.error('[ADMIN DOWNLOADS] Exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/downloads/[id] - Delete download
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
    const supabase = createServiceClient();

    // Get download data for audit log
    const { data: download } = await supabase
      .from('downloads')
      .select('*')
      .eq('id', id)
      .single();

    // Delete download
    const { error } = await supabase.from('downloads').delete().eq('id', id);

    if (error) {
      console.error('[ADMIN DOWNLOADS] Error deleting download:', error);
      await logAdminAction({
        adminId: admin.user.id,
        adminEmail: admin.user.email || 'unknown',
        action: 'DELETE_DOWNLOAD',
        entityType: 'download',
        entityId: id,
        oldValue: download || undefined,
        status: 'failure',
        errorMessage: error.message,
      });
      return NextResponse.json({ error: 'Failed to delete download' }, { status: 500 });
    }

    // Log admin action
    await logAdminAction({
      adminId: admin.user.id,
      adminEmail: admin.user.email || 'unknown',
      action: 'DELETE_DOWNLOAD',
      entityType: 'download',
      entityId: id,
      oldValue: download || undefined,
      status: 'success',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADMIN DOWNLOADS] Exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
