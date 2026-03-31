// =============================================
// CRM Tasks API - List and Create
// GET: List tasks with pagination, filtering
// POST: Create new task
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentDistributor } from '@/lib/auth/server';
import { z } from 'zod';

// =============================================
// Validation Schemas
// =============================================

const createTaskSchema = z.object({
  // Optional: link to lead or contact
  lead_id: z.string().uuid().optional().nullable(),
  contact_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  due_date: z.string().datetime().optional().nullable(),
});

// =============================================
// GET /api/crm/tasks - List tasks
// =============================================
export async function GET(request: NextRequest) {
  try {
    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Pagination
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Filters
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const leadId = searchParams.get('lead_id');
    const contactId = searchParams.get('contact_id');
    const overdue = searchParams.get('overdue'); // "true" to show only overdue tasks

    // Build query
    let query = supabase
      .from('crm_tasks')
      .select('*', { count: 'exact' })
      .eq('distributor_id', currentDist.id);

    // Apply filters
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (leadId) {
      query = query.eq('lead_id', leadId);
    }
    if (contactId) {
      query = query.eq('contact_id', contactId);
    }

    // Overdue tasks
    if (overdue === 'true') {
      const now = new Date().toISOString();
      query = query
        .lt('due_date', now)
        .in('status', ['pending', 'in_progress']);
    }

    // Apply pagination and sorting
    query = query
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('priority', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: tasks, error, count } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    return NextResponse.json({
      tasks: tasks || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Unexpected error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================
// POST /api/crm/tasks - Create task
// =============================================
export async function POST(request: NextRequest) {
  try {
    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validation = createTaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const taskData = validation.data;

    const supabase = await createClient();

    // Verify lead/contact exists and belongs to current distributor (if provided)
    if (taskData.lead_id) {
      const { data: lead } = await supabase
        .from('crm_leads')
        .select('id')
        .eq('id', taskData.lead_id)
        .eq('distributor_id', currentDist.id)
        .single();

      if (!lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }
    }

    if (taskData.contact_id) {
      const { data: contact } = await supabase
        .from('crm_contacts')
        .select('id')
        .eq('id', taskData.contact_id)
        .eq('distributor_id', currentDist.id)
        .single();

      if (!contact) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }
    }

    // Create task
    const { data: task, error } = await supabase
      .from('crm_tasks')
      .insert({
        ...taskData,
        distributor_id: currentDist.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error creating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
