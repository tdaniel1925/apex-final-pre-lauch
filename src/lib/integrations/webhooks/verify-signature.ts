// =============================================
// WEBHOOK SIGNATURE VERIFICATION
// Purpose: Verify HMAC signatures from external platform webhooks
// Security: Uses constant-time comparison to prevent timing attacks
// =============================================

import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verify webhook signature using HMAC-SHA256
 *
 * @param payload - Raw webhook payload string
 * @param signature - Signature from webhook header (hex string)
 * @param secret - Webhook secret from integration config
 * @returns True if signature is valid, false otherwise
 *
 * @example
 * const isValid = verifyWebhookSignature(
 *   JSON.stringify(webhookBody),
 *   request.headers.get('x-webhook-signature'),
 *   integration.webhook_secret
 * );
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    return false;
  }

  try {
    // Generate expected signature using HMAC-SHA256
    const hmac = createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    // Convert strings to buffers for constant-time comparison
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    // Ensure buffers are same length (prevent length-based timing attacks)
    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    // Use constant-time comparison to prevent timing attacks
    return timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    // Signature verification failed
    return false;
  }
}

/**
 * Verify webhook signature with timestamp validation (prevents replay attacks)
 *
 * @param payload - Raw webhook payload string
 * @param signature - Signature from webhook header
 * @param timestamp - Timestamp from webhook header (ISO 8601 or Unix timestamp)
 * @param secret - Webhook secret from integration config
 * @param maxAgeSeconds - Maximum age of webhook in seconds (default: 300 = 5 minutes)
 * @returns Object with valid flag and error message
 *
 * @example
 * const result = verifyWebhookSignatureWithTimestamp(
 *   JSON.stringify(webhookBody),
 *   request.headers.get('x-webhook-signature'),
 *   request.headers.get('x-webhook-timestamp'),
 *   integration.webhook_secret,
 *   300 // 5 minutes
 * );
 *
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 */
export function verifyWebhookSignatureWithTimestamp(
  payload: string,
  signature: string | null,
  timestamp: string | null,
  secret: string,
  maxAgeSeconds: number = 300
): { valid: boolean; error?: string } {
  // Verify signature first
  if (!verifyWebhookSignature(payload, signature, secret)) {
    return { valid: false, error: 'Invalid signature' };
  }

  // Verify timestamp to prevent replay attacks
  if (!timestamp) {
    return { valid: false, error: 'Missing timestamp' };
  }

  try {
    // Parse timestamp (handle both ISO 8601 and Unix timestamp)
    let webhookTime: number;
    if (timestamp.includes('T') || timestamp.includes('-')) {
      // ISO 8601 format
      webhookTime = new Date(timestamp).getTime();
    } else {
      // Unix timestamp (seconds)
      webhookTime = parseInt(timestamp, 10) * 1000;
    }

    // Check if timestamp is valid
    if (isNaN(webhookTime)) {
      return { valid: false, error: 'Invalid timestamp format' };
    }

    // Check if webhook is too old
    const now = Date.now();
    const ageSeconds = (now - webhookTime) / 1000;

    if (ageSeconds > maxAgeSeconds) {
      return {
        valid: false,
        error: `Webhook too old (${Math.round(ageSeconds)}s > ${maxAgeSeconds}s)`,
      };
    }

    // Check if timestamp is in the future (clock skew tolerance: 60 seconds)
    if (webhookTime > now + 60000) {
      return { valid: false, error: 'Webhook timestamp is in the future' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Timestamp validation failed' };
  }
}

/**
 * Generate webhook signature for testing purposes
 * DO NOT use this in production webhook handlers - only for tests
 *
 * @param payload - Webhook payload string
 * @param secret - Webhook secret
 * @returns Hex-encoded HMAC-SHA256 signature
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
}
