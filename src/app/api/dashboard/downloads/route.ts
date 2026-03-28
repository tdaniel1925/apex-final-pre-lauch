// =============================================
// Dashboard Downloads API
// Get list of downloadable files for distributors
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/dashboard/downloads - List all active downloads
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get query parameters for search and pagination
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    // Build query
    let query = supabase
      .from('downloads')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
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

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: downloads, error, count } = await query;

    if (error) {
      console.error('[DOWNLOADS] Error fetching downloads:', error);
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
    console.error('[DOWNLOADS] Exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
