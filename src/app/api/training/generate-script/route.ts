// =============================================
// Generate Training Script API
// Uses OpenAI GPT-4 to create podcast scripts
// =============================================

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { topic, episodeTitle, duration = 5 } = await request.json();

    if (!topic || !episodeTitle) {
      return NextResponse.json(
        { success: false, error: 'Topic and episode title are required' },
        { status: 400 }
      );
    }

    // Dynamic import to avoid build-time errors
    const { default: OpenAI } = await import('openai');

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert insurance sales trainer creating podcast scripts for Apex Affinity Group. Create engaging, practical training content that agents can immediately apply. Scripts should be conversational, motivational, and packed with actionable tactics.`,
        },
        {
          role: 'user',
          content: `Create a ${duration}-minute podcast script about: ${topic}

Episode Title: ${episodeTitle}

Requirements:
- Conversational tone (like talking to a friend)
- Practical, actionable advice
- Real-world examples
- Motivational but not cheesy
- Include specific scripts/phrases agents can use
- End with a clear action step

Format:
- Natural speech (use contractions, short sentences)
- No "um" or "uh" fillers
- Smooth transitions between points
- Engaging opening hook
- Strong closing with call-to-action

Target word count: ${duration * 150} words (150 words per minute speaking pace)`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const script = completion.choices[0].message.content;

    return NextResponse.json({
      success: true,
      script,
    });
  } catch (error: any) {
    console.error('Script generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
