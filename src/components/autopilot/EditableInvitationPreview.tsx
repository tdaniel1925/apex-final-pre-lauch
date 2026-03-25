'use client';

/**
 * Editable Invitation Preview Modal
 * Shows preview of meeting invitation with inline editing capability
 * Allows editing subject and body before sending
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
import { Loader2, Send, Mail, Edit2, Check, X, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface EditableInvitationPreviewProps {
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
  onSendAll: (customizations?: { subject?: string; bodyHtml?: string }) => void;
}

export default function EditableInvitationPreview({
  isOpen,
  onClose,
  formData,
  distributorName,
  distributorEmail,
  onSendAll,
}: EditableInvitationPreviewProps) {
  const [originalSubject, setOriginalSubject] = useState<string>('');
  const [originalHtml, setOriginalHtml] = useState<string>('');
  const [editedSubject, setEditedSubject] = useState<string>('');
  const [editedHtml, setEditedHtml] = useState<string>('');
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [isEditingBody, setIsEditingBody] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testEmailSuccess, setTestEmailSuccess] = useState(false);
  const [hasEdits, setHasEdits] = useState(false);

  // Fetch preview when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPreview();
      setTestEmailSuccess(false);
      setError(null);
      setHasEdits(false);
      setIsEditingSubject(false);
      setIsEditingBody(false);
    }
  }, [isOpen]);

  const fetchPreview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use first recipient for preview
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

      setOriginalSubject(result.subject);
      setOriginalHtml(result.html);
      setEditedSubject(result.subject);
      setEditedHtml(result.html);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSubject = () => {
    setIsEditingSubject(false);
    setHasEdits(editedSubject !== originalSubject || editedHtml !== originalHtml);
  };

  const handleCancelSubject = () => {
    setEditedSubject(originalSubject);
    setIsEditingSubject(false);
  };

  const handleSaveBody = () => {
    setIsEditingBody(false);
    setHasEdits(editedSubject !== originalSubject || editedHtml !== originalHtml);
  };

  const handleCancelBody = () => {
    setEditedHtml(originalHtml);
    setIsEditingBody(false);
  };

  const handleResetAll = () => {
    setEditedSubject(originalSubject);
    setEditedHtml(originalHtml);
    setHasEdits(false);
    setIsEditingSubject(false);
    setIsEditingBody(false);
    toast.success('Reset to original template');
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    setError(null);
    setTestEmailSuccess(false);

    try {
      const sampleRecipient = formData.recipients[0] || {
        recipient_name: 'Preview User',
        recipient_email: distributorEmail,
      };

      const response = await fetch('/api/autopilot/invitations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_name: sampleRecipient.recipient_name,
          recipient_email: distributorEmail,
          meeting_title: formData.meeting_title,
          meeting_description: formData.meeting_description,
          meeting_date_time: formData.meeting_date_time,
          meeting_location: formData.meeting_location,
          meeting_link: formData.meeting_link,
          distributor_name: distributorName,
          // Include custom edits if any
          custom_subject: hasEdits ? editedSubject : undefined,
          custom_html: hasEdits ? editedHtml : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send test email');
      }

      setTestEmailSuccess(true);
      toast.success(`Test email sent to ${distributorEmail}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send test email';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendToAll = () => {
    if (hasEdits) {
      onSendAll({
        subject: editedSubject,
        bodyHtml: editedHtml,
      });
    } else {
      onSendAll();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Preview & Edit Invitation Email
            {hasEdits && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">
                Edited
              </span>
            )}
          </DialogTitle>
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
          {!isLoading && !error && editedSubject && (
            <>
              {/* Subject Line Editing */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500">Subject Line:</p>
                  <div className="flex gap-2">
                    {!isEditingSubject && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingSubject(true)}
                        className="h-7 px-2"
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>

                {isEditingSubject ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editedSubject}
                      onChange={(e) => setEditedSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Email subject line"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveSubject}
                        className="h-7 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelSubject}
                        className="h-7"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-slate-900">{editedSubject}</p>
                )}
              </div>

              {/* Email Body Editing */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                  <p className="text-xs text-slate-600">
                    Email Body (as recipients will see it)
                  </p>
                  <div className="flex gap-2">
                    {!isEditingBody && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingBody(true)}
                        className="h-7 px-2"
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit HTML
                      </Button>
                    )}
                  </div>
                </div>

                {isEditingBody ? (
                  <div className="p-4 space-y-2">
                    <textarea
                      value={editedHtml}
                      onChange={(e) => setEditedHtml(e.target.value)}
                      className="w-full h-[400px] px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                      placeholder="HTML content"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveBody}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Save HTML
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelBody}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 max-h-[600px] overflow-y-auto bg-slate-50">
                    {/* Full Message Preview */}
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
                      <div
                        dangerouslySetInnerHTML={{ __html: editedHtml }}
                        className="email-preview-content"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Recipients Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  This invitation will be sent to{' '}
                  <strong>{formData.recipients.length}</strong>{' '}
                  {formData.recipients.length === 1 ? 'recipient' : 'recipients'}
                  {hasEdits && ' with your customizations'}
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {hasEdits && (
            <Button variant="outline" onClick={handleResetAll} className="text-orange-600">
              Reset to Original
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
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
          <Button onClick={handleSendToAll} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
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
