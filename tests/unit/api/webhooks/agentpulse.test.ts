// =============================================
// AgentPulse Webhook Tests
// Tests for agentpulse.cloud webhook handler
// =============================================

import { describe, it, expect } from 'vitest';
import * as crypto from 'crypto';

describe('AgentPulse Webhook Handler', () => {
  // =============================================
  // HELPER FUNCTIONS
  // =============================================

  function createStripeStyleSignature(payload: string, secret: string, customTimestamp?: number): string {
    const timestamp = customTimestamp || Math.floor(Date.now() / 1000);
    const signedPayload = `${timestamp}.${payload}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signedPayload, 'utf8');
    const signature = hmac.digest('hex');
    return `t=${timestamp},v1=${signature}`;
  }

  // =============================================
  // SIGNATURE VERIFICATION TESTS
  // =============================================

  describe('Stripe-style Signature Verification', () => {
    it('should create valid Stripe-style signature', () => {
      const payload = 'test payload';
      const secret = 'test-secret';
      const signature = createStripeStyleSignature(payload, secret);

      expect(signature).toBeDefined();
      expect(signature).toMatch(/^t=\d+,v1=[a-f0-9]{64}$/);
    });

    it('should include timestamp in signature', () => {
      const payload = 'test payload';
      const secret = 'test-secret';
      const timestamp = 1710684896;
      const signature = createStripeStyleSignature(payload, secret, timestamp);

      expect(signature).toContain(`t=${timestamp}`);
    });

    it('should create different signatures for different payloads', () => {
      const secret = 'test-secret';
      const sig1 = createStripeStyleSignature('payload1', secret);
      const sig2 = createStripeStyleSignature('payload2', secret);

      // Extract v1 part
      const v1_1 = sig1.split(',v1=')[1];
      const v1_2 = sig2.split(',v1=')[1];

      expect(v1_1).not.toBe(v1_2);
    });

    it('should parse signature header correctly', () => {
      const signature = 't=1710684896,v1=abc123def456';
      const parts = signature.split(',');

      expect(parts).toHaveLength(2);
      expect(parts[0]).toContain('t=');
      expect(parts[1]).toContain('v1=');
    });
  });
});

// =============================================
// STRIPE-STYLE SIGNATURE TESTS
// =============================================

describe('Stripe-style Signature Verification Helper', () => {
  it('should verify valid Stripe-style signature', async () => {
    const body = 'test payload';
    const secret = 'test-secret';
    const timestamp = Math.floor(Date.now() / 1000);
    const signedPayload = `${timestamp}.${body}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signedPayload, 'utf8');
    const signature = hmac.digest('hex');
    const header = `t=${timestamp},v1=${signature}`;

    const { verifyStripeStyleSignature } = await import('../../../src/lib/integrations/webhooks/helpers');
    const result = verifyStripeStyleSignature(body, header, secret, 300);

    expect(result).toBe(true);
  });

  it('should reject signature with missing parts', async () => {
    const { verifyStripeStyleSignature } = await import('../../../src/lib/integrations/webhooks/helpers');
    const result = verifyStripeStyleSignature(
      'test payload',
      'invalid-format',
      'test-secret',
      300
    );

    expect(result).toBe(false);
  });

  it('should reject expired signatures', async () => {
    const body = 'test payload';
    const secret = 'test-secret';
    const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
    const signedPayload = `${oldTimestamp}.${body}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signedPayload, 'utf8');
    const signature = hmac.digest('hex');
    const header = `t=${oldTimestamp},v1=${signature}`;

    const { verifyStripeStyleSignature } = await import('../../../src/lib/integrations/webhooks/helpers');
    const result = verifyStripeStyleSignature(body, header, secret, 300); // 5 minute tolerance

    expect(result).toBe(false);
  });

  it('should accept recent signatures within tolerance', async () => {
    const body = 'test payload';
    const secret = 'test-secret';
    const recentTimestamp = Math.floor(Date.now() / 1000) - 60; // 1 minute ago
    const signedPayload = `${recentTimestamp}.${body}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signedPayload, 'utf8');
    const signature = hmac.digest('hex');
    const header = `t=${recentTimestamp},v1=${signature}`;

    const { verifyStripeStyleSignature } = await import('../../../src/lib/integrations/webhooks/helpers');
    const result = verifyStripeStyleSignature(body, header, secret, 300); // 5 minute tolerance

    expect(result).toBe(true);
  });

  it('should handle malformed timestamp', async () => {
    const { verifyStripeStyleSignature } = await import('../../../src/lib/integrations/webhooks/helpers');
    const result = verifyStripeStyleSignature(
      'test payload',
      't=invalid,v1=abc123',
      'test-secret',
      300
    );

    expect(result).toBe(false);
  });
});
