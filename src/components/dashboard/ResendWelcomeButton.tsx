'use client';

// =============================================
// Resend Welcome Email Button
// Allows users to resend their welcome email
// =============================================

import { useState } from 'react';

interface ResendWelcomeButtonProps {
  variant?: 'user' | 'admin';
  distributorId?: string;
}

export default function ResendWelcomeButton({
  variant = 'user',
  distributorId,
}: ResendWelcomeButtonProps) {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleResend = async () => {
    setIsSending(true);
    setMessage(null);

    try {
      const endpoint =
        variant === 'admin'
          ? `/api/admin/distributors/${distributorId}/resend-welcome`
          : '/api/profile/resend-welcome';

      const response = await fetch(endpoint, {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: result.message || 'Welcome email sent!' });
        // Clear message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({
          type: 'error',
          text: result.message || result.error || 'Failed to send email',
        });
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleResend}
        disabled={isSending}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isSending ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Resend Welcome Email
          </>
        )}
      </button>

      {message && (
        <div
          className={`mt-2 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
