'use client';

// =============================================
// Send Email Tab - Card-Based Modern Layout
// Clean, symmetric, professional design
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
      content: 'Hi! I can help you create emails to send to your distributors. Just tell me what you want the email to say.',
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
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.aiResponse,
          },
        ]);

        if (data.emailSubject) setEmailSubject(data.emailSubject);
        if (data.emailContent) setEmailContent(data.emailContent);
      } else {
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
        setMessages([
          {
            role: 'assistant',
            content: 'Email sent! What would you like to send next?',
          },
        ]);
        setEmailSubject('');
        setEmailContent('');
        setSelectedRecipients([]);
        setTestEmails('');
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* AI Assistant Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#2c5aa0] to-[#1a3a6e] px-6 py-4">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-lg font-semibold text-white">Create with AI</h3>
            <span className="ml-auto text-sm text-blue-100">Powered by Claude</span>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 h-72 overflow-y-auto mb-4 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-[#2c5aa0] text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
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

          <div className="flex gap-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Describe the email you want to send..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent"
              disabled={isGenerating}
            />
            <button
              onClick={handleSendMessage}
              disabled={isGenerating || !userInput.trim()}
              className="px-8 py-3 bg-[#2c5aa0] text-white rounded-lg font-medium hover:bg-[#1a3a6e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? 'Thinking...' : 'Send'}
            </button>
          </div>

          {emailSubject && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Subject:</span>
                <span>{emailSubject}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout for Test Email and Preview */}
      {emailContent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Email Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-base font-semibold text-white">Send Test Email</h3>
              </div>
            </div>
            <div className="p-6">
              <input
                type="text"
                value={testEmails}
                onChange={(e) => setTestEmails(e.target.value)}
                placeholder="test@example.com, another@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mb-4">
                Enter one or more email addresses separated by commas
              </p>
              <button
                onClick={handleSendTestEmail}
                disabled={isSending || !testEmails.trim()}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSending ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
          </div>

          {/* Preview Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <h3 className="text-base font-semibold text-white">Email Preview</h3>
              </div>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <EmailPreview subject={emailSubject} htmlContent={emailContent} />
            </div>
          </div>
        </div>
      )}

      {/* Recipients and Send Section */}
      {emailContent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recipients Card - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-base font-semibold text-white">Select Recipients</h3>
                {selectedRecipients.length > 0 && (
                  <span className="ml-auto bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {selectedRecipients.length} selected
                  </span>
                )}
              </div>
            </div>
            <div className="p-6">
              <RecipientSelector
                selectedRecipients={selectedRecipients}
                onRecipientsChange={setSelectedRecipients}
              />
            </div>
          </div>

          {/* Send Button Card - Takes 1 column */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#2c5aa0] to-[#1a3a6e] px-6 py-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <h3 className="text-base font-semibold text-white">Ready to Send</h3>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="text-center py-4">
                <div className="text-4xl font-bold text-[#2c5aa0] mb-2">
                  {selectedRecipients.length}
                </div>
                <div className="text-sm text-gray-600">
                  Recipient{selectedRecipients.length !== 1 ? 's' : ''} Selected
                </div>
              </div>
              <button
                onClick={handleSendEmail}
                disabled={isSending || selectedRecipients.length === 0}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {isSending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Email Campaign
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
