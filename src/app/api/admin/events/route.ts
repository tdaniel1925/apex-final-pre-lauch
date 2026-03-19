// =============================================
// Admin Company Events API
// Create and list company-wide events that reps can invite prospects to
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminUser } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';

// =============================================
// VALIDATION SCHEMAS
// =============================================

const createEventSchema = z.object({
  // Event details
  event_name: z.string().min(1, 'Event name is required').max(200),
  event_type: z.enum([
    'product_launch',
    'training',
    'webinar',
    'conference',
    'social',
    'business_opportunity',
    'other',
  ]),
  event_description: z.string().max(2000).optional().nullable(),

  // Date/Time
  event_date_time: z.string().datetime(),
  event_duration_minutes: z.number().int().min(15).max(480).default(120),
  event_timezone: z.string().default('America/Chicago'),

  // Location
  location_type: z.enum(['in_person', 'virtual', 'hybrid']).default('in_person'),
  venue_name: z.string().max(200).optional().nullable(),
  venue_address: z.string().max(300).optional().nullable(),
  venue_city: z.string().max(100).optional().nullable(),
  venue_state: z.string().max(50).optional().nullable(),
  venue_zip: z.string().max(20).optional().nullable(),
  venue_country: z.string().max(100).default('United States'),
  virtual_meeting_link: z.string().url().optional().nullable().or(z.literal('')),
  virtual_meeting_platform: z.string().max(50).optional().nullable(),
  virtual_meeting_id: z.string().max(100).optional().nullable(),
  virtual_meeting_passcode: z.string().max(100).optional().nullable(),

  // Registration
  requires_registration: z.boolean().default(true),
  max_attendees: z.number().int().positive().optional().nullable(),
  rsvp_deadline: z.string().datetime().optional().nullable(),

  // Pre-set messaging templates
  invitation_subject: z.string().max(200).optional().nullable(),
  invitation_template: z.string().max(5000).optional().nullable(),
  reminder_template: z.string().max(5000).optional().nullable(),
  confirmation_template: z.string().max(5000).optional().nullable(),

  // Branding
  flyer_template_id: z.string().max(100).optional().nullable(),
  event_banner_url: z.string().url().optional().nullable().or(z.literal('')),
  event_logo_url: z.string().url().optional().nullable().or(z.literal('')),
  event_image_url: z.string().url().optional().nullable().or(z.literal('')),

  // Status
  status: z.enum(['draft', 'active', 'full', 'canceled', 'completed', 'archived']).default('draft'),
  is_featured: z.boolean().default(false),
  is_public: z.boolean().default(true),
  display_order: z.number().int().default(0),

  // Visibility control
  visible_to_ranks: z.array(z.string()).optional().nullable(),
  visible_from_date: z.string().datetime().optional().nullable(),

  // Notes and internal tracking
  internal_notes: z.string().max(5000).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
});

// =============================================
// HELPER FUNCTIONS
// =============================================

function errorResponse(message: string, code: string, status: number, details?: any) {
  return NextResponse.json({ error: message, code, details }, { status });
}

// =============================================
// GET - List all events
// =============================================

export async function GET(request: NextRequest) {
  // Admin auth check
  const admin = await getAdminUser();
  if (!admin) {
    return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
  }

  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Parse filters
    const status = searchParams.get('status');
    const location_type = searchParams.get('location_type');
    const event_type = searchParams.get('event_type');
    const is_featured = searchParams.get('is_featured');
    const search = searchParams.get('search');

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('company_events')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (location_type) {
      query = query.eq('location_type', location_type);
    }
    if (event_type) {
      query = query.eq('event_type', event_type);
    }
    if (is_featured) {
      query = query.eq('is_featured', is_featured === 'true');
    }
    if (search) {
      query = query.or(`event_name.ilike.%${search}%,event_description.ilike.%${search}%,venue_name.ilike.%${search}%`);
    }

    // Apply pagination and sorting
    query = query
      .order('event_date_time', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: events, error, count } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      return errorResponse('Failed to fetch events', 'DATABASE_ERROR', 500, error);
    }

    return NextResponse.json({
      data: events || [],
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('GET /api/admin/events error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

// =============================================
// POST - Create new event
// =============================================

export async function POST(request: NextRequest) {
  // Admin auth check
  const admin = await getAdminUser();
  if (!admin) {
    return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
  }

  try {
    const body = await request.json();

    // Validate request body
    const result = createEventSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        result.error.flatten().fieldErrors
      );
    }

    const supabase = await createClient();

    // Calculate end time if duration is provided
    let event_end_time = null;
    if (result.data.event_date_time && result.data.event_duration_minutes) {
      const startDate = new Date(result.data.event_date_time);
      const endDate = new Date(startDate.getTime() + result.data.event_duration_minutes * 60000);
      event_end_time = endDate.toISOString();
    }

    // Insert event
    const { data: event, error } = await supabase
      .from('company_events')
      .insert([
        {
          ...result.data,
          event_end_time,
          created_by_admin_id: admin.admin.id,
          created_by_name: `${admin.admin.first_name} ${admin.admin.last_name}`.trim() || admin.admin.email,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return errorResponse('Failed to create event', 'DATABASE_ERROR', 500, error);
    }

    return NextResponse.json({ data: event }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/admin/events error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
