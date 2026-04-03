'use client';

/**
 * Business Center Nag Component
 *
 * Progressive nag system for Business Center subscription:
 * - Soft: Banner at top of dashboard (Days 8-21)
 * - Hard: Full-screen modal on login (Day 22+)
 *
 * @module components/dashboard/BusinessCenterNag
 */

import { useState, useEffect } from 'react';
import { X, Lock, CheckCircle, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { BUSINESS_CENTER_BENEFITS } from '@/lib/subscription/feature-gate';

export interface BusinessCenterNagProps {
  nagLevel: 'soft' | 'hard';
  daysWithout: number;
  distributorId: string;
}

/**
 * Soft Nag - Dismissible banner at top of dashboard
 */
export function BusinessCenterBanner({
  daysWithout,
  distributorId,
}: {
  daysWithout: number;
  distributorId: string;
}) {
  const [dismissed, setDismissed] = useState(false);

  // Check localStorage for dismissal
  useEffect(() => {
    const dismissedUntil = localStorage.getItem('bc-banner-dismissed');
    if (dismissedUntil) {
      const expiryDate = new Date(dismissedUntil);
      if (expiryDate > new Date()) {
        setDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    // Dismiss for 24 hours
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    localStorage.setItem('bc-banner-dismissed', tomorrow.toISOString());
    setDismissed(true);
  };

  if (dismissed) return null;

  const daysRemaining = 22 - daysWithout;
  const trialExpired = daysRemaining <= 0;

  return (
    <div className={`${trialExpired ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-blue-600 to-blue-700'} text-white px-4 py-3 shadow-md`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Clock className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm">
              {trialExpired ? 'Business Center Trial Expired' : 'Unlock Full Features with Business Center'}
            </p>
            <p className="text-xs text-white/90 mt-0.5">
              {trialExpired
                ? 'Subscribe now for $39/month to unlock AI tools, CRM, and more.'
                : `${daysRemaining} days remaining in your trial. Get AI tools, CRM, and more for just $39/month.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/store"
            className="bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            Subscribe Now
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={handleDismiss}
            className={`p-2 ${trialExpired ? 'hover:bg-orange-600' : 'hover:bg-blue-600'} rounded-lg transition-colors`}
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hard Nag - Full-screen modal (Day 22+)
 */
export function BusinessCenterModal({
  daysWithout,
  distributorId,
}: {
  daysWithout: number;
  distributorId: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [dismissCount, setDismissCount] = useState(0);

  // Check localStorage for dismiss count (allow 3 dismissals)
  useEffect(() => {
    const count = localStorage.getItem('bc-modal-dismiss-count');
    if (count) {
      const parsed = parseInt(count, 10);
      setDismissCount(parsed);
      if (parsed >= 3) {
        // After 3 dismissals, can't dismiss anymore
        setIsOpen(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    if (dismissCount < 3) {
      const newCount = dismissCount + 1;
      setDismissCount(newCount);
      localStorage.setItem('bc-modal-dismiss-count', newCount.toString());
      setIsOpen(false);
    }
  };

  const canDismiss = dismissCount < 3;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  Unlock Your Full Business Center
                </h2>
                <p className="text-blue-100 mt-1">
                  Your trial period has ended. Subscribe to continue accessing premium features.
                </p>
              </div>
            </div>
            {canDismiss && (
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                aria-label="Dismiss modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Trial Status */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-orange-800">
              <Clock className="w-5 h-5" />
              <p className="font-semibold">
                {daysWithout} days since signup - Trial period ended
              </p>
            </div>
            <p className="text-sm text-orange-700 mt-1">
              Subscribe to Business Center to regain access to AI tools, CRM, reports, and more.
            </p>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-blue-200 rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
              <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold mb-3">
                BEST VALUE
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-slate-900">$39</span>
                <span className="text-slate-600 text-lg">/month</span>
              </div>
              <p className="text-sm text-slate-600 mt-2">
                Earn 39 BV credits with your subscription
              </p>
            </div>

            <div className="border-t border-slate-300 pt-4">
              <p className="font-semibold text-slate-900 mb-3">
                Everything you need to build your business:
              </p>
              <div className="space-y-2">
                {BUSINESS_CENTER_BENEFITS.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard/store"
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              Subscribe to Business Center
              <ArrowRight className="w-5 h-5" />
            </Link>

            {canDismiss && (
              <button
                onClick={handleDismiss}
                className="w-full bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Remind Me Later ({3 - dismissCount} reminders left)
              </button>
            )}

            {!canDismiss && (
              <p className="text-center text-sm text-slate-600">
                Subscribe to continue using advanced features
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main BusinessCenterNag Component
 * Renders appropriate nag based on level
 *
 * NOTE: Always renders banner only - no blocking modals
 */
export default function BusinessCenterNag({
  nagLevel,
  daysWithout,
  distributorId,
}: BusinessCenterNagProps) {
  // ALWAYS show banner only - no blocking modals
  return <BusinessCenterBanner daysWithout={daysWithout} distributorId={distributorId} />;
}
