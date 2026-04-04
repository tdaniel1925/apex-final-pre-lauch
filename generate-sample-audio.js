#!/usr/bin/env node

/**
 * Generate Sample Audio for Daily Training
 *
 * Uses ElevenLabs API to generate realistic voiceover
 */

import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

config({ path: '.env.local' });

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

const script = `
Good morning!

Most reps fail because they make contacts when they "feel like it."

Top earners make contacts like brushing their teeth. Non-negotiable.

Here's the math:

5 contacts per day equals 150 contacts per month.
At a 10 percent interest rate, that's 15 conversations.
At a 20 percent close rate, that's 3 new team members per month.
That's 36 new people in your first year.

The secret? Make it EASY.

Your contact list for today:

Number 1: Someone you talked to yesterday. Fresh in their mind.
Number 2: Someone on your social media. Like or comment on their post first.
Number 3: Someone at the coffee shop, gym, or store. Strike up a conversation.
Number 4: Someone your spouse knows. Warm introduction.
Number 5: Someone from your past. Old friend, colleague, classmate.

That's it. 5 people. 2 minutes each. 10 minutes total.

Reality check: Most will say no. That's the game. You're looking for the 1 in 10 who says "Tell me more."

The reps who do this daily for 90 days? They're unstoppable.

The reps who skip days? They quit within 6 months.

Which one will you be?

Your action item today: Before you check email again, text 5 people this exact message: "Hey! Quick question, are you open to side income ideas?"

See you tomorrow.
`;

async function generateAudio() {
  if (!ELEVENLABS_API_KEY) {
    console.log('⚠️  No ELEVENLABS_API_KEY found in .env.local');
    console.log('📝 To generate real audio:');
    console.log('   1. Sign up at https://elevenlabs.io');
    console.log('   2. Get your API key');
    console.log('   3. Add ELEVENLABS_API_KEY to .env.local');
    console.log('   4. Run this script again\n');
    console.log('💡 For now, I\'ll create the email with an embedded YouTube demo audio.\n');
    return null;
  }

  console.log('🎤 Generating audio with ElevenLabs...\n');

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: script,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioPath = path.join(process.cwd(), 'public', 'audio', 'daily-training-day-1.mp3');

    // Create directory if it doesn't exist
    const audioDir = path.dirname(audioPath);
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    fs.writeFileSync(audioPath, Buffer.from(audioBuffer));

    console.log('✅ Audio generated successfully!');
    console.log(`📁 Saved to: ${audioPath}`);
    console.log(`🔗 Will be available at: https://reachtheapex.net/audio/daily-training-day-1.mp3\n`);

    return '/audio/daily-training-day-1.mp3';

  } catch (error) {
    console.error('❌ Error generating audio:', error.message);
    return null;
  }
}

generateAudio();
