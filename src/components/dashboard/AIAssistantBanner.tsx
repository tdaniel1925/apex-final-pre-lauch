'use client';

import { MessageCircle, Sparkles } from 'lucide-react';

export default function AIAssistantBanner() {
  const handleClick = () => {
    // Trigger AI chat modal
    const event = new CustomEvent('openAIChat');
    window.dispatchEvent(event);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full bg-gradient-to-r from-red-800 via-red-900 to-red-800 hover:from-red-900 hover:to-red-950 text-white rounded-lg shadow-md border border-red-700 hover:border-red-600 transition-all duration-300 hover:shadow-lg hover:shadow-red-900/50 cursor-pointer group overflow-hidden"
    >
      <div className="px-6 py-3 flex items-center justify-center gap-4">
        {/* Left Icon */}
        <div className="flex-shrink-0">
          <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <h3 className="text-lg font-bold text-white leading-none m-0">
              Apex Affinity AI Assistant
            </h3>
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <p className="text-sm text-red-200 leading-none m-0">
            Your personal coach to learn, grow, and succeed in your business
          </p>
        </div>

        {/* Right Icon */}
        <div className="flex-shrink-0">
          <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
        </div>
      </div>
    </button>
  );
}
