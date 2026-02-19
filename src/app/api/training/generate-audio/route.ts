// =============================================
// Generate Audio API
// Converts text to speech using OpenAI TTS
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'onyx', type = 'main', episodeId } = await request.json();

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    // Dynamic import of OpenAI to avoid build-time errors
    const { default: OpenAI } = await import('openai');

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Generate audio
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: voice as any,
      input: text,
      speed: 1.0,
    });

    const audioBuffer = Buffer.from(await mp3.arrayBuffer());

    // Upload to Supabase Storage
    const supabase = await createClient();
    const fileName = `${type}-${episodeId || Date.now()}.mp3`;

    const { data, error } = await supabase.storage
      .from('training-audio')
      .upload(`temp/${fileName}`, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('training-audio').getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      audioUrl: publicUrl,
      fileName,
      path: data.path,
    });
  } catch (error: any) {
    console.error('Audio generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
