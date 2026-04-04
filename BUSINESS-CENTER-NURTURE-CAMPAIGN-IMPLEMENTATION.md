# Business Center Nurture Campaign - Implementation Guide

**Date:** April 3, 2026
**Status:** ✅ Complete - Ready to Deploy

---

## Overview

Automated 7-email nurture campaign for Business Center trial users. Designed to convert trial users into paying subscribers ($39/month).

### Campaign Flow

| Day | Email Theme | Goal |
|-----|-------------|------|
| **Day 1** | Try the AI tools yourself | Get users to test features |
| **Day 3** | You're using more AI than 80% of reps | Build confidence, encourage more usage |
| **Day 7** | How Marcus sold 12 AI subscriptions in 30 days | Social proof, ROI demonstration |
| **Day 10** | The AI feature that closes deals | Teach specific technique |
| **Day 12** | ⏰ 2 days left - here's what you'll lose | Urgency, fear of missing out |
| **Day 13** | 🚨 Last day - get the AI Sales Masterclass | Limited-time bonus offer |
| **Day 15** | You just lost your AI selling edge | Post-expiration nudge |

---

## Architecture

### 1. Database Table: `business_center_nurture_emails`

Tracks all scheduled nurture emails for each distributor.

**Schema:**
```sql
CREATE TABLE business_center_nurture_emails (
  id UUID PRIMARY KEY,
  distributor_id UUID REFERENCES distributors(id),
  email_day INTEGER, -- 1, 3, 7, 10, 12, 13, 15
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  email_id TEXT, -- Resend email ID
  status TEXT, -- scheduled, sent, failed, cancelled
  error_message TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(distributor_id, email_day)
);
```

### 2. Auto-Scheduling Trigger

When a distributor gets a Business Center trial (via `service_access` table), the trigger `schedule_business_center_nurture_emails()` automatically schedules all 7 emails:

```sql
INSERT INTO business_center_nurture_emails (distributor_id, email_day, scheduled_for)
VALUES
  (NEW.distributor_id, 1, trial_start + INTERVAL '1 day'),
  (NEW.distributor_id, 3, trial_start + INTERVAL '3 days'),
  (NEW.distributor_id, 7, trial_start + INTERVAL '7 days'),
  ...
```

### 3. Auto-Cancellation Trigger

If a distributor subscribes (converts `is_trial = FALSE`), the trigger `cancel_nurture_on_subscribe()` cancels all remaining scheduled emails:

```sql
UPDATE business_center_nurture_emails
SET status = 'cancelled'
WHERE distributor_id = NEW.distributor_id
  AND status = 'scheduled'
  AND scheduled_for > NOW();
```

### 4. Email Templates

**Location:** `src/lib/email/nurture/business-center-templates.ts`

Function: `getNurtureEmailTemplate(day: number, firstName: string)`

Returns personalized HTML email for each day of the campaign.

### 5. Cron Job API Endpoint

**Endpoint:** `/api/cron/send-nurture-emails`
**Schedule:** Every hour (`0 * * * *`)
**Auth:** Requires `CRON_SECRET` in Authorization header

**Process:**
1. Fetch all emails where `status = 'scheduled'` AND `scheduled_for <= NOW()`
2. For EACH email (never mass send):
   - Get distributor info (first name, email)
   - Load email template for that day
   - Send email to SINGLE RECIPIENT ONLY
   - Mark as `sent` or `failed` in database
3. Rate limit: 100ms between emails

**Key Security Feature:**
```typescript
// NEVER send to multiple recipients
const result = await resend.emails.send({
  from: 'Apex Affinity Group <theapex@theapexway.net>',
  to: email, // SINGLE recipient - NEVER an array
  subject: template.subject,
  html: template.html
});
```

---

## Privacy & Security

### CRITICAL: Individual Email Sending

**RULE:** Every nurture email is sent to ONE recipient at a time.

**WHY:** Protects recipient privacy. Recipients NEVER see other people's email addresses.

**CODE:**
```typescript
// ✅ CORRECT: Send to one person
to: 'john@example.com'

// ❌ WRONG: Exposes all emails to each other
to: ['john@example.com', 'jane@example.com', ...]
```

**ENFORCEMENT:** The cron job loops through emails and sends individually:

```typescript
for (const emailRecord of scheduledEmails) {
  // Send to THIS ONE person only
  await resend.emails.send({
    to: emailRecord.distributor.email // Single email
  });
}
```

---

## Deployment Checklist

### Step 1: Apply Database Migration

Run this SQL in Supabase Dashboard:

**File:** `supabase/migrations/20260403000002_business_center_nurture_campaign.sql`

```sql
-- Creates table, triggers, and RLS policies
```

**Verification:**
```sql
-- Check table exists
SELECT * FROM business_center_nurture_emails LIMIT 1;

-- Check trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'schedule_nurture_on_trial_grant';
```

### Step 2: Set Environment Variables

Add to Vercel environment variables:

```bash
CRON_SECRET=<generate-random-secret>
RESEND_API_KEY=<your-resend-api-key>
```

**Generate CRON_SECRET:**
```bash
openssl rand -base64 32
```

### Step 3: Deploy to Vercel

```bash
git add .
git commit -m "feat: add Business Center nurture campaign automation"
git push origin main
```

Vercel will automatically:
- Deploy the new cron job
- Register the hourly schedule
- Start sending emails on schedule

### Step 4: Test with New Trial User

1. Create a test distributor account (or use existing)
2. Manually grant them a Business Center trial:
```sql
INSERT INTO service_access (distributor_id, product_id, is_trial, granted_at, trial_ends_at, status)
VALUES (
  '<distributor-id>',
  (SELECT id FROM products WHERE slug = 'businesscenter'),
  TRUE,
  NOW(),
  NOW() + INTERVAL '14 days',
  'active'
);
```
3. Check emails were scheduled:
```sql
SELECT * FROM business_center_nurture_emails
WHERE distributor_id = '<distributor-id>'
ORDER BY email_day;
```
4. Manually trigger the cron job to send Day 1 immediately:
```bash
curl -X POST https://reachtheapex.net/api/cron/send-nurture-emails \
  -H "Authorization: Bearer <CRON_SECRET>"
```

### Step 5: Monitor First Week

Check daily:
```sql
-- See send statistics
SELECT
  status,
  COUNT(*) as count,
  email_day
FROM business_center_nurture_emails
GROUP BY status, email_day
ORDER BY email_day, status;

-- Check failures
SELECT * FROM business_center_nurture_emails
WHERE status = 'failed'
ORDER BY updated_at DESC
LIMIT 10;
```

---

## How It Works (Example Timeline)

**March 1, 10:00 AM:** Sarah signs up as a distributor
→ Trial auto-granted via `grant_business_center_trial()` trigger
→ 7 emails scheduled via `schedule_business_center_nurture_emails()` trigger

**Scheduled emails:**
- March 2, 10:00 AM - Day 1 email
- March 4, 10:00 AM - Day 3 email
- March 8, 10:00 AM - Day 7 email
- March 11, 10:00 AM - Day 10 email
- March 13, 10:00 AM - Day 12 email
- March 14, 10:00 AM - Day 13 email
- March 16, 10:00 AM - Day 15 email

**March 2, 11:00 AM:** Cron job runs
→ Finds Day 1 email scheduled for 10:00 AM (past due)
→ Sends email to sarah@example.com
→ Marks as `sent` in database

**March 10, 3:00 PM:** Sarah subscribes to Business Center
→ `cancel_nurture_on_subscribe()` trigger fires
→ Cancels Day 12, 13, 15 emails (not yet sent)
→ Sarah stops receiving nurture emails

---

## Email Content Strategy

### Week 1 (Days 1-7): Education & Social Proof
- Day 1: Direct task (try AI chatbot)
- Day 3: Encouragement (you're doing great)
- Day 7: Case study (Marcus's success story)

**Goal:** Build confidence, encourage usage, demonstrate value

### Week 2 (Days 10-13): Urgency & Conversion
- Day 10: Teach closing technique
- Day 12: Loss aversion (2 days left)
- Day 13: Limited-time bonus offer

**Goal:** Create urgency, trigger FOMO, incentivize immediate action

### Post-Trial (Day 15): Recovery
- Day 15: Competitor advantage (they're ahead of you now)

**Goal:** Catch late converters, re-engage expired trials

---

## Customization

### Change Email Schedule

Edit `schedule_business_center_nurture_emails()` function:

```sql
-- Example: Send Day 1 email immediately (0 days)
(NEW.distributor_id, 1, trial_start + INTERVAL '0 days', 'scheduled'),

-- Example: Add Day 20 email (recovery attempt #2)
(NEW.distributor_id, 20, trial_start + INTERVAL '20 days', 'scheduled'),
```

### Change Email Content

Edit templates in `src/lib/email/nurture/business-center-templates.ts`:

```typescript
export function getNurtureEmailTemplate(day: number, firstName: string) {
  const templates: Record<number, Omit<NurtureEmailTemplate, 'day'>> = {
    1: {
      subject: "YOUR NEW SUBJECT",
      html: `YOUR NEW HTML CONTENT`
    },
    // ... other days
  };
}
```

### Add New Email Day

1. Update database function to schedule the new day
2. Add template in `business-center-templates.ts`
3. Redeploy

---

## Analytics & Reporting

### Conversion Rate

```sql
SELECT
  COUNT(DISTINCT CASE WHEN status = 'sent' THEN distributor_id END) as received_emails,
  COUNT(DISTINCT CASE WHEN sa.is_trial = FALSE THEN distributor_id END) as converted,
  ROUND(
    COUNT(DISTINCT CASE WHEN sa.is_trial = FALSE THEN distributor_id END)::DECIMAL /
    COUNT(DISTINCT CASE WHEN status = 'sent' THEN distributor_id END) * 100,
    2
  ) as conversion_rate_percent
FROM business_center_nurture_emails bcne
LEFT JOIN service_access sa ON sa.distributor_id = bcne.distributor_id
WHERE bcne.created_at >= NOW() - INTERVAL '30 days';
```

### Email Performance by Day

```sql
SELECT
  email_day,
  COUNT(*) FILTER (WHERE status = 'sent') as sent,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'sent')::DECIMAL /
    COUNT(*) * 100,
    2
  ) as success_rate_percent
FROM business_center_nurture_emails
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY email_day
ORDER BY email_day;
```

### Average Time to Conversion

```sql
SELECT
  AVG(
    EXTRACT(EPOCH FROM (sa.updated_at - sa.granted_at)) / 86400
  ) as avg_days_to_conversion
FROM service_access sa
WHERE sa.is_trial = FALSE
  AND sa.granted_at >= NOW() - INTERVAL '30 days';
```

---

## Troubleshooting

### Emails Not Sending

**Check 1: Are emails scheduled?**
```sql
SELECT * FROM business_center_nurture_emails
WHERE status = 'scheduled'
  AND scheduled_for <= NOW()
LIMIT 10;
```

**Check 2: Is cron job running?**
- Check Vercel logs: https://vercel.com/dashboard → Logs → Filter: `/api/cron/send-nurture-emails`
- Manually trigger: `curl -X POST <url> -H "Authorization: Bearer <CRON_SECRET>"`

**Check 3: Resend API key valid?**
- Check Vercel env vars
- Test in Resend dashboard: https://resend.com/api-keys

### Emails Marked as Failed

```sql
SELECT email_day, error_message, COUNT(*)
FROM business_center_nurture_emails
WHERE status = 'failed'
GROUP BY email_day, error_message
ORDER BY COUNT(*) DESC;
```

Common errors:
- **Domain not verified:** Add/verify domain in Resend
- **Rate limit exceeded:** Adjust rate limiting in cron job
- **Invalid email:** Clean up distributor email addresses

### Users Not Getting Trials

Check trigger is working:
```sql
SELECT * FROM pg_trigger
WHERE tgname = 'auto_grant_bc_trial';
```

Manually grant trial:
```sql
SELECT grant_business_center_trial();
```

---

## Success Metrics (Expected)

Based on industry benchmarks for SaaS trial-to-paid conversion:

| Metric | Target |
|--------|--------|
| Trial→Paid conversion rate | 15-25% |
| Average time to conversion | 7-10 days |
| Day 1 email open rate | 40-50% |
| Day 13 email click rate | 15-20% |
| Revenue per trial user | $5.85-$9.75 ($39 × conversion rate) |

**Monthly Revenue Impact:**
- 100 new trials/month × 20% conversion = 20 new subscribers
- 20 subscribers × $39/month = **$780/month recurring**
- Annual: **$9,360/year** from this campaign alone

---

## Files Created/Modified

### New Files:
1. `supabase/migrations/20260403000002_business_center_nurture_campaign.sql` - Database schema
2. `src/lib/email/nurture/business-center-templates.ts` - Email templates
3. `src/app/api/cron/send-nurture-emails/route.ts` - Cron job endpoint

### Modified Files:
1. `vercel.json` - Added cron job schedule
2. `CLAUDE.md` - Updated email domain rules

### Documentation:
1. `BUSINESS-CENTER-NURTURE-CAMPAIGN-IMPLEMENTATION.md` - This file

---

## Next Steps

1. **Apply database migration** in Supabase Dashboard
2. **Set CRON_SECRET** environment variable in Vercel
3. **Deploy to production** (`git push`)
4. **Test with one trial user** to verify end-to-end flow
5. **Monitor for 14 days** to see first complete cycle
6. **Analyze conversion rate** after 30 days
7. **Iterate on email content** based on open/click rates

---

**Status:** ✅ Ready for Production Deployment
**Risk Level:** Low (emails sent individually, can be paused anytime)
**Rollback Plan:** Set all scheduled emails to 'cancelled' status if needed
