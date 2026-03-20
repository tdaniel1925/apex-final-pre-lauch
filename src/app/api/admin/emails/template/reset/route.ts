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
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                    <tr>
                        <td style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #2c5aa0;">
                            <img src="https://theapexway.net/apex-logo-full.png" alt="Apex Affinity Group" style="max-width: 300px; height: auto;" />
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            {{CONTENT}}
                        </td>
                    </tr>
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

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminContext = await getAdminUser();
    if (!adminContext) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Delete custom template from database
    await supabase
      .from('email_templates')
      .delete()
      .eq('template_name', 'default');

    return NextResponse.json({
      success: true,
      template: getDefaultTemplate(),
      message: 'Template reset to default',
    });
  } catch (error) {
    console.error('Error resetting template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset template' },
      { status: 500 }
    );
  }
}
