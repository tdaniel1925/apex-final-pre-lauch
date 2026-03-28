/**
 * Twilio SMS Utilities
 * Send SMS via Twilio API
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN

export interface SendSMSParams {
  to: string // Recipient phone number
  from: string // Sender phone number (Twilio number)
  body: string // Message content
}

export interface SMSResponse {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send SMS via Twilio
 */
export async function sendSMS(params: SendSMSParams): Promise<SMSResponse> {
  const { to, from, body } = params

  try {
    // Validate environment variables
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials not configured')
    }

    // Send SMS via Twilio API
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: from,
          Body: body,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `Twilio API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      success: true,
      messageId: data.sid,
    }
  } catch (error: any) {
    console.error('[Twilio SMS] Error sending SMS:', error)
    return {
      success: false,
      error: error.message || 'Failed to send SMS',
    }
  }
}

/**
 * Normalize phone number to E.164 format
 * Handles: (214) 555-1234, 214-555-1234, 2145551234, +12145551234
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // If 10 digits, add +1 (US)
  if (digits.length === 10) {
    return `+1${digits}`
  }

  // If 11 digits starting with 1, add +
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }

  // Already has +
  if (phone.startsWith('+')) {
    return phone
  }

  // Default: assume US and add +1
  return `+1${digits}`
}
