/**
 * VAPI Call Events Webhook
 * Handles incoming call events from VAPI to track first calls and send SMS follow-ups
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS, normalizePhoneNumber } from '@/lib/twilio/sms'
import { determineSMSTemplate } from '@/lib/vapi/sms-templates'
import { verifyVAPISignature, isSignatureVerificationEnabled } from '@/lib/vapi/webhook-security'
import { createLogger } from '@/lib/logger'

const logger = createLogger('VAPI Webhook')

interface VAPICallEvent {
  type: 'call.started' | 'call.ended' | 'transcript.update' | 'function-call'
  call: {
    id: string
    assistantId: string
    phoneNumberId?: string
    customer: {
      number: string
      name?: string
    }
    startedAt?: string
    endedAt?: string
    endedReason?: string
    cost?: number
    duration?: number
    transcript?: string
    recordingUrl?: string
    analysis?: {
      summary?: string
      sentiment?: 'positive' | 'neutral' | 'negative'
      structuredData?: Record<string, any>
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()

    // Verify webhook signature (security check)
    if (isSignatureVerificationEnabled()) {
      const signature = request.headers.get('x-vapi-signature')
      const secret = process.env.VAPI_WEBHOOK_SECRET || ''

      if (!verifyVAPISignature(rawBody, signature, secret)) {
        logger.warn('Webhook signature verification failed', {
          hasSignature: !!signature,
          hasSecret: !!secret,
        })
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }

      logger.debug('Webhook signature verified successfully')
    }

    // Parse event after verification
    const event: VAPICallEvent = JSON.parse(rawBody)

    logger.info('Received webhook event', {
      eventType: event.type,
      callId: event.call.id,
      assistantId: event.call.assistantId,
    })

    const supabase = await createClient()

    // Handle call.started events (first call tracking)
    if (event.type === 'call.started') {
      return await handleCallStarted(event, supabase)
    }

    // Handle call.ended events (SMS follow-up)
    if (event.type === 'call.ended') {
      return await handleCallEnded(event, supabase)
    }

    // Ignore other event types
    logger.debug('Ignoring event type', { eventType: event.type })
    return NextResponse.json({ received: true })
  } catch (error: any) {
    logger.error('Error processing webhook', error, {
      errorMessage: error.message,
    })
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle call.started event - Track first calls
 */
async function handleCallStarted(event: VAPICallEvent, supabase: any) {
  try {

    const callerNumber = event.call.customer.number
    const assistantId = event.call.assistantId

    logger.info('Call started event', {
      callerNumber,
      assistantId,
    })

    // Find distributor by VAPI assistant ID
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, phone, ai_first_call_completed, ai_first_call_at')
      .eq('vapi_assistant_id', assistantId)
      .single()

    if (distError || !distributor) {
      logger.warn('No distributor found for assistant', { assistantId })
      return NextResponse.json({ received: true })
    }

    // Normalize phone numbers for comparison (remove +1, spaces, dashes)
    const normalizePhone = (phone: string) => {
      return phone.replace(/[\s\-\(\)\+]/g, '').replace(/^1/, '')
    }

    const normalizedCallerNumber = normalizePhone(callerNumber)
    const normalizedDistributorPhone = distributor.phone
      ? normalizePhone(distributor.phone)
      : ''

    // Check if this is the distributor calling their own AI
    const isDistributorCalling =
      normalizedDistributorPhone &&
      normalizedCallerNumber === normalizedDistributorPhone

    logger.debug('Phone number comparison', {
      caller: normalizedCallerNumber,
      distributor: normalizedDistributorPhone,
      isDistributorCalling,
    })

    // If distributor is calling AND hasn't completed first call, mark it as complete
    if (isDistributorCalling && !distributor.ai_first_call_completed) {
      logger.info('First call detected', {
        distributorId: distributor.id,
        distributorName: `${distributor.first_name} ${distributor.last_name}`,
      })

      const { error: updateError } = await supabase
        .from('distributors')
        .update({
          ai_first_call_completed: true,
          ai_first_call_at: new Date().toISOString(),
        })
        .eq('id', distributor.id)

      if (updateError) {
        logger.error('Error updating first call status', updateError as Error, {
          distributorId: distributor.id,
        })
      } else {
        logger.info('First call marked as completed', {
          distributorId: distributor.id,
        })
      }
    }

    logger.info('Call started event processed successfully', {
      isDistributorCall: isDistributorCalling,
      firstCallMarked: isDistributorCalling && !distributor.ai_first_call_completed,
    })

    return NextResponse.json({
      received: true,
      isDistributorCall: isDistributorCalling,
      firstCallMarked: isDistributorCalling && !distributor.ai_first_call_completed,
    })
  } catch (error: any) {
    logger.error('Error in handleCallStarted', error)
    return NextResponse.json({ received: true }) // Don't fail webhook
  }
}

/**
 * Handle call.ended event - Send SMS follow-up to prospects
 */
async function handleCallEnded(event: VAPICallEvent, supabase: any) {
  try {
    const callerNumber = event.call.customer.number
    const assistantId = event.call.assistantId
    const duration = event.call.duration || 0
    const summary = event.call.analysis?.summary || ''
    const sentiment = event.call.analysis?.sentiment || 'neutral'
    const endedReason = event.call.endedReason

    logger.info('Call ended event', {
      callerNumber,
      assistantId,
      duration,
      sentiment,
      endedReason,
    })

    // Find distributor by VAPI assistant ID
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, phone, ai_phone_number, slug')
      .eq('vapi_assistant_id', assistantId)
      .single()

    if (distError || !distributor) {
      logger.warn('No distributor found for assistant', { assistantId })
      return NextResponse.json({ received: true })
    }

    // Normalize phone numbers for comparison
    const normalizePhone = (phone: string) => {
      return phone.replace(/[\s\-\(\)\+]/g, '').replace(/^1/, '')
    }

    const normalizedCallerNumber = normalizePhone(callerNumber)
    const normalizedDistributorPhone = distributor.phone
      ? normalizePhone(distributor.phone)
      : ''

    // Check if this was the distributor calling
    const isDistributorCall =
      normalizedDistributorPhone &&
      normalizedCallerNumber === normalizedDistributorPhone

    const callType = isDistributorCall ? 'distributor' : 'prospect'

    logger.info('Determined call type', {
      callType,
      isDistributorCall,
    })

    // Check if call already logged (prevent duplicates from webhook retries)
    const { data: existingCall } = await supabase
      .from('call_logs')
      .select('id')
      .eq('vapi_call_id', event.call.id)
      .single()

    if (existingCall) {
      logger.info('Duplicate call detected, skipping', {
        callId: existingCall.id,
        vapiCallId: event.call.id,
      })
      return NextResponse.json({
        received: true,
        duplicate: true,
        callId: existingCall.id,
      })
    }

    // Log call in database
    const { data: callLog, error: logError } = await supabase
      .from('call_logs')
      .insert({
        vapi_call_id: event.call.id,
        assistant_id: assistantId,
        distributor_id: distributor.id,
        caller_number: callerNumber,
        ai_phone_number: distributor.ai_phone_number,
        caller_name: event.call.customer.name,
        direction: 'inbound',
        call_type: callType,
        started_at: event.call.startedAt,
        ended_at: event.call.endedAt,
        duration_seconds: duration,
        ended_reason: endedReason,
        sentiment,
        summary,
        transcript: event.call.transcript ? { raw: event.call.transcript } : null,
        analysis: event.call.analysis || null,
        recording_url: event.call.recordingUrl,
        cost_amount: event.call.cost,
        sms_sent: false,
      })
      .select()
      .single()

    if (logError) {
      logger.error('Error logging call', logError as Error, {
        vapiCallId: event.call.id,
        distributorId: distributor.id,
      })
    } else {
      logger.info('Call logged successfully', {
        callLogId: callLog.id,
        vapiCallId: event.call.id,
        callType,
      })
    }

    // Only send SMS to prospects (not distributors calling their own AI)
    if (callType === 'prospect') {
      logger.info('Preparing SMS follow-up for prospect', {
        callerNumber,
        distributorSlug: distributor.slug,
      })

      // Get replicated site URL
      const replicatedSiteUrl = distributor.slug
        ? `${process.env.NEXT_PUBLIC_APP_URL}/${distributor.slug}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/signup`

      // Determine which SMS template to use
      const smsTemplate = determineSMSTemplate(
        {
          duration,
          summary,
          sentiment,
          endedReason,
        },
        {
          firstName: distributor.first_name,
          lastName: distributor.last_name,
          replicatedSiteUrl,
          phone: distributor.phone,
        }
      )

      logger.debug('Using SMS template', {
        templateName: smsTemplate.templateName,
      })

      // Send SMS via Twilio
      const smsResult = await sendSMS({
        to: normalizePhoneNumber(callerNumber),
        from: normalizePhoneNumber(distributor.ai_phone_number),
        body: smsTemplate.body,
      })

      if (smsResult.success) {
        logger.info('SMS sent successfully', {
          messageId: smsResult.messageId,
          templateUsed: smsTemplate.templateName,
          recipient: callerNumber,
        })

        // Update call log with SMS details
        await supabase
          .from('call_logs')
          .update({
            sms_sent: true,
            sms_sent_at: new Date().toISOString(),
            sms_template_used: smsTemplate.templateName,
            sms_body: smsTemplate.body,
            sms_twilio_sid: smsResult.messageId,
          })
          .eq('id', callLog.id)
      } else {
        logger.error('SMS send failed', new Error(smsResult.error || 'Unknown SMS error'), {
          recipient: callerNumber,
          templateUsed: smsTemplate.templateName,
        })
      }
    } else {
      logger.debug('Skipping SMS send', {
        reason: 'Distributor called their own AI',
      })
    }

    return NextResponse.json({
      received: true,
      callType,
      smsSent: callType === 'prospect',
    })
  } catch (error: any) {
    logger.error('Error in handleCallEnded', error)
    return NextResponse.json({ received: true }) // Don't fail webhook
  }
}

/**
 * GET endpoint for webhook verification (some services require this)
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'VAPI webhook endpoint active',
    timestamp: new Date().toISOString(),
  })
}
