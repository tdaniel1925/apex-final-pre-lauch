'use client';

// =============================================
// AI Command Center Dashboard v2
// Full-screen chat-based dashboard with sliding sidebar
// Apex blue theme, mobile-first responsive
// =============================================

import { useState, useRef, useEffect } from 'react';
import SlidingSidebar from '@/components/dashboard-v2/SlidingSidebar';
import ChatHeader from '@/components/dashboard-v2/ChatHeader';
import QuickActionBar from '@/components/dashboard-v2/QuickActionBar';
import StatCard from '@/components/dashboard-v2/chat/StatCard';
import ButtonGrid from '@/components/dashboard-v2/chat/ButtonGrid';
import TeamMemberCard from '@/components/dashboard-v2/chat/TeamMemberCard';
import ChartCard from '@/components/dashboard-v2/chat/ChartCard';
import MatrixVisualization from '@/components/dashboard-v2/chat/MatrixVisualization';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  components?: Array<{
    type: 'stats' | 'buttons' | 'team' | 'chart' | 'matrix';
    data: any;
  }>;
}

// Custom markdown renderer
function MarkdownMessage({ content, isUser }: { content: string; isUser: boolean }) {
  return (
    <div className={`markdown-content ${isUser ? 'text-white' : 'text-gray-900'}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold my-2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold my-2" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside my-2 space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-2 space-y-1" {...props} />,
          a: ({ node, ...props }) => (
            <a
              className={`underline ${isUser ? 'text-blue-100 hover:text-white' : 'text-[#2c5aa0] hover:text-[#1a4075]'}`}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          code: ({ node, ...props }: any) => {
            const inline = !(props.className && props.className.includes('language-'));
            return inline ? (
              <code className={`px-1 py-0.5 rounded ${isUser ? 'bg-blue-700' : 'bg-gray-200'}`} {...props} />
            ) : (
              <code className={`block px-3 py-2 rounded my-2 ${isUser ? 'bg-blue-700' : 'bg-gray-200'}`} {...props} />
            );
          },
          p: ({ node, ...props }) => <p className="my-1" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
          em: ({ node, ...props }) => <em className="italic" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function DashboardV2() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 **Hey there!** Welcome to your AI Command Center!\n\n**What can I help with today?**\n• View your team performance\n• Check commission breakdown\n• Show your matrix tree\n• Create meeting registration\n• Generate marketing content\n\nJust ask me anything! 😊",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call AI API
      const response = await fetch('/api/dashboard/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Ensure session cookies are sent
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.error) {
        // Special handling for auth errors
        const errorMessage = data.error === 'Unauthorized'
          ? '🔒 Session expired. Please refresh the page to log in again.'
          : `❌ Error: ${data.error}`;

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: errorMessage,
            timestamp: new Date(),
          },
        ]);
      } else {
        // Display AI response (real data from API)
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        };

        // TODO: Parse AI response for visual component data
        // The AI API should return data in a structured format that can be rendered as cards/charts
        // For now, just show the text response

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '❌ Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
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

  const handleQuickAction = (actionId: string) => {
    const actionMessages: Record<string, string> = {
      team: 'Show me my top team performers',
      earnings: 'Show my commission breakdown',
      stats: 'Show my performance stats',
      events: 'Show upcoming events',
      messages: 'Show recent messages',
      matrix: 'Show my matrix tree',
      training: 'Show available training',
      compliance: 'Check my recent posts for compliance',
    };

    if (actionMessages[actionId]) {
      setInput(actionMessages[actionId]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <SlidingSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName="Alex Martinez"
        userRank="Gold Partner"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <ChatHeader
          onMenuClick={() => setSidebarOpen(true)}
          showNotifications
          notificationCount={3}
        />

        {/* Quick Actions */}
        <QuickActionBar onActionClick={handleQuickAction} />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 space-y-6">
          {messages.map((message, index) => (
            <div key={index} className="animate-fadeInUp">
              {/* Message Bubble */}
              <div
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 md:px-5 py-3 md:py-3.5 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-[#2c5aa0] to-[#1a4075] text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-[#2c5aa0] to-[#1a4075] rounded-full flex items-center justify-center text-xs">
                        ✨
                      </div>
                      <span className="text-xs font-medium text-gray-600">Apex AI</span>
                    </div>
                  )}

                  <MarkdownMessage content={message.content} isUser={message.role === 'user'} />

                  <div
                    className={`text-[10px] md:text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100 text-right' : 'text-gray-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>

              {/* Rich Components */}
              {message.components && (
                <div className="space-y-4 mb-4">
                  {message.components.map((component, idx) => {
                    if (component.type === 'stats') {
                      return (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {component.data.map((stat: any, statIdx: number) => (
                            <StatCard key={statIdx} {...stat} />
                          ))}
                        </div>
                      );
                    }

                    if (component.type === 'team') {
                      return (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {component.data.map((member: any) => (
                            <TeamMemberCard
                              key={member.memberId}
                              {...member}
                              onViewProfile={(id) => console.log('View profile:', id)}
                              onMessage={(id) => console.log('Message:', id)}
                              onCall={(id) => console.log('Call:', id)}
                            />
                          ))}
                        </div>
                      );
                    }

                    if (component.type === 'chart') {
                      return (
                        <ChartCard
                          key={idx}
                          title={component.data.title}
                          description={component.data.description}
                          data={component.data.chartData}
                          type={component.data.type}
                          dataKey={component.data.dataKey}
                          xAxisKey={component.data.xAxisKey}
                        />
                      );
                    }

                    if (component.type === 'matrix') {
                      return (
                        <MatrixVisualization
                          key={idx}
                          rootNode={component.data}
                          onNodeClick={(id) => console.log('Node clicked:', id)}
                        />
                      );
                    }

                    return null;
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start animate-fadeInUp">
              <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#2c5aa0] to-[#1a4075] rounded-full flex items-center justify-center text-xs">
                    ✨
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#2c5aa0] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#2c5aa0] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[#2c5aa0] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-500 ml-1">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-4 md:px-6 py-4 md:py-5 border-t border-gray-200 bg-white">
          <div className="flex gap-2 md:gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything..."
                className="w-full px-4 md:px-5 py-3 md:py-3.5 border-2 border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent transition-all text-sm md:text-base bg-gray-50 focus:bg-white"
                rows={1}
                disabled={isLoading}
                style={{ minHeight: '48px', maxHeight: '120px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-5 md:px-6 py-3 bg-gradient-to-r from-[#2c5aa0] to-[#1a4075] text-white rounded-2xl font-medium hover:from-[#1a4075] hover:to-[#2c5aa0] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center gap-2 min-w-[48px] justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <span className="hidden md:inline">Send</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </div>

          <div className="mt-2 md:mt-3 flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden md:inline">Press Enter to send • Shift+Enter for new line</span>
            <span className="md:hidden">Tap send or press Enter</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
