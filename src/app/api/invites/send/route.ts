// ============================================================
// POST /api/invites/send
// Sends up to 10 personalized VIP invite emails via Resend
// ============================================================

import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface Recipient {
  name:  string;
  email: string;
}

function vipEmailHtml(recipientName: string, senderName: string): string {
  const firstName = recipientName.split(' ')[0];
  const webinarLink = 'https://events.teams.microsoft.com/event/599e6f14-a298-4986-be33-64031f51f37f@8db46c49-b9d5-4f6b-948b-b99f34520af8';
  const waitlistLink = 'https://theapexway.net/signup';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VIP First Look — Apex Affinity Group</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a2f50 0%,#2B4C7E 100%);padding:36px 40px;text-align:center;">
            <img src="https://theapexway.net/apex-logo-white.png" alt="Apex Affinity Group" style="height:60px;width:auto;" />
            <div style="margin-top:16px;display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:999px;padding:5px 18px;">
              <span style="color:#fbbf24;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">VIP First Look</span>
            </div>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:40px 40px 32px;">

            <p style="margin:0 0 20px;font-size:17px;color:#374151;line-height:1.6;">
              Hi <strong>${firstName}</strong>,
            </p>

            <p style="margin:0 0 20px;font-size:16px;color:#374151;line-height:1.7;">
              <strong>${senderName}</strong> personally invited you to get an exclusive first look at something big.
            </p>

            <p style="margin:0 0 28px;font-size:16px;color:#374151;line-height:1.7;">
              <strong style="color:#1a2f50;">Apex Affinity Group</strong> is launching — and before the doors open to the public, we're giving a select group of people early access. You're on that list.
            </p>

            <!-- DIVIDER -->
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 28px;" />

            <!-- 3 EVENTS -->
            <p style="margin:0 0 20px;font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#2B4C7E;">Here's What's Coming</p>

            <!-- Event 1 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="width:48px;vertical-align:top;padding-top:2px;">
                  <div style="width:40px;height:40px;background:#eff6ff;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">🖥️</div>
                </td>
                <td style="padding-left:14px;">
                  <p style="margin:0 0 3px;font-size:15px;font-weight:800;color:#1a2f50;">The Site Goes Live</p>
                  <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">The Apex Affinity Group platform officially opens following our pre-launch webinar. Be among the first to sign up.</p>
                </td>
              </tr>
            </table>

            <!-- Event 2 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="width:48px;vertical-align:top;padding-top:2px;">
                  <div style="width:40px;height:40px;background:#eff6ff;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">🎙️</div>
                </td>
                <td style="padding-left:14px;">
                  <p style="margin:0 0 3px;font-size:15px;font-weight:800;color:#1a2f50;">Pre-Launch Webinar — Monday, Feb 23 at 9:00 PM ET</p>
                  <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">Join us live for a full walkthrough of the platform, our product lineup, and how to get started. This is the official kickoff.</p>
                </td>
              </tr>
            </table>

            <!-- Event 3 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="width:48px;vertical-align:top;padding-top:2px;">
                  <div style="width:40px;height:40px;background:#eff6ff;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">📅</div>
                </td>
                <td style="padding-left:14px;">
                  <p style="margin:0 0 3px;font-size:15px;font-weight:800;color:#1a2f50;">More Events Coming</p>
                  <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">An official online launch session and agent training are on the way. Details will be announced — stay tuned.</p>
                </td>
              </tr>
            </table>

            <!-- CTA BUTTONS -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td align="center" style="padding:0 0 12px;">
                  <a href="${waitlistLink}" style="display:inline-block;background:#2B4C7E;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;padding:14px 40px;border-radius:12px;">
                    Join the Waitlist — It's Free →
                  </a>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <a href="${webinarLink}" style="display:inline-block;background:#ffffff;color:#2B4C7E;font-weight:700;font-size:14px;text-decoration:none;padding:12px 32px;border-radius:12px;border:2px solid #2B4C7E;">
                    Register for the Webinar →
                  </a>
                </td>
              </tr>
            </table>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;" />

            <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">
              Questions? Just reply directly to this email — <strong>${senderName}</strong> will get back to you.
            </p>

          </td>
        </tr>

        <!-- FOOTER / CAN-SPAM -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">
              You received this email because <strong>${senderName}</strong> personally invited you to learn about Apex Affinity Group.
            </p>
            <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">
              <strong>Apex Affinity Group</strong> &nbsp;·&nbsp; 1600 Highway 6, Ste 400, Sugar Land, TX 77478
            </p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              This is a one-time personal invite — you will not receive further emails unless you join the waitlist.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: Request) {
  try {
    const { senderName, recipients } = await req.json() as {
      senderName: string;
      recipients: Recipient[];
    };

    // Validate
    if (!senderName?.trim()) {
      return NextResponse.json({ error: 'Sender name is required.' }, { status: 400 });
    }
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'At least one recipient is required.' }, { status: 400 });
    }

    // Filter out empty rows, cap at 10
    const valid = recipients
      .filter(r => r.name?.trim() && r.email?.trim())
      .slice(0, 10);

    if (valid.length === 0) {
      return NextResponse.json({ error: 'Please fill in at least one recipient name and email.' }, { status: 400 });
    }

    // Send each email
    const results = await Promise.allSettled(
      valid.map(r =>
        resend.emails.send({
          from:    `${senderName} via Apex Affinity Group <theapex@theapexway.net>`,
          to:      r.email.trim(),
          subject: `${senderName} invited you: VIP First Look — Apex Affinity Group 🚀`,
          html:    vipEmailHtml(r.name.trim(), senderName.trim()),
        })
      )
    );

    const sent   = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({ success: true, sent, failed });
  } catch (err) {
    console.error('Invite send error:', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
