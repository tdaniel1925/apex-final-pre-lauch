'use client';

// =============================================
// Send Email Tab - AI-Powered Email Creation
// Chat with AI to create email content
// =============================================

import { useState, useRef, useEffect } from 'react';
import EmailPreview from './EmailPreview';
import RecipientSelector from './RecipientSelector';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SendEmailTabProps {
  adminId: string;
}

export default function SendEmailTab({ adminId }: SendEmailTabProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I can help you create emails to send to your distributors. Just tell me what you want the email to say. For example: "Thank everyone for attending tonight\'s training and remind them to update their phone numbers"',
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [testEmails, setTestEmails] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      // Call AI API to generate email
      const response = await fetch('/api/admin/emails/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userInput,
          conversationHistory: messages,
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

        // Update email preview
        if (data.emailSubject) setEmailSubject(data.emailSubject);
        if (data.emailContent) setEmailContent(data.emailContent);
      } else {
        // Show actual error message
        const errorMsg = data.error || 'Unknown error';
        const details = data.details ? `\n\nDetails: ${data.details}` : '';
        console.error('API Error:', errorMsg, details);

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Sorry, I encountered an error: ${errorMsg}${details}\n\nPlease try again.`,
          },
        ]);
      }
    } catch (error) {
      console.error('Error generating email:', error);
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

  const handleSendTestEmail = async () => {
    if (!emailSubject || !emailContent) {
      alert('Please generate an email first');
      return;
    }

    if (!testEmails.trim()) {
      alert('Please enter at least one test email address');
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/admin/emails/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailSubject,
          htmlContent: emailContent,
          testEmails: testEmails,
          adminId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Test email sent successfully to ${data.sentCount} address(es)!`);
      } else {
        alert(`Error sending test email: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Error sending test email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject || !emailContent || selectedRecipients.length === 0) {
      alert('Please generate an email and select recipients first');
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailSubject,
          htmlContent: emailContent,
          recipientIds: selectedRecipients,
          adminId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Email sent successfully to ${data.sentCount} recipients!`);
        // Reset form
        setMessages([
          {
            role: 'assistant',
            content: 'Email sent! What would you like to send next?',
          },
        ]);
        setEmailSubject('');
        setEmailContent('');
      } else {
        alert(`Error sending email: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side: AI Chat */}
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Email Assistant</h3>

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
              placeholder="Describe the email you want to send..."
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

        {/* Test Email Field */}
        {emailContent && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send Test Email
            </label>
            <input
              type="text"
              value={testEmails}
              onChange={(e) => setTestEmails(e.target.value)}
              placeholder="test@example.com, another@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-[#2c5aa0]"
            />
            <p className="text-xs text-gray-500 mb-3">
              Enter one or more email addresses separated by commas
            </p>
            <button
              onClick={handleSendTestEmail}
              disabled={isSending || !testEmails.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>
        )}

        {/* Recipient Selector */}
        <RecipientSelector
          selectedRecipients={selectedRecipients}
          onRecipientsChange={setSelectedRecipients}
        />

        {/* Send Email Button */}
        {emailContent && (
          <button
            onClick={handleSendEmail}
            disabled={isSending || selectedRecipients.length === 0}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending
              ? 'Sending...'
              : `Send Email to ${selectedRecipients.length} Recipient${selectedRecipients.length !== 1 ? 's' : ''}`
            }
          </button>
        )}
      </div>

      {/* Right Side: Email Preview */}
      <div>
        <EmailPreview
          subject={emailSubject}
          htmlContent={emailContent}
        />
      </div>
    </div>
  );
}
