// =============================================
// Single Episode API
// Get, Update, Delete individual episode
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';

// GET single episode
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('training_episodes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Fetch episode error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      episode: data,
    });
  } catch (error: any) {
    console.error('Fetch episode error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH update episode
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();
    const updates = await request.json();

    const { data, error } = await supabase
      .from('training_episodes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update episode error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      episode: data,
    });
  } catch (error: any) {
    console.error('Update episode error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE episode
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase.from('training_episodes').delete().eq('id', id);

    if (error) {
      console.error('Delete episode error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Episode deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete episode error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
