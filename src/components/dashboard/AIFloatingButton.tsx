'use client';

// =============================================
// AI Floating Button Component
// Modern floating action button that triggers the AI chat modal
// Features: Sparkle icon, pulsing animation, tooltip on hover
// =============================================

import { useState } from 'react';
import AIModalChat from './AIModalChat';

interface AIFloatingButtonProps {
  initialContext?: {
    firstName: string;
    currentRank: string;
    personalBV: number;
    teamCount: number;
    monthlyCommissions: number;
    recentJoins: number;
    nextRank: string | null;
    personalProgress: number;
  };
}

export default function AIFloatingButton({ initialContext }: AIFloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Floating Button with Tooltip */}
      <button
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-6 right-6 z-40 group"
        aria-label="Open AI Assistant"
      >
        <div className="relative">
          {/* Pulsing Glow Effect */}
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-75 blur-lg group-hover:opacity-100 animate-pulse"></div>

          {/* Main Button */}
          <div className="relative w-16 h-16 md:w-18 md:h-18 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-full shadow-2xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-active:scale-95">
            {/* Sparkle Icon */}
            <div className={`text-3xl md:text-4xl transform transition-transform duration-300 ${isHovered ? 'rotate-12 scale-110' : ''}`}>
              ✨
            </div>
          </div>
        </div>

        {/* Tooltip */}
        <div
          className={`absolute bottom-full right-0 mb-3 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-xl whitespace-nowrap transform transition-all duration-200 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          Ask Apex AI
          {/* Tooltip Arrow */}
          <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </button>

      {/* Modal Chat */}
      <AIModalChat isOpen={isOpen} onClose={() => setIsOpen(false)} initialContext={initialContext} />
    </>
  );
}
