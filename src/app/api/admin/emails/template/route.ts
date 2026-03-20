import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import fs from 'fs';
import path from 'path';

// Default Apex email template
const getDefaultTemplate = (): string => {
  const templatePath = path.join(process.cwd(), 'thank-you-training-email.html');

  try {
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error('Error loading default template:', error);
    // Return basic fallback
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Apex Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #2c5aa0;">
                            <img src="https://theapexway.net/apex-logo-full.png" alt="Apex Affinity Group" style="max-width: 300px; height: auto;" />
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            {{CONTENT}}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">
                                <strong>Apex Affinity Group</strong>
                            </p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                AI-Powered Lead Autopilot | theapexway.net
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
  }
};

// GET - Fetch current email template
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminContext = await getAdminUser();
    if (!adminContext) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Try to get custom template from database
    const { data: customTemplate, error } = await supabase
      .from('email_templates')
      .select('template_html')
      .eq('template_name', 'default')
      .single();

    if (error || !customTemplate) {
      // Return default template if no custom template exists
      return NextResponse.json({
        success: true,
        template: getDefaultTemplate(),
        isCustom: false,
      });
    }

    return NextResponse.json({
      success: true,
      template: customTemplate.template_html,
      isCustom: true,
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// PUT - Save customized email template
export async function PUT(request: NextRequest) {
  try {
    // Check admin authentication
    const adminContext = await getAdminUser();
    if (!adminContext) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { template, adminId } = body;

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Upsert the template
    const { error } = await supabase
      .from('email_templates')
      .upsert({
        template_name: 'default',
        template_html: template,
        updated_by: adminId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'template_name',
      });

    if (error) {
      console.error('Error saving template:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Template saved successfully',
    });
  } catch (error) {
    console.error('Error saving template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save template' },
      { status: 500 }
    );
  }
}
