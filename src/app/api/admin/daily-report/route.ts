import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/resend';
import fs from 'fs/promises';
import path from 'path';

interface DailyReportData {
  report_date: string;
  new_signups_count: number;
  total_reps: number;
  test_reps_count: number;
  week_growth: string;
  week_growth_color: string;
  mtd_signups: number;
  top_state: string;
  has_signups: boolean;
  signups: Array<{
    name: string;
    email: string;
    phone: string | null;
    sponsor_name: string;
    signup_time: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    // Verify this is an authorized request (could add API key check here)
    const supabase = await createClient();

    // Get test mode from query param
    const { searchParams } = new URL(request.url);
    const testMode = searchParams.get('test') === 'true';

    // Calculate date range for "yesterday" (previous day)
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const yesterdayStart = yesterday.toISOString();
    const yesterdayEndStr = yesterdayEnd.toISOString();

    // Get new signups from yesterday
    const { data: newSignups, error: signupsError } = await supabase
      .from('distributors')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        created_at,
        sponsor:sponsor_id(first_name, last_name)
      `)
      .gte('created_at', yesterdayStart)
      .lte('created_at', yesterdayEndStr)
      .order('created_at', { ascending: false });

    if (signupsError) {
      console.error('Error fetching signups:', signupsError);
      return NextResponse.json({ error: 'Failed to fetch signups', details: signupsError }, { status: 500 });
    }

    // Get total distributor count
    const { count: totalReps, error: countError } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching total reps:', countError);
    }

    // Count test users (users with 'test', 'demo', or 'dummy' in their name/email)
    const { count: testReps } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .or('first_name.ilike.%test%,last_name.ilike.%test%,email.ilike.%test%,first_name.ilike.%dummy%,last_name.ilike.%dummy%,first_name.ilike.%demo%,last_name.ilike.%demo%');

    // Calculate week-over-week growth
    const oneWeekAgo = new Date(yesterday);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(oneWeekAgo);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);

    const { count: lastWeekSignups } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString())
      .lt('created_at', yesterdayStart);

    const { count: previousWeekSignups } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', twoWeeksAgo.toISOString())
      .lt('created_at', oneWeekAgo.toISOString());

    const weekGrowth = lastWeekSignups! - previousWeekSignups!;
    const weekGrowthPercent = previousWeekSignups! > 0
      ? ((weekGrowth / previousWeekSignups!) * 100).toFixed(0)
      : '0';
    const weekGrowthDisplay = weekGrowth >= 0 ? `+${weekGrowthPercent}%` : `${weekGrowthPercent}%`;
    const weekGrowthColor = weekGrowth >= 0 ? '#28a745' : '#dc3545';

    // Calculate month-to-date signups
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const { count: mtdSignups } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstOfMonth.toISOString());

    // Get geographic breakdown (top state)
    const { data: stateData } = await supabase
      .from('distributors')
      .select('state')
      .not('state', 'is', null);

    const stateCounts: Record<string, number> = {};
    stateData?.forEach((row) => {
      if (row.state) {
        stateCounts[row.state] = (stateCounts[row.state] || 0) + 1;
      }
    });

    const topState = Object.entries(stateCounts).sort((a, b) => b[1] - a[1])[0];
    const topStateDisplay = topState ? `${topState[0]} (${topState[1]} reps)` : 'N/A';

    // Format signup data for template
    const formattedSignups = (newSignups || []).map((signup) => {
      // Handle sponsor - Supabase returns it as an array for foreign key joins
      const sponsor = Array.isArray(signup.sponsor) ? signup.sponsor[0] : signup.sponsor;

      return {
        name: `${signup.first_name} ${signup.last_name}`,
        email: signup.email || 'No email',
        phone: signup.phone,
        sponsor_name: sponsor
          ? `${sponsor.first_name} ${sponsor.last_name}`
          : 'Direct',
        signup_time: new Date(signup.created_at).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
      };
    });

    // Build report data
    const reportData: DailyReportData = {
      report_date: yesterday.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      new_signups_count: newSignups?.length || 0,
      total_reps: totalReps || 0,
      test_reps_count: testReps || 0,
      week_growth: weekGrowthDisplay,
      week_growth_color: weekGrowthColor,
      mtd_signups: mtdSignups || 0,
      top_state: topStateDisplay,
      has_signups: (newSignups?.length || 0) > 0,
      signups: formattedSignups,
    };

    // Load and compile email template
    const templatePath = path.join(process.cwd(), 'src/lib/email/templates/daily-signup-report.html');
    let emailHtml = await fs.readFile(templatePath, 'utf-8');

    // Replace template variables
    emailHtml = emailHtml.replace(/{{report_date}}/g, reportData.report_date);
    emailHtml = emailHtml.replace(/{{new_signups_count}}/g, reportData.new_signups_count.toString());
    emailHtml = emailHtml.replace(/{{total_reps}}/g, reportData.total_reps.toString());
    emailHtml = emailHtml.replace(/{{test_reps_count}}/g, reportData.test_reps_count.toString());
    emailHtml = emailHtml.replace(/{{week_growth}}/g, reportData.week_growth);
    emailHtml = emailHtml.replace(/{{week_growth_color}}/g, reportData.week_growth_color);
    emailHtml = emailHtml.replace(/{{mtd_signups}}/g, reportData.mtd_signups.toString());
    emailHtml = emailHtml.replace(/{{top_state}}/g, reportData.top_state);

    // Handle signups table
    if (reportData.has_signups) {
      let signupsTableRows = '';
      reportData.signups.forEach((signup) => {
        const phoneRow = signup.phone ? `<div style="font-size: 12px; color: #6c757d;">${signup.phone}</div>` : '';
        signupsTableRows += `
          <tr style="border-bottom: 1px solid #f1f3f5;">
            <td style="padding: 12px;">
              <div style="font-size: 14px; color: #212529; font-weight: 500; margin-bottom: 2px;">${signup.name}</div>
              <div style="font-size: 12px; color: #6c757d;">${signup.email}</div>
              ${phoneRow}
            </td>
            <td style="padding: 12px; font-size: 14px; color: #495057;">${signup.sponsor_name}</td>
            <td style="padding: 12px; font-size: 13px; color: #6c757d;">${signup.signup_time}</td>
          </tr>
        `;
      });

      emailHtml = emailHtml.replace(/{{#if has_signups}}[\s\S]*?{{#each signups}}[\s\S]*?{{\/each}}[\s\S]*?{{else}}[\s\S]*?{{\/if}}/g, (match) => {
        return match
          .replace(/{{#if has_signups}}/, '')
          .replace(/{{else}}[\s\S]*?{{\/if}}/, '')
          .replace(/{{#each signups}}[\s\S]*?{{\/each}}/, signupsTableRows);
      });
    } else {
      // Show "no signups" message
      emailHtml = emailHtml.replace(/{{#if has_signups}}[\s\S]*?{{else}}([\s\S]*?){{\/if}}/g, '$1');
    }

    // Determine recipients
    const recipients = testMode
      ? ['tdaniel@botmakers.ai']
      : [
          'bill.propper@3mark.com',
          'johnathon.bunch@3mark.com',
          'darrell.wolfe@3mark.com',
          'russell.katz@3mark.com',
          'brayna.propper@3mark.com',
          'davidr@3mark.com',
          'betsyr@3mark.com',
          'tdaniel@botmakers.ai',
        ];

    // Send email
    const result = await sendEmail({
      to: recipients,
      from: 'Apex Affinity Group <theapex@theapexway.net>',
      subject: `Daily Distributor Signup Report - ${reportData.report_date}`,
      html: emailHtml,
    });

    if (!result.success) {
      console.error('Error sending email:', result.error);
      return NextResponse.json({ error: 'Failed to send email', details: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: testMode ? 'Test email sent successfully' : 'Report sent successfully',
      report_data: reportData,
      email_id: result.id,
    });
  } catch (error) {
    console.error('Error generating daily report:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
