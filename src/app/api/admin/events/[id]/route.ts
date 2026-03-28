// =============================================
// Admin Company Event by ID API
// Get, update, and delete individual company events
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminUser } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';

// =============================================
// VALIDATION SCHEMAS
// =============================================

const updateEventSchema = z.object({
  // Event details
  event_name: z.string().min(1).max(200).optional(),
  event_type: z.enum([
    'product_launch',
    'training',
    'webinar',
    'conference',
    'social',
    'business_opportunity',
    'other',
  ]).optional(),
  event_description: z.string().max(2000).optional().nullable(),

  // Date/Time
  event_date_time: z.string().datetime().optional(),
  event_duration_minutes: z.number().int().min(15).max(480).optional(),
  event_timezone: z.string().optional(),

  // Location
  location_type: z.enum(['in_person', 'virtual', 'hybrid']).optional(),
  venue_name: z.string().max(200).optional().nullable(),
  venue_address: z.string().max(300).optional().nullable(),
  venue_city: z.string().max(100).optional().nullable(),
  venue_state: z.string().max(50).optional().nullable(),
  venue_zip: z.string().max(20).optional().nullable(),
  venue_country: z.string().max(100).optional(),
  virtual_meeting_link: z.string().url().optional().nullable().or(z.literal('')),
  virtual_meeting_platform: z.string().max(50).optional().nullable(),
  virtual_meeting_id: z.string().max(100).optional().nullable(),
  virtual_meeting_passcode: z.string().max(100).optional().nullable(),

  // Registration
  requires_registration: z.boolean().optional(),
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
  status: z.enum(['draft', 'active', 'full', 'canceled', 'completed', 'archived']).optional(),
  is_featured: z.boolean().optional(),
  is_public: z.boolean().optional(),
  display_order: z.number().int().optional(),

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

type RouteParams = {
  params: Promise<{ id: string }>;
};

function errorResponse(message: string, code: string, status: number, details?: any) {
  return NextResponse.json({ error: message, code, details }, { status });
}

// =============================================
// GET - Get single event by ID
// =============================================

export async function GET(request: NextRequest, context: RouteParams) {
  // Admin auth check
  const admin = await getAdminUser();
  if (!admin) {
    return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
  }

  try {
    const params = await context.params;
    const supabase = await createClient();
    const { data: event, error } = await supabase
      .from('company_events')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Event not found', 'NOT_FOUND', 404);
      }
      console.error('Error fetching event:', error);
      return errorResponse('Failed to fetch event', 'DATABASE_ERROR', 500, error);
    }

    return NextResponse.json({ data: event });
  } catch (error: any) {
    console.error(`GET /api/admin/events/${(await context.params).id} error:`, error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

// =============================================
// PATCH - Update event
// =============================================

export async function PATCH(request: NextRequest, context: RouteParams) {
  // Admin auth check
  const admin = await getAdminUser();
  if (!admin) {
    return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
  }

  try {
    const params = await context.params;
    const body = await request.json();

    // Validate request body
    const result = updateEventSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        result.error.flatten().fieldErrors
      );
    }

    const supabase = await createClient();

    // Check if event exists
    const { data: existing, error: fetchError } = await supabase
      .from('company_events')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return errorResponse('Event not found', 'NOT_FOUND', 404);
      }
      console.error('Error fetching event:', fetchError);
      return errorResponse('Failed to fetch event', 'DATABASE_ERROR', 500, fetchError);
    }

    // Calculate end time if duration is being updated
    let event_end_time = existing.event_end_time;
    if (result.data.event_date_time || result.data.event_duration_minutes) {
      const startDate = new Date(result.data.event_date_time || existing.event_date_time);
      const duration = result.data.event_duration_minutes || existing.event_duration_minutes;
      const endDate = new Date(startDate.getTime() + duration * 60000);
      event_end_time = endDate.toISOString();
    }

    // Update event
    const { data: updated, error: updateError } = await supabase
      .from('company_events')
      .update({
        ...result.data,
        event_end_time,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating event:', updateError);
      return errorResponse('Failed to update event', 'DATABASE_ERROR', 500, updateError);
    }

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    console.error(`PATCH /api/admin/events/${(await context.params).id} error:`, error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

// =============================================
// DELETE - Delete/Archive event
// =============================================

export async function DELETE(request: NextRequest, context: RouteParams) {
  // Admin auth check
  const admin = await getAdminUser();
  if (!admin) {
    return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
  }

  try {
    const params = await context.params;
    const supabase = await createClient();

    // Check if event exists
    const { data: existing, error: fetchError } = await supabase
      .from('company_events')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return errorResponse('Event not found', 'NOT_FOUND', 404);
      }
      console.error('Error fetching event:', fetchError);
      return errorResponse('Failed to fetch event', 'DATABASE_ERROR', 500, fetchError);
    }

    // Check if there are any invitations for this event
    const { data: invitations, error: invitationsError } = await supabase
      .from('meeting_invitations')
      .select('id')
      .eq('company_event_id', params.id)
      .limit(1);

    if (invitationsError) {
      console.error('Error checking invitations:', invitationsError);
      return errorResponse('Failed to check invitations', 'DATABASE_ERROR', 500, invitationsError);
    }

    // If there are invitations, archive instead of delete
    if (invitations && invitations.length > 0) {
      const { data: archived, error: archiveError } = await supabase
        .from('company_events')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)
        .select()
        .single();

      if (archiveError) {
        console.error('Error archiving event:', archiveError);
        return errorResponse('Failed to archive event', 'DATABASE_ERROR', 500, archiveError);
      }

      return NextResponse.json({
        success: true,
        archived: true,
        message: 'Event archived because it has associated invitations',
        data: archived,
      });
    }

    // No invitations, safe to delete
    const { error: deleteError } = await supabase
      .from('company_events')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Error deleting event:', deleteError);
      return errorResponse('Failed to delete event', 'DATABASE_ERROR', 500, deleteError);
    }

    return NextResponse.json({
      success: true,
      deleted: true,
      message: 'Event deleted successfully',
    });
  } catch (error: any) {
    console.error(`DELETE /api/admin/events/${(await context.params).id} error:`, error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
