// =============================================
// Jordyn Webhook Tests
// Tests for jordyn.app webhook handler
// =============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as crypto from 'crypto';

describe('Jordyn Webhook Handler', () => {
  // =============================================
  // HELPER FUNCTIONS
  // =============================================

  function createSignature(payload: string, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload, 'utf8');
    return hmac.digest('hex');
  }

  // =============================================
  // SIGNATURE VERIFICATION TESTS
  // =============================================

  describe('Signature Verification', () => {
    it('should create valid HMAC-SHA256 signature', () => {
      const payload = 'test payload';
      const secret = 'test-secret';
      const signature = createSignature(payload, secret);

      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBe(64); // SHA256 hex is 64 characters
    });

    it('should create different signatures for different payloads', () => {
      const secret = 'test-secret';
      const sig1 = createSignature('payload1', secret);
      const sig2 = createSignature('payload2', secret);

      expect(sig1).not.toBe(sig2);
    });

    it('should create same signature for same payload', () => {
      const payload = 'test payload';
      const secret = 'test-secret';
      const sig1 = createSignature(payload, secret);
      const sig2 = createSignature(payload, secret);

      expect(sig1).toBe(sig2);
    });
  });
});

// =============================================
// HELPER FUNCTION TESTS
// =============================================

describe('Webhook Helper Functions', () => {
  describe('verifyWebhookSignature', () => {
    it('should verify valid HMAC signature', async () => {
      const body = 'test payload';
      const secret = 'test-secret';
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(body, 'utf8');
      const signature = hmac.digest('hex');

      // Import and test the helper function
      const { verifyWebhookSignature } = await import('@/lib/integrations/webhooks/helpers');
      const result = verifyWebhookSignature({
        body,
        signature,
        secret,
        algorithm: 'sha256',
      });

      expect(result).toBe(true);
    });

    it('should reject invalid signature', async () => {
      const { verifyWebhookSignature } = await import('@/lib/integrations/webhooks/helpers');
      const result = verifyWebhookSignature({
        body: 'test payload',
        signature: 'invalid-signature-hex-string-that-is-64-chars-long-aaaaaaaaaaaa',
        secret: 'test-secret',
        algorithm: 'sha256',
      });

      expect(result).toBe(false);
    });

    it('should handle SHA512 algorithm', async () => {
      const body = 'test payload';
      const secret = 'test-secret';
      const hmac = crypto.createHmac('sha512', secret);
      hmac.update(body, 'utf8');
      const signature = hmac.digest('hex');

      const { verifyWebhookSignature } = await import('@/lib/integrations/webhooks/helpers');
      const result = verifyWebhookSignature({
        body,
        signature,
        secret,
        algorithm: 'sha512',
      });

      expect(result).toBe(true);
    });
  });
});
