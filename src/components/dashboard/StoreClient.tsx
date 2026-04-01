// =============================================
// Store Client Component
// Handle subscription checkout with Stripe
// =============================================

'use client';

import { useState } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';

interface StoreClientProps {
  productId: string;
  distributorId: string;
  productName: string;
  price: string;
  isSubscription: boolean;
}

export default function StoreClient({
  productId,
  distributorId,
  productName,
  price,
  isSubscription,
}: StoreClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call Stripe checkout API for database products
      const response = await fetch('/api/stripe/create-product-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-3 text-xs text-red-600 bg-red-50 px-3 py-2 rounded">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            {isSubscription ? 'Subscribe' : 'Purchase'} Now
          </>
        )}
      </button>
    </div>
  );
}
