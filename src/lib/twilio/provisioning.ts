/**
 * Twilio Phone Number Provisioning
 * Provisions dedicated Twilio numbers for AI assistants
 */

import { getTwilioClient } from './client'
import { associateNumberWithA2P } from './a2p-helpers'

export interface ProvisionTwilioNumberOptions {
  areaCode?: string
  distributorName: string
  distributorId: string
}

export interface ProvisionedNumber {
  phoneNumber: string
  phoneNumberSid: string
  friendlyName: string
}

/**
 * Provision a dedicated Twilio number for a distributor's AI assistant
 * - Searches for available number in desired area code
 * - Purchases the number
 * - Configures voice webhook (forward to VAPI)
 * - Associates with A2P campaign for SMS compliance
 */
export async function provisionDistributorPhoneNumber(
  options: ProvisionTwilioNumberOptions
): Promise<ProvisionedNumber> {
  const { areaCode, distributorName, distributorId } = options
  const client = getTwilioClient()

  if (!client) {
    throw new Error('Twilio client not configured')
  }

  console.log(`📞 Provisioning Twilio number for ${distributorName}`)
  if (areaCode) {
    console.log(`   Preferred area code: ${areaCode}`)
  }

  // Step 1: Search for available numbers
  let availableNumbers

  if (areaCode) {
    try {
      availableNumbers = await client.availablePhoneNumbers('US')
        .local
        .list({
          areaCode: parseInt(areaCode, 10),
          voiceEnabled: true,
          limit: 5
        })

      if (availableNumbers.length === 0) {
        console.log(`   No numbers in ${areaCode}, searching nearby...`)

        // Try nearby area codes
        const nearbyAreaCodes = getNearbyAreaCodes(areaCode)
        for (const nearbyCode of nearbyAreaCodes) {
          availableNumbers = await client.availablePhoneNumbers('US')
            .local
            .list({
              areaCode: parseInt(nearbyCode, 10),
              voiceEnabled: true,
              limit: 5
            })

          if (availableNumbers.length > 0) {
            console.log(`   Found numbers in nearby area code: ${nearbyCode}`)
            break
          }
        }
      }
    } catch (error) {
      console.warn(`   Error searching with area code: ${error}`)
      availableNumbers = null
    }
  }

  // Fallback: search without area code restriction
  if (!availableNumbers || availableNumbers.length === 0) {
    console.log(`   Searching for any available US number...`)
    availableNumbers = await client.availablePhoneNumbers('US')
      .local
      .list({
        voiceEnabled: true,
        limit: 5
      })
  }

  if (availableNumbers.length === 0) {
    throw new Error('No available phone numbers found')
  }

  const numberToBuy = availableNumbers[0].phoneNumber
  console.log(`   Found available number: ${numberToBuy}`)

  // Step 2: Purchase the number
  const friendlyName = `${distributorName} - Apex AI`

  const purchasedNumber = await client.incomingPhoneNumbers.create({
    phoneNumber: numberToBuy,
    friendlyName,

    // Voice Configuration - Forward to VAPI webhook
    voiceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/vapi-inbound`,
    voiceMethod: 'POST',

    // Status callbacks
    statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio-status`,
    statusCallbackMethod: 'POST',
  })

  console.log(`✅ Purchased number: ${purchasedNumber.phoneNumber}`)

  // Step 3: Associate with A2P campaign for SMS compliance (optional for voice-only)
  try {
    await associateNumberWithA2P(purchasedNumber.sid)
    console.log(`✅ Number associated with A2P campaign`)
  } catch (a2pError) {
    console.warn(`⚠️ A2P association failed:`, a2pError)
    // Don't fail the provisioning - number can still work for voice
  }

  return {
    phoneNumber: purchasedNumber.phoneNumber,
    phoneNumberSid: purchasedNumber.sid,
    friendlyName,
  }
}

/**
 * Release/delete a Twilio phone number
 */
export async function releasePhoneNumber(phoneNumberSid: string): Promise<void> {
  const client = getTwilioClient()

  if (!client) {
    throw new Error('Twilio client not configured')
  }

  try {
    console.log(`📞 Releasing phone number ${phoneNumberSid}`)
    await client.incomingPhoneNumbers(phoneNumberSid).remove()
    console.log(`✅ Phone number released`)
  } catch (error) {
    console.error(`❌ Failed to release phone number:`, error)
    throw error
  }
}

/**
 * Update phone number webhooks
 */
export async function updatePhoneNumberWebhooks(
  phoneNumberSid: string,
  webhooks: {
    voiceUrl?: string
  }
): Promise<void> {
  const client = getTwilioClient()

  if (!client) {
    throw new Error('Twilio client not configured')
  }

  await client.incomingPhoneNumbers(phoneNumberSid).update({
    voiceUrl: webhooks.voiceUrl,
  })
}

/**
 * Get nearby area codes for fallback
 */
function getNearbyAreaCodes(areaCode: string): string[] {
  const nearbyMap: Record<string, string[]> = {
    // Texas
    '214': ['469', '972', '817', '682'],
    '469': ['214', '972', '817', '682'],
    '972': ['214', '469', '817', '682'],
    '817': ['214', '469', '972', '682'],
    '682': ['214', '469', '972', '817'],

    '713': ['281', '832', '346'],
    '281': ['713', '832', '346'],
    '832': ['713', '281', '346'],
    '346': ['713', '281', '832'],

    '512': ['737'],
    '737': ['512'],

    '210': ['726'],
    '726': ['210'],

    // California
    '213': ['323', '310', '818', '424'],
    '323': ['213', '310', '818', '424'],
    '310': ['213', '323', '424', '818'],
    '424': ['310', '213', '323', '818'],
    '818': ['213', '323', '310', '424'],

    '415': ['510', '628', '650'],
    '510': ['415', '628', '650'],
    '628': ['415', '510', '650'],
    '650': ['415', '510', '628'],

    // New York
    '212': ['646', '917', '929', '347'],
    '646': ['212', '917', '929', '347'],
    '917': ['212', '646', '929', '347'],
    '929': ['212', '646', '917', '347'],
    '347': ['212', '646', '917', '929'],

    // Illinois
    '312': ['773', '872', '464'],
    '773': ['312', '872', '464'],
    '872': ['312', '773', '464'],
    '464': ['312', '773', '872'],

    // Florida
    '305': ['786', '754', '561'],
    '786': ['305', '754', '561'],
    '754': ['305', '786', '561'],
    '561': ['305', '786', '754'],
  }

  return nearbyMap[areaCode] || []
}
