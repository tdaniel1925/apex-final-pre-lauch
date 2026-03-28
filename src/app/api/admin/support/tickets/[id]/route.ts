// =============================================
// Admin Support Ticket Detail API
// Update ticket status, priority, assignment
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { logAdminAction } from '@/lib/admin/audit-logger';

export const dynamic = 'force-dynamic';

// PATCH /api/admin/support/tickets/[id] - Update ticket (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const body = await request.json();
    const { status, priority, assigned_to, resolution } = body;

    const updateData: any = {};

    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assigned_to !== undefined) {
      updateData.assigned_to = assigned_to || null;
      updateData.assigned_at = assigned_to ? new Date().toISOString() : null;
    }
    if (resolution !== undefined) {
      updateData.resolution = resolution;
      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = user.id;
      }
    }

    const { data: ticket, error: updateError } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[ADMIN SUPPORT] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }

    // Log admin action
    await logAdminAction({
      adminId: user.id,
      adminEmail: user.email || 'unknown',
      action: 'UPDATE_SUPPORT_TICKET',
      entityType: 'support_ticket',
      entityId: id,
      newValue: updateData,
      status: 'success',
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('[ADMIN SUPPORT] Exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
