// =============================================
// AI Photo Quality Analysis API
// Uses Anthropic Claude with Vision to analyze photo quality
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid image',
          message: 'Image data is required',
        } as ApiResponse,
        { status: 400 }
      );
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'API key not configured',
          message: 'Anthropic API key is missing',
        } as ApiResponse,
        { status: 500 }
      );
    }

    // Extract base64 data and media type from data URL
    const matches = image.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid image format',
          message: 'Image must be a valid base64 data URL',
        } as ApiResponse,
        { status: 400 }
      );
    }

    const mediaType = matches[1];
    const base64Data = matches[2];

    const systemPrompt = `You are a professional photo quality analyzer for business profile pictures.

Analyze the image and determine if it meets quality standards for a professional profile photo.

Quality criteria:
- Face is clearly visible and well-lit
- Image is sharp and in focus (not blurry)
- Resolution is adequate (not too low quality or pixelated)
- Proper framing (face centered, appropriate crop)
- Professional appearance (no sunglasses, no hats unless religious/cultural, solid background preferred)
- Good lighting (not too dark, not overexposed)

Return ONLY a JSON object with this exact format:
{
  "passed": true or false,
  "message": "Brief overall assessment in one sentence",
  "issues": ["list", "of", "specific", "issues"]
}

The issues array should be empty if passed is true. Keep the message encouraging and constructive.`;

    console.log('🤖 Calling Anthropic Claude API...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Data,
                },
              },
              {
                type: 'text',
                text: 'Analyze this profile photo for quality and professionalism. Return your analysis in the JSON format specified.',
              },
            ],
          },
        ],
      }),
    });

    console.log('📡 Anthropic response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Full Anthropic error:', JSON.stringify(errorData, null, 2));
      return NextResponse.json(
        {
          success: false,
          error: 'Anthropic API error',
          message: `${errorData.error?.type || 'Error'}: ${errorData.error?.message || JSON.stringify(errorData)}`,
          fullError: errorData,
        } as ApiResponse,
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Anthropic response:', data);

    // Extract text from Claude's response
    const textContent = data.content.find((c: any) => c.type === 'text');
    if (!textContent) {
      throw new Error('No text content in response');
    }

    // Parse JSON from the text content
    let result;
    try {
      // Claude might wrap JSON in markdown code blocks, so clean it
      const text = textContent.text.trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', textContent.text);
      throw new Error('Failed to parse analysis result');
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: 'Photo analyzed successfully',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('AI photo analysis error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
