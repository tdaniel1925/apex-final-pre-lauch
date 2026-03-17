'use client';

// =============================================
// Copy Referral Link Button
// Client component for clipboard interaction
// =============================================

import { ArrowRight, Link as LinkIcon } from 'lucide-react';

interface CopyReferralButtonProps {
  slug: string;
}

export default function CopyReferralButton({ slug }: CopyReferralButtonProps) {
  const handleCopy = () => {
    const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3050'}/${slug}`;
    navigator.clipboard.writeText(referralLink);
  };

  return (
    <button
      type="button"
      className="group bg-white rounded-lg shadow-md p-6 border border-slate-200 hover:border-slate-400 hover:shadow-lg transition-all text-left"
      onClick={handleCopy}
    >
      <div className="flex items-center justify-between">
        <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
          <LinkIcon className="w-6 h-6 text-slate-700" />
        </div>
        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        Share Referral Link
      </h3>
      <p className="text-sm text-slate-600 mt-1">
        Copy to clipboard
      </p>
    </button>
  );
}
