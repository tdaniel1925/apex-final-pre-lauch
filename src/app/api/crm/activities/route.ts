// =============================================
// CRM Activities API - List and Create
// GET: List activities with pagination, filtering
// POST: Create new activity
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentDistributor } from '@/lib/auth/server';
import { z } from 'zod';

// =============================================
// Validation Schemas
// =============================================

const createActivitySchema = z.object({
  // Must have either lead_id OR contact_id, never both
  lead_id: z.string().uuid().optional().nullable(),
  contact_id: z.string().uuid().optional().nullable(),
  activity_type: z.enum(['call', 'email', 'meeting', 'note', 'task_completed']),
  subject: z.string().min(1, 'Subject is required').max(200),
  description: z.string().optional().nullable(),
  duration_minutes: z.number().int().min(0).optional().nullable(),
  outcome: z.enum(['successful', 'no_answer', 'voicemail', 'scheduled_followup', 'not_interested']).optional().nullable(),
  activity_date: z.string().datetime().optional(),
}).refine(
  (data) => (data.lead_id && !data.contact_id) || (!data.lead_id && data.contact_id),
  { message: 'Must provide either lead_id OR contact_id, not both' }
);

// =============================================
// GET /api/crm/activities - List activities
// =============================================
export async function GET(request: NextRequest) {
  try {
    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Pagination
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Filters
    const activityType = searchParams.get('activity_type');
    const leadId = searchParams.get('lead_id');
    const contactId = searchParams.get('contact_id');

    // Build query
    let query = supabase
      .from('crm_activities')
      .select('*', { count: 'exact' })
      .eq('distributor_id', currentDist.id);

    // Apply filters
    if (activityType) {
      query = query.eq('activity_type', activityType);
    }
    if (leadId) {
      query = query.eq('lead_id', leadId);
    }
    if (contactId) {
      query = query.eq('contact_id', contactId);
    }

    // Apply pagination and sorting
    query = query
      .order('activity_date', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: activities, error, count } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }

    return NextResponse.json({
      activities: activities || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Unexpected error fetching activities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================
// POST /api/crm/activities - Create activity
// =============================================
export async function POST(request: NextRequest) {
  try {
    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validation = createActivitySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const activityData = validation.data;

    const supabase = await createClient();

    // Verify lead/contact exists and belongs to current distributor
    if (activityData.lead_id) {
      const { data: lead } = await supabase
        .from('crm_leads')
        .select('id')
        .eq('id', activityData.lead_id)
        .eq('distributor_id', currentDist.id)
        .single();

      if (!lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }
    }

    if (activityData.contact_id) {
      const { data: contact } = await supabase
        .from('crm_contacts')
        .select('id')
        .eq('id', activityData.contact_id)
        .eq('distributor_id', currentDist.id)
        .single();

      if (!contact) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }
    }

    // Create activity
    const { data: activity, error } = await supabase
      .from('crm_activities')
      .insert({
        ...activityData,
        distributor_id: currentDist.id,
        activity_date: activityData.activity_date || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating activity:', error);
      return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
    }

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error creating activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
