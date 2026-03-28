'use client';

// =============================================
// AI Chat Modal - Full Screen Overlay
// With Chat History Sidebar like ChatGPT
// =============================================

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, Plus, MessageSquare, Trash2, Users, DollarSign, Network, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import MermaidDiagram from '../MermaidDiagram';
import VideoPlayer from '../chatbot/VideoPlayer';
import AudioPlayer from '../chatbot/AudioPlayer';
import InteractiveListBuilder from '../chatbot/InteractiveListBuilder';
import { parseMediaContent } from '@/lib/chatbot/parse-media';
import AIToolsAccordion from './AIToolsAccordion';
import type { Topic } from '@/lib/ai-copilot/tools-reference';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'ai-chat-sessions';

// Component to render message content with media support
function MessageContent({ content }: { content: string }) {
  // Check for Mermaid diagrams
  if (content.includes('```mermaid')) {
    // Extract mermaid code from markdown fence
    const mermaidMatch = content.match(/```mermaid\n([\s\S]*?)\n```/);
    if (mermaidMatch) {
      const chart = mermaidMatch[1];
      return <MermaidDiagram chart={chart} />;
    }
  }

  // Parse for media content
  const segments = parseMediaContent(content);

  // If no media, just render markdown
  if (segments.length === 1 && segments[0].type === 'text') {
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    );
  }

  // Render mixed content (text + media)
  return (
    <div className="space-y-2">
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return (
            <div key={index}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {segment.content}
              </ReactMarkdown>
            </div>
          );
        } else if (segment.type === 'video') {
          return (
            <VideoPlayer
              key={index}
              url={segment.url!}
              videoName={segment.name}
              onComplete={() => {
                console.log('Video completed:', segment.name);
              }}
            />
          );
        } else if (segment.type === 'audio') {
          return (
            <AudioPlayer
              key={index}
              url={segment.url!}
              audioName={segment.name}
              onComplete={() => {
                console.log('Audio completed:', segment.name);
              }}
            />
          );
        }
        return null;
      })}
    </div>
  );
}

export default function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current session
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  // Load sessions from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const sessions = parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }));
        setSessions(sessions);

        // Load most recent session or create new one
        if (sessions.length > 0) {
          setCurrentSessionId(sessions[0].id);
        } else {
          createNewChat();
        }
      } else {
        createNewChat();
      }
    }
  }, [isOpen]);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  // Create new chat session
  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [
        {
          role: 'assistant',
          content: "👋 **Hey there!** Welcome to your AI Command Center!\n\n**What can I help with today?**\n• View your team performance\n• Check commission breakdown\n• Show your matrix tree\n• Create meeting registration\n• Generate marketing content\n\nJust ask me anything!",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  // Generate a descriptive title for the chat using AI
  const generateChatTitle = async (messages: Message[]): Promise<string> => {
    try {
      // Get first few messages for context (up to 3 exchanges)
      const contextMessages = messages.slice(0, 6).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/dashboard/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: [
            ...contextMessages,
            {
              role: 'user',
              content: 'Generate a very short title (3-5 words max) that describes this conversation. Just respond with the title, no explanation.',
            },
          ],
        }),
      });

      const data = await response.json();
      if (data.message) {
        // Clean up the response and limit to 40 chars
        let title = data.message.replace(/^["']|["']$/g, '').trim();
        return title.slice(0, 40) + (title.length > 40 ? '...' : '');
      }
    } catch (error) {
      console.error('Failed to generate title:', error);
    }

    // Fallback to first user message
    const firstUserMsg = messages.find(m => m.role === 'user');
    if (firstUserMsg) {
      return firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? '...' : '');
    }

    return 'New Chat';
  };

  // Update current session's messages
  const updateMessages = (newMessages: Message[]) => {
    if (!currentSessionId) return;

    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: newMessages,
          updatedAt: new Date(),
        };
      }
      return session;
    }));

    // Generate title after AI responds (when we have at least 2 messages)
    if (newMessages.length >= 2) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session?.title === 'New Chat') {
        generateChatTitle(newMessages).then(title => {
          setSessions(prev => prev.map(s =>
            s.id === currentSessionId ? { ...s, title } : s
          ));
        });
      }
    }
  };

  // Delete a chat session
  const deleteChat = (id: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);

      // If deleting current session, switch to another or create new
      if (id === currentSessionId) {
        if (filtered.length > 0) {
          setCurrentSessionId(filtered[0].id);
        } else {
          createNewChat();
        }
      }

      return filtered;
    });
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  // Prevent scroll on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSend = async (retryCount = 0) => {
    if (!input.trim() || isLoading || !currentSessionId) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    updateMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/dashboard/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      // Handle HTTP errors
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('SESSION_EXPIRED');
        } else if (response.status === 429) {
          throw new Error('RATE_LIMIT');
        } else if (response.status >= 500) {
          throw new Error('SERVER_ERROR');
        }
        throw new Error('HTTP_ERROR');
      }

      const data = await response.json();

      // Validate response
      if (!data || typeof data !== 'object') {
        throw new Error('INVALID_RESPONSE');
      }

      if (data.error) {
        // Handle specific errors
        let errorMessage = '❌ Something went wrong. Please try again.';

        if (data.error === 'Unauthorized' || data.error.includes('Session')) {
          errorMessage = '🔒 Your session has expired. Please refresh the page and log in again.';
        } else if (data.error.includes('member profile')) {
          errorMessage = '👤 Could not load your profile. This might be a temporary issue. Please try again or contact support if it persists.';
        } else if (data.error.includes('rate limit')) {
          errorMessage = '⏱️ Too many requests. Please wait a moment and try again.';
        } else {
          errorMessage = `❌ ${data.error}`;
        }

        updateMessages([
          ...updatedMessages,
          {
            role: 'assistant',
            content: errorMessage,
            timestamp: new Date(),
          },
        ]);
      } else if (data.message && typeof data.message === 'string') {
        // Success - valid message
        updateMessages([
          ...updatedMessages,
          {
            role: 'assistant',
            content: data.message,
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error('NO_MESSAGE');
      }
    } catch (error: any) {
      console.error('AI Chat Error:', error);

      let errorMessage = '❌ Network error. Please check your connection and try again.';

      if (error.message === 'SESSION_EXPIRED') {
        errorMessage = '🔒 Your session has expired. Please refresh the page and log in again.';
      } else if (error.message === 'RATE_LIMIT') {
        errorMessage = '⏱️ Too many requests. Please wait a moment before trying again.';
      } else if (error.message === 'SERVER_ERROR') {
        errorMessage = '🔧 The server is temporarily unavailable. Please try again in a moment.';
      } else if (error.message === 'INVALID_RESPONSE' || error.message === 'NO_MESSAGE') {
        errorMessage = '⚠️ Received an invalid response. Please try again.';
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = '🌐 Network connection failed. Please check your internet and try again.';
      }

      // Retry logic for network errors (max 2 retries)
      if (retryCount < 2 && (error.name === 'TypeError' || error.message === 'SERVER_ERROR')) {
        console.log(`Retrying... Attempt ${retryCount + 1}/2`);
        setTimeout(() => {
          // Re-send with retry count
          setInput(userMessage.content);
          setIsLoading(false);
        }, 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }

      updateMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: errorMessage,
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

  // Quick action buttons
  const quickActions = [
    {
      icon: <Users className="w-3 h-3" />,
      label: 'My Team',
      prompt: 'Show me my team performance overview with member count and recent activity',
    },
    {
      icon: <DollarSign className="w-3 h-3" />,
      label: 'Commissions',
      prompt: 'Show me my commission breakdown for this month',
    },
    {
      icon: <Network className="w-3 h-3" />,
      label: 'Matrix Tree',
      prompt: 'Show my genealogy tree with my organization structure',
    },
    {
      icon: <TrendingUp className="w-3 h-3" />,
      label: 'Rank Progress',
      prompt: 'What are my requirements to reach the next rank and how close am I?',
    },
    {
      icon: <Calendar className="w-3 h-3" />,
      label: 'Meeting',
      prompt: 'Help me create a meeting registration link for prospects',
    },
    {
      icon: <Sparkles className="w-3 h-3" />,
      label: 'Content',
      prompt: 'Generate social media content to help me recruit new team members',
    },
  ];

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const handleTopicClick = (topic: Topic) => {
    // Auto-send the prompt
    setInput(topic.prompt);
    // Optionally auto-send (uncomment if you want instant send)
    // handleSend(topic.prompt);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-7xl h-[95vh] bg-white rounded-lg shadow-2xl flex"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Chat History Sidebar */}
          {showHistory && (
            <div className="w-56 border-r border-gray-200 flex flex-col bg-gray-50">
              {/* New Chat Button */}
              <div className="p-2 border-b border-gray-200">
                <button
                  onClick={createNewChat}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span className="text-xs font-medium">New Chat</span>
                </button>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto p-1.5">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group flex items-center gap-1.5 px-2 py-1.5 mb-1 rounded-md cursor-pointer transition-colors ${
                      session.id === currentSessionId
                        ? 'bg-blue-100 border border-blue-200'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setCurrentSessionId(session.id)}
                  >
                    <MessageSquare className="w-3 h-3 text-gray-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-gray-900 truncate leading-tight">
                        {session.title}
                      </p>
                      <p className="text-[9px] text-gray-500 leading-tight">
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 rounded transition-all"
                    >
                      <Trash2 className="w-2.5 h-2.5 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title={showHistory ? 'Hide history' : 'Show history'}
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">AI Command Center</h2>
                  <p className="text-[10px] text-gray-600 truncate max-w-xs">{currentSession?.title || 'New Chat'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Messages - Scrollable */}
            <div className="flex-1 overflow-y-auto px-3 py-2 bg-gray-50">
              <div className="max-w-5xl mx-auto space-y-1">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-md px-3 py-1.5 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white border border-gray-200 shadow-sm'
                      }`}
                    >
                      <div className={`text-xs ${message.role === 'user' ? 'text-white' : 'text-gray-900'}`}>
                        <MessageContent content={message.content} />
                      </div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 shadow-sm rounded-md px-2 py-1">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-white">
              {/* Quick Action Buttons */}
              <div className="px-3 pt-2 pb-1 border-b border-gray-100">
                <div className="max-w-5xl mx-auto overflow-x-auto scrollbar-hide">
                  <div className="flex gap-1.5 pb-1">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(action.prompt)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-full transition-all text-blue-700 hover:shadow-sm"
                        title={action.prompt}
                      >
                        {action.icon}
                        <span className="text-[10px] font-medium whitespace-nowrap">
                          {action.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="px-3 py-2">
                <div className="max-w-5xl mx-auto flex gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none text-xs"
                    rows={1}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs transition-colors"
                  >
                    {isLoading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Tools Accordion Sidebar (Right) */}
          <AIToolsAccordion onTopicClick={handleTopicClick} />
        </div>
      </div>

      <style jsx global>{`
        .delay-100 {
          animation-delay: 100ms;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}
