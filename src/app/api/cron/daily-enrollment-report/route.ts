// =============================================
// Daily Enrollment Report Cron
// Sends enrollment statistics to Apex executives
// Triggered daily at 6:00 AM via Vercel Cron
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/resend';
import { readFileSync } from 'fs';
import { join } from 'path';

// Executive email list
const EXECUTIVE_EMAILS = [
  'bill.propper@3mark.com',
  'betsyr@3mark.com',
  'david.royse@3mark.com',
  'darrell.wolfe@3mark.com',
  'johnathon.bunch@3mark.com',
  'russell.katz@3mark.com',
  'tdaniel@botmakers.ai',
];

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get current date info
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get enrollments for different time periods (excluding test distributors)
    const { data: last24h, count: count24h } = await supabase
      .from('distributors')
      .select('first_name, last_name, email, created_at', { count: 'exact' })
      .gte('created_at', yesterday.toISOString())
      .not('email', 'like', '%test%')
      .not('email', 'like', '%demo%')
      .not('email', 'like', '%dummy%')
      .not('first_name', 'ilike', '%test%')
      .not('last_name', 'ilike', '%test%')
      .order('created_at', { ascending: false });

    const { count: count7days } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastWeekStart.toISOString())
      .not('email', 'like', '%test%')
      .not('email', 'like', '%demo%')
      .not('email', 'like', '%dummy%')
      .not('first_name', 'ilike', '%test%')
      .not('last_name', 'ilike', '%test%');

    const { count: count30days } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastMonthStart.toISOString())
      .not('email', 'like', '%test%')
      .not('email', 'like', '%demo%')
      .not('email', 'like', '%dummy%')
      .not('first_name', 'ilike', '%test%')
      .not('last_name', 'ilike', '%test%');

    const { count: totalCount } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .not('email', 'like', '%test%')
      .not('email', 'like', '%demo%')
      .not('email', 'like', '%dummy%')
      .not('first_name', 'ilike', '%test%')
      .not('last_name', 'ilike', '%test%');

    // Calculate growth rate (7-day average)
    const avgDailyLast7Days = count7days ? (count7days / 7).toFixed(1) : '0';

    // Build enrollees list HTML
    let enrolleesHtml = '';
    if (last24h && last24h.length > 0) {
      enrolleesHtml = last24h
        .map((person) => {
          const enrolledDate = new Date(person.created_at);
          const hoursAgo = Math.floor((now.getTime() - enrolledDate.getTime()) / (1000 * 60 * 60));
          const timeStr = hoursAgo === 0 ? 'Just now' : `${hoursAgo}h ago`;

          return `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                <strong style="color: #1f2937;">${person.first_name} ${person.last_name}</strong>
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">
                ${person.email || 'N/A'}
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; text-align: right;">
                ${timeStr}
              </td>
            </tr>
          `;
        })
        .join('');
    } else {
      enrolleesHtml = `
        <tr>
          <td colspan="3" style="padding: 24px; text-align: center; color: #9ca3af;">
            No enrollments in the last 24 hours
          </td>
        </tr>
      `;
    }

    // Load base email template
    const baseTemplatePath = join(process.cwd(), 'src/lib/email/templates/base-email-template.html');
    const baseTemplate = readFileSync(baseTemplatePath, 'utf-8');

    // Create email content
    const emailContent = `
      <div style="padding: 32px 0;">
        <!-- Header -->
        <div style="margin-bottom: 32px;">
          <h1 style="font-size: 28px; font-weight: bold; color: #1f2937; margin: 0 0 8px 0;">
            Daily Enrollment Report
          </h1>
          <p style="color: #6b7280; margin: 0;">
            ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <!-- Stats Grid -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px;">
          <!-- Last 24 Hours -->
          <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px;">
            <div style="font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
              Last 24 Hours
            </div>
            <div style="font-size: 36px; font-weight: bold; color: #2c5aa0;">
              ${count24h || 0}
            </div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">
              New Enrollments
            </div>
          </div>

          <!-- Last 7 Days -->
          <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px;">
            <div style="font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
              Last 7 Days
            </div>
            <div style="font-size: 36px; font-weight: bold; color: #2c5aa0;">
              ${count7days || 0}
            </div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">
              ${avgDailyLast7Days}/day avg
            </div>
          </div>

          <!-- Last 30 Days -->
          <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px;">
            <div style="font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
              Last 30 Days
            </div>
            <div style="font-size: 36px; font-weight: bold; color: #2c5aa0;">
              ${count30days || 0}
            </div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">
              Rolling Month
            </div>
          </div>

          <!-- Total -->
          <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px;">
            <div style="font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
              Total Members
            </div>
            <div style="font-size: 36px; font-weight: bold; color: #2c5aa0;">
              ${totalCount || 0}
            </div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">
              All Time
            </div>
          </div>
        </div>

        <!-- Recent Enrollees Table -->
        <div style="margin-top: 32px;">
          <h2 style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 0 0 16px 0;">
            Recent Enrollments (Last 24 Hours)
          </h2>
          <table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e5e7eb;">
                  Name
                </th>
                <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e5e7eb;">
                  Email
                </th>
                <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e5e7eb;">
                  Enrolled
                </th>
              </tr>
            </thead>
            <tbody>
              ${enrolleesHtml}
            </tbody>
          </table>
        </div>

        <!-- Footer Note -->
        <div style="margin-top: 32px; padding: 16px; background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; color: #1e40af;">
            <strong>📊 Report Details:</strong> This report is automatically generated daily at 6:00 AM CST.
            Data includes all distributor enrollments tracked in the Apex system.
          </p>
        </div>
      </div>
    `;

    // Merge with base template
    const finalHtml = baseTemplate.replace('{{email_content}}', emailContent);

    // Send email to all executives
    const emailResults = await Promise.all(
      EXECUTIVE_EMAILS.map((email) =>
        sendEmail({
          to: email,
          subject: `Daily Enrollment Report - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
          html: finalHtml,
        })
      )
    );

    // Check for failures
    const failures = emailResults.filter((result) => result.error);
    if (failures.length > 0) {
      console.error('Some emails failed to send:', failures);
    }

    return NextResponse.json({
      success: true,
      report: {
        date: now.toISOString(),
        enrollments: {
          last24h: count24h || 0,
          last7days: count7days || 0,
          last30days: count30days || 0,
          total: totalCount || 0,
        },
        emailsSent: emailResults.filter((r) => !r.error).length,
        emailsFailed: failures.length,
      },
    });
  } catch (error) {
    console.error('Error generating daily enrollment report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
