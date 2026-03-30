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
      <div className="text-center mb-4 px-2">
        <div className="text-5xl mb-2">🌐</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#2B4E7E] mb-2">Your Personal Website</h2>
        <p className="text-gray-700 text-base sm:text-lg">
          Share this link to invite prospects to join your team
        </p>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        {/* Website URL Display */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Website Link:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 px-3 py-2 bg-gray-50 border-2 border-[#2B4E7E] rounded-lg font-mono text-sm text-[#2B4E7E] truncate">
              {websiteUrl}
            </div>
            <button
              onClick={handleCopy}
              className="px-6 py-2 bg-[#2B4E7E] text-white font-semibold rounded-lg hover:bg-[#1a3a5f] transition-colors whitespace-nowrap"
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Your Website Preview:</h3>
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#2B4E7E] hover:underline font-medium"
            >
              Visit Full Site →
            </a>
          </div>

          {/* Visual Preview */}
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-white p-6">
            <div className="text-center space-y-4">
              {/* Avatar */}
              <div className="w-20 h-20 bg-[#2B4E7E] rounded-full mx-auto flex items-center justify-center text-3xl text-white font-bold">
                {distributor.first_name[0]}{distributor.last_name[0]}
              </div>

              {/* Headline */}
              <div>
                <h4 className="text-2xl font-bold text-[#2B4E7E] mb-1">
                  Join {distributor.first_name}'s Team
                </h4>
                <p className="text-gray-600">at Apex Affinity Group</p>
              </div>

              {/* Badge */}
              <div className="inline-block px-4 py-2 bg-blue-100 text-[#2B4E7E] rounded-full text-sm font-semibold">
                {distributor.licensing_status === 'licensed' ? '📋 Licensed Agent' : '🤝 Distributor'}
              </div>

              {/* CTA Buttons */}
              <div className="space-y-2 max-w-xs mx-auto">
                <div className="h-12 bg-[#2B4E7E] rounded-lg flex items-center justify-center text-white font-semibold">
                  Join My Team
                </div>
                <div className="h-12 bg-white border-2 border-[#2B4E7E] rounded-lg flex items-center justify-center text-[#2B4E7E] font-semibold">
                  Contact {distributor.first_name}
                </div>
              </div>

              {/* Note */}
              <p className="text-xs text-gray-500 pt-2">
                👆 Preview of your personalized landing page
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-900 text-sm mb-2">💡 Quick Tips:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Share your link on social media and email</li>
            <li>• New signups are automatically placed in your team</li>
            <li>• Track your growth in the dashboard</li>
          </ul>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={onNext}
            className="flex-1 px-6 py-3 bg-[#2B4E7E] text-white font-semibold rounded-lg hover:bg-[#1a3a5f] transition-colors"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
