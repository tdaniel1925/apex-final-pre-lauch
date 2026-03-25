# APEX VOICE AGENT - COMPLETE IMPLEMENTATION SPEC

**Status:** Ready to implement
**Date:** 2026-03-25
**Context:** This spec defines the complete Apex Voice Agent system - a VAPI-powered AI phone assistant for every distributor.

---

## 🎯 CORE CONCEPT

Every Apex distributor gets their own AI-powered phone number (via VAPI) that:
1. Acts as their personal assistant when THEY call (Owner Mode)
2. Handles prospect calls professionally (Prospect Mode)
3. Sends SMS notifications for messages
4. Can be customized by paid Business Center subscribers

---

## 📋 COMPLETE REQUIREMENTS

### **1. Signup Flow**
- ✅ Collect 1-2 sentences about rep's interests/personality (simple text field)
- ✅ Use phone number from signup for caller ID detection
- ✅ Provision VAPI agent automatically during signup
- ✅ Pass bio + phone number to VAPI prompt

### **2. Caller Detection & Modes**

**Owner Mode (when rep calls their own number):**
- Detect via phone number matching
- **First call only:** Warm, engaging welcome: "Welcome to Apex Affinity Group! What would you like to know about your new AI Voice agent?"
- **Subsequent calls:** Simple greeting: "Hey [FirstName], how can I help you today?"
- Use bio for personalization (show off AI capabilities)
- Track via database field: `first_call_completed: boolean`

**Prospect Mode (when anyone else calls):**
- Answer questions about Apex opportunity
- Take messages
- Send SMS to rep: "New call: [message]"

### **3. Two-Tier System**

**FREE Tier (default):**
- Voice agent only discusses Apex business
- Takes messages
- Sends SMS notifications
- Cannot be customized

**PAID Tier ($39/month Business Center subscription):**
- Rep can fully customize voice agent via AI chatbot
- Agent can discuss anything rep programs
- Still sends SMS notifications
- Iterative refinement workflow

### **4. Welcome Page**
- Show voice agent phone number after signup
- Encourage rep to call it

### **5. Profile Section**
- Display "Apex Voice Agent" phone number
- Show subscription status (FREE vs PAID)
- Link to customize (if PAID tier)

### **6. AI Chatbot Tool (PAID tier only)**
- Add tool: `update_voice_agent_prompt`
- Workflow:
  1. Rep tells chatbot what they want agent to say/do
  2. Chatbot generates new prompt
  3. Shows preview: "I'll update your voice agent to [X]. Sound good?"
  4. Rep can refine: "Change this part..."
  5. Rep confirms: "Perfect!"
  6. Chatbot updates VAPI assistant

### **7. SMS Notifications**
- Triggered when prospect leaves message
- Format: "New call: [message]"
- Works for both FREE and PAID tiers
- Sent to rep's signup phone number

---

## 🗄️ DATABASE CHANGES

### **New Field: `distributors.first_call_completed`**

```sql
ALTER TABLE distributors
ADD COLUMN first_call_completed BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN distributors.first_call_completed IS
'Tracks if distributor has called their voice agent for the first time.
Used to show special welcome message on first call only.';
```

### **Existing Fields (already in use):**
- `distributors.bio` - 1-2 sentences about rep (for personalization)
- `distributors.phone` - Rep's phone number (for caller ID detection)
- `distributors.ai_phone_number` - VAPI phone number assigned to rep
- `distributors.vapi_assistant_id` - VAPI assistant ID
- `distributors.business_center_tier` - FREE, Basic, Enhanced, Platinum

---

## 🔧 IMPLEMENTATION PHASES

### **Phase 1: Database & Signup Form**

**Files to modify:**
1. `supabase/migrations/[timestamp]_add_first_call_completed.sql`
   - Add `first_call_completed` column

2. `src/components/forms/SignupForm.tsx`
   - Add bio field after address fields
   - Label: "Tell us about yourself (1-2 sentences)"
   - Placeholder: "Example: I'm a former teacher passionate about helping families..."
   - Optional field (can skip)

3. `src/lib/validations/signup.ts`
   - Add bio validation (optional, max 500 chars)

4. `src/app/api/signup/route.ts`
   - Pass bio to VAPI provisioning call

---

### **Phase 2: VAPI Prompt with Caller Detection**

**File:** `src/lib/vapi/prompts/network-marketing.ts`

**New Interface:**
```typescript
export interface NetworkMarketingPromptVariables {
  firstName: string
  lastName: string
  sponsorName: string
  replicatedSiteUrl: string
  distributorPhone: string      // ← NEW: For caller ID detection
  distributorBio?: string        // ← NEW: For Owner Mode personalization
  firstCallCompleted: boolean   // ← NEW: Show welcome or not
  businessCenterTier: string    // ← NEW: FREE vs PAID tier
}
```

**Prompt Structure:**
```typescript
export function generateNetworkMarketingPrompt(variables) {
  const {
    firstName,
    lastName,
    distributorPhone,
    distributorBio,
    firstCallCompleted,
    businessCenterTier
  } = variables

  return `You are ${firstName} ${lastName}'s Apex Voice Agent.

## CALLER DETECTION

The caller's number is: {{call.customer.number}}
${firstName}'s number is: ${distributorPhone}

If caller number matches ${distributorPhone}:
  → OWNER MODE (${firstName} is calling)

If caller number does NOT match:
  → PROSPECT MODE (someone else calling)

---

## OWNER MODE (When ${firstName} calls)

${!firstCallCompleted ? `
**FIRST CALL - SPECIAL WELCOME:**

"Welcome to Apex Affinity Group! I'm your personal AI Voice Agent, and I'm here to help you build your Apex business. What would you like to know about me?"

Be warm, engaging, and conversational. Show off your AI capabilities:
- Reference their background naturally
- Explain what you can do for them
- Ask what they're most excited about with Apex
- Make it fun and impressive!

${distributorBio ? `About ${firstName}: ${distributorBio}` : ''}

After this first conversation, the system will mark first_call_completed=true.
` : `
**RETURNING CALL - SIMPLE GREETING:**

"Hey ${firstName}, how can I help you today?"

Be friendly and helpful. You're their assistant.
`}

**Owner Mode Capabilities:**
- Friendly conversation
- Answer their questions about Apex
- Help them practice pitches
- Provide encouragement
- Use their bio to personalize: ${distributorBio || 'N/A'}

---

## PROSPECT MODE (When others call)

${businessCenterTier === 'free' ? `
**FREE TIER - APEX ONLY:**

"Hi! You've reached ${firstName} ${lastName}'s Apex business line. I'm their AI assistant. How can I help you today?"

You can ONLY discuss:
- Apex Affinity Group opportunity
- AI products (PulseGuard, PulseFlow, etc.)
- Insurance products (if licensed)
- Schedule callback with ${firstName}

**Take a message:**
- Get their name and question/interest
- Confirm you'll have ${firstName} call them back
- End with: "I'll send ${firstName} your message right away!"

After call ends, send SMS to ${firstName}.
` : `
**PAID TIER - CUSTOM PROGRAMMING:**

[Custom prompt will be inserted here when rep programs via chatbot]

You can discuss whatever ${firstName} has programmed you to discuss.

Still take messages and send SMS notifications.
`}

---

## TONE & STYLE

**Owner Mode:** Warm, friendly, personalized, impressive
**Prospect Mode (FREE):** Professional, helpful, Apex-focused
**Prospect Mode (PAID):** As programmed by rep

---

## IMPORTANT VAPI VARIABLES

- {{call.customer.number}} - Caller's phone number
- Use this to detect Owner vs Prospect mode
`
}
```

---

### **Phase 3: Update Provision-AI Route**

**File:** `src/app/api/signup/provision-ai/route.ts`

**Changes:**
```typescript
// Fetch distributor data
const { data: distributor } = await supabase
  .from('distributors')
  .select('slug, bio, phone, first_call_completed, business_center_tier')
  .eq('id', distributorId)
  .single()

// Generate prompt with new variables
const systemPrompt = generateNetworkMarketingPrompt({
  firstName,
  lastName,
  sponsorName,
  replicatedSiteUrl,
  distributorPhone: distributor.phone || phone,      // ← NEW
  distributorBio: distributor.bio || undefined,      // ← NEW
  firstCallCompleted: distributor.first_call_completed || false,  // ← NEW
  businessCenterTier: distributor.business_center_tier || 'free', // ← NEW
})
```

---

### **Phase 4: Welcome Page**

**File:** `src/app/signup/welcome/page.tsx`

**Add section:**
```tsx
{/* Apex Voice Agent */}
{aiPhoneNumber && (
  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-purple-200">
    <div className="flex items-center gap-3 mb-4">
      <Phone className="w-8 h-8 text-purple-600" />
      <h3 className="text-xl font-bold text-gray-900">
        Your Apex Voice Agent
      </h3>
    </div>

    <p className="text-gray-700 mb-4">
      You now have your own AI-powered phone assistant! Give it a call to see what it can do.
    </p>

    <div className="bg-white rounded-lg p-4 mb-4">
      <p className="text-sm text-gray-600 mb-2">Call your Voice Agent:</p>
      <p className="text-2xl font-bold text-purple-600">
        {formatPhoneNumber(aiPhoneNumber)}
      </p>
    </div>

    <p className="text-sm text-gray-600">
      💡 Your AI assistant will welcome you and show you what it can do!
    </p>
  </div>
)}
```

---

### **Phase 5: Profile Page**

**File:** `src/app/dashboard/profile/page.tsx`

**Add section:**
```tsx
{/* Apex Voice Agent */}
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-lg font-semibold mb-4">Apex Voice Agent</h3>

  <div className="space-y-4">
    <div>
      <label className="text-sm text-gray-600">Your AI Phone Number</label>
      <p className="text-xl font-bold text-gray-900">
        {formatPhoneNumber(distributor.ai_phone_number)}
      </p>
    </div>

    <div>
      <label className="text-sm text-gray-600">Subscription</label>
      <p className="text-lg font-semibold">
        {businessCenterTier === 'free' ? (
          <span className="text-gray-700">FREE Tier (Apex Only)</span>
        ) : (
          <span className="text-purple-600">PAID Tier (Customizable)</span>
        )}
      </p>
    </div>

    {businessCenterTier !== 'free' && (
      <Link
        href="/dashboard/ai-assistant?customize=voice"
        className="btn-primary"
      >
        Customize Voice Agent
      </Link>
    )}
  </div>
</div>
```

---

### **Phase 6: VAPI Webhooks for SMS**

**New File:** `src/app/api/vapi/webhooks/route.ts`

```typescript
/**
 * VAPI Webhook Handler
 * Called when calls end to send SMS notifications
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendSMS } from '@/lib/twilio/sms'

export async function POST(request: NextRequest) {
  const body = await request.json()

  // VAPI sends call completion data
  const {
    assistantId,
    call,
    messages,
  } = body

  // Find distributor by VAPI assistant ID
  const supabase = createServiceClient()
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, first_name, phone, ai_phone_number')
    .eq('vapi_assistant_id', assistantId)
    .single()

  if (!distributor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const callerNumber = call.customer.number

  // Check if caller is the owner
  const isOwner = callerNumber === distributor.phone

  if (isOwner) {
    // Owner called - check if this was their first call
    const { data: dist } = await supabase
      .from('distributors')
      .select('first_call_completed')
      .eq('id', distributor.id)
      .single()

    if (!dist?.first_call_completed) {
      // Mark first call as completed
      await supabase
        .from('distributors')
        .update({ first_call_completed: true })
        .eq('id', distributor.id)
    }

    // No SMS for owner calls
    return NextResponse.json({ success: true })
  }

  // Prospect called - extract message and send SMS
  const transcript = messages.map(m => m.content).join(' ')

  await sendSMS({
    to: distributor.phone,
    message: `New call: ${transcript.substring(0, 150)}...`,
  })

  return NextResponse.json({ success: true })
}
```

**Update VAPI Assistant Creation:**

In `src/app/api/signup/provision-ai/route.ts`, add webhook URL:

```typescript
const assistant = await createVapiAssistant({
  // ... existing config
  serverUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/vapi/webhooks`,
  serverUrlSecret: process.env.VAPI_WEBHOOK_SECRET,
})
```

---

### **Phase 7: AI Chatbot Tool (PAID tier)**

**New File:** `src/app/api/dashboard/ai-chat/tools/update-voice-agent.ts`

```typescript
/**
 * AI Chat Tool: Update Voice Agent Prompt
 * Allows PAID tier users to customize their VAPI agent via chatbot
 */

import { createServiceClient } from '@/lib/supabase/service'
import { generateNetworkMarketingPrompt } from '@/lib/vapi/prompts/network-marketing'

export const updateVoiceAgentTool = {
  name: 'update_voice_agent_prompt',
  description: 'Update the user\'s Apex Voice Agent with custom programming (PAID tier only)',
  parameters: {
    type: 'object',
    properties: {
      customPrompt: {
        type: 'string',
        description: 'The custom instructions for what the voice agent should say and do when prospects call'
      },
      previewMode: {
        type: 'boolean',
        description: 'If true, just show preview without updating. If false, apply the update.'
      }
    },
    required: ['customPrompt', 'previewMode']
  },

  async execute({ customPrompt, previewMode, distributorId }) {
    const supabase = createServiceClient()

    // Check if user has PAID tier
    const { data: dist } = await supabase
      .from('distributors')
      .select('business_center_tier, vapi_assistant_id, first_name, phone, bio')
      .eq('id', distributorId)
      .single()

    if (dist.business_center_tier === 'free') {
      return {
        success: false,
        message: 'Voice agent customization requires Business Center subscription ($39/month)'
      }
    }

    if (previewMode) {
      // Just show preview
      return {
        success: true,
        preview: customPrompt,
        message: `Here's how your voice agent will be programmed:\n\n"${customPrompt}"\n\nShould I apply this update?`
      }
    }

    // Apply the update
    const fullPrompt = generateNetworkMarketingPrompt({
      firstName: dist.first_name,
      // ... other variables
      businessCenterTier: dist.business_center_tier,
      customProspectPrompt: customPrompt  // ← Inject custom programming
    })

    // Update VAPI assistant
    await updateVapiAssistant(dist.vapi_assistant_id, fullPrompt)

    return {
      success: true,
      message: 'Your voice agent has been updated! Try calling it to test the new programming.'
    }
  }
}
```

**Register Tool:**

In `src/app/api/dashboard/ai-chat/route.ts`, add to tools array:

```typescript
import { updateVoiceAgentTool } from './tools/update-voice-agent'

const tools = [
  // ... existing tools
  updateVoiceAgentTool,
]
```

---

## 🧪 TESTING CHECKLIST

### **Test 1: Signup Flow**
- [ ] Bio field appears in signup form
- [ ] Can complete signup with bio filled
- [ ] Can complete signup with bio empty (optional)
- [ ] VAPI agent provisioned successfully
- [ ] Welcome page shows voice agent phone number

### **Test 2: First Call (Owner)**
- [ ] Rep calls their voice agent
- [ ] Receives special welcome message
- [ ] Agent references their bio naturally
- [ ] Conversation is warm and engaging
- [ ] `first_call_completed` set to TRUE in database

### **Test 3: Second Call (Owner)**
- [ ] Rep calls again
- [ ] Receives simple greeting: "Hey [Name], how can I help?"
- [ ] No special welcome message

### **Test 4: Prospect Call (FREE tier)**
- [ ] Different number calls voice agent
- [ ] Agent discusses Apex only
- [ ] Agent takes message
- [ ] Rep receives SMS: "New call: [message]"

### **Test 5: Customization (PAID tier)**
- [ ] Upgrade to Business Center subscription
- [ ] Ask chatbot to customize voice agent
- [ ] Chatbot shows preview
- [ ] Can refine and iterate
- [ ] Confirm and apply update
- [ ] Call voice agent - custom programming works

### **Test 6: Profile Page**
- [ ] Voice agent phone number displayed
- [ ] Subscription tier shown (FREE vs PAID)
- [ ] Customize link appears (PAID tier only)

---

## 🚀 DEPLOYMENT STEPS

1. **Run migration:**
   ```sql
   -- Add first_call_completed column
   ```

2. **Deploy code to production**

3. **Set environment variables:**
   ```
   VAPI_WEBHOOK_SECRET=<generate random secret>
   ```

4. **Test with real phone calls**

5. **Update existing users:**
   ```bash
   npx tsx scripts/update-vapi-with-caller-detection.ts
   ```

---

## 📝 OPEN QUESTIONS / FUTURE ENHANCEMENTS

1. Should we log all call transcripts to database?
2. Analytics dashboard for voice agent performance?
3. Call recording playback in dashboard?
4. Voice agent "training mode" for reps to practice?

---

## ✅ READY TO IMPLEMENT

All requirements are clear. Implementation can begin.

**Next Step:** Say "go" to start Phase 1 (Database & Signup Form).
