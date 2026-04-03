'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface TrialBannerProps {
  trialEndsAt?: Date;
  hasAccess?: boolean;
  subscriptionStatus?: 'active' | 'trialing' | 'canceled' | 'expired';
}

export default function TrialBanner({ trialEndsAt, hasAccess, subscriptionStatus }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Calculate days remaining if trial date provided
  let daysRemaining = 0;
  if (trialEndsAt) {
    const now = new Date();
    daysRemaining = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Show different messages based on status
  const isExpired = subscriptionStatus === 'expired' || daysRemaining <= 0;

  return (
    <div className={`${isExpired ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-blue-600 to-purple-600'} text-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{isExpired ? '⚠️' : '🎉'}</span>
            <div>
              <p className="font-semibold">
                {isExpired
                  ? 'Business Center Trial Expired'
                  : `Free Trial: ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`}
              </p>
              <p className="text-sm text-white/90">
                {isExpired
                  ? 'Subscribe now for $39/month to unlock all Business Center features'
                  : 'Unlock unlimited access to Business Center forever'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/store"
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
            >
              {isExpired ? 'Subscribe Now' : 'Unlock Now'}
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
