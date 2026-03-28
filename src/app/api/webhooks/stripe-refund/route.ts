/**
 * Stripe Refund Webhook
 *
 * POST /api/webhooks/stripe-refund
 * - Listens for Stripe charge.refunded events
 * - Triggers commission clawback for refunded orders
 *
 * COMPLIANCE: FTC requires commission clawback within 60 days of refund
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { processOrderClawback } from '@/lib/compensation/clawback-processor';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_REFUND!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

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
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle charge.refunded event
    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = charge.payment_intent as string;

      console.log(`Refund detected for payment intent: ${paymentIntentId}`);

      // Find order by Stripe payment intent ID
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, status, total_amount_cents')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single();

      if (orderError || !order) {
        console.error('Order not found for payment intent:', paymentIntentId);
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      // Update order status to refunded
      await supabase
        .from('orders')
        .update({
          status: 'refunded',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      // Process commission clawback
      const clawbackResult = await processOrderClawback(order.id);

      if (!clawbackResult.success) {
        console.error('Clawback processing failed:', clawbackResult.error);
        return NextResponse.json(
          {
            received: true,
            warning: 'Order marked as refunded, but clawback processing failed',
            error: clawbackResult.error,
          },
          { status: 200 }
        );
      }

      console.log(
        `Clawback processed successfully for order ${order.id}:`,
        clawbackResult
      );

      return NextResponse.json({
        received: true,
        order_id: order.id,
        clawback_result: clawbackResult,
      });
    }

    // Handle payment_intent.canceled event
    if (event.type === 'payment_intent.canceled') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      console.log(`Payment intent canceled: ${paymentIntent.id}`);

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id')
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .single();

      if (!orderError && order) {
        // Update order status to cancelled
        await supabase
          .from('orders')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', order.id);

        // Process clawback for cancelled orders
        const clawbackResult = await processOrderClawback(order.id);

        return NextResponse.json({
          received: true,
          order_id: order.id,
          clawback_result: clawbackResult,
        });
      }
    }

    // Return success for other event types (ignore)
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe refund webhook error:', error);
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
