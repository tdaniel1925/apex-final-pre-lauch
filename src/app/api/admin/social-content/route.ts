// ============================================================
// API: Social Content Management
// CRUD operations for social media content library
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';

// GET - List all social content
export async function GET() {
  try {
    const serviceClient = createServiceClient();

    const { data, error } = await serviceClient
      .from('social_content')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching social content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social content' },
      { status: 500 }
    );
  }
}

// POST - Create new social content
export async function POST(request: NextRequest) {
  try {
    const adminContext = await getAdminUser();

    if (!adminContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, category, image_url, caption_template, hashtags, best_day, sort_order } = body;

    if (!title || !category || !image_url) {
      return NextResponse.json(
        { error: 'Missing required fields: title, category, image_url' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    const { data, error } = await serviceClient
      .from('social_content')
      .insert({
        title,
        category,
        image_url,
        caption_template,
        hashtags,
        best_day,
        sort_order: sort_order || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating social content:', error);
    return NextResponse.json(
      { error: 'Failed to create social content' },
      { status: 500 }
    );
  }
}
