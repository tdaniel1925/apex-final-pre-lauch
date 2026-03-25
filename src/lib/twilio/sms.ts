// =============================================
// Twilio SMS Utility
// Send SMS notifications via Twilio
// =============================================

import { getTwilioClient, getTwilioPhoneNumber } from './client'

export interface SendSMSOptions {
  to: string
  message: string
  from?: string
}

export interface SendSMSResult {
  success: boolean
  messageSid?: string
  error?: string
}

/**
 * Send an SMS message via Twilio
 */
export async function sendSMS(options: SendSMSOptions): Promise<SendSMSResult> {
  const { to, message, from } = options

  try {
    const client = getTwilioClient()

    if (!client) {
      console.error('[SMS] Twilio client not configured')
      return {
        success: false,
        error: 'Twilio not configured',
      }
    }

    const fromNumber = from || getTwilioPhoneNumber()

    if (!fromNumber) {
      console.error('[SMS] No Twilio phone number configured')
      return {
        success: false,
        error: 'No Twilio phone number configured',
      }
    }

    // Send SMS
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to,
    })

    console.log(`[SMS] Sent message to ${to}: ${result.sid}`)

    return {
      success: true,
      messageSid: result.sid,
    }
  } catch (error: any) {
    console.error('[SMS] Failed to send message:', error)
    return {
      success: false,
      error: error.message || 'Failed to send SMS',
    }
  }
}

/**
 * Send SMS notification about a prospect call
 */
export async function sendProspectCallNotification(
  distributorPhone: string,
  callerNumber: string,
  transcript: string
): Promise<SendSMSResult> {
  // Truncate transcript to keep SMS short
  const shortTranscript = transcript.length > 150 ? transcript.substring(0, 150) + '...' : transcript

  const message = `New call from ${callerNumber}: ${shortTranscript}`

  return sendSMS({
    to: distributorPhone,
    message,
  })
}
