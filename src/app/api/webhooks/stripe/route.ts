import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/service';
import { sendEmail } from '@/lib/email/resend';
import { generateOrderReceiptHTML, generateOrderReceiptSubject } from '@/lib/email/order-receipt';

// Force dynamic rendering - prevent build-time analysis
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Lazy-load Stripe client to prevent build-time initialization
let _stripe: Stripe | undefined;

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-01-28.clover',
    });
  }
  return _stripe;
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const supabase = createServiceClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

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

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { metadata } = session;

  if (!metadata || !metadata.distributor_id || !metadata.product_id) {
    console.error('Missing metadata in checkout session');
    return;
  }

  try {
    const supabase = createServiceClient();

    // Get distributor details
    const { data: distributor } = await supabase
      .from('distributors')
      .select('email, first_name, last_name')
      .eq('id', metadata.distributor_id)
      .single();

    // Get product details
    const { data: product } = await supabase
      .from('products')
      .select('name, description, is_subscription, subscription_interval')
      .eq('id', metadata.product_id)
      .single();

    // Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        distributor_id: metadata.distributor_id,
        total_cents: session.amount_total || 0,
        total_bv: parseInt(metadata.bv_amount),
        is_personal_purchase: metadata.is_personal_purchase === 'true',
        stripe_payment_intent_id: session.payment_intent as string,
        payment_method: 'card',
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        fulfillment_status: 'fulfilled',
        fulfilled_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error('Failed to create order:', orderError);
      return;
    }

    // Create order item
    const productName = product?.name || session.line_items?.data[0]?.description || 'Product';
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: metadata.product_id,
        quantity: 1,
        unit_price_cents: session.amount_total || 0,
        total_price_cents: session.amount_total || 0,
        bv_amount: parseInt(metadata.bv_amount),
        product_name: productName,
      });

    if (itemError) {
      console.error('Failed to create order item:', itemError);
      return;
    }

    // If subscription, create subscription record
    if (session.mode === 'subscription' && session.subscription) {
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          distributor_id: metadata.distributor_id,
          product_id: metadata.product_id,
          quantity: 1,
          current_price_cents: session.amount_total || 0,
          interval: product?.subscription_interval || 'monthly',
          stripe_subscription_id: session.subscription as string,
          status: 'active',
          started_at: new Date().toISOString(),
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (subError) {
        console.error('Failed to create subscription:', subError);
      }
    }

    console.log('Order created successfully:', order.id);

    // Log order activity to admin activity log
    try {
      await supabase.rpc('log_admin_activity', {
        p_admin_id: metadata.distributor_id, // The distributor who made the purchase
        p_admin_email: distributor?.email || 'system@theapexway.net',
        p_admin_name: distributor ? `${distributor.first_name} ${distributor.last_name}` : 'System',
        p_distributor_id: metadata.distributor_id,
        p_distributor_name: distributor ? `${distributor.first_name} ${distributor.last_name}` : null,
        p_action_type: session.mode === 'subscription' ? 'order_subscription_created' : 'order_purchase_created',
        p_action_description: `Purchased ${productName} for $${((session.amount_total || 0) / 100).toFixed(2)} (${metadata.bv_amount} BV)${session.mode === 'subscription' ? ' - Subscription' : ''}`,
        p_changes: JSON.stringify({
          order_id: order.id,
          order_number: order.order_number,
          product_id: metadata.product_id,
          product_name: productName,
          amount_paid: (session.amount_total || 0) / 100,
          bv_earned: parseInt(metadata.bv_amount),
          payment_method: 'stripe',
          is_subscription: session.mode === 'subscription',
        }),
        p_ip_address: null,
        p_user_agent: null,
      });
    } catch (logError) {
      console.error('Failed to log order activity:', logError);
      // Don't fail the whole webhook if logging fails
    }

    // Send order receipt email via Resend
    if (distributor && product) {
      const emailHTML = generateOrderReceiptHTML({
        distributorName: `${distributor.first_name} ${distributor.last_name}`,
        distributorEmail: distributor.email,
        productName: productName,
        productDescription: product.description || undefined,
        quantityPurchased: 1,
        amountPaid: (session.amount_total || 0) / 100, // Convert cents to dollars
        bvEarned: parseInt(metadata.bv_amount),
        orderNumber: order.order_number,
        orderDate: new Date(order.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        isSubscription: session.mode === 'subscription',
        subscriptionInterval: product.subscription_interval || undefined,
      });

      const emailSubject = generateOrderReceiptSubject(
        session.mode === 'subscription',
        productName
      );

      const emailResult = await sendEmail({
        to: distributor.email,
        subject: emailSubject,
        html: emailHTML,
      });

      if (emailResult.success) {
        console.log('Order receipt email sent:', emailResult.id);
      } else {
        console.error('Failed to send order receipt email:', emailResult.error);
      }
    }
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  // Subscription is already created in handleCheckoutCompleted
  console.log('Subscription created:', subscription.id);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const supabase = createServiceClient();
    const subscriptionData = subscription as any;
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscriptionData.status,
        current_period_start: subscriptionData.current_period_start ? new Date(subscriptionData.current_period_start * 1000).toISOString() : null,
        current_period_end: subscriptionData.current_period_end ? new Date(subscriptionData.current_period_end * 1000).toISOString() : null,
        next_billing_date: subscriptionData.current_period_end ? new Date(subscriptionData.current_period_end * 1000).toISOString() : null,
        cancel_at_period_end: subscriptionData.cancel_at_period_end || false,
        canceled_at: subscriptionData.canceled_at ? new Date(subscriptionData.canceled_at * 1000).toISOString() : null,
      })
      .eq('stripe_subscription_id', subscriptionData.id);

    if (error) {
      console.error('Failed to update subscription:', error);
    }
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        ended_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Failed to delete subscription:', error);
    }
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}
