// =============================================
// POST /api/apps/nurture/generate
// OpenAI GPT-4o-mini generates a personalized
// nurture email sequence for a given prospect
// =============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface GeneratedEmail {
  subject: string;
  body: string;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { prospectName, prospectEmail, product, context, emailCount } = await req.json() as {
      prospectName: string;
      prospectEmail: string;
      product: string;
      context: string;
      emailCount: number;
    };

    if (!prospectName?.trim() || !prospectEmail?.trim() || !context?.trim()) {
      return NextResponse.json({ error: 'Prospect name, email, and description are required.' }, { status: 400 });
    }

    const count = Math.min(Math.max(emailCount ?? 2, 2), 4);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI not configured.' }, { status: 500 });

    // Build the email plan descriptions
    const emailPlans = [
      'Email 1 (Day 1): Warm, personal intro — reference how you met or what they shared. No pitch. Just a friendly follow-up that opens a door.',
      'Email 2: Value-focused — share one genuinely useful insight or tip specifically relevant to their situation and the product. Position yourself as an expert who helps.',
      'Email 3: Social proof or story — share a brief, relatable story about someone in a similar situation who benefited. Keep it real and brief.',
      'Email 4 (final): Soft close — invite a short 15-minute no-pressure call. Make it easy to say yes.',
    ].slice(0, count);

    const prompt = `You are an expert insurance agent ghostwriter. Write a ${count}-email nurture sequence for the following prospect.

Prospect name: ${prospectName.trim()}
Prospect email: ${prospectEmail.trim()}
Product of interest: ${product}
Situation: ${context.trim()}

Email plan:
${emailPlans.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Rules:
- Use the prospect's first name (extract it from "${prospectName.trim()}")
- Sound like a real human wrote this, not a marketing department
- Never be pushy. Never use words like "amazing opportunity" or "act now"
- Each email should be 3-5 short paragraphs max
- Subject lines should feel personal, not salesy
- Reference the specific situation naturally
- Sign off warmly as "the agent" (no specific name needed)

Return ONLY a valid JSON array — no markdown, no explanation, nothing else:

[
  { "subject": "...", "body": "..." },
  { "subject": "...", "body": "..." }
]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI API error:', errText);

      // Parse the error to show a helpful message
      let errorMessage = 'AI generation failed';
      try {
        const errData = JSON.parse(errText);
        if (errData.error?.message) {
          errorMessage = `OpenAI Error: ${errData.error.message}`;
        } else {
          errorMessage = `OpenAI Error (${response.status}): ${errText.substring(0, 200)}`;
        }
      } catch {
        errorMessage = `OpenAI Error (${response.status}): ${errText.substring(0, 200)}`;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    const text = (data.choices[0].message.content as string).trim()
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const emails = JSON.parse(text) as GeneratedEmail[];

    return NextResponse.json({ success: true, emails });
  } catch (err) {
    console.error('Nurture generate error:', err);
    return NextResponse.json({ error: 'Failed to generate campaign. Please try again.' }, { status: 500 });
  }
}
