'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import VideoPlayer from '../chatbot/VideoPlayer';
import AudioPlayer from '../chatbot/AudioPlayer';
import InteractiveListBuilder from '../chatbot/InteractiveListBuilder';
import PresentationDeckViewer from '../chatbot/PresentationDeckViewer';

interface JourneyProgress {
  id: string;
  distributor_id: string;
  current_step: number;
  total_points: number;
  started_at: string;
  completed_at: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface JourneyStep {
  id: string;
  distributor_id: string;
  step_number: number;
  step_name: string;
  points_earned: number;
  completed_at: string | null;
  is_completed: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CoachChatProps {
  distributorId: string;
  distributorName: string;
  journeyProgress: JourneyProgress | null;
  journeySteps: JourneyStep[];
  onStepComplete: () => void;
  pendingMessage?: string | null;
  onMessageSent?: () => void;
}

export default function CoachChat({
  distributorId,
  distributorName,
  journeyProgress,
  journeySteps,
  onStepComplete,
  pendingMessage,
  onMessageSent,
}: CoachChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  // Smart auto-scroll: Only scroll if user is at bottom (Intersection Observer pattern)
  useEffect(() => {
    const sentinel = bottomSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setUserScrolledUp(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Smart auto-scroll: only scroll if user is at bottom
  useEffect(() => {
    if (!userScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, userScrolledUp]);

  // Send welcome message on mount
  useEffect(() => {
    if (messages.length === 0 && journeyProgress) {
      const welcomeMessage = journeyProgress.total_points === 0
        ? `Hey ${distributorName}! 👋 Welcome to your Race to 100!\n\nI'm your personal AI coach, and I'm going to help you get to your first sale in 10 simple steps. You'll earn 100 points along the way!\n\n🏃➡️ YOUR PROGRESS: 0/100 points\n\nReady to start? Let's do Step 1!\n\n🎯 STEP 1: Call Your AI Agent (5 points)\n\nYou actually GET an AI agent for your business. When you have the phone number, call it and see what it's like!\n\nAfter you call it, come back and tell me how it went!`
        : `Welcome back, ${distributorName}! 🎉\n\n🏃➡️ YOUR PROGRESS: ${journeyProgress.total_points}/100 points\n\nYou're on Step ${journeyProgress.current_step}! Ready to keep going?`;

      setMessages([{ role: 'assistant', content: welcomeMessage }]);
    }
  }, []);

  // Handle pending message from topic clicks
  useEffect(() => {
    if (pendingMessage && pendingMessage.trim()) {
      setInput(pendingMessage);
      // Auto-send the message
      setTimeout(() => {
        handleSend();
        if (onMessageSent) {
          onMessageSent();
        }
      }, 100);
    }
  }, [pendingMessage]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/race-to-100/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          distributorId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      if (data.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);

        // Check if step was completed
        if (data.stepCompleted) {
          onStepComplete();
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again!',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Parse message content for media and list builder
  const renderMessageContent = (content: string) => {
    const parts = [];
    let currentIndex = 0;

    // Video pattern: [video:URL] - supports both absolute and relative URLs
    const videoRegex = /\[video:([^\]]+)\]/g;
    // Audio pattern: [audio:URL] - supports both absolute and relative URLs
    const audioRegex = /\[audio:([^\]]+)\]/g;
    // List builder pattern: [list_builder:type]
    const listBuilderRegex = /\[list_builder:([^\]]+)\]/g;

    // Combine all patterns - simplified to match any non-bracket content
    const combinedRegex = /\[video:([^\]]+)\]|\[audio:([^\]]+)\]|\[list_builder:([^\]]+)\]/g;

    let match;
    while ((match = combinedRegex.exec(content)) !== null) {
      // Add text before match
      if (match.index > currentIndex) {
        const textBeforeMatch = content.substring(currentIndex, match.index);
        parts.push(
          <div
            key={`text-${currentIndex}`}
            dangerouslySetInnerHTML={{ __html: textBeforeMatch.replace(/\n/g, '<br>') }}
          />
        );
      }

      // Add matched component
      if (match[0].startsWith('[video:')) {
        const url = match[1];
        parts.push(
          <VideoPlayer
            key={`video-${match.index}`}
            url={url}
            distributorId={distributorId}
            videoName="Training Video"
            onComplete={onStepComplete}
          />
        );
      } else if (match[0].startsWith('[audio:')) {
        const url = match[2];
        parts.push(
          <AudioPlayer
            key={`audio-${match.index}`}
            url={url}
            distributorId={distributorId}
            audioName="Training Audio"
            onComplete={onStepComplete}
          />
        );
      } else if (match[0].startsWith('[list_builder:')) {
        const listType = match[3] as 'business_partner' | 'customer';
        parts.push(
          <InteractiveListBuilder
            key={`list-${match.index}`}
            distributorId={distributorId}
            listType={listType}
            onComplete={onStepComplete}
          />
        );
      } else if (match[0] === '[deck_viewer]') {
        parts.push(
          <PresentationDeckViewer
            key={`deck-viewer-${match.index}`}
            distributorId={distributorId}
            onComplete={onStepComplete}
          />
        );
      }

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < content.length) {
      const remainingText = content.substring(currentIndex);
      parts.push(
        <div
          key={`text-${currentIndex}`}
          dangerouslySetInnerHTML={{ __html: remainingText.replace(/\n/g, '<br>') }}
        />
      );
    }

    return parts.length > 0 ? parts : (
      <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }} />
    );
  };

  return (
    <>
      {/* Chat Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-slate-50"
      >
        <style>{`
          .chat-scroll::-webkit-scrollbar { width: 4px; }
          .chat-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
        `}</style>

        <div className="chat-scroll">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-end gap-2 mb-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0
                  ${message.role === 'assistant' ? 'bg-[#2B4C7E] text-white' : 'bg-slate-300 text-slate-600'}
                `}
              >
                {message.role === 'assistant' ? 'AI' : 'Me'}
              </div>

              {/* Message Bubble */}
              <div
                className={`
                  max-w-[75%] px-3.5 py-2.5 text-sm leading-relaxed
                  ${message.role === 'assistant'
                    ? 'bg-white border border-slate-200 rounded-xl rounded-bl-sm text-slate-900'
                    : 'bg-[#2B4C7E] text-white rounded-xl rounded-br-sm'
                  }
                `}
              >
                {renderMessageContent(message.content)}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium bg-[#2B4C7E] text-white flex-shrink-0">
                AI
              </div>
              <div className="bg-white border border-slate-200 rounded-xl rounded-bl-sm px-3.5 py-2.5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}

          {/* Invisible sentinel for Intersection Observer */}
          <div ref={bottomSentinelRef} className="h-px" />
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom button (appears when scrolled up) */}
        {userScrolledUp && (
          <button
            onClick={() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="fixed bottom-32 right-8 w-12 h-12 rounded-full bg-[#2B4C7E] text-white shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center z-30"
            title="Scroll to bottom"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="px-4 py-3 bg-white border-t border-slate-200 flex gap-2 items-end flex-shrink-0 z-10">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2.5 text-sm resize-none bg-white text-slate-900 min-h-[42px] max-h-[100px] outline-none focus:border-[#2B4C7E] transition-colors"
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 100) + 'px';
          }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="px-4 py-2.5 bg-[#2B4C7E] text-white rounded-lg text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-2"
        >
          Send <Send className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
