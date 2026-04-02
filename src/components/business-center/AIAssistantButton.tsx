'use client';

import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import AIAssistantModal from './AIAssistantModal';

export default function AIAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);

  // Listen for custom event from AIAssistantCard
  useEffect(() => {
    const handleOpenAIChat = () => {
      setIsOpen(true);
    };

    window.addEventListener('openAIChat', handleOpenAIChat);

    return () => {
      window.removeEventListener('openAIChat', handleOpenAIChat);
    };
  }, []);

  return (
    <>
      {/* Floating Button with Label - Bottom Right */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group"
        aria-label="Open AI Co-Pilot"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="font-semibold text-sm">AI Co-Pilot</span>

        {/* Pulse Animation */}
        <span className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20" />
      </button>

      {/* Modal */}
      <AIAssistantModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
