#!/usr/bin/env node

/**
 * Send Licensing Series Link Email to tdaniel@botmakers.ai
 */

import { Resend } from 'resend';
import { config } from 'dotenv';

config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendLicensingLink() {
  console.log('📧 Sending Licensing Series Link Email...\n');

  try {
    const result = await resend.emails.send({
      from: 'Apex Affinity Group <theapex@theapexway.net>',
      to: 'tdaniel@botmakers.ai',
      subject: '🎓 Your Sample Licensing Lesson - Get Licensed in 14 Days',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #f8fafc;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%); color: white; padding: 40px 30px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 15px;">🎓</div>
            <h1 style="margin: 0; font-size: 28px; color: white; font-weight: bold;">Get Licensed Series</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; color: #e0f2fe;">14-Day Journey to Your Life Insurance License</p>
          </div>

          <!-- Main Content -->
          <div style="background: white; padding: 40px 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px;">Your Sample Lesson Is Ready!</h2>

            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              I've created a complete 14-day audio training series to help people get their life insurance license. Here's what's ready for you to review:
            </p>

            <!-- Episodes Available -->
            <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">5 Episodes Available Now:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #334155; line-height: 1.8;">
                <li>Episode 1: Why Get Licensed? The Income Opportunity (2:30)</li>
                <li>Episode 2: Choosing Your Pre-License Course (2:15)</li>
                <li>Episode 3: Your 2-Week Study Schedule (2:20)</li>
                <li>Episode 4: Insurance Fundamentals You Must Know (2:25)</li>
                <li>Episode 5: Types of Life Insurance Policies (2:30)</li>
              </ul>
            </div>

            <!-- Features -->
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px;">✨ What's Included:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.8;">
                <li><strong>Professional Audio:</strong> OpenAI TTS with "Onyx" voice</li>
                <li><strong>Full Transcripts:</strong> Read or listen - your choice</li>
                <li><strong>Action Items:</strong> Daily tasks to stay on track</li>
                <li><strong>Key Takeaways:</strong> Quick reference for each lesson</li>
                <li><strong>Resources:</strong> Links to pre-license courses, state requirements</li>
                <li><strong>Progress Tracking:</strong> Visual progress bar showing completion</li>
                <li><strong>No Login Required:</strong> Public access, shareable links</li>
              </ul>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="https://reachtheapex.net/training/licensing/1" style="display: inline-block; background: #0ea5e9; color: white; padding: 18px 50px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                Start Episode 1 →
              </a>
            </div>

            <p style="text-align: center; color: #64748b; font-size: 14px; margin: 20px 0;">
              Or browse all episodes at: <a href="https://reachtheapex.net/training/licensing/1" style="color: #0ea5e9; text-decoration: none;">reachtheapex.net/training/licensing/1</a>
            </p>

            <!-- The Plan -->
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <h3 style="margin: 20px 0 15px 0; color: #1e293b; font-size: 18px;">📋 The Complete Series Plan:</h3>

            <div style="color: #475569; font-size: 15px; line-height: 1.8;">
              <p><strong>Week 1:</strong> Foundation & Study Setup</p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Days 1-2: Introduction & course selection ✅</li>
                <li>Days 3-5: Study strategy & fundamentals ✅</li>
                <li>Days 6-7: Policy riders & week 1 review (coming soon)</li>
              </ul>

              <p><strong>Week 2:</strong> Advanced Concepts & Test Prep</p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Days 8-10: Underwriting, premiums, provisions</li>
                <li>Days 11-12: Beneficiaries, business uses, ethics</li>
                <li>Days 13-14: Test strategies & exam day prep</li>
              </ul>
            </div>

            <!-- Business Case -->
            <div style="background: #fefce8; border: 2px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #92400e;">💰 The Business Case:</h3>
              <p style="margin: 0; font-size: 14px; color: #78350f; line-height: 1.6;">
                <strong>Total Cost:</strong> $0.70 for all 14 audio files<br>
                <strong>Value Delivered:</strong> Complete licensing preparation<br>
                <strong>ROI:</strong> Licensed agents earn 2-5x more income<br>
                <strong>Use Case:</strong> Lead generation, rep training, member benefit
              </p>
            </div>

            <!-- Implementation Options -->
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px;">🚀 Implementation Options:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.8;">
                <li><strong>Public Landing Page:</strong> 14-day email drip campaign</li>
                <li><strong>Rep Replicated Sites:</strong> Each rep gets unique tracking link</li>
                <li><strong>SMS Campaign:</strong> Text "LICENSE" to get daily lessons</li>
                <li><strong>Back Office Playlist:</strong> Spotify-style training library</li>
              </ul>
            </div>

            <!-- Next Steps -->
            <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 25px; border-radius: 12px; margin: 30px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; color: white;">🎯 What's Next?</h3>
              <ol style="margin: 0; padding-left: 20px; color: #dcfce7; line-height: 1.8;">
                <li>Review Episodes 1-5</li>
                <li>Decide on implementation approach</li>
                <li>Complete remaining scripts (Days 6-14)</li>
                <li>Generate remaining audio files</li>
                <li>Launch as lead generation tool</li>
              </ol>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
              © 2026 Apex Affinity Group • Get Licensed Series<br>
              <a href="mailto:support@theapexway.net" style="color: #60a5fa; text-decoration: none;">support@theapexway.net</a>
            </p>
          </div>
        </div>
      `
    });

    if (result.error) {
      console.error('❌ Error:', result.error);
    } else {
      console.log('✅ Email sent successfully to tdaniel@botmakers.ai!');
      console.log(`📧 Email ID: ${result.data.id}\n`);
      console.log('📋 Email Contents:');
      console.log('   - Subject: 🎓 Your Sample Licensing Lesson - Get Licensed in 14 Days');
      console.log('   - Link: https://reachtheapex.net/training/licensing/1');
      console.log('   - Episodes available: 5 (Days 1-5)');
      console.log('   - Remaining to complete: 9 (Days 6-14)');
      console.log('\n📊 Series Status:');
      console.log('   ✅ Episodes 1-5: Scripts written, audio generated, pages created');
      console.log('   📝 Episodes 6-14: Outlined, scripts pending');
      console.log('   💰 Cost so far: $0.25 (5 audio files @ $0.05 each)');
      console.log('   💰 Remaining cost: $0.45 (9 audio files @ $0.05 each)');
    }

  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
  }
}

sendLicensingLink();
