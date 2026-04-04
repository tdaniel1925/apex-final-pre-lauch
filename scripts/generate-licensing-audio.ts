#!/usr/bin/env node

/**
 * Generate Licensing Series Audio Files
 *
 * Generates MP3 audio for all licensing episodes
 */

import OpenAI from 'openai';
import { licensingTrainings } from '../src/lib/training/licensing-series-content';
import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';

config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateAudioForEpisode(day: number) {
  const episode = licensingTrainings.find(t => t.day === day);

  if (!episode) {
    console.log(`⏭️  No episode content for Day ${day} - skipping`);
    return;
  }

  console.log(`🎙️  Generating audio for Episode ${day}: "${episode.title}"`);

  try {
    // Create audio directory if it doesn't exist
    const audioDir = path.join(process.cwd(), 'public', 'audio', 'licensing');
    await fs.mkdir(audioDir, { recursive: true });

    const audioPath = path.join(audioDir, `episode-${day}.mp3`);

    // Generate audio using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'onyx', // Deep, professional male voice
      input: episode.script,
      speed: 1.0
    });

    // Convert response to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Write to file
    await fs.writeFile(audioPath, buffer);

    const sizeKB = (buffer.length / 1024).toFixed(2);
    const durationMin = episode.duration;
    console.log(`✅ Episode ${day} audio saved: ${sizeKB}KB (${durationMin})`);
  } catch (error: any) {
    console.error(`❌ Failed to generate Episode ${day} audio:`, error.message);
  }
}

async function generateAllAudio() {
  console.log('🎧 Generating Licensing Series Audio Files\n');
  console.log('📋 Using OpenAI Text-to-Speech\n');

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY not found in .env.local');
    process.exit(1);
  }

  // Generate audio for all available episodes
  for (const episode of licensingTrainings) {
    await generateAudioForEpisode(episode.day);
  }

  console.log('\n✨ Audio generation complete!');
  console.log(`📁 Audio files saved to: public/audio/licensing/`);
  console.log(`🎯 Generated ${licensingTrainings.length} audio files`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Test audio playback at: https://reachtheapex.net/training/licensing/1`);
  console.log(`   2. Complete remaining episodes (Days 6-14)`);
}

generateAllAudio();
