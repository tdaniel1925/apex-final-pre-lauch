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
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // If dismissed, show children (allow access to rest of back office)
  if (isDismissed) {
    return <>{children}</>;
  }

  // Otherwise, show upgrade prompt
  const featureName = getFeatureName(featurePath);

  // Handle Business Center subscription
  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Business Center product ID
      const BUSINESS_CENTER_PRODUCT_ID = '528eea55-21f7-415b-a2ea-ab39b65d6101';

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-product-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: BUSINESS_CENTER_PRODUCT_ID,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (err: any) {
      console.error('Subscription error:', err);
      setError(err.message || 'Failed to start checkout. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full relative">
        {/* Close Button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors z-10 border-2 border-slate-200"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

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

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Subscribe to Business Center ($39/month)
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </span>
            </button>

            {/* Back Link */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsDismissed(true)}
                className="text-sm text-slate-600 hover:text-slate-900 underline"
              >
                Skip for now - Access back office
              </button>
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
