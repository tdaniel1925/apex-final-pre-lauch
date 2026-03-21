/**
 * Rep Meeting Registrations API - List registrations for a meeting
 * GET /api/rep/meetings/[id]/registrations - List all registrations for a meeting
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { registrationListQuerySchema } from '@/lib/validators/meeting-schemas';
import type { MeetingRegistration } from '@/types/meeting';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/rep/meetings/[id]/registrations
 * List all registrations for a specific meeting with filters
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: meetingId } = await params;
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryValidation = registrationListQuerySchema.safeParse({
      status: searchParams.get('status') || undefined,
      hasQuestions: searchParams.get('hasQuestions') || undefined,
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
      .from('meeting_registrations')
      .select('*', { count: 'exact' })
      .eq('meeting_event_id', meetingId);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.hasQuestions !== undefined) {
      query = query.eq('has_questions', filters.hasQuestions);
    }

    if (filters.search) {
      query = query.or(
        `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      );
    }

    // Order by created date (most recent first)
    query = query.order('created_at', { ascending: false });

    // Pagination
    query = query.range(filters.offset, filters.offset + filters.limit - 1);

    const { data: registrations, error: queryError, count } = await query;

    if (queryError) {
      console.error('[Registrations API] Query error:', queryError);
      return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        registrations: registrations as MeetingRegistration[],
        total: count || 0,
      },
    });

  } catch (error) {
    console.error('[Registrations API] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
