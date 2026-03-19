// =============================================
// CRM Contacts API
// GET: List all contacts with filters
// POST: Create new contact
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';
import { calculateLeadScore } from '@/lib/autopilot/lead-scoring';
import { z } from 'zod';

// Validation schema for creating/updating contacts
const ContactSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
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
  notes: z.string().optional(),
  preferred_contact_method: z.enum(['email', 'phone', 'sms', 'whatsapp']).optional(),
  email_opt_in: z.boolean().optional(),
  sms_opt_in: z.boolean().optional(),
});

/**
 * GET /api/autopilot/crm/contacts
 * List all contacts with filters and search
 */
export async function GET(request: NextRequest) {
  try {
    const distributor = await getCurrentUser();
    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Check tier access (Pro or Team only)
    const { data: subscription } = await supabase
      .from('autopilot_subscriptions')
      .select('tier')
      .eq('distributor_id', distributor.id)
      .single();

    if (!subscription || !['lead_autopilot_pro', 'team_edition'].includes(subscription.tier)) {
      return NextResponse.json(
        { error: 'This feature requires Lead Autopilot Pro or Team Edition' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const leadStatus = searchParams.get('lead_status') || '';
    const leadSource = searchParams.get('lead_source') || '';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('crm_contacts')
      .select('*', { count: 'exact' })
      .eq('distributor_id', distributor.id)
      .eq('is_archived', false);

    // Apply filters
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`
      );
    }

    if (leadStatus) {
      query = query.eq('lead_status', leadStatus);
    }

    if (leadSource) {
      query = query.eq('lead_source', leadSource);
    }

    if (tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: contacts, error, count } = await query;

    if (error) {
      console.error('Error fetching contacts:', error);
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }

    return NextResponse.json({
      contacts: contacts || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Contacts API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/autopilot/crm/contacts
 * Create a new contact
 */
export async function POST(request: NextRequest) {
  try {
    const distributor = await getCurrentUser();
    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Check tier access and limits
    const { data: subscription } = await supabase
      .from('autopilot_subscriptions')
      .select('tier')
      .eq('distributor_id', distributor.id)
      .single();

    if (!subscription || !['lead_autopilot_pro', 'team_edition'].includes(subscription.tier)) {
      return NextResponse.json(
        { error: 'This feature requires Lead Autopilot Pro or Team Edition' },
        { status: 403 }
      );
    }

    // Check contact limit
    const { data: usage } = await supabase
      .from('autopilot_usage_limits')
      .select('contacts_count, contacts_limit')
      .eq('distributor_id', distributor.id)
      .single();

    if (usage) {
      // -1 means unlimited
      if (usage.contacts_limit !== -1 && usage.contacts_count >= usage.contacts_limit) {
        return NextResponse.json(
          {
            error: `Contact limit reached (${usage.contacts_limit}). Upgrade to Team Edition for unlimited contacts.`,
          },
          { status: 403 }
        );
      }
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = ContactSchema.parse(body);

    // Calculate initial lead score
    const scoreData = calculateLeadScore({
      last_contact_date: null,
      created_at: new Date().toISOString(),
      lead_status: validatedData.lead_status || 'new',
      tags: validatedData.tags || [],
      email_opt_in: validatedData.email_opt_in ?? true,
      sms_opt_in: validatedData.sms_opt_in ?? false,
      phone: validatedData.phone || null,
      email: validatedData.email || null,
    });

    // Prepare notes array if notes provided
    const notesArray = validatedData.notes
      ? [
          {
            content: validatedData.notes,
            created_at: new Date().toISOString(),
            created_by: 'system',
          },
        ]
      : [];

    // Create contact
    const { data: contact, error } = await supabase
      .from('crm_contacts')
      .insert({
        distributor_id: distributor.id,
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        company: validatedData.company || null,
        job_title: validatedData.job_title || null,
        address_line1: validatedData.address_line1 || null,
        address_line2: validatedData.address_line2 || null,
        city: validatedData.city || null,
        state: validatedData.state || null,
        zip: validatedData.zip || null,
        country: validatedData.country || 'United States',
        lead_source: validatedData.lead_source || null,
        lead_source_details: validatedData.lead_source_details || null,
        lead_status: validatedData.lead_status || 'new',
        lead_score: scoreData.score,
        lead_score_factors: scoreData.factors,
        last_score_updated_at: new Date().toISOString(),
        tags: validatedData.tags || [],
        notes: notesArray,
        preferred_contact_method: validatedData.preferred_contact_method || null,
        email_opt_in: validatedData.email_opt_in ?? true,
        sms_opt_in: validatedData.sms_opt_in ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating contact:', error);
      return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
    }

    // Increment contact count
    await supabase.rpc('increment_autopilot_usage', {
      p_distributor_id: distributor.id,
      p_limit_type: 'contacts',
      p_increment: 1,
    });

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }

    console.error('Create contact error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
