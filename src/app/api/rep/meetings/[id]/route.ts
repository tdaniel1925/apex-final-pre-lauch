/**
 * Rep Meeting Detail API - Get, Update, Delete individual meeting
 * GET /api/rep/meetings/[id] - Get meeting details
 * PUT /api/rep/meetings/[id] - Update meeting
 * DELETE /api/rep/meetings/[id] - Delete meeting
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateMeetingSchema } from '@/lib/validators/meeting-schemas';
import { isValidSlug, slugExists } from '@/lib/utils/meeting-slug-generator';
import type { MeetingEvent } from '@/types/meeting';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/rep/meetings/[id]
 * Get details of a specific meeting
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get distributor
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    // Get meeting (RLS ensures ownership)
    const { data: meeting, error: meetingError } = await supabase
      .from('meeting_events')
      .select('*')
      .eq('id', id)
      .eq('distributor_id', distributor.id) // Explicit ownership check
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: meeting as MeetingEvent,
    });

  } catch (error) {
    console.error('[Meeting Detail API] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/rep/meetings/[id]
 * Update a meeting
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get distributor
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    // Verify meeting exists and belongs to distributor
    const { data: existingMeeting, error: meetingError } = await supabase
      .from('meeting_events')
      .select('*')
      .eq('id', id)
      .eq('distributor_id', distributor.id)
      .single();

    if (meetingError || !existingMeeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = updateMeetingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Additional validation: If changing location type, ensure required fields exist
    if (data.locationType) {
      const newLocationType = data.locationType;
      const virtualLink = data.virtualLink !== undefined ? data.virtualLink : existingMeeting.virtual_link;
      const physicalAddress = data.physicalAddress !== undefined ? data.physicalAddress : existingMeeting.physical_address;

      if ((newLocationType === 'virtual' || newLocationType === 'hybrid') && !virtualLink) {
        return NextResponse.json(
          { error: 'Virtual link is required for virtual or hybrid meetings' },
          { status: 400 }
        );
      }

      if ((newLocationType === 'physical' || newLocationType === 'hybrid') && !physicalAddress) {
        return NextResponse.json(
          { error: 'Physical address is required for physical or hybrid meetings' },
          { status: 400 }
        );
      }
    }

    // Build update object (only include provided fields)
    const updateData: Partial<MeetingEvent> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.customMessage !== undefined) updateData.custom_message = data.customMessage;
    if (data.eventDate !== undefined) updateData.event_date = data.eventDate;
    if (data.eventTime !== undefined) {
      updateData.event_time = data.eventTime.includes(':') && data.eventTime.split(':').length === 2
        ? `${data.eventTime}:00`
        : data.eventTime;
    }
    if (data.eventTimezone !== undefined) updateData.event_timezone = data.eventTimezone;
    if (data.durationMinutes !== undefined) updateData.duration_minutes = data.durationMinutes;
    if (data.locationType !== undefined) updateData.location_type = data.locationType;
    if (data.virtualLink !== undefined) updateData.virtual_link = data.virtualLink;
    if (data.physicalAddress !== undefined) updateData.physical_address = data.physicalAddress;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.maxAttendees !== undefined) updateData.max_attendees = data.maxAttendees;
    if (data.registrationDeadline !== undefined) updateData.registration_deadline = data.registrationDeadline;

    // Update meeting
    const { data: updatedMeeting, error: updateError } = await supabase
      .from('meeting_events')
      .update(updateData)
      .eq('id', id)
      .eq('distributor_id', distributor.id)
      .select()
      .single();

    if (updateError) {
      console.error('[Meeting Detail API] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updatedMeeting as MeetingEvent,
    });

  } catch (error) {
    console.error('[Meeting Detail API] PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/rep/meetings/[id]
 * Delete a meeting (also deletes all registrations via CASCADE)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get distributor
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    // Check if meeting exists and get registration count
    const { data: meeting, error: meetingError } = await supabase
      .from('meeting_events')
      .select('id, title, total_registered')
      .eq('id', id)
      .eq('distributor_id', distributor.id)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Warn if meeting has registrations
    if (meeting.total_registered > 0) {
      console.warn(
        `[Meeting Detail API] Deleting meeting '${meeting.title}' with ${meeting.total_registered} registrations`
      );
    }

    // Delete meeting (CASCADE will delete all registrations)
    const { error: deleteError } = await supabase
      .from('meeting_events')
      .delete()
      .eq('id', id)
      .eq('distributor_id', distributor.id);

    if (deleteError) {
      console.error('[Meeting Detail API] Delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        deletedMeetingId: id,
        deletedRegistrations: meeting.total_registered,
      },
    });

  } catch (error) {
    console.error('[Meeting Detail API] DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
