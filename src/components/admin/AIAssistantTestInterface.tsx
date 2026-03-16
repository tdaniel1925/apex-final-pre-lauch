// =============================================
// AI Assistant Test Interface
// Full-page chat interface with conversation starters
// =============================================

'use client';

import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import CommandConfirmation from './CommandConfirmation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  success?: boolean;
  error?: string;
  data?: any;
}

interface PendingAction {
  action: any;
  message: string;
  originalMessage: string;
}

const CONVERSATION_STARTERS = [
  {
    category: 'Search & Info',
    examples: [
      'Search for distributors in Texas',
      'Find all suspended distributors',
      'Get info for rep #12345',
      'Show me distributors named John Smith',
      'Search for john@email.com',
    ],
  },
  {
    category: 'Move/Transfer Reps',
    examples: [
      'Move rep John Smith under Jane Doe',
      'Change sponsor for rep #12345 to Susan Williams',
      'Transfer distributor john@email.com to sponsor mary@email.com',
    ],
  },
  {
    category: 'Email Management',
    examples: [
      'Change email for John Smith to newemail@example.com',
      'Update rep #12345 email to john.new@email.com',
      'Change distributor email from old@email.com to new@email.com',
    ],
  },
  {
    category: 'Status Changes',
    examples: [
      'Suspend distributor john@email.com',
      'Activate distributor jane@email.com',
      'Delete rep #12345',
      'Suspend rep John Smith for non-payment',
    ],
  },
  {
    category: 'Admin Roles',
    examples: [
      'Make John Smith a super admin',
      'Change rep #12345 to admin role',
      'Remove admin access from jane@email.com',
    ],
  },
  {
    category: 'Password Reset',
    examples: [
      'Reset password for john@email.com',
      'Send password reset to rep #12345',
    ],
  },
];

export default function AIAssistantTestInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI assistant. I can help you manage distributors using plain English commands.\n\nClick any conversation starter below to try it out, or type your own command.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showStarters, setShowStarters] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingAction]);

  const handleSendMessage = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    setShowStarters(false);

    // Add user message to chat
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI assistant');
      }

      const data = await response.json();

      if (data.type === 'confirmation') {
        // Show confirmation UI
        setPendingAction({
          action: data.action,
          message: data.message,
          originalMessage: userMessage,
        });
      } else if (data.type === 'result') {
        // Show result
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.message,
            success: data.success,
            error: data.error,
            data: data.data,
          },
        ]);
      } else if (data.type === 'question') {
        // Regular AI response
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.message,
          },
        ]);
      } else if (data.type === 'error') {
        // Error response
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.message,
            error: data.error,
          },
        ]);
      }
    } catch (error: any) {
      console.error('AI Assistant error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          error: error.message,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    setIsExecuting(true);

    try {
      const response = await fetch('/api/admin/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: pendingAction.originalMessage,
          confirmed: true,
          action: pendingAction.action,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute action');
      }

      const data = await response.json();

      // Clear pending action
      setPendingAction(null);

      // Add result to messages
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          success: data.success,
          error: data.error,
          data: data.data,
        },
      ]);
    } catch (error: any) {
      console.error('Execution error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Failed to execute action. Please try again.',
          error: error.message,
        },
      ]);
      setPendingAction(null);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCancelAction = () => {
    setPendingAction(null);
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: 'Action cancelled.',
      },
    ]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStarterClick = (example: string) => {
    setInput(example);
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat cleared. How can I help you?',
      },
    ]);
    setPendingAction(null);
    setShowStarters(true);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Admin Assistant</h1>
              <p className="text-sm text-gray-600">Powered by Claude AI</p>
            </div>
          </div>
          <button
            onClick={handleClearChat}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((message, index) => (
                <ChatMessage key={index} {...message} />
              ))}

              {/* Pending confirmation */}
              {pendingAction && (
                <CommandConfirmation
                  message={pendingAction.message}
                  onConfirm={handleConfirmAction}
                  onCancel={handleCancelAction}
                  isExecuting={isExecuting}
                />
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a command or question..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows={2}
                  disabled={isLoading || isExecuting}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading || isExecuting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>

        {/* Conversation Starters Sidebar */}
        {showStarters && (
          <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Conversation Starters
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Click any example to try it out
              </p>

              <div className="space-y-6">
                {CONVERSATION_STARTERS.map((category) => (
                  <div key={category.category}>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      {category.category}
                    </h3>
                    <div className="space-y-2">
                      {category.examples.map((example, index) => (
                        <button
                          key={index}
                          onClick={() => handleStarterClick(example)}
                          className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors border border-gray-200 hover:border-blue-300"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-900">
                  <strong>💡 Tip:</strong> You can use names, email addresses, or rep numbers
                  to identify distributors. The AI will ask for clarification if it finds
                  multiple matches.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
