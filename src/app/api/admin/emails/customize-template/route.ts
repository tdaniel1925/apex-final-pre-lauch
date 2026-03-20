import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import Anthropic from '@anthropic-ai/sdk';

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
    const { userMessage, conversationHistory, currentTemplate } = body;

    if (!userMessage) {
      return NextResponse.json({ success: false, error: 'User message required' }, { status: 400 });
    }

    // Build conversation for Claude
    const systemPrompt = `You are an AI email template designer for Apex Affinity Group. Your job is to help admins customize their HTML email template.

IMPORTANT RULES:
1. You are modifying an HTML email template
2. Maintain professional email-compatible HTML (tables, inline styles)
3. Use Apex brand color #2c5aa0 as the primary brand color
4. Keep the template mobile-responsive
5. Always include the Apex logo: https://theapexway.net/apex-logo-full.png
6. Keep footer with company info
7. Use inline CSS for email compatibility
8. Test-safe HTML (avoid complex CSS, JavaScript, or modern features)

When the user asks to change something:
1. Modify the HTML template accordingly
2. Explain what you changed in a conversational way
3. Return the FULL updated HTML template

Current template:
\`\`\`html
${currentTemplate || 'No template loaded yet'}
\`\`\`

The user will describe what they want to change. You should:
1. Make the requested changes to the HTML
2. Return the complete updated template wrapped in \`\`\`html tags
3. Explain conversationally what you changed`;

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
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4000,
      system: systemPrompt,
      messages,
    });

    const aiResponse = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract updated HTML template from response
    let updatedTemplate = currentTemplate;
    const htmlMatch = aiResponse.match(/```html\n([\s\S]*?)\n```/);

    if (htmlMatch) {
      updatedTemplate = htmlMatch[1].trim();
    }

    // Remove the HTML code block from the response for cleaner chat display
    const cleanResponse = aiResponse.replace(/```html\n[\s\S]*?\n```/, '').trim();

    return NextResponse.json({
      success: true,
      aiResponse: cleanResponse || aiResponse,
      updatedTemplate,
    });
  } catch (error) {
    console.error('Error customizing template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to customize template' },
      { status: 500 }
    );
  }
}
