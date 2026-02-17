'use client';

// =============================================
// Onboarding Step 2: Complete Profile
// =============================================

import { useState } from 'react';
import type { Distributor } from '@/lib/types';

interface Step2Props {
  distributor: Distributor;
  onNext: () => void;
  onBack: () => void;
  updateDistributor: (updates: Partial<Distributor>) => void;
}

export default function OnboardingStep2Profile({
  distributor,
  onNext,
  onBack,
  updateDistributor,
}: Step2Props) {
  const [bio, setBio] = useState(distributor.bio || '');
  const [phone, setPhone] = useState(distributor.phone || '');
  const [facebook, setFacebook] = useState(distributor.social_links?.facebook || '');
  const [linkedin, setLinkedin] = useState(distributor.social_links?.linkedin || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          phone,
          social_links: {
            facebook,
            linkedin,
          },
        }),
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
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">📝</div>
        <h2 className="text-4xl font-bold text-white mb-3">Complete Your Profile</h2>
        <p className="text-white/70 text-lg">
          Help your team and prospects get to know you better
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            About You (Optional)
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Tell us about your background, experience, and what drives you..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            This will appear on your replicated website
          </p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number {phone ? '(Optional)' : ''}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Social Media */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Social Media Links (Optional)
          </h3>

          <div className="space-y-4">
            {/* Facebook */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Facebook</label>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📘</span>
                <input
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/yourusername"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">LinkedIn</label>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💼</span>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/yourusername"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Continue →'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 pt-2">
          You can skip this and complete it later from your profile
        </p>
      </div>
    </div>
  );
}
