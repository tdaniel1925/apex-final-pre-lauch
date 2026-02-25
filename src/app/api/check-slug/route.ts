// =============================================
// Check Slug Availability API
// Verify if a username/slug is available
// =============================================

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { available: false, error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug) || slug.length < 3) {
      return NextResponse.json(
        { available: false, error: 'Invalid slug format' },
        { status: 400 }
      );
    }

    // Check if slug exists
    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from('distributors')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('Error checking slug:', error);
      return NextResponse.json(
        { available: false, error: 'Failed to check availability' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      available: !data, // Available if no distributor found with this slug
      slug,
    });
  } catch (error: any) {
    console.error('Error in check-slug API:', error);
    return NextResponse.json(
      { available: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
