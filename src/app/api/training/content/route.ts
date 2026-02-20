// =============================================
// Training Content API
// List and create training content
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminUser, hasAdminRole } from '@/lib/auth/admin';
import type { CreateContentInput } from '@/types/training';

// GET /api/training/content - List all published content (or all if admin)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if admin
    const adminUser = await getAdminUser();
    const isAdmin = adminUser && hasAdminRole(adminUser.admin, 'admin');

    let query = supabase
      .from('training_content')
      .select('*')
      .order('created_at', { ascending: false });

    // Non-admins only see published content
    if (!isAdmin) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching training content:', error);
      return NextResponse.json(
        { error: 'Failed to fetch training content' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Unexpected error in GET /api/training/content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/training/content - Create new content (admin only)
export async function POST(request: NextRequest) {
  try {
    const adminUser = await getAdminUser();

    if (!adminUser || !hasAdminRole(adminUser.admin, 'admin')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body: CreateContentInput = await request.json();

    // Validation
    if (!body.title || !body.content_type) {
      return NextResponse.json(
        {
          error: 'Title and content_type are required',
          fields: ['title', 'content_type'],
        },
        { status: 400 }
      );
    }

    // Validate content_type
    const validTypes = ['audio', 'video', 'article', 'pdf'];
    if (!validTypes.includes(body.content_type)) {
      return NextResponse.json(
        {
          error: `content_type must be one of: ${validTypes.join(', ')}`,
          fields: ['content_type'],
        },
        { status: 400 }
      );
    }

    // Validate at least one content URL/body exists
    if (
      !body.audio_url &&
      !body.video_url &&
      !body.article_body &&
      !body.pdf_url
    ) {
      return NextResponse.json(
        {
          error:
            'At least one content source required (audio_url, video_url, article_body, or pdf_url)',
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('training_content')
      .insert({
        ...body,
        created_by: adminUser.admin.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating training content:', error);
      return NextResponse.json(
        { error: 'Failed to create training content' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error in POST /api/training/content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
