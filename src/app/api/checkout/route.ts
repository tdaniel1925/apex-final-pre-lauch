import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering - prevent build-time analysis
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { productId, distributorId } = await request.json();

    if (!productId || !distributorId) {
      return NextResponse.json(
        { error: 'Product ID and Distributor ID are required' },
        { status: 400 }
      );
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get distributor details
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('email, first_name, last_name')
      .eq('id', distributorId)
      .single();

    if (distError || !distributor) {
      return NextResponse.json(
        { error: 'Distributor not found' },
        { status: 404 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description || undefined,
              images: product.image_url ? [product.image_url] : undefined,
            },
            unit_amount: product.wholesale_price_cents, // Distributor pays wholesale price
            ...(product.is_subscription && {
              recurring: {
                interval: product.subscription_interval || 'monthly',
                interval_count: product.subscription_interval_count || 1,
              },
            }),
          },
          quantity: 1,
        },
      ],
      mode: product.is_subscription ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/products?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/products?canceled=true`,
      customer_email: distributor.email,
      metadata: {
        distributor_id: distributorId,
        product_id: productId,
        bv_amount: product.bv.toString(),
        is_personal_purchase: 'true',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
