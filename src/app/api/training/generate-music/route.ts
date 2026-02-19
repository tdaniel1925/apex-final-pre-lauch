// =============================================
// Generate Background Music API
// Uses Mubert AI to create mood-matched music
// timed to episode duration automatically
// =============================================
// Requires: MUBERT_LICENSE_KEY in .env.local
// Get yours free at: https://mubert.com/render/api
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MOOD_TAGS: Record<string, string[]> = {
  professional: ['corporate', 'business', 'background', 'ambient'],
  motivational: ['motivation', 'inspiring', 'uplifting', 'success'],
  calm: ['ambient', 'calm', 'relaxing', 'peaceful'],
  energetic: ['upbeat', 'energetic', 'dynamic', 'positive'],
};

export async function POST(request: NextRequest) {
  try {
    const { mood = 'professional', duration = 120 } = await request.json();

    if (!process.env.MUBERT_LICENSE_KEY) {
      return NextResponse.json(
        { success: false, error: 'MUBERT_LICENSE_KEY is not configured in environment variables' },
        { status: 500 }
      );
    }

    const tags = MOOD_TAGS[mood] || MOOD_TAGS.professional;
    // Clamp to Mubert's supported range (15–300 seconds)
    const targetDuration = Math.min(Math.max(Math.floor(duration), 15), 300);

    // Step 1: Request music generation from Mubert
    const mubertRes = await fetch('https://api.mubert.com/v2/TTM', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'RecordTrackTTM',
        params: {
          pat: process.env.MUBERT_LICENSE_KEY,
          duration: targetDuration,
          format: 'mp3',
          intensity: 'low',
          tags,
        },
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!mubertRes.ok) {
      throw new Error(`Mubert API HTTP error: ${mubertRes.status}`);
    }

    const mubertData = await mubertRes.json();

    if (mubertData.status !== 1) {
      throw new Error(mubertData.error?.text || 'Mubert API returned an error');
    }

    const task = mubertData.data?.tasks?.[0];
    if (!task) {
      throw new Error('No task returned from Mubert API');
    }

    let downloadLink: string | null = task.download_link || null;

    // Step 2: Poll if not immediately ready
    if (!downloadLink || task.status !== 'ready') {
      const taskId = task.task_id;
      if (!taskId) throw new Error('No task_id to poll');

      for (let attempt = 0; attempt < 12; attempt++) {
        await new Promise((r) => setTimeout(r, 4000)); // 4s between polls

        const pollRes = await fetch('https://api.mubert.com/v2/TTM', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'GetTaskStatus',
            params: {
              pat: process.env.MUBERT_LICENSE_KEY,
              task_id: taskId,
            },
          }),
          signal: AbortSignal.timeout(10000),
        });

        const pollData = await pollRes.json();
        const pollTask = pollData.data?.tasks?.[0];

        if (pollTask?.status === 'ready' && pollTask?.download_link) {
          downloadLink = pollTask.download_link;
          break;
        }
      }
    }

    if (!downloadLink) {
      throw new Error('Music generation timed out — Mubert did not return a download link');
    }

    // Step 3: Download the generated music
    const musicRes = await fetch(downloadLink, { signal: AbortSignal.timeout(30000) });
    if (!musicRes.ok) throw new Error('Failed to download generated music from Mubert');
    const musicBuffer = await musicRes.arrayBuffer();

    // Step 4: Upload to Supabase storage
    const supabase = await createClient();
    const fileName = `music/bg-${mood}-${Date.now()}.mp3`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('training-audio')
      .upload(fileName, Buffer.from(musicBuffer), {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('training-audio').getPublicUrl(uploadData.path);

    return NextResponse.json({ success: true, musicUrl: publicUrl });
  } catch (error: any) {
    console.error('Music generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Music generation failed' },
      { status: 500 }
    );
  }
}
