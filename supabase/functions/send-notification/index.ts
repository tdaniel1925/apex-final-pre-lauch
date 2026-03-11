// Supabase Edge Function: send-notification
// Purpose: Send email notifications via Resend and handle in-app notifications
// Trigger: Database trigger on INSERT to notifications table
// Author: Claude Code

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL = 'notifications@apexaffinitygroup.com';

serve(async (req) => {
  try {
    const { record } = await req.json();

    if (!record) {
      return new Response('No record provided', { status: 400 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing notification: ${record.id}, type: ${record.type}`);

    // Get recipient details
    const { data: user } = await supabase
      .from('distributors')
      .select('email, first_name, last_name')
      .eq('id', record.user_id)
      .single();

    if (!user) {
      console.error(`User not found: ${record.user_id}`);
      return new Response('User not found', { status: 404 });
    }

    // Determine if email should be sent
    const emailTypes = [
      'commission_complete',
      'rank_promoted',
      'rank_eligible',
      'welcome',
    ];

    const shouldSendEmail = emailTypes.includes(record.type);

    if (shouldSendEmail) {
      await sendEmail(record, user);
    }

    // In-app notifications are handled by real-time subscription in the UI
    console.log(`Notification processed successfully: ${record.id}`);

    return new Response(
      JSON.stringify({ success: true, email_sent: shouldSendEmail }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Notification handler error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// =====================================================
// SEND EMAIL VIA RESEND
// =====================================================
async function sendEmail(notification: any, user: any) {
  const { type, title, message } = notification;
  const { email, first_name } = user;

  let subject: string;
  let htmlBody: string;

  switch (type) {
    case 'commission_complete':
      subject = `Your ${extractMonth(message)} Commission is Ready`;
      htmlBody = getCommissionCompleteTemplate(first_name, message);
      break;

    case 'rank_promoted':
      subject = 'Congratulations on Your Promotion!';
      htmlBody = getRankPromotedTemplate(first_name, message);
      break;

    case 'rank_eligible':
      subject = "You're Eligible for a Rank Promotion!";
      htmlBody = getRankEligibleTemplate(first_name, message);
      break;

    case 'welcome':
      subject = 'Welcome to Apex Affinity Group!';
      htmlBody = getWelcomeTemplate(first_name, message);
      break;

    default:
      console.log(`No email template for type: ${type}`);
      return;
  }

  // Send via Resend
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await response.json();
    console.log(`Email sent successfully to ${email}, ID: ${data.id}`);
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

// =====================================================
// EMAIL TEMPLATES
// =====================================================

function getEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #1B3A7D 0%, #0F2045 100%); padding: 40px 20px; text-align: center; }
    .logo { width: 60px; height: 60px; background: #C7181F; border-radius: 8px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(199, 24, 31, 0.3); }
    .logo-text { color: white; font-size: 28px; font-weight: bold; }
    .brand-name { color: white; font-size: 24px; font-weight: bold; margin-top: 8px; }
    .content { padding: 40px 20px; color: #0F2045; }
    .footer { background: #F8FAFC; padding: 30px 20px; text-align: center; color: #64748B; font-size: 14px; }
    .button { display: inline-block; padding: 14px 28px; background: #C7181F; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .divider { height: 1px; background: #E2E8F0; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <div class="logo-text">A</div>
      </div>
      <div class="brand-name">APEX AFFINITY GROUP</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>Apex Affinity Group</strong></p>
      <p>Building Financial Freedom Through Partnership</p>
      <div class="divider"></div>
      <p style="font-size: 12px; color: #94A3B8;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

function getCommissionCompleteTemplate(firstName: string, message: string): string {
  const content = `
    <h1 style="color: #0F2045; margin-bottom: 16px;">Your Commission is Ready!</h1>
    <p style="font-size: 16px; line-height: 1.6; color: #475569;">
      Hi ${firstName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #475569;">
      ${message}
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #475569;">
      Your payout will be processed within 3-5 business days.
    </p>
    <a href="https://portal.apexaffinitygroup.com/earnings" class="button">View Earnings</a>
    <div class="divider"></div>
    <p style="font-size: 14px; color: #64748B;">
      Questions? Contact your upline sponsor or our support team.
    </p>
  `;
  return getEmailTemplate(content);
}

function getRankPromotedTemplate(firstName: string, message: string): string {
  const content = `
    <h1 style="color: #C7181F; margin-bottom: 16px;">🎉 Congratulations!</h1>
    <p style="font-size: 16px; line-height: 1.6; color: #475569;">
      Hi ${firstName},
    </p>
    <p style="font-size: 18px; line-height: 1.6; color: #0F2045; font-weight: 600;">
      ${message}
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #475569;">
      Your new rank unlocks higher commissions, additional bonuses, and leadership opportunities.
    </p>
    <a href="https://portal.apexaffinitygroup.com/profile" class="button">View Your Profile</a>
    <div class="divider"></div>
    <p style="font-size: 14px; color: #64748B;">
      Keep building your legacy with Apex!
    </p>
  `;
  return getEmailTemplate(content);
}

function getRankEligibleTemplate(firstName: string, message: string): string {
  const content = `
    <h1 style="color: #1B3A7D; margin-bottom: 16px;">You're Ready for the Next Rank!</h1>
    <p style="font-size: 16px; line-height: 1.6; color: #475569;">
      Hi ${firstName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #0F2045; font-weight: 600;">
      ${message}
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #475569;">
      Your upline has been notified and will review your promotion shortly.
    </p>
    <a href="https://portal.apexaffinitygroup.com/dashboard" class="button">View Dashboard</a>
  `;
  return getEmailTemplate(content);
}

function getWelcomeTemplate(firstName: string, message: string): string {
  const content = `
    <h1 style="color: #0F2045; margin-bottom: 16px;">Welcome to Apex!</h1>
    <p style="font-size: 16px; line-height: 1.6; color: #475569;">
      Hi ${firstName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #475569;">
      ${message}
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #475569;">
      You now have access to:
    </p>
    <ul style="font-size: 16px; line-height: 1.8; color: #475569;">
      <li>Your distributor portal</li>
      <li>Product catalog and ordering</li>
      <li>Training resources</li>
      <li>Commission tracking</li>
    </ul>
    <a href="https://portal.apexaffinitygroup.com/login" class="button">Access Portal</a>
    <div class="divider"></div>
    <p style="font-size: 14px; color: #64748B;">
      Need help getting started? Check out our training center.
    </p>
  `;
  return getEmailTemplate(content);
}

// =====================================================
// HELPER: Extract month from message
// =====================================================
function extractMonth(message: string): string {
  const monthMatch = message.match(/(January|February|March|April|May|June|July|August|September|October|November|December)/);
  return monthMatch ? monthMatch[0] : '';
}
