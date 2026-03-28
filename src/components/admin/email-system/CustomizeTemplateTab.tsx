'use client';

// =============================================
// Customize Template Tab - AI Template Editor
// Chat with AI to modify email template design
// =============================================

import { useState, useRef, useEffect } from 'react';
import EmailPreview from './EmailPreview';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CustomizeTemplateTabProps {
  adminId: string;
}

export default function CustomizeTemplateTab({ adminId }: CustomizeTemplateTabProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I can help you customize your email template. You can ask me to change colors, fonts, add sections, modify layouts, or anything else you\'d like. For example: "Make the header background darker blue" or "Add a footer with social media links"',
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load current template on mount
  useEffect(() => {
    loadCurrentTemplate();
  }, []);

  const loadCurrentTemplate = async () => {
    try {
      const response = await fetch('/api/admin/emails/template');
      const data = await response.json();

      if (data.success && data.template) {
        setCurrentTemplate(data.template);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isGenerating) return;

    const newUserMessage: Message = {
      role: 'user',
      content: userInput,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setUserInput('');
    setIsGenerating(true);

    try {
      // Call AI API to modify template
      const response = await fetch('/api/admin/emails/customize-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userInput,
          conversationHistory: messages,
          currentTemplate,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add AI response to chat
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.aiResponse,
          },
        ]);

        // Update template preview
        if (data.updatedTemplate) {
          setCurrentTemplate(data.updatedTemplate);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Sorry, I encountered an error modifying the template. Please try again.',
          },
        ]);
      }
    } catch (error) {
      console.error('Error modifying template:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!currentTemplate) {
      alert('No template to save');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/admin/emails/template', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: currentTemplate,
          adminId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Template saved successfully! All future emails will use this template.');
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Template saved! What else would you like to customize?',
          },
        ]);
      } else {
        alert(`Error saving template: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetTemplate = async () => {
    if (!confirm('Are you sure you want to reset to the default Apex template? This will discard all customizations.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/emails/template/reset', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setCurrentTemplate(data.template);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Template reset to default. What would you like to customize?',
          },
        ]);
      }
    } catch (error) {
      console.error('Error resetting template:', error);
      alert('Error resetting template. Please try again.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side: AI Chat */}
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Template Designer</h3>

          {/* Chat Messages */}
          <div className="bg-white rounded-lg p-4 h-96 overflow-y-auto mb-4 border border-gray-200">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-[#2c5aa0] text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="text-left mb-4">
                <div className="inline-block bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Describe what you want to change..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2c5aa0]"
              disabled={isGenerating}
            />
            <button
              onClick={handleSendMessage}
              disabled={isGenerating || !userInput.trim()}
              className="px-6 py-2 bg-[#2c5aa0] text-white rounded-lg font-medium hover:bg-[#1a3a6e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? 'Generating...' : 'Send'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSaveTemplate}
            disabled={isSaving || !currentTemplate}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Template'}
          </button>
          <button
            onClick={handleResetTemplate}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Reset to Default
          </button>
        </div>
      </div>

      {/* Right Side: Template Preview */}
      <div>
        <EmailPreview
          subject="Template Preview"
          htmlContent={currentTemplate}
        />
      </div>
    </div>
  );
}
