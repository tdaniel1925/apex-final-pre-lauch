// =============================================
// CRM Contact by ID API
// GET: Get single contact with full details
// PUT: Update contact
// DELETE: Delete contact
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';
import { calculateLeadScore } from '@/lib/autopilot/lead-scoring';
import { z } from 'zod';

const ContactUpdateSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  lead_source: z.string().optional(),
  lead_source_details: z.string().optional(),
  lead_status: z
    .enum(['new', 'contacted', 'qualified', 'unqualified', 'nurturing', 'converted', 'lost'])
    .optional(),
  tags: z.array(z.string()).optional(),
  preferred_contact_method: z.enum(['email', 'phone', 'sms', 'whatsapp']).optional(),
  email_opt_in: z.boolean().optional(),
  sms_opt_in: z.boolean().optional(),
  next_followup_date: z.string().optional(),
  last_contact_date: z.string().optional(),
  last_contact_type: z.enum(['email', 'call', 'meeting', 'sms']).optional(),
});

/**
 * GET /api/autopilot/crm/contacts/[id]
 * Get single contact with full details including related pipeline and tasks
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const distributor = await getCurrentUser();
    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id } = await params;

    // Get contact
    const { data: contact, error: contactError } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('id', id)
      .eq('distributor_id', distributor.id)
      .single();

    if (contactError || !contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Get related pipeline stages
    const { data: pipeline } = await supabase
      .from('crm_pipeline')
      .select('*')
      .eq('contact_id', id)
      .order('created_at', { ascending: false });

    // Get related tasks
    const { data: tasks } = await supabase
      .from('crm_tasks')
      .select('*')
      .eq('contact_id', id)
      .order('due_date', { ascending: true, nullsFirst: false });

    return NextResponse.json({
      contact,
      pipeline: pipeline || [],
      tasks: tasks || [],
    });
  } catch (error) {
    console.error('Get contact error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/autopilot/crm/contacts/[id]
 * Update contact and recalculate lead score
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const distributor = await getCurrentUser();
    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id } = await params;

    // Verify contact ownership
    const { data: existingContact, error: fetchError } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('id', id)
      .eq('distributor_id', distributor.id)
      .single();

    if (fetchError || !existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Parse and validate update data
    const body = await request.json();
    const validatedData = ContactUpdateSchema.parse(body);

    // Prepare update object
    const updateData: any = { ...validatedData };

    // Recalculate lead score if relevant fields changed
    const scoreRelevantFields = ['lead_status', 'tags', 'email_opt_in', 'sms_opt_in', 'last_contact_date'];
    const shouldRecalculate = scoreRelevantFields.some((field) => field in validatedData);

    if (shouldRecalculate) {
      const scoreData = calculateLeadScore({
        last_contact_date: validatedData.last_contact_date || existingContact.last_contact_date,
        created_at: existingContact.created_at,
        lead_status: validatedData.lead_status || existingContact.lead_status,
        tags: validatedData.tags || existingContact.tags,
        email_opt_in: validatedData.email_opt_in ?? existingContact.email_opt_in,
        sms_opt_in: validatedData.sms_opt_in ?? existingContact.sms_opt_in,
        phone: existingContact.phone,
        email: existingContact.email,
      });

      updateData.lead_score = scoreData.score;
      updateData.lead_score_factors = scoreData.factors;
      updateData.last_score_updated_at = new Date().toISOString();
    }

    // Update contact
    const { data: contact, error: updateError } = await supabase
      .from('crm_contacts')
      .update(updateData)
      .eq('id', id)
      .eq('distributor_id', distributor.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating contact:', updateError);
      return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
    }

    return NextResponse.json({ contact });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }

    console.error('Update contact error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/autopilot/crm/contacts/[id]
 * Delete contact (cascade deletes pipeline and tasks)
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const distributor = await getCurrentUser();
    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id } = await params;

    // Delete contact (cascade will handle related records)
    const { error } = await supabase
      .from('crm_contacts')
      .delete()
      .eq('id', id)
      .eq('distributor_id', distributor.id);

    if (error) {
      console.error('Error deleting contact:', error);
      return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
    }

    // Decrement contact count
    await supabase.rpc('increment_autopilot_usage', {
      p_distributor_id: distributor.id,
      p_limit_type: 'contacts',
      p_increment: -1,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete contact error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
