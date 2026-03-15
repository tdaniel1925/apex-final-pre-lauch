/**
 * AgentOS Webhook: Subscription Updated
 *
 * Receives notification when customer upgrades/downgrades AgentOS subscription
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { verifyAgentOSSignature } from '@/lib/agentos/webhooks'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('📥 AgentOS webhook: subscription-updated')

    // Parse payload
    const payload = await request.json()
    const {
      apex_rep_code,
      subscriber_id,
      subscriber_email,
      subscriber_name,
      mrr,
      metadata,
      timestamp
    } = payload

    const { old_mrr, new_mrr } = metadata || {}

    // Verify signature
    const signature = request.headers.get('x-webhook-signature') || ''
    if (!verifyAgentOSSignature(signature, payload)) {
      console.error('❌ Invalid AgentOS webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    // Get distributor
    const supabase = await createServerClient()

    const distributorResult: any = await (supabase as any)
      .from('distributors')
      .select('id, first_name, last_name')
      .eq('affiliate_code', apex_rep_code)
      .single()

    if (distributorResult.error || !distributorResult.data) {
      console.error(`❌ Distributor not found: ${apex_rep_code}`)
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 })
    }

    const distributor = distributorResult.data

    // Log the update
    const changeType = new_mrr > old_mrr ? 'UPGRADE' : 'DOWNGRADE'
    console.log(`✅ AgentOS ${changeType} for ${distributor.first_name} ${distributor.last_name}`)
    console.log(`   Subscriber: ${subscriber_name}`)
    console.log(`   MRR: $${old_mrr} → $${new_mrr}`)

    // TODO: Update commission calculations
    // TODO: Send notification to distributor

    return NextResponse.json({
      success: true,
      message: `${changeType} recorded for ${apex_rep_code}`,
      distributor_id: distributor.id
    })

  } catch (error: unknown) {
    console.error('❌ Error in subscription-updated webhook:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
