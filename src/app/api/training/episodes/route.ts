// =============================================
// Training Episodes CRUD API
// Manage training podcast episodes
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';

// GET all episodes
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const isAdmin = searchParams.get('admin') === 'true';

    let query = supabase
      .from('training_episodes')
      .select('*')
      .order('season_number', { ascending: true })
      .order('episode_number', { ascending: true });

    // Filter by status (admin sees all, users only published)
    if (isAdmin && status) {
      query = query.eq('status', status);
    } else if (!isAdmin) {
      query = query.eq('status', 'published');
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fetch episodes error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      episodes: data || [],
    });
  } catch (error: any) {
    console.error('Fetch episodes error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create new episode
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    const episodeData = {
      ...body,
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from('training_episodes')
      .insert(episodeData)
      .select()
      .single();

    if (error) {
      console.error('Create episode error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      episode: data,
    });
  } catch (error: any) {
    console.error('Create episode error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
