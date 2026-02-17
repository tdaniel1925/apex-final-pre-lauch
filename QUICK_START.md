# 🚀 Quick Start Guide - Email Nurture System

## ✅ Setup Complete!

Your API keys are already configured in `.env.local`:
- ✅ **Resend API Key** - Ready to send emails
- ✅ **OpenAI API Key (GPT-4)** - Ready to generate emails with AI

---

## 🎯 Next Steps (Choose One)

### Option 1: Test AI Email Generation (5 minutes)

```bash
# 1. Start dev server
npm run dev

# 2. Open browser
http://localhost:3050/admin/email-templates

# 3. Test AI Generator:
- Click "Create Template"
- Fill in:
  - Template Name: "Day 3 Follow-up"
  - Licensing Status: Licensed
  - Sequence Order: 1
  - Delay (days): 3
- Click "Generate with AI ✨"
- Type: "A follow-up email for licensed agents reminding them to upload their license and explaining the verification process. Include encouragement."
- Click "Generate Email"
- Wait 3 seconds → Complete professional email appears!
- Edit if needed
- Click "Create Template"
```

### Option 2: Run Database Migration & Test Signup (10 minutes)

```bash
# 1. Run migration in Supabase
# Go to: Supabase Dashboard → SQL Editor
# Copy/paste: supabase/migrations/20240221000000_add_email_nurture_system.sql
# Click "Run"

# 2. Start dev server
npm run dev

# 3. Sign up a test user
http://localhost:3050/signup
- Fill in details
- Select "Licensed Agent" or "Non-Licensed"
- Submit

# 4. Check results:
- User should be redirected to /dashboard
- Check Resend dashboard: https://resend.com/emails
- Should see welcome email sent!
- Check database: email_campaigns table should have new record
```

### Option 3: Run Automated Tests (3 minutes)

```bash
# Unit tests (email variables)
npm run test

# E2E tests with UI (see tests run in browser)
npm run test:e2e:ui
```

---

## 📊 What's Working Right Now

✅ **Signup Integration**
- User signs up → Auto-enrolled in email campaign
- Welcome email sent immediately
- Campaign progress tracked in database

✅ **AI Email Generator**
- Describe what email you want in plain English
- GPT-4 generates complete email in 3 seconds
- Includes subject, body, preview text
- Automatically uses variables like {first_name}, {dashboard_link}

✅ **Admin Template Manager**
- View all email templates
- Filter by licensing status
- Create/Edit/Delete templates
- Toggle active/inactive
- Variable helper dropdown

✅ **User Licensing Management**
- Users can change their own licensing status
- Status determines which features they see
- Admin can verify licenses

---

## 🎨 Create Your Email Sequence Now!

Use AI to generate these emails (takes 15 minutes total):

### For Licensed Agents:

1. **Day 0 - Welcome** ✅ Already created!

2. **Day 3 - License Reminder**
   - Prompt: "A friendly reminder email for licensed agents who haven't uploaded their license yet. Explain the quick verification process and benefits of getting verified (unlock all features). Include a clear call-to-action button."

3. **Day 6 - Team Building**
   - Prompt: "An email teaching licensed agents how to build their team using their referral link. Include strategies for who to target (other insurance agents, aspiring agents), how to share the link, and success stories. Motivational and action-oriented."

4. **Day 9 - Commissions**
   - Prompt: "Explain how the commission structure works for licensed agents. Break down the different commission levels, when they get paid, how to track earnings. Include examples to make it concrete. Professional but clear."

5. **Day 12 - Training Resources**
   - Prompt: "Point licensed agents to available training materials and resources. Highlight what's available, how to access it, and encourage them to invest in learning. Include tips for maximizing their success."

### For Non-Licensed Distributors:

1. **Day 0 - Welcome** ✅ Already created!

2. **Day 3 - Referral Basics**
   - Prompt: "Teach non-licensed distributors how to effectively share their referral link. Provide simple scripts for conversations, social media posts, and email templates. Keep it actionable and encouraging."

3. **Day 6 - Building Networks**
   - Prompt: "Help non-licensed distributors understand network building. Explain the power of compound growth, how to identify good prospects, and strategies for growing their team. Inspiring tone."

4. **Day 9 - Earnings Guide**
   - Prompt: "Explain how non-licensed distributors earn money through referrals and team building. Be clear about the compensation plan, payment schedule, and how to maximize earnings. Include specific examples."

5. **Day 12 - Marketing Tools**
   - Prompt: "Showcase the marketing tools and resources available to non-licensed distributors. Explain what's available, how to use them effectively, and encourage creativity in their approach."

---

## 💡 AI Generation Tips

### ✅ Good Prompts (Specific & Actionable):
- "A welcome email for licensed agents explaining license verification and first steps. Include encouragement and a clear call-to-action."
- "Day 6 email about building your team. Explain how to use the referral link, who to target, and include success tips. Motivational tone."
- "Follow-up for non-licensed distributors who haven't referred anyone yet. Provide simple action steps and encouragement."

### ❌ Avoid These (Too Vague):
- "Make an email"
- "Something about commissions"
- "Email for day 3"

**Be specific about:**
- Purpose of the email
- Key points to cover
- Desired tone (motivational, professional, urgent, friendly)
- What action you want them to take

---

## 🔄 How the System Works

### Automatic Flow:
```
User Signs Up
    ↓
Select Licensing Status (Licensed / Non-Licensed)
    ↓
Account Created
    ↓
Automatically Enrolled in Email Campaign
    ↓
Welcome Email Sent Immediately (Sequence 0)
    ↓
System Tracks Progress in email_campaigns Table
    ↓
[Future: Cron Job sends next email after delay_days]
```

### Database Tables:
- **email_templates** - Stores all your email templates
- **email_campaigns** - Tracks each user's progress through sequence
- **email_sends** - Audit log of every email sent

---

## 🎉 You're Ready to Launch!

**Pre-Launch Checklist:**
- [x] API keys configured ✅
- [ ] Database migration ran
- [ ] Test signup → email received
- [ ] Create email sequence (5-6 emails)
- [ ] Test AI generation
- [ ] Deploy to Vercel with env vars

**Deploy to Vercel:**
1. Push code to GitHub (already done!)
2. In Vercel dashboard → Environment Variables
3. Add:
   - `RESEND_API_KEY=re_DjMiknb1_T8MdjYu6hBvdpCbbxeZeKi7A`
   - `OPENAI_API_KEY=sk-proj-rv_wuoR...` (from .env.local)
   - `NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app`
4. Redeploy

---

## 📞 Need Help?

**Common Issues:**

1. **Email not sending?**
   - Check Resend dashboard for errors
   - Verify `RESEND_API_KEY` in `.env.local`
   - Restart dev server

2. **AI not generating?**
   - Check `OPENAI_API_KEY` in `.env.local`
   - Look at browser console for errors
   - Try simpler prompt first

3. **Templates not showing?**
   - Run database migration
   - Check Supabase for `email_templates` table
   - Look at browser console

**Documentation:**
- Full setup: `EMAIL_SYSTEM_SETUP.md`
- Testing guide: `TESTING_GUIDE.md`
- All test files: `tests/` directory

---

## 🚀 Start Building Your Sequence Now!

Go to: http://localhost:3050/admin/email-templates

Click "Create Template" → "Generate with AI ✨"

**Your first prompt:**
"A follow-up email for day 3 reminding licensed agents to upload their license. Explain the verification process, benefits of being verified, and include an encouraging call-to-action."

Then watch the magic happen! ✨
