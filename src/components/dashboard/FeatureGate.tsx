'use client';

/**
 * Feature Gate Component
 *
 * Blocks access to gated features and shows upgrade prompt.
 * Used to wrap protected dashboard pages.
 *
 * @module components/dashboard/FeatureGate
 */

import { Lock, ArrowRight, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { BUSINESS_CENTER_BENEFITS, getFeatureName } from '@/lib/subscription/feature-gate';
import TrialBanner from './TrialBanner';

export interface FeatureGateProps {
  /** Feature path being gated */
  featurePath: string;
  /** Whether user has access */
  hasAccess: boolean;
  /** Days since signup */
  daysWithout: number;
  /** Child content to render if has access */
  children: React.ReactNode;
  /** Trial end date (if in trial) */
  trialEndsAt?: Date;
  /** Subscription status */
  subscriptionStatus?: 'active' | 'trialing' | 'canceled' | 'expired';
}

/**
 * Feature Gate Wrapper
 *
 * Shows children if has access, otherwise shows upgrade prompt
 */
export default function FeatureGate({
  featurePath,
  hasAccess,
  daysWithout,
  children,
  trialEndsAt,
  subscriptionStatus,
}: FeatureGateProps) {
  // ALWAYS show children - no blocking screen
  // Just show a banner if trial ended or active
  return (
    <>
      {/* Show trial banner if in trial OR if trial expired */}
      {(subscriptionStatus === 'trialing' || subscriptionStatus === 'expired') && (
        <TrialBanner
          trialEndsAt={trialEndsAt}
          hasAccess={hasAccess}
          subscriptionStatus={subscriptionStatus}
        />
      )}
      {children}
    </>
  );
}

/**
 * Server-side Feature Gate Wrapper
 *
 * Use this in server components to check access before rendering
 */
export function ServerFeatureGate({
  featurePath,
  hasAccess,
  daysWithout,
  children,
  trialEndsAt,
  subscriptionStatus,
}: FeatureGateProps) {
  return (
    <FeatureGate
      featurePath={featurePath}
      hasAccess={hasAccess}
      daysWithout={daysWithout}
      trialEndsAt={trialEndsAt}
      subscriptionStatus={subscriptionStatus}
    >
      {children}
    </FeatureGate>
  );
}
