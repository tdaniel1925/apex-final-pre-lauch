// =============================================
// EMAIL TRANSACTION TESTS
// =============================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  sendEmailWithRollback,
  processEmailRetryQueue,
  getEmailRetryStats,
} from '@/lib/email/email-transaction';

// Mock Supabase client
const mockInsert = vi.fn(() => ({
  select: vi.fn(() => ({
    single: vi.fn(() => ({
      data: { id: 'queue-123' },
      error: null,
    })),
  })),
}));

const mockRpc = vi.fn((funcName) => {
  if (funcName === 'get_pending_email_retries') {
    return Promise.resolve({
      data: [
        {
          id: 'email-1',
          email_type: 'invitation',
          recipient_email: 'test@example.com',
          recipient_name: 'Test User',
          subject: 'Test Email',
          html_body: '<p>Test</p>',
          text_body: 'Test',
          from_email: 'theapex@theapexway.net',
          from_name: 'Apex',
          reply_to: null,
          retry_count: 0,
          max_retries: 3,
        },
      ],
      error: null,
    });
  }
  if (funcName === 'increment_email_retry' || funcName === 'mark_email_sent') {
    return Promise.resolve({ data: null, error: null });
  }
  return Promise.resolve({ data: null, error: null });
});

const mockUpdate = vi.fn(() => ({
  eq: vi.fn(() => ({
    data: null,
    error: null,
  })),
}));

const mockSelect = vi.fn(() => ({
  in: vi.fn(() => ({
    data: [
      { status: 'pending' },
      { status: 'pending' },
      { status: 'sent' },
      { status: 'failed' },
    ],
    error: null,
  })),
}));

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn((table) => ({
      insert: mockInsert,
      update: mockUpdate,
      select: mockSelect,
    })),
    rpc: mockRpc,
  })),
}));

// Mock Resend - must be hoisted
vi.mock('resend', () => {
  const mockSend = vi.fn();
  return {
    Resend: class {
      emails = {
        send: mockSend,
      };
    },
  };
});

// Import after mocking
import { Resend } from 'resend';
const mockResendSend = new Resend('test-key').emails.send as any;

describe('Email Transaction System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendEmailWithRollback', () => {
    it('should send email successfully and call onStatusUpdate', async () => {
      // Mock successful send
      mockResendSend.mockResolvedValue({
        data: { id: 'resend-123' },
        error: null,
      });

      const onStatusUpdate = vi.fn();

      const result = await sendEmailWithRollback({
        to: 'user@example.com',
        toName: 'John Doe',
        subject: 'Welcome',
        html: '<p>Welcome!</p>',
        emailType: 'welcome',
        onStatusUpdate,
      });

      expect(result.success).toBe(true);
      expect(result.emailId).toBe('resend-123');
      expect(onStatusUpdate).toHaveBeenCalledWith('pending');
      expect(onStatusUpdate).toHaveBeenCalledWith('sent', 'resend-123');
      expect(onStatusUpdate).toHaveBeenCalledTimes(2);
    });

    it('should queue email for retry on send failure', async () => {
      // Mock failed send
      mockResendSend.mockResolvedValue({
        data: null,
        error: { message: 'Invalid API key' },
      });

      const onStatusUpdate = vi.fn();

      const result = await sendEmailWithRollback({
        to: 'user@example.com',
        subject: 'Welcome',
        html: '<p>Welcome!</p>',
        emailType: 'welcome',
        entityType: 'distributor',
        entityId: 'dist-123',
        onStatusUpdate,
      });

      expect(result.success).toBe(false);
      expect(result.queueId).toBe('queue-123');
      expect(result.error).toBe('Invalid API key');
      expect(mockInsert).toHaveBeenCalled();
      expect(onStatusUpdate).toHaveBeenCalledWith('pending');
      expect(onStatusUpdate).toHaveBeenCalledWith('failed', 'queue-123');
    });

    it('should handle exceptions and queue for retry', async () => {
      // Mock exception
      mockResendSend.mockRejectedValue(new Error('Network error'));

      const result = await sendEmailWithRollback({
        to: 'user@example.com',
        subject: 'Welcome',
        html: '<p>Welcome!</p>',
        emailType: 'welcome',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should use default from address if not provided', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'resend-123' },
        error: null,
      });

      await sendEmailWithRollback({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        emailType: 'notification',
      });

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Apex Affinity Group <theapex@theapexway.net>',
        })
      );
    });

    it('should respect custom maxRetries', async () => {
      mockResendSend.mockResolvedValue({
        data: null,
        error: { message: 'Rate limited' },
      });

      await sendEmailWithRollback({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        emailType: 'notification',
        maxRetries: 5,
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          max_retries: 5,
        })
      );
    });
  });

  describe('processEmailRetryQueue', () => {
    it('should process pending emails and mark as sent on success', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'resend-456' },
        error: null,
      });

      const result = await processEmailRetryQueue(10);

      expect(result.processed).toBe(1);
      expect(result.sent).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.abandoned).toBe(0);
      expect(mockRpc).toHaveBeenCalledWith('get_pending_email_retries', {
        batch_size: 10,
      });
      expect(mockRpc).toHaveBeenCalledWith('mark_email_sent', {
        p_email_id: 'email-1',
      });
    });

    it('should increment retry count on send failure', async () => {
      mockResendSend.mockResolvedValue({
        data: null,
        error: { message: 'Temporary failure' },
      });

      const result = await processEmailRetryQueue(10);

      expect(result.processed).toBe(1);
      expect(result.sent).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.abandoned).toBe(0);
      expect(mockRpc).toHaveBeenCalledWith('increment_email_retry', {
        p_email_id: 'email-1',
        p_error_message: 'Temporary failure',
      });
    });

    it('should abandon email after max retries', async () => {
      // Mock email with retry_count = 2 (next attempt would be 3rd)
      mockRpc.mockResolvedValueOnce({
        data: [
          {
            id: 'email-2',
            email_type: 'invitation',
            recipient_email: 'test@example.com',
            subject: 'Test',
            html_body: '<p>Test</p>',
            from_email: 'theapex@theapexway.net',
            retry_count: 2,
            max_retries: 3,
          },
        ],
        error: null,
      });

      mockResendSend.mockResolvedValue({
        data: null,
        error: { message: 'Permanent failure' },
      });

      const result = await processEmailRetryQueue(10);

      expect(result.abandoned).toBe(1);
    });

    it('should handle batch processing', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'resend-789' },
        error: null,
      });

      const result = await processEmailRetryQueue(5);

      expect(mockRpc).toHaveBeenCalledWith('get_pending_email_retries', {
        batch_size: 5,
      });
    });
  });

  describe('getEmailRetryStats', () => {
    it('should return stats grouped by status', async () => {
      const stats = await getEmailRetryStats();

      expect(stats).toEqual({
        pending: 2,
        processing: 0,
        sent: 1,
        failed: 1,
        abandoned: 0,
      });
    });

    it('should handle errors gracefully', async () => {
      mockSelect.mockReturnValueOnce({
        in: vi.fn(() => ({
          data: null,
          error: { message: 'Database error' },
        })),
      });

      const stats = await getEmailRetryStats();

      expect(stats).toEqual({
        pending: 0,
        processing: 0,
        sent: 0,
        failed: 0,
        abandoned: 0,
      });
    });
  });
});
