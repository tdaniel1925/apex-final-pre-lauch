// =============================================
// Create Booking API
// Creates onboarding session after checkout
// Integrates with Google Calendar for BotMakers
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { sendBookingConfirmation } from '@/lib/email/onboarding';
import { createCalendarEvent, isCalendarConfigured } from '@/lib/google-calendar/client';

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

    // Check if date is Sunday (0) - Saturdays (6) are now allowed
    const dateObj = new Date(date + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0) {
      return NextResponse.json(
        { error: 'Cannot book on Sundays' },
        { status: 400 }
      );
    }

    // Check if date is within 24 hours (minimum booking notice)
    const now = new Date();
    const minBookingDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const bookingDateTime = new Date(date + 'T' + time);

    if (bookingDateTime < minBookingDate) {
      return NextResponse.json(
        { error: 'Bookings must be made at least 24 hours in advance' },
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

    // Create Google Calendar event if configured
    let googleCalendarEventId: string | null = null;
    let meetingLink = 'https://meetings.dialpad.com/room/aicallers';

    if (isCalendarConfigured()) {
      try {
        const sessionStartTime = new Date(date + 'T' + time);
        const sessionEndTime = new Date(sessionStartTime.getTime() + 30 * 60 * 1000); // 30 minutes

        // Get product names from order items
        const productNames = order.order_items?.map((item: any) => item.product_name).join(', ') || 'Apex Products';

        const calendarResult = await createCalendarEvent({
          title: `Onboarding: ${customerName || 'Customer'} - ${productNames}`,
          startTime: sessionStartTime,
          endTime: sessionEndTime,
          attendees: [
            customerEmail || '',
            'botmakers@theapexway.net',
            // Add rep email if available
          ].filter(Boolean),
          description: `
Client Onboarding Session

Customer: ${customerName || 'Unknown'}
Email: ${customerEmail || 'Unknown'}
Phone: ${customerPhone || 'Not provided'}
Products: ${productNames}

Meeting Link: ${meetingLink}

Please join the meeting at the scheduled time.
          `.trim(),
          location: meetingLink,
        });

        googleCalendarEventId = calendarResult.eventId;
      } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        // Continue with booking even if calendar creation fails
        // Admin can manually add to calendar later
      }
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
        duration_minutes: 30, // Updated to 30 minutes
        zoom_link: meetingLink, // Store Dialpad link
        status: 'scheduled',
        customer_name: customerName || 'Unknown',
        customer_email: customerEmail || '',
        customer_phone: customerPhone || '',
        products_purchased: order.order_items,
        session_notes: googleCalendarEventId ? `Google Calendar Event ID: ${googleCalendarEventId}` : null,
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
