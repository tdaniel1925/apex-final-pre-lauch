// =============================================
// Email Preview Page
// Shows email examples in a branded frame
// =============================================

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { X, ExternalLink } from 'lucide-react';
import { Suspense } from 'react';

function EmailPreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailUrl = searchParams.get('url');
  const title = searchParams.get('title') || 'Email Preview';

  if (!emailUrl) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">No email URL provided</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header with Apex branding */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-white font-semibold">Apex Affinity Group</span>
          </div>
          <div className="h-6 w-px bg-slate-600" />
          <span className="text-slate-300 text-sm">Email Preview: {title}</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={emailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Open Raw
          </a>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Close
          </button>
        </div>
      </div>

      {/* Email iframe */}
      <div className="flex-1 bg-white m-6 rounded-lg shadow-2xl overflow-hidden">
        <iframe
          src={emailUrl}
          title={title}
          className="w-full h-full border-none"
          style={{ minHeight: 'calc(100vh - 120px)' }}
        />
      </div>
    </div>
  );
}

export default function EmailPreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading email preview...</div>
      </div>
    }>
      <EmailPreviewContent />
    </Suspense>
  );
}
