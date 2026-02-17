'use client';

// =============================================
// Onboarding Step 5: Build Your Team
// =============================================

import { useState } from 'react';
import type { Distributor } from '@/lib/types';

interface Step5Props {
  distributor: Distributor;
  onNext: () => void;
  onBack: () => void;
  updateDistributor: (updates: Partial<Distributor>) => void;
}

export default function OnboardingStep5Team({ distributor, onNext, onBack }: Step5Props) {
  const [copied, setCopied] = useState(false);
  const referralUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://theapexway.net'}/signup?ref=${distributor.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 px-2">
        <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">👥</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">Build Your Team</h2>
        <p className="text-white/70 text-base sm:text-lg">
          Your success grows with your team's success - let's get you started
        </p>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {/* Referral Link Section */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Your Referral Link:
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 mb-2">
            <div className="flex-1 px-3 sm:px-4 py-3 bg-gray-50 border-2 border-green-500 rounded-lg font-mono text-xs sm:text-sm text-green-600 truncate">
              {referralUrl}
            </div>
            <button
              onClick={handleCopy}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
          <p className="text-sm text-gray-600">
            When someone signs up using this link, they're automatically placed in your team
          </p>
        </div>

        {/* Matrix Visualization */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How the Matrix System Works:
          </h3>
          <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg p-6">
            {/* Simple Matrix Diagram */}
            <div className="flex flex-col items-center">
              {/* Level 1 - You */}
              <div className="mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  YOU
                </div>
              </div>

              {/* Level 2 - Direct */}
              <div className="flex gap-4 mb-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-2 h-8 bg-blue-300" />
                    <div className="w-16 h-16 bg-white border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center text-gray-400 font-medium shadow">
                      Empty
                    </div>
                  </div>
                ))}
              </div>

              {/* Level 3 - Team */}
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <div key={i} className="w-8 h-8 bg-gray-200 rounded-full" />
                ))}
              </div>
            </div>

            <p className="text-sm text-gray-700 text-center mt-4">
              Each person can have up to 3 direct members, creating exponential growth potential
            </p>
          </div>
        </div>

        {/* Team Building Tips */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🚀 Quick Start Guide:
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl">1️⃣</div>
              <div>
                <h4 className="font-semibold text-blue-900">Make a List</h4>
                <p className="text-sm text-blue-800">
                  Write down 10-20 people who might be interested in building their income
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl">2️⃣</div>
              <div>
                <h4 className="font-semibold text-green-900">Share Your Story</h4>
                <p className="text-sm text-green-800">
                  Tell them why you joined and share your website or referral link
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-2xl">3️⃣</div>
              <div>
                <h4 className="font-semibold text-purple-900">Track & Support</h4>
                <p className="text-sm text-purple-800">
                  Monitor your team's growth in the dashboard and help them succeed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Potential */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">💰</div>
            <h4 className="text-lg font-bold text-orange-900">Earnings Potential</h4>
          </div>
          <p className="text-sm text-orange-800 mb-3">
            You earn commissions from your direct referrals AND from your entire team's activity.
            The more you help your team succeed, the more you earn!
          </p>
          <p className="text-xs text-orange-700 font-medium">
            Check your dashboard to track your team's growth and your earnings in real-time.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={onNext}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
