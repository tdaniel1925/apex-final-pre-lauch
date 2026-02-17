'use client';

// =============================================
// Onboarding Step 3: Licensing Setup
// =============================================

import { useState } from 'react';
import type { Distributor } from '@/lib/types';

interface Step3Props {
  distributor: Distributor;
  onNext: () => void;
  onBack: () => void;
  updateDistributor: (updates: Partial<Distributor>) => void;
}

export default function OnboardingStep3Licensing({
  distributor,
  onNext,
  onBack,
}: Step3Props) {
  const isLicensed = distributor.licensing_status === 'licensed';

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 px-2">
        <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">{isLicensed ? '📋' : '🤝'}</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">
          {isLicensed ? 'License Verification' : 'Your Role at Apex'}
        </h2>
        <p className="text-white/70 text-base sm:text-lg">
          {isLicensed
            ? 'As a licensed agent, you have access to advanced features'
            : 'As a non-licensed distributor, you focus on team building and referrals'}
        </p>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {isLicensed ? (
          <>
            {/* Licensed Agent Content */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                📄 Upload Your Insurance License
              </h3>
              <p className="text-gray-600 mb-4">
                To unlock all features, please upload a copy of your active insurance license.
                This will be verified by our admin team.
              </p>

              {/* Upload Area Placeholder */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <div className="text-4xl mb-3">📎</div>
                <p className="text-sm text-gray-600 mb-4">
                  License upload feature coming soon!
                </p>
                <p className="text-xs text-gray-500">
                  For now, you can upload your license from your profile page after onboarding
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">
                ✨ Licensed Agent Benefits:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Access to advanced commission structures</li>
                <li>• Client management tools</li>
                <li>• Lead generation features</li>
                <li>• Direct sales capabilities</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            {/* Non-Licensed Content */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🌟 Your Path to Success
              </h3>
              <p className="text-gray-600 mb-4">
                As a non-licensed distributor, you'll focus on building and growing your network.
                Here's what you can do:
              </p>

              {/* Opportunities */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl">🔗</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Share Your Link</h4>
                    <p className="text-sm text-gray-600">
                      Use your personal referral link to invite others to join
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl">👥</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Build Your Team</h4>
                    <p className="text-sm text-gray-600">
                      Grow your organization and earn from team commissions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl">📚</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Access Training</h4>
                    <p className="text-sm text-gray-600">
                      Use marketing materials and training resources to succeed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Option to Get Licensed */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-900 mb-2">💡 Want More Features?</h4>
              <p className="text-sm text-green-800 mb-2">
                Consider getting your insurance license to unlock advanced features and higher
                earning potential.
              </p>
              <p className="text-xs text-green-700">
                You can change your licensing status anytime from your profile settings.
              </p>
            </div>
          </>
        )}

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
