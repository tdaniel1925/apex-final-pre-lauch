'use client';

// =============================================
// Onboarding Step 4: Your Replicated Website
// =============================================

import { useState } from 'react';
import type { Distributor } from '@/lib/types';

interface Step4Props {
  distributor: Distributor;
  onNext: () => void;
  onBack: () => void;
  updateDistributor: (updates: Partial<Distributor>) => void;
}

export default function OnboardingStep4Website({
  distributor,
  onNext,
  onBack,
}: Step4Props) {
  const [copied, setCopied] = useState(false);
  const websiteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://theapexway.net'}/${distributor.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(websiteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 px-2">
        <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🌐</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">Your Personal Website</h2>
        <p className="text-white/70 text-base sm:text-lg">
          Every member gets their own branded landing page to share with prospects
        </p>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {/* Website URL Display */}
        <div className="mb-6 sm:mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Your Unique Website URL:
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 px-3 sm:px-4 py-3 bg-gray-50 border-2 border-blue-500 rounded-lg font-mono text-sm sm:text-base text-blue-600 truncate">
              {websiteUrl}
            </div>
            <button
              onClick={handleCopy}
              className="px-6 py-3 bg-gradient-to-r from-[#2B4E7E] to-[#DC2626] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Preview Your Website:
          </h3>
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-8 min-h-[300px]">
            {/* Mini Website Preview */}
            <div className="max-w-md mx-auto text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#2B4E7E] to-[#DC2626] rounded-full mx-auto mb-4 flex items-center justify-center text-2xl text-white font-bold">
                {distributor.first_name[0]}{distributor.last_name[0]}
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                Join {distributor.first_name}'s Team
              </h4>
              <p className="text-gray-600 mb-4">at Apex Affinity Group</p>
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {distributor.licensing_status === 'licensed' ? '📋 Licensed Agent' : '🤝 Distributor'}
              </div>
              <div className="mt-6 space-y-2">
                <div className="h-10 bg-blue-600 rounded-lg" />
                <div className="h-10 bg-white border-2 border-blue-600 rounded-lg" />
              </div>
              <p className="mt-6 text-xs text-gray-500">
                ↑ This is a simplified preview. Click "Visit Website" to see the full page.
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              Visit Your Full Website
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* How to Use */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-green-900 mb-3">💡 How to Use Your Website:</h4>
          <ul className="text-sm text-green-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>Share this link on social media, email, or text messages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>When prospects visit and sign up, they're automatically placed under you</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>Track your referrals and team growth in your dashboard</span>
            </li>
          </ul>
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
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#2B4E7E] to-[#DC2626] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
