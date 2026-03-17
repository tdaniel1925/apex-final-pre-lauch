// =============================================
// CEO Video Section Component
// Dashboard welcome video from CEO
// =============================================

'use client';

import { PlayCircle } from 'lucide-react';

export default function CEOVideoSection() {
  return (
    <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-lg">
      {/* Video Placeholder */}
      <div className="relative aspect-video bg-slate-800">
        {/* Placeholder Image - Replace with actual video thumbnail */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          {/* Play Button Overlay */}
          <button
            type="button"
            className="group flex flex-col items-center gap-3 transition-transform hover:scale-105"
            aria-label="Play welcome video"
          >
            <PlayCircle className="w-20 h-20 text-white drop-shadow-lg group-hover:text-slate-200 transition-colors" />
            <span className="text-white text-sm font-medium drop-shadow-md">
              Watch Welcome Message
            </span>
          </button>
        </div>
      </div>

      {/* Text Content */}
      <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800">
        <h2 className="text-2xl font-bold text-white mb-2">
          Welcome Message from CEO
        </h2>
        <p className="text-slate-300 text-sm">
          Building Success Together
        </p>
      </div>
    </div>
  );
}
