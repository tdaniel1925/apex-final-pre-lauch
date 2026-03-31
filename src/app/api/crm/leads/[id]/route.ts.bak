// =============================================
// CRM Leads API - Single Lead Operations
// GET: Get single lead
// PUT: Update lead
// DELETE: Delete lead
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentDistributor } from '@/lib/auth/server';
import { z } from 'zod';

// =============================================
// Validation Schemas
// =============================================

const updateLeadSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  status: z.enum(['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost']).optional(),
  source: z.enum(['website', 'referral', 'social_media', 'event', 'cold_call', 'email_campaign', 'other']).optional().nullable(),
  interest_level: z.enum(['low', 'medium', 'high']).optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
});

// =============================================
// GET /api/crm/leads/[id] - Get single lead
// =============================================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: lead, error } = await supabase
      .from('crm_leads')
      .select('*')
      .eq('id', params.id)
      .eq('distributor_id', currentDist.id)
      .single();

    if (error || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Unexpected error fetching lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================
// PUT /api/crm/leads/[id] - Update lead
// =============================================
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validation = updateLeadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    const supabase = await createClient();

    // Verify lead exists and belongs to current distributor
    const { data: existing } = await supabase
      .from('crm_leads')
      .select('id')
      .eq('id', params.id)
      .eq('distributor_id', currentDist.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Check for duplicate email (if email is being updated)
    if (updateData.email) {
      const { data: duplicate } = await supabase
        .from('crm_leads')
        .select('id')
        .eq('distributor_id', currentDist.id)
        .eq('email', updateData.email)
        .neq('id', params.id)
        .single();

      if (duplicate) {
        return NextResponse.json(
          { error: 'A lead with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Update lead
    const { data: lead, error } = await supabase
      .from('crm_leads')
      .update(updateData)
      .eq('id', params.id)
      .eq('distributor_id', currentDist.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead:', error);
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Unexpected error updating lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================
// DELETE /api/crm/leads/[id] - Delete lead
// =============================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Delete lead (RLS will ensure it belongs to current distributor)
    const { error } = await supabase
      .from('crm_leads')
      .delete()
      .eq('id', params.id)
      .eq('distributor_id', currentDist.id);

    if (error) {
      console.error('Error deleting lead:', error);
      return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error deleting lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
