// =============================================
// Send Launch Emails to Waitlist
// Admin-only: fires personalized launch emails
// to everyone on the waitlist
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';

const BASE_URL = 'https://reachtheapex.net';
const WEBINAR_LINK = process.env.WEBINAR_LINK || 'https://reachtheapex.net';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const supabase = createServiceClient();

    // Fetch all un-notified waitlist entries
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
      const returnUrl = entry.source_slug
        ? `${BASE_URL}/${entry.source_slug}`
        : BASE_URL;

      const signupUrl = entry.source_slug
        ? `${BASE_URL}/signup?ref=${entry.source_slug}`
        : `${BASE_URL}/signup`;

      try {
        await resend.emails.send({
          from: 'Apex Affinity Group <no-reply@reachtheapex.net>',
          to: entry.email,
          subject: "🚀 We're LIVE — Your Spot is Waiting!",
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#2B4C7E;padding:40px 40px 32px;text-align:center;">
              <img src="${BASE_URL}/apex-logo-white.png" alt="Apex Affinity Group" style="height:60px;width:auto;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#1a1a2e;">
                We're LIVE. Let's Go.
              </h1>
              <p style="margin:0 0 24px;font-size:16px;color:#666;line-height:1.6;">
                The wait is over. Signups are officially open and your spot in the matrix is ready.
                You were one of the first to raise your hand — now it's time to claim your place.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#2B4C7E;border-radius:8px;">
                    <a href="${signupUrl}" style="display:block;padding:16px 40px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;">
                      Claim My Spot Now →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:14px;color:#999;">
                Or copy this link into your browser:
              </p>
              <p style="margin:0 0 32px;font-size:13px;color:#2B4C7E;word-break:break-all;">
                ${signupUrl}
              </p>

              <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px;" />

              <p style="margin:0;font-size:13px;color:#aaa;text-align:center;">
                You're receiving this because you joined the Apex Affinity Group waitlist.<br />
                <a href="${returnUrl}" style="color:#2B4C7E;">Visit our site</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `,
        });

        notifiedIds.push(entry.id);
        sent++;
      } catch (emailErr) {
        console.error(`Failed to send to ${entry.email}:`, emailErr);
        failed++;
      }
    }

    // Mark sent entries as notified
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
