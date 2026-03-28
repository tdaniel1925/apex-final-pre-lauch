/**
 * Rep Registration Detail API - Update individual registration
 * PUT /api/rep/meetings/[id]/registrations/[regId] - Update registration status/notes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateRegistrationSchema } from '@/lib/validators/meeting-schemas';
import type { MeetingRegistration } from '@/types/meeting';

interface RouteParams {
  params: Promise<{
    id: string;
    regId: string;
  }>;
}

/**
 * PUT /api/rep/meetings/[id]/registrations/[regId]
 * Update registration status or rep notes
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: meetingId, regId } = await params;
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
    const { data: meeting, error: meetingError } = await supabase
      .from('meeting_events')
      .select('id')
      .eq('id', meetingId)
      .eq('distributor_id', distributor.id)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Verify registration exists and belongs to this meeting
    const { data: existingRegistration, error: regError } = await supabase
      .from('meeting_registrations')
      .select('*')
      .eq('id', regId)
      .eq('meeting_event_id', meetingId)
      .single();

    if (regError || !existingRegistration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = updateRegistrationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Build update object (only include provided fields)
    const updateData: Partial<MeetingRegistration> = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.repNotes !== undefined) updateData.rep_notes = data.repNotes;

    // Update registration
    const { data: updatedRegistration, error: updateError } = await supabase
      .from('meeting_registrations')
      .update(updateData)
      .eq('id', regId)
      .eq('meeting_event_id', meetingId)
      .select()
      .single();

    if (updateError) {
      console.error('[Registration Detail API] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updatedRegistration as MeetingRegistration,
    });

  } catch (error) {
    console.error('[Registration Detail API] PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
