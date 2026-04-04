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
 * Shows children if has access, otherwise shows blocking upgrade modal
 */
export default function FeatureGate({
  featurePath,
  hasAccess,
  daysWithout,
  children,
  trialEndsAt,
  subscriptionStatus,
}: FeatureGateProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/stripe/create-product-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: '528eea55-21f7-415b-a2ea-ab39b65d6101', // Business Center
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to start checkout. Please try again.');
      setIsLoading(false);
    }
  };

  // BLOCK ACCESS if trial expired and no subscription
  if (!hasAccess && subscriptionStatus === 'expired') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-slate-900">Business Center Required</h1>
            <p className="text-slate-600 text-lg">
              Your 14-day trial has expired. Subscribe to continue accessing Business Center features.
            </p>
          </div>

          {/* Feature Benefits */}
          <div className="mb-8 bg-slate-50 rounded-lg p-6">
            <h2 className="font-semibold mb-4 text-slate-900">What You Get with Business Center:</h2>
            <ul className="space-y-3">
              {BUSINESS_CENTER_BENEFITS.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 mb-6 text-white">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">$39/month</div>
              <div className="text-blue-100 mb-4">Unlimited access to all Business Center features</div>
              <ul className="text-sm space-y-1 text-blue-100">
                <li>✓ Cancel anytime</li>
                <li>✓ No contracts</li>
                <li>✓ Instant activation</li>
              </ul>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                'Loading...'
              ) : (
                <>
                  Subscribe to Business Center
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-4 border-2 border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition-colors text-slate-700 flex items-center justify-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show banner if in active trial
  if (subscriptionStatus === 'trialing') {
    return (
      <>
        <TrialBanner
          trialEndsAt={trialEndsAt}
          hasAccess={hasAccess}
          subscriptionStatus={subscriptionStatus}
        />
        {children}
      </>
    );
  }

  // Full access - no banner or blocking
  return <>{children}</>;
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
