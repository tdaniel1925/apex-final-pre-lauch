// =============================================
// Add Item to Cart API
// POST /api/cart/add
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { product_id } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const cookieStore = await cookies();

    // Get or create cart session ID
    let sessionId = cookieStore.get('cart_session')?.value;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      cookieStore.set('cart_session', sessionId, {
        maxAge: 7 * 24 * 60 * 60, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    // Get rep attribution
    const repSlug = cookieStore.get('rep_attribution')?.value || null;

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, slug, retail_price_cents, description')
      .eq('id', product_id)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Calculate BV (using waterfall formula)
    // BV = retail_price × 0.70 × 0.60 × 0.965 × 0.985
    const bv_cents = Math.round(product.retail_price_cents * 0.70 * 0.60 * 0.965 * 0.985);

    // Get existing cart
    const { data: existingCart } = await supabase
      .from('cart_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    let items = existingCart?.items || [];

    // Check if product already in cart
    const existingItemIndex = items.findIndex((item: any) => item.product_id === product_id);

    if (existingItemIndex >= 0) {
      // Increment quantity
      items[existingItemIndex].quantity += 1;
    } else {
      // Add new item
      items.push({
        product_id: product.id,
        product_slug: product.slug,
        product_name: product.name,
        quantity: 1,
        retail_price_cents: product.retail_price_cents,
        bv_cents,
      });
    }

    // Upsert cart session
    const { error: upsertError } = await supabase
      .from('cart_sessions')
      .upsert(
        {
          session_id: sessionId,
          rep_slug: repSlug,
          items,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: 'session_id' }
      );

    if (upsertError) {
      console.error('Error upserting cart:', upsertError);
      return NextResponse.json(
        { error: 'Failed to update cart' },
        { status: 500 }
      );
    }

    // Calculate cart count
    const cartCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

    return NextResponse.json({
      success: true,
      cart_count: cartCount,
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
