'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SquarePaymentFormProps {
  distributorId: string;
  email: string;
  name: string;
}

export default function SquarePaymentForm({ distributorId, email, name }: SquarePaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardNonce, setCardNonce] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Load Square Web Payments SDK
    const script = document.createElement('script');
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js'; // Use production URL in production
    script.async = true;
    script.onload = initializeSquare;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeSquare = async () => {
    if (!(window as any).Square) {
      console.error('Square.js failed to load');
      return;
    }

    const payments = (window as any).Square.payments(
      process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
      process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
    );

    try {
      const card = await payments.card();
      await card.attach('#card-container');

      // Handle form submission
      const cardButton = document.getElementById('card-button');
      if (cardButton) {
        cardButton.addEventListener('click', async (event) => {
          event.preventDefault();
          await handlePayment(card);
        });
      }
    } catch (e) {
      console.error('Initializing Square Card failed', e);
      setError('Failed to initialize payment form. Please refresh and try again.');
    }
  };

  const handlePayment = async (card: any) => {
    setLoading(true);
    setError('');

    try {
      // Tokenize card
      const result = await card.tokenize();

      if (result.status === 'OK') {
        // Send token to backend to create subscription
        const response = await fetch('/api/payments/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            distributorId,
            email,
            cardNonce: result.token,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Payment failed');
        }

        // Success! Redirect to success page
        router.push('/dashboard/upgrade/success');
      } else {
        throw new Error('Card tokenization failed');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form id="payment-form">
        {/* Card Container */}
        <div id="card-container" className="mb-6"></div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          id="card-button"
          type="button"
          disabled={loading}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : 'Subscribe for $39/month'}
        </button>

        {/* Security Notice */}
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-600">
            🔒 Secured by Square • PCI Compliant
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Your card information is encrypted and never stored on our servers.
          </p>
        </div>

        {/* Billing Info */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-bold text-slate-900 mb-2">Billing Details</h4>
          <div className="space-y-1 text-sm text-slate-600">
            <p>Name: {name}</p>
            <p>Email: {email}</p>
            <p>Amount: $39.00/month</p>
            <p>First charge: Today</p>
            <p>Next charge: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
          </div>
        </div>
      </form>
    </div>
  );
}
