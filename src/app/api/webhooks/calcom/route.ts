/**
 * Cal.com Webhook Handler
 * Handles BOOKING_CREATED events
 * Sends notifications to admins, client, and sponsor
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendEmail } from '@/lib/email/resend';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { triggerEvent, payload: bookingData } = payload;

    // Only handle BOOKING_CREATED events
    if (triggerEvent !== 'BOOKING_CREATED') {
      return NextResponse.json({ received: true });
    }

    const {
      booking,
      attendees,
      eventType,
      metadata,
    } = bookingData;

    // Extract booking details
    const clientName = attendees?.[0]?.name || 'Customer';
    const clientEmail = attendees?.[0]?.email || '';
    const clientPhone = booking?.responses?.phone || '';
    const productName = booking?.responses?.product || 'Product';
    const notes = booking?.responses?.notes || '';

    const startTime = new Date(booking?.startTime);
    const endTime = new Date(booking?.endTime);
    const bookingDate = startTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const bookingTime = startTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/Chicago',
      timeZoneName: 'short'
    });
    const meetingLink = 'https://meetings.dialpad.com/room/aicallers';

    console.log('📅 Booking received:', {
      clientName,
      clientEmail,
      clientPhone,
      productName,
      bookingDate,
      bookingTime,
    });

    // Load email templates
    const baseTemplatePath = path.join(process.cwd(), 'src/lib/email/templates/base-email-template.html');
    const baseTemplate = await fs.readFile(baseTemplatePath, 'utf-8');

    // Get Supabase client to find sponsor
    const supabase = createServiceClient();
    let sponsorEmail = '';
    let sponsorName = '';
    let sponsorId = '';

    // Try to find the purchase/sponsor from session metadata
    // We'll need to pass session_id through Cal.com prefill
    const sessionId = booking?.metadata?.session_id;
    if (sessionId) {
      // Look up the Stripe session to find distributor
      const { data: transaction } = await supabase
        .from('transactions')
        .select(`
          *,
          distributor:distributors!transactions_distributor_id_fkey (
            id,
            first_name,
            last_name,
            email,
            sponsor:distributors!distributors_sponsor_id_fkey (
              id,
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq('payment_intent_id', sessionId)
        .single();

      if (transaction?.distributor?.sponsor) {
        const sponsor = transaction.distributor.sponsor;
        sponsorId = sponsor.id;
        sponsorName = `${sponsor.first_name} ${sponsor.last_name}`;
        sponsorEmail = sponsor.email;
      }
    }

    // 1. Send emails to admins (tavaresdavis81@gmail.com and tdaniel@botmakers.ai)
    const adminEmailHtml = baseTemplate.replace('{{email_content}}', `
      <h2 style="color: #2c5aa0; margin: 0 0 24px 0;">New Onboarding Booking</h2>
      <p style="margin: 0 0 16px 0; line-height: 1.6;">A new onboarding session has been booked.</p>

      <div style="background: #f8f9fa; border-left: 4px solid #2c5aa0; padding: 16px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #2c5aa0;">Booking Details</h3>
        <p style="margin: 0 0 8px 0;"><strong>Client:</strong> ${clientName}</p>
        <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${clientEmail}</p>
        <p style="margin: 0 0 8px 0;"><strong>Phone:</strong> ${clientPhone}</p>
        <p style="margin: 0 0 8px 0;"><strong>Product:</strong> ${productName}</p>
        <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${bookingDate}</p>
        <p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${bookingTime}</p>
        ${sponsorName ? `<p style="margin: 0 0 8px 0;"><strong>Sponsor:</strong> ${sponsorName} (${sponsorEmail})</p>` : ''}
        ${notes ? `<p style="margin: 8px 0 0 0;"><strong>Notes:</strong> ${notes}</p>` : ''}
      </div>

      <div style="margin: 24px 0;">
        <a href="${meetingLink}" style="display: inline-block; background: #2c5aa0; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">Join Meeting</a>
      </div>
    `);

    // Send to first admin
    await sendEmail({
      from: 'Apex Affinity Group <theapex@theapexway.net>',
      to: 'tavaresdavis81@gmail.com',
      subject: `New Onboarding Booking - ${clientName}`,
      html: adminEmailHtml,
    });

    // Send to second admin
    await sendEmail({
      from: 'Apex Affinity Group <theapex@theapexway.net>',
      to: 'tdaniel@botmakers.ai',
      subject: `New Onboarding Booking - ${clientName}`,
      html: adminEmailHtml,
    });

    console.log('✅ Admin notifications sent');

    // 2. Send confirmation to client
    const clientEmailHtml = baseTemplate.replace('{{email_content}}', `
      <h2 style="color: #2c5aa0; margin: 0 0 24px 0;">Onboarding Session Confirmed</h2>
      <p style="margin: 0 0 16px 0; line-height: 1.6;">Thank you for booking your onboarding session! We're excited to help you get started with ${productName}.</p>

      <div style="background: #f8f9fa; border-left: 4px solid #2c5aa0; padding: 16px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #2c5aa0;">Session Details</h3>
        <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${bookingDate}</p>
        <p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${bookingTime}</p>
        <p style="margin: 0 0 8px 0;"><strong>Duration:</strong> 30 minutes</p>
      </div>

      <div style="margin: 24px 0;">
        <a href="${meetingLink}" style="display: inline-block; background: #2c5aa0; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">Join Meeting (Dialpad)</a>
      </div>

      <p style="margin: 24px 0 0 0; font-size: 14px; color: #6c757d;">
        You'll receive a reminder 24 hours before your session. If you need to reschedule, please contact us at support@theapexway.net.
      </p>
    `);

    await sendEmail({
      from: 'Apex Affinity Group <theapex@theapexway.net>',
      to: clientEmail,
      subject: 'Your Onboarding Session is Confirmed',
      html: clientEmailHtml,
    });

    console.log('✅ Client confirmation sent');

    // 3. Send notification to sponsor (if found)
    if (sponsorEmail && sponsorName) {
      const sponsorEmailHtml = baseTemplate.replace('{{email_content}}', `
        <h2 style="color: #2c5aa0; margin: 0 0 24px 0;">Your Customer Booked an Onboarding Session</h2>
        <p style="margin: 0 0 16px 0; line-height: 1.6;">Great news! Your customer has scheduled their onboarding session.</p>

        <div style="background: #f8f9fa; border-left: 4px solid #2c5aa0; padding: 16px; margin: 24px 0;">
          <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #2c5aa0;">Customer Details</h3>
          <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${clientName}</p>
          <p style="margin: 0 0 8px 0;"><strong>Product:</strong> ${productName}</p>
          <p style="margin: 0 0 8px 0;"><strong>Session Date:</strong> ${bookingDate}</p>
          <p style="margin: 0 0 8px 0;"><strong>Session Time:</strong> ${bookingTime}</p>
        </div>

        <p style="margin: 24px 0 0 0; line-height: 1.6;">
          Your customer is taking the next step to get started with their purchase. They'll receive comprehensive onboarding support from the Apex team.
        </p>
      `);

      await sendEmail({
        from: 'Apex Affinity Group <theapex@theapexway.net>',
        to: sponsorEmail,
        subject: `${clientName} Booked Their Onboarding Session`,
        html: sponsorEmailHtml,
      });

      console.log('✅ Sponsor notification sent');

      // 4. Create notification in sponsor's back office
      if (sponsorId) {
        await supabase.from('notifications').insert({
          distributor_id: sponsorId,
          type: 'booking_created',
          title: 'Customer Onboarding Booked',
          message: `${clientName} has booked an onboarding session for ${productName} on ${bookingDate} at ${bookingTime}.`,
          data: {
            client_name: clientName,
            client_email: clientEmail,
            client_phone: clientPhone,
            product_name: productName,
            booking_date: bookingDate,
            booking_time: bookingTime,
            meeting_link: meetingLink,
          },
          read: false,
        });

        console.log('✅ Back office notification created');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications sent successfully'
    });

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
