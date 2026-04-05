# n8n Migration Opportunities - Apex Platform

**Date:** April 4, 2026
**Purpose:** Identify processes that should be moved from internal code to n8n workflows for better maintainability and dependency mapping

---

## 🎯 Why Move to n8n?

**Benefits:**
1. **Visual Workflow Mapping** - See entire process flow at a glance
2. **Easier Debugging** - View execution history and logs visually
3. **No Code Deployments** - Update workflows without deploying code
4. **Better Error Handling** - Built-in retry logic and error paths
5. **Clearer Dependencies** - Visual connections show what depends on what
6. **Faster Iterations** - Non-developers can modify workflows
7. **Centralized Monitoring** - All automated processes in one place

---

## 🔴 HIGH PRIORITY - Move These First

### 1. **Nurture Email Campaigns** ⭐⭐⭐
**Current:** `src/app/api/cron/send-nurture-emails/route.ts`

**What it does:**
- Runs every hour
- Queries `business_center_nurture_emails` table for scheduled emails
- Sends individual emails via Resend
- Updates status in database
- Handles errors and retries

**n8n Workflow:**
```
1. Schedule Trigger (every hour)
   ↓
2. Supabase: Query scheduled emails
   ↓
3. Loop: For each email
   ↓
4. Resend: Send individual email
   ↓
5. Supabase: Update email status
   ↓
6. Error Handler: Log failures
```

**Why move:**
- Complex email logic scattered across code
- Hard to debug email delivery issues
- Difficult to see workflow at a glance
- Template logic mixed with sending logic

**Impact:** HIGH - Used for all AI nurture campaigns

---

### 2. **Daily Enrollment Report** ⭐⭐⭐
**Current:** `src/app/api/cron/daily-enrollment-report/route.ts`

**What it does:**
- Runs daily at 9 AM
- Queries new signups from yesterday
- Formats data into email
- Sends report to admin team
- Logs activity

**n8n Workflow:**
```
1. Schedule Trigger (daily 9 AM)
   ↓
2. Supabase: Query yesterday's signups
   ↓
3. Function: Format data as HTML table
   ↓
4. Resend: Send report email
   ↓
5. Supabase: Log activity
```

**Why move:**
- Simple workflow, perfect for n8n
- No complex business logic
- Easy to modify report format
- Non-developers can update recipients

**Impact:** MEDIUM - Admin convenience

---

### 3. **Onboarding Reminders** ⭐⭐⭐
**Current:** `src/app/api/cron/onboarding-reminders/route.ts`

**What it does:**
- Runs daily
- Finds incomplete onboarding sessions
- Sends reminder emails
- Updates reminder status
- Tracks engagement

**n8n Workflow:**
```
1. Schedule Trigger (daily 10 AM)
   ↓
2. Supabase: Query incomplete onboardings
   ↓
3. Filter: Only users who haven't received reminder
   ↓
4. Loop: For each user
   ↓
5. Resend: Send reminder email
   ↓
6. Supabase: Update reminder_sent timestamp
```

**Why move:**
- Currently hardcoded reminder logic
- Difficult to A/B test reminder timing
- Can't easily change reminder cadence
- Hard to see who got reminders when

**Impact:** HIGH - Critical for conversion

---

### 4. **Process Clawbacks** ⭐⭐
**Current:** `src/app/api/cron/process-clawbacks/route.ts`

**What it does:**
- Runs daily
- Finds refunded orders within 30 days
- Calculates clawback amounts
- Updates commission records
- Notifies affected distributors

**n8n Workflow:**
```
1. Schedule Trigger (daily midnight)
   ↓
2. Supabase: Query recent refunds
   ↓
3. Loop: For each refund
   ↓
4. Function: Calculate clawback amount
   ↓
5. Supabase: Update commission records
   ↓
6. Resend: Notify distributor
   ↓
7. Slack: Notify admin team
```

**Why move:**
- Currently buried in code
- Hard to audit clawback history
- Difficult to debug calculation errors
- No visibility into process execution

**Impact:** HIGH - Financial compliance

---

### 5. **Sync Failed Replicated Sites** ⭐⭐
**Current:** `src/app/api/cron/sync-failed-sites/route.ts`

**What it does:**
- Runs every 15 minutes
- Finds distributors missing replicated sites
- Calls Jordyn API to create sites
- Updates sync status
- Retries failed syncs

**n8n Workflow:**
```
1. Schedule Trigger (every 15 min)
   ↓
2. Supabase: Query distributors without sites
   ↓
3. Loop: For each distributor
   ↓
4. HTTP Request: Create site via Jordyn API
   ↓
5. Supabase: Update sync status
   ↓
6. If Error → Wait 5 min → Retry
```

**Why move:**
- Retry logic is complex in code
- Hard to see sync queue status
- Difficult to debug API failures
- Can't easily adjust retry strategy

**Impact:** HIGH - Rep activation depends on this

---

## 🟡 MEDIUM PRIORITY - Good Candidates

### 6. **Generate Recurring Events** ⭐
**Current:** `src/app/api/cron/generate-recurring-events/route.ts`

**What it does:**
- Runs daily
- Finds recurring event templates
- Creates new event instances for next month
- Updates schedules
- Notifies event creators

**n8n Workflow:**
```
1. Schedule Trigger (daily 6 AM)
   ↓
2. Supabase: Query recurring templates
   ↓
3. Filter: Only templates needing new instances
   ↓
4. Loop: For each template
   ↓
5. Function: Calculate next event date
   ↓
6. Supabase: Create new event instance
   ↓
7. Resend: Notify creator
```

---

### 7. **Cleanup Old Events** ⭐
**Current:** `src/app/api/cron/cleanup-events/route.ts`

**What it does:**
- Runs daily
- Archives events older than 90 days
- Moves to archive table
- Cleans up registrations
- Logs cleanup activity

---

### 8. **Update Earnings Estimates** ⭐
**Current:** `src/app/api/cron/update-estimates/route.ts`

**What it does:**
- Runs hourly
- Recalculates projected earnings
- Updates cached estimates
- Triggers notifications for milestones

---

### 9. **AI Genealogy Analysis** ⭐
**Current:** `src/app/api/cron/ai-genealogy-analysis/route.ts`

**What it does:**
- Runs weekly
- Analyzes team structure
- Generates insights
- Sends recommendations to leaders

---

### 10. **Collect Platform Usage** ⭐
**Current:** `src/app/api/cron/collect-platform-usage/route.ts`

**What it does:**
- Runs daily
- Aggregates feature usage stats
- Stores metrics
- Triggers usage alerts

---

## 🟢 LOW PRIORITY - But Still Beneficial

### 11. **Email Campaigns**
**Current:** Scattered across multiple routes

**Consolidate to n8n:**
- Welcome emails
- Training notifications
- Feature announcements
- Re-engagement campaigns

---

### 12. **Webhook Processors**
**Current:** Multiple webhook handlers

**Consolidate to n8n:**
- Stripe webhooks
- Cal.com webhooks
- Integration webhooks (Jordyn, AgentPulse, etc.)

---

## 📊 Migration Impact Analysis

### Code Reduction
**Current State:**
- 12 cron job endpoints
- ~3,000 lines of scheduling code
- Complex error handling logic
- Scattered retry mechanisms

**After n8n Migration:**
- 0 cron job endpoints (all in n8n)
- ~300 lines of helper functions only
- Centralized error handling
- Visual retry configuration

**Estimated Code Reduction:** 90%

---

### Dependency Mapping

**Current Challenge:**
```
Code → Cron Job → Database Query → Email Send → Error Handler → Retry Logic
(All hidden in TypeScript files)
```

**After n8n:**
```
Visual Workflow:
[Schedule] → [Query] → [Transform] → [Send] → [Update] → [Log]
   ↓            ↓          ↓           ↓         ↓        ↓
 (visible)  (visible)  (visible)   (visible) (visible)(visible)
```

**Benefit:** Anyone can see the entire flow at a glance

---

## 🚀 Recommended Migration Plan

### Phase 1: Email Workflows (Week 1)
**Move to n8n:**
1. Nurture email campaigns
2. Daily enrollment report
3. Onboarding reminders

**Why first:**
- Highest volume
- Most user-facing
- Easiest to visualize

**Expected Time:** 8-12 hours

---

### Phase 2: Financial Workflows (Week 2)
**Move to n8n:**
1. Process clawbacks
2. Update earnings estimates
3. Commission notifications

**Why second:**
- Critical for compliance
- Easier to audit visually
- Reduce financial bugs

**Expected Time:** 6-8 hours

---

### Phase 3: Integration Workflows (Week 3)
**Move to n8n:**
1. Sync failed sites
2. Webhook processors
3. External API calls

**Why third:**
- Reduces API failure points
- Better retry logic
- Clearer integration flow

**Expected Time:** 8-10 hours

---

### Phase 4: Analytics & Cleanup (Week 4)
**Move to n8n:**
1. Platform usage collection
2. Event cleanup
3. AI analysis jobs

**Why last:**
- Nice to have
- Lower priority
- Can optimize later

**Expected Time:** 4-6 hours

---

## 💰 Cost-Benefit Analysis

### Current Costs (Hidden)
- Developer time debugging cron jobs: ~4 hours/week
- Failed email investigations: ~2 hours/week
- Modifying workflow logic: ~3 hours/change
- Onboarding new devs to cron system: ~8 hours

**Total:** ~312 hours/year

### After n8n
- n8n Cloud Pro: $50/month = $600/year
- Workflow modifications: ~30 min/change (vs 3 hours)
- Debugging: ~15 min/week (visual logs)
- Onboarding: ~1 hour (visual workflows)

**Time Savings:** ~250 hours/year
**Cost Savings:** ~$20,000/year (assuming $80/hr dev time)
**ROI:** 33x return on investment

---

## 🛠️ Implementation Guide

### Step 1: Set Up n8n
```bash
# Option A: Self-hosted (free)
docker run -d --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n

# Option B: n8n Cloud ($50/mo)
# Sign up at n8n.cloud
```

### Step 2: Connect Integrations
1. Add Supabase connection (PostgreSQL)
2. Add Resend connection (Email)
3. Add Slack connection (Notifications)
4. Add HTTP endpoints for webhooks

### Step 3: Create First Workflow (Nurture Emails)
1. Import workflow template
2. Test with staging data
3. Monitor for 1 week
4. Switch production traffic
5. Deprecate code endpoint

### Step 4: Monitor & Iterate
- Review execution logs daily
- Optimize slow workflows
- Add error notifications
- Document processes

---

## 📋 Sample n8n Workflow: Nurture Emails

```json
{
  "name": "Send Nurture Emails",
  "nodes": [
    {
      "type": "n8n-nodes-base.schedule",
      "name": "Every Hour",
      "parameters": {
        "rule": {
          "interval": [{"field": "hours", "value": 1}]
        }
      }
    },
    {
      "type": "n8n-nodes-base.postgres",
      "name": "Get Scheduled Emails",
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT * FROM business_center_nurture_emails WHERE status = 'scheduled' AND scheduled_for <= NOW() LIMIT 50"
      }
    },
    {
      "type": "n8n-nodes-base.splitInBatches",
      "name": "Loop Emails",
      "parameters": {
        "batchSize": 1
      }
    },
    {
      "type": "n8n-nodes-base.resend",
      "name": "Send Email",
      "parameters": {
        "resource": "email",
        "operation": "send",
        "fromEmail": "theapex@theapexway.net",
        "toEmail": "={{ $json.distributor.email }}",
        "subject": "={{ $json.subject }}",
        "html": "={{ $json.content }}"
      }
    },
    {
      "type": "n8n-nodes-base.postgres",
      "name": "Update Status",
      "parameters": {
        "operation": "update",
        "table": "business_center_nurture_emails",
        "updateKey": "id",
        "columns": "status,sent_at",
        "values": "sent,NOW()"
      }
    }
  ]
}
```

---

## ✅ Success Metrics

After migration, track:

1. **Execution Visibility**
   - ✅ Can see all workflows at a glance
   - ✅ Execution history accessible
   - ✅ Error logs centralized

2. **Developer Efficiency**
   - ✅ Workflow changes take <30 min (vs 3 hours)
   - ✅ Debugging takes <15 min (vs 2 hours)
   - ✅ Non-devs can modify workflows

3. **System Reliability**
   - ✅ Retry logic works consistently
   - ✅ Failed executions auto-retry
   - ✅ Alerts trigger on failures

4. **Business Impact**
   - ✅ Nurture emails send reliably
   - ✅ Onboarding reminders convert better
   - ✅ Financial processes are auditable

---

## 🎯 Bottom Line

**Should you migrate to n8n?** YES!

**Why:**
- 90% code reduction
- 33x ROI
- Visual dependency mapping
- Easier debugging
- Non-developers can help
- Better error handling
- Faster iterations

**Start with:** Nurture emails (highest impact, easiest migration)

**Timeline:** 4 weeks to migrate all workflows

**Cost:** $600/year (vs $20,000/year in dev time)

---

## 📞 Next Steps

1. **Set up n8n Cloud trial** (free 14 days)
2. **Migrate nurture email workflow** (test first!)
3. **Monitor for 1 week** (compare reliability)
4. **If successful, continue with Phase 2**
5. **Deprecate code endpoints gradually**

Ready to get started? Let me know and I'll help you build the first workflow!
