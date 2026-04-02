import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Fetch notes for a session
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: distributor } = await supabase
      .from('distributors')
      .select('is_admin, is_master')
      .eq('user_id', user.id)
      .single();

    if (!distributor?.is_admin && !distributor?.is_master) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch notes with admin details
    const { data: notes, error } = await supabase
      .from('fulfillment_notes')
      .select(`
        *,
        admin_distributor:distributors!admin_id(
          first_name,
          last_name,
          email
        )
      `)
      .eq('onboarding_session_id', sessionId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST - Create new note
export async function POST(request: Request) {
  try {
    const { session_id, note_text } = await request.json();

    if (!session_id || !note_text) {
      return NextResponse.json(
        { error: 'session_id and note_text are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: distributor } = await supabase
      .from('distributors')
      .select('is_admin, is_master')
      .eq('user_id', user.id)
      .single();

    if (!distributor?.is_admin && !distributor?.is_master) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Insert note
    const { data: note, error } = await supabase
      .from('fulfillment_notes')
      .insert({
        onboarding_session_id: session_id,
        admin_id: user.id,
        note_text: note_text.trim()
      })
      .select(`
        *,
        admin_distributor:distributors!admin_id(
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}

// PATCH - Soft delete note
export async function PATCH(request: Request) {
  try {
    const { note_id } = await request.json();

    if (!note_id) {
      return NextResponse.json(
        { error: 'note_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Soft delete (set deleted_at)
    const { error } = await supabase
      .from('fulfillment_notes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', note_id)
      .eq('admin_id', user.id) // Can only delete own notes
      .is('deleted_at', null);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
