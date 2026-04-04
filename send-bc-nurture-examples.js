#!/usr/bin/env node

/**
 * Send Business Center Nurture Email Examples
 *
 * Sends all 7 nurture campaign emails to tdaniel@botmakers.ai for review
 */

import { Resend } from 'resend';
import { config } from 'dotenv';

config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

const emails = [
  {
    day: 1,
    subject: "Try the AI tools yourself - right now 🤖",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Try the AI tools yourself - right now 🤖</h2>

        <p>Hey Trent,</p>

        <p>You're selling AI technology. Have you actually used it?</p>

        <p>Not just a quick demo - I mean <strong>REALLY</strong> used it. Experimented. Played around. Found the hidden features.</p>

        <p>That's what separates top earners from everyone else. They know the product inside and out.</p>

        <h3>Here's your first task (takes 5 minutes):</h3>

        <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>🤖 Test the AI Chatbot:</strong></p>
          <ol style="margin: 10px 0;">
            <li>Go to your Business Center dashboard</li>
            <li>Click the AI assistant icon (bottom right)</li>
            <li>Ask: "How do I explain PulseMarket to a small business owner?"</li>
            <li>Get an instant answer with a pitch script</li>
          </ol>
          <p style="margin: 0;">Now you have a real example to show prospects.</p>
        </div>

        <p style="text-align: center; margin: 30px 0;">
          <a href="https://reachtheapex.net/dashboard" style="background: #0ea5e9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Try it now</a>
        </p>

        <p>You've got 14 days to master every AI feature. Let's start.</p>

        <p>- The Apex Team</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="font-size: 14px; color: #6b7280;">
          <strong>P.S.</strong> The AI chatbot has answers for every objection, every question, every scenario. Learn to use it, and you'll never fumble a pitch again.
        </p>
      </div>
    `
  },
  {
    day: 3,
    subject: "You're using more AI than 80% of reps 🚀",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>You're using more AI than 80% of reps 🚀</h2>

        <p>Hey Trent,</p>

        <p>Quick check-in on your Business Center trial!</p>

        <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your AI usage stats:</h3>
          <ul style="list-style: none; padding: 0;">
            <li>✅ AI Chatbot: <strong>47 messages sent</strong></li>
            <li>✅ AI Voice Agent: <strong>23 minutes used</strong></li>
            <li>✅ CRM Contacts: <strong>12 AI tool prospects tracked</strong></li>
          </ul>
          <p style="margin-bottom: 0; color: #15803d; font-weight: bold;">🔥 You're in the top 20% of users!</p>
        </div>

        <p>Here's why that matters: Reps who use the AI tools personally close <strong>3x more AI product sales</strong>. Why? Because they can answer every question from experience.</p>

        <h3>Your next steps:</h3>

        <ol>
          <li>Practice explaining PulseMarket features using the AI voice agent</li>
          <li>Ask the chatbot: "What's the #1 objection to PulseDrive and how do I overcome it?"</li>
          <li>Add 3 prospects to CRM who might be interested in AI tools</li>
        </ol>

        <p>Keep going - you're building expertise that will translate to sales.</p>

        <p>- The Apex Team</p>
      </div>
    `
  },
  {
    day: 7,
    subject: "How Marcus sold 12 AI subscriptions in 30 days 💰",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>How Marcus sold 12 AI subscriptions in 30 days 💰</h2>

        <p>Hey Trent,</p>

        <p>You're halfway through your Business Center trial. Here's a story that'll inspire you.</p>

        <p>Marcus Williams joined Apex 2 months ago. First month? <strong>Zero AI tool sales</strong>. He'd pitch PulseMarket, and prospects would ask "What does it actually do?" Marcus didn't know.</p>

        <p><strong>Then he started using Business Center.</strong></p>

        <h3>Here's what changed:</h3>

        <div style="background: #fefce8; border-left: 4px solid #eab308; padding: 15px; margin: 20px 0;">
          <p><strong>✅ He used the AI chatbot 100+ times to learn every feature</strong><br>
          <em>Result: He could answer ANY question about the AI tools</em></p>

          <p><strong>✅ He practiced AI tool demos with the voice agent 20+ times</strong><br>
          <em>Result: His pitch became smooth and confident</em></p>

          <p><strong>✅ He tracked every AI demo in the CRM with detailed notes</strong><br>
          <em>Result: He stopped losing prospects to lack of follow-up</em></p>
        </div>

        <h3>His second month results:</h3>
        <ul>
          <li>8 PulseMarket subscriptions sold ($59/month each)</li>
          <li>3 PulseFlow subscriptions ($129/month each)</li>
          <li>1 PulseDrive subscription ($349/month)</li>
          <li><strong>Total monthly recurring: $936/month in AI tool sales</strong></li>
          <li><strong>His monthly commissions: $281/month from AI products alone</strong></li>
        </ul>

        <div style="background: #dbeafe; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 18px;">Business Center cost: <strong>$39/month</strong></p>
          <p style="margin: 10px 0 0 0; font-size: 24px; color: #1d4ed8; font-weight: bold;">ROI: 7.2x</p>
        </div>

        <p>Want results like Marcus? You've got 7 days left to master the tools.</p>

        <p style="text-align: center; margin: 30px 0;">
          <a href="https://reachtheapex.net/dashboard/store" style="background: #0ea5e9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Continue Your Trial</a>
        </p>

        <p>- The Apex Team</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="font-size: 14px; color: #6b7280;">
          <strong>P.S.</strong> Marcus's secret: He shows prospects HIS usage of the AI tools. Real screenshots. Real results. That's what closes sales.
        </p>
      </div>
    `
  },
  {
    day: 10,
    subject: "The AI feature that closes deals 🎯",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>The AI feature that closes deals 🎯</h2>

        <p>Hey Trent,</p>

        <p>Quick question: When a prospect asks <em>"How will PulseMarket help MY business specifically?"</em> what do you say?</p>

        <p>Most reps freeze. They give generic answers. The prospect isn't convinced.</p>

        <p><strong>Here's what top earners do:</strong> They use the AI chatbot to create custom examples.</p>

        <h3>Watch this (real example):</h3>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; color: #475569;"><strong>Prompt to AI Chatbot:</strong></p>
          <p style="margin: 0 0 15px 0; font-style: italic;">"My prospect owns a hair salon. How would PulseMarket help her business? Give me 3 specific examples."</p>

          <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 15px 0;">

          <p style="margin: 0 0 10px 0; color: #475569;"><strong>AI Response:</strong></p>
          <p style="margin: 0;">"For a hair salon, PulseMarket can:</p>
          <ol style="margin: 10px 0;">
            <li>Auto-generate before/after posts from customer photos</li>
            <li>Create promotional posts for slow days (Tue/Wed specials)</li>
            <li>Build a content calendar for seasonal trends (prom, weddings, holidays)</li>
          </ol>
          <p style="margin: 10px 0 0 0; padding: 15px; background: #e0f2fe; border-left: 3px solid #0284c7;">
            <strong>Pitch:</strong> 'Imagine never worrying about what to post. PulseMarket creates 20 posts a month tailored to your salon's style.'
          </p>
        </div>

        <p><strong>Now you have a custom pitch that speaks directly to HER business.</strong></p>

        <h3>Try it yourself:</h3>
        <ol>
          <li>Think of a prospect you're working with</li>
          <li>Ask the AI chatbot how [their industry] would benefit from [AI tool]</li>
          <li>Use that exact pitch in your next conversation</li>
        </ol>

        <p style="color: #dc2626; font-weight: bold;">You've got 4 days left in your trial. Learn this technique before you lose access.</p>

        <p style="text-align: center; margin: 30px 0;">
          <a href="https://reachtheapex.net/dashboard" style="background: #0ea5e9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Try AI Chatbot Now</a>
        </p>

        <p>- The Apex Team</p>
      </div>
    `
  },
  {
    day: 12,
    subject: "⏰ 2 days left - here's what you'll lose",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: white;">⏰ 2 days left</h2>
        </div>

        <p>Hey Trent,</p>

        <p>Your Business Center trial expires in <strong>2 days</strong>.</p>

        <p>After that, you'll lose access to the AI tools that help you SELL AI tools:</p>

        <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;">❌ <strong>Unlimited AI Chatbot</strong> (back to 20 messages/day - not enough to master the tech)</li>
            <li style="margin: 10px 0;">❌ <strong>Unlimited AI Voice Agent</strong> (back to 50 minutes/month - barely enough to practice)</li>
            <li style="margin: 10px 0;">❌ <strong>AI Demo CRM</strong> (lose all your prospects interested in AI products)</li>
            <li style="margin: 10px 0;">❌ <strong>Team AI Analytics</strong> (can't see which AI products your downline is selling)</li>
          </ul>
        </div>

        <h3>Here's what this costs you:</h3>

        <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0;">
          <p><strong>Without unlimited AI access:</strong></p>
          <ul>
            <li>You can't master PulseMarket features → Can't answer prospect questions → <strong>Lost sales</strong></li>
            <li>You can't practice AI demos → Fumble presentations → <strong>Lost credibility</strong></li>
            <li>You forget to follow up with AI prospects → <strong>Lost deals</strong></li>
          </ul>
        </div>

        <div style="text-align: center; background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0; font-size: 16px;">Cost of NOT having Business Center:</p>
          <p style="margin: 10px 0; font-size: 28px; color: #dc2626; font-weight: bold;">$200-500/month in lost AI product sales</p>
          <hr style="border: none; border-top: 1px solid #86efac; margin: 15px 0;">
          <p style="margin: 10px 0 0 0; font-size: 16px;">Cost of Business Center:</p>
          <p style="margin: 5px 0 0 0; font-size: 32px; color: #15803d; font-weight: bold;">$39/month</p>
        </div>

        <p style="text-align: center; font-size: 18px;"><strong>Which one makes more sense?</strong></p>

        <p style="text-align: center; margin: 30px 0;">
          <a href="https://reachtheapex.net/dashboard/store" style="background: #0ea5e9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 18px;">Subscribe for $39/month</a>
        </p>

        <p>- The Apex Team</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="font-size: 14px; color: #6b7280;">
          <strong>P.S.</strong> All your CRM data (AI prospects, demo notes, follow-ups) gets deleted 30 days after trial expiration. Don't lose your pipeline.
        </p>
      </div>
    `
  },
  {
    day: 13,
    subject: "🚨 Last day - get the AI Sales Masterclass",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; color: white;">🚨 Last Day</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Your trial expires TOMORROW</p>
        </div>

        <p>Hey Trent,</p>

        <p>Your trial expires <strong>TOMORROW</strong>.</p>

        <p>I want to make this decision easy, so here's a special offer:</p>

        <div style="background: linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%); color: white; border-radius: 8px; padding: 25px; margin: 20px 0;">
          <p style="margin: 0; font-size: 18px; color: white;"><strong>Subscribe TODAY and get:</strong></p>
          <ul style="margin: 15px 0; color: white;">
            <li>✅ Business Center for $39/month (unlimited AI access)</li>
            <li>✅ <strong>BONUS:</strong> "AI Sales Masterclass" - 10 video lessons ($300 value)</li>
            <li>✅ <strong>BONUS:</strong> 100 AI demo scripts for every objection ($200 value)</li>
            <li>✅ <strong>BONUS:</strong> Private Slack channel for AI sellers (priceless)</li>
          </ul>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.3); margin: 15px 0;">
          <p style="margin: 5px 0; font-size: 16px; color: white;">Total value: <span style="text-decoration: line-through;">$539</span></p>
          <p style="margin: 5px 0; font-size: 28px; font-weight: bold; color: #fcd34d;">Your price TODAY: $39</p>
        </div>

        <p style="text-align: center; font-size: 14px; color: #dc2626; font-weight: bold;">This offer expires when your trial ends (tomorrow at midnight).</p>

        <p style="text-align: center; margin: 30px 0;">
          <a href="https://reachtheapex.net/dashboard/store" style="background: #0ea5e9; color: white; padding: 18px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 18px;">Claim Your AI Sales Bonuses - Subscribe Now</a>
        </p>

        <h3>What's in the AI Sales Masterclass:</h3>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <ul style="margin: 0; padding-left: 20px;">
            <li>Lesson 1: How to demo PulseMarket in 90 seconds</li>
            <li>Lesson 2: Overcoming "It's too expensive" objections</li>
            <li>Lesson 3: Selling PulseFlow to small businesses</li>
            <li>Lesson 4: When to upsell PulseDrive vs PulseCommand</li>
            <li>Lesson 5: Using AI tools to recruit (not just sell)</li>
            <li>Lesson 6: Building your personal brand with AI content</li>
            <li>Lesson 7: The 5-minute AI demo that closes 60% of prospects</li>
            <li>Lesson 8: Tracking AI demos in CRM for max conversion</li>
            <li>Lesson 9: Following up with AI prospects (automated sequences)</li>
            <li>Lesson 10: Scaling to 10+ AI subscriptions per month</li>
          </ul>
        </div>

        <p style="text-align: center; font-size: 18px;"><strong>Don't miss this.</strong></p>

        <p>- The Apex Team</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="font-size: 14px; color: #6b7280;">
          <strong>P.S.</strong> No bonuses after trial expires. This is a one-time offer for trial users only.
        </p>
      </div>
    `
  },
  {
    day: 15,
    subject: "You just lost your AI selling edge",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>You just lost your AI selling edge</h2>

        <p>Hey Trent,</p>

        <p>Your Business Center trial ended yesterday.</p>

        <p><strong>Here's what just happened:</strong></p>

        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
          <ul style="margin: 0; padding-left: 20px;">
            <li style="margin: 10px 0;">Your competitors who ARE using Business Center can now answer AI questions <strong>better than you</strong></li>
            <li style="margin: 10px 0;">They can demo the tools more <strong>confidently than you</strong></li>
            <li style="margin: 10px 0;">They have real usage examples - <strong>you don't</strong></li>
            <li style="margin: 10px 0;">They're tracking AI prospects in CRM - <strong>you're not</strong></li>
          </ul>
        </div>

        <div style="background: #fff7ed; border: 2px solid #f97316; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-weight: bold;">While you're guessing how PulseMarket works...</p>
          <p style="margin: 0 0 15px 0; color: #15803d;">→ They're showing prospects THEIR results.</p>

          <p style="margin: 0 0 10px 0; font-weight: bold;">While you're fumbling AI demos...</p>
          <p style="margin: 0 0 15px 0; color: #15803d;">→ They're closing deals.</p>

          <p style="margin: 0 0 10px 0; font-weight: bold;">While you're losing track of AI prospects...</p>
          <p style="margin: 0 0 0 0; color: #15803d;">→ They're following up systematically.</p>
        </div>

        <p style="font-size: 18px; font-weight: bold;">The gap between you and them just got wider.</p>

        <h3>Here's your choice:</h3>

        <div style="text-align: center; margin: 30px 0;">
          <p style="margin: 0 0 20px 0; font-size: 16px;">
            <strong>Option 1:</strong> Subscribe now and catch back up
          </p>
          <a href="https://reachtheapex.net/dashboard/store" style="background: #0ea5e9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 18px; margin-bottom: 20px;">Subscribe for $39/month</a>

          <p style="margin: 20px 0 0 0; font-size: 16px; color: #6b7280;">
            <strong>Option 2:</strong> Keep losing AI sales to better-prepared reps
          </p>
        </div>

        <p style="text-align: center; font-size: 18px;"><strong>What's it going to be?</strong></p>

        <p>- The Apex Team</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="font-size: 14px; color: #6b7280;">
          <strong>P.S.</strong> Your CRM data (all those AI prospects you added) is still saved for 30 days. Subscribe now and pick up where you left off. Wait too long, and they're gone forever.
        </p>
      </div>
    `
  }
];

async function sendEmails() {
  console.log('📧 Sending Business Center Nurture Email Examples...\n');

  for (const email of emails) {
    try {
      console.log(`📨 Sending Day ${email.day} email: "${email.subject}"`);

      const result = await resend.emails.send({
        from: 'Apex Affinity Group <theapex@theapexway.net>',
        to: 'tdaniel@botmakers.ai',
        subject: `[EXAMPLE - Day ${email.day}] ${email.subject}`,
        html: email.html
      });

      if (result.error) {
        console.error(`❌ Error sending Day ${email.day}:`, result.error);
      } else {
        console.log(`✅ Day ${email.day} sent! Email ID: ${result.data.id}\n`);
      }

      // Wait 2 seconds between emails to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`❌ Failed to send Day ${email.day}:`, error.message);
    }
  }

  console.log('\n✅ All example emails sent to tdaniel@botmakers.ai!');
  console.log('\n📋 Check your inbox to review the nurture campaign flow.');
  console.log('💡 These are templates - you can customize them for your voice and brand.');
}

sendEmails();
