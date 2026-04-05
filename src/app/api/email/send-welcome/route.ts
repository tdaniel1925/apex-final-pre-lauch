// =============================================
// Send Welcome Email API Route (for n8n)
// POST /api/email/send-welcome
// Called by n8n workflow after distributor signup
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendEmail } from '@/lib/email/resend';
import { renderEmailTemplate } from '@/lib/email/template-variables';
import type { Distributor } from '@/lib/types';

/**
 * POST /api/email/send-welcome
 *
 * Sends welcome email to new distributor
 * Called by n8n "New Distributor Onboarding" workflow
 *
 * Body:
 *   - distributorId: string (UUID)
 *   - email: string
 *   - firstName: string
 *   - lastName: string
 *   - licensingStatus: 'licensed' | 'non_licensed'
 *
 * Response:
 *   - success: boolean
 *   - message: string
 *   - emailId?: string (Resend email ID)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { distributorId, email, firstName, lastName, licensingStatus } = body;

    // Validate required fields
    if (!distributorId || !email || !firstName || !lastName || !licensingStatus) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: distributorId, email, firstName, lastName, licensingStatus',
        },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Get full distributor data
    const { data: distributor, error: distError } = await serviceClient
      .from('distributors')
      .select('*')
      .eq('id', distributorId)
      .single();

    if (distError || !distributor) {
      console.error('Distributor not found:', distError);
      return NextResponse.json(
        { success: false, error: 'Distributor not found' },
        { status: 404 }
      );
    }

    // Simple welcome email (no campaign tracking for now)
    const subject = `Welcome to Apex Affinity Group, ${firstName}!`;
    const body = `
      <h1>Welcome to Apex Affinity Group!</h1>
      <p>Hi ${firstName},</p>
      <p>Thank you for joining Apex Affinity Group. We're excited to have you on board!</p>
      <p><strong>Your Account Details:</strong></p>
      <ul>
        <li>Name: ${firstName} ${lastName}</li>
        <li>Email: ${email}</li>
        <li>Status: ${licensingStatus}</li>
        <li>Replicated Site: https://reachtheapex.net/${distributor.slug}</li>
      </ul>
      <p>Get started by logging in to your dashboard:</p>
      <p><a href="https://reachtheapex.net/dashboard">Go to Dashboard</a></p>
      <p>Best regards,<br>The Apex Team</p>
    `;

    const rendered = { subject, body };

    // Send email via Resend
    const result = await sendEmail({
      to: distributor.email,
      subject: rendered.subject,
      html: rendered.body,
      from: 'Apex Affinity Group <theapex@theapexway.net>',
    });

    if (result.error) {
      console.error('Failed to send welcome email:', result.error);
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Simple logging (no campaign tracking for now)

    console.log(`✅ Welcome email sent to ${distributor.email} (${result.id})`);

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
      emailId: result.id,
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
