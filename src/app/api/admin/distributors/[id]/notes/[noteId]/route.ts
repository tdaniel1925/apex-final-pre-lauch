// =============================================
// Admin - Individual Note API
// PATCH: Update note, DELETE: Delete note
// =============================================

import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { logAdminActivity } from '@/lib/admin/activity-logger';
import { z } from 'zod';

const updateNoteSchema = z.object({
  noteText: z.string().min(1).optional(),
  noteType: z.enum(['general', 'warning', 'important', 'follow_up', 'compliance', 'password_reset', 'status_change']).optional(),
  isPinned: z.boolean().optional(),
  priority: z.enum(['normal', 'high', 'urgent']).optional(),
  followUpDate: z.string().nullable().optional(),
  isResolved: z.boolean().optional(),
});

// PATCH /api/admin/distributors/[id]/notes/[noteId]
// Update an existing note
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    // Verify admin session
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: distributorId, noteId } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateNoteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const updates = validation.data;
    const serviceClient = createServiceClient();

    // Get existing note
    const { data: existingNote, error: fetchError } = await serviceClient
      .from('admin_notes')
      .select('*, distributors(first_name, last_name)')
      .eq('id', noteId)
      .eq('distributor_id', distributorId)
      .single();

    if (fetchError || !existingNote) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: any = {};
    if (updates.noteText !== undefined) updateData.note_text = updates.noteText;
    if (updates.noteType !== undefined) updateData.note_type = updates.noteType;
    if (updates.isPinned !== undefined) updateData.is_pinned = updates.isPinned;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.followUpDate !== undefined) updateData.follow_up_date = updates.followUpDate;
    if (updates.isResolved !== undefined) {
      updateData.is_resolved = updates.isResolved;
      if (updates.isResolved) {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = admin.admin.id;
      } else {
        updateData.resolved_at = null;
        updateData.resolved_by = null;
      }
    }

    // Update note
    const { data: updatedNote, error: updateError } = await serviceClient
      .from('admin_notes')
      .update(updateData)
      .eq('id', noteId)
      .select()
      .single();

    if (updateError || !updatedNote) {
      console.error('Failed to update note:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update note' },
        { status: 500 }
      );
    }

    // Log activity
    const changedFields = Object.keys(updateData);
    const before: any = {};
    const after: any = {};

    changedFields.forEach(field => {
      before[field] = (existingNote as any)[field];
      after[field] = (updatedNote as any)[field];
    });

    await logAdminActivity({
      adminId: admin.admin.id,
      adminEmail: admin.admin.email,
      adminName: `${admin.admin.first_name} ${admin.admin.last_name}`,
      distributorId: distributorId,
      distributorName: `${(existingNote as any).distributors.first_name} ${(existingNote as any).distributors.last_name}`,
      actionType: 'note_updated',
      actionDescription: `Updated note (${changedFields.join(', ')})`,
      changes: {
        before,
        after,
        fields: changedFields,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Note updated successfully',
      note: updatedNote,
    });
  } catch (error) {
    console.error('Error in PATCH note API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/distributors/[id]/notes/[noteId]
// Delete a note (only super_admin can delete, per RLS policy)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    // Verify admin session
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if super_admin
    if (admin.admin.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only super admins can delete notes' },
        { status: 403 }
      );
    }

    const { id: distributorId, noteId } = await params;
    const serviceClient = createServiceClient();

    // Get note before deleting (for logging)
    const { data: note, error: fetchError } = await serviceClient
      .from('admin_notes')
      .select('*, distributors(first_name, last_name)')
      .eq('id', noteId)
      .eq('distributor_id', distributorId)
      .single();

    if (fetchError || !note) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      );
    }

    // Delete note
    const { error: deleteError } = await serviceClient
      .from('admin_notes')
      .delete()
      .eq('id', noteId);

    if (deleteError) {
      console.error('Failed to delete note:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete note' },
        { status: 500 }
      );
    }

    // Log activity
    await logAdminActivity({
      adminId: admin.admin.id,
      adminEmail: admin.admin.email,
      adminName: `${admin.admin.first_name} ${admin.admin.last_name}`,
      distributorId: distributorId,
      distributorName: `${(note as any).distributors.first_name} ${(note as any).distributors.last_name}`,
      actionType: 'note_deleted',
      actionDescription: `Deleted ${note.note_type} note: "${note.note_text.substring(0, 50)}${note.note_text.length > 50 ? '...' : ''}"`,
      changes: {
        before: { note_id: note.id, note_type: note.note_type },
        after: {},
        fields: ['admin_notes'],
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Error in DELETE note API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
