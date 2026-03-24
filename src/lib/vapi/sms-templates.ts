/**
 * Smart SMS Templates for Post-Call Follow-Up
 * Based on VAPI call analysis
 */

export interface CallAnalysis {
  duration: number // seconds
  summary?: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  endedReason?: string
}

export interface DistributorInfo {
  firstName: string
  lastName: string
  replicatedSiteUrl: string
  phone?: string
}

export interface SMSTemplate {
  templateName: string
  body: string
}

/**
 * Determine which SMS template to use based on call analysis
 */
export function determineSMSTemplate(
  callAnalysis: CallAnalysis,
  distributor: DistributorInfo
): SMSTemplate {
  const { duration, summary = '', sentiment, endedReason } = callAnalysis
  const { firstName, replicatedSiteUrl } = distributor

  // 🔥 HOT LEAD - Long call + positive sentiment
  if (duration > 180 && sentiment === 'positive') {
    return {
      templateName: 'hot_lead',
      body: `Great talking to you! 🎉

Based on our conversation, here's your next step:
👉 ${replicatedSiteUrl}

${firstName} will call you within 24 hours.

Questions? Just reply to this text!`,
    }
  }

  // ⏰ REQUESTED CALLBACK
  if (
    summary.toLowerCase().includes('callback') ||
    summary.toLowerCase().includes('call back') ||
    summary.toLowerCase().includes('follow up')
  ) {
    return {
      templateName: 'callback_requested',
      body: `Got it! ${firstName} will call you back soon.

In the meantime, check this out:
${replicatedSiteUrl}

Questions? Reply anytime!`,
    }
  }

  // ❓ HAD CONCERNS/OBJECTIONS
  if (
    sentiment === 'neutral' &&
    (summary.toLowerCase().includes('concern') ||
      summary.toLowerCase().includes('question') ||
      summary.toLowerCase().includes('skeptical'))
  ) {
    return {
      templateName: 'has_concerns',
      body: `Thanks for calling! I know you had some questions.

${firstName} specializes in addressing those concerns.

Want a callback? Reply YES

More info: ${replicatedSiteUrl}`,
    }
  }

  // 📞 SHORT CALL - Probably hung up quickly
  if (duration < 45) {
    return {
      templateName: 'short_call',
      body: `Thanks for calling about Apex!

Looks like we got disconnected. No worries!

More info: ${replicatedSiteUrl}

Or text back with questions!`,
    }
  }

  // 🚀 READY TO SIGN UP
  if (
    summary.toLowerCase().includes('sign up') ||
    summary.toLowerCase().includes('join') ||
    summary.toLowerCase().includes('ready to start')
  ) {
    return {
      templateName: 'ready_to_join',
      body: `🎉 Exciting! Let's get you started.

Sign up here: ${replicatedSiteUrl}/signup

You'll get your OWN AI assistant too!

Questions? Reply anytime!`,
    }
  }

  // 😞 NEGATIVE SENTIMENT - Be understanding
  if (sentiment === 'negative') {
    return {
      templateName: 'negative_sentiment',
      body: `Thanks for taking the time to call!

I understand this might not be the right fit for you right now.

If you change your mind: ${replicatedSiteUrl}

Best wishes!`,
    }
  }

  // 📋 DEFAULT - Generic thank you
  return {
    templateName: 'default_thank_you',
    body: `Hi! Thanks for calling about Apex.

${firstName} will follow up with you soon.

Questions? Just reply to this text!

- ${firstName}'s AI Assistant 🤖`,
  }
}

/**
 * Format phone number for display in SMS
 */
export function formatPhoneForDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '')

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }

  return phone
}
