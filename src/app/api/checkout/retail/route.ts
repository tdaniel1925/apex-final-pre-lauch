// =============================================
// Retail Checkout API
// POST /api/checkout/retail
// Creates Stripe Checkout Session for retail customers
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover',
  });
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
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

    // Fetch product details for subscription settings
    const productSlugs = cart.items.map((item: any) => item.product_slug);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('slug, is_subscription, subscription_interval, subscription_interval_count')
      .in('slug', productSlugs);

    if (productsError) {
      return NextResponse.json(
        { error: 'Failed to fetch product details' },
        { status: 500 }
      );
    }

    // Map products by slug for quick lookup
    const productMap = new Map(
      (products || []).map(p => [p.slug, p])
    );

    // Create Stripe line items with proper subscription settings
    const lineItems = cart.items.map((item: any) => {
      const product = productMap.get(item.product_slug);

      const lineItem: any = {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product_name,
          },
          unit_amount: item.retail_price_cents,
        },
        quantity: item.quantity,
      };

      // Add recurring if product is a subscription
      if (product?.is_subscription) {
        lineItem.price_data.recurring = {
          interval: product.subscription_interval || 'month',
          interval_count: product.subscription_interval_count || 1,
        };
      }

      return lineItem;
    });

    // Determine checkout mode: 'subscription' if ALL items are subscriptions, otherwise 'payment'
    const allSubscriptions = cart.items.every((item: any) => {
      const product = productMap.get(item.product_slug);
      return product?.is_subscription === true;
    });

    const hasAnySubscription = cart.items.some((item: any) => {
      const product = productMap.get(item.product_slug);
      return product?.is_subscription === true;
    });

    // Stripe doesn't allow mixing subscriptions with one-time payments
    if (hasAnySubscription && !allSubscriptions) {
      return NextResponse.json(
        { error: 'Cannot mix subscription and one-time products in the same purchase. Please checkout separately.' },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    // Add product parameter if single item (for onboarding check)
    const productParam = cart.items.length === 1 ? `&product=${cart.items[0].product_slug}` : '';

    const session = await stripe.checkout.sessions.create({
      mode: allSubscriptions ? 'subscription' : 'payment',
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/checkout/redirect?session_id={CHECKOUT_SESSION_ID}${productParam}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${repSlug}/services`,
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
