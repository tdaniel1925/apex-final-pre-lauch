// =============================================
// Twilio Client
// SMS and voice communication via Twilio API
// =============================================

import twilio from 'twilio';

/**
 * Twilio client singleton
 * Only initialized if credentials are provided
 */
export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn('[Twilio] Credentials not configured');
    return null;
  }

  return twilio(accountSid, authToken);
}

/**
 * Get the configured Twilio phone number
 */
export function getTwilioPhoneNumber(): string | null {
  return process.env.TWILIO_PHONE_NUMBER || null;
}

/**
 * Check if Twilio is configured
 */
export function isTwilioConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
}
