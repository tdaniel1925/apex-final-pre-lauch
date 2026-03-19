# Genealogy & Team Testing Quick Start Guide

## 🚨 FIRST: Fix the RLS Issue

Before running tests, you MUST fix the RLS infinite recursion bug:

1. Open Supabase Dashboard → SQL Editor
2. Run the fix: `scripts/fix-rls-infinite-recursion.sql`
3. Verify it worked (tests should pass after this)

## 🧪 Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suites

#### API Unit Tests
```bash
# Genealogy API tests
npm test -- tests/unit/api-genealogy.test.ts --run

# Team API tests
npm test -- tests/unit/api-team.test.ts --run

# Run both
npm test -- tests/unit/api-genealogy.test.ts tests/unit/api-team.test.ts --run
```

#### E2E Tests (Requires dev server running on port 3050)
```bash
# Start dev server first
npm run dev

# In another terminal:

# Genealogy E2E
npm run test:e2e -- tests/e2e/back-office-genealogy.spec.ts

# Team E2E
npm run test:e2e -- tests/e2e/back-office-team.spec.ts

# Consistency E2E
npm run test:e2e -- tests/e2e/back-office-consistency.spec.ts

# All back-office E2E tests
npm run test:e2e -- tests/e2e/back-office-*.spec.ts
```

#### Interactive UI Mode
```bash
# API tests with UI
npm run test:ui

# E2E tests with UI
npm run test:e2e:ui
```

#### Watch Mode (Auto-rerun on changes)
```bash
npm run test:watch
```

## 📊 Expected Results

### After RLS Fix - All Tests Should Pass

#### API Tests
- ✅ **api-genealogy.test.ts**: 22/22 passing
- ✅ **api-team.test.ts**: 32/32 passing

#### E2E Tests (Manual verification required)
- ✅ **back-office-genealogy.spec.ts**: 21 scenarios
- ✅ **back-office-team.spec.ts**: 36 scenarios
- ✅ **back-office-consistency.spec.ts**: 11 scenarios

### Before RLS Fix - Many Tests Fail

If you see this error, the RLS fix hasn't been applied yet:
```
PostgresError: infinite recursion detected in policy for relation "members"
Code: 42P17
```

**Solution:** Run `scripts/fix-rls-infinite-recursion.sql` in Supabase SQL Editor

## 🎯 Quick Validation Checklist

After applying the RLS fix, verify these work:

### API Level (via tests)
```bash
npm test -- tests/unit/api-genealogy.test.ts --run
```
✅ All 22 tests pass

```bash
npm test -- tests/unit/api-team.test.ts --run
```
✅ All 32 tests pass

### UI Level (manual)
1. ✅ Log in as test user (`sellag.sb@gmail.com`)
2. ✅ Navigate to `/dashboard/genealogy` - tree displays
3. ✅ Navigate to `/dashboard/team` - members display
4. ✅ Navigate to `/dashboard/matrix` - matrix displays
5. ✅ All three views show same member counts
6. ✅ Click on member - modal opens
7. ✅ Search/filter/sort works

## 🐛 Troubleshooting

### "Tests are failing with RLS errors"
**Fix:** Run `scripts/fix-rls-infinite-recursion.sql` in Supabase

### "E2E tests timeout"
**Fix:** Make sure dev server is running on port 3050
```bash
npm run dev
```

### "Cannot find test files"
**Fix:** Tests are in:
- `tests/unit/api-genealogy.test.ts`
- `tests/unit/api-team.test.ts`
- `tests/e2e/back-office-genealogy.spec.ts`
- `tests/e2e/back-office-team.spec.ts`
- `tests/e2e/back-office-consistency.spec.ts`

### "Playwright not installed"
**Fix:**
```bash
npx playwright install
```

### "Supabase connection errors"
**Fix:** Check `.env.local` has:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📁 Test Files Location

```
tests/
├── e2e/
│   ├── back-office-genealogy.spec.ts     (21 tests)
│   ├── back-office-team.spec.ts          (36 tests)
│   └── back-office-consistency.spec.ts   (11 tests)
└── unit/
    ├── api-genealogy.test.ts             (22 tests)
    └── api-team.test.ts                  (32 tests)
```

## 📝 Test Coverage

| View | E2E Tests | API Tests | Total |
|------|-----------|-----------|-------|
| Genealogy | 21 | 22 | 43 |
| Team | 36 | 32 | 68 |
| Consistency | 11 | - | 11 |
| **TOTAL** | **68** | **54** | **122** |

## 🔍 What Each Test Suite Covers

### Genealogy Tests
- Tree structure and display
- Expand/collapse nodes
- Depth controls (5, 10, 15, 20 levels)
- Organization stats
- Member modals
- RLS security
- Performance

### Team Tests
- Member list display
- Filtering (rank, status)
- Searching (name, email, rep#)
- Sorting (name, credits, date, rank)
- Pagination
- Member modals
- RLS security
- Performance

### Consistency Tests
- Same counts across all views
- Same member data across all views
- Same stats across all views
- Navigation between views
- Session persistence
- Data freshness

## 📚 Full Documentation

For detailed test report, see:
`GENEALOGY-TEAM-TEST-REPORT.md`

For RLS fix details, see:
`scripts/fix-rls-infinite-recursion.sql`
