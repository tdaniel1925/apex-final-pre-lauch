import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { getReferrerCookie } from '@/lib/referral-tracking';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Lazy-load Stripe client to avoid build-time initialization
let stripe: Stripe | null = null;
function getStripeClient(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
    });
  }
  return stripe;
}

interface CheckoutRequestBody {
  product_id: string; // UUID from database products table
}

/**
 * POST /api/stripe/create-product-checkout
 * Creates Stripe checkout session for database products (Business Center, etc.)
 *
 * @body {product_id} - Product UUID from products table
 * @returns {sessionId, url} - Stripe checkout session details
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: CheckoutRequestBody = await request.json();
    const { product_id } = body;

    // Validate product_id
    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Get distributor info
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id, email, first_name, last_name')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      return NextResponse.json(
        { error: 'Distributor profile not found' },
        { status: 404 }
      );
    }

    // Get product details from database
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, slug, wholesale_price_cents, bv, stripe_price_id, is_subscription, subscription_interval')
      .eq('id', product_id)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found or not available' },
        { status: 404 }
      );
    }

    // Validate Stripe price ID exists
    if (!product.stripe_price_id) {
      return NextResponse.json(
        { error: 'Product does not have Stripe price configured' },
        { status: 400 }
      );
    }

    // Get referrer from cookie
    const referrerSlug = await getReferrerCookie();

    // Get the site URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050';

    // Create checkout session metadata
    const metadata: Stripe.MetadataParam = {
      distributor_id: distributor.id,
      product_id: product.id,
      product_slug: product.slug,
      bv_amount: product.bv.toString(),
      is_personal_purchase: 'true', // Distributor buying for themselves
    };

    // Add referrer slug if exists
    if (referrerSlug) {
      metadata.referrer_slug = referrerSlug;
    }

    // Determine success URL based on product
    let successUrl = `${siteUrl}/dashboard/store?success=true&session_id={CHECKOUT_SESSION_ID}`;
    if (product.slug === 'businesscenter') {
      successUrl = `${siteUrl}/dashboard/business-center/success?session_id={CHECKOUT_SESSION_ID}`;
    }

    // Create Stripe checkout session
    const stripeClient = getStripeClient();
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: product.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: product.is_subscription ? 'subscription' : 'payment',
      success_url: successUrl,
      cancel_url: `${siteUrl}/dashboard/store?canceled=true`,
      customer_email: distributor.email,
      metadata,
      subscription_data: product.is_subscription ? {
        metadata,
      } : undefined,
      allow_promotion_codes: false, // Database products use fixed member pricing
    };

    const session = await stripeClient.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Error creating product checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
