# Email Nurture System - Setup Guide

## 🔑 Step 1: Add API Keys to Environment

Add these to your `.env.local` file:

```env
# Resend API Key (for sending emails)
RESEND_API_KEY=re_DjMiknb1_T8MdjYu6hBvdpCbbxeZeKi7A

# Anthropic API Key (for AI email generation)
# Get from: https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=your_anthropic_key_here

# App URL (for email links)
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
# For local: NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Get Anthropic API Key:
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Navigate to Settings → API Keys
4. Create new key
5. Copy and paste into `.env.local`

## 📊 Step 2: Run Database Migration

```bash
# Connect to your Supabase project
# Go to Supabase Dashboard → SQL Editor
# Paste and run the migration file:
supabase/migrations/20240221000000_add_email_nurture_system.sql
```

This creates:
- `email_templates` table
- `email_campaigns` table
- `email_sends` table
- Welcome email templates (licensed & non-licensed)

## ✅ Step 3: Verify Setup

### Test Email Sending:
1. Sign up a new test user
2. Check that welcome email was sent
3. Verify in Resend dashboard: https://resend.com/emails

### Test AI Generation:
1. Go to `/admin/email-templates` as admin
2. Click "Create Template"
3. Click "Generate with AI ✨"
4. Type: "A follow-up email explaining commission structure"
5. Should generate complete email in ~3 seconds

## 🎯 Step 4: Create Your Email Sequence

### Example Sequence for Licensed Agents:

**Day 0 (Welcome)** - Already created ✅
- Subject: "Welcome to Apex Affinity Group, {first_name}!"
- Content: Verify license, next steps

**Day 3 (License Verification)**
- Describe: "A follow-up reminding licensed agents to upload their license if they haven't yet"
- Use AI generator to create

**Day 6 (Building Your Team)**
- Describe: "An email about how to use their referral link and build a team"
- Use AI generator

**Day 9 (Commission Structure)**
- Describe: "Explain how commissions work and when they get paid"
- Use AI generator

**Day 12 (Training Resources)**
- Describe: "Point them to training materials and success tips"
- Use AI generator

### Example Sequence for Non-Licensed:

**Day 0 (Welcome)** - Already created ✅

**Day 3** - "How to share your referral link effectively"
**Day 6** - "Building your network"
**Day 9** - "Understanding your earnings"
**Day 12** - "Marketing tools available to you"

## 🔄 How It Works

### Automatic Enrollment:
- New user signs up → Automatically enrolled in campaign
- Gets welcome email immediately (sequence 0)
- System tracks their progress

### Scheduled Sends (Phase C - After Launch):
- Cron job runs daily
- Checks who needs their next email
- Sends automatically based on delay_days
- Updates campaign progress

## 📧 Email Variables Available

Use these in your templates:

- `{first_name}` - John
- `{last_name}` - Smith
- `{email}` - john@example.com
- `{company_name}` - Acme Insurance
- `{licensing_status}` - Licensed Agent / Non-Licensed Distributor
- `{dashboard_link}` - Link to dashboard
- `{profile_link}` - Link to profile
- `{referral_link}` - Their unique signup URL
- `{team_link}` - Link to team page
- `{matrix_link}` - Link to matrix view
- `{unsubscribe_link}` - Unsubscribe URL

## 🎨 AI Generation Tips

### Good Prompts:
✅ "A welcome email for licensed agents explaining license verification and first steps. Include encouragement and a clear call-to-action."

✅ "Day 6 email about building your team. Explain how to use the referral link, who to target, and include success tips."

✅ "Follow-up for non-licensed distributors who haven't referred anyone yet. Motivational tone, provide simple action steps."

### Less Effective Prompts:
❌ "Make an email"
❌ "Something about commissions"
❌ "Email for day 3"

**Be specific about:**
- What the email should accomplish
- Tone (motivational, informational, urgent, etc.)
- Key points to cover
- Desired action

## 🐛 Troubleshooting

### Emails not sending?
1. Check `RESEND_API_KEY` in `.env.local`
2. Verify Resend account is active
3. Check domain verification in Resend dashboard
4. Look at logs in `/api/signup` for errors

### AI not generating?
1. Check `ANTHROPIC_API_KEY` in `.env.local`
2. Verify API key has credits
3. Check browser console for errors
4. Try simpler prompt first

### Welcome email not sent on signup?
1. Check database migration ran successfully
2. Verify welcome templates exist (sequence_order = 0)
3. Check `email_campaigns` table has records
4. Look at `email_sends` table for send status

## 💰 Costs

- **Resend**: Free up to 3,000 emails/month, then $20/month
- **Anthropic AI**: ~$0.03 per generation (very cheap)
  - Generating 100 templates = ~$3
  - Most admins create 10-20 templates max

## 📚 Admin Interface

### Access:
`/admin/email-templates`

### Features:
- List all templates (filter by licensing status)
- Create new with AI or manually
- Edit existing templates
- Delete templates
- Toggle active/inactive
- Preview with sample data

### AI Generator:
1. Click "Create Template"
2. Fill in basic info (licensing status, sequence)
3. Click "Generate with AI ✨"
4. Describe what you want
5. Wait 3 seconds
6. Review and edit if needed
7. Save

## 🚀 Next Steps (Phase C - After Launch)

1. Set up Vercel Cron Job for automated sending
2. Add email analytics (opens, clicks)
3. A/B testing different subject lines
4. Unsubscribe management
5. Email preview before sending
6. Campaign performance dashboard
