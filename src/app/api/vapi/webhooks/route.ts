/**
 * VAPI Webhook Handler
 * Handles call completion events from VAPI
 * - Tracks first call completion for Owner Mode
 * - Sends SMS notifications for Prospect Mode calls
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendProspectCallNotification } from '@/lib/twilio/sms'

interface VAPIMessage {
  role: string
  content: string
}

interface VAPICall {
  id: string
  customer: {
    number: string
  }
  status: string
  startedAt?: string
  endedAt?: string
}

interface VAPIWebhookPayload {
  message: {
    type: string // "end-of-call-report"
    call: VAPICall
    messages?: VAPIMessage[]
    transcript?: string
  }
  assistant?: {
    id: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: VAPIWebhookPayload = await request.json()

    console.log('[VAPI Webhook] Received:', body.message?.type)

    // Only process end-of-call-report events
    if (body.message?.type !== 'end-of-call-report') {
      return NextResponse.json({ success: true, message: 'Event ignored' })
    }

    const call = body.message.call
    const messages = body.message.messages || []
    const assistantId = body.assistant?.id

    if (!assistantId) {
      console.error('[VAPI Webhook] No assistant ID provided')
      return NextResponse.json({ error: 'No assistant ID' }, { status: 400 })
    }

    if (!call?.customer?.number) {
      console.error('[VAPI Webhook] No caller number provided')
      return NextResponse.json({ error: 'No caller number' }, { status: 400 })
    }

    const callerNumber = call.customer.number

    // Find distributor by VAPI assistant ID
    const supabase = createServiceClient()
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, phone, first_call_completed')
      .eq('vapi_assistant_id', assistantId)
      .single()

    if (distError || !distributor) {
      console.error('[VAPI Webhook] Distributor not found:', assistantId)
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 })
    }

    console.log(`[VAPI Webhook] Call for ${distributor.first_name} ${distributor.last_name}`)
    console.log(`[VAPI Webhook] Caller: ${callerNumber}, Owner: ${distributor.phone}`)

    // Check if caller is the owner (distributor calling their own number)
    const isOwner = callerNumber === distributor.phone ||
                    callerNumber.replace(/\D/g, '') === distributor.phone?.replace(/\D/g, '')

    if (isOwner) {
      console.log('[VAPI Webhook] Owner call detected')

      // Check if this was their first call
      if (!distributor.first_call_completed) {
        console.log('[VAPI Webhook] Marking first call as completed')

        // Mark first_call_completed = true
        const { error: updateError } = await supabase
          .from('distributors')
          .update({ first_call_completed: true })
          .eq('id', distributor.id)

        if (updateError) {
          console.error('[VAPI Webhook] Failed to update first_call_completed:', updateError)
        } else {
          console.log('[VAPI Webhook] First call marked as completed')
        }
      }

      // No SMS for owner calls
      return NextResponse.json({ success: true, message: 'Owner call processed' })
    }

    // Prospect call - extract message and send SMS
    console.log('[VAPI Webhook] Prospect call detected - sending SMS')

    // Extract transcript from messages
    const transcript = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => m.content)
      .join(' ')

    if (!transcript || transcript.trim() === '') {
      console.log('[VAPI Webhook] No transcript available, skipping SMS')
      return NextResponse.json({ success: true, message: 'No transcript' })
    }

    // Send SMS notification
    const smsResult = await sendProspectCallNotification(
      distributor.phone,
      callerNumber,
      transcript
    )

    if (!smsResult.success) {
      console.error('[VAPI Webhook] Failed to send SMS:', smsResult.error)
      return NextResponse.json(
        { error: 'Failed to send SMS', details: smsResult.error },
        { status: 500 }
      )
    }

    console.log('[VAPI Webhook] SMS sent successfully:', smsResult.messageSid)

    return NextResponse.json({
      success: true,
      message: 'Prospect call processed',
      smsSent: true,
      messageSid: smsResult.messageSid,
    })
  } catch (error: any) {
    console.error('[VAPI Webhook] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
