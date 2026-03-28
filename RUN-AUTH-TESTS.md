# Quick Guide: Running Authentication Tests

## Fast Start (3 Commands)

```bash
# 1. Ensure server is running
npm run dev

# 2. In another terminal, run auth tests
npx playwright test tests/e2e/auth-flows.spec.ts

# 3. View results
npx playwright show-report
```

---

## Test Files

| File | Tests | Focus |
|------|-------|-------|
| `tests/e2e/auth-flows.spec.ts` | 21 tests | Login, Signup, Password Reset |
| `tests/e2e/signup-business-personal.spec.ts` | 11 tests | Personal vs Business Registration |
| `tests/e2e/rep-backoffice/01-auth.spec.ts` | 7 tests | Rep Dashboard Auth |

---

## Common Commands

```bash
# Run all auth tests
npx playwright test tests/e2e/auth-flows.spec.ts

# Run specific suite
npx playwright test --grep="Login Flow"
npx playwright test --grep="Signup Flow"
npx playwright test --grep="Password Reset"

# Run with UI (for debugging)
npx playwright test --ui

# Run headed (see browser)
npx playwright test --headed

# Run single test
npx playwright test --grep="should login with valid email and password"
```

---

## Test Coverage

### ✅ Fully Tested
- Login with email/password
- Signup (personal and business)
- Form validation
- Password strength
- Slug availability
- SSN/EIN validation
- Age validation (18+)
- Session persistence
- Logout
- Security (SQL injection, XSS)

### ⚠️ Partially Tested
- Password reset (request only, token tests skipped)
- Duplicate email prevention (skipped)

### ❌ Not Tested
- Email verification flow
- Two-factor authentication
- Rate limiting
- Account lockout

---

## Expected Results

### Passing Tests (21/24)
- All login tests should pass
- All signup validation tests should pass
- Password strength indicator tests should pass
- Slug availability tests should pass

### Skipped Tests (3/24)
- Duplicate email signup (complex setup required)
- Valid reset token (requires email integration)
- Expired reset token (requires time manipulation)

---

## Troubleshooting

### Tests Fail to Start
**Problem:** "Error: connect ECONNREFUSED ::1:3050"
**Solution:** Start dev server first: `npm run dev`

### Tests Timeout
**Problem:** Tests take too long or timeout
**Solution:** Increase timeout in test: `test.setTimeout(60000)`

### Database State Issues
**Problem:** Tests fail due to existing data
**Solution:** Add cleanup logic or use unique test data

### Environment Variables Missing
**Problem:** "SUPABASE_URL is not defined"
**Solution:** Copy `.env.example` to `.env.local` and fill in values

---

## Quick Fixes

### Run Tests Without Starting Server
```bash
# Playwright will auto-start server (configured in playwright.config.ts)
npx playwright test
```

### Debug Specific Failure
```bash
# Run with trace
npx playwright test --trace on --grep="failing test name"

# View trace file
npx playwright show-trace test-results/.../trace.zip
```

### Run Only Fast Tests
```bash
# Skip slow/integration tests
npx playwright test --grep-invert="slow"
```

---

## Next Steps After Running Tests

1. ✅ **All Pass:** Review HTML report for performance insights
2. ⚠️ **Some Fail:** Check console output for specific errors
3. ❌ **Many Fail:** Verify environment setup and database state
4. 📊 **Review Coverage:** Check `TESTING-AUTH-FLOWS-REPORT.md` for gaps

---

## Test Result Interpretation

```bash
# Example output:
Running 21 tests using 1 worker
  ✓ should login with valid credentials (3.2s)
  ✓ should show error for invalid credentials (1.8s)
  ✓ should validate email format (1.2s)
  ...
  ✓ 18 passed (45s)
  ⊘ 3 skipped
```

**Good Result:**
- ✓ 18+ passing
- ⊘ 3 skipped (expected)
- 0 failed
- Total time: < 2 minutes

**Needs Investigation:**
- Any failed tests
- Timeouts
- Unexpected skips
- Total time > 5 minutes

---

## Contact

For detailed analysis, see: `TESTING-AUTH-FLOWS-REPORT.md`
