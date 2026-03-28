import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Get specific session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: session, error } = await supabase
      .from('ai_chat_sessions')
      .select('*')
      .eq('id', id)
      .eq('distributor_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching session:', error);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error in GET /api/ai-chat/sessions/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update session (add messages)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { messages, title } = await request.json();

    // Update session
    const updateData: any = {
      last_message_at: new Date().toISOString(),
    };

    if (messages !== undefined) {
      updateData.messages = messages;
    }

    if (title !== undefined) {
      updateData.title = title;
    }

    const { data: session, error } = await supabase
      .from('ai_chat_sessions')
      .update(updateData)
      .eq('id', id)
      .eq('distributor_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating session:', error);
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error in PUT /api/ai-chat/sessions/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from('ai_chat_sessions')
      .delete()
      .eq('id', id)
      .eq('distributor_id', user.id);

    if (error) {
      console.error('Error deleting session:', error);
      return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/ai-chat/sessions/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
