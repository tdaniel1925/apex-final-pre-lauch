// =============================================
// Admin Support Tickets API
// List and manage all support tickets
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { logAdminAction } from '@/lib/admin/audit-logger';

export const dynamic = 'force-dynamic';

// GET /api/admin/support/tickets - List all tickets (admin only)
export async function GET(request: NextRequest) {
  const supabase = await createServiceClient();

  // Check admin authorization
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: distributor } = await supabase
    .from('distributors')
    .select('is_admin')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor?.is_admin) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const type = searchParams.get('type') || '';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // Build query
    let query = supabase
      .from('support_tickets')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (type) query = query.eq('ticket_type', type);
    if (search) {
      query = query.or(
        `ticket_number.ilike.%${search}%,subject.ilike.%${search}%,user_name.ilike.%${search}%,user_email.ilike.%${search}%`
      );
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: tickets, error, count } = await query;

    if (error) {
      console.error('[ADMIN SUPPORT] Error fetching tickets:', error);
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }

    return NextResponse.json({
      tickets: tickets || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('[ADMIN SUPPORT] Exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
