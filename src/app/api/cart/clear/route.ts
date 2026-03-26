// =============================================
// Clear Cart API
// POST /api/cart/clear
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cart_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ success: true });
    }

    const supabase = await createClient();

    // Clear cart items
    const { error } = await supabase
      .from('cart_sessions')
      .update({ items: [] })
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error clearing cart:', error);
      return NextResponse.json(
        { error: 'Failed to clear cart' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
