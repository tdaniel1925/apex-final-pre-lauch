// =============================================
// POST /api/apps/pulsefollow
// Generate a 3-part follow-up sequence via Claude
// =============================================

import { NextResponse } from 'next/server';

interface SequenceItem {
  day: number;
  channel: 'email' | 'text';
  subject: string | null;
  message: string;
}

export async function POST(req: Request) {
  try {
    const { prospectName, product, situation } = await req.json() as {
      prospectName: string;
      product: string;
      situation: string;
    };

    if (!prospectName?.trim() || !situation?.trim()) {
      return NextResponse.json({ error: 'Prospect name and situation are required.' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI not configured.' }, { status: 500 });
    }

    const prompt = `You are an expert insurance sales coach helping an agent craft a professional follow-up sequence.

Prospect: ${prospectName.trim()}
Product interest: ${product}
Situation: ${situation.trim()}

Generate a 3-part follow-up sequence. Return ONLY valid JSON with this exact structure — no markdown, no explanation:

{
  "sequence": [
    {
      "day": 1,
      "channel": "email",
      "subject": "short subject line here",
      "message": "full email body here (2-3 short paragraphs, warm and professional, use the prospect's first name)"
    },
    {
      "day": 3,
      "channel": "email",
      "subject": "short subject line here",
      "message": "full email body here (shorter, value-focused)"
    },
    {
      "day": 7,
      "channel": "text",
      "subject": null,
      "message": "short SMS-style text (under 160 chars, casual but professional)"
    }
  ]
}

Rules:
- Use the prospect's first name (extract it from "${prospectName.trim()}")
- Reference the specific product: ${product}
- Address the situation naturally
- Never be pushy or salesy — be genuinely helpful
- Day 1 email: check in, offer help, keep the door open
- Day 3 email: provide brief value (one insight or tip related to ${product})
- Day 7 text: quick friendly nudge, very brief`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      throw new Error('AI generation failed');
    }

    const data = await response.json();
    const text = data.content[0].text.trim();

    // Parse JSON — strip any accidental markdown fences
    const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(clean) as { sequence: SequenceItem[] };

    return NextResponse.json({ success: true, sequence: parsed.sequence });
  } catch (err) {
    console.error('PulseFollow generate error:', err);
    return NextResponse.json({ error: 'Failed to generate sequence. Please try again.' }, { status: 500 });
  }
}
