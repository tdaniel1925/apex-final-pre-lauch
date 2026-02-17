'use client';

// =============================================
// Onboarding Step 6: Next Steps & Completion
// =============================================

import { useState } from 'react';
import type { Distributor } from '@/lib/types';

interface Step6Props {
  distributor: Distributor;
  onNext: () => void;
  onBack: () => void;
  updateDistributor: (updates: Partial<Distributor>) => void;
}

export default function OnboardingStep6NextSteps({ distributor, onNext, onBack }: Step6Props) {
  const [checklist, setChecklist] = useState({
    shareWebsite: false,
    invite3: false,
    completeProfile: distributor.bio ? true : false,
    uploadLicense: false,
    exploreDashboard: false,
  });

  const handleToggle = (key: keyof typeof checklist) => {
    setChecklist({ ...checklist, [key]: !checklist[key] });
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = Object.values(checklist).length;

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 px-2">
        <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🚀</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">You're All Set!</h2>
        <p className="text-white/70 text-base sm:text-lg">
          Here are your next steps to start building your business
        </p>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {/* Success Message */}
        <div className="bg-gradient-to-r from-[#2B4E7E] to-[#DC2626] text-white rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-2">
            🎉 Welcome to the Team, {distributor.first_name}!
          </h3>
          <p className="text-white/90">
            Your account is ready, and you now have all the tools you need to succeed. Let's make
            this journey amazing!
          </p>
        </div>

        {/* Recommended Actions Checklist */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              📋 Recommended Next Steps
            </h3>
            <div className="text-sm text-gray-600 font-medium">
              {completedCount} of {totalCount} completed
            </div>
          </div>

          <div className="space-y-3">
            {/* Share Website */}
            <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
              <input
                type="checkbox"
                checked={checklist.shareWebsite}
                onChange={() => handleToggle('shareWebsite')}
                className="mt-1 w-5 h-5 text-blue-600 rounded"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  Share your replicated website
                </h4>
                <p className="text-sm text-gray-600">
                  Post your personal link on social media to start generating leads
                </p>
              </div>
            </label>

            {/* Invite 3 People */}
            <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
              <input
                type="checkbox"
                checked={checklist.invite3}
                onChange={() => handleToggle('invite3')}
                className="mt-1 w-5 h-5 text-blue-600 rounded"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  Invite your first 3 team members
                </h4>
                <p className="text-sm text-gray-600">
                  Reach out to friends or connections who might be interested
                </p>
              </div>
            </label>

            {/* Complete Profile */}
            <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
              <input
                type="checkbox"
                checked={checklist.completeProfile}
                onChange={() => handleToggle('completeProfile')}
                className="mt-1 w-5 h-5 text-blue-600 rounded"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  Complete your profile 100%
                </h4>
                <p className="text-sm text-gray-600">
                  Add your bio, photo, and social links to build credibility
                </p>
              </div>
            </label>

            {/* Upload License (if licensed) */}
            {distributor.licensing_status === 'licensed' && (
              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.uploadLicense}
                  onChange={() => handleToggle('uploadLicense')}
                  className="mt-1 w-5 h-5 text-blue-600 rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    Upload your insurance license
                  </h4>
                  <p className="text-sm text-gray-600">
                    Get verified to unlock all licensed agent features
                  </p>
                </div>
              </label>
            )}

            {/* Explore Dashboard */}
            <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
              <input
                type="checkbox"
                checked={checklist.exploreDashboard}
                onChange={() => handleToggle('exploreDashboard')}
                className="mt-1 w-5 h-5 text-blue-600 rounded"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  Explore your dashboard
                </h4>
                <p className="text-sm text-gray-600">
                  Familiarize yourself with the tools and features available
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">🔗 Quick Links:</h4>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/dashboard/profile"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              → Complete Profile
            </a>
            <a
              href="/dashboard/team"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              → View My Team
            </a>
            <a
              href="/dashboard/matrix"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              → See Matrix
            </a>
            <a
              href="/dashboard/settings"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              → Account Settings
            </a>
          </div>
        </div>

        {/* Support Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">💬 Need Help?</h4>
          <p className="text-sm text-blue-800">
            If you have questions or need support, reach out to your sponsor or contact our admin
            team. We're here to help you succeed!
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
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#2B4E7E] to-[#DC2626] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            Take Me to Dashboard! 🎉
          </button>
        </div>
      </div>
    </div>
  );
}
