// Supabase Edge Function: stripe-webhook
// Purpose: Handle all Stripe webhook events
// Events: payment_intent.succeeded, customer.subscription.created,
//         customer.subscription.deleted, invoice.payment_failed,
//         invoice.paid, charge.dispute.created
// Author: Claude Code

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature', { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing event: ${event.type}`);

    // Route to appropriate handler
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(supabase, event.data.object as Stripe.PaymentIntent);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(supabase, event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(supabase, event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(supabase, event.data.object as Stripe.Invoice);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(supabase, event.data.object as Stripe.Invoice);
        break;

      case 'charge.dispute.created':
        await handleDisputeCreated(supabase, event.data.object as Stripe.Dispute);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(supabase, event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// =====================================================
// HANDLER: payment_intent.succeeded
// =====================================================
async function handlePaymentSuccess(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment succeeded: ${paymentIntent.id}`);

  // Check for duplicate (idempotency)
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (existing) {
    console.log(`Order already exists for payment_intent: ${paymentIntent.id}`);
    return;
  }

  // Extract metadata
  const rep_id = paymentIntent.metadata?.rep_id;
  const product_id = paymentIntent.metadata?.product_id;
  const order_type = paymentIntent.metadata?.order_type || 'member';
  const bv_amount = parseFloat(paymentIntent.metadata?.bv_amount || '0');

  if (!rep_id || !product_id) {
    console.error('Missing rep_id or product_id in payment_intent metadata');
    return;
  }

  // Check if Business Center purchase
  const isBusinessCenter = order_type === 'business_center';

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      rep_id,
      product_id,
      order_type,
      gross_amount_cents: paymentIntent.amount,
      stripe_payment_intent_id: paymentIntent.id,
      status: 'complete',
      bv_credited: false,
      bv_amount,
      promotion_fund_credited: false,
      promotion_fund_credit_amount: isBusinessCenter ? 5.00 : 0,
    })
    .select()
    .single();

  if (orderError) {
    console.error('Failed to insert order:', orderError);
    return;
  }

  console.log(`Order created: ${order.id}`);

  // If Business Center: credit promotion fund
  if (isBusinessCenter) {
    await creditPromotionFund(supabase, order.id, rep_id, 5.00);
  }

  // Send notification to rep
  await supabase.from('notifications').insert({
    user_id: rep_id,
    type: 'order_confirmed',
    title: 'Order Confirmed',
    message: `Your order for $${(paymentIntent.amount / 100).toFixed(2)} has been confirmed.`,
    read: false,
  });

  console.log(`Payment success handling complete for: ${paymentIntent.id}`);
}

// =====================================================
// HANDLER: customer.subscription.created
// =====================================================
async function handleSubscriptionCreated(supabase: any, subscription: Stripe.Subscription) {
  console.log(`Subscription created: ${subscription.id}`);

  // Update order with subscription_id
  await supabase
    .from('orders')
    .update({ stripe_subscription_id: subscription.id })
    .eq('stripe_payment_intent_id', subscription.latest_invoice);
}

// =====================================================
// HANDLER: customer.subscription.deleted (FIX 7)
// =====================================================
async function handleSubscriptionCancelled(supabase: any, subscription: Stripe.Subscription) {
  console.log(`Subscription cancelled: ${subscription.id}`);

  // Find order by subscription_id
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!order) {
    console.error(`No order found for subscription: ${subscription.id}`);
    return;
  }

  // Update order status
  await supabase
    .from('orders')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', order.id);

  // Check if within 60-day CAB clawback window
  const orderDate = new Date(order.created_at);
  const cancelDate = new Date();
  const daysSinceOrder = Math.floor((cancelDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceOrder <= 60) {
    console.log(`Order within 60-day window - queueing CAB clawback`);

    const clawbackEligibleUntil = new Date(orderDate);
    clawbackEligibleUntil.setDate(clawbackEligibleUntil.getDate() + 60);

    await supabase.from('cab_clawback_queue').insert({
      rep_id: order.rep_id,
      customer_id: order.customer_id,
      order_id: order.id,
      cab_amount: 50.00, // Standard CAB amount
      cancel_date: cancelDate.toISOString(),
      clawback_eligible_until: clawbackEligibleUntil.toISOString(),
      status: 'pending',
    });
  }

  // Update customer status
  if (order.customer_id) {
    await supabase
      .from('customers')
      .update({ status: 'cancelled' })
      .eq('id', order.customer_id);
  }

  // Send notification to rep
  await supabase.from('notifications').insert({
    user_id: order.rep_id,
    type: 'customer_cancelled',
    title: 'Customer Cancelled Subscription',
    message: 'One of your customers has cancelled their subscription.',
    read: false,
  });

  console.log(`Subscription cancellation handling complete for: ${subscription.id}`);
}

// =====================================================
// HANDLER: invoice.payment_failed (FIX 8)
// =====================================================
async function handleInvoicePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  console.log(`Invoice payment failed: ${invoice.id}`);

  // Find subscription
  if (!invoice.subscription) return;

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();

  if (!order) return;

  // Record failed renewal
  await supabase.from('subscription_renewals').insert({
    rep_id: order.rep_id,
    customer_id: order.customer_id,
    product_id: order.product_id,
    renewal_date: new Date().toISOString(),
    status: 'failed',
    stripe_invoice_id: invoice.id,
  });
}

// =====================================================
// HANDLER: invoice.paid (FIX 8 - REVENUE PROTECTION)
// =====================================================
async function handleInvoicePaid(supabase: any, invoice: Stripe.Invoice) {
  console.log(`Invoice paid: ${invoice.id}`);

  // Skip if not a subscription renewal
  if (!invoice.subscription) {
    console.log('Not a subscription invoice - skipping');
    return;
  }

  // Check for duplicate processing (idempotency)
  const { data: existingRenewal } = await supabase
    .from('subscription_renewals')
    .select('id')
    .eq('stripe_invoice_id', invoice.id)
    .single();

  if (existingRenewal) {
    console.log(`Renewal already processed for invoice: ${invoice.id}`);
    return;
  }

  // Find original order by subscription_id
  const { data: originalOrder } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_subscription_id', invoice.subscription)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (!originalOrder) {
    console.error(`No original order found for subscription: ${invoice.subscription}`);
    return;
  }

  console.log(`Processing renewal for subscription: ${invoice.subscription}`);

  // CRITICAL FIX: Create new order record for renewal
  const { data: renewalOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      rep_id: originalOrder.rep_id,
      customer_id: originalOrder.customer_id,
      product_id: originalOrder.product_id,
      order_type: originalOrder.order_type,
      gross_amount_cents: invoice.amount_paid,
      stripe_subscription_id: invoice.subscription,
      stripe_payment_intent_id: invoice.payment_intent,
      status: 'complete',
      bv_credited: false,
      bv_amount: originalOrder.bv_amount, // Same BV as original
      promotion_fund_credited: false,
      promotion_fund_credit_amount: originalOrder.order_type === 'business_center' ? 5.00 : 0,
    })
    .select()
    .single();

  if (orderError) {
    console.error('Failed to create renewal order:', orderError);
    // Still record renewal even if order creation fails
  } else {
    console.log(`Renewal order created: ${renewalOrder.id}`);

    // If Business Center: credit promotion fund
    if (originalOrder.order_type === 'business_center') {
      await creditPromotionFund(supabase, renewalOrder.id, originalOrder.rep_id, 5.00);
    }

    // Send notification to rep
    await supabase.from('notifications').insert({
      user_id: originalOrder.rep_id,
      type: 'subscription_renewed',
      title: 'Subscription Renewed',
      message: `A customer subscription has renewed for $${(invoice.amount_paid / 100).toFixed(2)}. Commission credited.`,
      read: false,
    });
  }

  // Record successful renewal in tracking table
  await supabase.from('subscription_renewals').insert({
    rep_id: originalOrder.rep_id,
    customer_id: originalOrder.customer_id,
    product_id: originalOrder.product_id,
    renewal_date: new Date().toISOString(),
    status: 'renewed',
    stripe_invoice_id: invoice.id,
  });

  console.log(`Renewal processing complete for invoice: ${invoice.id}`);
}

// =====================================================
// HANDLER: charge.dispute.created
// =====================================================
async function handleDisputeCreated(supabase: any, dispute: Stripe.Dispute) {
  console.log(`Dispute created: ${dispute.id}`);

  // Find order by charge_id
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_payment_intent_id', dispute.payment_intent)
    .single();

  if (!order) {
    console.error(`No order found for payment_intent: ${dispute.payment_intent}`);
    return;
  }

  // Update order status
  await supabase
    .from('orders')
    .update({ status: 'chargeback', updated_at: new Date().toISOString() })
    .eq('id', order.id);

  // Alert admin via notifications
  const { data: admins } = await supabase
    .from('distributors')
    .select('id')
    .eq('role', 'admin');

  if (admins && admins.length > 0) {
    for (const admin of admins) {
      await supabase.from('notifications').insert({
        user_id: admin.id,
        type: 'system',
        title: 'Chargeback Alert',
        message: `Chargeback filed for order ${order.id}. Amount: $${(dispute.amount / 100).toFixed(2)}`,
        read: false,
      });
    }
  }

  console.log(`Dispute handling complete for: ${dispute.id}`);
}

// =====================================================
// HANDLER: charge.refunded (PHASE 2.3 - REVENUE PROTECTION)
// =====================================================
async function handleChargeRefunded(supabase: any, charge: Stripe.Charge) {
  console.log(`Charge refunded: ${charge.id}`);

  // Find order by payment_intent_id
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_payment_intent_id', charge.payment_intent)
    .single();

  if (!order) {
    console.error(`No order found for payment_intent: ${charge.payment_intent}`);
    return;
  }

  // Update order status to refunded
  await supabase
    .from('orders')
    .update({
      status: 'refunded',
      updated_at: new Date().toISOString()
    })
    .eq('id', order.id);

  console.log(`Order ${order.id} marked as refunded`);

  // CRITICAL: Deduct BV from org_bv_cache
  // This prevents inflated BV from refunded orders
  if (order.bv_amount > 0) {
    const { data: currentBV } = await supabase
      .from('org_bv_cache')
      .select('personal_bv, team_bv, org_bv')
      .eq('rep_id', order.rep_id)
      .single();

    if (currentBV) {
      await supabase
        .from('org_bv_cache')
        .update({
          personal_bv: Math.max(0, currentBV.personal_bv - order.bv_amount),
          org_bv: Math.max(0, currentBV.org_bv - order.bv_amount),
          last_calculated_at: new Date().toISOString(),
        })
        .eq('rep_id', order.rep_id);

      console.log(`BV deducted: ${order.bv_amount} from rep ${order.rep_id}`);
    }
  }

  // TODO: Create negative commission records to claw back commissions
  // This requires commission_run_id from the order, which we'll add in Phase 3
  // For now, we log the refund for manual processing
  await supabase.from('audit_log').insert({
    action: 'order_refunded_needs_clawback',
    actor_type: 'system',
    actor_id: null,
    table_name: 'orders',
    record_id: order.id,
    details: {
      order_id: order.id,
      rep_id: order.rep_id,
      amount: charge.amount_refunded,
      bv_amount: order.bv_amount,
      refund_reason: charge.refund?.reason || 'unknown',
    },
    timestamp: new Date().toISOString(),
  });

  // Notify rep about refund
  await supabase.from('notifications').insert({
    user_id: order.rep_id,
    type: 'order_refunded',
    title: 'Order Refunded',
    message: `An order for $${(charge.amount_refunded / 100).toFixed(2)} has been refunded. BV has been deducted.`,
    read: false,
  });

  // Notify admin about refund
  const { data: admins } = await supabase
    .from('distributors')
    .select('id')
    .eq('role', 'admin');

  if (admins && admins.length > 0) {
    for (const admin of admins) {
      await supabase.from('notifications').insert({
        user_id: admin.id,
        type: 'system',
        title: 'Refund Processed',
        message: `Order ${order.id} refunded: $${(charge.amount_refunded / 100).toFixed(2)}. Commission clawback may be required.`,
        read: false,
      });
    }
  }

  console.log(`Refund handling complete for charge: ${charge.id}`);
}

// =====================================================
// HELPER: Credit Promotion Fund (FIX 15)
// =====================================================
async function creditPromotionFund(
  supabase: any,
  orderId: string,
  repId: string,
  amount: number
) {
  try {
    // Check if bonus is enabled
    const { data: config } = await supabase
      .from('saas_comp_engine_config')
      .select('value')
      .eq('key', 'bonus.promotion_fund.enabled')
      .single();

    if (!config || !config.value?.enabled) {
      console.log('Promotion fund bonus not enabled - skipping credit');
      return;
    }

    // Get current balance
    const { data: balanceData } = await supabase.rpc('get_promotion_fund_balance');
    const currentBalance = balanceData || 0;

    // Credit fund
    const { error } = await supabase.from('promotion_fund_ledger').insert({
      transaction_type: 'credit',
      amount,
      source_rep_id: repId,
      source_order_id: orderId,
      balance_after: currentBalance + amount,
      notes: 'Business Center purchase contribution',
    });

    if (error) {
      console.error('Failed to credit promotion fund:', error);
      // Don't throw - log error and continue
      // Retry mechanism will handle this via cron job
      return;
    }

    // Mark order as credited
    await supabase
      .from('orders')
      .update({ promotion_fund_credited: true })
      .eq('id', orderId);

    console.log(`Promotion fund credited: $${amount} from order ${orderId}`);
  } catch (error) {
    console.error('Promotion fund credit error:', error);
    // Don't throw - retry will handle
  }
}
