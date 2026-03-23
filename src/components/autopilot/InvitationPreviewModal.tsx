'use client';

/**
 * Invitation Preview Modal
 * Shows preview of meeting invitation email before sending
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, Send, Mail } from 'lucide-react';

interface InvitationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    recipients: Array<{
      recipient_email: string;
      recipient_name: string;
      recipient_phone?: string;
    }>;
    meeting_title: string;
    meeting_description?: string;
    meeting_date_time: string;
    meeting_location?: string;
    meeting_link?: string;
  };
  distributorName: string;
  distributorEmail: string;
  onSendAll: () => void;
}

export default function InvitationPreviewModal({
  isOpen,
  onClose,
  formData,
  distributorName,
  distributorEmail,
  onSendAll,
}: InvitationPreviewModalProps) {
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testEmailSuccess, setTestEmailSuccess] = useState(false);

  // Fetch preview when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPreview();
      setTestEmailSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  const fetchPreview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use first recipient for preview, or default values
      const sampleRecipient = formData.recipients[0] || {
        recipient_name: 'Preview User',
        recipient_email: distributorEmail,
      };

      const response = await fetch('/api/autopilot/invitations/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_name: sampleRecipient.recipient_name,
          recipient_email: sampleRecipient.recipient_email,
          meeting_title: formData.meeting_title,
          meeting_description: formData.meeting_description,
          meeting_date_time: formData.meeting_date_time,
          meeting_location: formData.meeting_location,
          meeting_link: formData.meeting_link,
          distributor_name: distributorName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate preview');
      }

      setSubject(result.subject);
      setPreviewHtml(result.html);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    setError(null);
    setTestEmailSuccess(false);

    try {
      // Use first recipient for test
      const sampleRecipient = formData.recipients[0] || {
        recipient_name: 'Preview User',
        recipient_email: distributorEmail,
      };

      const response = await fetch('/api/autopilot/invitations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_name: sampleRecipient.recipient_name,
          recipient_email: distributorEmail, // Always send to current user
          meeting_title: formData.meeting_title,
          meeting_description: formData.meeting_description,
          meeting_date_time: formData.meeting_date_time,
          meeting_location: formData.meeting_location,
          meeting_link: formData.meeting_link,
          distributor_name: distributorName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send test email');
      }

      setTestEmailSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview Invitation Email</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message for Test Email */}
          {testEmailSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                ✓ Test email sent to {distributorEmail}
              </p>
            </div>
          )}

          {/* Preview Content */}
          {!isLoading && !error && previewHtml && (
            <>
              {/* Subject Line Preview */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Subject:</p>
                <p className="text-sm font-semibold text-slate-900">{subject}</p>
              </div>

              {/* Email Content Preview */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                  <p className="text-xs text-slate-600">
                    Preview (as recipients will see it)
                  </p>
                </div>
                <div className="p-4 max-h-[500px] overflow-y-auto">
                  {/* Render HTML content safely */}
                  <div
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                    className="email-preview-content"
                  />
                </div>
              </div>

              {/* Recipients Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  This invitation will be sent to{' '}
                  <strong>{formData.recipients.length}</strong>{' '}
                  {formData.recipients.length === 1 ? 'recipient' : 'recipients'}
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleSendTest}
            disabled={isSendingTest || isLoading}
          >
            {isSendingTest ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Test Email
              </>
            )}
          </Button>
          <Button onClick={onSendAll} disabled={isLoading}>
            <Send className="w-4 h-4 mr-2" />
            Send to All Recipients
          </Button>
        </DialogFooter>

        <style jsx global>{`
          .email-preview-content {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
              'Helvetica Neue', Arial, sans-serif;
          }
          .email-preview-content table {
            border-collapse: collapse;
          }
          .email-preview-content img {
            max-width: 100%;
            height: auto;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
