// =============================================
// CEO Video Section Component
// Dashboard welcome video from CEO
// =============================================

'use client';

import { useState, useEffect } from 'react';
import { PlayCircle, X } from 'lucide-react';

export default function CEOVideoSection() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Check if user has dismissed this before
    const dismissed = localStorage.getItem('ceo_video_dismissed');
    if (dismissed === 'true') {
      setHidden(true);
    }
  }, []);

  const handleClose = () => {
    setHidden(true);
  };

  const handleNeverShowAgain = () => {
    localStorage.setItem('ceo_video_dismissed', 'true');
    setHidden(true);
  };

  if (hidden) return null;

  return (
    <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-md max-w-sm">
      {/* Close Button */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute top-2 right-2 z-10 p-1 rounded-full bg-slate-800/50 hover:bg-slate-700/70 transition-colors"
        aria-label="Close video"
      >
        <X className="w-4 h-4 text-white" />
      </button>

      {/* Video Placeholder */}
      <div className="relative aspect-video bg-slate-800">
        {/* Placeholder Image - Replace with actual video thumbnail */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          {/* Play Button Overlay */}
          <button
            type="button"
            className="group flex flex-col items-center gap-2 transition-transform hover:scale-105"
            aria-label="Play welcome video"
          >
            <PlayCircle className="w-12 h-12 text-white drop-shadow-lg group-hover:text-slate-200 transition-colors" />
            <span className="text-white text-xs font-medium drop-shadow-md">
              Watch Welcome
            </span>
          </button>
        </div>
      </div>

      {/* Text Content */}
      <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800">
        <h3 className="text-sm font-bold text-white mb-1">
          Welcome from CEO
        </h3>
        <p className="text-slate-400 text-xs mb-3">
          Building Success Together
        </p>
        <button
          type="button"
          onClick={handleNeverShowAgain}
          className="text-xs text-slate-400 hover:text-slate-300 underline"
        >
          Don't show again
        </button>
      </div>
    </div>
  );
}
