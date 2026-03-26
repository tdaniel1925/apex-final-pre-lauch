// =============================================
// Retail Checkout API
// POST /api/checkout/retail
// Creates Stripe Checkout Session for retail customers
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cart_session')?.value;
    const repSlug = cookieStore.get('rep_attribution')?.value;

    // Require rep attribution for retail purchases
    if (!repSlug) {
      return NextResponse.json(
        { error: 'Rep attribution required. Please access this page through a representative link.' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Cart session not found' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get cart
    const { data: cart, error: cartError } = await supabase
      .from('cart_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (cartError || !cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Get rep info
    const { data: rep, error: repError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email')
      .eq('slug', repSlug)
      .single();

    if (repError || !rep) {
      return NextResponse.json(
        { error: 'Representative not found' },
        { status: 404 }
      );
    }

    // Create Stripe line items
    const lineItems = cart.items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product_name,
        },
        unit_amount: item.retail_price_cents,
        recurring: {
          interval: 'month',
        },
      },
      quantity: item.quantity,
    }));

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_URL}/booking?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/${repSlug}/services`,
      metadata: {
        cart_session_id: sessionId,
        rep_distributor_id: rep.id,
        rep_slug: repSlug,
        sale_type: 'retail',
      },
      customer_email: undefined, // Let customer enter email
      allow_promotion_codes: false,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
