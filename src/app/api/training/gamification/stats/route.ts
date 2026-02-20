// =============================================
// Gamification Stats API
// Get user's gamification statistics
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { TrainingDashboardStats } from '@/types/training';

// GET /api/training/gamification/stats - Get user's gamification stats
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get streak data
    const { data: streak } = await supabase
      .from('training_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get badges earned
    const { data: badges } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge:training_badges(*)
      `)
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    // Get leaderboard rank
    const { data: allStreaks } = await supabase
      .from('training_streaks')
      .select('user_id, total_points')
      .order('total_points', { ascending: false });

    let rank = null;
    if (allStreaks && streak) {
      rank = allStreaks.findIndex((s) => s.user_id === user.id) + 1;
    }

    const stats: TrainingDashboardStats = {
      currentStreak: streak?.current_streak || 0,
      longestStreak: streak?.longest_streak || 0,
      totalPoints: streak?.total_points || 0,
      totalLessons: streak?.total_lessons_completed || 0,
      badgesEarned: badges?.length || 0,
      badges: badges || [],
      leaderboardRank: rank,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error in GET /api/training/gamification/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
