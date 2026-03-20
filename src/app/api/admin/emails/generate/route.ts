import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminContext = await getAdminUser();
    if (!adminContext) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userMessage, conversationHistory } = body;

    if (!userMessage) {
      return NextResponse.json({ success: false, error: 'User message required' }, { status: 400 });
    }

    // Load the Apex email template
    const templatePath = path.join(process.cwd(), 'src', 'lib', 'email', 'templates', 'base-email.html');
    let emailTemplate = '';

    try {
      emailTemplate = fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      console.error('Error loading email template:', error);
      // Use a basic fallback template
      emailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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

    // Build conversation for Claude
    const systemPrompt = `You are an AI email assistant for Apex Affinity Group, a network marketing company. Your job is to help admins create professional emails to send to their distributors.

IMPORTANT RULES:
1. Generate ONLY the email content HTML (the body text) - NOT the full template
2. Use professional, encouraging, and supportive tone
3. Keep emails concise and action-oriented
4. Use HTML formatting: <h2>, <p>, <strong>, <ul>, <li>, <a> tags
5. Use Apex brand color #2c5aa0 for accent elements
6. Include clear calls-to-action when appropriate
7. Always be respectful and motivating

The user will describe what they want the email to say. You should:
1. Create appropriate email content based on their description
2. Suggest a subject line
3. Respond conversationally to confirm what you created

Template structure:
- Use <h2> for main headings (color: #2c5aa0)
- Use <p> for paragraphs (color: #1f2937, line-height: 1.6)
- Use tables for special sections like boxes or highlights
- Keep styling inline for email compatibility

Example response format:
"I've created an email for you! Here's what I came up with:

**Subject:** [subject line]

The email thanks everyone for attending the training and reminds them to check their back office daily. I've included a clear call-to-action button to log in and update their phone number.

Would you like me to adjust anything?"`;

    // Convert conversation history to Claude format
    const messages = conversationHistory.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add the new user message
    messages.push({
      role: 'user',
      content: userMessage,
    });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      system: systemPrompt,
      messages,
    });

    const aiResponse = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract subject line if present (look for **Subject:** pattern)
    let emailSubject = '';
    const subjectMatch = aiResponse.match(/\*\*Subject:\*\*\s*(.+?)(?:\n|$)/i);
    if (subjectMatch) {
      emailSubject = subjectMatch[1].trim();
    }

    // Generate HTML content
    // For now, we'll use a simple conversion. In production, you might want more sophisticated HTML generation
    let emailContent = '';

    // Try to extract HTML content if Claude provided it
    const htmlMatch = aiResponse.match(/<html[\s\S]*<\/html>/i);
    if (htmlMatch) {
      emailContent = htmlMatch[0];
    } else {
      // Convert plain text response to basic HTML
      const contentWithoutSubject = aiResponse.replace(/\*\*Subject:\*\*\s*(.+?)(?:\n|$)/i, '').trim();

      // Basic HTML generation from the description
      // This is a simplified version - in production you'd want Claude to generate the actual HTML
      emailContent = `
<p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
  Hi there,
</p>

<h2 style="color: #2c5aa0; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">
  ${emailSubject || 'Update from Apex'}
</h2>

<p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
  ${contentWithoutSubject || userMessage}
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
  <tr>
    <td align="center" style="padding: 20px 0;">
      <a href="https://reachtheapex.net/login" style="display: inline-block; background-color: #2c5aa0; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600;">
        Log Into Your Back Office
      </a>
    </td>
  </tr>
</table>

<p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0;">
  Keep building!
</p>

<p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
  <strong>The Apex Team</strong>
</p>`;
    }

    // Wrap content in template
    const fullEmail = emailTemplate.replace('{{CONTENT}}', emailContent);

    return NextResponse.json({
      success: true,
      aiResponse,
      emailSubject: emailSubject || 'Update from Apex',
      emailContent: fullEmail,
    });
  } catch (error) {
    console.error('Error generating email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate email' },
      { status: 500 }
    );
  }
}
