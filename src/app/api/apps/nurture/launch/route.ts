// =============================================
// POST /api/apps/nurture/launch
// Saves a campaign + queued emails to Supabase
// =============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { prospectName, prospectEmail, product, context, emails, intervalDays, plan } = await req.json() as {
      prospectName: string;
      prospectEmail: string;
      product: string;
      context: string;
      emails: { subject: string; body: string }[];
      intervalDays: number;
      plan: string;
    };

    if (!prospectName?.trim() || !prospectEmail?.trim() || !emails?.length) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const safeInterval = Math.max(3, Math.min(intervalDays ?? 3, 14));
    const totalEmails = emails.length;

    // Insert campaign
    const { data: campaign, error: campaignErr } = await supabase
      .from('nurture_campaigns')
      .insert({
        user_id:          user.id,
        prospect_name:    prospectName.trim(),
        prospect_email:   prospectEmail.trim(),
        prospect_context: context?.trim() ?? '',
        product:          product ?? 'Term Life',
        plan:             plan ?? 'free',
        interval_days:    safeInterval,
        total_emails:     totalEmails,
        emails_sent:      0,
        status:           'active',
      })
      .select('id')
      .single();

    if (campaignErr || !campaign) {
      console.error('Campaign insert error:', campaignErr);
      throw new Error('Failed to create campaign');
    }

    // Build email rows — email 1 sends in ~5 min, rest spaced by interval
    const now = new Date();
    const emailRows = emails.map((e, i) => {
      const sendAt = new Date(now);
      sendAt.setMinutes(sendAt.getMinutes() + 5 + i * safeInterval * 24 * 60);
      return {
        campaign_id:  campaign.id,
        email_number: i + 1,
        subject:      e.subject,
        body:         e.body,
        send_at:      sendAt.toISOString(),
        status:       'scheduled',
      };
    });

    const { error: emailsErr } = await supabase
      .from('nurture_emails')
      .insert(emailRows);

    if (emailsErr) {
      console.error('Emails insert error:', emailsErr);
      throw new Error('Failed to queue emails');
    }

    return NextResponse.json({ success: true, campaignId: campaign.id });
  } catch (err) {
    console.error('Nurture launch error:', err);
    return NextResponse.json({ error: 'Failed to launch campaign. Please try again.' }, { status: 500 });
  }
}
