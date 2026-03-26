// =============================================
// Create Booking API
// Creates onboarding session after checkout
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { sendBookingConfirmation } from '@/lib/email/onboarding';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, date, time } = body;

    // Validate inputs
    if (!session_id || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields: session_id, date, time' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate time format
    const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
    if (!timeRegex.test(time)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM:SS' },
        { status: 400 }
      );
    }

    // Check if date is a weekend
    const dateObj = new Date(date + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return NextResponse.json(
        { error: 'Cannot book on weekends' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if slot is still available
    const { data: existingBooking } = await supabase
      .from('onboarding_sessions')
      .select('id')
      .eq('scheduled_date', date)
      .eq('scheduled_time', time)
      .in('status', ['scheduled', 'confirmed'])
      .single();

    if (existingBooking) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      );
    }

    // Get Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['customer', 'subscription'],
    });

    if (!stripeSession) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 404 }
      );
    }

    const customerEmail = stripeSession.customer_details?.email;
    const customerName = stripeSession.customer_details?.name;
    const customerPhone = stripeSession.customer_details?.phone;

    // Find the order associated with this checkout
    const { data: order } = await supabase
      .from('orders')
      .select(`
        id,
        customer_id,
        referred_by_distributor_id,
        order_items (
          product_name,
          quantity,
          unit_price_cents
        )
      `)
      .eq('stripe_session_id', session_id)
      .single();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found for this session' },
        { status: 404 }
      );
    }

    // Create onboarding session
    const { data: newBooking, error: bookingError } = await supabase
      .from('onboarding_sessions')
      .insert({
        customer_id: order.customer_id,
        order_id: order.id,
        rep_distributor_id: order.referred_by_distributor_id,
        scheduled_date: date,
        scheduled_time: time,
        timezone: 'America/Chicago',
        duration_minutes: 60,
        status: 'scheduled',
        customer_name: customerName || 'Unknown',
        customer_email: customerEmail || '',
        customer_phone: customerPhone || '',
        products_purchased: order.order_items,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    // Send confirmation email
    const bookingDateObj = new Date(date + 'T' + time);
    const formattedDate = bookingDateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = bookingDateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const emailResult = await sendBookingConfirmation({
      customerName: customerName || 'Valued Customer',
      customerEmail: customerEmail || '',
      bookingDate: formattedDate,
      bookingTime: formattedTime,
    });

    if (emailResult.success) {
      // Update booking to mark confirmation sent
      await supabase
        .from('onboarding_sessions')
        .update({ confirmation_sent_at: new Date().toISOString() })
        .eq('id', newBooking.id);
    } else {
      console.error('Failed to send confirmation email:', emailResult.error);
      // Don't fail the booking if email fails - log it instead
    }

    return NextResponse.json({
      success: true,
      booking: newBooking,
    });
  } catch (error) {
    console.error('Error in booking creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
