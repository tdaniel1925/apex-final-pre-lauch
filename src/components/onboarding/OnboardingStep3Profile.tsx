'use client';

// =============================================
// Onboarding Step 3: About You (Bio)
// =============================================

import { useState } from 'react';
import type { Distributor } from '@/lib/types';

interface Step3Props {
  distributor: Distributor;
  onNext: () => void;
  onBack: () => void;
  updateDistributor: (updates: Partial<Distributor>) => void;
}

export default function OnboardingStep3Profile({
  distributor,
  onNext,
  onBack,
  updateDistributor,
}: Step3Props) {
  const [bio, setBio] = useState(distributor.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);

  const handleAIRewrite = async () => {
    if (!bio.trim()) {
      alert('Please write something first, then I can help make it better!');
      return;
    }

    setIsRewriting(true);
    try {
      const response = await fetch('/api/ai/rewrite-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.rewritten) {
          setBio(result.data.rewritten);
        }
      }
    } catch (error) {
      console.error('Error rewriting bio:', error);
    } finally {
      setIsRewriting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          updateDistributor(result.data);
        }
        onNext();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-6 px-2">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#2B4E7E] mb-2">About You</h2>
        <p className="text-gray-700 text-base sm:text-lg">
          This will appear on your website unless you toggle it off
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        {/* Bio */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tell visitors about yourself (Optional)
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            placeholder="Example: I'm a licensed insurance professional with 10 years of experience helping families protect what matters most. I'm passionate about building a team of like-minded individuals..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4E7E] focus:border-transparent resize-none"
          />

          {/* AI Rewrite Button */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Write a draft, then use AI to polish it ✨
            </p>
            <button
              type="button"
              onClick={handleAIRewrite}
              disabled={isRewriting || !bio.trim()}
              className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRewriting ? '✨ Rewriting...' : '✨ AI Rewrite'}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 text-sm mb-1">
            💡 Where does this appear?
          </h4>
          <p className="text-xs text-blue-800">
            Your bio shows on your replicated website to help prospects get to know you. You can hide it or edit it anytime from your profile settings.
          </p>
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
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-6 py-3 bg-[#2B4E7E] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Continue →'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 pt-4">
          You can skip this and add your bio later from your profile
        </p>
      </div>
    </div>
  );
}
