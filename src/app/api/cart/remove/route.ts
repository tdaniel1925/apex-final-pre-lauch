// =============================================
// Remove Item from Cart API
// POST /api/cart/remove
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

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cart_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ success: true, cart_count: 0 });
    }

    const supabase = await createClient();

    // Get existing cart
    const { data: existingCart } = await supabase
      .from('cart_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (!existingCart) {
      return NextResponse.json({ success: true, cart_count: 0 });
    }

    // Remove item
    const items = (existingCart.items || []).filter(
      (item: any) => item.product_id !== product_id
    );

    // Update cart
    const { error: updateError } = await supabase
      .from('cart_sessions')
      .update({ items })
      .eq('session_id', sessionId);

    if (updateError) {
      console.error('Error updating cart:', updateError);
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
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
