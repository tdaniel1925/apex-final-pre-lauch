/**
 * VAPI Webhook Security
 * Handles signature verification to prevent fake webhooks
 */

import crypto from 'crypto';
import { createLogger } from '@/lib/logger';

const logger = createLogger('VAPI Security');

/**
 * Verify VAPI webhook signature using HMAC SHA-256
 *
 * VAPI sends the signature in the x-vapi-signature header
 * The signature is a HMAC SHA-256 hash of the request body using your webhook secret
 *
 * @param rawBody - Raw request body as string
 * @param signature - Signature from x-vapi-signature header
 * @param secret - Your VAPI webhook secret (from env var)
 * @returns true if signature is valid, false otherwise
 */
export function verifyVAPISignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    logger.warn('Missing signature header');
    return false;
  }

  if (!secret) {
    logger.error('VAPI_WEBHOOK_SECRET not configured in environment variables');
    return false;
  }

  try {
    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      logger.warn('Invalid webhook signature', {
        receivedSignature: signature.substring(0, 10) + '...',
        expectedSignature: expectedSignature.substring(0, 10) + '...',
      });
    }

    return isValid;
  } catch (error) {
    logger.error('Error verifying webhook signature', error as Error, {
      signature: signature.substring(0, 10) + '...',
    });
    return false;
  }
}

/**
 * Check if webhook signature verification is enabled
 * In development, you can disable signature verification for easier testing
 */
export function isSignatureVerificationEnabled(): boolean {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const forceDisable = process.env.VAPI_DISABLE_SIGNATURE_VERIFICATION === 'true';

  if (forceDisable) {
    logger.warn('Webhook signature verification is DISABLED (not recommended for production)');
    return false;
  }

  return true;
}
