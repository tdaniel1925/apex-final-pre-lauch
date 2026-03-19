// =============================================
// Autopilot Company Events API (Distributor)
// List available events that distributors can invite prospects to
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// =============================================
// HELPER FUNCTIONS
// =============================================

function errorResponse(message: string, code: string, status: number, details?: any) {
  return NextResponse.json({ error: message, code, details }, { status });
}

// =============================================
// GET - List available events for distributors
// =============================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    // Get distributor info to check rank
    console.log('🔍 [Autopilot Events API] Fetching distributor for user:', {
      userId: user.id,
      userEmail: user.email,
    });

    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('tech_rank')
      .eq('auth_user_id', user.id)
      .single();

    console.log('🔍 [Autopilot Events API] Distributor query result:', {
      found: !!distributor,
      distributor,
      error: distError,
    });

    if (distError) {
      console.error('Error fetching distributor:', distError);
      return errorResponse('Failed to fetch distributor info', 'DATABASE_ERROR', 500, distError);
    }

    const { searchParams } = new URL(request.url);

    // Parse filters
    const event_type = searchParams.get('event_type');
    const location_type = searchParams.get('location_type');
    const is_featured = searchParams.get('is_featured');
    const upcoming_only = searchParams.get('upcoming_only') !== 'false'; // Default to true

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;

    // Build query - only show active/full events that are public and not archived
    let query = supabase
      .from('company_events')
      .select('*', { count: 'exact' })
      .in('status', ['active', 'full'])
      .is('archived_at', null); // Exclude soft-deleted events

    // Filter by visibility
    // Event is visible if:
    // 1. It's public (is_public = true) OR
    // 2. User's rank is in visible_to_ranks array
    query = query.or(`is_public.eq.true,visible_to_ranks.cs.{${distributor.tech_rank}}`);

    // Filter by visible_from_date (null or in the past)
    query = query.or('visible_from_date.is.null,visible_from_date.lte.' + new Date().toISOString());

    // Apply filters
    if (event_type) {
      query = query.eq('event_type', event_type);
    }
    if (location_type) {
      query = query.eq('location_type', location_type);
    }
    if (is_featured) {
      query = query.eq('is_featured', is_featured === 'true');
    }
    if (upcoming_only) {
      query = query.gte('event_date_time', new Date().toISOString());
    }

    // Apply pagination and sorting
    query = query
      .order('display_order', { ascending: true })
      .order('event_date_time', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: events, error, count } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      return errorResponse('Failed to fetch events', 'DATABASE_ERROR', 500, error);
    }

    // Format events for display (remove internal fields)
    const formattedEvents = (events || []).map((event) => ({
      id: event.id,
      event_name: event.event_name,
      event_type: event.event_type,
      event_description: event.event_description,
      event_date_time: event.event_date_time,
      event_end_time: event.event_end_time,
      event_duration_minutes: event.event_duration_minutes,
      event_timezone: event.event_timezone,
      location_type: event.location_type,
      venue_name: event.venue_name,
      venue_address: event.venue_address,
      venue_city: event.venue_city,
      venue_state: event.venue_state,
      venue_zip: event.venue_zip,
      venue_country: event.venue_country,
      virtual_meeting_link: event.virtual_meeting_link,
      virtual_meeting_platform: event.virtual_meeting_platform,
      requires_registration: event.requires_registration,
      max_attendees: event.max_attendees,
      current_attendees: event.current_attendees,
      rsvp_deadline: event.rsvp_deadline,
      invitation_subject: event.invitation_subject,
      invitation_template: event.invitation_template,
      reminder_template: event.reminder_template,
      confirmation_template: event.confirmation_template,
      event_banner_url: event.event_banner_url,
      event_logo_url: event.event_logo_url,
      event_image_url: event.event_image_url,
      status: event.status,
      is_featured: event.is_featured,
      display_order: event.display_order,
      tags: event.tags,
      // Statistics
      total_invitations_sent: event.total_invitations_sent,
      total_rsvps_yes: event.total_rsvps_yes,
      total_rsvps_no: event.total_rsvps_no,
      total_rsvps_maybe: event.total_rsvps_maybe,
      total_attendees_confirmed: event.total_attendees_confirmed,
      created_at: event.created_at,
    }));

    return NextResponse.json({
      data: formattedEvents,
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('GET /api/autopilot/events error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
