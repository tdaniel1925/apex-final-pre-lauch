'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Send, Loader2, Check, AlertCircle, Users } from 'lucide-react';

// Validation schema
const broadcastSchema = z.object({
  broadcast_type: z.enum(['email', 'sms', 'in_app']),
  subject: z.string().optional(),
  content: z.string().min(5, 'Content must be at least 5 characters'),
  send_to_all_downline: z.boolean(),
  send_to_downline_levels: z.array(z.number()).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
});

type BroadcastFormData = z.infer<typeof broadcastSchema>;

interface BroadcastComposerProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BroadcastComposer({ onSuccess, onCancel }: BroadcastComposerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipientCount, setRecipientCount] = useState<number>(0);

  const [formData, setFormData] = useState<BroadcastFormData>({
    broadcast_type: 'email',
    subject: '',
    content: '',
    send_to_all_downline: true,
    send_to_downline_levels: [],
    priority: 'normal',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof BroadcastFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLevelToggle = (level: number) => {
    const levels = formData.send_to_downline_levels || [];
    if (levels.includes(level)) {
      handleChange('send_to_downline_levels', levels.filter((l) => l !== level));
    } else {
      handleChange('send_to_downline_levels', [...levels, level].sort());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    // Validate form data
    const validation = broadcastSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      setValidationErrors(errors);
      return;
    }

    // Email broadcasts require subject
    if (formData.broadcast_type === 'email' && !formData.subject) {
      setValidationErrors({ subject: 'Email broadcasts require a subject line' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/autopilot/team/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send broadcast');
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send broadcast');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Send Team Broadcast</h2>
        </div>

        {/* Broadcast Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Broadcast Type</label>
          <div className="flex gap-3">
            {(['email', 'sms', 'in_app'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleChange('broadcast_type', type)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  formData.broadcast_type === type
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                }`}
              >
                {type === 'email' && 'Email'}
                {type === 'sms' && 'SMS'}
                {type === 'in_app' && 'In-App'}
              </button>
            ))}
          </div>
        </div>

        {/* Subject (Email only) */}
        {formData.broadcast_type === 'email' && (
          <div>
            <label className="block text-sm font-medium mb-2">Subject *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.subject ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email subject"
            />
            {validationErrors.subject && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.subject}</p>
            )}
          </div>
        )}

        {/* Content */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Message Content *
            {formData.broadcast_type === 'sms' && (
              <span className="ml-2 text-gray-500">({formData.content.length}/1600)</span>
            )}
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            rows={6}
            maxLength={formData.broadcast_type === 'sms' ? 1600 : undefined}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.content ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your message..."
          />
          {validationErrors.content && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.content}</p>
          )}
        </div>

        {/* Recipients */}
        <div>
          <label className="block text-sm font-medium mb-2">Send To</label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.send_to_all_downline}
                onChange={(e) => handleChange('send_to_all_downline', e.target.checked)}
                className="mr-2"
              />
              <span>All Downline Members</span>
            </label>

            {!formData.send_to_all_downline && (
              <div className="pl-6 space-y-2">
                <p className="text-sm text-gray-600 mb-2">Select Levels:</p>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleLevelToggle(level)}
                      className={`px-3 py-1 rounded border transition-colors ${
                        (formData.send_to_downline_levels || []).includes(level)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      Level {level}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium mb-2">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <Check className="w-5 h-5 mr-2" />
            <span>Broadcast sent successfully!</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Broadcast
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
