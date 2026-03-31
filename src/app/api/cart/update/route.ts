// =============================================
// Update Cart Item Quantity API
// POST /api/cart/update
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { product_id, quantity } = await request.json();

    if (!product_id || typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        { error: 'Valid product_id and quantity are required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cart_session')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No cart session found' },
        { status: 404 }
      );
    }

    const supabase = await createClient();

    // Get existing cart
    const { data: cart, error: cartError } = await supabase
      .from('cart_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (cartError || !cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    let items = cart.items || [];

    if (quantity === 0) {
      // Remove item
      items = items.filter((item: any) => item.product_id !== product_id);
    } else {
      // Update quantity
      const itemIndex = items.findIndex((item: any) => item.product_id === product_id);

      if (itemIndex >= 0) {
        items[itemIndex].quantity = quantity;
      } else {
        return NextResponse.json(
          { error: 'Product not in cart' },
          { status: 404 }
        );
      }
    }

    // Update cart
    const { error: updateError } = await supabase
      .from('cart_sessions')
      .update({
        items,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('session_id', sessionId);

    if (updateError) {
      console.error('Error updating cart:', updateError);
      return NextResponse.json(
        { error: 'Failed to update cart' },
        { status: 500 }
      );
    }

    const cartCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

    return NextResponse.json({
      success: true,
      cart_count: cartCount,
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
