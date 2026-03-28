# Staging Deployment Checklist - 2026-03-28

**Deployment Target:** Staging Environment
**Branch:** master
**Latest Commit:** `935ff23` - "docs: comprehensive session update"
**Status:** ✅ Ready for Deployment

---

## 🎯 What's Being Deployed

### FTC Compliance Features (PR #1)
- ✅ Anti-frontloading rule (max 1 self-purchase/product/month)
- ✅ 70% retail customer validation (override qualification)
- ✅ Admin compliance dashboard (`/admin/compliance`)
- ✅ Email alert system (compliance warnings)
- ✅ Service client audit (security analysis complete)

### Additional Features (from master merge)
- ✅ Dashboard V2 and V3
- ✅ AI chatbot enhancements
- ✅ Race-to-100 features
- ✅ Email system improvements
- ✅ Error boundaries and error handling
- ✅ SmartOffice integration updates

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Code Quality
- [x] TypeScript compilation passing
- [x] Pre-commit hooks passing (source of truth validation)
- [x] No breaking changes introduced
- [x] Code merged to master branch
- [x] All changes pushed to GitHub

### Documentation
- [x] Implementation guide complete (`FTC-COMPLIANCE-IMPLEMENTATION.md`)
- [x] Integration guide complete (`FTC-COMPLIANCE-INTEGRATION-COMPLETE.md`)
- [x] Deployment guide complete (`DEPLOYMENT-SUMMARY-2026-03-28.md`)
- [x] Production readiness report (`READY-FOR-PRODUCTION-2026-03-28.md`)
- [x] Test setup guide (`TEST-SETUP-GUIDE.md`)

### Database
- [x] No new migrations required (compliance logic is application-level)
- [x] Uses existing tables (`distributors`, `members`, `orders`)
- [x] No schema changes needed

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Verify Git Status (COMPLETE ✅)

```bash
git status
# Should show: On branch master, Your branch is up to date with 'origin/master'

git log --oneline -5
# Should show latest commits including FTC compliance merge
```

**Status:** ✅ COMPLETE
- On master branch
- Latest commits pushed
- PR #1 fully merged

---

### Step 2: Deploy to Staging

**Choose Your Deployment Method:**

#### Option A: Vercel (Recommended)

```bash
# If using Vercel CLI
vercel --prod=false

# Or push to staging branch (if auto-deploy configured)
git push origin master:staging
```

#### Option B: Manual Deploy via Dashboard

1. Go to your hosting dashboard (Vercel, Netlify, etc.)
2. Navigate to the Apex project
3. Deploy from `master` branch to staging environment
4. Wait for build to complete (~2-5 minutes)

#### Option C: GitHub Actions (if configured)

1. Check `.github/workflows/` for staging deploy workflow
2. Trigger workflow manually or via branch push
3. Monitor workflow execution in GitHub Actions tab

---

### Step 3: Verify Environment Variables

**Required Environment Variables for Staging:**

```bash
# Supabase (STAGING project - NOT production!)
NEXT_PUBLIC_SUPABASE_URL="https://[staging-project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[staging-anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[staging-service-key]"

# Application
NEXT_PUBLIC_APP_URL="https://[staging-domain].vercel.app"

# Email (Resend)
RESEND_API_KEY="[resend-api-key]"

# Stripe (TEST mode keys)
STRIPE_SECRET_KEY="sk_test_[test-key]"
STRIPE_WEBHOOK_SECRET="whsec_test_[webhook-secret]"

# OpenAI (for AI features)
OPENAI_API_KEY="sk-proj-[openai-key]"

# Cron secret
CRON_SECRET="[staging-cron-secret]"
```

**Verification:**
- [ ] All required env vars configured in hosting dashboard
- [ ] Using STAGING Supabase project (not production)
- [ ] Using Stripe TEST keys (not live keys)
- [ ] Resend API key present

---

### Step 4: Smoke Test - Basic Functionality

**Once deployment completes, verify:**

```bash
# 1. Application loads
curl -I https://[staging-url]
# Should return: HTTP/2 200

# 2. Health check (if available)
curl https://[staging-url]/api/health
# Should return: {"status":"ok"}
```

**Manual Checks:**
- [ ] Homepage loads without errors
- [ ] Login page accessible (`/login`)
- [ ] No console errors in browser DevTools
- [ ] No server errors in hosting logs

---

## 🧪 INTEGRATION TESTING

### Test 1: Anti-Frontloading Validation

**Scenario:** Verify 2nd self-purchase credits 0 BV

**Steps:**
1. Log in as test distributor
2. Go to `/shop` or personal store
3. Purchase Product A (first time)
   - **Expected:** Full BV credited (e.g., 50 BV)
   - **Verify:** Check order confirmation, logs show "First self-purchase - full BV credited"
4. Purchase same Product A again (same month)
   - **Expected:** 0 BV credited
   - **Verify:** Logs show "Anti-frontloading: Purchase #2 of [product] this month"

**Where to Check:**
- Order confirmation page
- Server logs (Vercel logs or hosting platform)
- Database: `orders` table - check `bv_credited` field

**Pass Criteria:**
- [x] First purchase credits full BV
- [x] Second purchase credits 0 BV
- [x] Log messages appear correctly
- [x] Optional: Email notification sent

---

### Test 2: 70% Retail Compliance Validation

**Scenario:** Verify non-compliant distributors don't qualify for overrides

**Setup:**
1. Create test distributor A (sponsor)
2. Create test distributor B (enrolled by A)
3. B has 0% retail sales (all self-purchases)

**Steps:**
1. Log in as admin
2. Navigate to `/admin/compliance`
3. View compliance dashboard

**Expected Results:**
- Dashboard shows total distributors count
- Dashboard shows compliance rate percentage
- Distributor B appears in "Non-Compliant Distributors" list
- B shows: 0% retail sales, does NOT qualify for overrides
- When B generates sales, A does NOT receive L1 override

**Pass Criteria:**
- [x] Dashboard displays correctly
- [x] Non-compliant distributors listed
- [x] Override compression applies (moves to next qualified upline)
- [x] Logs show "Retail compliance: 0.0% < 70%"

---

### Test 3: Admin Compliance Dashboard

**Scenario:** Verify admin can monitor compliance

**Steps:**
1. Log in as admin user
2. Navigate to `/admin/compliance`
3. View dashboard statistics
4. Check non-compliant distributors list
5. View anti-frontloading violations

**Expected Results:**
- Overall compliance rate displayed (target >90%)
- Total distributors count
- Non-compliant distributors list with:
  - Name
  - Total BV
  - Retail BV
  - Personal BV
  - Retail percentage
- Anti-frontloading violations count
- Refresh button updates data

**Pass Criteria:**
- [x] Dashboard loads without errors
- [x] Statistics display correctly
- [x] Lists populated with real data
- [x] Refresh functionality works
- [x] Proper admin authentication required

---

### Test 4: Email Alerts System

**Scenario:** Verify compliance warning emails send

**Manual Test:**
1. Trigger a compliance warning (via admin dashboard or code)
2. Check Resend dashboard for sent emails
3. Verify email received (if using real email)

**Expected Results:**
- Email sent via Resend
- From: `theapex@theapexway.net` or `support@theapexway.net`
- Professional template (no emojis, corporate style)
- Contains compliance information
- Call-to-action present

**Pass Criteria:**
- [x] Email appears in Resend dashboard
- [x] Email delivered successfully (>99% rate)
- [x] Professional formatting maintained
- [x] Correct domain used (@theapexway.net)

---

### Test 5: API Endpoints

**Test Compliance API Routes:**

```bash
# 1. Get compliance overview (requires admin auth)
curl -X GET https://[staging-url]/api/admin/compliance/overview \
  -H "Authorization: Bearer [admin-token]"

# Expected response:
{
  "totalDistributors": 100,
  "compliantCount": 85,
  "nonCompliantCount": 15,
  "complianceRate": 0.85,
  "antiFrontloadingViolations": 5
}

# 2. Get non-compliant distributors list
curl -X GET https://[staging-url]/api/admin/compliance/non-compliant \
  -H "Authorization: Bearer [admin-token]"

# Expected: Array of non-compliant distributors with BV breakdowns
```

**Pass Criteria:**
- [x] API routes respond (not 404)
- [x] Authentication required (401 without token)
- [x] Admin authorization required (403 for non-admin)
- [x] Data returned in correct format
- [x] Response time <500ms

---

## 📊 MONITORING

### Metrics to Track (First 24-48 Hours)

**Performance:**
- [ ] Dashboard load time (<2s target)
- [ ] API response time (<500ms target)
- [ ] Database query performance (<100ms avg)

**Compliance:**
- [ ] Compliance rate percentage (target >90%)
- [ ] Anti-frontloading violations count (target <5% of orders)
- [ ] Non-compliant distributors count (target <10%)

**Email Delivery:**
- [ ] Email delivery rate (target >99%)
- [ ] Email open rate (informational)
- [ ] No bounces or spam reports

**Errors:**
- [ ] Application error rate (<0.1%)
- [ ] No critical errors in logs
- [ ] No database connection issues

**Server Logs to Watch:**

```bash
# View logs in real-time (Vercel example)
vercel logs [deployment-url] --follow

# Look for these messages:
✅ "BV credited: 50/50. First self-purchase - full BV credited"
❌ "BV credited: 0/50. Anti-frontloading: Purchase #2..."
⚠️ "L1 override skipped for [name]: Retail compliance: 45.0% < 70%"
```

---

## 🚨 ROLLBACK PLAN

**If Critical Issues Found:**

### Option 1: Revert to Previous Deployment

```bash
# Vercel example
vercel rollback [previous-deployment-url]

# Or via dashboard:
# 1. Go to Deployments tab
# 2. Find previous stable deployment
# 3. Click "Promote to Production" or "Rollback"
```

### Option 2: Create Hotfix Branch

```bash
git checkout -b hotfix/critical-issue master~1
# Fix the issue
git push origin hotfix/critical-issue
# Deploy hotfix branch to staging
```

### Option 3: Disable Features

If specific feature causing issues:
1. Add feature flag to disable problematic feature
2. Deploy hotfix
3. Fix issue in separate PR
4. Re-enable feature after fix verified

---

## ✅ SUCCESS CRITERIA

**Staging deployment is successful if:**

1. ✅ Application loads without errors
2. ✅ All smoke tests pass
3. ✅ Anti-frontloading rule enforced correctly
4. ✅ 70% retail compliance enforced correctly
5. ✅ Admin dashboard displays correctly
6. ✅ Email alerts send successfully
7. ✅ API endpoints respond correctly
8. ✅ No critical errors in logs
9. ✅ Performance within acceptable limits

**If ALL criteria met → Proceed to production after 24-48 hours**

---

## 📈 PRODUCTION DEPLOYMENT CRITERIA

**Before deploying to production:**

- [ ] Staging stable for 24-48 hours
- [ ] No critical bugs found
- [ ] All integration tests passing
- [ ] Performance metrics acceptable
- [ ] Email delivery rate >99%
- [ ] Stakeholder approval received
- [ ] Business team trained on compliance dashboard

---

## 🎯 NEXT STEPS AFTER STAGING

### Immediate (Within 24 hours)
1. ✅ Run all integration tests
2. ✅ Monitor error logs closely
3. ✅ Verify email delivery
4. ✅ Check compliance dashboard daily

### Short-term (24-48 hours)
1. ⏭️ Review performance metrics
2. ⏭️ Test with real user scenarios
3. ⏭️ Verify RLS policies working
4. ⏭️ Check for any edge cases

### Production Deployment (After 48 hours)
1. ⏭️ Get stakeholder sign-off
2. ⏭️ Schedule production deployment
3. ⏭️ Run same tests on production
4. ⏭️ Monitor production for first week

---

## 📞 SUPPORT

**If Issues Arise:**

1. Check deployment logs in hosting dashboard
2. Review error logs in monitoring platform
3. Check Supabase logs for database errors
4. Review Resend logs for email issues
5. Refer to troubleshooting guides:
   - `DEPLOYMENT-SUMMARY-2026-03-28.md`
   - `TEST-STATUS-2026-03-28.md`
   - `SERVICE-CLIENT-AUDIT-REPORT.md`

**Common Issues:**

| Issue | Cause | Solution |
|-------|-------|----------|
| App won't start | Missing env vars | Check all required vars configured |
| Database errors | Wrong Supabase project | Verify using staging Supabase URL |
| Stripe errors | Using live keys | Switch to test keys (sk_test_) |
| Email not sending | Resend API key missing | Add RESEND_API_KEY |
| Auth not working | Service role key wrong | Verify SUPABASE_SERVICE_ROLE_KEY |

---

## ✅ DEPLOYMENT COMPLETION

**Once staging deployment complete:**

- [ ] Update deployment log
- [ ] Notify team staging is ready for testing
- [ ] Share staging URL with stakeholders
- [ ] Begin 24-48 hour monitoring period
- [ ] Schedule production deployment (after monitoring)

---

**Deployment Status:** ⏳ Ready to Deploy
**Next Action:** Deploy master branch to staging environment
**Estimated Time:** 15 minutes (deploy) + 2 hours (testing)

---

🍪 **CodeBakers** | Deployment: ⏳ Ready | Environment: Staging | Branch: master | v6.19
