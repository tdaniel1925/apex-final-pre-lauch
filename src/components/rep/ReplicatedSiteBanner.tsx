'use client';

import { useState } from 'react';

interface ReplicatedSiteBannerProps {
  slug: string;
}

export default function ReplicatedSiteBanner({ slug }: ReplicatedSiteBannerProps) {
  const [copied, setCopied] = useState(false);

  const replicatedUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${slug}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(replicatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#1B3A7D] to-[#0F2045] text-white px-4 py-2 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Your Replicated Site:</span>
            <span className="font-mono opacity-90">{replicatedUrl}</span>
          </div>
        </div>

        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
