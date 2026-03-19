# Matrix Tests Quick Start Guide

## TL;DR - Run These Commands

### 1. Verify Database (Always Works)
```bash
npm run test -- tests/unit/api-matrix.test.ts
```
**Expected:** ✅ 16 tests pass, confirms Brian is enrolled by Charles

### 2. Test Matrix UI (Needs Dev Server)
```bash
# Terminal 1:
npm run dev

# Terminal 2:
npm run test:e2e -- tests/e2e/back-office-matrix.spec.ts
```
**Expected:** ✅ Matrix view shows Charles's 3 enrollees including Brian

### 3. Debug Test (If Brian Not Visible)
```bash
# Make sure dev server is running
npm run test:e2e -- tests/e2e/matrix-debug-charles-brian.spec.ts
```
**Generates:** Screenshots and debug files in `test-results/matrix-debug/`

---

## What The Tests Verify

### ✅ Database Verification
- Charles Potter has member_id: `ff41307d-2641-45bb-84c7-ee5022a7b869`
- Brian Rawlston has member_id: `2ca889e6-0015-4100-ae08-043903926ee4`
- Brian.enroller_id === Charles.member_id ✓

### ✅ Matrix Level 1 (Direct Enrollees)
Charles has 3 direct enrollees:
1. Sella Daniel
2. Donna Potter
3. **Brian Rawlston** ← Should appear in Matrix view

---

## If Tests Fail

### "Charles not found" Error
❌ Wrong email being used
✅ Use `fyifromcharles@gmail.com` NOT `charles@example.com`

### "Brian not found" Error
❌ Wrong email being used
✅ Use `bclaybornr@gmail.com` NOT `brian@example.com`

### "Cannot connect to localhost:3000"
❌ Wrong port
✅ Dev server runs on port `3050` NOT `3000`

### E2E Tests Timeout
❌ Dev server not running
✅ Run `npm run dev` in a separate terminal first

---

## Test Files Location

```
tests/
├── e2e/
│   ├── back-office-matrix.spec.ts          ← Main E2E tests
│   └── matrix-debug-charles-brian.spec.ts  ← Debug test
└── unit/
    └── api-matrix.test.ts                  ← Database tests
```

---

## Expected Test Results

### Unit Tests (api-matrix.test.ts)
```
✓ should find Charles Potter in database
✓ should find Brian and verify relationship with Charles
✓ should query all reps enrolled by Charles
✓ 16 tests passed | 9 skipped
Duration: ~7s
```

### E2E Tests (back-office-matrix.spec.ts)
```
✓ Charles displays in matrix view
✓ Brian displays in Charles matrix
✓ Matrix shows correct levels (1-5)
✓ Distributor modal opens on click
✓ 10+ tests passed
```

### Debug Test (matrix-debug-charles-brian.spec.ts)
```
STEP 1: ✓ Database relationship confirmed
STEP 2: ✓ Login successful, Matrix page loaded
STEP 3: ✓ Page structure analyzed
STEP 4: ✓ Brian search tested
STEP 5: ✓ Level 1 members checked (3 found)
STEP 6: ✓ Component rendering verified
STEP 7: ✓ Final diagnosis complete
```

---

## Debug Output

When you run the debug test, check these files:

```
test-results/matrix-debug/
├── 1-database-relationships.json    ← Charles & Brian data
├── 2-api-calls.json                 ← API requests made
├── 3-page-structure.json            ← DOM analysis
├── 4-search-brian.png               ← Screenshot after search
├── 5-level1-comparison.json         ← DB vs UI comparison
├── 6-rendered-members.json          ← What React rendered
└── 7-final-diagnosis.json           ← Issue summary
```

---

## Key Insights

### Database Schema
```
members table (Used by Matrix view)
├── member_id (primary key)
├── full_name
├── enroller_id (foreign key → member_id)  ← Matrix relationships!
└── tech_rank

distributors table (Legacy sponsor tracking)
├── id
├── sponsor_id (different from enroller_id!)
└── matrix_parent_id (not used in new Matrix)
```

### Matrix Level Calculation
```typescript
// Level 1: Direct enrollees
SELECT * FROM members
WHERE enroller_id = 'Charles.member_id'

// Level 2: Enrollees of Level 1 members
SELECT * FROM members
WHERE enroller_id IN (Level_1_member_ids)

// And so on recursively up to Level 5
```

---

## Troubleshooting Commands

### Check if Charles exists:
```bash
node -e "
import('dotenv/config');
import('@supabase/supabase-js').then(({createClient}) => {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  sb.from('members').select('*').ilike('full_name', '%charles%potter%').then(console.log);
});
"
```

### Check Brian's enroller:
```bash
node -e "
import('dotenv/config');
import('@supabase/supabase-js').then(({createClient}) => {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  sb.from('members').select('full_name, enroller_id').ilike('full_name', '%brian%rawlston%').then(console.log);
});
"
```

---

**Last Updated:** 2026-03-18
**Created By:** Agent 14
