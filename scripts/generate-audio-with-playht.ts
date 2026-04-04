#!/usr/bin/env node

/**
 * Generate Training Audio with Play.ht
 *
 * Play.ht offers 12,500 free characters to start
 * High-quality voices, simple API
 */

import { dailyTrainings } from '../src/lib/training/daily-training-content';
import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function generateWithPlayHT(day: number) {
  const training = dailyTrainings.find(t => t.day === day);
  if (!training) return;

  console.log(`🎙️  Generating audio for Day ${day}: "${training.title}"`);

  try {
    // Play.ht API request
    const response = await fetch('https://api.play.ht/api/v2/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PLAYHT_API_KEY}`,
        'X-USER-ID': process.env.PLAYHT_USER_ID || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: training.script,
        voice: 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/male-cs/manifest.json',
        output_format: 'mp3',
        speed: 1.0
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Wait for generation to complete
    let audioUrl = null;
    let attempts = 0;
    while (!audioUrl && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const statusResponse = await fetch(data._links.status.href, {
        headers: {
          'Authorization': `Bearer ${process.env.PLAYHT_API_KEY}`,
          'X-USER-ID': process.env.PLAYHT_USER_ID || ''
        }
      });

      const statusData = await statusResponse.json();

      if (statusData.output?.url) {
        audioUrl = statusData.output.url;
      }
      attempts++;
    }

    if (!audioUrl) {
      throw new Error('Audio generation timed out');
    }

    // Download audio file
    const audioResponse = await fetch(audioUrl);
    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

    // Save to file
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    await fs.mkdir(audioDir, { recursive: true });
    const audioPath = path.join(audioDir, `training-day-${day}.mp3`);
    await fs.writeFile(audioPath, audioBuffer);

    const sizeKB = (audioBuffer.length / 1024).toFixed(2);
    console.log(`✅ Day ${day} audio saved: ${sizeKB}KB`);

  } catch (error: any) {
    console.error(`❌ Failed to generate Day ${day}:`, error.message);
  }
}

async function main() {
  console.log('🎧 Generating Training Audio with Play.ht\n');

  if (!process.env.PLAYHT_API_KEY) {
    console.error('❌ PLAYHT_API_KEY not found in .env.local');
    console.log('   Sign up for free at: https://play.ht');
    console.log('   Free tier: 12,500 characters');
    process.exit(1);
  }

  for (const training of dailyTrainings) {
    await generateWithPlayHT(training.day);
  }

  console.log('\n✨ Complete!');
}

main();
