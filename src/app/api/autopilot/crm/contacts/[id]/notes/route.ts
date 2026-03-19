// =============================================
// CRM Contact Notes API
// POST: Add note to contact
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';
import { z } from 'zod';

const NoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
});

/**
 * POST /api/autopilot/crm/contacts/[id]/notes
 * Add a note to a contact
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const distributor = await getCurrentUser();
    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id: contactId } = await params;

    // Verify contact ownership
    const { data: contact, error: fetchError } = await supabase
      .from('crm_contacts')
      .select('notes')
      .eq('id', contactId)
      .eq('distributor_id', distributor.id)
      .single();

    if (fetchError || !contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Parse and validate note
    const body = await request.json();
    const { content } = NoteSchema.parse(body);

    // Prepare new note
    const newNote = {
      content,
      created_at: new Date().toISOString(),
      created_by: `${distributor.first_name} ${distributor.last_name}`,
    };

    // Get existing notes array
    const existingNotes = (contact.notes as any[]) || [];

    // Prepend new note to array
    const updatedNotes = [newNote, ...existingNotes];

    // Update contact with new notes array
    const { data: updatedContact, error: updateError } = await supabase
      .from('crm_contacts')
      .update({
        notes: updatedNotes,
        last_contact_date: new Date().toISOString(),
        last_contact_type: 'email', // Default to email for note tracking
      })
      .eq('id', contactId)
      .eq('distributor_id', distributor.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error adding note:', updateError);
      return NextResponse.json({ error: 'Failed to add note' }, { status: 500 });
    }

    return NextResponse.json({ contact: updatedContact, note: newNote }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }

    console.error('Add note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
