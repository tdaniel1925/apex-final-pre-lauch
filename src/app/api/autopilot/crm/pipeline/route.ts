// =============================================
// CRM Pipeline API
// GET: Get all pipeline stages with contacts (kanban view)
// POST: Create or update pipeline stage for contact
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';
import { z } from 'zod';

const PipelineSchema = z.object({
  contact_id: z.string().uuid('Invalid contact ID'),
  stage: z.enum([
    'prospect',
    'contacted',
    'demo_scheduled',
    'demo_completed',
    'proposal_sent',
    'negotiation',
    'closed_won',
    'closed_lost',
  ]),
  deal_name: z.string().optional(),
  estimated_value: z.number().optional(),
  probability: z.number().min(0).max(100).optional(),
  expected_close_date: z.string().optional(),
  lost_reason: z.string().optional(),
  lost_reason_details: z.string().optional(),
  won_product: z.string().optional(),
  won_notes: z.string().optional(),
});

/**
 * GET /api/autopilot/crm/pipeline
 * Get all pipeline stages grouped by stage (kanban view)
 */
export async function GET(request: NextRequest) {
  try {
    const distributor = await getCurrentUser();
    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get all pipeline entries with contact details
    const { data: pipeline, error } = await supabase
      .from('crm_pipeline')
      .select(
        `
        *,
        contact:crm_contacts(
          id,
          first_name,
          last_name,
          email,
          phone,
          company,
          lead_score,
          tags
        )
      `
      )
      .eq('distributor_id', distributor.id)
      .order('stage_changed_at', { ascending: false });

    if (error) {
      console.error('Error fetching pipeline:', error);
      return NextResponse.json({ error: 'Failed to fetch pipeline' }, { status: 500 });
    }

    // Group by stage for kanban view
    const stages = {
      prospect: [],
      contacted: [],
      demo_scheduled: [],
      demo_completed: [],
      proposal_sent: [],
      negotiation: [],
      closed_won: [],
      closed_lost: [],
    } as Record<string, any[]>;

    (pipeline || []).forEach((item) => {
      if (stages[item.stage]) {
        stages[item.stage].push(item);
      }
    });

    return NextResponse.json({ stages });
  } catch (error) {
    console.error('Pipeline API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/autopilot/crm/pipeline
 * Move contact to a pipeline stage (create or update)
 */
export async function POST(request: NextRequest) {
  try {
    const distributor = await getCurrentUser();
    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Parse and validate request
    const body = await request.json();
    const validatedData = PipelineSchema.parse(body);

    // Verify contact ownership
    const { data: contact, error: contactError } = await supabase
      .from('crm_contacts')
      .select('id, lead_status')
      .eq('id', validatedData.contact_id)
      .eq('distributor_id', distributor.id)
      .single();

    if (contactError || !contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Check if pipeline entry exists for this contact
    const { data: existing } = await supabase
      .from('crm_pipeline')
      .select('*')
      .eq('contact_id', validatedData.contact_id)
      .eq('distributor_id', distributor.id)
      .single();

    let result;

    if (existing) {
      // Update existing pipeline entry
      const { data, error } = await supabase
        .from('crm_pipeline')
        .update({
          previous_stage: existing.stage,
          stage: validatedData.stage,
          stage_changed_at: new Date().toISOString(),
          deal_name: validatedData.deal_name || existing.deal_name,
          estimated_value: validatedData.estimated_value ?? existing.estimated_value,
          probability: validatedData.probability ?? existing.probability,
          expected_close_date: validatedData.expected_close_date || existing.expected_close_date,
          lost_reason: validatedData.lost_reason || existing.lost_reason,
          lost_reason_details: validatedData.lost_reason_details || existing.lost_reason_details,
          won_product: validatedData.won_product || existing.won_product,
          won_notes: validatedData.won_notes || existing.won_notes,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating pipeline:', error);
        return NextResponse.json({ error: 'Failed to update pipeline' }, { status: 500 });
      }

      result = data;
    } else {
      // Create new pipeline entry
      const { data, error } = await supabase
        .from('crm_pipeline')
        .insert({
          distributor_id: distributor.id,
          contact_id: validatedData.contact_id,
          stage: validatedData.stage,
          deal_name: validatedData.deal_name || null,
          estimated_value: validatedData.estimated_value || null,
          probability: validatedData.probability || null,
          expected_close_date: validatedData.expected_close_date || null,
          lost_reason: validatedData.lost_reason || null,
          lost_reason_details: validatedData.lost_reason_details || null,
          won_product: validatedData.won_product || null,
          won_notes: validatedData.won_notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating pipeline entry:', error);
        return NextResponse.json({ error: 'Failed to create pipeline entry' }, { status: 500 });
      }

      result = data;
    }

    // Update contact lead_status based on pipeline stage
    const statusMap: Record<string, string> = {
      prospect: 'new',
      contacted: 'contacted',
      demo_scheduled: 'qualified',
      demo_completed: 'qualified',
      proposal_sent: 'qualified',
      negotiation: 'nurturing',
      closed_won: 'converted',
      closed_lost: 'lost',
    };

    await supabase
      .from('crm_contacts')
      .update({ lead_status: statusMap[validatedData.stage] || 'new' })
      .eq('id', validatedData.contact_id);

    return NextResponse.json({ pipeline: result }, { status: existing ? 200 : 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }

    console.error('Create pipeline error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
