// =============================================
// Support Page - Bug Reports & Questions
// Users can report bugs, ask questions, and upload screenshots
// =============================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Upload, X, AlertCircle, HelpCircle, Bug, MessageSquare } from 'lucide-react';

type SupportType = 'bug' | 'question' | 'feedback' | 'other';

interface ScreenshotFile {
  file: File;
  preview: string;
}

export default function SupportPage() {
  const [supportType, setSupportType] = useState<SupportType>('question');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [screenshots, setScreenshots] = useState<ScreenshotFile[]>([]);
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newScreenshots: ScreenshotFile[] = files
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, 5 - screenshots.length) // Max 5 images
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

    setScreenshots([...screenshots, ...newScreenshots]);
  };

  // Handle paste from clipboard
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file && screenshots.length < 5) {
          const preview = URL.createObjectURL(file);
          setScreenshots([...screenshots, { file, preview }]);
          setPastedImage(preview);
        }
      }
    }
  };

  // Remove screenshot
  const removeScreenshot = (index: number) => {
    const newScreenshots = screenshots.filter((_, i) => i !== index);
    setScreenshots(newScreenshots);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !description.trim()) {
      alert('Please fill in both subject and description');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload screenshots first if any
      const attachments = [];

      if (screenshots.length > 0) {
        for (const screenshot of screenshots) {
          const formData = new FormData();
          formData.append('file', screenshot.file);

          const uploadResponse = await fetch('/api/support/upload', {
            method: 'POST',
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            attachments.push({
              file_name: screenshot.file.name,
              file_url: uploadData.url,
              file_size_bytes: screenshot.file.size,
              mime_type: screenshot.file.type,
              storage_bucket: uploadData.bucket,
              storage_path: uploadData.path,
            });
          } else {
            console.error('Failed to upload screenshot:', screenshot.file.name);
          }
        }
      }

      // Prepare ticket data
      const ticketData = {
        subject: subject.trim(),
        description: description.trim(),
        ticket_type: supportType,
        browser_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
        },
        device_info: {
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
        },
        attachments,
      };

      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit ticket');
      }

      const ticket = await response.json();
      console.log('Ticket created:', ticket.ticket_number);

      setSubmitSuccess(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setSupportType('question');
        setSubject('');
        setDescription('');
        setScreenshots([]);
        setPastedImage(null);
        setSubmitSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('Error submitting ticket:', error);
      alert(error.message || 'Failed to submit support request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Support Center</h1>
              <p className="text-slate-600 mt-1">
                Report bugs, ask questions, or provide feedback. We're here to help!
              </p>
            </div>
            <Link
              href="/dashboard/support/tickets"
              className="px-4 py-2 border border-[#2B4C7E] text-[#2B4C7E] rounded-lg hover:bg-blue-50 transition-colors"
            >
              View My Tickets
            </Link>
          </div>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-green-900 mb-1">Support Request Submitted!</h3>
                <p className="text-sm text-green-800">
                  Thank you for reaching out. Our team will review your request and get back to you shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Support Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Support Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                What do you need help with? *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setSupportType('bug')}
                  className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                    supportType === 'bug'
                      ? 'border-[#2B4C7E] bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Bug className={`w-6 h-6 ${supportType === 'bug' ? 'text-[#2B4C7E]' : 'text-slate-400'}`} />
                  <span className={`text-sm font-medium ${supportType === 'bug' ? 'text-[#2B4C7E]' : 'text-slate-600'}`}>
                    Bug Report
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSupportType('question')}
                  className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                    supportType === 'question'
                      ? 'border-[#2B4C7E] bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <HelpCircle className={`w-6 h-6 ${supportType === 'question' ? 'text-[#2B4C7E]' : 'text-slate-400'}`} />
                  <span className={`text-sm font-medium ${supportType === 'question' ? 'text-[#2B4C7E]' : 'text-slate-600'}`}>
                    Question
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSupportType('feedback')}
                  className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                    supportType === 'feedback'
                      ? 'border-[#2B4C7E] bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <MessageSquare className={`w-6 h-6 ${supportType === 'feedback' ? 'text-[#2B4C7E]' : 'text-slate-400'}`} />
                  <span className={`text-sm font-medium ${supportType === 'feedback' ? 'text-[#2B4C7E]' : 'text-slate-600'}`}>
                    Feedback
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSupportType('other')}
                  className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                    supportType === 'other'
                      ? 'border-[#2B4C7E] bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <AlertCircle className={`w-6 h-6 ${supportType === 'other' ? 'text-[#2B4C7E]' : 'text-slate-400'}`} />
                  <span className={`text-sm font-medium ${supportType === 'other' ? 'text-[#2B4C7E]' : 'text-slate-600'}`}>
                    Other
                  </span>
                </button>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your issue or question"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onPaste={handlePaste}
                placeholder="Provide detailed information about your issue or question. You can also paste screenshots directly here (Ctrl+V or Cmd+V)."
                rows={8}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                Tip: Press Ctrl+V (or Cmd+V) to paste screenshots directly into this field
              </p>
            </div>

            {/* Screenshot Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Screenshots (Optional)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="screenshot-upload"
                  disabled={screenshots.length >= 5}
                />
                <label
                  htmlFor="screenshot-upload"
                  className={`cursor-pointer ${screenshots.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PNG, JPG, GIF up to 10MB (Max 5 images)
                  </p>
                </label>
              </div>

              {/* Preview uploaded screenshots */}
              {screenshots.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {screenshots.map((screenshot, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={screenshot.preview}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <Link
                href="/dashboard"
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !subject.trim() || !description.trim()}
                className="px-6 py-2 bg-[#2B4C7E] text-white rounded-lg hover:bg-[#1a2c4e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Tips for Better Support</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Be as specific as possible about the issue</li>
                <li>Include screenshots showing the problem</li>
                <li>Mention what you were trying to do when the issue occurred</li>
                <li>Note your browser and device type if relevant</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
