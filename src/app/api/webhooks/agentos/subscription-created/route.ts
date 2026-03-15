/**
 * AgentOS Webhook: Subscription Created
 *
 * Receives notification when customer signs up for AgentOS via rep referral
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { verifyAgentOSSignature } from '@/lib/agentos/webhooks'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('📥 AgentOS webhook: subscription-created')

    // Parse payload
    const payload = await request.json()
    const {
      apex_rep_code,
      subscriber_id,
      subscriber_email,
      subscriber_name,
      mrr,
      timestamp
    } = payload

    // Verify signature
    const signature = request.headers.get('x-webhook-signature') || ''
    if (!verifyAgentOSSignature(signature, payload)) {
      console.error('❌ Invalid AgentOS webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    // Get distributor by affiliate code
    const supabase = await createServerClient()

    const distributorResult: any = await (supabase as any)
      .from('distributors')
      .select('id, first_name, last_name, email')
      .eq('affiliate_code', apex_rep_code)
      .single()

    if (distributorResult.error || !distributorResult.data) {
      console.error(`❌ Distributor not found: ${apex_rep_code}`)
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 })
    }

    const distributor = distributorResult.data

    // Log the sale event
    console.log(`✅ AgentOS sale credited to ${distributor.first_name} ${distributor.last_name} (${apex_rep_code})`)
    console.log(`   Subscriber: ${subscriber_name} (${subscriber_email})`)
    console.log(`   MRR: $${mrr}`)

    // TODO: Create affiliate_conversions record
    // TODO: Trigger commission calculation
    // TODO: Send notification to distributor

    // For now, just acknowledge receipt
    return NextResponse.json({
      success: true,
      message: `Sale credited to ${apex_rep_code}`,
      distributor_id: distributor.id
    })

  } catch (error: unknown) {
    console.error('❌ Error in subscription-created webhook:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
