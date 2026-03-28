// =============================================
// Support Ticket Detail API
// Get ticket details, add responses
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/support/tickets/[id] - Get ticket with responses
export async function GET(
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

    // Get ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check ownership
    if (ticket.user_id !== user.id) {
      // Check if admin
      const { data: distributor } = await supabase
        .from('distributors')
        .select('is_admin')
        .eq('auth_user_id', user.id)
        .single();

      if (!distributor?.is_admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    // Get responses (non-internal for users, all for admins)
    const { data: distributor } = await supabase
      .from('distributors')
      .select('is_admin')
      .eq('auth_user_id', user.id)
      .single();

    const isAdmin = distributor?.is_admin || false;

    let responsesQuery = supabase
      .from('support_ticket_responses')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });

    if (!isAdmin) {
      responsesQuery = responsesQuery.eq('is_internal', false);
    }

    const { data: responses } = await responsesQuery;

    // Get attachments
    const { data: attachments } = await supabase
      .from('support_ticket_attachments')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      ticket,
      responses: responses || [],
      attachments: attachments || [],
    });
  } catch (error) {
    console.error('[SUPPORT] Exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/support/tickets/[id] - Add response to ticket
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
    const body = await request.json();
    const { message, is_internal } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get ticket to check ownership
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('user_id')
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Get user info
    const { data: distributor } = await supabase
      .from('distributors')
      .select('first_name, last_name, email, is_admin')
      .eq('auth_user_id', user.id)
      .single();

    const userName = distributor
      ? `${distributor.first_name} ${distributor.last_name}`.trim()
      : user.email?.split('@')[0] || 'User';
    const isAdmin = distributor?.is_admin || false;

    // Check authorization
    const isOwner = ticket.user_id === user.id;
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Users cannot create internal notes
    const actualIsInternal = isAdmin ? (is_internal || false) : false;

    // Add response
    const { data: response, error: responseError } = await supabase
      .from('support_ticket_responses')
      .insert({
        ticket_id: id,
        message: message.trim(),
        is_internal: actualIsInternal,
        author_id: user.id,
        author_email: distributor?.email || user.email,
        author_name: userName,
        is_staff: isAdmin,
      })
      .select()
      .single();

    if (responseError) {
      console.error('[SUPPORT] Error adding response:', responseError);
      return NextResponse.json({ error: 'Failed to add response' }, { status: 500 });
    }

    // If user responds, set status to waiting_response if it was in_progress
    if (!isAdmin && ticket.user_id === user.id) {
      await supabase
        .from('support_tickets')
        .update({ status: 'waiting_response' })
        .eq('id', id)
        .eq('status', 'in_progress');
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[SUPPORT] Exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
