#!/usr/bin/env node

/**
 * Generate Training Audio Files using OpenAI TTS
 *
 * Generates MP3 audio files for all training day scripts
 * Uses OpenAI's high-quality text-to-speech API
 */

import OpenAI from 'openai';
import { dailyTrainings } from '../src/lib/training/daily-training-content';
import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';

config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateAudioForDay(day: number) {
  const training = dailyTrainings.find(t => t.day === day);

  if (!training) {
    console.log(`⏭️  No training content for Day ${day} - skipping`);
    return;
  }

  console.log(`🎙️  Generating audio for Day ${day}: "${training.title}"`);

  try {
    // Create audio directory if it doesn't exist
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    await fs.mkdir(audioDir, { recursive: true });

    const audioPath = path.join(audioDir, `training-day-${day}.mp3`);

    // Generate audio using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1', // Fast, good quality
      voice: 'onyx', // Deep, professional male voice
      input: training.script,
      speed: 1.0
    });

    // Convert response to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Write to file
    await fs.writeFile(audioPath, buffer);

    const sizeKB = (buffer.length / 1024).toFixed(2);
    const durationMin = training.duration;
    console.log(`✅ Day ${day} audio saved: ${sizeKB}KB (${durationMin})`);
  } catch (error: any) {
    console.error(`❌ Failed to generate Day ${day} audio:`, error.message);
  }
}

async function generateAllAudio() {
  console.log('🎧 Generating Training Audio Files\n');
  console.log('📋 Using OpenAI Text-to-Speech\n');

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY not found in .env.local');
    process.exit(1);
  }

  // Generate audio for all available training days
  for (const training of dailyTrainings) {
    await generateAudioForDay(training.day);
  }

  console.log('\n✨ Audio generation complete!');
  console.log(`📁 Audio files saved to: public/audio/`);
  console.log(`🎯 Generated ${dailyTrainings.length} audio files`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Test audio playback at: https://reachtheapex.net/training/1`);
  console.log(`   2. Send sample training email`);
  console.log(`   3. Complete remaining 27 training scripts (Days 4-30)`);
}

generateAllAudio();
