// =============================================
// Update Slug API
// Allow authenticated users to change their username/slug
// =============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newSlug } = body;

    if (!newSlug) {
      return NextResponse.json(
        { success: false, error: 'New slug is required' },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(newSlug) || newSlug.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only (minimum 3 characters)' },
        { status: 400 }
      );
    }

    // Get current distributor
    const serviceClient = createServiceClient();
    const { data: currentDist, error: getCurrentError } = await serviceClient
      .from('distributors')
      .select('id, slug')
      .eq('auth_user_id', user.id)
      .single();

    if (getCurrentError || !currentDist) {
      return NextResponse.json(
        { success: false, error: 'Distributor not found' },
        { status: 404 }
      );
    }

    // Check if new slug is same as current
    if (currentDist.slug === newSlug) {
      return NextResponse.json(
        { success: false, error: 'This is already your current username' },
        { status: 400 }
      );
    }

    // Check if new slug is available
    const { data: existingSlug, error: checkError } = await serviceClient
      .from('distributors')
      .select('id')
      .eq('slug', newSlug)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking slug availability:', checkError);
      return NextResponse.json(
        { success: false, error: 'Failed to check slug availability' },
        { status: 500 }
      );
    }

    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: 'This username is already taken' },
        { status: 400 }
      );
    }

    // Update slug
    const { error: updateError } = await serviceClient
      .from('distributors')
      .update({ slug: newSlug })
      .eq('id', currentDist.id);

    if (updateError) {
      console.error('Error updating slug:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update username' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Username updated successfully',
      newSlug,
      oldSlug: currentDist.slug,
    });
  } catch (error: any) {
    console.error('Error in update-slug API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
