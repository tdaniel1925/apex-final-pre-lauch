import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getReferrerCookie } from '@/lib/referral-tracking';

// Lazy-load Stripe client to avoid build-time initialization
let stripe: Stripe | null = null;
function getStripeClient(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia' as any,
    });
  }
  return stripe;
}

const PRICE_IDS: Record<string, { retail: string; member: string }> = {
  pulsemarket: {
    retail: process.env.STRIPE_PULSEMARKET_RETAIL_PRICE_ID!,
    member: process.env.STRIPE_PULSEMARKET_MEMBER_PRICE_ID!,
  },
  pulseflow: {
    retail: process.env.STRIPE_PULSEFLOW_RETAIL_PRICE_ID!,
    member: process.env.STRIPE_PULSEFLOW_MEMBER_PRICE_ID!,
  },
  pulsedrive: {
    retail: process.env.STRIPE_PULSEDRIVE_RETAIL_PRICE_ID!,
    member: process.env.STRIPE_PULSEDRIVE_MEMBER_PRICE_ID!,
  },
  pulsecommand: {
    retail: process.env.STRIPE_PULSECOMMAND_RETAIL_PRICE_ID!,
    member: process.env.STRIPE_PULSECOMMAND_MEMBER_PRICE_ID!,
  },
};

interface CheckoutRequestBody {
  productSlug: 'pulsemarket' | 'pulseflow' | 'pulsedrive' | 'pulsecommand';
  priceType?: 'retail' | 'member'; // Default to retail
  promotionCode?: string; // Optional promotion code for member pricing
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequestBody = await request.json();
    const { productSlug, priceType = 'retail', promotionCode } = body;

    // Validate product slug
    if (!productSlug || !PRICE_IDS[productSlug]) {
      return NextResponse.json(
        { error: 'Invalid product slug' },
        { status: 400 }
      );
    }

    // Get the appropriate price ID
    const priceId = PRICE_IDS[productSlug][priceType];

    // Get referrer from cookie
    const referrerSlug = await getReferrerCookie();

    // Get the site URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050';

    // Create checkout session metadata
    const metadata: Stripe.MetadataParam = {
      product_slug: productSlug,
      price_type: priceType,
    };

    // Add referrer slug if exists
    if (referrerSlug) {
      metadata.referrer_slug = referrerSlug;
    }

    // Create Stripe checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${siteUrl}/products/success?session_id={CHECKOUT_SESSION_ID}&product=${productSlug}`,
      cancel_url: `${siteUrl}/products?canceled=true`,
      metadata,
      subscription_data: {
        metadata,
      },
      allow_promotion_codes: true, // Allow users to enter promotion codes
    };

    // If a promotion code was provided, add it (for member pricing)
    const stripeClient = getStripeClient();

    if (promotionCode) {
      try {
        // Find the promotion code
        const promoCodes = await stripeClient.promotionCodes.list({
          code: promotionCode,
          active: true,
          limit: 1,
        });

        if (promoCodes.data.length > 0) {
          sessionParams.discounts = [
            {
              promotion_code: promoCodes.data[0].id,
            },
          ];
        }
      } catch (error) {
        console.error('Error applying promotion code:', error);
        // Continue without the promo code if it fails
      }
    }

    const session = await stripeClient.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
