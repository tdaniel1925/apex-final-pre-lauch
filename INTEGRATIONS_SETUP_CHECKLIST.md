# External Integrations System - Setup Checklist

## ✅ Completed (By AI Agents)

- [x] Database schema designed (5 tables)
- [x] TypeScript types added
- [x] Admin UI built (`/admin/integrations`)
- [x] Product mappings UI built (`/admin/integrations/product-mappings`)
- [x] Webhook receiver created (`/api/webhooks/integrations/[platform]`)
- [x] User sync service created
- [x] API documentation written (8 files in `docs/`)
- [x] Postman collection created
- [x] Admin sidebar navigation link added
- [x] Tests written and passing

---

## 📋 TODO (Your Next Steps)

### 1. Apply Database Migration (5 minutes)

**Option A: Via Supabase Dashboard (RECOMMENDED)**
1. Open: https://supabase.com/dashboard → Your Project → SQL Editor
2. Copy: `supabase/migrations/20260317181850_external_integrations_system.sql`
3. Paste into SQL Editor
4. Click **"Run"**
5. Verify: Run `SELECT * FROM integrations;` (should see jordyn, agentpulse)

**Option B: Via CLI** (if migration sync issues are resolved)
```bash
supabase db push
```

See: `APPLY_INTEGRATIONS_MIGRATION.md` for detailed instructions

---

### 2. Verify System is Working (2 minutes)

1. Start dev server: `npm run dev`
2. Go to: http://localhost:3000/admin/integrations
3. You should see:
   - **Jordyn.app** (enabled, pending configuration)
   - **AgentPulse Cloud** (enabled, pending configuration)

---

### 3. Get API Credentials from External Platforms (1-2 days)

#### For Jordyn.app:
Contact: jordyn.app support/developer team
Request:
- API endpoint URL (e.g., `https://api.jordyn.app`)
- API key for Apex integration
- Documentation for their `/api/users/create` endpoint

#### For AgentPulse Cloud:
Contact: agentpulse.cloud support/developer team
Request:
- API endpoint URL (e.g., `https://api.agentpulse.cloud`)
- API key for Apex integration
- Documentation for their `/api/users/create` endpoint

---

### 4. Configure Integrations in Admin UI (10 minutes per platform)

For each platform:

1. Go to: `/admin/integrations/[id]` (click on platform)
2. Click **"Edit"**
3. Fill in:
   - API Endpoint: `https://api.jordyn.app` (from their docs)
   - API Key: Paste their API key
   - Click **"Test Connection"** (should show green checkmark)
4. Enable features:
   - [x] Supports Replicated Sites
   - [x] Supports Sales Webhooks
   - [x] Supports Commission Tracking
   - [x] Auto-create site on signup
5. Click **"Save"**

---

### 5. Share API Documentation with External Platforms (30 minutes)

Send to jordyn.app and agentpulse.cloud teams:

**📧 Email Template:**
```
Subject: Apex Integrations - Technical Documentation

Hi [Platform Name] Team,

We're integrating Apex with [Platform Name] to:
1. Create replicated sites when distributors sign up
2. Track sales and calculate commissions

Please review the attached documentation:
- Quick Start Guide: docs/INTEGRATION_QUICKSTART.md
- API Reference: docs/INTEGRATIONS_API.md
- Postman Collection: docs/apex-integrations.postman_collection.json

Key Integration Points:
1. User Creation API - You need to implement this endpoint
2. Sales Webhook - You'll send webhooks to our endpoint

Webhook URL: https://yourapp.com/api/webhooks/integrations/[platform_name]
Webhook Secret: [shown in admin UI after you configure]

Let's schedule a call to review. Available times:
- [Your availability]

Thanks!
```

Attach files from `docs/` folder

---

### 6. Configure Product Mappings (15 minutes per platform)

After platforms provide their product list:

1. Go to: `/admin/integrations/product-mappings`
2. Click **"Add Mapping"**
3. For each product:
   - Platform: Select platform
   - External Product ID: From their product list (e.g., `prod_123`)
   - Product Name: `Business Starter Pack`
   - Tech Credits: `100`
   - Insurance Credits: `0`
   - Commission Type: `percentage`
   - Direct Commission %: `20`
   - Override Commission %: `5`
4. Click **"Save"**

**OR use Bulk Import:**
1. Download template CSV
2. Fill in product mappings
3. Upload CSV
4. Click **"Import"**

---

### 7. Test End-to-End (30 minutes)

#### Test User Creation:
1. Create a test distributor in Apex
2. Check `/admin/distributors/[id]` → Right sidebar → Replicated Sites
3. Should show:
   - ✅ Jordyn.app: `https://jordyn.app/testuser` (Active)
   - ✅ AgentPulse: `https://agentpulse.cloud/testuser` (Active)

#### Test Webhook:
1. Use Postman collection: `docs/apex-integrations.postman_collection.json`
2. Import into Postman
3. Set variables:
   - `webhook_url`: Your webhook URL
   - `webhook_secret`: From integration config
4. Run **"Send Sale Webhook"** request
5. Check:
   - Response: 200 success
   - Database: `external_sales` table has new record
   - Member: Credits updated
   - Earnings: Commission recorded

---

### 8. Monitor First Real Transactions (Ongoing)

After going live:

1. **Daily for first week:**
   - Check: `/admin/integrations/[id]` → Recent Webhook Activity
   - Verify: No failed webhooks
   - Monitor: Slack/email for errors

2. **Weekly for first month:**
   - Review: Failed replicated sites (retry if needed)
   - Verify: Commission calculations correct
   - Check: Distributor feedback

3. **Set up alerts:**
   - Webhook failures → Email/Slack notification
   - Failed site creation → Email notification
   - High error rate → Page admin

---

## 🎯 Success Criteria

### Phase 1: Setup Complete (Week 1)
- [ ] Migration applied
- [ ] Both platforms configured
- [ ] API credentials working
- [ ] Test connection passing

### Phase 2: Documentation Shared (Week 2)
- [ ] jordyn.app team has docs
- [ ] agentpulse.cloud team has docs
- [ ] Integration kickoff calls scheduled
- [ ] Questions answered

### Phase 3: Integration Built (Weeks 3-4)
- [ ] jordyn.app implements user creation endpoint
- [ ] agentpulse.cloud implements user creation endpoint
- [ ] Both implement webhook sender
- [ ] Tested in sandbox

### Phase 4: Production Launch (Week 5)
- [ ] Product mappings configured
- [ ] End-to-end testing complete
- [ ] Monitoring/alerts set up
- [ ] First real transaction successful

---

## 📞 Support

If you encounter issues:

1. **Check logs:**
   - Webhook logs: `/admin/integrations/[id]` → Recent Activity
   - Replicated sites: `/admin/distributors/[id]` → Right sidebar

2. **Common Issues:**
   - "Invalid signature" → Check webhook secret matches
   - "Distributor not found" → Verify replicated site exists
   - "Platform not found" → Check platform_name in URL
   - Connection timeout → Check API endpoint URL

3. **Need Help?**
   - Review: `docs/INTEGRATIONS_API.md`
   - Check: Troubleshooting section
   - Email: support@theapexway.net

---

## 📊 Quick Reference

**Admin URLs:**
- Integrations: `/admin/integrations`
- Product Mappings: `/admin/integrations/product-mappings`
- Bulk Sync: `/admin/integrations/bulk-sync`

**Webhook Endpoints:**
- Jordyn: `/api/webhooks/integrations/jordyn`
- AgentPulse: `/api/webhooks/integrations/agentpulse`

**Database Tables:**
- `integrations`
- `distributor_replicated_sites`
- `integration_product_mappings`
- `external_sales`
- `integration_webhook_logs`

**Documentation:**
- Quick Start: `docs/INTEGRATION_QUICKSTART.md`
- API Docs: `docs/INTEGRATIONS_API.md`
- Examples: `docs/INTEGRATION_EXAMPLES.md`
- Postman: `docs/apex-integrations.postman_collection.json`

---

**Ready to go! Start with Step 1: Apply the database migration.**
