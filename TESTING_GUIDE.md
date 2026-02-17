# Testing Guide - Email Nurture Campaign System

## 📋 Test Coverage

### Unit Tests (Vitest)
- **Email template variable replacement** - 25+ tests
- Variable building from distributor data
- Template rendering with real data
- Edge cases (unicode, special chars, long values)
- Available variables catalog

### E2E Tests (Playwright)
- **Admin Email Templates UI** - Full CRUD operations
- **AI Email Generation** - Complete flow
- **Signup Email Enrollment** - Integration test
- **User Licensing Status Change** - User flow

## 🚀 Running Tests

### Prerequisites

1. **Install dependencies** (if not already done):
```bash
npm install
```

2. **Set up environment variables** in `.env.local`:
```env
# Required for email sending tests
RESEND_API_KEY=re_DjMiknb1_T8MdjYu6hBvdpCbbxeZeKi7A

# Required for AI generation tests
ANTHROPIC_API_KEY=your_anthropic_key_here

# For E2E tests
NEXT_PUBLIC_APP_URL=http://localhost:3050
```

3. **Create test admin account** in Supabase:
```sql
-- Run in Supabase SQL Editor
INSERT INTO distributors (
  auth_user_id,
  first_name,
  last_name,
  email,
  slug,
  is_master,
  licensing_status
) VALUES (
  'test-admin-auth-id', -- Create auth user first with email: admin@test.com
  'Admin',
  'Test',
  'admin@test.com',
  'admin-test',
  true, -- is_master = true for admin
  'licensed'
);
```

4. **Run database migration**:
```bash
# In Supabase SQL Editor, run:
supabase/migrations/20240221000000_add_email_nurture_system.sql
```

---

## 🧪 Unit Tests (Vitest)

### Run all unit tests:
```bash
npm run test
```

### Run with UI:
```bash
npm run test:ui
```

### Run with coverage:
```bash
npm run test:coverage
```

### Run specific test file:
```bash
npx vitest tests/unit/email-variables.test.ts
```

### Watch mode (auto-rerun on changes):
```bash
npx vitest --watch
```

---

## 🌐 E2E Tests (Playwright)

### Run all E2E tests:
```bash
npx playwright test
```

### Run with UI (see tests execute in browser):
```bash
npx playwright test --ui
```

### Run specific test file:
```bash
npx playwright test tests/e2e/email-system.spec.ts
```

### Run specific test by name:
```bash
npx playwright test -g "should display email templates list"
```

### Debug mode (step through tests):
```bash
npx playwright test --debug
```

### Run on specific browser:
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Generate test report:
```bash
npx playwright show-report
```

---

## 📊 Test Scripts in package.json

Add these to your `package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

---

## 🎯 What Each Test Validates

### Unit Tests: Email Variables (`email-variables.test.ts`)

✅ **Variable Building**
- Extracts first_name, last_name, email from distributor
- Formats licensing_status for display
- Generates correct dashboard/profile/referral URLs
- Calculates days since signup
- Handles missing data gracefully

✅ **Variable Replacement**
- Replaces {first_name} with actual name
- Handles multiple variables in one template
- Replaces duplicate variables correctly
- Handles missing variables without crashing
- Works with HTML content and URLs

✅ **Template Rendering**
- Renders both subject and body
- Complete welcome email example
- Handles all variable types
- Edge cases (unicode, special chars, long values)

✅ **Available Variables Catalog**
- Returns array of all variables
- Each has key, description, example
- Includes all required variables

**Total: 25+ unit tests**

---

### E2E Tests: Email System (`email-system.spec.ts`)

✅ **Admin Templates List**
- Displays templates page correctly
- Shows create button and filters
- Filters by licensing status work
- Template cards show correct info

✅ **Template CRUD Operations**
- Opens create modal
- Creates template manually
- Opens AI generation modal
- Edits existing template
- Deletes with confirmation
- Toggles active/inactive status

✅ **AI Email Generation** (requires ANTHROPIC_API_KEY)
- Opens AI modal from create form
- Accepts prompt description
- Shows loading state
- Generates email in ~3 seconds
- Populates subject and body fields

✅ **Variable Helper**
- Shows dropdown with all variables
- Inserts variables into textarea
- Displays {first_name}, {dashboard_link}, etc.

✅ **Signup Integration** (requires RESEND_API_KEY)
- New user signup enrolls in campaign
- Welcome email sent immediately
- User redirected to dashboard

✅ **User Status Change**
- User can change own licensing status
- Modal shows both options
- Updates successfully
- Reflects in UI

**Total: 20+ E2E tests**

---

## 🐛 Troubleshooting Tests

### Unit Tests Failing?

**Error: Cannot find module '@/lib/email/template-variables'**
- Make sure TypeScript path aliases are set correctly
- Check `tsconfig.json` has `"@/*": ["./src/*"]`

**Error: Environment variable not defined**
- Create `.env.test` file with test values
- Or set `NEXT_PUBLIC_APP_URL` in tests/setup.ts

### E2E Tests Failing?

**Error: Timeout waiting for page**
- Increase timeout in playwright.config.ts
- Make sure dev server is running (`npm run dev`)
- Check port 3050 is not in use

**Error: Element not found**
- Test selectors may have changed
- Update selectors in test file
- Run with `--ui` flag to debug visually

**Error: Login failed**
- Create test admin account (see Prerequisites)
- Verify credentials in test file match database
- Check Supabase auth is working

### AI Generation Tests Skipped?

**"ANTHROPIC_API_KEY not set" - Test skipped**
- This is expected if you haven't added the API key yet
- Add `ANTHROPIC_API_KEY=your_key` to `.env.local`
- Re-run tests

### Email Sending Tests Skipped?

**"RESEND_API_KEY not set" - Test skipped**
- This is expected if you haven't added the API key yet
- Add `RESEND_API_KEY=re_DjMiknb1_T8MdjYu6hBvdpCbbxeZeKi7A` to `.env.local`
- Re-run tests

---

## ✅ Pre-Launch Test Checklist

Before going live, run this checklist:

### 1. Unit Tests
- [ ] All unit tests pass: `npm run test`
- [ ] No skipped tests (or acceptable skips documented)
- [ ] Coverage > 80% for email utilities

### 2. E2E Tests
- [ ] Template list displays: `npx playwright test -g "display email templates"`
- [ ] Can create template manually: `npx playwright test -g "create template manually"`
- [ ] AI generation works (with API key): `npx playwright test -g "generate email with AI"`
- [ ] Can edit and delete templates

### 3. Manual Testing
- [ ] Signup new user → receives welcome email
- [ ] Check Resend dashboard shows email sent
- [ ] Admin can access `/admin/email-templates`
- [ ] AI generator creates valid email
- [ ] Variables render correctly in preview
- [ ] User can change licensing status on profile

### 4. Database
- [ ] Migration ran successfully
- [ ] `email_templates` table has welcome emails
- [ ] `email_campaigns` table exists
- [ ] `email_sends` table exists

### 5. Environment
- [ ] `RESEND_API_KEY` set in production
- [ ] `ANTHROPIC_API_KEY` set in production
- [ ] `NEXT_PUBLIC_APP_URL` points to production domain

---

## 📈 Continuous Testing

### Local Development
```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Watch mode for unit tests
npm run test -- --watch

# Terminal 3: E2E tests when needed
npm run test:e2e:ui
```

### Before Committing
```bash
npm run test && npm run build
```

### CI/CD Pipeline (Future)
```yaml
# .github/workflows/test.yml
- name: Run Unit Tests
  run: npm run test:coverage

- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

---

## 🎓 Writing New Tests

### Add Unit Test:
1. Create file in `tests/unit/`
2. Import from `vitest`: `import { describe, it, expect } from 'vitest'`
3. Write test:
```typescript
describe('My Feature', () => {
  it('should do something', () => {
    expect(myFunction()).toBe(expected);
  });
});
```

### Add E2E Test:
1. Create file in `tests/e2e/`
2. Import from `@playwright/test`: `import { test, expect } from '@playwright/test'`
3. Write test:
```typescript
test('should click button', async ({ page }) => {
  await page.goto('/my-page');
  await page.click('button');
  await expect(page.getByText('Success')).toBeVisible();
});
```

---

## 📚 Resources

- **Vitest Docs**: https://vitest.dev/
- **Playwright Docs**: https://playwright.dev/
- **Testing Best Practices**: https://github.com/goldbergyoni/javascript-testing-best-practices

---

## 🎉 Test Results

After running tests, you'll see:

**Unit Tests:**
```
✓ tests/unit/email-variables.test.ts (25 tests) 234ms
  ✓ Email Template Variable System (25)
    ✓ buildTemplateVariables (8)
    ✓ replaceTemplateVariables (7)
    ✓ renderEmailTemplate (4)
    ✓ getAvailableVariables (3)
    ✓ Variable Edge Cases (3)

Test Files  1 passed (1)
     Tests  25 passed (25)
```

**E2E Tests:**
```
Running 20 tests using 1 worker

  ✓ tests/e2e/email-system.spec.ts:15:5 › should display email templates list (2.1s)
  ✓ tests/e2e/email-system.spec.ts:28:5 › should filter templates (1.8s)
  ✓ tests/e2e/email-system.spec.ts:45:5 › should create template (3.2s)
  ...

  20 passed (1.2m)
```

All green = Ready to launch! 🚀
