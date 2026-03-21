/**
 * Public Meeting Calendar Download API
 * GET /api/public/meetings/[id]/calendar?regId=[regId] - Download .ics calendar file
 * No authentication required
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { generateMeetingICS, getICSHeaders } from '@/lib/calendar/ics-generator';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/public/meetings/[id]/calendar?regId=[regId]
 * Download ICS calendar file for a meeting registration
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: meetingId } = await params;
    const { searchParams } = request.nextUrl;
    const regId = searchParams.get('regId');

    if (!regId) {
      return NextResponse.json({ error: 'Registration ID required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Get registration with meeting and distributor data
    const { data: registration, error: regError } = await supabase
      .from('meeting_registrations')
      .select(`
        id,
        first_name,
        last_name,
        email,
        meeting_event_id
      `)
      .eq('id', regId)
      .eq('meeting_event_id', meetingId)
      .single();

    if (regError || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Get meeting details
    const { data: meeting, error: meetingError } = await supabase
      .from('meeting_events')
      .select(`
        title,
        description,
        event_date,
        event_time,
        event_timezone,
        duration_minutes,
        location_type,
        virtual_link,
        physical_address,
        distributor_id
      `)
      .eq('id', meetingId)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Get distributor details
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('first_name, last_name, email')
      .eq('id', meeting.distributor_id)
      .single();

    if (distError || !distributor) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Generate ICS file
    const icsContent = generateMeetingICS({
      meeting,
      distributor,
      attendee: registration,
    });

    // Return ICS file with proper headers
    const headers = getICSHeaders(meeting.title);

    return new NextResponse(icsContent, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('[Calendar Download] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
