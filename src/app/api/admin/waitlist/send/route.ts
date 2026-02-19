// =============================================
// Send Launch Emails to Waitlist
// Admin-only: fires personalized launch emails
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { buildLaunchEmail } from '@/lib/email/launch-email';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const supabase = createServiceClient();

    const { data: entries, error: fetchError } = await supabase
      .from('waitlist')
      .select('id, email, source_slug')
      .is('notified_at', null);

    if (fetchError) throw fetchError;
    if (!entries || entries.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No pending entries' });
    }

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    let sent = 0;
    let failed = 0;
    const notifiedIds: string[] = [];

    for (const entry of entries) {
      const { subject, html } = buildLaunchEmail(entry.source_slug);

      try {
        await resend.emails.send({
          from: 'Apex Affinity Group <no-reply@theapexway.net>',
          to: entry.email,
          subject,
          html,
        });

        notifiedIds.push(entry.id);
        sent++;
      } catch (emailErr) {
        console.error(`Failed to send to ${entry.email}:`, emailErr);
        failed++;
      }
    }

    if (notifiedIds.length > 0) {
      await supabase
        .from('waitlist')
        .update({ notified_at: new Date().toISOString() })
        .in('id', notifiedIds);
    }

    return NextResponse.json({ success: true, sent, failed, total: entries.length });
  } catch (error: any) {
    console.error('Send waitlist error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
