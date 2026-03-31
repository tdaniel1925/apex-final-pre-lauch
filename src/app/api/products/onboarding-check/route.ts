// =============================================
// Product Onboarding Check API
// Check if a product requires onboarding
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  const serviceClient = createServiceClient();

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Product slug is required' },
        { status: 400 }
      );
    }

    // Fetch product onboarding settings
    const { data: product, error } = await serviceClient
      .from('products')
      .select('slug, name, requires_onboarding, onboarding_duration_minutes')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !product) {
      return NextResponse.json(
        {
          requires_onboarding: false,
          product: null
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      requires_onboarding: product.requires_onboarding || false,
      product: {
        slug: product.slug,
        name: product.name,
        onboarding_duration_minutes: product.onboarding_duration_minutes || 30,
      },
    });
  } catch (error: any) {
    console.error('Onboarding check error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
