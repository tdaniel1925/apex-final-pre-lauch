// =============================================
// POST /api/cron/nurture-send
// Vercel Cron — runs every hour
// Sends any nurture_emails where send_at <= now()
// =============================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function buildEmailHtml(body: string, agentName: string, prospectName: string): string {
  const firstName = prospectName.split(' ')[0];
  const paragraphs = body
    .split('\n')
    .filter(p => p.trim())
    .map(p => `<p style="margin:0 0 16px;font-size:16px;color:#374151;line-height:1.7;">${p.trim()}</p>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1a2f50 0%,#2B4C7E 100%);padding:28px 40px;">
            <img src="https://theapexway.net/apex-logo-white.png" alt="Apex Affinity Group" style="height:48px;width:auto;" />
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            ${paragraphs}
            <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
                This message was sent on behalf of <strong>${agentName}</strong> through Apex Affinity Group.
                Reply directly to this email to reach ${agentName.split(' ')[0]}.
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              <strong>Apex Affinity Group</strong> &nbsp;·&nbsp; 1600 Highway 6, Ste 400, Sugar Land, TX 77478
            </p>
            <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;">
              You received this because ${agentName.split(' ')[0]} personally reached out to you.
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
  // Protect with CRON_SECRET if set
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Use service role to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const now = new Date().toISOString();

    // Fetch all emails due to send
    const { data: dueEmails, error: fetchErr } = await supabase
      .from('nurture_emails')
      .select(`
        id,
        subject,
        body,
        email_number,
        campaign_id,
        nurture_campaigns (
          id,
          user_id,
          prospect_name,
          prospect_email,
          total_emails,
          emails_sent
        )
      `)
      .eq('status', 'scheduled')
      .lte('send_at', now);

    if (fetchErr) {
      console.error('Cron fetch error:', fetchErr);
      return NextResponse.json({ error: 'Failed to fetch due emails' }, { status: 500 });
    }

    if (!dueEmails || dueEmails.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No emails due' });
    }

    let sent = 0;
    let failed = 0;

    for (const email of dueEmails) {
      const campaign = Array.isArray(email.nurture_campaigns)
        ? email.nurture_campaigns[0]
        : email.nurture_campaigns;

      if (!campaign) { failed++; continue; }

      // Look up the agent's email from distributors
      const { data: distributor } = await supabase
        .from('distributors')
        .select('first_name, last_name, email')
        .eq('auth_user_id', campaign.user_id)
        .single();

      const agentName  = distributor
        ? `${distributor.first_name} ${distributor.last_name}`
        : 'Your Agent';
      const agentEmail = distributor?.email ?? 'theapex@theapexway.net';

      try {
        await resend.emails.send({
          from:    `${agentName} via Apex Affinity Group <theapex@theapexway.net>`,
          to:      campaign.prospect_email,
          replyTo: agentEmail,
          subject: email.subject,
          html:    buildEmailHtml(email.body, agentName, campaign.prospect_name),
        });

        // Mark email sent
        await supabase
          .from('nurture_emails')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', email.id);

        // Increment emails_sent on campaign; mark completed if all sent
        const newSentCount = (campaign.emails_sent ?? 0) + 1;
        const isComplete   = newSentCount >= campaign.total_emails;
        await supabase
          .from('nurture_campaigns')
          .update({
            emails_sent: newSentCount,
            status: isComplete ? 'completed' : 'active',
          })
          .eq('id', campaign.id);

        sent++;
      } catch (sendErr) {
        console.error(`Failed to send email ${email.id}:`, sendErr);
        await supabase
          .from('nurture_emails')
          .update({ status: 'failed' })
          .eq('id', email.id);
        failed++;
      }
    }

    return NextResponse.json({ success: true, sent, failed });
  } catch (err) {
    console.error('Cron nurture-send error:', err);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
