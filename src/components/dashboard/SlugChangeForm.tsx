'use client';

// =============================================
// Slug Change Form
// Allow distributors to change their username/slug
// =============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SlugChangeFormProps {
  currentSlug: string;
  siteUrl: string;
}

export default function SlugChangeForm({ currentSlug, siteUrl }: SlugChangeFormProps) {
  const router = useRouter();
  const [newSlug, setNewSlug] = useState(currentSlug);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const checkSlugAvailability = async (slug: string) => {
    if (slug === currentSlug) {
      setIsAvailable(true);
      return;
    }

    if (slug.length < 3) {
      setIsAvailable(false);
      setError('Username must be at least 3 characters');
      return;
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      setIsAvailable(false);
      setError('Username can only contain lowercase letters, numbers, and hyphens');
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch(`/api/check-slug?slug=${encodeURIComponent(slug)}`);
      const data = await response.json();

      setIsAvailable(data.available);
      if (!data.available) {
        setError('This username is already taken');
      }
    } catch (err) {
      setError('Failed to check availability');
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSlugChange = (value: string) => {
    const formattedSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setNewSlug(formattedSlug);
    setIsAvailable(null);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (newSlug === currentSlug) {
      setError('Please enter a different username');
      return;
    }

    if (!isAvailable) {
      setError('Please check if username is available first');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/update-slug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newSlug }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update username');
      }

      setSuccess(`Username updated successfully! Your new link is: ${siteUrl}/${newSlug}`);

      // Refresh the page to show new slug
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Username */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Current Username
        </label>
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-gray-900 font-mono">{currentSlug}</p>
          <p className="text-xs text-gray-600 mt-1">
            Your replicated site: <a href={`${siteUrl}/${currentSlug}`} target="_blank" className="text-blue-600 hover:underline">{siteUrl}/{currentSlug}</a>
          </p>
        </div>
      </div>

      {/* New Username Input */}
      <div>
        <label htmlFor="newSlug" className="block text-sm font-medium text-gray-700 mb-1">
          New Username
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="newSlug"
            value={newSlug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            placeholder="your-username"
          />
          <button
            onClick={() => checkSlugAvailability(newSlug)}
            disabled={isChecking || newSlug === currentSlug || newSlug.length < 3}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? 'Checking...' : 'Check'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Lowercase letters, numbers, and hyphens only. Minimum 3 characters.
        </p>
      </div>

      {/* Availability Status */}
      {isAvailable !== null && newSlug !== currentSlug && (
        <div className={`p-3 rounded-md ${isAvailable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {isAvailable ? (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-800">
                ✓ Username is available!
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-sm text-red-800">
                × Username is not available
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!isAvailable || newSlug === currentSlug || isSaving}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Saving...' : 'Update Username'}
      </button>

      {/* Warning */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> Changing your username will update your replicated website URL. Any old links shared with the previous username will no longer work.
        </p>
      </div>
    </div>
  );
}
