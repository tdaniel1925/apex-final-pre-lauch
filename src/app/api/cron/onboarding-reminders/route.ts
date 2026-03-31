// =============================================
// Onboarding Reminders Cron
// Sends reminder emails for upcoming onboarding sessions
// - 24 hours before session
// - 4 hours before session
// - 15 minutes before session
// Runs every 15 minutes via Vercel Cron
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  send24HourReminder,
  send4HourReminder,
  send15MinuteReminder,
} from '@/lib/email/onboarding';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const now = new Date();

    // Calculate time windows for each reminder type
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

    // Allow 30-minute window for each reminder type to account for cron timing
    const twentyFourHoursWindow = {
      start: new Date(twentyFourHoursFromNow.getTime() - 15 * 60 * 1000),
      end: new Date(twentyFourHoursFromNow.getTime() + 15 * 60 * 1000),
    };

    const fourHoursWindow = {
      start: new Date(fourHoursFromNow.getTime() - 15 * 60 * 1000),
      end: new Date(fourHoursFromNow.getTime() + 15 * 60 * 1000),
    };

    const fifteenMinutesWindow = {
      start: new Date(fifteenMinutesFromNow.getTime() - 7 * 60 * 1000),
      end: new Date(fifteenMinutesFromNow.getTime() + 8 * 60 * 1000),
    };

    let remindersSent = 0;
    let errors: string[] = [];

    // ===========================================
    // 24-HOUR REMINDERS
    // ===========================================

    const { data: sessions24h, error: error24h } = await supabase
      .from('onboarding_sessions')
      .select(`
        id,
        customer_name,
        customer_email,
        scheduled_date,
        scheduled_time,
        zoom_link,
        reminder_24h_sent_at,
        rep_distributor_id,
        distributors:rep_distributor_id (
          email
        )
      `)
      .eq('status', 'scheduled')
      .is('reminder_24h_sent_at', null)
      .gte('scheduled_date', twentyFourHoursWindow.start.toISOString().split('T')[0])
      .lte('scheduled_date', twentyFourHoursWindow.end.toISOString().split('T')[0]);

    if (error24h) {
      console.error('Error fetching 24h reminder sessions:', error24h);
      errors.push(`24h reminders: ${error24h.message}`);
    } else if (sessions24h && sessions24h.length > 0) {
      for (const session of sessions24h) {
        // Check if session time is within window
        const sessionDateTime = new Date(
          `${session.scheduled_date}T${session.scheduled_time}`
        );

        if (
          sessionDateTime >= twentyFourHoursWindow.start &&
          sessionDateTime <= twentyFourHoursWindow.end
        ) {
          try {
            const result = await send24HourReminder({
              customerName: session.customer_name,
              customerEmail: session.customer_email,
              bookingDate: new Date(session.scheduled_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              bookingTime: new Date(
                `${session.scheduled_date}T${session.scheduled_time}`
              ).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }),
              meetingLink: session.zoom_link || 'https://meetings.dialpad.com/room/aicallers',
              repEmail: (session as any).distributors?.email,
            });

            if (result.success) {
              // Mark reminder as sent
              await supabase
                .from('onboarding_sessions')
                .update({ reminder_24h_sent_at: now.toISOString() })
                .eq('id', session.id);

              remindersSent++;
            } else {
              errors.push(`24h reminder for ${session.customer_email}: ${result.error}`);
            }
          } catch (error) {
            console.error(`Error sending 24h reminder for session ${session.id}:`, error);
            errors.push(
              `24h reminder for ${session.customer_email}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }
      }
    }

    // ===========================================
    // 4-HOUR REMINDERS
    // ===========================================

    // Add reminder_4h_sent_at column tracking (we'll need to add this to the schema)
    // For now, we'll check if it's been more than 20 hours since 24h reminder
    const { data: sessions4h, error: error4h } = await supabase
      .from('onboarding_sessions')
      .select(`
        id,
        customer_name,
        customer_email,
        scheduled_date,
        scheduled_time,
        zoom_link,
        reminder_24h_sent_at,
        session_notes
      `)
      .eq('status', 'scheduled')
      .not('reminder_24h_sent_at', 'is', null)
      .gte('scheduled_date', fourHoursWindow.start.toISOString().split('T')[0])
      .lte('scheduled_date', fourHoursWindow.end.toISOString().split('T')[0]);

    if (error4h) {
      console.error('Error fetching 4h reminder sessions:', error4h);
      errors.push(`4h reminders: ${error4h.message}`);
    } else if (sessions4h && sessions4h.length > 0) {
      for (const session of sessions4h) {
        // Check if 4h reminder already sent (stored in session_notes as flag)
        if (session.session_notes?.includes('[4H_REMINDER_SENT]')) {
          continue;
        }

        const sessionDateTime = new Date(
          `${session.scheduled_date}T${session.scheduled_time}`
        );

        if (
          sessionDateTime >= fourHoursWindow.start &&
          sessionDateTime <= fourHoursWindow.end
        ) {
          try {
            const result = await send4HourReminder({
              customerName: session.customer_name,
              customerEmail: session.customer_email,
              bookingDate: new Date(session.scheduled_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              bookingTime: new Date(
                `${session.scheduled_date}T${session.scheduled_time}`
              ).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }),
              meetingLink: session.zoom_link || 'https://meetings.dialpad.com/room/aicallers',
            });

            if (result.success) {
              // Mark reminder as sent in session_notes
              const updatedNotes = `${session.session_notes || ''}\n[4H_REMINDER_SENT]`;
              await supabase
                .from('onboarding_sessions')
                .update({ session_notes: updatedNotes })
                .eq('id', session.id);

              remindersSent++;
            } else {
              errors.push(`4h reminder for ${session.customer_email}: ${result.error}`);
            }
          } catch (error) {
            console.error(`Error sending 4h reminder for session ${session.id}:`, error);
            errors.push(
              `4h reminder for ${session.customer_email}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }
      }
    }

    // ===========================================
    // 15-MINUTE REMINDERS
    // ===========================================

    const { data: sessions15m, error: error15m } = await supabase
      .from('onboarding_sessions')
      .select(`
        id,
        customer_name,
        customer_email,
        scheduled_date,
        scheduled_time,
        zoom_link,
        reminder_1h_sent_at,
        session_notes
      `)
      .eq('status', 'scheduled')
      .gte('scheduled_date', fifteenMinutesWindow.start.toISOString().split('T')[0])
      .lte('scheduled_date', fifteenMinutesWindow.end.toISOString().split('T')[0]);

    if (error15m) {
      console.error('Error fetching 15m reminder sessions:', error15m);
      errors.push(`15m reminders: ${error15m.message}`);
    } else if (sessions15m && sessions15m.length > 0) {
      for (const session of sessions15m) {
        // Check if 15m reminder already sent
        if (
          session.session_notes?.includes('[15M_REMINDER_SENT]') ||
          session.reminder_1h_sent_at // Reuse 1h field for 15m tracking
        ) {
          continue;
        }

        const sessionDateTime = new Date(
          `${session.scheduled_date}T${session.scheduled_time}`
        );

        if (
          sessionDateTime >= fifteenMinutesWindow.start &&
          sessionDateTime <= fifteenMinutesWindow.end
        ) {
          try {
            const result = await send15MinuteReminder({
              customerName: session.customer_name,
              customerEmail: session.customer_email,
              bookingDate: new Date(session.scheduled_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              bookingTime: new Date(
                `${session.scheduled_date}T${session.scheduled_time}`
              ).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }),
              meetingLink: session.zoom_link || 'https://meetings.dialpad.com/room/aicallers',
            });

            if (result.success) {
              // Mark reminder as sent
              await supabase
                .from('onboarding_sessions')
                .update({ reminder_1h_sent_at: now.toISOString() })
                .eq('id', session.id);

              remindersSent++;
            } else {
              errors.push(`15m reminder for ${session.customer_email}: ${result.error}`);
            }
          } catch (error) {
            console.error(`Error sending 15m reminder for session ${session.id}:`, error);
            errors.push(
              `15m reminder for ${session.customer_email}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Error in onboarding reminders cron:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
