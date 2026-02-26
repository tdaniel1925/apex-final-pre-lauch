'use client';

// =============================================
// Forgot Password Form Component
// =============================================

import { useState, useTransition } from 'react';

export default function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error || 'Something went wrong');
          return;
        }

        setSuccess(true);
      } catch (err) {
        setError('Failed to send reset email. Please try again.');
      }
    });
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h3>
        <p className="text-gray-600 mb-6">
          If an account exists with that email, we've sent you a password reset link.
        </p>
        <p className="text-sm text-gray-500">
          Didn't receive the email? Check your spam folder or{' '}
          <button
            onClick={() => {
              setSuccess(false);
              setError(null);
            }}
            className="text-[#2B4C7E] hover:underline font-medium"
          >
            try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
          disabled={isPending}
        />
      </div>

      {/* Submit Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 px-6 bg-gradient-to-r from-[#2B4C7E] to-[#1a2c4e] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sending Reset Link...
          </span>
        ) : (
          'Send Reset Link'
        )}
      </button>
    </form>
  );
}
