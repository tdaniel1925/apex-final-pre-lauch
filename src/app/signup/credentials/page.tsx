'use client';

// =============================================
// Credentials Confirmation Page
// Shows username/password after signup before redirecting to welcome
// =============================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CredentialsConfirmationPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<{
    username: string;
    password: string;
    email: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    // Get credentials from sessionStorage
    const storedCredentials = sessionStorage.getItem('signup_credentials');

    if (!storedCredentials) {
      // No credentials found, redirect to signup
      router.push('/signup');
      return;
    }

    try {
      const parsed = JSON.parse(storedCredentials);
      setCredentials(parsed);
    } catch (error) {
      console.error('Failed to parse credentials:', error);
      router.push('/signup');
    }
  }, [router]);

  const handleCopyCredentials = () => {
    if (!credentials) return;

    const text = `Username: ${credentials.username}\nPassword: ${credentials.password}\nEmail: ${credentials.email}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleConfirm = () => {
    // Clear credentials from sessionStorage
    sessionStorage.removeItem('signup_credentials');

    // Redirect to welcome page
    router.push('/welcome');
  };

  if (!credentials) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2B4C7E] to-[#1a2c4e] flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B4C7E] to-[#1a2c4e] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Account Created Successfully!
          </h1>
          <p className="text-lg text-gray-600">
            Welcome to Apex Affinity Group
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">
                Save Your Login Credentials
              </h3>
              <p className="text-sm text-yellow-800">
                Please save your login information below. Your welcome email may take a few minutes to arrive or could go to spam. Having these credentials saved ensures you can log in immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Credentials Display */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-gray-200">
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="bg-white px-4 py-3 rounded-lg border border-gray-300 font-mono text-gray-900">
                {credentials.email}
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="bg-white px-4 py-3 rounded-lg border border-gray-300 font-mono text-gray-900">
                {credentials.username}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="bg-white px-4 py-3 rounded-lg border border-gray-300 font-mono text-gray-900">
                {credentials.password}
              </div>
            </div>

            {/* Your Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Replicated Website
              </label>
              <div className="bg-white px-4 py-3 rounded-lg border border-gray-300">
                <a
                  href={`https://reachtheapex.net/${credentials.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2B4C7E] hover:underline font-medium"
                >
                  reachtheapex.net/{credentials.username}
                </a>
              </div>
            </div>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopyCredentials}
            className="w-full mt-4 py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                Copy All Credentials
              </>
            )}
          </button>
        </div>

        {/* Confirmation Checkbox */}
        <div className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 w-5 h-5 text-[#2B4C7E] focus:ring-[#2B4C7E] rounded cursor-pointer"
            />
            <span className="text-sm text-gray-700 select-none group-hover:text-gray-900">
              I have written down or copied my login credentials and understand that I will need them to access my account.
            </span>
          </label>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleConfirm}
          disabled={!confirmed}
          className="w-full py-4 px-6 bg-gradient-to-r from-[#2B4C7E] to-[#1a2c4e] text-white font-bold text-lg rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Dashboard Setup
        </button>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-4">
          A confirmation email has been sent to <strong>{credentials.email}</strong>
        </p>
      </div>
    </div>
  );
}
