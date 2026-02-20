// =============================================
// Training Progress API
// Track user completion and update streaks
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { UpdateProgressInput } from '@/types/training';

// GET /api/training/progress - Get user's progress for all content
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('training_progress')
      .select(`
        *,
        content:training_content(*)
      `)
      .eq('user_id', user.id)
      .order('last_accessed_at', { ascending: false });

    if (error) {
      console.error('Error fetching progress:', error);
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in GET /api/training/progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/training/progress - Update progress for content
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: UpdateProgressInput = await request.json();

    if (!body.content_id) {
      return NextResponse.json(
        { error: 'content_id is required' },
        { status: 400 }
      );
    }

    // Verify content exists
    const { data: content } = await supabase
      .from('training_content')
      .select('id, duration_seconds')
      .eq('id', body.content_id)
      .eq('is_published', true)
      .single();

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Check if progress record exists
    const { data: existing } = await supabase
      .from('training_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('content_id', body.content_id)
      .single();

    const now = new Date().toISOString();
    const isCompleting = body.completed === true && (!existing || !existing.completed);

    let result;

    if (existing) {
      // Update existing progress
      const { data, error } = await supabase
        .from('training_progress')
        .update({
          ...body,
          completed_at: isCompleting ? now : existing.completed_at,
          last_accessed_at: now,
        })
        .eq('user_id', user.id)
        .eq('content_id', body.content_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating progress:', error);
        return NextResponse.json(
          { error: 'Failed to update progress' },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Create new progress record
      const { data, error } = await supabase
        .from('training_progress')
        .insert({
          user_id: user.id,
          ...body,
          completed_at: isCompleting ? now : null,
          started_at: now,
          last_accessed_at: now,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating progress:', error);
        return NextResponse.json(
          { error: 'Failed to create progress' },
          { status: 500 }
        );
      }

      result = data;
    }

    // If completing for first time, update streak
    if (isCompleting) {
      await updateStreakOnCompletion(user.id, content, supabase);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in POST /api/training/progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to update streak when lesson is completed
async function updateStreakOnCompletion(
  userId: string,
  content: any,
  supabase: any
) {
  const { data: streak } = await supabase
    .from('training_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let newStreak = 1;
  let newLongest = 1;

  if (streak) {
    const lastDate = streak.last_completed_date;

    if (lastDate === today) {
      // Already completed today, don't increment streak
      newStreak = streak.current_streak;
    } else if (lastDate === yesterday) {
      // Consecutive day
      newStreak = streak.current_streak + 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }

    newLongest = Math.max(newStreak, streak.longest_streak);

    // Calculate points: 10 for daily completion
    const pointsToAdd = 10;

    await supabase
      .from('training_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_completed_date: today,
        total_points: streak.total_points + pointsToAdd,
        total_lessons_completed: streak.total_lessons_completed + 1,
        total_watch_time_seconds:
          streak.total_watch_time_seconds + (content.duration_seconds || 0),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  } else {
    // Create new streak record
    await supabase.from('training_streaks').insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_completed_date: today,
      total_points: 10,
      total_lessons_completed: 1,
      total_watch_time_seconds: content.duration_seconds || 0,
    });
  }

  // Check for badge unlocks
  await checkBadgeUnlocks(userId, newStreak, newLongest, supabase);
}

// Check if user unlocked any badges
async function checkBadgeUnlocks(
  userId: string,
  currentStreak: number,
  longestStreak: number,
  supabase: any
) {
  // Get all badges user hasn't earned yet
  const { data: badges } = await supabase
    .from('training_badges')
    .select('*')
    .eq('is_active', true);

  if (!badges) return;

  const { data: earnedBadges } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  const earnedIds = new Set(earnedBadges?.map((b: any) => b.badge_id) || []);

  // Get user's streak data for points and lessons check
  const { data: streak } = await supabase
    .from('training_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  for (const badge of badges) {
    if (earnedIds.has(badge.id)) continue; // Already earned

    let shouldUnlock = false;

    if (badge.criteria_type === 'streak' && currentStreak >= badge.criteria_value) {
      shouldUnlock = true;
    } else if (
      badge.criteria_type === 'longest_streak' &&
      longestStreak >= badge.criteria_value
    ) {
      shouldUnlock = true;
    } else if (
      badge.criteria_type === 'lessons_completed' &&
      streak &&
      streak.total_lessons_completed >= badge.criteria_value
    ) {
      shouldUnlock = true;
    } else if (
      badge.criteria_type === 'points' &&
      streak &&
      streak.total_points >= badge.criteria_value
    ) {
      shouldUnlock = true;
    }

    if (shouldUnlock) {
      await supabase.from('user_badges').insert({
        user_id: userId,
        badge_id: badge.id,
      });
    }
  }
}
