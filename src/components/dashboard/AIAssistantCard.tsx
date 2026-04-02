// =============================================
// AI Assistant Card Component
// Compact AI chat trigger card
// =============================================

'use client';

import { MessageCircle, Sparkles } from 'lucide-react';

export default function AIAssistantCard() {
  const handleClick = () => {
    // Trigger AI chat modal
    const event = new CustomEvent('openAIChat');
    window.dispatchEvent(event);
  };

  return (
    <button
      onClick={handleClick}
      className="bg-gradient-to-br from-red-800 to-red-900 hover:from-red-900 hover:to-red-950 rounded-lg shadow-md border border-red-700 hover:border-red-600 transition-all hover:shadow-lg p-6 h-48 flex flex-col cursor-pointer group"
    >
      {/* Header Icon */}
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-white/10 rounded-full">
          <MessageCircle className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <h3 className="text-base font-bold text-white">
            Apex AI Assistant
          </h3>
          <Sparkles className="w-4 h-4 text-yellow-300" />
        </div>
        <p className="text-xs text-red-200 leading-relaxed">
          Your personal coach to learn, grow, and succeed in your business
        </p>
      </div>

      {/* Footer */}
      <div className="mt-auto text-center">
        <p className="text-xs text-red-300 font-medium">
          Click to start chatting →
        </p>
      </div>
    </button>
  );
}
