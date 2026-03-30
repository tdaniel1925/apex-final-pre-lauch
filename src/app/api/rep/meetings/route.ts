/**
 * Rep Meetings API - List and Create
 * GET /api/rep/meetings - List distributor's meetings
 * POST /api/rep/meetings - Create new meeting
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createMeetingSchema,
  meetingListQuerySchema,
} from '@/lib/validators/meeting-schemas';
import { generateUniqueSlug, isValidSlug } from '@/lib/utils/meeting-slug-generator';
import type { MeetingEvent } from '@/types/meeting';

/**
 * GET /api/rep/meetings
 * List all meetings for authenticated distributor with filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get distributor
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id, slug')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryValidation = meetingListQuerySchema.safeParse({
      status: searchParams.get('status') || undefined,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: queryValidation.error.issues[0].message },
        { status: 400 }
      );
    }

    const filters = queryValidation.data;

    // Build query
    let query = supabase
      .from('meeting_events')
      .select('*', { count: 'exact' })
      .eq('distributor_id', distributor.id);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.fromDate) {
      query = query.gte('event_date', filters.fromDate);
    }

    if (filters.toDate) {
      query = query.lte('event_date', filters.toDate);
    }

    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    // Order by event date (upcoming first)
    query = query.order('event_date', { ascending: true });
    query = query.order('event_time', { ascending: true });

    // Pagination
    query = query.range(filters.offset, filters.offset + filters.limit - 1);

    const { data: meetings, error: queryError, count } = await query;

    if (queryError) {
      console.error('[Meetings API] Query error:', queryError);
      return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
    }

    // Add distributor slug to each meeting for URL generation
    const meetingsWithSlug = (meetings || []).map(meeting => ({
      ...meeting,
      distributor_slug: distributor.slug,
    }));

    return NextResponse.json({
      success: true,
      data: {
        meetings: meetingsWithSlug,
        total: count || 0,
      },
    });

  } catch (error) {
    console.error('[Meetings API] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/rep/meetings
 * Create a new meeting event
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get distributor
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id, slug')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = createMeetingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Validate slug format
    if (!isValidSlug(data.registrationSlug)) {
      return NextResponse.json(
        { error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.' },
        { status: 400 }
      );
    }

    // Check if slug is unique for this distributor
    const slugCheckResult = await generateUniqueSlug(distributor.id, data.title);
    if (slugCheckResult !== data.registrationSlug) {
      // Provided slug is taken, check if it exists
      const { data: existingMeeting } = await supabase
        .from('meeting_events')
        .select('id')
        .eq('distributor_id', distributor.id)
        .eq('registration_slug', data.registrationSlug)
        .maybeSingle();

      if (existingMeeting) {
        return NextResponse.json(
          {
            error: 'This registration URL is already in use. Please choose a different one.',
            suggestion: slugCheckResult, // Suggest alternative
          },
          { status: 409 }
        );
      }
    }

    // Convert API format (camelCase) to database format (snake_case)
    const meetingData = {
      distributor_id: distributor.id,
      title: data.title,
      description: data.description || null,
      custom_message: data.customMessage || null,
      event_date: data.eventDate,
      event_time: data.eventTime.includes(':') && data.eventTime.split(':').length === 2
        ? `${data.eventTime}:00` // Add seconds if not provided
        : data.eventTime,
      event_timezone: data.eventTimezone,
      duration_minutes: data.durationMinutes,
      location_type: data.locationType,
      virtual_link: data.virtualLink || null,
      physical_address: data.physicalAddress || null,
      registration_slug: data.registrationSlug,
      status: data.status,
      max_attendees: data.maxAttendees || null,
      registration_deadline: data.registrationDeadline || null,
    };

    // Insert meeting
    const { data: meeting, error: insertError } = await supabase
      .from('meeting_events')
      .insert(meetingData)
      .select()
      .single();

    if (insertError) {
      console.error('[Meetings API] Insert error:', insertError);

      // Check for unique constraint violation
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'This registration URL is already in use' },
          { status: 409 }
        );
      }

      return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
    }

    // Build registration URL
    const registrationUrl = `https://theapexway.net/${distributor.slug}/register/${meeting.registration_slug}`;

    // Add distributor slug to meeting for URL generation
    const meetingWithSlug = {
      ...meeting,
      distributor_slug: distributor.slug,
    };

    return NextResponse.json({
      success: true,
      data: {
        meeting: meetingWithSlug as MeetingEvent,
        registrationUrl,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('[Meetings API] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
