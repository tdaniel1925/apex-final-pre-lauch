// =============================================
// CRM Activities API
// POST /api/crm/activities - Create new activity
// GET /api/crm/activities - List activities
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      activity_type,
      subject,
      description,
      activity_date,
      duration,
      contact_id,
    } = body;

    // Validate required fields
    if (!activity_type || !subject || !activity_date) {
      return NextResponse.json(
        { error: 'Missing required fields: activity_type, subject, activity_date' },
        { status: 400 }
      );
    }

    // Validate activity_type
    const validTypes = ['call', 'email', 'meeting', 'note'];
    if (!validTypes.includes(activity_type)) {
      return NextResponse.json(
        { error: \`Invalid activity_type. Must be one of: \${validTypes.join(', ')}\` },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Create activity
    const { data: activity, error } = await supabase
      .from('crm_activities')
      .insert({
        distributor_id: currentUser.id,
        activity_type,
        subject,
        description: description || null,
        activity_date,
        duration: duration || null,
        contact_id: contact_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create activity:', error);
      return NextResponse.json(
        { error: 'Failed to create activity', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error: any) {
    console.error('Activity creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get activities for current user
    const { data: activities, error } = await supabase
      .from('crm_activities')
      .select('*')
      .eq('distributor_id', currentUser.id)
      .order('activity_date', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Failed to fetch activities:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activities', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ activities: activities || [] });
  } catch (error: any) {
    console.error('Activities fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
