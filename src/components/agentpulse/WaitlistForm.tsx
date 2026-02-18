'use client';

// =============================================
// Waitlist Form Component
// Email signup for AgentPulse early access
// =============================================

import { useState } from 'react';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // TODO: Implement waitlist API endpoint
      // For now, just simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage({
        type: 'success',
        text: "You're on the list! We'll email you when AgentPulse launches with your 50% discount code.",
      });
      setEmail('');
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#2B4C7E] text-white font-semibold rounded-lg hover:bg-[#1e3555] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Joining...' : 'Join Waitlist'}
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <p className="text-xs text-gray-600 text-center">
          🎁 Early access members get 50% off their first month
        </p>
      </form>
    </div>
  );
}
