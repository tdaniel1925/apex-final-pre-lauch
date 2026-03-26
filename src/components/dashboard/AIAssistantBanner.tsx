'use client';

import { Sparkles, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import AIModalChat from './AIModalChat';

interface AIAssistantBannerProps {
  firstName?: string;
}

export default function AIAssistantBanner({ firstName = 'there' }: AIAssistantBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread proactive messages count
  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const response = await fetch('/api/dashboard/ai-chat/proactive-messages', {
          credentials: 'include',
        });

        if (response.ok) {
          const { count } = await response.json();
          setUnreadCount(count || 0);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    }

    // Fetch immediately
    fetchUnreadCount();

    // Poll every 60 seconds
    const interval = setInterval(fetchUnreadCount, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleOpenChat = () => {
    setIsModalOpen(true);
    // Reset unread count when opening chat
    setUnreadCount(0);
  };

  return (
    <>
      <div
        onClick={handleOpenChat}
        className="relative bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-lg p-5 mb-6 shadow-xl cursor-pointer transform transition-all hover:scale-[1.01] hover:shadow-2xl overflow-hidden"
      >
        {/* Animated background sparkles */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-3 right-12 animate-pulse">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="absolute top-8 right-32 animate-pulse delay-100">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <div className="absolute top-5 right-64 animate-pulse delay-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between">
          {/* Left side - Icon and Text */}
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <MessageSquare className="w-7 h-7 text-white" />
              {/* Red Badge Notification */}
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[24px] h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10 px-1.5">
                  <span className="text-white text-xs font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white leading-tight flex items-center gap-2">
                ✨ AI Assistant Available
                {unreadCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs animate-pulse">
                    {unreadCount} new {unreadCount === 1 ? 'message' : 'messages'}
                  </span>
                )}
              </h3>
              <p className="text-white/90 text-sm font-medium mt-1">
                Hi {firstName}! I'm here to help answer questions and guide your journey
              </p>
            </div>
          </div>

          {/* Right side - CTA */}
          <div className="hidden md:block">
            <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border-2 border-white/30 hover:bg-white/20 transition-colors">
              <span className="text-white font-bold">Chat Now →</span>
            </div>
          </div>
        </div>

        {/* Pulse animation ring */}
        <div className="absolute inset-0 rounded-lg border-2 border-white/20 animate-pulse-slow" />
      </div>

      {/* AI Chat Modal */}
      <AIModalChat
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
