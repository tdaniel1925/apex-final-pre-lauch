// Apex Affinity Group - CAB State Machine
// Source: BUSINESS-RULES.md, 03_rep_policies.md

import type { CABRecord, CABState, Subscription } from './types';
import { COMP_PLAN_CONFIG } from './config';

/**
 * CAB STATE MACHINE
 *
 * States:
 * - PENDING: Waiting for 60-day retention
 * - EARNED: Customer retained 60 days, CAB released
 * - VOIDED: Cancelled before day 60, OR hard decline unrecovered, OR monthly cap exceeded
 * - VOIDED_CAP: Created when rep already has 20 CABs this month
 * - CLAWBACK: Chargeback after day 60, OR rep terminated after CAB paid
 *
 * Transitions:
 * PENDING → EARNED:  customer.status = ACTIVE AND today >= release_eligible_date
 * PENDING → VOIDED:  cancellation before day 60, OR hard decline not recovered in 14 days,
 *                    OR chargeback, OR rep terminated, OR Apex terminates account
 * EARNED → CLAWBACK: chargeback after day 60, OR rep terminated after CAB paid
 * VOIDED: FINAL (no recovery)
 * EARNED: FINAL (except post-payment chargeback → CLAWBACK)
 */

export interface CABTransitionResult {
  success: boolean;
  newState: CABState;
  reason: string;
  errors?: string[];
}

/**
 * Create new CAB record for a subscription
 *
 * CRITICAL RULES:
 * - One CAB per customer enrollment
 * - CAB only for AgentPulse products (NOT BizCenter)
 * - Monthly cap check: if count >= 20 → VOIDED_CAP
 * - Amount fixed at $50
 * - 60-day retention window from enrollment_date
 *
 * @param subscription - New subscription
 * @param repId - Selling rep ID
 * @param db - Database connection
 * @returns New CAB record or null if not eligible
 */
export async function createCAB(
  subscription: Subscription,
  repId: string,
  db: any
): Promise<CABRecord | null> {
  // Skip BizCenter (generates $0 CAB)
  if (subscription.product_id === 'BIZCENTER') {
    return null;
  }

  // Check monthly cap (20 CABs per rep per month)
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const existingCABsThisMonth = await db
    .from('cab_records')
    .select('cab_id', { count: 'exact' })
    .eq('rep_id', repId)
    .gte('created_at', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
    .lt('created_at', `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`);

  const count = existingCABsThisMonth.count || 0;
  const cappedOut = count >= COMP_PLAN_CONFIG.bonuses.cab.monthly_cap;

  // Calculate release date (enrollment + 60 days)
  const enrollmentDate = new Date(subscription.enrollment_date);
  const releaseEligibleDate = new Date(enrollmentDate);
  releaseEligibleDate.setDate(releaseEligibleDate.getDate() + COMP_PLAN_CONFIG.bonuses.cab.retention_days);

  // Create CAB record
  const cabId = crypto.randomUUID();
  const state: CABState = cappedOut ? 'VOIDED_CAP' : 'PENDING';

  const cabRecord: CABRecord = {
    cab_id: cabId,
    rep_id: repId,
    subscription_id: subscription.subscription_id,
    enrollment_date: enrollmentDate,
    release_eligible_date: releaseEligibleDate,
    state,
    amount: COMP_PLAN_CONFIG.bonuses.cab.amount,
    trigger_reason: cappedOut ? `Monthly cap exceeded (${count}/20)` : null,
    released_in_run_id: null,
    clawback_applied_run_id: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  await db.from('cab_records').insert(cabRecord);

  return cabRecord;
}

/**
 * Transition CAB: PENDING → EARNED
 *
 * Triggered when:
 * - Customer status = ACTIVE
 * - today >= release_eligible_date (day 60 passed)
 *
 * @param cabId - CAB record ID
 * @param db - Database connection
 * @returns Transition result
 */
export async function transitionToEarned(cabId: string, db: any): Promise<CABTransitionResult> {
  const cab = await db
    .from('cab_records')
    .select('*, subscriptions(*)')
    .eq('cab_id', cabId)
    .maybeSingle();

  if (!cab.data) {
    return {
      success: false,
      newState: 'PENDING',
      reason: 'CAB not found',
      errors: ['CAB record not found'],
    };
  }

  // Check current state
  if (cab.data.state !== 'PENDING') {
    return {
      success: false,
      newState: cab.data.state,
      reason: `CAB is ${cab.data.state}, not PENDING`,
      errors: [`Cannot transition from ${cab.data.state} to EARNED`],
    };
  }

  // Check subscription still active
  if (cab.data.subscriptions.status !== 'ACTIVE') {
    // Customer cancelled/suspended → transition to VOIDED instead
    return transitionToVoided(cabId, db, `Customer ${cab.data.subscriptions.status.toLowerCase()}`);
  }

  // Check release date
  const today = new Date();
  const releaseDate = new Date(cab.data.release_eligible_date);

  if (today < releaseDate) {
    return {
      success: false,
      newState: 'PENDING',
      reason: `Release date not reached (${releaseDate.toISOString().split('T')[0]})`,
      errors: ['Too early to release'],
    };
  }

  // Transition to EARNED
  await db
    .from('cab_records')
    .update({
      state: 'EARNED',
      updated_at: new Date().toISOString(),
    })
    .eq('cab_id', cabId);

  return {
    success: true,
    newState: 'EARNED',
    reason: `Customer retained ${COMP_PLAN_CONFIG.bonuses.cab.retention_days} days`,
  };
}

/**
 * Transition CAB: PENDING → VOIDED
 *
 * Triggered when:
 * - Cancellation before day 60
 * - Hard decline not recovered in 14 days
 * - Chargeback
 * - Rep terminated
 * - Apex terminates account
 *
 * @param cabId - CAB record ID
 * @param db - Database connection
 * @param reason - Why voided
 * @returns Transition result
 */
export async function transitionToVoided(cabId: string, db: any, reason: string): Promise<CABTransitionResult> {
  const cab = await db
    .from('cab_records')
    .select('*')
    .eq('cab_id', cabId)
    .maybeSingle();

  if (!cab.data) {
    return {
      success: false,
      newState: 'PENDING',
      reason: 'CAB not found',
      errors: ['CAB record not found'],
    };
  }

  // Can only void from PENDING
  if (cab.data.state !== 'PENDING') {
    return {
      success: false,
      newState: cab.data.state,
      reason: `CAB is ${cab.data.state}, not PENDING`,
      errors: [`Cannot void from ${cab.data.state}`],
    };
  }

  // Transition to VOIDED
  await db
    .from('cab_records')
    .update({
      state: 'VOIDED',
      trigger_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('cab_id', cabId);

  return {
    success: true,
    newState: 'VOIDED',
    reason,
  };
}

/**
 * Transition CAB: EARNED → CLAWBACK
 *
 * Triggered when:
 * - Chargeback after day 60 (after CAB already paid)
 * - Rep terminated after CAB paid
 *
 * @param cabId - CAB record ID
 * @param db - Database connection
 * @param reason - Why clawed back
 * @returns Transition result
 */
export async function transitionToClawback(cabId: string, db: any, reason: string): Promise<CABTransitionResult> {
  const cab = await db
    .from('cab_records')
    .select('*')
    .eq('cab_id', cabId)
    .maybeSingle();

  if (!cab.data) {
    return {
      success: false,
      newState: 'PENDING',
      reason: 'CAB not found',
      errors: ['CAB record not found'],
    };
  }

  // Can only clawback from EARNED
  if (cab.data.state !== 'EARNED') {
    return {
      success: false,
      newState: cab.data.state,
      reason: `CAB is ${cab.data.state}, not EARNED`,
      errors: [`Cannot clawback from ${cab.data.state}`],
    };
  }

  // Transition to CLAWBACK
  await db
    .from('cab_records')
    .update({
      state: 'CLAWBACK',
      trigger_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('cab_id', cabId);

  return {
    success: true,
    newState: 'CLAWBACK',
    reason,
  };
}

/**
 * Handle payment failure (14-day recovery window)
 *
 * When payment fails:
 * 1. Record payment_failed_date on subscription
 * 2. Set recovery_deadline = payment_failed_date + 14 days
 * 3. Subscription status → SUSPENDED (not CANCELLED)
 * 4. CAB state remains PENDING
 *
 * If payment recovered before recovery_deadline:
 * 1. Subscription status → ACTIVE
 * 2. Clear payment_failed_date and recovery_deadline
 * 3. CAB state remains PENDING — clock continues from original enrollment_date
 *
 * If recovery_deadline passes with no recovery:
 * 1. Subscription status → CANCELLED
 * 2. CAB state → VOIDED
 *
 * @param subscriptionId - Subscription ID
 * @param db - Database connection
 * @returns Payment failure record
 */
export async function handlePaymentFailure(subscriptionId: string, db: any): Promise<void> {
  const subscription = await db
    .from('subscriptions')
    .select('*')
    .eq('subscription_id', subscriptionId)
    .maybeSingle();

  if (!subscription.data) {
    throw new Error('Subscription not found');
  }

  const paymentFailedDate = new Date();
  const recoveryDeadline = new Date(paymentFailedDate);
  recoveryDeadline.setDate(recoveryDeadline.getDate() + 14);

  await db
    .from('subscriptions')
    .update({
      status: 'SUSPENDED',
      payment_failed_date: paymentFailedDate.toISOString(),
      recovery_deadline: recoveryDeadline.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('subscription_id', subscriptionId);
}

/**
 * Handle payment recovery (within 14-day window)
 *
 * @param subscriptionId - Subscription ID
 * @param db - Database connection
 */
export async function handlePaymentRecovery(subscriptionId: string, db: any): Promise<void> {
  const subscription = await db
    .from('subscriptions')
    .select('*')
    .eq('subscription_id', subscriptionId)
    .maybeSingle();

  if (!subscription.data) {
    throw new Error('Subscription not found');
  }

  // Check recovery deadline
  if (subscription.data.recovery_deadline) {
    const deadline = new Date(subscription.data.recovery_deadline);
    const now = new Date();

    if (now > deadline) {
      throw new Error('Recovery deadline passed - subscription must be re-enrolled');
    }
  }

  // Restore subscription
  await db
    .from('subscriptions')
    .update({
      status: 'ACTIVE',
      payment_failed_date: null,
      recovery_deadline: null,
      updated_at: new Date().toISOString(),
    })
    .eq('subscription_id', subscriptionId);

  // CAB remains PENDING - clock continues from original enrollment_date
}

/**
 * Daily job: Check all PENDING CABs and transition if eligible
 *
 * Should run every day at midnight
 *
 * @param db - Database connection
 * @returns Count of transitions
 */
export async function processCABTransitions(db: any): Promise<{
  earned: number;
  voided: number;
}> {
  const today = new Date();

  // Get all PENDING CABs that are eligible for release
  const eligibleCABs = await db
    .from('cab_records')
    .select('*, subscriptions(*)')
    .eq('state', 'PENDING')
    .lte('release_eligible_date', today.toISOString());

  let earned = 0;
  let voided = 0;

  for (const cab of eligibleCABs.data || []) {
    if (cab.subscriptions.status === 'ACTIVE') {
      await transitionToEarned(cab.cab_id, db);
      earned++;
    } else {
      await transitionToVoided(cab.cab_id, db, `Customer ${cab.subscriptions.status.toLowerCase()}`);
      voided++;
    }
  }

  // Check subscriptions with expired recovery deadlines
  const expiredRecoveries = await db
    .from('subscriptions')
    .select('*, cab_records(*)')
    .eq('status', 'SUSPENDED')
    .lt('recovery_deadline', today.toISOString());

  for (const subscription of expiredRecoveries.data || []) {
    // Cancel subscription
    await db
      .from('subscriptions')
      .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
      .eq('subscription_id', subscription.subscription_id);

    // Void all PENDING CABs for this subscription
    for (const cab of subscription.cab_records) {
      if (cab.state === 'PENDING') {
        await transitionToVoided(cab.cab_id, db, 'Hard decline unrecovered - 14 days passed');
        voided++;
      }
    }
  }

  return { earned, voided };
}
