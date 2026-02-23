// ============================================================
// API: Social Content Management (Single Item)
// Update and delete specific social content
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';

// PUT - Update social content
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminContext = await getAdminUser();

    if (!adminContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();
    const { title, category, image_url, caption_template, hashtags, best_day, sort_order, is_active } = body;

    const updateData: any = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (caption_template !== undefined) updateData.caption_template = caption_template;
    if (hashtags !== undefined) updateData.hashtags = hashtags;
    if (best_day !== undefined) updateData.best_day = best_day;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (is_active !== undefined) updateData.is_active = is_active;

    const serviceClient = createServiceClient();

    const { data, error } = await serviceClient
      .from('social_content')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating social content:', error);
    return NextResponse.json(
      { error: 'Failed to update social content' },
      { status: 500 }
    );
  }
}

// DELETE - Delete social content
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminContext = await getAdminUser();

    if (!adminContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const serviceClient = createServiceClient();

    const { error } = await serviceClient
      .from('social_content')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting social content:', error);
    return NextResponse.json(
      { error: 'Failed to delete social content' },
      { status: 500 }
    );
  }
}
