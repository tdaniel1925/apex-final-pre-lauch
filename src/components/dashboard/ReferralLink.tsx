'use client';

// =============================================
// Referral Link Component
// =============================================

import { useState } from 'react';

interface ReferralLinkProps {
  referralLink: string;
}

export default function ReferralLink({ referralLink }: ReferralLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-[#2B4C7E] to-[#1a2c4e] rounded-xl shadow-md p-6 text-white">
      <h2 className="text-xl font-bold mb-4">Your Referral Link</h2>
      <p className="text-sm opacity-90 mb-4">
        Share this link to invite new distributors to join your team
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={referralLink}
          readOnly
          className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="px-6 py-2 bg-white text-[#2B4C7E] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
