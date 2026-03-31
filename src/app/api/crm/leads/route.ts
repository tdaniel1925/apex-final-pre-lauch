// =============================================
// CRM Leads API - List and Create
// GET: List leads with pagination, filtering, search
// POST: Create new lead
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentDistributor } from '@/lib/auth/server';
import { z } from 'zod';

// =============================================
// Validation Schemas
// =============================================

const createLeadSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  status: z.enum(['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost']).default('new'),
  source: z.enum(['website', 'referral', 'social_media', 'event', 'cold_call', 'email_campaign', 'other']).optional().nullable(),
  interest_level: z.enum(['low', 'medium', 'high']).optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
});

// =============================================
// GET /api/crm/leads - List leads
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Filters
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const interestLevel = searchParams.get('interest_level');
    const search = searchParams.get('search'); // Search by name or email

    // Build query
    let query = supabase
      .from('crm_leads')
      .select('*', { count: 'exact' })
      .eq('distributor_id', currentDist.id);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (source) {
      query = query.eq('source', source);
    }
    if (interestLevel) {
      query = query.eq('interest_level', interestLevel);
    }

    // Apply search (name or email)
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply pagination and sorting
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: leads, error, count } = await query;

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }

    return NextResponse.json({
      leads: leads || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Unexpected error fetching leads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================
// POST /api/crm/leads - Create lead
// =============================================
export async function POST(request: NextRequest) {
  try {
    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validation = createLeadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const leadData = validation.data;

    const supabase = await createClient();

    // Check for duplicate email (if provided)
    if (leadData.email) {
      const { data: existing } = await supabase
        .from('crm_leads')
        .select('id')
        .eq('distributor_id', currentDist.id)
        .eq('email', leadData.email)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'A lead with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Create lead
    const { data: lead, error } = await supabase
      .from('crm_leads')
      .insert({
        ...leadData,
        distributor_id: currentDist.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
    }

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error creating lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
