# SECURITY FIX #2: COMPENSATION RUN MUTEX
**Date:** 2026-03-27
**Branch:** `feature/security-fixes-mvp`
**Priority:** 🔴 CRITICAL
**Estimated Time:** 4 hours

---

## 📋 PROBLEM STATEMENT

### The Vulnerability

**Current Code** (`src/app/api/admin/compensation/run/route.ts`):
```typescript
// Line 36-56: NO LOCKING MECHANISM
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();
    const { periodStart, periodEnd, dryRun = true } = body;

    const runId = crypto.randomUUID();  // ← New UUID every time

    // Step 1: Get all active members
    // Step 2: Evaluate ranks
    // Step 3: Calculate commissions
    // Step 4: Insert into earnings_ledger  ← NO DUPLICATE CHECK!
```

**What's Wrong:**
1. ❌ No mutex/locking mechanism
2. ❌ No check if run already in progress
3. ❌ No duplicate period prevention
4. ❌ Multiple admins can trigger simultaneously

**Attack Scenario:**
```
Time: 10:00:00 - Admin A clicks "Run Commissions for March"
Time: 10:00:05 - Admin B clicks "Run Commissions for March"

Both processes run simultaneously:
  Process A: Calculates $50,000 in commissions → Inserts into DB
  Process B: Calculates $50,000 in commissions → Inserts into DB

Result: $100,000 paid out instead of $50,000 ❌
```

**Impact:**
- 🔴 Duplicate payouts (financial loss)
- 🔴 Data integrity violation
- 🔴 Accounting nightmare (reconciliation impossible)
- 🔴 Trust loss from distributors
- 🔴 Potential legal issues

---

## 🏗️ SOLUTION DESIGN

### Approach: Database-Level Locking

**Why Database Lock?**
- ✅ Works across multiple server instances
- ✅ Automatic cleanup on process crash
- ✅ Native PostgreSQL support (`pg_advisory_lock`)
- ✅ No external dependencies (Redis, etc.)
- ✅ Transaction-safe

**Why Not In-Memory Lock?**
- ❌ Doesn't work with multiple servers
- ❌ Lost on server restart
- ❌ Race conditions during deployment

---

## 📝 IMPLEMENTATION PLAN

### Step 1: Create Lock Utility

**File:** `src/lib/compensation/run-lock.ts`

```typescript
import { createServiceClient } from '@/lib/supabase/service';

/**
 * Compensation Run Lock
 *
 * Uses PostgreSQL advisory locks to ensure only one compensation
 * run can execute at a time per period.
 *
 * Lock ID calculation: Hash of period string to integer
 */

// Convert period string to integer for pg_advisory_lock
// PostgreSQL advisory locks require a bigint (up to 2^63-1)
function periodToLockId(periodStart: string, periodEnd: string): number {
  const combined = `${periodStart}-${periodEnd}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Use positive values only (advisory lock accepts bigint)
  return Math.abs(hash);
}

/**
 * Acquire a lock for compensation run
 *
 * @param periodStart - Start date (YYYY-MM-DD)
 * @param periodEnd - End date (YYYY-MM-DD)
 * @returns { success: boolean, lockId?: number, error?: string }
 */
export async function acquireCompensationLock(
  periodStart: string,
  periodEnd: string
): Promise<{ success: boolean; lockId?: number; error?: string }> {
  const supabase = createServiceClient();
  const lockId = periodToLockId(periodStart, periodEnd);

  try {
    // Try to acquire PostgreSQL advisory lock
    // pg_try_advisory_lock returns true if lock acquired, false if already held
    const { data, error } = await supabase.rpc('pg_try_advisory_lock', {
      lock_id: lockId,
    });

    if (error) {
      console.error('[CompRun] Failed to acquire lock:', error);
      return {
        success: false,
        error: 'Failed to acquire lock',
      };
    }

    if (!data) {
      // Lock is already held
      return {
        success: false,
        error: 'A compensation run is already in progress for this period',
      };
    }

    // Lock acquired successfully
    return {
      success: true,
      lockId,
    };
  } catch (error) {
    console.error('[CompRun] Lock acquisition error:', error);
    return {
      success: false,
      error: 'Lock acquisition failed',
    };
  }
}

/**
 * Release a compensation run lock
 *
 * @param lockId - The lock ID returned from acquireCompensationLock
 */
export async function releaseCompensationLock(
  lockId: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient();

  try {
    // Release the advisory lock
    const { data, error } = await supabase.rpc('pg_advisory_unlock', {
      lock_id: lockId,
    });

    if (error) {
      console.error('[CompRun] Failed to release lock:', error);
      return {
        success: false,
        error: 'Failed to release lock',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('[CompRun] Lock release error:', error);
    return {
      success: false,
      error: 'Lock release failed',
    };
  }
}

/**
 * Execute compensation run with automatic lock management
 *
 * @param periodStart - Start date
 * @param periodEnd - End date
 * @param runFn - The actual compensation run function
 */
export async function withCompensationLock<T>(
  periodStart: string,
  periodEnd: string,
  runFn: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  // Acquire lock
  const lockResult = await acquireCompensationLock(periodStart, periodEnd);

  if (!lockResult.success) {
    return {
      success: false,
      error: lockResult.error,
    };
  }

  const lockId = lockResult.lockId!;

  try {
    // Execute the compensation run
    const result = await runFn();

    // Release lock
    await releaseCompensationLock(lockId);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // Ensure lock is released even on error
    await releaseCompensationLock(lockId);

    throw error;
  }
}
```

---

### Step 2: Add Run Status Table

**Migration:** `supabase/migrations/YYYYMMDD_compensation_run_status.sql`

```sql
-- =============================================
-- Compensation Run Status Tracking
-- Prevents duplicate runs and provides audit trail
-- =============================================

CREATE TABLE IF NOT EXISTS compensation_run_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Period Info
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Run Info
  run_id UUID NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),

  -- Who & When
  initiated_by UUID REFERENCES auth.users(id),
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Results
  members_processed INT DEFAULT 0,
  commissions_calculated INT DEFAULT 0,
  total_amount_cents BIGINT DEFAULT 0,
  error_message TEXT,

  -- Metadata
  dry_run BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate runs for same period
  UNIQUE(period_start, period_end, status) WHERE status IN ('in_progress', 'pending')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comp_run_status_period
  ON compensation_run_status(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_comp_run_status_status
  ON compensation_run_status(status);

CREATE INDEX IF NOT EXISTS idx_comp_run_run_id
  ON compensation_run_status(run_id);

-- Auto-update updated_at
CREATE TRIGGER update_compensation_run_status_updated_at
  BEFORE UPDATE ON compensation_run_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### Step 3: Update Compensation Run Endpoint

**Changes to** `src/app/api/admin/compensation/run/route.ts`:

```typescript
import { withCompensationLock } from '@/lib/compensation/run-lock';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();
    const { periodStart, periodEnd, dryRun = true } = body;

    if (!periodStart || !periodEnd) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get authenticated admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if run already exists for this period
    const { data: existingRun } = await supabase
      .from('compensation_run_status')
      .select('id, status, run_id')
      .eq('period_start', periodStart)
      .eq('period_end', periodEnd)
      .in('status', ['in_progress', 'pending'])
      .single();

    if (existingRun) {
      return NextResponse.json(
        {
          error: 'A compensation run is already in progress for this period',
          existingRunId: existingRun.run_id,
          status: existingRun.status,
        },
        { status: 409 } // Conflict
      );
    }

    // Create run status record
    const runId = crypto.randomUUID();
    const { error: insertError } = await supabase
      .from('compensation_run_status')
      .insert({
        run_id: runId,
        period_start: periodStart,
        period_end: periodEnd,
        status: 'pending',
        initiated_by: user.id,
        dry_run: dryRun,
      });

    if (insertError) {
      console.error('[CompRun] Failed to create run status:', insertError);
      return NextResponse.json(
        { error: 'Failed to initialize compensation run' },
        { status: 500 }
      );
    }

    // Execute compensation run with lock
    const result = await withCompensationLock(
      periodStart,
      periodEnd,
      async () => {
        // Update status to in_progress
        await supabase
          .from('compensation_run_status')
          .update({
            status: 'in_progress',
            started_at: new Date().toISOString(),
          })
          .eq('run_id', runId);

        try {
          // ACTUAL COMPENSATION CALCULATION HERE
          const members = await getActiveMembers();
          const commissions = await calculateCommissions(members, periodStart, periodEnd);

          if (!dryRun) {
            await saveCommissionsToDatabase(commissions, runId);
          }

          // Update status to completed
          await supabase
            .from('compensation_run_status')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              members_processed: members.length,
              commissions_calculated: commissions.length,
              total_amount_cents: commissions.reduce((sum, c) => sum + c.amount_cents, 0),
            })
            .eq('run_id', runId);

          return {
            runId,
            membersProcessed: members.length,
            commissionsCalculated: commissions.length,
          };
        } catch (error) {
          // Mark as failed
          await supabase
            .from('compensation_run_status')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString(),
              error_message: error instanceof Error ? error.message : 'Unknown error',
            })
            .eq('run_id', runId);

          throw error;
        }
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      ...result.data,
      message: dryRun
        ? 'Dry run completed successfully'
        : 'Compensation run completed successfully',
    });

  } catch (error) {
    console.error('[CompRun] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## ✅ TESTING CHECKLIST

### Unit Tests
- [ ] `periodToLockId()` - Consistent hash generation
- [ ] `acquireCompensationLock()` - Success case
- [ ] `acquireCompensationLock()` - Already locked case
- [ ] `releaseCompensationLock()` - Success case
- [ ] `withCompensationLock()` - Automatic release on success
- [ ] `withCompensationLock()` - Automatic release on error

### Integration Tests
- [ ] Single admin can run compensation
- [ ] Second admin is blocked during run
- [ ] Lock is released after completion
- [ ] Lock is released on error
- [ ] Duplicate period check works
- [ ] Status tracking updates correctly

### Manual Tests
- [ ] Open two admin tabs
- [ ] Click "Run Commissions" in Tab 1
- [ ] Immediately click "Run Commissions" in Tab 2
- [ ] Verify Tab 2 shows "Already in progress" error
- [ ] Verify only one run in compensation_run_status

---

## 📊 PERFORMANCE IMPACT

**Before:**
- No locking overhead
- Risk of duplicate runs

**After:**
- ~5-10ms for lock acquisition
- ~2-5ms for lock release
- ~10ms for status check
- **Total overhead: ~20ms** (negligible for long-running compensation calculation)

**Lock Duration:**
- Average compensation run: 30-60 seconds
- Lock held for entire duration
- Automatically released on completion or error

---

## 🚀 DEPLOYMENT PLAN

### Phase 1: Add Lock Utility (No Breaking Changes)
1. Create `src/lib/compensation/run-lock.ts`
2. Write tests
3. Commit: `feat: add compensation run locking utility`

### Phase 2: Add Status Table
1. Create migration
2. Test migration
3. Commit: `feat: add compensation run status tracking`

### Phase 3: Update Endpoint
1. Apply lock to POST /api/admin/compensation/run
2. Add status checks
3. Update error messages
4. Commit: `fix: prevent duplicate compensation runs with mutex`

---

## 🎯 SUCCESS CRITERIA

- [ ] PostgreSQL advisory locks implemented
- [ ] Run status table created and working
- [ ] Duplicate period check prevents conflicts
- [ ] Second admin gets clear error message
- [ ] Lock is always released (even on error)
- [ ] Tests pass (unit + integration)
- [ ] TypeScript compiles
- [ ] No breaking changes to existing functionality

---

**End of Plan Document**
