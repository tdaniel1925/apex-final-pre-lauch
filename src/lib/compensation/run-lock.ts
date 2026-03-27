/**
 * Compensation Run Lock
 *
 * Prevents race conditions in compensation runs by using PostgreSQL advisory locks.
 * Multiple admins cannot run the same compensation period simultaneously.
 *
 * Security Fix #2: Addresses race condition vulnerability
 * See: SECURITY-FIX-2-COMPENSATION-MUTEX-PLAN.md
 */

import { createServiceClient } from '@/lib/supabase/service';

/**
 * Convert period string to integer lock ID for PostgreSQL advisory locks
 *
 * PostgreSQL advisory locks require a bigint (int64). We generate a consistent
 * hash from the period dates to create a unique lock ID per period.
 *
 * @param periodStart - Start date (YYYY-MM-DD)
 * @param periodEnd - End date (YYYY-MM-DD)
 * @returns Positive integer suitable for pg_advisory_lock
 */
function periodToLockId(periodStart: string, periodEnd: string): number {
  const combined = `comp-run:${periodStart}:${periodEnd}`;
  let hash = 0;

  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Return positive value only (advisory locks work with bigint)
  // Using Math.abs to ensure positive, then mod to keep within safe range
  return Math.abs(hash) % 2147483647; // Max 32-bit signed int
}

/**
 * Acquire a lock for compensation run using PostgreSQL advisory lock
 *
 * @param periodStart - Start date (YYYY-MM-DD)
 * @param periodEnd - End date (YYYY-MM-DD)
 * @returns Object with success status, lock ID if acquired, or error message
 *
 * @example
 * ```typescript
 * const { success, lockId, error } = await acquireCompensationLock('2026-03-01', '2026-03-31');
 *
 * if (!success) {
 *   return NextResponse.json({ error }, { status: 409 });
 * }
 *
 * // ... perform compensation run ...
 *
 * await releaseCompensationLock(lockId);
 * ```
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
      key: lockId,
    });

    if (error) {
      console.error('[CompRun] Failed to acquire lock:', error);
      return {
        success: false,
        error: 'Failed to acquire compensation run lock',
      };
    }

    if (!data) {
      // Lock is already held by another process
      console.warn('[CompRun] Lock already held:', { lockId, periodStart, periodEnd });
      return {
        success: false,
        error: 'A compensation run is already in progress for this period',
      };
    }

    // Lock acquired successfully
    console.log('[CompRun] Lock acquired:', { lockId, periodStart, periodEnd });
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
 * @returns Object with success status or error message
 *
 * @example
 * ```typescript
 * const { success, error } = await releaseCompensationLock(lockId);
 *
 * if (!success) {
 *   console.error('Failed to release lock:', error);
 * }
 * ```
 */
export async function releaseCompensationLock(
  lockId: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient();

  try {
    // Release the advisory lock
    const { data, error } = await supabase.rpc('pg_advisory_unlock', {
      key: lockId,
    });

    if (error) {
      console.error('[CompRun] Failed to release lock:', error);
      return {
        success: false,
        error: 'Failed to release compensation run lock',
      };
    }

    console.log('[CompRun] Lock released:', { lockId });
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
 * This is the recommended way to use compensation run locks. It automatically:
 * - Acquires the lock before execution
 * - Releases the lock after completion
 * - Releases the lock even if an error occurs
 *
 * @param periodStart - Start date (YYYY-MM-DD)
 * @param periodEnd - End date (YYYY-MM-DD)
 * @param runFn - The actual compensation run function
 * @returns Object with success status, data from runFn, or error message
 *
 * @example
 * ```typescript
 * const result = await withCompensationLock(
 *   '2026-03-01',
 *   '2026-03-31',
 *   async () => {
 *     // Your compensation calculation logic here
 *     const commissions = await calculateCommissions();
 *     return { commissionsCalculated: commissions.length };
 *   }
 * );
 *
 * if (!result.success) {
 *   return NextResponse.json({ error: result.error }, { status: 409 });
 * }
 *
 * return NextResponse.json({ success: true, ...result.data });
 * ```
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

    // Re-throw error to be handled by caller
    throw error;
  }
}
