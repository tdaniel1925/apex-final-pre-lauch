#!/usr/bin/env node

/**
 * Send Daily Training Email - Links to Branded Training Page
 */

import { Resend } from 'resend';
import { config } from 'dotenv';

config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

const day = 1;
const trainingUrl = `https://reachtheapex.net/training/${day}`;

const sampleEmail = {
  subject: "☕ Your 2-Minute Morning Training: The Compound Effect of 5 Contacts",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #f8fafc;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%); color: white; padding: 40px 30px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 15px;">☕</div>
        <h1 style="margin: 0; font-size: 28px; color: white; font-weight: bold;">Morning Training</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; color: #e0f2fe;">Day 1 of 30 • 2 Minutes</p>
      </div>

      <!-- Main Content -->
      <div style="background: white; padding: 40px 30px;">
        <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; line-height: 1.3;">
          The Compound Effect of 5 Contacts a Day
        </h2>

        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          Good morning! Today's training will show you the math behind making 5 contacts every single day - and why this simple habit creates unstoppable momentum.
        </p>

        <!-- Big Play Button -->
        <div style="text-align: center; margin: 40px 0;">
          <a href="${trainingUrl}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 20px 50px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 20px; box-shadow: 0 10px 25px rgba(14, 165, 233, 0.3);">
            🎧 LISTEN NOW
          </a>
          <p style="margin: 15px 0 0 0; font-size: 14px; color: #64748b;">
            2:04 minutes • Opens in browser with audio player
          </p>
        </div>

        <!-- Key Points Preview -->
        <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 30px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">What You'll Learn:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #334155;">
            <li style="margin: 8px 0;">Why 5 contacts/day = 36 new team members/year</li>
            <li style="margin: 8px 0;">How to make contact-making non-negotiable</li>
            <li style="margin: 8px 0;">The 1-in-10 rule that top earners use</li>
            <li style="margin: 8px 0;">Why 90 days of consistency = unstoppable momentum</li>
          </ul>
        </div>

        <!-- Action Item -->
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 25px; border-radius: 12px; margin: 30px 0;">
          <div style="font-size: 32px; margin-bottom: 10px;">🎯</div>
          <h3 style="margin: 0 0 10px 0; font-size: 18px; color: white;">Today's Action Item:</h3>
          <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #dcfce7;">
            Text 5 people: <strong>"Hey! Quick question - are you open to side income ideas?"</strong>
          </p>
        </div>

        <!-- Training Features -->
        <div style="margin: 30px 0;">
          <h3 style="margin: 0 0 20px 0; color: #1e293b; font-size: 18px;">On the Training Page:</h3>
          <div style="display: table; width: 100%;">
            <div style="display: table-row;">
              <div style="display: table-cell; padding: 10px 15px 10px 0; vertical-align: top;">
                <span style="font-size: 24px;">🎧</span>
              </div>
              <div style="display: table-cell; padding: 10px 0; vertical-align: top;">
                <strong style="color: #1e293b;">Professional Audio Player</strong><br>
                <span style="color: #64748b; font-size: 14px;">Full controls - pause, rewind, replay anytime</span>
              </div>
            </div>
            <div style="display: table-row;">
              <div style="display: table-cell; padding: 10px 15px 10px 0; vertical-align: top;">
                <span style="font-size: 24px;">📝</span>
              </div>
              <div style="display: table-cell; padding: 10px 0; vertical-align: top;">
                <strong style="color: #1e293b;">Full Transcript</strong><br>
                <span style="color: #64748b; font-size: 14px;">Prefer reading? Complete text version included</span>
              </div>
            </div>
            <div style="display: table-row;">
              <div style="display: table-cell; padding: 10px 15px 10px 0; vertical-align: top;">
                <span style="font-size: 24px;">💡</span>
              </div>
              <div style="display: table-cell; padding: 10px 0; vertical-align: top;">
                <strong style="color: #1e293b;">Key Takeaways</strong><br>
                <span style="color: #64748b; font-size: 14px;">Quick summary of main points to remember</span>
              </div>
            </div>
            <div style="display: table-row;">
              <div style="display: table-cell; padding: 10px 15px 10px 0; vertical-align: top;">
                <span style="font-size: 24px;">📊</span>
              </div>
              <div style="display: table-cell; padding: 10px 0; vertical-align: top;">
                <strong style="color: #1e293b;">Progress Tracking</strong><br>
                <span style="color: #64748b; font-size: 14px;">See how far you've come in the 30-day series</span>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 40px 0 30px 0;">
          <a href="${trainingUrl}" style="display: inline-block; background: #0ea5e9; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">
            Access Training Page →
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <!-- PS -->
        <p style="margin: 20px 0; font-size: 14px; color: #64748b;">
          <strong style="color: #1e293b;">P.S.</strong> This training is designed to be consumed in 2 minutes or less. Listen while you have your morning coffee, during your commute, or between tasks. Small daily improvements compound into massive results.
        </p>

        <!-- Progress Footer -->
        <div style="background: #fefce8; border: 2px solid #fbbf24; border-radius: 8px; padding: 20px; margin-top: 30px;">
          <p style="margin: 0 0 5px 0; font-size: 12px; color: #92400e; text-transform: uppercase; font-weight: bold;">📊 YOUR PROGRESS</p>
          <p style="margin: 0; font-size: 14px; color: #78350f;">
            <strong>Day 1 of 30</strong> • Next training arrives tomorrow at 7:00 AM
          </p>
          <div style="background: #fef3c7; height: 6px; border-radius: 3px; margin-top: 10px; overflow: hidden;">
            <div style="background: #f59e0b; height: 100%; width: 3.33%; border-radius: 3px;"></div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">
          See you tomorrow with Day 2:<br>
          <strong style="color: #1e293b;">"Where to Find Qualified Prospects"</strong>
        </p>
        <p style="margin: 15px 0 0 0; font-size: 12px; color: #94a3b8;">
          © 2026 Apex Affinity Group • Daily 2-Minute Training Series
        </p>
      </div>
    </div>
  `
};

async function sendSample() {
  console.log('📧 Sending Training Page Sample Email...\n');

  try {
    console.log(`📨 Sending: "${sampleEmail.subject}"`);
    console.log(`🔗 Training Page: ${trainingUrl}\n`);

    const result = await resend.emails.send({
      from: 'Apex Affinity Group <theapex@theapexway.net>',
      to: 'tdaniel@botmakers.ai',
      subject: `[SAMPLE - TRAINING PAGE] ${sampleEmail.subject}`,
      html: sampleEmail.html
    });

    if (result.error) {
      console.error(`❌ Error:`, result.error);
    } else {
      console.log(`✅ Sample sent! Email ID: ${result.data.id}\n`);
      console.log('📋 Check your inbox for the email');
      console.log(`🌐 Then visit the training page: ${trainingUrl}`);
      console.log('\n✨ The training page features:');
      console.log('   • Apex-branded design with logo');
      console.log('   • Audio player (will work once you add audio files)');
      console.log('   • Full transcript');
      console.log('   • Key takeaways');
      console.log('   • Action item');
      console.log('   • Progress tracking');
      console.log('   • Previous/Next navigation');
      console.log('\n🎯 Next steps to complete the system:');
      console.log('   1. Generate 30 audio files using Piper TTS');
      console.log('   2. Upload to /public/audio/');
      console.log('   3. Complete all 30 training scripts');
      console.log('   4. Set up automated daily emails');
    }

  } catch (error) {
    console.error(`❌ Failed to send:`, error.message);
  }
}

sendSample();
