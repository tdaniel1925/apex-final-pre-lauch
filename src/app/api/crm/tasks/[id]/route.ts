// =============================================
// CRM Task Detail API
// GET /api/crm/tasks/[id] - Get task by ID
// PUT /api/crm/tasks/[id] - Update task
// DELETE /api/crm/tasks/[id] - Delete task
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get task by ID (must belong to current user)
    const { data: task, error } = await supabase
      .from('crm_tasks')
      .select('*')
      .eq('id', params.id)
      .eq('distributor_id', currentUser.id)
      .single();

    if (error || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error: any) {
    console.error('Task fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, priority, status, due_date, contact_id } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Missing required field: title' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update task (must belong to current user)
    const { data: task, error } = await supabase
      .from('crm_tasks')
      .update({
        title,
        description: description || null,
        priority: priority || 'medium',
        status: status || 'pending',
        due_date: due_date || null,
        contact_id: contact_id || null,
      })
      .eq('id', params.id)
      .eq('distributor_id', currentUser.id)
      .select()
      .single();

    if (error || !task) {
      console.error('Failed to update task:', error);
      return NextResponse.json(
        { error: 'Failed to update task', details: error?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ task });
  } catch (error: any) {
    console.error('Task update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Delete task (must belong to current user)
    const { error } = await supabase
      .from('crm_tasks')
      .delete()
      .eq('id', params.id)
      .eq('distributor_id', currentUser.id);

    if (error) {
      console.error('Failed to delete task:', error);
      return NextResponse.json(
        { error: 'Failed to delete task', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Task delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
