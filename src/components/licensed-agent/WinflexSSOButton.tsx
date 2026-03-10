'use client';

// =============================================
// Winflex SSO Button Component
// Handles SSO form submission to Winflex in new window
// =============================================

import { useState } from 'react';

export default function WinflexSSOButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLaunchWinflex = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch the SSO XML from our API
      const response = await fetch('/api/licensed-agent/winflex-sso');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate SSO credentials');
      }

      const { xml, winflexUrl } = await response.json();

      // Create a hidden form to POST the XML to Winflex
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = winflexUrl;
      form.target = '_blank'; // Open in new window
      form.style.display = 'none';

      // Add the llXML parameter
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'llXML';
      input.value = xml;
      form.appendChild(input);

      // Append to body, submit, and remove
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      setLoading(false);
    } catch (err) {
      console.error('Winflex SSO error:', err);
      setError(err instanceof Error ? err.message : 'Failed to launch Winflex');
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleLaunchWinflex}
        disabled={loading}
        className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Launching Winflex...</span>
          </>
        ) : (
          <>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Launch Winflex Quote Engine</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </>
        )}
      </button>

      <p className="mt-3 text-xs text-center text-gray-500">
        Opens in a new window • Powered by Zinnia Winflex
      </p>
    </div>
  );
}
