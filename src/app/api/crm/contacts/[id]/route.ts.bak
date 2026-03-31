// =============================================
// CRM Contacts API - Single Contact Operations
// GET: Get single contact
// PUT: Update contact
// DELETE: Delete contact
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentDistributor } from '@/lib/auth/server';
import { z } from 'zod';

// =============================================
// Validation Schemas
// =============================================

const updateContactSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  title: z.string().max(100).optional().nullable(),
  contact_type: z.enum(['customer', 'prospect', 'partner', 'vendor']).optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
  lifetime_value: z.number().min(0).optional(),
  last_purchase_date: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
});

// =============================================
// GET /api/crm/contacts/[id] - Get single contact
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

    const { data: contact, error } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('id', params.id)
      .eq('distributor_id', currentDist.id)
      .single();

    if (error || !contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Unexpected error fetching contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================
// PUT /api/crm/contacts/[id] - Update contact
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
    const validation = updateContactSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    const supabase = await createClient();

    // Verify contact exists and belongs to current distributor
    const { data: existing } = await supabase
      .from('crm_contacts')
      .select('id')
      .eq('id', params.id)
      .eq('distributor_id', currentDist.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Check for duplicate email (if email is being updated)
    if (updateData.email) {
      const { data: duplicate } = await supabase
        .from('crm_contacts')
        .select('id')
        .eq('distributor_id', currentDist.id)
        .eq('email', updateData.email)
        .neq('id', params.id)
        .single();

      if (duplicate) {
        return NextResponse.json(
          { error: 'A contact with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Update contact
    const { data: contact, error } = await supabase
      .from('crm_contacts')
      .update(updateData)
      .eq('id', params.id)
      .eq('distributor_id', currentDist.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating contact:', error);
      return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
    }

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Unexpected error updating contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================
// DELETE /api/crm/contacts/[id] - Delete contact
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

    // Delete contact (RLS will ensure it belongs to current distributor)
    // CASCADE will delete related activities and tasks
    const { error } = await supabase
      .from('crm_contacts')
      .delete()
      .eq('id', params.id)
      .eq('distributor_id', currentDist.id);

    if (error) {
      console.error('Error deleting contact:', error);
      return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error deleting contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
