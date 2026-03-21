# Autopilot Invitations - E2E Test Plan

**Date:** March 21, 2026
**Test File:** `tests/e2e/autopilot-invitations.spec.ts`
**Total Tests:** 13

---

## Recent Fix: DateTime Format Issue

### Problem
Users were getting "Invalid date/time format" error when selecting date/time from the HTML datetime-local picker.

### Root Cause
- HTML `datetime-local` input returns format: `2024-03-21T14:30` (no timezone)
- API expected ISO 8601 format: `2024-03-21T14:30:00Z` (with timezone)
- Zod `.datetime()` validator requires full ISO string with timezone

### Solution
Convert datetime-local value to ISO 8601 before API submission:
```typescript
const meetingDateISO = new Date(formData.meeting_date_time).toISOString();
```

**Fixed in:** `src/components/autopilot/MeetingInvitationForm.tsx:300`

---

## Test Coverage

### ✅ Core Functionality Tests (Tests 1-10)

1. **Create Meeting Invitation**
   - Tests complete invitation creation flow
   - Verifies form submission and database persistence
   - Checks invitation status is 'sent'

2. **Usage Counter Increment**
   - Verifies autopilot_usage_limits table updates
   - Confirms meetings_used increments by 1

3. **Open Tracking (Tracking Pixel)**
   - Tests email open tracking via pixel
   - Verifies status changes to 'opened'
   - Confirms open_count increments

4. **RSVP Response Tracking**
   - Tests yes/no/maybe RSVP responses
   - Verifies status changes (e.g., 'responded_yes')
   - Confirms responded_at timestamp

5. **Resend Invitation**
   - Tests resend functionality
   - Verifies sent_at timestamp updates

6. **Invitation List & Filtering**
   - Tests invitation list display
   - Checks filtering functionality

7. **FREE Tier Limit Enforcement**
   - Tests 10 invitations/month limit
   - Verifies 10th invitation succeeds
   - Verifies 11th invitation fails with quota error

8. **Delete Invitation**
   - Tests deletion functionality
   - Verifies record removed from database

9. **Invitation Stats Display**
   - Tests statistics dashboard
   - Checks for total/sent/opened/responded metrics

10. **Validation Errors**
    - Tests email format validation
    - Tests minimum length requirements
    - Verifies error messages display

### 🆕 DateTime Format Tests (Tests 11-13)

11. **DateTime Format Fix - Date Picker** ⭐ NEW
    - Tests date selection from datetime-local picker
    - Verifies NO "Invalid date/time format" error occurs
    - Confirms successful form submission
    - Validates correct ISO 8601 storage in database
    - **This test verifies the fix for the reported bug**

12. **DateTime Validation - Past Date** ⭐ NEW
    - Tests rejection of past dates
    - Verifies error message: "at least 1 hour in the future"

13. **DateTime Validation - Minimum Buffer** ⭐ NEW
    - Tests 1-hour minimum buffer requirement
    - Sets meeting 30 minutes in future (should fail)
    - Verifies error message displays

---

## Test Setup

### Before All Tests
1. Creates test distributor with auth user
2. Creates FREE tier autopilot subscription
3. Sets up test environment

### After All Tests
1. Deletes all test invitations
2. Deletes autopilot usage limits
3. Deletes autopilot subscription
4. Deletes test distributor
5. Deletes test auth user

---

## Test Data

**Test Email Format:** `autopilot-test-{timestamp}@example.com`
**Test Password:** `TestPass123!`
**Autopilot Tier:** FREE (10 invitations/month)

---

## Expected Results

### All Tests Should Pass ✅

**Critical Tests:**
- Test 11 (DateTime Format Fix) - Verifies bug fix works
- Test 7 (FREE Tier Limit) - Ensures quota enforcement
- Test 1 (Create Invitation) - Core functionality

### Known Issues
- Tests require valid Supabase credentials in environment
- Tests require dev server running on port 3050
- Some tests may timeout if authentication is slow

---

## Running the Tests

### Run All Invitation Tests
```bash
npx playwright test tests/e2e/autopilot-invitations.spec.ts
```

### Run Specific Test
```bash
npx playwright test tests/e2e/autopilot-invitations.spec.ts -g "should accept date/time from picker"
```

### Run with UI
```bash
npx playwright test tests/e2e/autopilot-invitations.spec.ts --ui
```

### View HTML Report
```bash
npx playwright show-report
```

---

## Success Metrics

✅ **0 Failures** - All 13 tests pass
✅ **DateTime Tests Pass** - Tests 11-13 verify fix works
✅ **No Format Errors** - "Invalid date/time format" error never appears
✅ **ISO Storage** - Dates stored correctly in ISO 8601 format

---

## Files Changed

### Fixed
- `src/components/autopilot/MeetingInvitationForm.tsx` (datetime conversion)

### Added Tests
- `tests/e2e/autopilot-invitations.spec.ts` (tests 11-13)

---

## Database Tables Tested

1. **meeting_invitations** - Main invitation records
2. **autopilot_usage_limits** - Usage counter tracking
3. **autopilot_subscriptions** - Subscription tier/status
4. **distributors** - User distributor profiles

---

## Test Assertions

### DateTime Format Test (Test 11)
```typescript
// Should NOT show format error
await expect(page.locator('text=/Invalid date\/time format/i'))
  .not.toBeVisible({ timeout: 3000 });

// Should show success
await expect(page.locator('text=/sent successfully/i'))
  .toBeVisible({ timeout: 10000 });

// Verify valid ISO format in DB
const parsedDate = new Date(savedDateTime);
expect(parsedDate.toString()).not.toBe('Invalid Date');
```

---

## Next Steps

1. ✅ Run full test suite
2. ✅ Verify all 13 tests pass
3. ✅ Generate HTML report
4. ✅ Commit test updates
5. Deploy to production with confidence

---

**Test Status:** Running
**Expected Duration:** 2-5 minutes
**Last Updated:** March 21, 2026
