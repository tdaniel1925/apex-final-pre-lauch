# n8n Post-Signup Automation Setup Guide

## Overview

We've moved post-signup tasks from the signup API route to n8n for better visibility, flexibility, and ease of maintenance.

## What Was Moved to n8n

### Moved from Code to n8n:
1. ✅ **Welcome Email Sending**
2. ✅ **Replicated Sites Creation**
3. ✅ **AI Phone Number Provisioning**
4. ✅ **Email Campaign Enrollment**
5. ✅ **Social Media Announcements** (NEW!)
6. ✅ **Admin Team Notifications** (NEW!)

### Stays in Code (Fast & Secure):
- ✅ Input validation
- ✅ Rate limiting
- ✅ Auth user creation
- ✅ Database writes (distributor, member, tax_info)
- ✅ SSN/EIN encryption
- ✅ Matrix placement calculation

## Setup Instructions

### Step 1: Import Workflow to n8n

1. Log into your n8n Cloud account
2. Click **"Workflows"** → **"Add Workflow"** → **"Import from File"**
3. Upload `n8n-deployment/workflows/new-distributor-onboarding.json`
4. The workflow will be imported with all nodes configured

### Step 2: Configure Supabase Credential

1. In n8n, go to **"Credentials"** → **"Add Credential"**
2. Search for **"Supabase API"**
3. Enter:
   - **Host**: `https://brejvdvzwshroxkkhmzy.supabase.co`
   - **Service Role Key**: (from `.env.local` → `SUPABASE_SERVICE_ROLE_KEY`)
4. Click **"Save"** and name it **"Supabase Production"**

### Step 3: Get Webhook URL

1. Open the "New Distributor Onboarding" workflow in n8n
2. Click the **"Webhook Trigger"** node
3. Copy the **"Production URL"** (looks like: `https://your-n8n.app.n8n.cloud/webhook/new-distributor`)

### Step 4: Update Environment Variable

1. Open `.env.local` in your project
2. Find the line: `N8N_WEBHOOK_NEW_DISTRIBUTOR=https://your-n8n-instance.app.n8n.cloud/webhook/new-distributor`
3. Replace with your actual webhook URL from Step 3
4. Save the file
5. Restart your dev server

### Step 5: Activate the Workflow

1. In n8n, toggle the workflow to **"Active"** (switch at top right)
2. The workflow is now live and listening for new distributor signups!

## Testing

### Test the Workflow Manually:

1. In n8n, click **"Test Workflow"**
2. Click the **"Webhook Trigger"** node
3. Click **"Listen for Test Event"**
4. Create a new distributor signup in your app
5. Watch the workflow execute in real-time!

### Expected Result:

When a distributor signs up, you should see:
- ✅ Webhook triggered immediately
- ✅ Distributor data fetched from Supabase
- ✅ Welcome email sent
- ✅ Replicated sites creation API called
- ✅ AI phone provisioning API called
- ✅ Admin notification email sent
- ✅ Social media posts prepared (placeholders for now)

## Adding Social Media Credentials

### Facebook:
1. In n8n, add a **"Facebook Pages"** node (replacing the placeholder)
2. Configure Facebook credentials
3. Connect your Facebook Page
4. The posts will go live automatically!

### Twitter/X:
1. Add a **"Twitter"** node
2. Configure Twitter API credentials
3. Connect your account
4. Tweets will post automatically!

### LinkedIn:
1. Add a **"LinkedIn"** node
2. Configure LinkedIn Company Page credentials
3. Posts will go to your company page!

## How It Works

### Architecture:

```
User Signup Form
    ↓
Your Signup API
├─ Create auth user (200ms)
├─ Create distributor record (100ms)
├─ Store tax ID (50ms)
└─ Trigger n8n webhook (fire & forget)
    ↓
Return success to user (350ms total) ⚡
    ↓
[n8n runs in background]
    ├─ Send welcome email (2s)
    ├─ Create replicated sites (3s)
    ├─ Provision AI phone (4s)
    ├─ Post to social media (2s)
    └─ Notify admin team (1s)
```

### Benefits:

1. **Fast Signup** - User sees success in ~350ms
2. **No Blocking** - Post-signup tasks don't slow down signup
3. **Visibility** - See exactly what happens in n8n dashboard
4. **Flexibility** - Add/remove steps without code changes
5. **Reliability** - If n8n is down, signup still works

## Future Enhancements

Easy additions you can make in n8n (just drag & drop nodes):

### Stripe Integration:
- Create Stripe customer
- Set up payment method
- Subscribe to trial plan

### CRM Updates:
- Create contact in HubSpot/Salesforce
- Assign to sales rep
- Create onboarding tasks

### Marketing Automation:
- Add to Facebook Custom Audience
- Tag in email platform
- Start retargeting campaign

### Follow-Up Scheduling:
- Day 3 check-in call
- Day 7 training invite
- Day 30 review meeting

## Monitoring

### Check Workflow Executions:

1. Go to **"Executions"** in n8n
2. Filter by workflow: "New Distributor Onboarding"
3. See all signup automations with timestamps
4. Click any execution to see detailed logs

### Failed Executions:

If a step fails, n8n will:
- Show the error in red
- Log the full error message
- Allow you to retry the execution
- Send error notification (if configured)

## Troubleshooting

### Webhook Not Triggering:

1. Check `.env.local` has correct webhook URL
2. Verify workflow is **Active** in n8n
3. Check n8n execution logs for errors
4. Test webhook manually with curl:

```bash
curl -X POST https://your-n8n.app.n8n.cloud/webhook/new-distributor \
  -H "Content-Type: application/json" \
  -d '{
    "distributorId": "test-id-123",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Supabase Connection Issues:

1. Verify Supabase credential in n8n
2. Check service role key is correct
3. Test connection in n8n credential page

### Email Not Sending:

1. Check Resend API key in n8n
2. Verify email domain is verified in Resend
3. Check spam folder
4. Review execution logs in n8n

## Support

For issues with:
- **n8n Platform**: Check n8n Cloud status page
- **Workflow Logic**: Review execution logs in n8n dashboard
- **API Integration**: Check your app's API logs
- **Credentials**: Verify in n8n credentials page

## Files

- **Workflow JSON**: `n8n-deployment/workflows/new-distributor-onboarding.json`
- **Daily Report**: `n8n-deployment/workflows/daily-enrollment-working.json`
- **Code Changes**: `src/app/api/signup/route.ts` (lines 472-494)
- **Environment**: `.env.local` (N8N_WEBHOOK_NEW_DISTRIBUTOR)
