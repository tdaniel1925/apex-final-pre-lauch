// =============================================
// AI Email Generation API
// POST /api/admin/email-templates/generate
// Uses Claude API to generate email templates
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAvailableVariables } from '@/lib/email/template-variables';
import type { ApiResponse } from '@/lib/types';
import type { AIEmailGenerationRequest, AIEmailGenerationResponse } from '@/lib/types/email';

/**
 * POST /api/admin/email-templates/generate
 *
 * Generate email template using AI
 *
 * Body:
 *   - prompt: string - Description of what email to generate
 *   - licensing_status: 'licensed' | 'non_licensed' | 'all'
 *   - sequence_order?: number - Position in sequence (optional)
 *   - context?: string - Additional context (optional)
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in',
        } as ApiResponse,
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: admin } = await supabase
      .from('distributors')
      .select('is_master')
      .eq('auth_user_id', user.id)
      .single();

    if (!admin || !admin.is_master) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to perform this action',
        } as ApiResponse,
        { status: 403 }
      );
    }

    const body: AIEmailGenerationRequest = await request.json();
    const { prompt, licensing_status, sequence_order, context } = body;

    if (!prompt || !licensing_status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'Prompt and licensing_status are required',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Get available variables
    const variables = getAvailableVariables();
    const variableList = variables.map((v) => `- {${v.key}} - ${v.description}`).join('\n');

    // Build Claude API prompt
    const systemPrompt = `You are an expert email marketing copywriter for Apex Affinity Group, a professional insurance distribution network. Your task is to create engaging, professional nurture campaign emails that build trust and drive engagement.

Company Background:
- Apex Affinity Group helps insurance professionals and distributors build successful businesses
- We have two types of users: Licensed Insurance Agents and Non-Licensed Distributors
- Licensed agents can sell insurance and access advanced tools
- Non-licensed distributors focus on team building and referrals
- Our brand voice is: Professional, supportive, empowering, action-oriented

Your task: Generate a complete email template based on the user's description.`;

    const userPrompt = `Generate an email template for the following:

**Description:** ${prompt}

**Target Audience:** ${licensing_status === 'licensed' ? 'Licensed Insurance Agents' : licensing_status === 'non_licensed' ? 'Non-Licensed Distributors' : 'All Users'}

${sequence_order !== undefined ? `**Position in Sequence:** Email #${sequence_order} (${sequence_order === 0 ? 'Welcome email sent immediately' : `Sent ${sequence_order * 3} days after signup`})` : ''}

${context ? `**Additional Context:** ${context}` : ''}

**Available Personalization Variables (use these where appropriate):**
${variableList}

**Requirements:**
1. Create an engaging, concise subject line (under 60 characters)
2. Write email body in clean, mobile-friendly HTML
3. Use personalization variables appropriately (especially {first_name})
4. Include a clear call-to-action with a link
5. Keep email under 300 words
6. Professional but warm and encouraging tone
7. Add a preview text (1 sentence summary shown in inbox preview)
8. Focus on value and next steps

**Return Format:** JSON object with this structure:
{
  "subject": "Engaging subject line with {first_name} if appropriate",
  "preview_text": "One sentence preview text",
  "body": "Full HTML email body with inline styles",
  "variables_used": ["first_name", "dashboard_link", etc.],
  "reasoning": "Brief explanation of why you made these choices"
}

**HTML Styling Guidelines:**
- Use inline styles (no external CSS)
- Max width: 600px
- Font: Arial, sans-serif
- Primary color: #2B4C7E (Apex blue)
- Use <h2> for main heading, <h3> for subheadings
- Add 15-20px padding/margin for spacing
- Style links as buttons with background: #2B4C7E, white text, padding
- Make it mobile-responsive

Generate the email now:`;

    // Call Claude API
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration error',
          message: 'AI service not configured. Please add ANTHROPIC_API_KEY to environment variables.',
        } as ApiResponse,
        { status: 500 }
      );
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Claude API error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'AI generation failed',
          message: 'Failed to generate email template',
        } as ApiResponse,
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    // Parse JSON response from Claude
    let generated: AIEmailGenerationResponse;
    try {
      // Extract JSON from response (Claude sometimes wraps it in markdown)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }
      generated = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      return NextResponse.json(
        {
          success: false,
          error: 'Parse error',
          message: 'Failed to parse AI-generated email',
        } as ApiResponse,
        { status: 500 }
      );
    }

    // Return generated email
    return NextResponse.json(
      {
        success: true,
        data: generated,
        message: 'Email template generated successfully',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('AI generation API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
