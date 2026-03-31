// =============================================
// CRM Tasks API - Single Task Operations
// GET: Get single task
// PUT: Update task
// DELETE: Delete task
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentDistributor } from '@/lib/auth/server';
import { z } from 'zod';

// =============================================
// Validation Schemas
// =============================================

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  due_date: z.string().datetime().optional().nullable(),
});

// =============================================
// GET /api/crm/tasks/[id] - Get single task
// =============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: task, error } = await supabase
      .from('crm_tasks')
      .select('*')
      .eq('id', id)
      .eq('distributor_id', currentDist.id)
      .single();

    if (error || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Unexpected error fetching task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================
// PUT /api/crm/tasks/[id] - Update task
// =============================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validation = updateTaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    const supabase = await createClient();

    // Verify task exists and belongs to current distributor
    const { data: existing } = await supabase
      .from('crm_tasks')
      .select('id')
      .eq('id', id)
      .eq('distributor_id', currentDist.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // If marking as completed, set completed_at timestamp
    const finalUpdateData = { ...updateData };
    if (updateData.status === 'completed') {
      finalUpdateData.completed_at = new Date().toISOString();
    }

    // Update task
    const { data: task, error } = await supabase
      .from('crm_tasks')
      .update(finalUpdateData)
      .eq('id', id)
      .eq('distributor_id', currentDist.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Unexpected error updating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================
// DELETE /api/crm/tasks/[id] - Delete task
// =============================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Delete task (RLS will ensure it belongs to current distributor)
    const { error } = await supabase
      .from('crm_tasks')
      .delete()
      .eq('id', id)
      .eq('distributor_id', currentDist.id);

    if (error) {
      console.error('Error deleting task:', error);
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error deleting task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
