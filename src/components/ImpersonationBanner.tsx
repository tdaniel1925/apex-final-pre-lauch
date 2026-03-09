'use client';

// =============================================
// Impersonation Banner
// Shows when admin is impersonating a user
// =============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ImpersonationBanner() {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if impersonating by looking for the cookie
    const checkImpersonation = async () => {
      try {
        const response = await fetch('/api/admin/impersonate-status');
        if (response.ok) {
          const data = await response.json();
          setIsImpersonating(data.isImpersonating);
        }
      } catch (error) {
        console.error('Error checking impersonation status:', error);
      }
    };

    checkImpersonation();
  }, []);

  const handleExitImpersonation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/exit-impersonate', {
        method: 'POST',
      });

      if (response.ok) {
        // Redirect to admin after exiting
        router.push('/admin/distributors');
        router.refresh();
      } else {
        const error = await response.json();
        console.error('Exit impersonation error:', error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error exiting impersonation:', error);
      setLoading(false);
    }
  };

  if (!isImpersonating) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-600 text-white px-4 py-2 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-sm font-semibold">
            You are currently impersonating this user
          </span>
        </div>
        <button
          onClick={handleExitImpersonation}
          disabled={loading}
          className="px-4 py-1.5 bg-white text-orange-600 rounded-md text-sm font-semibold hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Exiting...' : 'Exit Impersonation'}
        </button>
      </div>
    </div>
  );
}
