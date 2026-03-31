/**
 * AI Phone Provisioning API
 * Provisions VAPI assistant + Twilio phone number for new distributors
 *
 * Called after distributor signup to give them instant AI phone
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createVapiAssistant, buyVapiPhoneNumber } from '@/lib/vapi/client'
import { provisionDistributorPhoneNumber } from '@/lib/twilio/provisioning'
import {
  generateApexRepAgentPrompt,
  APEX_REP_VOICE_CONFIG,
} from '@/lib/vapi/prompts/apex-rep-agent'

interface ProvisionRequest {
  distributorId: string
  firstName: string
  lastName: string
  phone: string
  sponsorSlug?: string
}

interface ProvisionResponse {
  success: boolean
  phoneNumber?: string
  assistantId?: string
  error?: string
}

/**
 * Extract area code from phone number
 */
function extractAreaCode(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, '')

  if (digits.length === 10) {
    return digits.substring(0, 3)
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.substring(1, 4)
  }

  return undefined
}

export async function POST(request: NextRequest): Promise<NextResponse<ProvisionResponse>> {
  try {
    const body: ProvisionRequest = await request.json()
    const { distributorId, firstName, lastName, phone, sponsorSlug } = body

    // Validate required fields
    if (!distributorId || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log(`🤖 Provisioning AI for ${firstName} ${lastName} (${distributorId})`)

    // Initialize Supabase client
    const supabase = await createClient()

    // Get sponsor info
    let sponsorName = 'your sponsor'
    if (sponsorSlug) {
      const { data: sponsor } = await supabase
        .from('distributors')
        .select('first_name, last_name')
        .eq('slug', sponsorSlug)
        .single()

      if (sponsor) {
        sponsorName = `${sponsor.first_name} ${sponsor.last_name}`
      }
    }

    // Get distributor's info for prompt personalization
    const { data: distributor } = await supabase
      .from('distributors')
      .select('slug, email, phone, insurance_licensed')
      .eq('id', distributorId)
      .single()

    const replicatedSiteUrl = distributor?.slug
      ? `${process.env.NEXT_PUBLIC_APP_URL}/${distributor.slug}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/signup`

    const signupUrl = distributor?.slug
      ? `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${distributor.slug}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/signup`

    // Step 1: Generate personalized AI prompt for Apex rep agent
    const systemPrompt = generateApexRepAgentPrompt({
      repFirstName: firstName,
      repLastName: lastName,
      repPhone: distributor?.phone || phone,
      repEmail: distributor?.email || '',
      repSlug: distributor?.slug || '',
      sponsorName,
      replicatedSiteUrl,
      signupUrl,
      isLicensed: distributor?.insurance_licensed || false,
    })

    // Step 2: Create VAPI assistant with webhook
    console.log('   Creating VAPI assistant...')
    const assistant = await createVapiAssistant({
      name: `${firstName} ${lastName} - Apex AI`,
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini', // Using cheaper GPT-4o-mini model
        systemPrompt,
      },
      voice: {
        provider: APEX_REP_VOICE_CONFIG.provider,
        voiceId: APEX_REP_VOICE_CONFIG.voiceId,
      },
      firstMessage: APEX_REP_VOICE_CONFIG.firstMessage,
      firstMessageMode: APEX_REP_VOICE_CONFIG.firstMessageMode,
      recordingEnabled: APEX_REP_VOICE_CONFIG.recordingEnabled,
      transcriber: {
        provider: APEX_REP_VOICE_CONFIG.transcriber.provider,
        model: APEX_REP_VOICE_CONFIG.transcriber.model,
      },
      // Webhook for call events (SMS notifications, first call tracking)
      serverUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/vapi/call-events`,
      serverUrlSecret: process.env.VAPI_WEBHOOK_SECRET,
    })

    console.log(`   ✅ Created VAPI assistant: ${assistant.id}`)

    // Step 3: Provision phone number with area code matching prospect's phone
    const areaCode = phone ? extractAreaCode(phone) : undefined
    console.log(`   Provisioning phone number (area code: ${areaCode || 'any'})...`)

    const vapiPhone = await buyVapiPhoneNumber({
      name: `${firstName} ${lastName} - Apex`,
      assistantId: assistant.id,
      areaCode,
    })

    console.log(`   ✅ Provisioned VAPI phone: ${vapiPhone.number}`)

    // Step 4: Update distributor record with AI details
    const { error: updateError } = await supabase
      .from('distributors')
      .update({
        ai_phone_number: vapiPhone.number,
        vapi_assistant_id: assistant.id,
        vapi_phone_number_id: vapiPhone.id,
        ai_minutes_balance: 20, // 20 free minutes
        ai_trial_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        ai_provisioned_at: new Date().toISOString(),
      })
      .eq('id', distributorId)

    if (updateError) {
      console.error('❌ Failed to update distributor record:', updateError)
      // Continue anyway - we can update manually if needed
    }

    console.log(`✅ AI provisioning complete for ${firstName} ${lastName}`)
    console.log(`   Phone: ${vapiPhone.number}`)
    console.log(`   Assistant: ${assistant.id}`)
    console.log(`   Free minutes: 20`)
    console.log(`   Trial expires: 24 hours`)

    return NextResponse.json({
      success: true,
      phoneNumber: vapiPhone.number,
      assistantId: assistant.id,
    })
  } catch (error: any) {
    console.error('❌ AI provisioning error:', error)

    // Log detailed error for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to provision AI phone',
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check provisioning status
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const distributorId = searchParams.get('distributorId')

    if (!distributorId) {
      return NextResponse.json(
        { error: 'Missing distributorId parameter' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: distributor, error } = await supabase
      .from('distributors')
      .select('ai_phone_number, vapi_assistant_id, ai_minutes_balance, ai_trial_expires_at, ai_provisioned_at')
      .eq('id', distributorId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    const isProvisioned = !!distributor.ai_phone_number && !!distributor.vapi_assistant_id
    const trialActive = distributor.ai_trial_expires_at
      ? new Date(distributor.ai_trial_expires_at) > new Date()
      : false

    return NextResponse.json({
      isProvisioned,
      trialActive,
      phoneNumber: distributor.ai_phone_number,
      minutesRemaining: distributor.ai_minutes_balance,
      trialExpiresAt: distributor.ai_trial_expires_at,
      provisionedAt: distributor.ai_provisioned_at,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to check provisioning status' },
      { status: 500 }
    )
  }
}
