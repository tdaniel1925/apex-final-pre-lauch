# Test Environment Setup Guide

**Created:** 2026-03-28
**Status:** ✅ Complete
**Purpose:** Configure test environment for E2E and unit/integration tests

---

## 🎯 Overview

This project has **two types of tests** that require different setup:

1. **E2E Tests (Playwright)** - Browser-based tests that test the full application
2. **Unit/Integration Tests (Vitest)** - Code-level tests for components and functions

Both test types use **`.env.test`** for configuration.

---

## 📋 Prerequisites

Before running tests, you need:

1. ✅ **Separate Supabase Test Project** (DO NOT use production!)
2. ✅ **Test Stripe Account** (use test mode keys only)
3. ✅ **Test Email Service** (Resend test mode)
4. ✅ **Node.js 18+** installed
5. ✅ **All dependencies** installed (`npm install`)

---

## 🔧 Step 1: Configure `.env.test`

A `.env.test` file has been created with placeholder values. You MUST configure it with real test credentials:

### Required Configuration:

```bash
# 1. Create a TEST Supabase project (separate from production)
NEXT_PUBLIC_SUPABASE_URL="https://YOUR-TEST-PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-test-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-test-service-role-key-here"

# 2. Use Stripe TEST keys
STRIPE_SECRET_KEY="sk_test_YOUR-TEST-KEY"
STRIPE_WEBHOOK_SECRET="whsec_test_YOUR-WEBHOOK-SECRET"

# 3. Use Resend test API key
RESEND_API_KEY="re_YOUR-TEST-KEY"

# 4. Set OpenAI key (can be same as dev or mock)
OPENAI_API_KEY="sk-proj-YOUR-KEY-OR-MOCK"
```

### How to Get Test Credentials:

**Supabase Test Project:**
1. Go to https://supabase.com/dashboard
2. Create a NEW project named "Apex Test" or similar
3. Go to Settings > API
4. Copy: Project URL, anon key, service_role key
5. Paste into `.env.test`

**Stripe Test Keys:**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy "Secret key" (starts with `sk_test_`)
3. Go to Webhooks > Add endpoint
4. Create webhook for `http://localhost:3050/api/webhooks/stripe`
5. Copy signing secret (starts with `whsec_`)
6. Paste into `.env.test`

**Resend Test Key:**
1. Go to https://resend.com/api-keys
2. Create a test API key
3. Paste into `.env.test`

---

## 🗄️ Step 2: Set Up Test Database

Your Supabase test project needs the same schema as production:

### Option A: Run Migrations (Recommended)

```bash
# Apply all migrations to test database
npx supabase db push --db-url "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

### Option B: Manual Schema Setup

1. Export production schema:
```bash
npx supabase db dump --db-url "[production-url]" > schema.sql
```

2. Import to test database:
```bash
psql "[test-database-url]" < schema.sql
```

### Option C: Use Supabase Dashboard

1. Go to your TEST project dashboard
2. Navigate to SQL Editor
3. Copy migration files from `supabase/migrations/` one by one
4. Run each migration in order

---

## 🧪 Step 3: Seed Test Data (Optional)

Some tests require seed data. Create test users and distributors:

```bash
# Run seed script (to be created)
npm run test:seed
```

**Seed Data Includes:**
- Test admin user (admin@test.com)
- Test distributor (distributor@test.com)
- Test products (Business Center, Software Suite)
- Sample team structure

---

## ▶️ Step 4: Run Tests

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/auth-flows.spec.ts

# Run in UI mode (interactive)
npx playwright test --ui

# Run in headed mode (watch browser)
npx playwright test --headed
```

### Unit/Integration Tests (Vitest)

```bash
# Run all unit tests
npm run test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npx vitest tests/unit/compliance/anti-frontloading.test.ts
```

---

## 🔍 Troubleshooting

### Tests Timing Out

**Problem:** Tests wait 120 seconds for server to start, then fail

**Solution:**
1. Check `.env.test` has valid Supabase credentials
2. Run `npm run dev` manually first to verify app starts
3. Check port 3050 is available (not used by another process)

```bash
# Check what's using port 3050
netstat -ano | findstr :3050  # Windows
lsof -i :3050                  # Mac/Linux

# Kill process on port 3050 if needed
taskkill /PID [process-id] /F  # Windows
kill -9 [process-id]            # Mac/Linux
```

### Database Connection Errors

**Problem:** Tests fail with "Connection refused" or "Invalid credentials"

**Solution:**
1. Verify `.env.test` Supabase credentials are correct
2. Test connection manually:
```bash
psql "[test-database-url]"
```
3. Check Supabase dashboard shows test project is running
4. Verify RLS policies allow test operations

### Compliance Unit Tests Failing

**Problem:** Tests in `tests/unit/compliance/` fail with database errors

**Solution:**
These are **integration tests** (not true unit tests) - they require live database:
1. Ensure test database has all tables (`distributors`, `members`, `orders`)
2. Verify `.env.test` has service role key (not just anon key)
3. Run migrations on test database
4. Consider moving these to `tests/integration/` folder

### Playwright Can't Find Browsers

**Problem:** "browserType.launch: Executable doesn't exist"

**Solution:**
```bash
# Install Playwright browsers
npx playwright install

# Or install specific browser
npx playwright install chromium
```

---

## 📊 Test Status Dashboard

### E2E Tests (Playwright)

| Category | Status | Count | Notes |
|----------|--------|-------|-------|
| Auth Flows | ⚠️ Needs Setup | 17 tests | Require test database |
| Admin Events | ⚠️ Failing | 6 tests | Pre-existing failures |
| Autopilot CRM | ⚠️ Failing | 10+ tests | Need environment setup |
| Voice Agent | ⚠️ Failing | 5 tests | VAPI credentials needed |

### Unit Tests (Vitest)

| Module | Status | Count | Notes |
|--------|--------|-------|-------|
| Compliance | ⚠️ Needs DB | 37 tests | Integration tests, need database |
| Components | ✅ Ready | 0 tests | No tests yet |
| Utilities | ✅ Ready | 0 tests | No tests yet |

**Total Tests:** 513 E2E + 37 Unit = **550 tests**

---

## 🎯 Next Steps

After completing setup:

1. ✅ Configure `.env.test` with real credentials
2. ✅ Set up test database schema
3. ⏭️ Seed test data
4. ⏭️ Run tests and verify they pass
5. ⏭️ Fix failing tests (see `TEST-STATUS-2026-03-28.md`)
6. ⏭️ Add to CI/CD pipeline

---

## 📚 Related Documentation

- **Test Status Report:** `TEST-STATUS-2026-03-28.md` - Analysis of all tests
- **Deployment Guide:** `DEPLOYMENT-SUMMARY-2026-03-28.md` - Integration testing checklist
- **Production Readiness:** `READY-FOR-PRODUCTION-2026-03-28.md` - Complete deployment plan

---

## ⚠️ Important Reminders

1. **NEVER use production credentials in `.env.test`**
2. **ALWAYS use Stripe test keys** (start with `sk_test_`)
3. **Use separate Supabase test project** (not production!)
4. **Git ignores `.env.test`** - safe to add real credentials locally
5. **CI/CD needs `.env.test` configured** - use GitHub Secrets

---

**Setup Complete?** Run `npm run test:e2e` to verify! 🎉

---

🍪 **CodeBakers** | Test Setup | Status: ✅ Complete | v6.19
