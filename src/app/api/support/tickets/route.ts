// =============================================
// Support Tickets API
// Create and list support tickets
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/support/tickets - List user's tickets
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
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // Build query
    let query = supabase
      .from('support_tickets')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: tickets, error, count } = await query;

    if (error) {
      console.error('[SUPPORT] Error fetching tickets:', error);
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
    console.error('[SUPPORT] Exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/support/tickets - Create new ticket
export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { subject, description, ticket_type, attachments, browser_info, device_info } = body;

    // Validation
    if (!subject || !description || !ticket_type) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, description, ticket_type' },
        { status: 400 }
      );
    }

    // Get user info
    const { data: distributor } = await supabase
      .from('distributors')
      .select('first_name, last_name, email')
      .eq('auth_user_id', user.id)
      .single();

    const userName = distributor
      ? `${distributor.first_name} ${distributor.last_name}`.trim()
      : user.email?.split('@')[0] || 'User';

    // Create ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        subject,
        description,
        ticket_type,
        user_id: user.id,
        user_email: distributor?.email || user.email,
        user_name: userName,
        status: 'open',
        priority: 'normal',
        browser_info,
        device_info,
      })
      .select()
      .single();

    if (ticketError) {
      console.error('[SUPPORT] Error creating ticket:', ticketError);
      return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }

    // Add attachments if provided
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      const attachmentRecords = attachments.map((att: any) => ({
        ticket_id: ticket.id,
        file_name: att.file_name,
        file_url: att.file_url,
        file_size_bytes: att.file_size_bytes,
        mime_type: att.mime_type,
        storage_bucket: att.storage_bucket || 'support-attachments',
        storage_path: att.storage_path,
        uploaded_by: user.id,
      }));

      const { error: attachError } = await supabase
        .from('support_ticket_attachments')
        .insert(attachmentRecords);

      if (attachError) {
        console.error('[SUPPORT] Error adding attachments:', attachError);
        // Don't fail the whole request if attachments fail
      }
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('[SUPPORT] Exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
