/**
 * Public Meeting Details API
 * GET /api/public/meetings/[id]/details - Get public meeting details
 * No authentication required - used by registration page
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { MeetingDetailsResponse } from '@/types/meeting';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/public/meetings/[id]/details
 * Get public meeting details for registration page
 * No auth required, but only shows active meetings
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: meetingId } = await params;
    const supabase = createServiceClient();

    // Get meeting with distributor info
    const { data: meeting, error: meetingError } = await supabase
      .from('meeting_events')
      .select(`
        id,
        title,
        description,
        custom_message,
        event_date,
        event_time,
        event_timezone,
        duration_minutes,
        location_type,
        virtual_link,
        physical_address,
        max_attendees,
        registration_deadline,
        status,
        total_registered,
        distributor_id
      `)
      .eq('id', meetingId)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Only show active meetings to public
    if (meeting.status !== 'active') {
      return NextResponse.json(
        { error: 'This meeting is no longer available for registration' },
        { status: 410 } // 410 Gone
      );
    }

    // Get distributor info
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('first_name, last_name, email, phone')
      .eq('id', meeting.distributor_id)
      .single();

    if (distError || !distributor) {
      console.error('[Public Meeting Details] Distributor not found:', distError);
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Check capacity
    const isAtCapacity = meeting.max_attendees !== null && meeting.total_registered >= meeting.max_attendees;

    // Check deadline
    const isDeadlinePassed = meeting.registration_deadline
      ? new Date() > new Date(meeting.registration_deadline)
      : false;

    // Build response
    const response: MeetingDetailsResponse = {
      success: true,
      data: {
        meeting: {
          id: meeting.id,
          title: meeting.title,
          description: meeting.description,
          customMessage: meeting.custom_message,
          eventDate: meeting.event_date,
          eventTime: meeting.event_time,
          eventTimezone: meeting.event_timezone,
          durationMinutes: meeting.duration_minutes,
          locationType: meeting.location_type,
          virtualLink: meeting.virtual_link,
          physicalAddress: meeting.physical_address,
          maxAttendees: meeting.max_attendees,
          totalRegistered: meeting.total_registered,
          isAtCapacity,
          isDeadlinePassed,
          status: meeting.status,
        },
        distributor: {
          firstName: distributor.first_name,
          lastName: distributor.last_name,
          email: distributor.email,
          phone: distributor.phone,
        },
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Public Meeting Details] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
