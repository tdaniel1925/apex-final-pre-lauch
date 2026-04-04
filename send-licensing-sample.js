#!/usr/bin/env node

/**
 * Send Licensing Series Sample Email
 */

import { Resend } from 'resend';
import { config } from 'dotenv';

config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

const sampleEmail = {
  subject: "🎓 Get Your Life Insurance License in 14 Days - Day 1",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #f8fafc;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%); color: white; padding: 40px 30px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 15px;">🎓</div>
        <h1 style="margin: 0; font-size: 28px; color: white; font-weight: bold;">Get Licensed Series</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; color: #e0f2fe;">Day 1 of 14 • Complete Guide to Your Insurance License</p>
      </div>

      <!-- Main Content -->
      <div style="background: white; padding: 40px 30px;">
        <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; line-height: 1.3;">
          Why Get Licensed? The Income Opportunity
        </h2>

        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          Welcome to your 14-day journey to getting your life insurance license! Today we're covering why this matters and what's possible for your income.
        </p>

        <!-- Key Stats -->
        <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 30px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">The Income Difference:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #334155;">
            <li style="margin: 8px 0;">Licensed agents earn <strong>2-5x more</strong> than unlicensed distributors</li>
            <li style="margin: 8px 0;">Life insurance commissions: <strong>70-90%</strong> (not 5-10%)</li>
            <li style="margin: 8px 0;">Average sale: <strong>$500-$2,000</strong> commission per policy</li>
            <li style="margin: 8px 0;">Pass rate with proper prep: <strong>90%</strong></li>
          </ul>
        </div>

        <!-- What You'll Learn -->
        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 30px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px;">📚 Your 14-Day Curriculum:</h3>
          <div style="color: #475569; font-size: 15px; line-height: 1.8;">
            <strong>Days 1-2:</strong> Introduction & Course Selection<br>
            <strong>Days 3-5:</strong> Study Strategy & Insurance Fundamentals<br>
            <strong>Days 6-8:</strong> Policy Types & Underwriting<br>
            <strong>Days 9-11:</strong> Regulations & Business Applications<br>
            <strong>Days 12-13:</strong> Test-Taking Strategies<br>
            <strong>Day 14:</strong> Exam Day Prep
          </div>
        </div>

        <!-- Action Item -->
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 25px; border-radius: 12px; margin: 30px 0;">
          <div style="font-size: 32px; margin-bottom: 10px;">🎯</div>
          <h3 style="margin: 0 0 10px 0; font-size: 18px; color: white;">Today's Action Item:</h3>
          <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #dcfce7;">
            Research your state's life insurance license requirements. Find: required hours, exam fee, and background check info.
          </p>
        </div>

        <!-- Resources -->
        <div style="background: #fefce8; border: 2px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 30px 0;">
          <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #92400e;">📋 Helpful Resources:</h3>
          <p style="margin: 0; font-size: 14px; color: #78350f; line-height: 1.6;">
            • Your State Department of Insurance website<br>
            • NAIC.org (National Association of Insurance Commissioners)<br>
            • Tomorrow: We'll help you choose your pre-license course
          </p>
        </div>

        <!-- CTA -->
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #64748b; font-size: 14px; margin-bottom: 15px;">
            Want to learn more about the licensing process?
          </p>
          <a href="https://reachtheapex.net/training/licensing/1" style="display: inline-block; background: #0ea5e9; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">
            View Full Training Page →
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <!-- Footer -->
        <p style="margin: 20px 0 10px 0; font-size: 16px; color: #64748b; text-align: center;">
          See you tomorrow with Day 2:<br>
          <strong style="color: #1e293b;">"Choosing Your Pre-License Course"</strong>
        </p>

        <!-- Progress -->
        <div style="margin-top: 30px; padding: 20px; background: #fefce8; border-radius: 8px; border: 2px solid #fbbf24;">
          <p style="margin: 0 0 10px 0; font-size: 12px; color: #92400e; text-transform: uppercase; font-weight: bold;">📊 YOUR PROGRESS</p>
          <p style="margin: 0; font-size: 14px; color: #78350f;">
            <strong>Day 1 of 14</strong> • Next lesson arrives tomorrow at 7:00 AM
          </p>
          <div style="background: #fef3c7; height: 6px; border-radius: 3px; margin-top: 10px; overflow: hidden;">
            <div style="background: #f59e0b; height: 100%; width: 7.1%; border-radius: 3px;"></div>
          </div>
        </div>

        <!-- Note -->
        <div style="margin-top: 20px; padding: 15px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; font-size: 13px; color: #1e40af;">
            <strong>💡 This is a sample email</strong> showing what your licensing series could look like. Complete series includes 14 daily emails with comprehensive training content.
          </p>
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
};

async function sendSample() {
  console.log('📧 Sending Licensing Series Sample Email...\\n');

  try {
    const result = await resend.emails.send({
      from: 'Apex Affinity Group <theapex@theapexway.net>',
      to: 'trenttdaniel@gmail.com',
      subject: `[SAMPLE] ${sampleEmail.subject}`,
      html: sampleEmail.html
    });

    if (result.error) {
      console.error(`❌ Error:`, result.error);
    } else {
      console.log(`✅ Sample sent to trenttdaniel@gmail.com!`);
      console.log(`📧 Email ID: ${result.data.id}\\n`);
      console.log('📋 What was sent:');
      console.log('   - Day 1 of licensing series');
      console.log('   - "Why Get Licensed?" content');
      console.log('   - Income opportunity breakdown');
      console.log('   - Action item + resources');
      console.log('   - Progress tracking');
      console.log('\\n📝 Complete Series Outline:');
      console.log('   Days 1-2: Introduction & course selection');
      console.log('   Days 3-5: Study strategy & fundamentals');
      console.log('   Days 6-8: Policy types & underwriting');
      console.log('   Days 9-11: Regulations & business uses');
      console.log('   Days 12-13: Test-taking strategies');
      console.log('   Day 14: Exam day preparation');
    }

  } catch (error) {
    console.error(`❌ Failed to send:`, error.message);
  }
}

sendSample();
