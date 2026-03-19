// =============================================
// WEBHOOK SIGNATURE VERIFICATION TESTS
// =============================================

import { describe, it, expect } from 'vitest';
import {
  verifyWebhookSignature,
  verifyWebhookSignatureWithTimestamp,
  generateWebhookSignature,
} from '@/lib/integrations/webhooks/verify-signature';

describe('Webhook Signature Verification', () => {
  const testSecret = 'test_webhook_secret_12345';
  const testPayload = JSON.stringify({
    event: 'sale.created',
    order_id: 'order_123',
    amount: 99.99,
  });

  describe('verifyWebhookSignature', () => {
    it('should verify valid signature', () => {
      const signature = generateWebhookSignature(testPayload, testSecret);
      const isValid = verifyWebhookSignature(testPayload, signature, testSecret);

      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', () => {
      const invalidSignature = 'invalid_signature_hex';
      const isValid = verifyWebhookSignature(testPayload, invalidSignature, testSecret);

      expect(isValid).toBe(false);
    });

    it('should reject signature with wrong secret', () => {
      const signature = generateWebhookSignature(testPayload, testSecret);
      const wrongSecret = 'wrong_secret';
      const isValid = verifyWebhookSignature(testPayload, signature, wrongSecret);

      expect(isValid).toBe(false);
    });

    it('should reject null signature', () => {
      const isValid = verifyWebhookSignature(testPayload, null, testSecret);

      expect(isValid).toBe(false);
    });

    it('should reject when secret is empty', () => {
      const signature = generateWebhookSignature(testPayload, testSecret);
      const isValid = verifyWebhookSignature(testPayload, signature, '');

      expect(isValid).toBe(false);
    });

    it('should reject tampered payload', () => {
      const signature = generateWebhookSignature(testPayload, testSecret);
      const tamperedPayload = testPayload.replace('99.99', '0.01');
      const isValid = verifyWebhookSignature(tamperedPayload, signature, testSecret);

      expect(isValid).toBe(false);
    });
  });

  describe('verifyWebhookSignatureWithTimestamp', () => {
    it('should verify valid signature with recent timestamp', () => {
      const timestamp = new Date().toISOString();
      const signature = generateWebhookSignature(testPayload, testSecret);

      const result = verifyWebhookSignatureWithTimestamp(
        testPayload,
        signature,
        timestamp,
        testSecret,
        300 // 5 minutes
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject old timestamp (replay attack)', () => {
      const oldTimestamp = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 minutes ago
      const signature = generateWebhookSignature(testPayload, testSecret);

      const result = verifyWebhookSignatureWithTimestamp(
        testPayload,
        signature,
        oldTimestamp,
        testSecret,
        300 // 5 minutes max age
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('too old');
    });

    it('should reject future timestamp', () => {
      const futureTimestamp = new Date(Date.now() + 2 * 60 * 1000).toISOString(); // 2 minutes in future
      const signature = generateWebhookSignature(testPayload, testSecret);

      const result = verifyWebhookSignatureWithTimestamp(
        testPayload,
        signature,
        futureTimestamp,
        testSecret,
        300
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('future');
    });

    it('should accept Unix timestamp format', () => {
      const unixTimestamp = Math.floor(Date.now() / 1000).toString();
      const signature = generateWebhookSignature(testPayload, testSecret);

      const result = verifyWebhookSignatureWithTimestamp(
        testPayload,
        signature,
        unixTimestamp,
        testSecret,
        300
      );

      expect(result.valid).toBe(true);
    });

    it('should reject invalid timestamp format', () => {
      const invalidTimestamp = 'not-a-timestamp';
      const signature = generateWebhookSignature(testPayload, testSecret);

      const result = verifyWebhookSignatureWithTimestamp(
        testPayload,
        signature,
        invalidTimestamp,
        testSecret,
        300
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid timestamp');
    });

    it('should reject missing timestamp', () => {
      const signature = generateWebhookSignature(testPayload, testSecret);

      const result = verifyWebhookSignatureWithTimestamp(
        testPayload,
        signature,
        null,
        testSecret,
        300
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing timestamp');
    });

    it('should reject invalid signature even with valid timestamp', () => {
      const timestamp = new Date().toISOString();
      const invalidSignature = 'invalid_signature';

      const result = verifyWebhookSignatureWithTimestamp(
        testPayload,
        invalidSignature,
        timestamp,
        testSecret,
        300
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid signature');
    });
  });

  describe('generateWebhookSignature', () => {
    it('should generate consistent signatures', () => {
      const sig1 = generateWebhookSignature(testPayload, testSecret);
      const sig2 = generateWebhookSignature(testPayload, testSecret);

      expect(sig1).toBe(sig2);
    });

    it('should generate different signatures for different payloads', () => {
      const payload1 = JSON.stringify({ order: '123' });
      const payload2 = JSON.stringify({ order: '456' });

      const sig1 = generateWebhookSignature(payload1, testSecret);
      const sig2 = generateWebhookSignature(payload2, testSecret);

      expect(sig1).not.toBe(sig2);
    });

    it('should generate hex-encoded output', () => {
      const signature = generateWebhookSignature(testPayload, testSecret);

      // HMAC-SHA256 produces 64 hex characters (256 bits / 4 bits per hex char)
      expect(signature).toMatch(/^[a-f0-9]{64}$/);
    });
  });
});
