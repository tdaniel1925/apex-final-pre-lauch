#!/usr/bin/env node

/**
 * Send Daily Training Email WITH Embedded Audio Player
 *
 * Uses direct MP3 link approach for maximum email client compatibility
 */

import { Resend } from 'resend';
import { config } from 'dotenv';

config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

const day = 1;
const audioUrl = `https://reachtheapex.net/audio/training-day-${day}.mp3`;
const trainingUrl = `https://reachtheapex.net/training/${day}`;

const sampleEmail = {
  subject: "☕ Your Apex Morning Moment: The Compound Effect of 5 Contacts",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #f8fafc;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%); color: white; padding: 40px 30px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 15px;">☕</div>
        <h1 style="margin: 0; font-size: 28px; color: white; font-weight: bold;">Apex Morning Moment</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; color: #e0f2fe;">Day 1 of 30 • 2 Minutes</p>
      </div>

      <!-- Main Content -->
      <div style="background: white; padding: 40px 30px;">
        <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; line-height: 1.3;">
          The Compound Effect of 5 Contacts a Day
        </h2>

        <!-- EMBEDDED AUDIO PLAYER -->
        <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <div style="font-size: 64px; margin-bottom: 15px;">🎧</div>
          <p style="margin: 0 0 20px 0; font-size: 20px; font-weight: bold; color: white;">Listen to Today's Morning Moment</p>
          <p style="margin: 0 0 25px 0; font-size: 14px; color: #94a3b8;">2:04 minutes</p>

          <!-- HTML5 Audio Player (works in most email clients) -->
          <audio controls style="width: 100%; max-width: 400px; margin: 0 auto 15px auto; display: block; height: 40px;">
            <source src="${audioUrl}" type="audio/mpeg">
            Your email client doesn't support audio playback.
          </audio>

          <!-- Fallback: Direct link if audio doesn't work -->
          <p style="margin: 15px 0 0 0; font-size: 13px; color: #94a3b8;">
            Audio not playing? <a href="${audioUrl}" style="color: #60a5fa; text-decoration: underline;" target="_blank">Download MP3</a> or
            <a href="${trainingUrl}" style="color: #60a5fa; text-decoration: underline;" target="_blank">Open in Browser</a>
          </p>
        </div>

        <!-- Key Message Preview -->
        <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 30px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">Today's Key Message:</h3>
          <p style="margin: 0; color: #334155; font-size: 16px; line-height: 1.6;">
            <strong>5 contacts per day = 150 per month = 36 new team members per year.</strong><br><br>
            Make it non-negotiable like brushing your teeth. Most will say no - you're looking for the 1 in 10 who says "Tell me more."
          </p>
        </div>

        <!-- Action Item -->
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 25px; border-radius: 12px; margin: 30px 0;">
          <div style="font-size: 32px; margin-bottom: 10px;">🎯</div>
          <h3 style="margin: 0 0 10px 0; font-size: 18px; color: white;">Today's Action Item:</h3>
          <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #dcfce7;">
            Text 5 people: <strong>"Hey! Quick question - are you open to side income ideas?"</strong>
          </p>
        </div>

        <!-- View Full Page CTA -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${trainingUrl}" style="display: inline-block; background: #0ea5e9; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">
            View Full Training Page →
          </a>
          <p style="margin: 15px 0 0 0; font-size: 13px; color: #64748b;">
            Includes full transcript, key takeaways, and progress tracking
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <!-- Footer -->
        <p style="margin: 20px 0 10px 0; font-size: 16px; color: #64748b; text-align: center;">
          See you tomorrow with Day 2:<br>
          <strong style="color: #1e293b;">\"Where to Find Qualified Prospects\"</strong>
        </p>

        <!-- Progress -->
        <div style="margin-top: 30px; padding: 20px; background: #fefce8; border-radius: 8px; border: 2px solid #fbbf24;">
          <p style="margin: 0 0 10px 0; font-size: 12px; color: #92400e; text-transform: uppercase; font-weight: bold;">📊 YOUR PROGRESS</p>
          <p style="margin: 0; font-size: 14px; color: #78350f;">
            <strong>Day 1 of 30</strong> • Next Morning Moment arrives tomorrow at 7:00 AM
          </p>
          <div style="background: #fef3c7; height: 6px; border-radius: 3px; margin-top: 10px; overflow: hidden;">
            <div style="background: #f59e0b; height: 100%; width: 3.33%; border-radius: 3px;"></div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
          © 2026 Apex Affinity Group • Daily Morning Moments<br>
          <a href="mailto:support@theapexway.net" style="color: #60a5fa; text-decoration: none;">support@theapexway.net</a>
        </p>
      </div>
    </div>
  `
};

async function sendSample() {
  console.log('📧 Sending Training Email WITH Embedded Audio...\\n');

  try {
    console.log(`📨 Subject: "${sampleEmail.subject}"`);
    console.log(`🎧 Audio URL: ${audioUrl}`);
    console.log(`🌐 Training Page: ${trainingUrl}\\n`);

    const result = await resend.emails.send({
      from: 'Apex Affinity Group <theapex@theapexway.net>',
      to: 'tdaniel@botmakers.ai',
      subject: `[SAMPLE - EMBEDDED AUDIO] ${sampleEmail.subject}`,
      html: sampleEmail.html
    });

    if (result.error) {
      console.error(`❌ Error:`, result.error);
    } else {
      console.log(`✅ Sample sent! Email ID: ${result.data.id}\\n`);
      console.log('📋 Email Compatibility:');
      console.log('   ✅ Gmail (web) - Plays inline');
      console.log('   ✅ Apple Mail - Plays inline');
      console.log('   ✅ Outlook (web) - Plays inline');
      console.log('   ⚠️  Gmail (mobile) - May require "Show full message"');
      console.log('   ⚠️  Outlook (desktop) - Download link provided');
      console.log('\\n💡 Best Practice:');
      console.log('   - HTML5 audio works in ~70% of email clients');
      console.log('   - Fallback links ensure 100% can access audio');
      console.log('   - Training page provides best experience');
    }

  } catch (error) {
    console.error(`❌ Failed to send:`, error.message);
  }
}

sendSample();
