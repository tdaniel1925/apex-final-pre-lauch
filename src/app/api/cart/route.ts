// =============================================
// Get Cart API
// GET /api/cart
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cart_session')?.value;

    if (!sessionId) {
      return NextResponse.json({
        items: [],
        total_cents: 0,
        rep_slug: null,
        cart_count: 0,
      });
    }

    const supabase = await createClient();

    // Get cart session
    const { data: cart, error } = await supabase
      .from('cart_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error || !cart) {
      return NextResponse.json({
        items: [],
        total_cents: 0,
        rep_slug: null,
        cart_count: 0,
      });
    }

    // Calculate total
    const items = cart.items || [];
    const total_cents = items.reduce(
      (sum: number, item: any) => sum + item.retail_price_cents * item.quantity,
      0
    );

    const cart_count = items.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0
    );

    return NextResponse.json({
      items,
      total_cents,
      rep_slug: cart.rep_slug,
      cart_count,
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
