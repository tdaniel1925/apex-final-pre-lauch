// =============================================
// Admin - Distributor Notes API
// GET: List notes, POST: Create note
// =============================================

import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { logAdminActivity } from '@/lib/admin/activity-logger';
import { z } from 'zod';

const createNoteSchema = z.object({
  noteType: z.enum(['general', 'warning', 'important', 'follow_up', 'compliance', 'password_reset', 'status_change']).default('general'),
  noteText: z.string().min(1, 'Note text is required'),
  isPinned: z.boolean().optional().default(false),
  priority: z.enum(['normal', 'high', 'urgent']).default('normal'),
  followUpDate: z.string().optional(), // ISO date string
});

// GET /api/admin/distributors/[id]/notes
// List all notes for a distributor
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin session
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: distributorId } = await params;
    const serviceClient = createServiceClient();

    // Verify distributor exists
    const { data: distributor, error: distributorError } = await serviceClient
      .from('distributors')
      .select('id, first_name, last_name')
      .eq('id', distributorId)
      .single();

    if (distributorError || !distributor) {
      return NextResponse.json(
        { success: false, error: 'Distributor not found' },
        { status: 404 }
      );
    }

    // Get notes (pinned first, then by date)
    const { data: notes, error: notesError } = await serviceClient
      .from('admin_notes')
      .select('*')
      .eq('distributor_id', distributorId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (notesError) {
      console.error('Failed to fetch notes:', notesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch notes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notes: notes || [],
      total: notes?.length || 0,
    });
  } catch (error) {
    console.error('Error in GET notes API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/distributors/[id]/notes
// Create a new note
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin session
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: distributorId } = await params;
    const body = await request.json();

    // Validate input
    const validation = createNoteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { noteType, noteText, isPinned, priority, followUpDate } = validation.data;

    const serviceClient = createServiceClient();

    // Verify distributor exists
    const { data: distributor, error: distributorError } = await serviceClient
      .from('distributors')
      .select('id, first_name, last_name')
      .eq('id', distributorId)
      .single();

    if (distributorError || !distributor) {
      return NextResponse.json(
        { success: false, error: 'Distributor not found' },
        { status: 404 }
      );
    }

    // Create note
    const { data: note, error: noteError } = await serviceClient
      .from('admin_notes')
      .insert({
        distributor_id: distributorId,
        admin_id: admin.admin.id,
        admin_name: `${admin.admin.first_name} ${admin.admin.last_name}`,
        note_type: noteType,
        note_text: noteText,
        is_pinned: isPinned,
        priority: priority,
        follow_up_date: followUpDate || null,
      })
      .select()
      .single();

    if (noteError || !note) {
      console.error('Failed to create note:', noteError);
      return NextResponse.json(
        { success: false, error: 'Failed to create note' },
        { status: 500 }
      );
    }

    // Log activity
    await logAdminActivity({
      adminId: admin.admin.id,
      adminEmail: admin.admin.email,
      adminName: `${admin.admin.first_name} ${admin.admin.last_name}`,
      distributorId: distributor.id,
      distributorName: `${distributor.first_name} ${distributor.last_name}`,
      actionType: 'note_added',
      actionDescription: `Added ${noteType} note: "${noteText.substring(0, 50)}${noteText.length > 50 ? '...' : ''}"`,
      changes: {
        before: {},
        after: { note_id: note.id, note_type: noteType, priority },
        fields: ['admin_notes'],
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Note created successfully',
      note,
    });
  } catch (error) {
    console.error('Error in POST notes API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
