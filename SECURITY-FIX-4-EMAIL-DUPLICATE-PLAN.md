# SECURITY FIX #4: EMAIL DUPLICATE CHECK
**Date:** 2026-03-27
**Branch:** `feature/security-fixes-mvp`
**Priority:** 🔴 CRITICAL
**Estimated Time:** 2 hours

---

## 📋 PROBLEM STATEMENT

### The Vulnerability

**Current State:**
- Email field in `distributors` table has **NO UNIQUE constraint**
- Admin can change distributor email without checking for duplicates in distributors table
- Only checks Supabase Auth for existing email
- Can create multiple distributor records with same email
- Breaks authentication system (Supabase Auth requires unique emails)

**Current Code** (`src/app/api/admin/distributors/[id]/change-email/route.ts`):
```typescript
// Lines 84-95: Only checks Supabase Auth users
const { data: existingUser } = await serviceClient.auth.admin.listUsers();
const emailExists = existingUser?.users.some(
  (user) => user.email?.toLowerCase() === newEmail.toLowerCase()
);

if (emailExists) {
  return NextResponse.json(
    { error: 'This email address is already in use' },
    { status: 400 }
  );
}

// ❌ MISSING: Check distributors table for duplicate email!
```

**What's Wrong:**
1. ❌ No UNIQUE constraint on `distributors.email` column
2. ❌ Email change endpoint only checks auth users, not distributors table
3. ❌ createDistributor() service checks for duplicates, but constraint missing
4. ❌ Multiple distributors could have same email (breaks auth)
5. ❌ Can't create auth account if email already used by another distributor

**Attack Scenario:**
```
Time: 10:00:00 - Admin creates distributor A with email@example.com
  ✅ Distributor A created, email = email@example.com
  ✅ No auth account created yet (pending invitation)

Time: 10:05:00 - Admin creates distributor B with email@example.com
  ✅ Distributor B created, email = email@example.com (DUPLICATE!)
  ❌ No database constraint prevents this

Time: 10:10:00 - email@example.com tries to sign up
  ❌ Auth system confused: Which distributor record to link?
  ❌ Authentication fails
  ❌ System broken
```

**Impact:**
- 🔴 Authentication system breaks (can't log in)
- 🔴 Data integrity violation (duplicate emails)
- 🔴 Cannot link auth account to distributor
- 🔴 Confusion about which distributor owns the email
- 🔴 Support nightmare (which account to help?)

---

## 🏗️ SOLUTION DESIGN

### Approach: Database UNIQUE Constraint + Application Validation

**Why UNIQUE Constraint?**
- ✅ Enforced at database level (cannot be bypassed)
- ✅ Works even if application code has bugs
- ✅ Prevents duplicates from any source (API, SQL, migrations)
- ✅ Fast (uses index for lookups)
- ✅ Returns clear error message

**Why Also Application Validation?**
- ✅ Better user experience (friendly error message)
- ✅ Avoids unnecessary database round-trip
- ✅ Can check before attempting insert/update
- ✅ Early validation in request flow

---

## 📝 IMPLEMENTATION PLAN

### Step 1: Add UNIQUE Constraint Migration

**Migration:** `supabase/migrations/20260327000003_unique_email_constraint.sql`

```sql
-- =============================================
-- Email Unique Constraint
-- Security Fix #4: Prevents duplicate emails
-- =============================================

-- Check for existing duplicates before adding constraint
DO $$
DECLARE
  duplicate_count INT;
BEGIN
  -- Count distributors with duplicate emails
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT email, COUNT(*) as cnt
    FROM distributors
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    RAISE EXCEPTION 'Cannot add UNIQUE constraint: % duplicate email(s) exist. Run SELECT email, COUNT(*) FROM distributors WHERE email IS NOT NULL GROUP BY email HAVING COUNT(*) > 1;', duplicate_count;
  END IF;
END $$;

-- Add UNIQUE constraint on email field
ALTER TABLE distributors
ADD CONSTRAINT distributors_email_key UNIQUE (email);

-- Create index for fast lookups (index created automatically with UNIQUE constraint)
-- This speeds up email searches and duplicate checks

COMMENT ON CONSTRAINT distributors_email_key ON distributors IS
  'Security Fix #4: Ensures email addresses are unique across all distributors. Prevents authentication conflicts.';
```

---

### Step 2: Update Email Change Endpoint

**File:** `src/app/api/admin/distributors/[id]/change-email/route.ts`

**Changes:**

```typescript
// BEFORE (lines 84-95): Only checks auth users
const { data: existingUser } = await serviceClient.auth.admin.listUsers();
const emailExists = existingUser?.users.some(
  (user) => user.email?.toLowerCase() === newEmail.toLowerCase()
);

if (emailExists) {
  return NextResponse.json(
    { error: 'This email address is already in use' },
    { status: 400 }
  );
}

// AFTER: Check both auth users AND distributors table
// Check if email exists in distributors table
const { data: existingDistributor } = await serviceClient
  .from('distributors')
  .select('id')
  .eq('email', newEmail.toLowerCase())
  .neq('id', distributorId) // Exclude current distributor
  .single();

if (existingDistributor) {
  return NextResponse.json(
    { error: 'This email address is already in use by another distributor' },
    { status: 400 }
  );
}

// Check if email exists in auth users
const { data: existingUser } = await serviceClient.auth.admin.listUsers();
const emailExistsInAuth = existingUser?.users.some(
  (user) => user.email?.toLowerCase() === newEmail.toLowerCase()
);

if (emailExistsInAuth) {
  return NextResponse.json(
    { error: 'This email address is already in use in authentication system' },
    { status: 400 }
  );
}
```

---

### Step 3: Verify createDistributor Already Checks

**File:** `src/lib/admin/distributor-service.ts`

Good news! The `createDistributor()` function already checks for duplicate emails (lines 138-147):

```typescript
// Check if email already exists
const { data: existing } = await serviceClient
  .from('distributors')
  .select('id')
  .eq('email', distributorData.email)
  .single();

if (existing) {
  return { success: false, error: 'Email already exists' };
}
```

✅ No changes needed here - already protected!

But note: The atomic function we created in Fix #3 also checks this in the stored procedure, providing double protection.

---

## ✅ TESTING CHECKLIST

### Database Tests

- [ ] Attempt to insert duplicate email → constraint violation
- [ ] Attempt to update to duplicate email → constraint violation
- [ ] Insert unique emails → success
- [ ] Update to different unique email → success

### API Tests

- [ ] Change email to existing email → 400 error with message
- [ ] Change email to unique email → success
- [ ] Create distributor with duplicate email → 400 error
- [ ] Change email in auth but not distributor → prevented
- [ ] Change email in distributor but not auth → prevented

### Manual Tests

- [ ] Admin changes distributor email to existing email → error shown
- [ ] Admin changes distributor email to unique email → success
- [ ] Error message is user-friendly
- [ ] Email notification sent to new address

---

## 📊 PERFORMANCE IMPACT

**UNIQUE Constraint Benefits:**
- ✅ Creates index automatically (faster lookups)
- ✅ O(log n) duplicate check vs O(n) table scan
- ✅ No additional overhead for inserts/updates
- ✅ PostgreSQL handles efficiently

**Application Check Benefits:**
- ✅ Fails fast (before attempting database operation)
- ✅ Better user experience (friendly error message)
- ✅ Avoids unnecessary work

**Overall:**
- Email change: +5ms for duplicate check (negligible)
- Database integrity: Guaranteed (priceless!)

---

## 🚀 DEPLOYMENT PLAN

### Phase 1: Check for Existing Duplicates
1. Run query to find duplicates:
   ```sql
   SELECT email, COUNT(*) as cnt, array_agg(id) as distributor_ids
   FROM distributors
   WHERE email IS NOT NULL
   GROUP BY email
   HAVING COUNT(*) > 1;
   ```
2. If duplicates exist, resolve manually before migration
3. Update one distributor's email to make unique

### Phase 2: Add UNIQUE Constraint
1. Create migration: `20260327000003_unique_email_constraint.sql`
2. Run migration (will fail if duplicates exist)
3. Verify constraint exists:
   ```sql
   SELECT conname, contype
   FROM pg_constraint
   WHERE conrelid = 'distributors'::regclass
   AND conname = 'distributors_email_key';
   ```

### Phase 3: Update Email Change Endpoint
1. Add distributor table check
2. Keep auth check
3. Test with duplicate email
4. Commit: `fix: prevent duplicate emails in change-email endpoint`

---

## 🎯 SUCCESS CRITERIA

- [ ] UNIQUE constraint added to distributors.email
- [ ] Migration succeeds (no existing duplicates)
- [ ] Email change endpoint checks distributors table
- [ ] Error messages are user-friendly
- [ ] createDistributor already checks (verified)
- [ ] Atomic placement function already checks (verified)
- [ ] Cannot create duplicate emails via any path
- [ ] TypeScript compiles
- [ ] Tests pass

---

## 🔗 RELATED FILES

**Modified:**
- `src/app/api/admin/distributors/[id]/change-email/route.ts` - Add duplicate check

**Created:**
- `supabase/migrations/20260327000003_unique_email_constraint.sql` - UNIQUE constraint

**Verified (No Changes Needed):**
- `src/lib/admin/distributor-service.ts` - Already checks duplicates ✅
- `supabase/migrations/20260327000002_atomic_placement.sql` - Already checks duplicates ✅

---

**End of Plan Document**
