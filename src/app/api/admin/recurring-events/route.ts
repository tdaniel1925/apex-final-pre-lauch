// =====================================================
// Recurring Events API
// Create and manage recurring event series
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminUser } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const recurrenceRuleSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  interval: z.number().int().min(1).max(12).default(1), // Every N days/weeks/months
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(), // 0 = Sunday, 6 = Saturday
  dayOfMonth: z.number().int().min(1).max(31).optional(), // For monthly recurrence
  endDate: z.string().datetime().optional().nullable(), // When to stop generating
  maxOccurrences: z.number().int().positive().optional().nullable(), // Max number of events
});

const createRecurringEventSchema = z.object({
  series_name: z.string().min(1, 'Series name is required').max(200),
  description: z.string().max(2000).optional().nullable(),

  recurrence_rule: recurrenceRuleSchema,

  start_date: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date'),
  end_date: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date').optional().nullable(),

  is_active: z.boolean().default(true),

  // Template for events in this series
  event_template: z.object({
    event_name: z.string().min(1).max(200),
    event_type: z.enum(['training', 'webinar', 'conference', 'workshop', 'social']),
    event_description: z.string().max(2000).optional().nullable(),
    event_duration_minutes: z.number().int().min(15).max(480).default(60),
    event_timezone: z.string().default('America/Chicago'),
    location_type: z.enum(['in_person', 'virtual', 'hybrid']),
    venue_name: z.string().max(200).optional().nullable(),
    venue_address: z.string().max(300).optional().nullable(),
    venue_city: z.string().max(100).optional().nullable(),
    venue_state: z.string().max(50).optional().nullable(),
    venue_zip: z.string().max(20).optional().nullable(),
    virtual_meeting_link: z.string().url().optional().nullable().or(z.literal('')),
    virtual_meeting_platform: z.string().max(50).optional().nullable(),
    status: z.enum(['draft', 'active']).default('active'),
    max_attendees: z.number().int().positive().optional().nullable(),
  }),
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function errorResponse(message: string, code: string, status: number, details?: any) {
  return NextResponse.json({ error: message, code, details }, { status });
}

/**
 * Generate event instances for a recurring series
 * Creates the next batch of events based on recurrence rules
 */
async function generateEventInstances(
  supabase: any,
  recurringEvent: any,
  adminId: string,
  adminName: string,
  generateUntil?: Date
) {
  const rule = recurringEvent.recurrence_rule;
  const template = recurringEvent.event_template;
  const lastGenerated = recurringEvent.last_generated_date
    ? new Date(recurringEvent.last_generated_date)
    : new Date(recurringEvent.start_date);

  const endDate = recurringEvent.end_date ? new Date(recurringEvent.end_date) : null;
  const targetDate = generateUntil || new Date();
  targetDate.setDate(targetDate.getDate() + 90); // Generate up to 90 days ahead

  const eventInstances = [];
  let currentDate = new Date(lastGenerated);

  // Start from the next occurrence after last generated
  switch (rule.frequency) {
    case 'daily':
      currentDate.setDate(currentDate.getDate() + rule.interval);
      break;
    case 'weekly':
      currentDate.setDate(currentDate.getDate() + rule.interval * 7);
      break;
    case 'monthly':
      currentDate.setMonth(currentDate.getMonth() + rule.interval);
      break;
  }

  // Generate instances
  let occurrences = 0;
  const maxOccurrences = rule.maxOccurrences || 100;

  while (currentDate <= targetDate && occurrences < maxOccurrences) {
    // Check if we've passed the end date
    if (endDate && currentDate > endDate) break;

    // For weekly recurrence, check if current day matches daysOfWeek
    if (rule.frequency === 'weekly' && rule.daysOfWeek) {
      if (!rule.daysOfWeek.includes(currentDate.getDay())) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
    }

    // Create event instance
    const eventDateTime = new Date(currentDate);
    eventDateTime.setHours(12, 0, 0, 0); // Default to noon

    eventInstances.push({
      ...template,
      event_date_time: eventDateTime.toISOString(),
      event_end_time: new Date(eventDateTime.getTime() + template.event_duration_minutes * 60000).toISOString(),
      recurring_event_id: recurringEvent.id,
      recurrence_instance_date: currentDate.toISOString().split('T')[0],
      created_by_admin_id: adminId,
      created_by_name: adminName,
    });

    occurrences++;

    // Move to next occurrence
    switch (rule.frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + rule.interval);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + rule.interval * 7);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + rule.interval);
        break;
    }
  }

  // Insert event instances
  if (eventInstances.length > 0) {
    const { data: createdEvents, error } = await supabase
      .from('company_events')
      .insert(eventInstances)
      .select('id');

    if (error) {
      throw error;
    }

    // Update recurring_event record
    await supabase
      .from('recurring_events')
      .update({
        last_generated_date: new Date().toISOString().split('T')[0],
        next_generation_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        total_instances_created: recurringEvent.total_instances_created + eventInstances.length,
      })
      .eq('id', recurringEvent.id);

    return createdEvents;
  }

  return [];
}

// =====================================================
// GET - List recurring event series
// =====================================================

export async function GET(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
  }

  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const is_active = searchParams.get('is_active');

    let query = supabase
      .from('recurring_events')
      .select('*', { count: 'exact' });

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    query = query.order('created_at', { ascending: false });

    const { data: series, error, count } = await query;

    if (error) {
      console.error('Error fetching recurring events:', error);
      return errorResponse('Failed to fetch recurring events', 'DATABASE_ERROR', 500, error);
    }

    return NextResponse.json({
      data: series || [],
      meta: { total: count || 0 },
    });
  } catch (error: any) {
    console.error('GET /api/admin/recurring-events error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

// =====================================================
// POST - Create recurring event series
// =====================================================

export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
  }

  try {
    const body = await request.json();
    const result = createRecurringEventSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        result.error.flatten().fieldErrors
      );
    }

    const supabase = await createClient();

    // Separate event template from recurring event data
    const { event_template, ...recurringData } = result.data;

    // Create recurring event record
    const { data: recurringEvent, error: createError } = await supabase
      .from('recurring_events')
      .insert([
        {
          ...recurringData,
          created_by: admin.user.id,
          next_generation_date: new Date().toISOString().split('T')[0],
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error('Error creating recurring event:', createError);
      return errorResponse('Failed to create recurring event', 'DATABASE_ERROR', 500, createError);
    }

    // Generate initial event instances
    const adminName = `${admin.admin.first_name} ${admin.admin.last_name}`.trim() || admin.admin.email;

    const createdEvents = await generateEventInstances(
      supabase,
      { ...recurringEvent, event_template },
      admin.admin.id,
      adminName
    );

    return NextResponse.json({
      data: {
        recurring_event: recurringEvent,
        instances_created: createdEvents.length,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/admin/recurring-events error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
