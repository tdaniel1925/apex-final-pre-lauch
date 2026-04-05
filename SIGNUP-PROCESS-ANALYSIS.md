# Complete Signup Process Analysis
## Current State & n8n Migration Plan

---

## CURRENT SIGNUP PROCESS (as of 2026-04-05)

### Step-by-Step Flow in `/api/signup/route.ts`:

1. **Validate Input** (lines 50-61)
   - Check all required fields using Zod schema

2. **Rate Limiting** (lines 67-110)
   - Max 5 signups per IP per 15 minutes
   - Record in `signup_rate_limits` table

3. **Check Email Exists** (lines 112-128)
   - Query `distributors` table for duplicate email

4. **Check Slug Availability** (lines 130-141)
   - Ensure username isn't taken

5. **Look Up Sponsor** (lines 143-177)
   - If `sponsor_slug` provided, find sponsor's ID
   - Otherwise assign to master distributor (apex-vision)

6. **Create Auth User** (lines 179-255)
   - Call `supabase.auth.signUp()` with email/password
   - Handle orphaned auth users (edge case)
   - Email confirmation sent automatically by Supabase

7. **Create Distributor** (lines 275-343)
   - Call RPC function `create_distributor_atomic`
   - Atomically creates:
     - Distributor record in `distributors` table
     - Member record in `members` table
     - Matrix placement (finds open spot, assigns position)
   - Returns full distributor object with matrix info

8. **Store Tax ID** (lines 351-470)
   - If personal registration: encrypt and store SSN
   - If business registration: encrypt and store EIN
   - Stored in `distributor_tax_info` table

9. **Trigger n8n Webhook** (lines 472-495)
   - **FIRE AND FORGET** - non-blocking
   - Sends to `process.env.N8N_WEBHOOK_NEW_DISTRIBUTOR`
   - Payload:
     ```json
     {
       "distributorId": "uuid",
       "email": "user@example.com",
       "firstName": "John",
       "lastName": "Doe"
     }
     ```
   - **NOTE:** Signup route returns immediately - does NOT wait for n8n

10. **Return Success** (lines 497-512)
    - Returns distributor object with matrix placement info
    - User sees success message

---

## WHAT n8n WORKFLOW SHOULD DO

The n8n webhook is supposed to handle the POST-SIGNUP automation:

### 1. **Send Welcome Email** ✅ REQUIRED
   - Template: `src/emails/DistributorWelcomeEmail.tsx`
   - Required data:
     - `firstName` (from webhook)
     - `lastName` (from webhook)
     - `username` (distributor.slug from database)
     - `password` (temporary password - HOW IS THIS GENERATED?)
     - `sponsorName` (from database join)
     - `replicatedSiteUrl` (https://reachtheapex.net/{slug})

   **Email includes:**
   - Login credentials (username/password)
   - Replicated website URL
   - Getting started steps
   - Sponsor's name
   - Contact info

### 2. **Create Replicated Sites** ✅ REQUIRED
   - Function: `createReplicatedSites(distributorId)`
   - Location: `src/lib/integrations/user-sync/service.ts`
   - What it does: Creates user accounts on external platforms
   - API endpoint: `/api/integrations/create-replicated-sites`

### 3. **Provision AI Phone** ✅ REQUIRED
   - API: `/api/signup/provision-ai`
   - What it does:
     - Creates VAPI assistant (AI voice agent)
     - Provisions phone number with matching area code
     - Updates distributor record with phone/assistant IDs
     - Grants 20 free minutes, 24-hour trial
   - Required data:
     - `distributorId`
     - `firstName`
     - `lastName`
     - `phone`
     - `sponsorSlug` (optional)

### 4. **Format Social Media Posts** ❓ OPTIONAL
   - Generate Facebook/Twitter/LinkedIn announcement posts
   - Content: "Welcome [Name] to Apex Affinity Group!"
   - **Question:** Where are these posts used? Auto-posted or sent to admin?

### 5. **Notify Admin Team** ❓ OPTIONAL
   - Send notification to tdaniel@botmakers.ai and tavaresdavis81@gmail.com
   - **Question:** What info should admin notification include?

---

## CRITICAL MISSING PIECE: PASSWORD

**Problem:** The welcome email template requires a `password` field, but the signup process doesn't generate a temporary password anywhere!

**Possible solutions:**
1. User already set their password during signup - send password reset link instead
2. Generate temporary password during signup and pass to n8n
3. Admin creates accounts with temp passwords (different from user signup)

**Question for user:** How do users get their login password in the welcome email?

---

## CURRENT n8n WORKFLOW (from JSON file)

Located: `n8n-deployment/workflows/new-distributor-onboarding.json`

**Nodes:**
1. Webhook Trigger ✅
2. Respond Immediately ⚠️ (causes workflow to exit early!)
3. Get Distributor Details ✅
4. Prepare Distributor Data ✅ (JavaScript)
5. Send Welcome Email ❌ (failing - no proper API endpoint)
6. Create Replicated Sites ❓
7. Provision AI Phone ❓
8. Format Social Media Posts ❓
9. Post to Facebook ❓
10. Post to Twitter ❓
11. Post to LinkedIn ❓
12. Notify Admin Team ❓

**Issues:**
- "Respond Immediately" node causes workflow to stop after step 2
- Welcome email API doesn't exist or is broken
- No proper email template rendering
- Missing password in email data

---

## REQUIRED API ENDPOINTS FOR n8n

### ✅ Already Exist:
1. `/api/integrations/create-replicated-sites` - Create replicated sites
2. `/api/signup/provision-ai` - Provision AI phone

### ❌ Need to Create/Fix:
1. `/api/email/send-welcome` - Send welcome email
   - Input: `{ distributorId: string }`
   - Must:
     - Get full distributor data from database
     - Get sponsor name from database
     - Render `DistributorWelcomeEmail.tsx` template
     - Send via Resend
     - **Solve password problem**

2. `/api/admin/notify-new-distributor` (if needed)
   - Send notification to admin team

---

## RECOMMENDED n8n WORKFLOW STRUCTURE

```
1. Webhook Trigger
   ├─ Receive: { distributorId, email, firstName, lastName }
   └─ Response: 200 OK (immediate)

2. Get Distributor Details (Supabase HTTP Request)
   ├─ URL: /rest/v1/distributors?id=eq.{{distributorId}}&select=*,sponsor:distributors!sponsor_id(first_name,last_name,slug)
   └─ Returns: Full distributor object + sponsor info

3. Prepare Data (JavaScript)
   ├─ Extract: firstName, lastName, email, slug, phone, sponsorName
   └─ Build: replicatedSiteUrl, loginUrl

4. PARALLEL EXECUTION:

   4a. Send Welcome Email (HTTP Request)
       ├─ POST /api/email/send-welcome
       ├─ Body: { distributorId, slug, sponsorName }
       └─ Returns: { success, emailId }

   4b. Create Replicated Sites (HTTP Request)
       ├─ POST /api/integrations/create-replicated-sites
       ├─ Body: { distributorId }
       └─ Returns: { success, sites: [] }

   4c. Provision AI Phone (HTTP Request)
       ├─ POST /api/signup/provision-ai
       ├─ Body: { distributorId, firstName, lastName, phone }
       └─ Returns: { success, phoneNumber, assistantId }

   4d. Format Social Media (JavaScript)
       ├─ Generate Facebook post
       ├─ Generate Twitter post
       └─ Generate LinkedIn post

   4e. Notify Admin (HTTP Request) - OPTIONAL
       ├─ POST /api/admin/notify-new-distributor
       ├─ Body: { distributorId, firstName, lastName, email }
       └─ Returns: { success }

5. All Complete
   └─ Workflow ends
```

---

## ACTION ITEMS TO BUILD n8n WORKFLOW

### 1. **FIRST: Answer Password Question**
   - How should users receive their login password?
   - Option A: They set it during signup (no temp password needed)
   - Option B: Generate temp password and store it
   - Option C: Send password reset link instead of password

### 2. **Create `/api/email/send-welcome` Endpoint**
   - Get distributor from database (with sponsor join)
   - Render `DistributorWelcomeEmail.tsx` with:
     - firstName, lastName
     - username (slug)
     - password (solution from #1)
     - sponsorName
     - replicatedSiteUrl
   - Send via Resend
   - Return success/error

### 3. **Update n8n Workflow**
   - Remove "Respond Immediately" node
   - Configure webhook to respond after first node
   - Add HTTP Request nodes for:
     - Send Welcome Email
     - Create Replicated Sites
     - Provision AI Phone
   - Add JavaScript node for social media formatting
   - Add error handling on each node

### 4. **Test End-to-End**
   - Trigger workflow with real distributor ID
   - Verify email received with all correct data
   - Verify replicated sites created
   - Verify AI phone provisioned
   - Verify admin notified (if needed)

---

## QUESTIONS FOR USER

1. **Password:** How do new distributors get their login password?
   - During signup they set their own password
   - System generates temporary password
   - Send password reset link in welcome email
   - Other?

2. **Social Media Posts:** What happens with the formatted posts?
   - Auto-post to company social media accounts?
   - Send to admin team to post manually?
   - Send to distributor to share on their own accounts?
   - Not needed?

3. **Admin Notification:** What details should admin team receive?
   - Just "New signup: John Doe"
   - Full details (name, email, sponsor, matrix position)?
   - Different notifications for licensed vs unlicensed?

4. **Email Template:** Is `DistributorWelcomeEmail.tsx` the correct template to use?
   - Or is there a different template in the database?
   - Any customization based on licensing_status?

---

## SUMMARY

**Current state:**
- Signup route creates distributor and triggers n8n webhook ✅
- n8n workflow exists but doesn't complete (stops after responding) ❌
- Welcome email template exists but isn't being sent ❌
- Password problem: template requires password but none is generated ❌

**What needs to happen:**
1. Solve password delivery problem
2. Create proper `/api/email/send-welcome` endpoint
3. Fix n8n workflow to execute all nodes
4. Test end-to-end with real signup

**Estimated time:** 1-2 hours once password question is answered

---

Generated: 2026-04-05
