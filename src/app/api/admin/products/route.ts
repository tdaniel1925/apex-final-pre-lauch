// =============================================
// Admin Products API - List & Create
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { requireAdmin } from '@/lib/auth/admin';

// GET /api/admin/products - List all products
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const supabase = createServiceClient();

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        category:product_categories(id, name, slug)
      `)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      name,
      slug,
      category_id,
      description,
      retail_price_cents,
      wholesale_price_cents,
      bv,
      is_subscription,
      subscription_interval,
      is_active,
      is_featured,
    } = body;

    // Validation
    if (!name || !slug || !category_id) {
      return NextResponse.json(
        { error: 'Name, slug, and category are required' },
        { status: 400 }
      );
    }

    if (!retail_price_cents || !wholesale_price_cents || bv === undefined) {
      return NextResponse.json(
        { error: 'Pricing and BV are required' },
        { status: 400 }
      );
    }

    if (retail_price_cents <= wholesale_price_cents) {
      return NextResponse.json(
        { error: 'Retail price must be greater than wholesale price' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A product with this slug already exists' },
        { status: 400 }
      );
    }

    // Create product
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name,
        slug,
        category_id,
        description: description || null,
        retail_price_cents,
        wholesale_price_cents,
        bv,
        is_subscription: is_subscription || false,
        subscription_interval: is_subscription ? subscription_interval : null,
        is_active: is_active !== undefined ? is_active : true,
        is_featured: is_featured || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
