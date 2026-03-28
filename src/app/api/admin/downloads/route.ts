// =============================================
// Admin Downloads Management API
// CRUD operations for downloadable files
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { logAdminAction } from '@/lib/admin/audit-logger';

export const dynamic = 'force-dynamic';

// GET /api/admin/downloads - List all downloads (including inactive)
export async function GET(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || 'all'; // all, active, inactive
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    // Build query
    let query = supabase
      .from('downloads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply search filter
    if (search) {
      query = query.or(
        `file_name.ilike.%${search}%,purpose.ilike.%${search}%,file_type.ilike.%${search}%`
      );
    }

    // Apply category filter
    if (category) {
      query = query.eq('category', category);
    }

    // Apply status filter
    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: downloads, error, count } = await query;

    if (error) {
      console.error('[ADMIN DOWNLOADS] Error fetching downloads:', error);
      return NextResponse.json({ error: 'Failed to fetch downloads' }, { status: 500 });
    }

    return NextResponse.json({
      downloads: downloads || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('[ADMIN DOWNLOADS] Exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/downloads - Create new download
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    const body = await request.json();

    const {
      file_name,
      file_type,
      purpose,
      file_url,
      file_size_bytes,
      mime_type,
      storage_bucket,
      storage_path,
      category,
    } = body;

    // Validation
    if (!file_name || !file_type || !purpose || !file_url) {
      return NextResponse.json(
        { error: 'Missing required fields: file_name, file_type, purpose, file_url' },
        { status: 400 }
      );
    }

    // Create download
    const { data: download, error } = await supabase
      .from('downloads')
      .insert({
        file_name,
        file_type,
        purpose,
        file_url,
        file_size_bytes,
        mime_type,
        storage_bucket,
        storage_path,
        category: category || 'general',
        created_by: admin.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[ADMIN DOWNLOADS] Error creating download:', error);
      return NextResponse.json({ error: 'Failed to create download' }, { status: 500 });
    }

    // Log admin action
    await logAdminAction({
      adminId: admin.user.id,
      adminEmail: admin.user.email || 'unknown',
      action: 'CREATE_DOWNLOAD',
      entityType: 'download',
      entityId: download.id,
      newValue: download,
      status: 'success',
    });

    return NextResponse.json(download);
  } catch (error) {
    console.error('[ADMIN DOWNLOADS] Exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
