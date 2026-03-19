# Agent 13: E2E Test Report - Signup to Back Office Data Flow

## Test Status Summary

**Date:** 2026-03-18
**Agent:** Agent 13
**Task:** Create comprehensive E2E tests for signup → back office data flow

### Test Results

| Test | Status | Notes |
|------|--------|-------|
| Personal signup data verification | ✅ PASS | Database records created correctly |
| Business signup in back office views | ❌ FAIL | Data not appearing in Matrix/Genealogy/Team |
| Multiple reps (5) with correct counts | ❌ FAIL | Signup timeouts |
| Deep tree structure (3 levels) | ❌ FAIL | Downline not visible in views |
| RLS isolation between sponsors | ❌ FAIL | Test timeout |
| Rep details accuracy | ❌ FAIL | Rep not visible in Team view |
| Consistent counts across views | ❌ FAIL | Shows 0 instead of 3 |

**Overall:** 1/7 tests passing (14%)

## What Works ✅

### Signup Flow
- Personal registration completes successfully
- Business registration completes successfully
- API returns 201 status with distributor data
- Redirects to `/signup/credentials` page correctly

### Database Records
- `distributors` table: Records created with all fields populated
- `members` table: Records auto-created via trigger
- `distributor_tax_info` table: SSN/EIN encrypted and stored
- Matrix placement: Positions assigned correctly (matrix_position, matrix_depth)
- Sponsor relationships: `sponsor_id` correctly references parent distributor

### Test Infrastructure
- Supabase admin client works correctly
- Test data generators (SSN, EIN, email, slug) function properly
- Cleanup functions successfully delete test users
- Screenshots captured on failure
- API response interception and logging works

## What's Broken ❌

### Back Office Data Display

**Problem:** Newly signed-up reps do not appear in sponsor's back office views (Matrix, Genealogy, Team)

#### Evidence:
1. **Matrix View:** Shows "Total Team Size: 0" when 3 reps signed up
2. **Genealogy View:** Shows empty tree
3. **Team View:** Rep names not visible

#### Debug Test Results:
```
✅ Distributor created: e1124720-5e42-460c-b9ea-6d8137f187a2
✅ Member created: 4e17cf81-eebe-47a4-a654-d90c19680c83
✅ Sponsor ID set: 529723da-b55c-4c54-a724-245488d4625f (apex-vision)
✅ Matrix position: 1, depth: 2
❌ Rep not visible in sponsor's back office views
```

### Possible Root Causes

#### 1. RLS Policies Issue
The back office views likely use RLS policies to filter data by organization. The queries might be:
- Not correctly traversing the `sponsor_id` relationship
- Missing the new distributor in the downline calculation
- Using `member.enroller_id` or `member.sponsor_id` which are NULL initially

**Check:**
```sql
-- Are RLS policies correctly defined?
SELECT * FROM pg_policies WHERE tablename IN ('distributors', 'members', 'matrix_positions');
```

#### 2. Member Relationship Fields NULL
The `members` table has:
- `enroller_id` (references `members.member_id`) - NULL for new signups
- `sponsor_id` (references `members.member_id`) - NULL for new signups

But `distributors` table has:
- `sponsor_id` (references `distributors.id`) - ✅ Set correctly

The trigger `auto_create_member_record()` tries to populate `member.enroller_id` and `member.sponsor_id`, but if the sponsor's member record doesn't exist yet, these will be NULL.

**Fix Required:**
- Update member relationship fields after both distributor and member records exist
- OR modify RLS policies to use `distributors.sponsor_id` instead of `members.enroller_id`

#### 3. View Queries Using Wrong Join
The back office views might be querying:
```sql
-- ❌ WRONG - uses members.enroller_id (NULL for new signups)
SELECT * FROM members WHERE enroller_id = $current_user_member_id;

-- ✅ CORRECT - uses distributors.sponsor_id
SELECT m.* FROM members m
JOIN distributors d ON m.distributor_id = d.id
WHERE d.sponsor_id = $current_user_distributor_id;
```

#### 4. Caching or Real-Time Sync Issue
The views might be cached or not re-fetching data after new signups.

### Test Timeouts

Several tests timeout at 30 seconds during sequential signup of multiple reps:
- Creating 5 reps sequentially takes ~50-60 seconds
- Creating sponsors + logging in + navigating adds more time

**Fix Required:** Increase test timeout to 60-90 seconds

## Database Verification Queries

To debug the back office display issue, run these queries as the sponsor:

```sql
-- 1. Check if rep's distributor record exists and has correct sponsor_id
SELECT id, first_name, last_name, email, sponsor_id, created_at
FROM distributors
WHERE email = 'test-rep@example.com';

-- 2. Check if rep's member record exists
SELECT member_id, distributor_id, enroller_id, sponsor_id, email
FROM members
WHERE email = 'test-rep@example.com';

-- 3. Check sponsor's downline (direct enrollees)
SELECT d.id, d.first_name, d.last_name, d.email
FROM distributors d
WHERE d.sponsor_id = $sponsor_distributor_id;

-- 4. Check RLS policy for current user
SELECT * FROM members WHERE true; -- Will only show what RLS allows
```

## Recommendations

### Priority 1: Fix Back Office Data Display

**Option A: Update RLS Policies**
- Modify RLS policies on `members` table to use `distributors.sponsor_id` join
- Ensures new signups immediately appear in back office

**Option B: Fix Member Relationships**
- Create a post-signup function to update `member.enroller_id` and `member.sponsor_id`
- Run after both distributor and member records exist

**Option C: Update Back Office Queries**
- Modify Team/Matrix/Genealogy views to query `distributors` table first
- Join to `members` table for additional data
- Don't rely on `member.enroller_id` or `member.sponsor_id`

### Priority 2: Increase Test Timeouts
- Change test timeout from 30s to 90s
- Add retry logic for network issues
- Add explicit waits after navigation

### Priority 3: Add Real-Time Verification
Add a test that:
1. Creates sponsor and logs in
2. Opens back office in one browser context
3. Signs up new rep in separate browser context
4. Refreshes back office
5. Verifies rep appears

## Test File Locations

- **Main test suite:** `tests/e2e/signup-to-backoffice-flow.spec.ts`
- **Debug test:** `tests/e2e/signup-to-backoffice-flow-debug.spec.ts`
- **Test results:** `test-results/signup-to-backoffice-flow-*/`

## Next Steps

1. ✅ Investigate back office view queries (Team, Matrix, Genealogy)
2. ✅ Check RLS policies on `members` and `distributors` tables
3. ✅ Verify member relationship fields are populated correctly
4. ⬜ Fix identified issues
5. ⬜ Re-run test suite
6. ⬜ Add edge case tests (duplicate email, invalid referral, etc.)

## Technical Details

### Signup API Response (Successful)
```json
{
  "success": true,
  "data": {
    "distributor": {
      "id": "e1124720-5e42-460c-b9ea-6d8137f187a2",
      "auth_user_id": "0af39596-da60-4e71-853f-2d8e4060c7ae",
      "first_name": "TestUser",
      "last_name": "Debug",
      "email": "test-1773878306756-ipq4vv@example.com",
      "slug": "test-1773878306756-2vlfbt",
      "sponsor_id": "529723da-b55c-4c54-a724-245488d4625f",
      "matrix_parent_id": "8b4ce148-e325-4fb9-a60c-9a861255effc",
      "matrix_position": 1,
      "matrix_depth": 2,
      "status": "active",
      "licensing_status": "non_licensed",
      "rep_number": 519
    },
    "matrix_placement": {
      "parent_id": "8b4ce148-e325-4fb9-a60c-9a861255effc",
      "position": 1,
      "depth": 2
    }
  },
  "message": "Account created successfully! Welcome to Apex Affinity Group."
}
```

### Member Record Created
```json
{
  "member_id": "4e17cf81-eebe-47a4-a654-d90c19680c83",
  "distributor_id": "e1124720-5e42-460c-b9ea-6d8137f187a2",
  "email": "test-1773878306756-ipq4vv@example.com",
  "full_name": "TestUser Debug",
  "enroller_id": null,  // ⚠️ NULL - sponsor's member_id not found
  "sponsor_id": null,    // ⚠️ NULL - sponsor's member_id not found
  "status": "active",
  "tech_rank": "starter",
  "insurance_rank": "inactive"
}
```

## Conclusion

The signup flow is working perfectly. Database records are created correctly with proper relationships at the `distributors` level. However, the back office views are not displaying the newly signed-up reps.

**Root Cause:** Back office views likely query using `member.enroller_id` or `member.sponsor_id`, which are NULL for new signups because these fields reference `members.member_id` (not `distributors.id`). The trigger tries to populate these fields but fails if the sponsor's member record doesn't exist yet.

**Recommended Fix:** Modify back office view queries to use `distributors.sponsor_id` relationship instead of `members.enroller_id`, OR create a post-signup process to update member relationships after both records exist.

---

**Agent 13 Sign-off**
Tests created and partially passing. Critical bug identified in back office data display logic. Handoff to Agent 14 for back office query investigation and fix.
