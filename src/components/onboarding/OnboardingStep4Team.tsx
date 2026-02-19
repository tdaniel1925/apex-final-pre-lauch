'use client';

// =============================================
// Onboarding Step 4: Build Your Team
// =============================================

import { useState } from 'react';
import type { Distributor } from '@/lib/types';

interface Step4Props {
  distributor: Distributor;
  onNext: () => void;
  onBack: () => void;
  updateDistributor: (updates: Partial<Distributor>) => void;
}

export default function OnboardingStep4Team({ distributor, onNext, onBack }: Step4Props) {
  const [copied, setCopied] = useState(false);
  const websiteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://reachtheapex.net'}/${distributor.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(websiteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 px-2">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#2B4E7E] mb-2 sm:mb-3">Your Personal Website</h2>
        <p className="text-gray-700 text-base sm:text-lg">
          Share this link to invite prospects to join your team
        </p>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {/* Website Link Section */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Your Website Link:
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 mb-2">
            <div className="flex-1 px-3 sm:px-4 py-3 bg-gray-50 border-2 border-[#2B4E7E] rounded-lg font-mono text-xs sm:text-sm text-[#2B4E7E] truncate">
              {websiteUrl}
            </div>
            <button
              onClick={handleCopy}
              className="px-6 py-3 bg-[#2B4E7E] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
          <p className="text-sm text-gray-600">
            When someone signs up through your website, they're automatically placed in your team
          </p>
        </div>

        {/* Matrix Visualization */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How the 5×7 Forced Matrix Works:
          </h3>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            {/* 5x7 Matrix Diagram */}
            <div className="flex flex-col items-center mb-6">
              {/* Level 1 - You */}
              <div className="mb-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#2B4E7E] rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg">
                  YOU
                </div>
                <div className="text-xs text-center text-gray-600 mt-1">Level 1</div>
              </div>

              {/* Level 2 - 5 positions */}
              <div className="flex gap-2 sm:gap-3 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-1 h-4 bg-blue-300" />
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border-2 border-dashed border-[#2B4E7E] rounded-full flex items-center justify-center text-gray-400 text-xs font-medium shadow" />
                  </div>
                ))}
              </div>

              {/* Level 3 - 25 positions (showing sample) */}
              <div className="flex gap-1 mb-3">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-200 rounded-full" />
                ))}
                <div className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-gray-500 font-bold">...</div>
              </div>

              {/* Levels 4-7 represented as rows */}
              <div className="space-y-2 w-full">
                {[
                  { level: 4, count: 125 },
                  { level: 5, count: 625 },
                  { level: 6, count: 3125 },
                  { level: 7, count: 15625 },
                ].map((item) => (
                  <div key={item.level} className="flex items-center justify-between bg-white rounded px-3 py-1.5 text-xs">
                    <span className="text-gray-600">Level {item.level}</span>
                    <span className="font-semibold text-[#2B4E7E]">{item.count.toLocaleString()} positions</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="text-lg">✅</div>
                <p className="text-gray-700">
                  <strong className="text-[#2B4E7E]">Unlimited Direct Enrollees:</strong> You can personally recruit as many people as you want
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-lg">🎁</div>
                <p className="text-gray-700">
                  <strong className="text-[#2B4E7E]">Spillover Benefit:</strong> When your upline sponsors more than 5 people, the extras automatically "spill over" into your matrix
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-lg">💪</div>
                <p className="text-gray-700">
                  <strong className="text-[#2B4E7E]">Team Effort Pays Off:</strong> Your upline's hard work helps fill your team, and your work helps fill your downline's teams
                </p>
              </div>
            </div>
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
                  Tell them why you joined and share your personal website link
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
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
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
            className="flex-1 px-6 py-3 bg-[#2B4E7E] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
