// =============================================
// Admin Products API
// Create and manage service products
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  const serviceClient = createServiceClient();

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.slug || !body.category_id) {
      return NextResponse.json(
        { error: 'Name, slug, and category are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const { data: existing } = await serviceClient
      .from('products')
      .select('id')
      .eq('slug', body.slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A product with this slug already exists' },
        { status: 400 }
      );
    }

    // Insert product
    const { data: product, error } = await serviceClient
      .from('products')
      .insert({
        category_id: body.category_id,
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        long_description: body.long_description || null,

        // Pricing (already in cents from form)
        retail_price_cents: body.retail_price_cents,
        wholesale_price_cents: body.wholesale_price_cents,
        bv: body.bv || 0,

        // Subscription
        is_subscription: body.is_subscription ?? false,
        subscription_interval: body.is_subscription ? body.subscription_interval : null,
        subscription_interval_count: 1,

        // Service fields
        service_type: body.service_type || null,
        access_url: body.access_url || null,
        setup_instructions: body.setup_instructions || null,
        trial_days: body.trial_days || 0,

        // Onboarding
        requires_onboarding: body.requires_onboarding ?? false,
        onboarding_duration_minutes: body.onboarding_duration_minutes || 30,
        onboarding_instructions: body.onboarding_instructions || null,

        // Product type
        is_digital: body.is_digital ?? true,
        stock_status: body.stock_status || 'in_stock',

        // Media
        image_url: body.image_url || null,

        // Status
        is_active: body.is_active ?? true,
        is_featured: body.is_featured ?? false,
        display_order: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
