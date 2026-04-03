'use client';

/**
 * Feature Gate Component
 *
 * Blocks access to gated features and shows upgrade prompt.
 * Used to wrap protected dashboard pages.
 *
 * @module components/dashboard/FeatureGate
 */

import { Lock, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
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
  // If has access, render children
  if (hasAccess) {
    return (
      <>
        {/* Show trial banner if in trial */}
        {subscriptionStatus === 'trialing' && trialEndsAt && (
          <TrialBanner trialEndsAt={trialEndsAt} />
        )}
        {children}
      </>
    );
  }

  // Otherwise, show upgrade prompt
  const featureName = getFeatureName(featurePath);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Lock Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-200 rounded-full mb-4">
            <Lock className="w-10 h-10 text-slate-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {featureName} Requires Business Center
          </h1>
          <p className="text-slate-600">
            Your free trial ended after {daysWithout} days. Subscribe to unlock all features.
          </p>
        </div>

        {/* Upgrade Card */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden">
          {/* Pricing Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 text-center">
            <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              UNLOCK NOW
            </div>
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-5xl font-bold">$39</span>
              <span className="text-lg text-blue-100">/month</span>
            </div>
            <p className="text-sm text-blue-100">
              Full access to all Business Center features
            </p>
          </div>

          {/* Benefits List */}
          <div className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">
              What's included in Business Center:
            </h3>
            <div className="space-y-3 mb-6">
              {BUSINESS_CENTER_BENEFITS.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/dashboard/store"
              className="block w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-bold text-center hover:bg-blue-700 transition-colors shadow-md"
            >
              <span className="flex items-center justify-center gap-2">
                Subscribe to Business Center
                <ArrowRight className="w-5 h-5" />
              </span>
            </Link>

            {/* Back Link */}
            <div className="mt-4 text-center">
              <Link
                href="/dashboard"
                className="text-sm text-slate-600 hover:text-slate-900 underline"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Need help? Contact support at{' '}
            <a
              href="mailto:support@theapexway.net"
              className="text-blue-600 hover:underline"
            >
              support@theapexway.net
            </a>
          </p>
        </div>
      </div>
    </div>
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
