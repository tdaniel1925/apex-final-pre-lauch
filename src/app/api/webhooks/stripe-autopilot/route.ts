import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { syncStripeSubscription as syncToDatabase } from '@/lib/db/autopilot-subscription-queries';
import { AutopilotTier, AutopilotStatus } from '@/lib/stripe/autopilot-products';

// Force dynamic rendering - prevent build-time analysis
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Lazy-load Stripe client to prevent build-time initialization
let _stripe: Stripe | undefined;

function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
    });
  }
  return _stripe;
}

/**
 * POST /api/webhooks/stripe-autopilot
 * Handle Stripe webhook events for Autopilot subscriptions
 *
 * Handles:
 * - checkout.session.completed
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 */
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_AUTOPILOT_WEBHOOK_SECRET!;

  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_AUTOPILOT_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('[Webhook] Signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`[Webhook] Received event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed
 * Called when a customer completes the Stripe Checkout flow
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const { metadata } = session;

    if (!metadata || !metadata.distributor_id || !metadata.autopilot_tier) {
      console.error('[Webhook] Missing metadata in checkout session');
      return;
    }

    // Ensure this is an autopilot subscription
    if (metadata.product_type !== 'autopilot_subscription') {
      console.log('[Webhook] Not an autopilot subscription, skipping');
      return;
    }

    const distributorId = metadata.distributor_id;
    const tier = metadata.autopilot_tier as AutopilotTier;

    console.log(`[Webhook] Checkout completed for distributor ${distributorId}, tier: ${tier}`);

    // If subscription mode, the subscription will be created separately
    // We just log this event
    if (session.mode === 'subscription' && session.subscription) {
      console.log(`[Webhook] Subscription ${session.subscription} created for ${distributorId}`);
    }
  } catch (error) {
    console.error('[Webhook] Error handling checkout completion:', error);
  }
}

/**
 * Handle customer.subscription.created
 * Called when a new subscription is created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const { metadata } = subscription;

    if (!metadata || !metadata.distributor_id || !metadata.autopilot_tier) {
      console.error('[Webhook] Missing metadata in subscription');
      return;
    }

    const distributorId = metadata.distributor_id;
    const tier = metadata.autopilot_tier as AutopilotTier;

    console.log(`[Webhook] Creating subscription for distributor ${distributorId}, tier: ${tier}`);

    // Map Stripe status to our status
    const status = mapStripeStatus(subscription.status);

    // Sync to database
    await syncToDatabase(distributorId, {
      tier,
      status,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
    });

    console.log(`[Webhook] Subscription created successfully for ${distributorId}`);
  } catch (error) {
    console.error('[Webhook] Error handling subscription creation:', error);
  }
}

/**
 * Handle customer.subscription.updated
 * Called when a subscription is updated (including cancellation at period end)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const { metadata } = subscription;

    if (!metadata || !metadata.distributor_id || !metadata.autopilot_tier) {
      console.error('[Webhook] Missing metadata in subscription update');
      return;
    }

    const distributorId = metadata.distributor_id;
    const tier = metadata.autopilot_tier as AutopilotTier;
    const status = mapStripeStatus(subscription.status);

    console.log(
      `[Webhook] Updating subscription for distributor ${distributorId}, status: ${status}`
    );

    // Sync to database
    await syncToDatabase(distributorId, {
      tier,
      status,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
    });

    console.log(`[Webhook] Subscription updated successfully for ${distributorId}`);
  } catch (error) {
    console.error('[Webhook] Error handling subscription update:', error);
  }
}

/**
 * Handle customer.subscription.deleted
 * Called when a subscription is canceled and has ended
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const { metadata } = subscription;

    if (!metadata || !metadata.distributor_id) {
      console.error('[Webhook] Missing metadata in subscription deletion');
      return;
    }

    const distributorId = metadata.distributor_id;

    console.log(`[Webhook] Subscription deleted for distributor ${distributorId}`);

    // Downgrade to free tier
    await syncToDatabase(distributorId, {
      tier: 'free',
      status: 'canceled',
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      trial_start: null,
      trial_end: null,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: false,
    });

    console.log(`[Webhook] Subscription deleted, downgraded to free tier for ${distributorId}`);
  } catch (error) {
    console.error('[Webhook] Error handling subscription deletion:', error);
  }
}

/**
 * Handle invoice.payment_succeeded
 * Called when a subscription payment succeeds
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = (invoice as any).subscription as string;

    if (!subscriptionId) {
      console.log('[Webhook] No subscription ID in invoice');
      return;
    }

    console.log(`[Webhook] Payment succeeded for subscription ${subscriptionId}`);

    // Subscription will be updated separately by subscription.updated event
    // We just log this for record-keeping
  } catch (error) {
    console.error('[Webhook] Error handling payment success:', error);
  }
}

/**
 * Handle invoice.payment_failed
 * Called when a subscription payment fails
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = (invoice as any).subscription as string;

    if (!subscriptionId) {
      console.log('[Webhook] No subscription ID in invoice');
      return;
    }

    console.log(`[Webhook] Payment failed for subscription ${subscriptionId}`);

    // Get subscription to find distributor
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (subscription.metadata && subscription.metadata.distributor_id) {
      const distributorId = subscription.metadata.distributor_id;

      // Update status to past_due
      await syncToDatabase(distributorId, {
        tier: subscription.metadata.autopilot_tier as AutopilotTier,
        status: 'past_due',
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        trial_start: subscription.trial_start
          ? new Date(subscription.trial_start * 1000).toISOString()
          : null,
        trial_end: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
        current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end || false,
      });

      console.log(`[Webhook] Subscription marked as past_due for ${distributorId}`);
    }
  } catch (error) {
    console.error('[Webhook] Error handling payment failure:', error);
  }
}

/**
 * Map Stripe subscription status to our status enum
 */
function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): AutopilotStatus {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
      return 'canceled';
    case 'paused':
      return 'paused';
    default:
      return 'active';
  }
}
