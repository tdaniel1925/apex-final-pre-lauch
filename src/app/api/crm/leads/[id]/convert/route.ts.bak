// =============================================
// CRM Leads API - Convert Lead to Contact
// POST: Convert lead to contact
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentDistributor } from '@/lib/auth/server';
import { z } from 'zod';

// =============================================
// Validation Schema
// =============================================

const convertLeadSchema = z.object({
  contact_type: z.enum(['customer', 'prospect', 'partner', 'vendor']).default('customer'),
  title: z.string().max(100).optional().nullable(),
  lifetime_value: z.number().min(0).optional().nullable(),
});

// =============================================
// POST /api/crm/leads/[id]/convert - Convert to contact
// =============================================
export async function POST(
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
    const validation = convertLeadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const conversionData = validation.data;

    const supabase = await createClient();

    // Fetch lead
    const { data: lead, error: leadError } = await supabase
      .from('crm_leads')
      .select('*')
      .eq('id', params.id)
      .eq('distributor_id', currentDist.id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Check if already converted
    if (lead.status === 'converted' && lead.converted_to_contact_id) {
      return NextResponse.json(
        { error: 'Lead has already been converted', contact_id: lead.converted_to_contact_id },
        { status: 409 }
      );
    }

    // Create contact from lead data
    const { data: contact, error: contactError } = await supabase
      .from('crm_contacts')
      .insert({
        distributor_id: currentDist.id,
        first_name: lead.first_name,
        last_name: lead.last_name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        contact_type: conversionData.contact_type,
        title: conversionData.title,
        lifetime_value: conversionData.lifetime_value || 0,
        notes: lead.notes,
        tags: lead.tags,
        original_lead_id: lead.id,
        original_source: lead.source,
        status: 'active',
      })
      .select()
      .single();

    if (contactError) {
      console.error('Error creating contact:', contactError);
      return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
    }

    // Update lead to mark as converted
    const { error: updateError } = await supabase
      .from('crm_leads')
      .update({
        status: 'converted',
        converted_to_contact_id: contact.id,
        converted_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('distributor_id', currentDist.id);

    if (updateError) {
      console.error('Error updating lead:', updateError);
      // Contact was created but lead wasn't updated - non-critical error
    }

    // Copy activities from lead to contact
    const { data: activities } = await supabase
      .from('crm_activities')
      .select('*')
      .eq('lead_id', lead.id)
      .eq('distributor_id', currentDist.id);

    if (activities && activities.length > 0) {
      const copiedActivities = activities.map((activity) => ({
        distributor_id: currentDist.id,
        contact_id: contact.id,
        lead_id: null, // Remove lead reference
        activity_type: activity.activity_type,
        subject: `[From Lead] ${activity.subject}`,
        description: activity.description,
        duration_minutes: activity.duration_minutes,
        outcome: activity.outcome,
        activity_date: activity.activity_date,
      }));

      await supabase.from('crm_activities').insert(copiedActivities);
    }

    // Copy tasks from lead to contact
    const { data: tasks } = await supabase
      .from('crm_tasks')
      .select('*')
      .eq('lead_id', lead.id)
      .eq('distributor_id', currentDist.id)
      .in('status', ['pending', 'in_progress']); // Only copy active tasks

    if (tasks && tasks.length > 0) {
      const copiedTasks = tasks.map((task) => ({
        distributor_id: currentDist.id,
        contact_id: contact.id,
        lead_id: null, // Remove lead reference
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        due_date: task.due_date,
      }));

      await supabase.from('crm_tasks').insert(copiedTasks);
    }

    return NextResponse.json({
      contact,
      message: 'Lead successfully converted to contact',
      activities_copied: activities?.length || 0,
      tasks_copied: tasks?.length || 0,
    });
  } catch (error) {
    console.error('Unexpected error converting lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
