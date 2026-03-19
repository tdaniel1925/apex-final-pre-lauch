// =============================================
// CRM Tasks API
// GET: List all tasks with filters
// POST: Create new task
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';
import { z } from 'zod';

const TaskSchema = z.object({
  contact_id: z.string().uuid().optional(),
  task_type: z.enum(['call', 'email', 'meeting', 'follow_up', 'sms', 'other']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  due_date: z.string().optional(),
  reminder_at: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'canceled']).optional(),
});

/**
 * GET /api/autopilot/crm/tasks
 * List all tasks with filters
 */
export async function GET(request: NextRequest) {
  try {
    const distributor = await getCurrentUser();
    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const contactId = searchParams.get('contact_id') || '';
    const dueBefore = searchParams.get('due_before') || '';
    const dueAfter = searchParams.get('due_after') || '';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query with contact details
    let query = supabase
      .from('crm_tasks')
      .select(
        `
        *,
        contact:crm_contacts(
          id,
          first_name,
          last_name,
          email,
          company
        )
      `,
        { count: 'exact' }
      )
      .eq('distributor_id', distributor.id);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (contactId) {
      query = query.eq('contact_id', contactId);
    }

    if (dueBefore) {
      query = query.lte('due_date', dueBefore);
    }

    if (dueAfter) {
      query = query.gte('due_date', dueAfter);
    }

    // Order by due date
    query = query.order('due_date', { ascending: true, nullsFirst: false });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: tasks, error, count } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    return NextResponse.json({
      tasks: tasks || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Tasks API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/autopilot/crm/tasks
 * Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    const distributor = await getCurrentUser();
    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Parse and validate request
    const body = await request.json();
    const validatedData = TaskSchema.parse(body);

    // If contact_id provided, verify ownership
    if (validatedData.contact_id) {
      const { data: contact } = await supabase
        .from('crm_contacts')
        .select('id')
        .eq('id', validatedData.contact_id)
        .eq('distributor_id', distributor.id)
        .single();

      if (!contact) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }
    }

    // Create task
    const { data: task, error } = await supabase
      .from('crm_tasks')
      .insert({
        distributor_id: distributor.id,
        contact_id: validatedData.contact_id || null,
        task_type: validatedData.task_type,
        title: validatedData.title,
        description: validatedData.description || null,
        due_date: validatedData.due_date || null,
        reminder_at: validatedData.reminder_at || null,
        priority: validatedData.priority || 'medium',
        status: validatedData.status || 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }

    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
