'use client';

import { useState } from 'react';

export default function BusinessCenterButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const BUSINESS_CENTER_PRODUCT_ID = '528eea55-21f7-415b-a2ea-ab39b65d6101';

      const response = await fetch('/api/stripe/create-product-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: BUSINESS_CENTER_PRODUCT_ID,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to start checkout. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-shrink-0">
      {error && (
        <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      <button
        onClick={handlePurchase}
        disabled={isLoading}
        className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          'Purchase Business Center'
        )}
      </button>
      <p className="text-xs text-blue-100 mt-3 text-center">
        Secure checkout via Stripe
      </p>
    </div>
  );
}
