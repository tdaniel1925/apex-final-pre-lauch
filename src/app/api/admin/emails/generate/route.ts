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
1. You MUST provide your response in TWO parts:
   - First: A conversational message explaining what you created
   - Second: The HTML content wrapped in \`\`\`html tags

2. Use professional, encouraging, and supportive tone
3. Keep emails concise and action-oriented
4. Use HTML formatting: <h2>, <p>, <strong>, <ul>, <li>, <a> tags
5. Use Apex brand color #2c5aa0 for accent elements
6. Include clear calls-to-action when appropriate
7. Always be respectful and motivating

RESPONSE FORMAT (you MUST follow this exactly):

I've created an email for you! [explain what you created]

**Subject:** [the subject line]

[Any additional conversational text about the email]

\`\`\`html
<p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
  Hi there,
</p>

<h2 style="color: #2c5aa0; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">
  [Heading]
</h2>

<p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
  [Content]
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
</p>
\`\`\`

Template structure guidelines:
- Use inline styles for all elements
- Use <h2> for main headings with color: #2c5aa0
- Use <p> for paragraphs with color: #1f2937, line-height: 1.6
- Use tables for buttons and special sections
- Always include proper spacing with margin properties`;

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

    // Extract subject line (look for **Subject:** pattern)
    let emailSubject = '';
    const subjectMatch = aiResponse.match(/\*\*Subject:\*\*\s*(.+?)(?:\n|$)/i);
    if (subjectMatch) {
      emailSubject = subjectMatch[1].trim();
    }

    // Extract HTML content from markdown code block
    let emailContent = '';
    const htmlMatch = aiResponse.match(/```html\n([\s\S]*?)\n```/);

    if (htmlMatch) {
      emailContent = htmlMatch[1].trim();
    } else {
      // Fallback: Create basic HTML from user message
      emailContent = `
<p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
  Hi there,
</p>

<h2 style="color: #2c5aa0; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">
  ${emailSubject || 'Update from Apex'}
</h2>

<p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
  ${userMessage}
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

    // Clean the AI response for display (remove HTML code block)
    const cleanResponse = aiResponse.replace(/```html\n[\s\S]*?\n```/, '[HTML email content generated]').trim();

    return NextResponse.json({
      success: true,
      aiResponse: cleanResponse || aiResponse,
      emailSubject: emailSubject || 'Update from Apex',
      emailContent: fullEmail,
    });
  } catch (error) {
    console.error('Error generating email:', error);

    // Return more detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Detailed error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate email',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
