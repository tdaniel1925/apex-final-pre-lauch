// =============================================
// Track Download API
// Increment download count when file is downloaded
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// POST /api/dashboard/downloads/[id]/track - Track download
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    // Increment download count using RPC function
    const { error } = await supabase.rpc('increment_download_count', {
      p_download_id: id,
    });

    if (error) {
      console.error('[DOWNLOADS] Error tracking download:', error);
      return NextResponse.json({ error: 'Failed to track download' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DOWNLOADS] Exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
