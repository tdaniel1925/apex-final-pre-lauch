#!/usr/bin/env node

/**
 * Send Daily Training Email Sample
 *
 * Example of the 2-minute podcast-style training email
 */

import { Resend } from 'resend';
import { config } from 'dotenv';

config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

const sampleEmail = {
  subject: "☕ Your 2-Minute Morning Training: Making 5 New Contacts Daily",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; color: white;">☕ Morning Training</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; color: #e0f2fe;">2 Minutes • Day 1 of 30</p>
      </div>

      <!-- Main Content -->
      <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px;">The Compound Effect of 5 Contacts a Day</h2>

        <!-- Audio Player Placeholder -->
        <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #cbd5e1;">
          <div style="font-size: 48px; margin-bottom: 10px;">🎧</div>
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #475569;">Audio Training: 2:04 minutes</p>
          <p style="margin: 10px 0 20px 0; font-size: 14px; color: #64748b;">
            (Audio player will be embedded here in production)
          </p>
          <div style="background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; display: inline-block; font-weight: bold;">
            ▶️ PLAY TRAINING
          </div>
        </div>

        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #92400e;">📝 Can't listen now? Read the transcript below</p>
        </div>

        <hr style="border: none; border-top: 2px solid #e5e7eb; margin: 30px 0;">

        <!-- Transcript -->
        <div style="color: #334155; line-height: 1.8; font-size: 16px;">
          <p><strong>Good morning!</strong></p>

          <p>Most reps fail because they make contacts when they <em>"feel like it."</em></p>

          <p><strong>Top earners make contacts like brushing their teeth - non-negotiable.</strong></p>

          <h3 style="color: #1e40af; margin: 30px 0 15px 0;">Here's the math:</h3>
          <ul style="background: #f0f9ff; padding: 20px 20px 20px 40px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
            <li style="margin: 8px 0;"><strong>5 contacts/day</strong> = 150 contacts/month</li>
            <li style="margin: 8px 0;">At <strong>10% interest rate</strong> = 15 conversations</li>
            <li style="margin: 8px 0;">At <strong>20% close rate</strong> = 3 new team members per month</li>
            <li style="margin: 8px 0;"><strong>That's 36 new people</strong> in your first year</li>
          </ul>

          <p style="font-size: 20px; font-weight: bold; color: #1e40af; margin: 30px 0 15px 0;">The secret? Make it EASY.</p>

          <h3 style="color: #1e40af; margin: 30px 0 15px 0;">Your contact list for today:</h3>
          <ol style="background: #f8fafc; padding: 20px 20px 20px 40px; border-radius: 8px; border: 2px solid #e2e8f0;">
            <li style="margin: 12px 0;"><strong>Someone you talked to yesterday</strong> - Fresh in their mind</li>
            <li style="margin: 12px 0;"><strong>Someone on your social media</strong> - Like or comment on their post first</li>
            <li style="margin: 12px 0;"><strong>Someone at the coffee shop / gym / store</strong> - Strike up a conversation</li>
            <li style="margin: 12px 0;"><strong>Someone your spouse knows</strong> - Warm introduction</li>
            <li style="margin: 12px 0;"><strong>Someone from your past</strong> - Old friend, colleague, classmate</li>
          </ol>

          <p style="font-size: 18px; margin: 30px 0;"><strong>That's it. 5 people. 2 minutes each. 10 minutes total.</strong></p>

          <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <p style="margin: 0; color: #991b1b; font-size: 16px;">
              <strong>Reality check:</strong> Most will say no. That's the game. You're looking for the <strong>1 in 10</strong> who says <em>"Tell me more."</em>
            </p>
          </div>

          <p>The reps who do this daily for 90 days? They're unstoppable.</p>
          <p>The reps who skip days? They quit within 6 months.</p>

          <p style="font-size: 18px; font-weight: bold; margin: 30px 0 10px 0;">Which one will you be?</p>
        </div>

        <!-- Action Item Box -->
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; border-radius: 12px; margin: 40px 0 30px 0; text-align: center;">
          <p style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #dcfce7;">Today's Action Item</p>
          <h3 style="margin: 0 0 20px 0; font-size: 24px; color: white;">Before you check email again...</h3>
          <p style="margin: 0; font-size: 18px; line-height: 1.6; color: white;">
            Text 5 people this exact message:<br>
            <strong style="font-size: 20px; display: block; margin: 15px 0; padding: 20px; background: rgba(255,255,255,0.2); border-radius: 8px;">
              "Hey! Quick question - are you open to side income ideas?"
            </strong>
          </p>
        </div>

        <p style="font-size: 16px; color: #64748b; text-align: center; margin: 30px 0 10px 0;">See you tomorrow,</p>
        <p style="font-size: 18px; font-weight: bold; color: #1e40af; text-align: center; margin: 0;"><strong>The Apex Team</strong></p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0 20px 0;">

        <!-- P.S. -->
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
          <p style="margin: 0; font-size: 14px; color: #475569;">
            <strong>P.S.</strong> Stuck on who to contact? Reply to this email - we'll help you brainstorm your first 5 prospects.
          </p>
        </div>

        <!-- Footer Stats -->
        <div style="margin-top: 30px; padding: 20px; background: #fefce8; border-radius: 8px; border: 2px solid #fbbf24;">
          <p style="margin: 0 0 10px 0; font-size: 12px; color: #92400e; text-transform: uppercase; font-weight: bold;">📊 Your Progress</p>
          <p style="margin: 0; font-size: 14px; color: #78350f;">
            <strong>Day 1 of 30</strong> • Next training arrives tomorrow at 7:00 AM
          </p>
        </div>
      </div>

      <!-- Unsubscribe -->
      <div style="text-align: center; margin-top: 30px; padding: 20px;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          This is a sample of our Daily 2-Minute Training series.<br>
          Sent to: tdaniel@botmakers.ai
        </p>
      </div>
    </div>
  `
};

async function sendSample() {
  console.log('📧 Sending Daily Training Sample Email...\n');

  try {
    console.log(`📨 Sending: "${sampleEmail.subject}"`);

    const result = await resend.emails.send({
      from: 'Apex Affinity Group <theapex@theapexway.net>',
      to: 'tdaniel@botmakers.ai',
      subject: `[SAMPLE] ${sampleEmail.subject}`,
      html: sampleEmail.html
    });

    if (result.error) {
      console.error(`❌ Error:`, result.error);
    } else {
      console.log(`✅ Sample sent! Email ID: ${result.data.id}\n`);
      console.log('📋 Check your inbox to see the daily training format.');
      console.log('💡 This is Day 1 of a 30-day curriculum.');
      console.log('🎧 Audio player will be functional in production version.');
    }

  } catch (error) {
    console.error(`❌ Failed to send:`, error.message);
  }
}

sendSample();
