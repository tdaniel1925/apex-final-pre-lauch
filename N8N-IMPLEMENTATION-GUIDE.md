# n8n Implementation Guide: From JSON to Production

**Date:** April 4, 2026
**Goal:** Step-by-step guide to deploy n8n workflows

---

## 🎯 The Complete Journey

### Overview:
```
1. I create JSON workflow file
   ↓
2. You set up n8n (Cloud or self-hosted)
   ↓
3. You import JSON into n8n
   ↓
4. You configure credentials (Supabase, Resend, VAPI, etc.)
   ↓
5. You test workflow with fake data
   ↓
6. You run in parallel with existing code (monitoring)
   ↓
7. You switch production traffic to n8n
   ↓
8. You deprecate old code endpoint
```

---

## 📋 STEP 1: I Create the Workflow JSON

**What I'll give you:**

```json
{
  "name": "Apex - New Signup Provisioning",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "path": "apex-signup",
        "responseMode": "lastNode",
        "authentication": "headerAuth"
      }
    },
    {
      "name": "Validate Input",
      "type": "n8n-nodes-base.function",
      "position": [450, 300],
      "parameters": {
        "functionCode": "// Zod validation code here"
      }
    },
    // ... 20+ more nodes
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [[{"node": "Validate Input", "type": "main", "index": 0}]]
    }
    // ... all connections
  }
}
```

**Files you'll get:**
- `n8n-workflows/signup-provisioning.json` - Main signup workflow
- `n8n-workflows/vapi-retry.json` - VAPI retry workflow
- `n8n-workflows/site-creation-retry.json` - Website retry workflow
- `n8n-helpers/validation.js` - Shared validation functions
- `n8n-helpers/matrix-placement.js` - Matrix placement logic
- `README.md` - Setup instructions

---

## 🚀 STEP 2: Set Up n8n

You have **2 options:**

### Option A: n8n Cloud (Recommended for Speed) 💰

**Pros:**
- ✅ Set up in 5 minutes
- ✅ Automatic updates
- ✅ Built-in backups
- ✅ No server management
- ✅ Free 14-day trial

**Cons:**
- ❌ Costs $50/month (Pro plan)
- ❌ Less control over infrastructure

**Steps:**
1. Go to https://n8n.cloud
2. Sign up with email
3. Choose "Pro" plan (14-day free trial)
4. Create workspace: "Apex Production"
5. Done! n8n is ready.

**URL you'll get:** `https://apex-production.n8n.cloud`

---

### Option B: Self-Hosted (Free, More Control) 🆓

**Pros:**
- ✅ Completely free
- ✅ Full control
- ✅ Can run on existing infrastructure
- ✅ No data leaves your servers

**Cons:**
- ❌ Need to manage server
- ❌ Manual updates
- ❌ You handle backups

**Steps:**

#### **Quick Start (Docker):**
```bash
# 1. Create directory
mkdir n8n-data
cd n8n-data

# 2. Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your-secure-password-here
      - N8N_HOST=n8n.yourdomain.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://n8n.yourdomain.com/
      - GENERIC_TIMEZONE=America/New_York
    volumes:
      - ./n8n-data:/home/node/.n8n
      - ./n8n-files:/files

  postgres:
    image: postgres:15
    container_name: n8n-postgres
    restart: always
    environment:
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=your-db-password
      - POSTGRES_DB=n8n
    volumes:
      - ./postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: n8n-redis
    restart: always
    volumes:
      - ./redis-data:/data
EOF

# 3. Start n8n
docker-compose up -d

# 4. Check logs
docker logs -f n8n
```

**Access:** `http://localhost:5678`

#### **Production Setup (with SSL):**
```bash
# Add nginx reverse proxy
# Add Let's Encrypt SSL
# Configure domain: n8n.theapexway.net
```

---

## 📥 STEP 3: Import Workflow JSON

### In n8n Interface:

1. **Navigate to Workflows**
   - Click "Workflows" in left sidebar
   - Click "Add workflow" button

2. **Import JSON**
   - Click "⋮" (three dots) in top right
   - Select "Import from File"
   - Choose `signup-provisioning.json`
   - Click "Import"

3. **Workflow Appears**
   - You'll see visual canvas with all nodes
   - All connections already made
   - Ready to configure

**Screenshot of what you'll see:**
```
[Webhook] → [Validate] → [Check Rate Limit] → [Create Auth User]
                                                        ↓
    [Send Email] ← [Create Onboarding] ← [Create Distributor]
```

---

## 🔐 STEP 4: Configure Credentials

### You need to add:

#### **1. Supabase Connection**
```
Name: Supabase Production
Type: Postgres
Host: db.brejvdvzwshroxkkhmzy.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [your-supabase-password]
SSL: Enabled
```

**Where to add:**
- Settings → Credentials → Add Credential
- Search "Postgres"
- Fill in details
- Test connection
- Save

---

#### **2. Resend API**
```
Name: Resend - Apex
Type: Resend
API Key: re_xxx... (from Resend dashboard)
```

---

#### **3. VAPI API**
```
Name: VAPI Production
Type: HTTP Header Auth
Header Name: Authorization
Header Value: Bearer vapi_xxx...
```

---

#### **4. Slack Webhook**
```
Name: Slack - Admin Alerts
Type: Slack
Webhook URL: https://hooks.slack.com/services/xxx...
```

---

#### **5. Stripe API**
```
Name: Stripe Live
Type: Stripe
API Key: sk_live_xxx...
Secret Key: whsec_xxx... (webhook secret)
```

---

### Apply Credentials to Nodes:

1. Click on each node that needs credentials
2. In right panel, select credential from dropdown
3. Example: "Create Auth User" node → Select "Supabase Production"

---

## 🧪 STEP 5: Test Workflow

### Test Mode (Before Production)

#### **Create Test Webhook:**
1. Click "Webhook Trigger" node
2. Click "Listen for Test Event"
3. Copy webhook URL (e.g., `https://apex.n8n.cloud/webhook/test/apex-signup`)

#### **Send Test Data:**
```bash
curl -X POST https://apex.n8n.cloud/webhook/test/apex-signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-webhook-secret" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Password123!",
    "slug": "testuser123",
    "phone": "555-123-4567",
    "sponsorSlug": "phil-resch"
  }'
```

#### **Watch Execution:**
- n8n shows real-time execution
- See each node light up as it runs
- See data flowing between nodes
- See any errors immediately

**Example execution view:**
```
✅ Webhook Trigger (0.1s)
✅ Validate Input (0.05s)
✅ Check Rate Limit (0.2s)
✅ Create Auth User (0.8s)
✅ Create Distributor (0.3s)
⚠️  Provision VAPI (FAILED - API timeout)
  └─ Auto-queued for retry
✅ Send Welcome Email (0.5s)
```

---

## 🔄 STEP 6: Run in Parallel (Dual Mode)

**Critical:** Don't switch all traffic at once!

### Strategy: Gradual Migration

#### **Phase 1: Monitor Only (Week 1)**
```
User signs up
   ↓
Old code runs (creates user)
   ↓
Webhook to n8n (shadow mode)
   ↓
n8n logs what it WOULD do
   ↓
Compare results
```

**Implementation:**
```typescript
// In your existing signup route
await oldSignupLogic(data);

// Also trigger n8n (don't wait for response)
fetch('https://n8n.theapexway.net/webhook/apex-signup-shadow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
}).catch(err => console.log('n8n shadow failed:', err));
// Don't block if n8n fails
```

**Monitor:**
- Check n8n executions match old code
- Fix any discrepancies
- Build confidence

---

#### **Phase 2: 10% Traffic (Week 2)**
```typescript
// Route 10% of signups to n8n
const useN8n = Math.random() < 0.1; // 10%

if (useN8n) {
  // New way (n8n)
  const response = await fetch('https://n8n.theapexway.net/webhook/apex-signup', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
} else {
  // Old way (existing code)
  return await oldSignupLogic(data);
}
```

**Monitor:**
- Error rates
- Execution time
- User complaints
- Data consistency

---

#### **Phase 3: 50% Traffic (Week 3)**
```typescript
const useN8n = Math.random() < 0.5; // 50%
```

---

#### **Phase 4: 100% Traffic (Week 4)**
```typescript
// All traffic to n8n
const response = await fetch('https://n8n.theapexway.net/webhook/apex-signup', {
  method: 'POST',
  body: JSON.stringify(data)
});
return response.json();
```

---

## ✅ STEP 7: Switch to Production

### Update Your Code:

**Before (old signup route):**
```typescript
// src/app/api/signup/route.ts
export async function POST(request: NextRequest) {
  // 500+ lines of complex logic
  // ...
}
```

**After (n8n proxy):**
```typescript
// src/app/api/signup/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Forward to n8n workflow
  const response = await fetch(process.env.N8N_SIGNUP_WEBHOOK_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.N8N_WEBHOOK_SECRET}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    // Fallback to old code if n8n fails (optional safety)
    console.error('n8n signup failed, using fallback');
    return oldSignupLogic(body);
  }

  return NextResponse.json(await response.json());
}
```

**Code reduction:** 500+ lines → 15 lines!

---

### Environment Variables:

```bash
# .env.local
N8N_SIGNUP_WEBHOOK_URL=https://n8n.theapexway.net/webhook-test/apex-signup
N8N_WEBHOOK_SECRET=your-secure-secret-here
```

---

## 🗑️ STEP 8: Deprecate Old Code

### Safe Deprecation Process:

#### **Week 1-4: Monitor n8n (100% traffic)**
- Ensure no issues
- Confirm all features work
- Check error rates

#### **Week 5: Mark code as deprecated**
```typescript
// src/app/api/signup/route.ts
/**
 * @deprecated This signup logic has been moved to n8n
 * Old code kept for emergency fallback only
 * Will be removed: [date 3 months from now]
 */
async function oldSignupLogic(data) {
  // ... old code
}
```

#### **Month 3: Remove old code entirely**
```bash
git rm src/app/api/signup/provision-ai/route.ts
git rm src/lib/integrations/user-sync/service.ts
# Delete 500+ lines of code
```

---

## 📊 Monitoring & Alerts

### In n8n Interface:

#### **1. Execution History**
- See every workflow run
- Filter by success/failure
- View execution time
- Download execution data

#### **2. Error Tracking**
```
Failed executions → Slack alert
Slow executions (>5s) → Email alert
VAPI API errors → Retry automatically
```

#### **3. Metrics Dashboard**
```
Total signups today: 47
Success rate: 98.5%
Avg execution time: 2.3s
Failed VAPI provisions: 1 (retrying)
```

---

## 🔧 Making Changes

### Update Workflow (No Code Deployment!)

#### **Example: Change onboarding email timing**

**Before n8n:**
```typescript
// Need to:
1. Edit code
2. Test locally
3. Commit to git
4. Push to repo
5. Deploy to production
6. Wait 5-10 minutes
```

**With n8n:**
```
1. Open workflow in n8n
2. Click "Wait" node
3. Change "7 days" to "5 days"
4. Click "Save"
5. Done! (instant)
```

**Time:** 30 seconds vs 30 minutes!

---

## 💰 Cost Breakdown

### n8n Cloud Pro: $50/month

**What you get:**
- Unlimited workflows
- Unlimited executions
- 25,000 workflow executions/month (plenty for you)
- Premium support
- 99.9% uptime SLA

**What you save:**
- Developer time: ~$28,000/year
- Faster iterations
- Better monitoring
- Visual documentation

**ROI:** 56x ($28,000 saved / $600 cost)

---

### Self-Hosted: $0/month

**Infrastructure:**
- Can run on existing servers
- Or: $10/month DigitalOcean droplet

**Time investment:**
- Initial setup: 4 hours
- Monthly maintenance: 1 hour

---

## 🎯 Success Metrics

### Track these after migration:

#### **Week 1:**
- ✅ All signups successful
- ✅ Zero data loss
- ✅ Execution time < 3s average

#### **Month 1:**
- ✅ 99%+ success rate
- ✅ Zero user complaints
- ✅ 50% faster signup (async provisioning)

#### **Month 3:**
- ✅ Old code deleted
- ✅ 500+ lines removed
- ✅ Marketing team making changes independently

---

## 🚨 Rollback Plan

### If Something Goes Wrong:

#### **Emergency Rollback:**
```typescript
// Flip one environment variable
N8N_ENABLED=false

// In code:
if (process.env.N8N_ENABLED === 'true') {
  return n8nSignup(data);
} else {
  return oldSignupLogic(data); // Instant fallback
}
```

**Rollback time:** 30 seconds

---

## 📚 Learning Resources

### n8n Documentation:
- https://docs.n8n.io - Official docs
- https://community.n8n.io - Community forum
- https://www.youtube.com/@n8n-io - Video tutorials

### Apex-Specific:
- I'll provide detailed README with each workflow
- Video walkthrough of setup (optional)
- Slack support channel for questions

---

## 🎯 Bottom Line

### The Complete Journey:

**Time Investment:**
- Setup n8n: 1 hour (cloud) or 4 hours (self-hosted)
- Import workflows: 15 minutes
- Configure credentials: 30 minutes
- Test workflows: 2 hours
- Gradual rollout: 4 weeks
- **Total:** ~8 hours + 4 weeks monitoring

**Result:**
- 500+ lines of code → 15 lines
- Visual workflow anyone can understand
- Changes take 30 seconds instead of 30 minutes
- Better error handling and monitoring
- $28,000/year saved in dev time

**Next Step:** Want me to create the first workflow JSON (Signup)?

I'll give you:
1. Complete workflow JSON file
2. Step-by-step setup guide
3. Test data examples
4. Monitoring queries

Just say "yes" and I'll build it!
