'use client';

import { useState } from 'react';
import { ShoppingCart, Loader2, Zap } from 'lucide-react';

interface PulseProductCardProps {
  productSlug: 'pulsemarket' | 'pulseflow' | 'pulsedrive' | 'pulsecommand';
  name: string;
  description: string;
  memberPrice: number;
  retailPrice: number;
  qv: number;
  bv: number;
  features: string[];
  imageUrl?: string;
}

export default function PulseProductCard({
  productSlug,
  name,
  description,
  memberPrice,
  retailPrice,
  qv,
  bv,
  features,
  imageUrl,
}: PulseProductCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call Stripe checkout API with member pricing
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productSlug,
          priceType: 'member', // Member pricing for reps
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

  const savings = retailPrice - memberPrice;
  const savingsPercent = Math.round((savings / retailPrice) * 100);

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center">
          <Zap className="w-16 h-16 text-white opacity-50" />
        </div>
      )}

      {/* Product Info */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900 mb-2">{name}</h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>

        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-3xl font-bold text-slate-900">
              ${memberPrice}
            </span>
            <span className="text-lg text-slate-400 line-through">
              ${retailPrice}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
              Save {savingsPercent}% • Member Price
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Earn {qv} QV • ${bv.toFixed(2)} BV
          </p>
        </div>

        {/* Features */}
        <ul className="mb-4 space-y-2">
          {features.slice(0, 3).map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Error Message */}
        {error && (
          <div className="mb-3 text-xs text-red-600 bg-red-50 px-3 py-2 rounded">
            {error}
          </div>
        )}

        {/* Purchase Button */}
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              Purchase at Member Price
            </>
          )}
        </button>

        <p className="text-xs text-center text-slate-500 mt-2">
          One-time purchase • Instant access
        </p>
      </div>
    </div>
  );
}
