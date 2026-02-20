// =============================================
// Gamification Badges API
// Get all available badges with earned status
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { BadgeWithEarned } from '@/types/training';

// GET /api/training/gamification/badges - Get all available badges
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all badges
    const { data: allBadges } = await supabase
      .from('training_badges')
      .select('*')
      .eq('is_active', true)
      .order('tier', { ascending: true });

    // Get user's earned badges
    const { data: userBadges } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', user.id);

    const earnedIds = new Set(userBadges?.map((b) => b.badge_id) || []);
    const earnedDates = new Map(
      userBadges?.map((b) => [b.badge_id, b.earned_at]) || []
    );

    const badges: BadgeWithEarned[] =
      allBadges?.map((badge) => ({
        ...badge,
        earned: earnedIds.has(badge.id),
        earnedAt: earnedDates.get(badge.id) || null,
      })) || [];

    return NextResponse.json(badges);
  } catch (error: any) {
    console.error('Error in GET /api/training/gamification/badges:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
