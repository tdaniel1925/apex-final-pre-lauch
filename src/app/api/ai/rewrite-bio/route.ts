// =============================================
// AI Bio Rewrite API
// POST /api/ai/rewrite-bio
// Uses OpenAI to improve user's bio
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { bio } = await request.json();

    if (!bio || typeof bio !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid bio',
          message: 'Bio text is required',
        } as ApiResponse,
        { status: 400 }
      );
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'API key not configured',
          message: 'OpenAI API key is missing',
        } as ApiResponse,
        { status: 500 }
      );
    }

    const systemPrompt = `You are a professional copywriter helping insurance professionals write compelling bio sections for their business websites.

Your task: Improve the user's bio to make it more professional, engaging, and persuasive while keeping their voice and key points.

Guidelines:
- Keep it concise (2-4 sentences max)
- Make it personal and authentic
- Highlight experience and passion
- Use active voice
- Be professional but warm
- Keep any specific details they mention (years of experience, specialties, etc.)
- Do NOT add information they didn't mention
- Return ONLY the rewritten bio, nothing else`;

    const userPrompt = `Please improve this bio:\n\n${bio}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 200,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const rewritten = data.choices[0].message.content.trim();

    return NextResponse.json(
      {
        success: true,
        data: { rewritten },
        message: 'Bio rewritten successfully',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('AI rewrite error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Rewrite failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
