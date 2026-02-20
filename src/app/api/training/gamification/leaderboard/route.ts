// =============================================
// Gamification Leaderboard API
// Get top users by points
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { LeaderboardEntry } from '@/types/training';

// GET /api/training/gamification/leaderboard - Get top users
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const { data: streaks, error } = await supabase
      .from('training_streaks')
      .select(`
        user_id,
        total_points,
        current_streak,
        total_lessons_completed
      `)
      .order('total_points', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    // Get user names from distributors table
    const userIds = streaks?.map((s) => s.user_id) || [];

    const { data: distributors } = await supabase
      .from('distributors')
      .select('id, first_name, last_name')
      .in('id', userIds);

    const leaderboard: LeaderboardEntry[] =
      streaks?.map((streak, index) => {
        const distributor = distributors?.find((d) => d.id === streak.user_id);
        return {
          userId: streak.user_id,
          userName: distributor
            ? `${distributor.first_name} ${distributor.last_name}`
            : 'Unknown',
          totalPoints: streak.total_points,
          currentStreak: streak.current_streak,
          totalLessons: streak.total_lessons_completed,
          rank: index + 1,
        };
      }) || [];

    return NextResponse.json(leaderboard);
  } catch (error: any) {
    console.error('Error in GET /api/training/gamification/leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
