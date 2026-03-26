// =============================================
// Seed Products API
// One-time endpoint to insert AgentPulse products
// =============================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    // Use service role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Ensure category exists
    const { data: category, error: categoryError } = await supabase
      .from('product_categories')
      .upsert({
        name: 'AgentPulse Suite',
        slug: 'agentpulse',
        description: 'AI-powered CRM and automation tools for insurance agents',
        display_order: 1,
      }, {
        onConflict: 'slug',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (categoryError && categoryError.code !== '23505') {
      console.error('Category error:', categoryError);
      return NextResponse.json({ error: 'Failed to create category', details: categoryError }, { status: 500 });
    }

    // Get category ID
    const { data: cat } = await supabase
      .from('product_categories')
      .select('id')
      .eq('slug', 'agentpulse')
      .single();

    if (!cat) {
      return NextResponse.json({ error: 'Category not found' }, { status: 500 });
    }

    const categoryId = cat.id;

    // Delete existing products
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert all products
    const products = [
      {
        name: 'PulseMarket',
        slug: 'pulsemarket',
        description: 'Marketing automation and lead generation for insurance agents',
        category_id: categoryId,
        retail_price_cents: 7900,
        wholesale_price_cents: 5900,
        bv: 59,
        is_subscription: true,
        subscription_interval: 'monthly',
        is_digital: true,
        is_active: true,
        display_order: 1,
      },
      {
        name: 'PulseFlow',
        slug: 'pulseflow',
        description: 'Workflow automation and client communication platform',
        category_id: categoryId,
        retail_price_cents: 14900,
        wholesale_price_cents: 12900,
        bv: 129,
        is_subscription: true,
        subscription_interval: 'monthly',
        is_digital: true,
        is_active: true,
        display_order: 2,
      },
      {
        name: 'PulseDrive',
        slug: 'pulsedrive',
        description: 'Sales pipeline and opportunity management',
        category_id: categoryId,
        retail_price_cents: 29900,
        wholesale_price_cents: 25900,
        bv: 259,
        is_subscription: true,
        subscription_interval: 'monthly',
        is_digital: true,
        is_active: true,
        display_order: 3,
      },
      {
        name: 'PulseCommand',
        slug: 'pulsecommand',
        description: 'Enterprise-grade agency management and analytics',
        category_id: categoryId,
        retail_price_cents: 49900,
        wholesale_price_cents: 42900,
        bv: 429,
        is_subscription: true,
        subscription_interval: 'monthly',
        is_digital: true,
        is_active: true,
        display_order: 4,
      },
      {
        name: 'SmartLock',
        slug: 'smartlock',
        description: 'Data security and compliance monitoring',
        category_id: categoryId,
        retail_price_cents: 9900,
        wholesale_price_cents: 7900,
        bv: 79,
        is_subscription: true,
        subscription_interval: 'monthly',
        is_digital: true,
        is_active: true,
        display_order: 5,
      },
      {
        name: 'BusinessCenter',
        slug: 'businesscenter',
        description: 'Replicated website and back office tools',
        category_id: categoryId,
        retail_price_cents: 4000,
        wholesale_price_cents: 3000,
        bv: 30,
        is_subscription: true,
        subscription_interval: 'monthly',
        is_digital: true,
        is_active: true,
        display_order: 6,
      },
    ];

    const { data: insertedProducts, error: productsError } = await supabase
      .from('products')
      .insert(products)
      .select();

    if (productsError) {
      console.error('Products error:', productsError);
      return NextResponse.json({ error: 'Failed to insert products', details: productsError }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Products seeded successfully',
      products: insertedProducts,
    });
  } catch (error) {
    console.error('Seed products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
