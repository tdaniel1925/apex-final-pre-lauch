// =============================================
// CRM Task by ID API
// PUT: Update task
// DELETE: Delete task
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';
import { z } from 'zod';

const TaskUpdateSchema = z.object({
  task_type: z.enum(['call', 'email', 'meeting', 'follow_up', 'sms', 'other']).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  due_date: z.string().optional(),
  reminder_at: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'canceled']).optional(),
  completion_notes: z.string().optional(),
});

/**
 * PUT /api/autopilot/crm/tasks/[id]
 * Update a task
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const distributor = await getCurrentUser();
    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id } = await params;

    // Verify task ownership
    const { data: existingTask, error: fetchError } = await supabase
      .from('crm_tasks')
      .select('*')
      .eq('id', id)
      .eq('distributor_id', distributor.id)
      .single();

    if (fetchError || !existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Parse and validate update data
    const body = await request.json();
    const validatedData = TaskUpdateSchema.parse(body);

    // Prepare update object
    const updateData: any = { ...validatedData };

    // If status changed to completed, set completed_at
    if (validatedData.status === 'completed' && existingTask.status !== 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    // Update task
    const { data: task, error: updateError } = await supabase
      .from('crm_tasks')
      .update(updateData)
      .eq('id', id)
      .eq('distributor_id', distributor.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating task:', updateError);
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }

    console.error('Update task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/autopilot/crm/tasks/[id]
 * Delete a task
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const distributor = await getCurrentUser();
    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id } = await params;

    // Delete task
    const { error } = await supabase
      .from('crm_tasks')
      .delete()
      .eq('id', id)
      .eq('distributor_id', distributor.id);

    if (error) {
      console.error('Error deleting task:', error);
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
