# Bug Report: Event Registration Date Display Error

**Date:** 2026-03-28
**Reported By:** User (Tuan Doan)
**Severity:** HIGH - User-facing data display error

---

## 🐛 Bug Description

**Problem:** Event registration pages show the WRONG date (off by 1 day) when displaying event dates to users.

**Example:**
- Event set for: **June 15, 2026**
- Registration page shows: **June 14, 2026** ❌
- Confirmation email shows: **June 14, 2026** ❌

---

## 🔍 Root Cause Analysis

### The Problem

The bug exists in **TWO locations**:

1. **`src/components/MeetingRegistrationForm.tsx` (lines 59-66)**
2. **`src/app/api/public/meetings/[id]/register/route.ts` (lines 238-244)**

### Buggy Code

Both locations use the same problematic pattern:

```typescript
// ❌ BUGGY CODE
const eventDate = new Date(meeting.eventDate);
const formattedDate = eventDate.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
```

### Why It's Wrong

1. **Database stores:** `event_date` as DATE string: `"2026-06-15"` (no time, no timezone)
2. **JavaScript interprets:** `new Date("2026-06-15")` as **UTC midnight**: `"2026-06-15T00:00:00Z"`
3. **Timezone conversion:** When user is in PST (UTC-7), this becomes `"2026-06-14T17:00:00 PST"`
4. **Display shows:** `toLocaleDateString()` formats as **"June 14, 2026"** (OFF BY 1 DAY!)

### The Math

```
Event date stored:    2026-06-15
Parsed as UTC:        2026-06-15 00:00 UTC
User in PST (UTC-7):  2026-06-14 17:00 PST  ← Shifted back 7 hours into previous day!
Displayed as:         Thursday, June 14, 2026  ❌ WRONG
```

**This bug affects users in timezones west of UTC (PST, MST, CST, EST in certain cases).**

---

## 📍 Affected Files

| File | Location | Impact |
|------|----------|--------|
| `src/components/MeetingRegistrationForm.tsx` | Lines 59-66 | **HIGH** - Public-facing registration page |
| `src/app/api/public/meetings/[id]/register/route.ts` | Lines 238-244 | **HIGH** - Confirmation email to registrant |
| `src/app/api/public/meetings/[id]/register/route.ts` | Lines 238-244 (used twice) | **MEDIUM** - Notification email to distributor |

---

## ✅ Solution

### Option 1: Parse as Local Date (RECOMMENDED)

```typescript
// ✅ CORRECT: Parse date string as local date, not UTC
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // Month is 0-indexed in JS
}

// Usage:
const eventDate = parseLocalDate(meeting.eventDate);
const formattedDate = eventDate.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
```

### Option 2: Use date-fns Library

```typescript
import { parseISO, format } from 'date-fns';

// Parse as local date and format
const formattedDate = format(
  parseISO(meeting.eventDate + 'T00:00:00'), // Add time to make it local
  'EEEE, MMMM d, yyyy'
);
```

### Option 3: Simple String Manipulation (Quick Fix)

```typescript
// Quick fix: Just format the string parts directly
const [year, month, day] = meeting.eventDate.split('-');
const date = new Date(Number(year), Number(month) - 1, Number(day));
const formattedDate = date.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
```

---

## 🧪 Testing

### Test Cases

1. **Test with PST user (UTC-7)**
   - Event date: `2026-06-15`
   - Should display: `"Sunday, June 15, 2026"`
   - Currently displays: `"Saturday, June 14, 2026"` ❌

2. **Test with EST user (UTC-5)**
   - Event date: `2026-06-15`
   - Should display: `"Sunday, June 15, 2026"`
   - Currently displays: `"Saturday, June 14, 2026"` ❌

3. **Test with UTC+0 user**
   - Event date: `2026-06-15`
   - Should display: `"Sunday, June 15, 2026"`
   - Correctly displays: `"Sunday, June 15, 2026"` ✅

4. **Test with JST user (UTC+9)**
   - Event date: `2026-06-15`
   - Should display: `"Sunday, June 15, 2026"`
   - Correctly displays: `"Sunday, June 15, 2026"` ✅

**Pattern:** Bug only affects users in negative UTC offsets (west of UTC).

---

## 🎯 Fix Priority

**PRIORITY: HIGH**

**Reasoning:**
- ✅ User-facing bug affecting real data
- ✅ Causes customer confusion (wrong event date shown)
- ✅ Affects business credibility
- ✅ Easy to fix (< 10 lines of code)
- ✅ Affects multiple pages (registration + emails)

---

## 📊 Impact Assessment

**Users Affected:** All users in timezones west of UTC
- United States: PST, MST, CST (most US users)
- Canada: Most provinces
- Mexico, Central/South America

**Scope:**
- Every event registration page
- Every confirmation email sent
- Every notification email to distributors

**Frequency:** Every time someone views/registers for an event

---

## 🔧 Recommended Fix

Apply **Option 1 (Parse as Local Date)** to both locations:

1. Create a utility function in `src/lib/utils/date.ts`
2. Replace buggy code in `MeetingRegistrationForm.tsx`
3. Replace buggy code in `route.ts` (registration API)
4. Test with users in different timezones

**Estimated Time to Fix:** 15 minutes
**Estimated Time to Test:** 10 minutes

---

## 📝 Additional Notes

- This is a **classic JavaScript Date timezone bug**
- Very common when working with date-only strings
- Similar bugs may exist elsewhere in the codebase (should audit all `new Date(dateString)` calls)
- Consider using `date-fns` library consistently to avoid these issues

---

**Created:** 2026-03-28
**Status:** Identified, ready for fix
**Next Step:** Apply fix to both files and test

