/**
 * AgentOS Integration - Webhook Helpers
 *
 * Two-way communication between Apex and AgentOS:
 * 1. Send distributor updates TO AgentOS
 * 2. Receive sales events FROM AgentOS
 */

import crypto from 'crypto'

const AGENTOS_WEBHOOK_URL = process.env.AGENTOS_WEBHOOK_URL!
const APEX_WEBHOOK_SECRET = process.env.APEX_WEBHOOK_SECRET!

// =============================================
// OUTBOUND: Apex → AgentOS
// =============================================

export interface DistributorSyncPayload {
  apex_rep_id: string
  apex_rep_code: string
  name: string
  email: string
  phone: string
  business_center_tier: 'free' | 'basic' | 'platinum'
}

/**
 * Notify AgentOS when new distributor is created
 */
export async function notifyAgentOSDistributorCreated(data: DistributorSyncPayload): Promise<void> {
  await sendToAgentOS('/api/webhooks/apex/distributor-created', data)
}

/**
 * Notify AgentOS when distributor is updated
 */
export async function notifyAgentOSDistributorUpdated(data: DistributorSyncPayload): Promise<void> {
  await sendToAgentOS('/api/webhooks/apex/distributor-updated', data)
}

/**
 * Notify AgentOS when distributor is deactivated
 */
export async function notifyAgentOSDistributorDeactivated(apex_rep_code: string): Promise<void> {
  await sendToAgentOS('/api/webhooks/apex/distributor-deactivated', { apex_rep_code })
}

/**
 * Send webhook to AgentOS with signature verification
 */
async function sendToAgentOS(path: string, payload: any): Promise<void> {
  const url = AGENTOS_WEBHOOK_URL + path
  const signature = generateSignature(payload)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`AgentOS webhook failed (${path}):`, errorText)
      throw new Error(`AgentOS webhook failed: ${response.status}`)
    }

    console.log(`✅ Sent to AgentOS: ${path}`)
  } catch (error) {
    console.error(`❌ Failed to send to AgentOS (${path}):`, error)
    // Don't throw - we don't want to break Apex if AgentOS is down
  }
}

// =============================================
// INBOUND: AgentOS → Apex
// =============================================

/**
 * Verify webhook signature from AgentOS
 * Use in webhook route handlers
 */
export function verifyAgentOSSignature(signature: string, payload: any): boolean {
  const expectedSignature = generateSignature(payload)
  return signature === expectedSignature
}

/**
 * Generate HMAC signature for webhook payload
 */
function generateSignature(payload: any): string {
  return crypto
    .createHmac('sha256', APEX_WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex')
}
