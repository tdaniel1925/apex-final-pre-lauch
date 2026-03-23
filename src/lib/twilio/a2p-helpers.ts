/**
 * Twilio A2P Helper Functions
 * For managing phone numbers with existing A2P campaign
 */

import { getTwilioClient } from './client'

/**
 * Associate a Twilio phone number with your approved A2P messaging service
 * Call this whenever you purchase a new Twilio number for SMS
 */
export async function associateNumberWithA2P(phoneNumberSid: string): Promise<void> {
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID

  if (!messagingServiceSid) {
    console.warn('⚠️ No TWILIO_MESSAGING_SERVICE_SID configured - skipping A2P association')
    return
  }

  const client = getTwilioClient()

  if (!client) {
    console.warn('⚠️ Twilio client not configured - skipping A2P association')
    return
  }

  try {
    console.log(`📞 Associating ${phoneNumberSid} with A2P campaign ${messagingServiceSid}`)

    await client.messaging.v1
      .services(messagingServiceSid)
      .phoneNumbers
      .create({ phoneNumberSid })

    console.log(`✅ Number associated with A2P campaign successfully`)
  } catch (error: any) {
    console.error('❌ A2P association failed:', error)

    // Don't throw if already associated
    if (error.code === 21710) { // Number already in service
      console.log('   Number already associated with messaging service')
      return
    }

    throw error
  }
}

/**
 * Check if a phone number is associated with your A2P campaign
 */
export async function isNumberInA2PCampaign(phoneNumberSid: string): Promise<boolean> {
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID

  if (!messagingServiceSid) {
    return false
  }

  const client = getTwilioClient()

  if (!client) {
    return false
  }

  try {
    const phoneNumbers = await client.messaging.v1
      .services(messagingServiceSid)
      .phoneNumbers
      .list()

    return phoneNumbers.some(pn => pn.sid === phoneNumberSid)
  } catch (error) {
    console.error('Error checking A2P association:', error)
    return false
  }
}
