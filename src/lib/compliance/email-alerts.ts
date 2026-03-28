/**
 * Compliance Email Alerts
 *
 * Sends email notifications for FTC compliance violations:
 * - 70% retail customer warning
 * - Anti-frontloading notice
 * - Monthly compliance reports
 *
 * @module lib/compliance/email-alerts
 */

import { promises as fs } from 'fs';
import path from 'path';
import { sendEmail } from '@/lib/email/resend';

const TEMPLATES_DIR = path.join(process.cwd(), 'src/lib/email/templates');

/**
 * Send retail compliance warning email
 *
 * Sent when distributor falls below 70% retail requirement
 */
export async function sendRetailComplianceWarning(params: {
  distributor_email: string;
  distributor_name: string;
  retail_percentage: number;
  retail_bv: number;
  self_purchase_bv: number;
  total_bv: number;
  shortfall_bv: number;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    // Load template
    const templatePath = path.join(TEMPLATES_DIR, 'compliance-retail-warning.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    // Replace variables
    template = template.replace(/{{distributor_name}}/g, params.distributor_name);
    template = template.replace(/{{retail_percentage}}/g, params.retail_percentage.toFixed(1));
    template = template.replace(/{{retail_bv}}/g, params.retail_bv.toString());
    template = template.replace(/{{self_purchase_bv}}/g, params.self_purchase_bv.toString());
    template = template.replace(/{{total_bv}}/g, params.total_bv.toString());
    template = template.replace(/{{shortfall_bv}}/g, Math.round(params.shortfall_bv).toString());
    template = template.replace(
      /{{dashboard_url}}/g,
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://theapexway.net'}/dashboard`
    );
    template = template.replace(/{{year}}/g, new Date().getFullYear().toString());

    // Send email
    const result = await sendEmail({
      to: params.distributor_email,
      subject: '⚠️ Action Required: Retail Sales Compliance',
      html: template,
    });

    return result;
  } catch (error: any) {
    console.error('Error sending retail compliance warning:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

/**
 * Send anti-frontloading notice email
 *
 * Sent when distributor makes 2nd+ purchase of same product in a month
 */
export async function sendFrontloadingNotice(params: {
  distributor_email: string;
  distributor_name: string;
  product_name: string;
  purchase_number: number;
  bv_amount: number;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    // Load template
    const templatePath = path.join(TEMPLATES_DIR, 'compliance-frontloading-notice.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    // Replace variables
    template = template.replace(/{{distributor_name}}/g, params.distributor_name);
    template = template.replace(/{{product_name}}/g, params.product_name);
    template = template.replace(/{{purchase_number}}/g, params.purchase_number.toString());
    template = template.replace(/{{bv_amount}}/g, params.bv_amount.toString());
    template = template.replace(
      /{{dashboard_url}}/g,
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://theapexway.net'}/dashboard`
    );
    template = template.replace(/{{year}}/g, new Date().getFullYear().toString());

    // Send email
    const result = await sendEmail({
      to: params.distributor_email,
      subject: 'ℹ️ Purchase Limit Notice - Anti-Frontloading Rule',
      html: template,
    });

    return result;
  } catch (error: any) {
    console.error('Error sending frontloading notice:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

/**
 * Send monthly compliance report to distributor
 *
 * Summary of their compliance status for the month
 */
export async function sendMonthlyComplianceReport(params: {
  distributor_email: string;
  distributor_name: string;
  retail_percentage: number;
  total_bv: number;
  compliant: boolean;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const subject = params.compliant
      ? '✅ Monthly Compliance Report - Compliant'
      : '⚠️ Monthly Compliance Report - Action Required';

    const statusColor = params.compliant ? '#28a745' : '#dc3545';
    const statusText = params.compliant ? 'Compliant' : 'Non-Compliant';

    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px;">
    <h1 style="color: #2c5aa0; margin-bottom: 20px;">Monthly Compliance Report</h1>

    <p>Dear ${params.distributor_name},</p>

    <p>Here's your compliance status for this month:</p>

    <div style="background-color: #f8f9fa; border-left: 4px solid ${statusColor}; padding: 20px; margin: 20px 0;">
      <h2 style="margin: 0 0 10px 0; color: ${statusColor};">${statusText}</h2>
      <p style="margin: 0; color: #212529;">
        <strong>Retail Percentage:</strong> ${params.retail_percentage.toFixed(1)}%<br>
        <strong>Total BV:</strong> ${params.total_bv}<br>
        <strong>Required:</strong> 70% retail
      </p>
    </div>

    ${
      params.compliant
        ? '<p>Great work! You met the 70% retail customer requirement this month and qualify for override commissions.</p>'
        : '<p><strong>Action Required:</strong> Focus on retail customer sales next month to reach the 70% requirement and qualify for overrides.</p>'
    }

    <p style="margin-top: 30px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://theapexway.net'}/dashboard"
         style="display: inline-block; padding: 12px 24px; background-color: #2c5aa0; color: #ffffff; text-decoration: none; border-radius: 4px;">
        View Dashboard
      </a>
    </p>

    <p style="color: #6c757d; font-size: 12px; margin-top: 30px;">
      © ${new Date().getFullYear()} The Apex Way. All rights reserved.
    </p>
  </div>
</body>
</html>
    `;

    const result = await sendEmail({
      to: params.distributor_email,
      subject,
      html,
    });

    return result;
  } catch (error: any) {
    console.error('Error sending monthly compliance report:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

/**
 * Send batch compliance warnings to all non-compliant distributors
 *
 * Use for monthly compliance check runs
 */
export async function sendBatchComplianceWarnings(
  distributors: Array<{
    distributor_email: string;
    distributor_name: string;
    retail_percentage: number;
    retail_bv: number;
    self_purchase_bv: number;
    total_bv: number;
    shortfall_bv: number;
  }>
): Promise<{
  total: number;
  sent: number;
  failed: number;
  errors: string[];
}> {
  const results = {
    total: distributors.length,
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const distributor of distributors) {
    const result = await sendRetailComplianceWarning(distributor);

    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
      results.errors.push(`${distributor.distributor_email}: ${result.error}`);
    }

    // Rate limit: Wait 100ms between emails
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}

export default {
  sendRetailComplianceWarning,
  sendFrontloadingNotice,
  sendMonthlyComplianceReport,
  sendBatchComplianceWarnings,
};
