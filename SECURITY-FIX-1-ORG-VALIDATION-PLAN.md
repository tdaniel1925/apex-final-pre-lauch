# SECURITY FIX #1: ORGANIZATION VALIDATION
**Date:** 2026-03-27
**Branch:** `feature/security-fixes-mvp`
**Priority:** 🔴 CRITICAL
**Estimated Time:** 8 hours

---

## 📋 PROBLEM STATEMENT

### The Vulnerability

**Current Code** (`src/app/api/dashboard/team/route.ts`):
```typescript
// Lines 14-36: Gets authenticated user and their distributor record
const { data: { user }, error: authError } = await supabase.auth.getUser();
const { data: distributor } = await supabase
  .from('distributors')
  .select('id, first_name, last_name, email')
  .eq('auth_user_id', user.id)
  .single();

// Lines 38-60: Fetches team data using sponsor_id
const { data: enrollees } = await supabase
  .from('distributors')
  .select(`...`)
  .eq('sponsor_id', distributor.id)  // ← NO ORGANIZATION CHECK!
```

**What's Wrong:**
1. ✅ Authentication is checked (user must be logged in)
2. ❌ **NO organization validation** - Only checks that user is authenticated
3. ❌ User could potentially access other organizations' data through:
   - Query parameter manipulation (if we add `?distributor_id=XYZ`)
   - Future API changes that accept user IDs
   - Cross-organization joins

**Attack Scenario:**
```
1. Attacker logs in as user in Org A (distributor_id = abc-123)
2. Attacker discovers distributor ID from Org B (distributor_id = xyz-789)
3. If endpoint accepted user_id parameter:
   GET /api/dashboard/team?distributor_id=xyz-789
4. Without org validation → Attacker sees Org B's team data
```

**Impact:**
- 🔴 Data breach across organizations
- 🔴 Privacy violation (access to names, emails, earnings)
- 🔴 Competitive intelligence leakage
- 🔴 Compliance violation (GDPR, data protection laws)

---

## 🏗️ ORGANIZATION ARCHITECTURE

### How Organizations Work

Based on `supabase/migrations/20260226000001_activity_feed_system.sql`:

```sql
-- Activity Feed uses organization_root_id
CREATE TABLE activity_feed (
  ...
  organization_root_id UUID NOT NULL REFERENCES distributors(id),
  ...
);
```

**Structure:**
```
Organization Root (Master Distributor)
  ├─ distributor_id: "master-abc-123"
  ├─ sponsor_id: NULL (top of tree)
  └─ Downline:
       ├─ Distributor A (sponsor_id: master-abc-123)
       ├─ Distributor B (sponsor_id: master-abc-123)
       └─ ... (all descendants)
```

**Key Insight:**
- `organization_root_id` = The top distributor in the enrollment tree
- All distributors in same org share the same `organization_root_id`
- Can be calculated by walking up `sponsor_id` chain until `sponsor_id IS NULL`

---

## 🎯 SOLUTION DESIGN

### Approach: Middleware Validation Function

**Why Middleware?**
- ✅ Centralized validation logic
- ✅ Reusable across all endpoints
- ✅ Easy to test
- ✅ Consistent error messages
- ✅ Minimal changes to existing code

**Why Not RLS (Row Level Security)?**
- RLS is already enabled but relies on service client bypassing it
- Many endpoints use `createServiceClient()` for cross-organization admin queries
- Adding middleware gives explicit validation with clear error messages

---

## 📝 IMPLEMENTATION PLAN

### Step 1: Create Validation Middleware

**File:** `src/middleware/org-validation.ts`

```typescript
import { createClient } from '@/lib/supabase/server';

/**
 * Gets the organization root ID for a distributor
 * Walks up the sponsor_id chain until sponsor_id IS NULL
 */
async function getOrganizationRootId(
  distributorId: string
): Promise<string | null> {
  const supabase = await createClient();

  let currentId = distributorId;
  let depth = 0;
  const maxDepth = 50; // Safety limit

  while (depth < maxDepth) {
    const { data, error } = await supabase
      .from('distributors')
      .select('id, sponsor_id')
      .eq('id', currentId)
      .single();

    if (error || !data) return null;

    // If sponsor_id is null, this is the root
    if (!data.sponsor_id) {
      return data.id;
    }

    // Move up to sponsor
    currentId = data.sponsor_id;
    depth++;
  }

  return null; // Exceeded max depth (shouldn't happen)
}

/**
 * Validates that current user and target user are in same organization
 *
 * @param currentDistributorId - The logged-in user's distributor ID
 * @param targetDistributorId - The distributor ID being accessed
 * @returns { valid: boolean, error?: string }
 */
export async function validateOrganizationAccess(
  currentDistributorId: string,
  targetDistributorId: string
): Promise<{ valid: boolean; error?: string }> {
  // Same distributor = always allowed
  if (currentDistributorId === targetDistributorId) {
    return { valid: true };
  }

  // Get organization root for both
  const [currentOrgRoot, targetOrgRoot] = await Promise.all([
    getOrganizationRootId(currentDistributorId),
    getOrganizationRootId(targetDistributorId),
  ]);

  // Check if either lookup failed
  if (!currentOrgRoot || !targetOrgRoot) {
    return {
      valid: false,
      error: 'Failed to determine organization membership',
    };
  }

  // Check if same organization
  if (currentOrgRoot !== targetOrgRoot) {
    return {
      valid: false,
      error: 'Access denied: Cross-organization access not permitted',
    };
  }

  return { valid: true };
}

/**
 * Gets current user's distributor ID
 * Convenience function used by all endpoints
 */
export async function getCurrentDistributorId(): Promise<{
  distributorId: string | null;
  error?: string;
}> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { distributorId: null, error: 'Unauthorized' };
  }

  const { data: distributor, error: distError } = await supabase
    .from('distributors')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (distError || !distributor) {
    return { distributorId: null, error: 'Distributor record not found' };
  }

  return { distributorId: distributor.id };
}
```

---

### Step 2: Apply to Vulnerable Endpoints

**Endpoints to Fix:**

1. ✅ `/api/dashboard/team` - Get direct enrollees
2. ✅ `/api/dashboard/downline` - Get full downline tree
3. ✅ `/api/dashboard/matrix-position` - Get matrix position
4. ✅ `/api/autopilot/*` - All autopilot routes

**Example Fix for `/api/dashboard/team`:**

```typescript
// BEFORE (Lines 10-36):
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // ... rest of code
}

// AFTER:
import { getCurrentDistributorId } from '@/middleware/org-validation';

export async function GET() {
  const supabase = await createClient();

  // Get current user's distributor ID
  const { distributorId: currentDistId, error: authError } =
    await getCurrentDistributorId();

  if (authError || !currentDistId) {
    return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
  }

  // NOTE: This endpoint only accesses current user's own data
  // No cross-user validation needed since we use currentDistId directly

  const { data: enrollees } = await supabase
    .from('distributors')
    .select(`...`)
    .eq('sponsor_id', currentDistId)  // ← Uses current user's ID only
    // ... rest stays the same
}
```

**Example Fix for Endpoints with User ID Parameter:**

```typescript
// If endpoint accepts ?user_id= parameter (future-proofing):
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const requestedUserId = searchParams.get('user_id');

  // Get current user
  const { distributorId: currentDistId, error: authError } =
    await getCurrentDistributorId();

  if (authError || !currentDistId) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  // If user_id provided, validate organization access
  if (requestedUserId && requestedUserId !== currentDistId) {
    const { valid, error } = await validateOrganizationAccess(
      currentDistId,
      requestedUserId
    );

    if (!valid) {
      return NextResponse.json({ error }, { status: 403 });
    }
  }

  // Proceed with data access...
}
```

---

### Step 3: Write Tests

**File:** `src/middleware/org-validation.test.ts`

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { validateOrganizationAccess, getCurrentDistributorId } from './org-validation';

describe('Organization Validation', () => {
  describe('validateOrganizationAccess', () => {
    it('should allow access to same distributor', async () => {
      const result = await validateOrganizationAccess('dist-123', 'dist-123');
      expect(result.valid).toBe(true);
    });

    it('should allow access within same organization', async () => {
      // TODO: Create test distributors in same org
      const result = await validateOrganizationAccess('dist-A', 'dist-B');
      expect(result.valid).toBe(true);
    });

    it('should block access across organizations', async () => {
      // TODO: Create test distributors in different orgs
      const result = await validateOrganizationAccess('org1-dist', 'org2-dist');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cross-organization');
    });

    it('should handle invalid distributor IDs', async () => {
      const result = await validateOrganizationAccess('invalid-123', 'dist-456');
      expect(result.valid).toBe(false);
    });
  });

  describe('getCurrentDistributorId', () => {
    it('should return distributor ID for authenticated user', async () => {
      // TODO: Mock authenticated session
      const result = await getCurrentDistributorId();
      expect(result.distributorId).toBeTruthy();
    });

    it('should return error for unauthenticated user', async () => {
      // TODO: Mock no session
      const result = await getCurrentDistributorId();
      expect(result.error).toBe('Unauthorized');
    });
  });
});
```

---

### Step 4: Database Optimization (Optional)

**Add Cached Organization Root ID:**

```sql
-- Migration: Add organization_root_id column to distributors
ALTER TABLE distributors
  ADD COLUMN IF NOT EXISTS organization_root_id UUID REFERENCES distributors(id);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_distributors_org_root
  ON distributors(organization_root_id);

-- Backfill existing data
UPDATE distributors
SET organization_root_id = (
  WITH RECURSIVE org_tree AS (
    -- Start with current distributor
    SELECT id, sponsor_id, id as root_id, 0 as depth
    FROM distributors
    WHERE id = distributors.id

    UNION ALL

    -- Walk up sponsor chain
    SELECT d.id, d.sponsor_id, d.id as root_id, ot.depth + 1
    FROM distributors d
    INNER JOIN org_tree ot ON d.id = ot.sponsor_id
    WHERE ot.depth < 50
  )
  SELECT root_id FROM org_tree WHERE sponsor_id IS NULL LIMIT 1
)
WHERE organization_root_id IS NULL;

-- Trigger to maintain organization_root_id on insert/update
CREATE OR REPLACE FUNCTION update_organization_root_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate organization root when sponsor changes
  IF TG_OP = 'INSERT' OR NEW.sponsor_id != OLD.sponsor_id THEN
    NEW.organization_root_id := (
      WITH RECURSIVE org_tree AS (
        SELECT id, sponsor_id, id as root_id, 0 as depth
        FROM distributors
        WHERE id = NEW.sponsor_id

        UNION ALL

        SELECT d.id, d.sponsor_id, d.id as root_id, ot.depth + 1
        FROM distributors d
        INNER JOIN org_tree ot ON d.id = ot.sponsor_id
        WHERE ot.depth < 50
      )
      SELECT root_id FROM org_tree WHERE sponsor_id IS NULL LIMIT 1
    );

    -- If no sponsor, this distributor IS the root
    IF NEW.sponsor_id IS NULL THEN
      NEW.organization_root_id := NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_organization_root_id
  BEFORE INSERT OR UPDATE ON distributors
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_root_id();
```

**With Cached Column:**
```typescript
// Simplified getOrganizationRootId():
async function getOrganizationRootId(distributorId: string): Promise<string | null> {
  const { data } = await supabase
    .from('distributors')
    .select('organization_root_id')
    .eq('id', distributorId)
    .single();

  return data?.organization_root_id || null;
}
```

---

## ✅ TESTING CHECKLIST

### Unit Tests
- [ ] `validateOrganizationAccess()` - same user
- [ ] `validateOrganizationAccess()` - same org
- [ ] `validateOrganizationAccess()` - different org (blocked)
- [ ] `validateOrganizationAccess()` - invalid IDs
- [ ] `getCurrentDistributorId()` - authenticated
- [ ] `getCurrentDistributorId()` - unauthenticated
- [ ] `getOrganizationRootId()` - root distributor
- [ ] `getOrganizationRootId()` - nested distributor
- [ ] `getOrganizationRootId()` - max depth safety

### Integration Tests
- [ ] `/api/dashboard/team` - own team only
- [ ] `/api/dashboard/downline` - own downline only
- [ ] Cross-organization access blocked with 403
- [ ] Error messages are clear and don't leak data

### Manual Tests
- [ ] Log in as User A (Org 1)
- [ ] Try to access User B's data (Org 2)
- [ ] Verify 403 Forbidden response
- [ ] Verify error message doesn't reveal User B's details

---

## 📊 PERFORMANCE IMPACT

**Current:**
- 1 query to get user
- 1 query to get distributor
- 1 query to get team data
- **Total: 3 queries**

**With Validation (No Cache):**
- 1 query to get user
- 1 query to get distributor
- 2 queries to get org roots (current + target)
- 1 query to get team data
- **Total: 5 queries** (~40% increase)

**With Cached Column:**
- 1 query to get user
- 1 query to get distributor (includes org_root_id)
- 1 query to check org match
- 1 query to get team data
- **Total: 4 queries** (~25% increase)

**Recommendation:** Start without cache, add cache if performance becomes issue.

---

## 🚀 DEPLOYMENT PLAN

### Phase 1: Add Middleware (No Breaking Changes)
1. Create `org-validation.ts`
2. Write tests
3. Commit: `feat: add organization validation middleware`

### Phase 2: Apply to Endpoints (One at a Time)
1. Fix `/api/dashboard/team`
2. Test thoroughly
3. Commit: `fix: add org validation to team endpoint`
4. Repeat for each endpoint

### Phase 3: Add Database Cache (Optional)
1. Create migration
2. Test backfill
3. Update middleware to use cache
4. Commit: `perf: cache organization root IDs`

---

## 🎯 SUCCESS CRITERIA

- [ ] All vulnerable endpoints have validation
- [ ] Cross-organization access returns 403
- [ ] Tests pass (unit + integration)
- [ ] TypeScript compiles with no errors
- [ ] No breaking changes to existing functionality
- [ ] Performance acceptable (< 500ms per request)
- [ ] Documentation updated
- [ ] Code reviewed and approved

---

## 📚 FILES TO MODIFY

### New Files:
- ✨ `src/middleware/org-validation.ts` (main middleware)
- ✨ `src/middleware/org-validation.test.ts` (tests)
- ✨ `supabase/migrations/YYYYMMDD_add_organization_root_id.sql` (optional cache)

### Modified Files:
- 🔧 `src/app/api/dashboard/team/route.ts`
- 🔧 `src/app/api/dashboard/downline/route.ts`
- 🔧 `src/app/api/dashboard/matrix-position/route.ts`
- 🔧 `src/app/api/autopilot/*/route.ts` (multiple files)

---

## 📝 COMMIT MESSAGES

```
feat: add organization validation middleware

- Create validateOrganizationAccess() function
- Add getCurrentDistributorId() helper
- Walk sponsor_id chain to find org root
- Prevent cross-organization data access
- Add comprehensive unit tests

Addresses: BACK-OFFICE-AUDIT-2026-03-27.md - Security Issue #1
```

```
fix: add org validation to dashboard team endpoint

- Use getCurrentDistributorId() for auth check
- Endpoint only accesses current user's data
- No cross-org vulnerability since no user_id param

Related: SECURITY-FIX-1-ORG-VALIDATION-PLAN.md
```

---

**End of Plan Document**
