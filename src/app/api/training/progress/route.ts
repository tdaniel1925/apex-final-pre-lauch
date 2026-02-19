// =============================================
// Training Progress API
// Track user listening progress
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';

// GET user's progress for all episodes
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('training_progress')
      .select('*')
      .eq('distributor_id', user.id)
      .order('last_listened_at', { ascending: false });

    if (error) {
      console.error('Fetch progress error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      progress: data || [],
    });
  } catch (error: any) {
    console.error('Fetch progress error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST update progress
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      episodeId,
      currentPosition,
      durationSeconds,
      completed,
    } = await request.json();

    if (!episodeId) {
      return NextResponse.json(
        { success: false, error: 'Episode ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if progress entry exists
    const { data: existing } = await supabase
      .from('training_progress')
      .select('*')
      .eq('distributor_id', user.id)
      .eq('episode_id', episodeId)
      .single();

    const progressData = {
      distributor_id: user.id,
      episode_id: episodeId,
      current_position_seconds: currentPosition || 0,
      duration_seconds: durationSeconds,
      completed: completed || false,
      completed_at: completed ? new Date().toISOString() : existing?.completed_at || null,
      last_listened_at: new Date().toISOString(),
      listen_count: (existing?.listen_count || 0) + (existing ? 0 : 1),
    };

    const { data, error } = await supabase
      .from('training_progress')
      .upsert(progressData, {
        onConflict: 'distributor_id,episode_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Update progress error:', error);
      throw error;
    }

    // Increment episode listen count if first time
    if (!existing) {
      await supabase.rpc('increment_episode_listens', { episode_id: episodeId });
    }

    // Increment completion count if newly completed
    if (completed && !existing?.completed) {
      await supabase.rpc('increment_episode_completions', { episode_id: episodeId });
    }

    return NextResponse.json({
      success: true,
      progress: data,
    });
  } catch (error: any) {
    console.error('Update progress error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
