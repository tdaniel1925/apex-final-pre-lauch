import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { sessionId } = await params;

    // Delete session (only if it belongs to the current user)
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) {
      console.error('[API] Error deleting session:', error);
      return NextResponse.json(
        { error: 'Failed to delete session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error deleting session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
