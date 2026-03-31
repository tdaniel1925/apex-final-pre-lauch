// =============================================
// CRM Contacts API - List and Create
// GET: List contacts with pagination, filtering, search
// POST: Create new contact
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentDistributor } from '@/lib/auth/server';
import { z } from 'zod';

// =============================================
// Validation Schemas
// =============================================

const createContactSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  title: z.string().max(100).optional().nullable(),
  contact_type: z.enum(['customer', 'prospect', 'partner', 'vendor']).default('customer'),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
  lifetime_value: z.number().min(0).optional().default(0),
  last_purchase_date: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  original_source: z.string().max(50).optional().nullable(),
});

// =============================================
// GET /api/crm/contacts - List contacts
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
    const contactType = searchParams.get('contact_type');
    const status = searchParams.get('status');
    const search = searchParams.get('search'); // Search by name, email, or company

    // Build query
    let query = supabase
      .from('crm_contacts')
      .select('*', { count: 'exact' })
      .eq('distributor_id', currentDist.id);

    // Apply filters
    if (contactType) {
      query = query.eq('contact_type', contactType);
    }
    if (status) {
      query = query.eq('status', status);
    }

    // Apply search (name, email, or company)
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
    }

    // Apply pagination and sorting
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: contacts, error, count } = await query;

    if (error) {
      console.error('Error fetching contacts:', error);
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }

    return NextResponse.json({
      contacts: contacts || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Unexpected error fetching contacts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================
// POST /api/crm/contacts - Create contact
// =============================================
export async function POST(request: NextRequest) {
  try {
    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validation = createContactSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const contactData = validation.data;

    const supabase = await createClient();

    // Check for duplicate email (if provided)
    if (contactData.email) {
      const { data: existing } = await supabase
        .from('crm_contacts')
        .select('id')
        .eq('distributor_id', currentDist.id)
        .eq('email', contactData.email)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'A contact with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Create contact
    const { data: contact, error } = await supabase
      .from('crm_contacts')
      .insert({
        ...contactData,
        distributor_id: currentDist.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating contact:', error);
      return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
    }

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error creating contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
