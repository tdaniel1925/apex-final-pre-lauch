/**
 * Public Meeting Registration API
 * POST /api/public/meetings/[id]/register - Register for a meeting
 * No authentication required, but rate limited
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createRegistrationSchema } from '@/lib/validators/meeting-schemas';
import { sendTrackedEmail } from '@/lib/services/resend-tracked';
import type { MeetingRegistration, CreateRegistrationResponse } from '@/types/meeting';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Initialize rate limiter (3 registrations per hour per IP)
const ratelimit = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      prefix: 'meeting-registration',
    })
  : null;

/**
 * POST /api/public/meetings/[id]/register
 * Public endpoint to register for a meeting
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: meetingId } = await params;

    // Rate limiting (if configured)
    if (ratelimit) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const { success: rateLimitPassed } = await ratelimit.limit(ip);

      if (!rateLimitPassed) {
        return NextResponse.json(
          { error: 'Too many registration attempts. Please try again later.' },
          { status: 429 }
        );
      }
    }

    const supabase = createServiceClient();

    // Get meeting details
    const { data: meeting, error: meetingError } = await supabase
      .from('meeting_events')
      .select(`
        id,
        title,
        status,
        max_attendees,
        total_registered,
        registration_deadline,
        event_date,
        event_time,
        event_timezone,
        duration_minutes,
        location_type,
        virtual_link,
        physical_address,
        distributor_id
      `)
      .eq('id', meetingId)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Validate meeting is active
    if (meeting.status !== 'active') {
      return NextResponse.json(
        { error: 'This meeting is no longer accepting registrations' },
        { status: 410 }
      );
    }

    // Check capacity
    if (meeting.max_attendees !== null && meeting.total_registered >= meeting.max_attendees) {
      return NextResponse.json(
        { error: 'This meeting has reached maximum capacity' },
        { status: 409 }
      );
    }

    // Check deadline
    if (meeting.registration_deadline && new Date() > new Date(meeting.registration_deadline)) {
      return NextResponse.json(
        { error: 'The registration deadline for this meeting has passed' },
        { status: 410 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = createRegistrationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check for duplicate registration (same email for this meeting)
    const { data: existingRegistration } = await supabase
      .from('meeting_registrations')
      .select('id')
      .eq('meeting_event_id', meetingId)
      .eq('email', data.email.toLowerCase())
      .maybeSingle();

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You are already registered for this meeting' },
        { status: 409 }
      );
    }

    // Get distributor info for email
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, phone, slug')
      .eq('id', meeting.distributor_id)
      .single();

    if (distError || !distributor) {
      console.error('[Registration API] Distributor not found:', distError);
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Create registration
    const registrationData = {
      meeting_event_id: meetingId,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      has_questions: data.hasQuestions || false,
      questions_text: data.questionsText || null,
      status: 'pending', // Default status
    };

    const { data: registration, error: insertError } = await supabase
      .from('meeting_registrations')
      .insert(registrationData)
      .select()
      .single();

    if (insertError) {
      console.error('[Registration API] Insert error:', insertError);

      // Check for unique constraint violation
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'You are already registered for this meeting' },
          { status: 409 }
        );
      }

      return NextResponse.json({ error: 'Failed to register for meeting' }, { status: 500 });
    }

    // Send confirmation email
    await sendConfirmationEmail({
      registration: registration as MeetingRegistration,
      meeting,
      distributor,
    });

    // Send notification email to rep
    await sendNewRegistrationNotification({
      registration: registration as MeetingRegistration,
      meeting,
      distributor,
    });

    // Build calendar download URL
    const calendarDownloadUrl = `/api/public/meetings/${meetingId}/calendar?regId=${registration.id}`;

    return NextResponse.json({
      success: true,
      data: {
        registration: registration as MeetingRegistration,
        calendarDownloadUrl,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('[Registration API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Send confirmation email to registrant
 */
async function sendConfirmationEmail({
  registration,
  meeting,
  distributor,
}: {
  registration: MeetingRegistration;
  meeting: {
    title: string;
    event_date: string;
    event_time: string;
    event_timezone: string;
    location_type: string;
    virtual_link: string | null;
    physical_address: string | null;
  };
  distributor: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  };
}) {
  try {
    const supabase = createServiceClient();

    // Format date and time
    const eventDate = new Date(meeting.event_date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Build email content
    const emailHtml = `
      <p>Dear ${registration.first_name},</p>

      <p>Thank you for registering for <strong>${meeting.title}</strong>.</p>

      <h2 style="color: #2c5aa0; margin-top: 24px;">Event Details</h2>

      <table style="width: 100%; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 0; color: #495057;"><strong>Date:</strong></td>
          <td style="padding: 8px 0;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #495057;"><strong>Time:</strong></td>
          <td style="padding: 8px 0;">${meeting.event_time} ${meeting.event_timezone}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #495057;"><strong>Location:</strong></td>
          <td style="padding: 8px 0;">
            ${meeting.location_type === 'virtual' && meeting.virtual_link
              ? `<a href="${meeting.virtual_link}" style="color: #2c5aa0;">Join Virtual Meeting</a>`
              : meeting.physical_address || meeting.location_type
            }
          </td>
        </tr>
      </table>

      ${registration.has_questions && registration.questions_text ? `
        <p style="margin-top: 24px;"><strong>Your Questions:</strong></p>
        <p style="background: #f8f9fa; padding: 12px; border-left: 3px solid #2c5aa0;">${registration.questions_text}</p>
        <p style="color: #495057;">We'll get back to you shortly with answers to your questions.</p>
      ` : ''}

      <h2 style="color: #2c5aa0; margin-top: 24px;">Your Representative</h2>
      <p>
        <strong>${distributor.first_name} ${distributor.last_name}</strong><br>
        Email: <a href="mailto:${distributor.email}" style="color: #2c5aa0;">${distributor.email}</a>
        ${distributor.phone ? `<br>Phone: ${distributor.phone}` : ''}
      </p>

      <p style="margin-top: 24px;">If you have any questions, please don't hesitate to reach out.</p>

      <p>We look forward to seeing you at the event!</p>
    `;

    const result = await sendTrackedEmail({
      from: 'Apex Affinity Group <noreply@theapexway.net>',
      to: registration.email,
      subject: `Registered: ${meeting.title}`,
      html: emailHtml,
      triggeredBy: 'system',
      userId: distributor.id,
      feature: 'meeting-reservations',
    });

    if (result.error) {
      console.error('[Registration] Confirmation email failed:', result.error);
    } else if (result.data?.id) {
      // Update registration to mark email sent
      await supabase
        .from('meeting_registrations')
        .update({
          confirmation_email_sent: true,
          confirmation_email_sent_at: new Date().toISOString(),
        })
        .eq('id', registration.id);

      console.log('[Registration] Confirmation email sent:', result.data.id);
    }
  } catch (error) {
    console.error('[Registration] Email error:', error);
  }
}

/**
 * Send notification email to rep about new registration
 */
async function sendNewRegistrationNotification({
  registration,
  meeting,
  distributor,
}: {
  registration: MeetingRegistration;
  meeting: {
    title: string;
    event_date: string;
  };
  distributor: {
    email: string;
  };
}) {
  try {
    const emailHtml = `
      <p>You have a new registration for your meeting:</p>

      <h2 style="color: #2c5aa0;">${meeting.title}</h2>

      <table style="width: 100%; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 0; color: #495057;"><strong>Name:</strong></td>
          <td style="padding: 8px 0;">${registration.first_name} ${registration.last_name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #495057;"><strong>Email:</strong></td>
          <td style="padding: 8px 0;"><a href="mailto:${registration.email}" style="color: #2c5aa0;">${registration.email}</a></td>
        </tr>
        ${registration.phone ? `
        <tr>
          <td style="padding: 8px 0; color: #495057;"><strong>Phone:</strong></td>
          <td style="padding: 8px 0;">${registration.phone}</td>
        </tr>
        ` : ''}
      </table>

      ${registration.has_questions && registration.questions_text ? `
        <p><strong>Questions from Registrant:</strong></p>
        <p style="background: #f8f9fa; padding: 12px; border-left: 3px solid #2c5aa0;">${registration.questions_text}</p>
      ` : ''}

      <p style="margin-top: 24px;">
        <a href="https://reachtheapex.net/dashboard/autopilot" style="display: inline-block; background: #2c5aa0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View All Registrations</a>
      </p>
    `;

    const result = await sendTrackedEmail({
      from: 'Apex Affinity Group <noreply@theapexway.net>',
      to: distributor.email,
      subject: `New Registration: ${meeting.title}`,
      html: emailHtml,
      triggeredBy: 'system',
      feature: 'meeting-reservations',
    });

    if (result.error) {
      console.error('[Registration] Rep notification email failed:', result.error);
    } else if (result.data?.id) {
      console.log('[Registration] Rep notification email sent:', result.data.id);
    }
  } catch (error) {
    console.error('[Registration] Rep notification error:', error);
  }
}
