# Testing Guide

## Quick Start

### First Time Setup (Required)

```bash
# 1. Set up test environment (interactive)
npm run setup:test

# 2. Push database schema to test database
npm run db:push

# 3. (Optional) Seed test data
npm run seed:master
```

### Running Tests

```bash
# Run all tests
npm test

# Run E2E tests only
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run unit tests in watch mode
npm run test:watch

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts
```

## Test Environment

### Requirements

1. **Dedicated Test Database** (Supabase project)
   - **DO NOT** use production database for testing
   - Create separate "apex-test" project in Supabase
   - Tests will reset data frequently

2. **Environment File** (`.env.test`)
   - Created automatically by `npm run setup:test`
   - Contains test database credentials
   - In `.gitignore` (never commit!)

3. **Test Port** (Default: 3050)
   - Tests start dev server on port 3050
   - Make sure port is available

### Directory Structure

```
tests/
├── e2e/                    # Playwright E2E tests
│   ├── auth.spec.ts       # Authentication flows
│   ├── admin/             # Admin dashboard tests
│   ├── autopilot/         # Autopilot CRM tests
│   └── ...
├── unit/                   # Vitest unit tests
│   └── ...
├── fixtures/               # Test data and helpers
│   ├── test-data.ts       # Sample data
│   └── test-helpers.ts    # Utility functions
└── setup.ts               # Global test setup
```

## Test Types

### 1. E2E Tests (Playwright)

**Purpose:** Test full user workflows in a real browser

**Examples:**
- Login → Dashboard → Create Order
- Admin → Create Event → Publish
- Signup → Complete Profile → First Login

**Run:**
```bash
npm run test:e2e
```

### 2. Unit Tests (Vitest)

**Purpose:** Test individual functions and components

**Examples:**
- Compensation calculations
- Validation logic
- Utility functions

**Run:**
```bash
npm test
```

### 3. Integration Tests (Manual)

**Purpose:** Test FTC compliance features on staging

**See:** `INTEGRATION-TEST-PLAN.md` for detailed scenarios

## Current Test Status

### ✅ Passing (138 tests)
- CRM CSV export
- Flyer templates
- Some component tests

### ⚠️ Failing (~371 tests)
- **Root Cause:** Unconfigured test environment
- **Fix:** Run `npm run setup:test` and configure `.env.test`
- **See:** `TEST-RESULTS-2026-03-28.md` for details

## Troubleshooting

### Tests timing out

**Symptom:** Tests fail with "Timed out after 30s"

**Cause:** `.env.test` not configured or wrong credentials

**Fix:**
```bash
# Re-run setup
npm run setup:test

# Verify .env.test has real credentials (not placeholders)
cat .env.test

# Test database connection
npm run verify:stage-1
```

### Database schema mismatch

**Symptom:** Tests fail with SQL errors or missing tables

**Cause:** Test database schema out of sync

**Fix:**
```bash
# Push latest schema
npm run db:push

# Verify schema matches production
```

### Port 3050 already in use

**Symptom:** "Port 3050 is already allocated"

**Cause:** Dev server still running or crashed

**Fix:**
```bash
# Kill process on port 3050 (Windows)
netstat -ano | findstr :3050
taskkill /PID <process_id> /F

# Kill process on port 3050 (Mac/Linux)
lsof -ti:3050 | xargs kill -9
```

### Playwright browser not installed

**Symptom:** "Executable doesn't exist"

**Cause:** Playwright browsers not installed

**Fix:**
```bash
npx playwright install
```

## Writing New Tests

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login, navigate, etc.
    await page.goto('/login');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const input = page.locator('input[name="email"]');

    // Act
    await input.fill('test@example.com');
    await page.click('button[type="submit"]');

    // Assert
    await expect(page).toHaveURL('/dashboard');
  });

  test.afterEach(async ({ page }) => {
    // Cleanup if needed
  });
});
```

### Unit Test Template

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/my-module';

describe('myFunction', () => {
  it('should return expected value', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe('expected');
  });

  it('should handle edge case', () => {
    expect(myFunction('')).toBe('');
    expect(myFunction(null)).toBeNull();
  });
});
```

## Best Practices

### 1. Test Independence
- Each test should be independent
- Don't rely on test execution order
- Clean up after each test

### 2. Test Data
- Use unique identifiers (timestamps, UUIDs)
- Clean up test data after tests
- Don't hardcode IDs or emails

### 3. Assertions
- Be specific with assertions
- Test both happy path and error cases
- Use meaningful error messages

### 4. Performance
- Keep tests fast (<5s per test)
- Use `test.skip()` for slow tests during development
- Run full suite before committing

### 5. Debugging
- Use `page.screenshot()` to capture state
- Add `await page.pause()` to inspect manually
- Check console logs in browser

## CI/CD Integration

Tests run automatically on:
- Pull requests to `master`
- Pushes to `master`
- Nightly builds

### GitHub Actions Workflow

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test
      - run: npm run test:e2e
    env:
      # Test environment variables from secrets
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
      # ...
```

## Resources

- **Playwright Docs:** https://playwright.dev/
- **Vitest Docs:** https://vitest.dev/
- **Test Setup Guide:** `TEST-SETUP-GUIDE.md`
- **Test Results:** `TEST-RESULTS-2026-03-28.md`
- **Integration Tests:** `INTEGRATION-TEST-PLAN.md`

## Support

Having issues? Check:
1. `.env.test` configured correctly
2. Test database accessible
3. Latest schema pushed to test database
4. Port 3050 available

Still stuck? Contact the dev team or check recent test run logs in GitHub Actions.
