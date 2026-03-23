# AI Phone Provisioning System
## Apex Affinity Group Network Marketing

**Status:** ✅ Complete
**Date:** 2026-03-23
**Branch:** `ai-command-center`

---

## Overview

This system automatically provisions AI-powered phone numbers for new Apex distributors when they sign up. The AI assistant answers calls 24/7, builds excitement about the Apex opportunity, handles objections, and collects lead information.

### Key Features

- **Instant AI Phone Provisioning**: New distributors get their own AI phone number immediately upon signup
- **Network Marketing AI Prompt**: Customized AI that sells prospects on becoming Apex reps
- **24-Hour Free Trial**: 20 free minutes to test the AI before upgrading
- **Area Code Matching**: Phone numbers provisioned with area code matching the prospect's location
- **Welcome Page**: Celebration page showing new phone number with call-to-action
- **Dashboard Integration**: AI phone stats and usage displayed on distributor dashboard

---

## System Architecture

### 1. **Libraries Copied from AI Agents Project**

#### VAPI Library (`src/lib/vapi/`)
- `client.ts` - VAPI API client for creating assistants and provisioning phone numbers
- `assistants.ts` - Industry-specific AI prompts (insurance, CPA, law, real estate, etc.)
- `prompts/network-marketing.ts` - **NEW** Network marketing AI prompt for Apex

#### Twilio Library (`src/lib/twilio/`)
- `client.ts` - Twilio client helpers (already existed in Apex)
- `provisioning.ts` - Phone number provisioning with area code fallback logic
- `a2p-helpers.ts` - A2P compliance helpers for SMS messaging services

### 2. **Database Schema**

**Migration:** `supabase/migrations/20260323000001_add_ai_phone_fields.sql`

#### New Columns in `distributors` Table:
```sql
ai_phone_number TEXT                    -- E.164 format (e.g., +12145551234)
ai_phone_number_sid TEXT                -- Twilio phone number SID
vapi_assistant_id TEXT                  -- VAPI assistant ID
vapi_phone_number_id TEXT               -- VAPI phone number ID
ai_minutes_balance INTEGER DEFAULT 20   -- Free minutes remaining
ai_trial_expires_at TIMESTAMPTZ         -- 24-hour trial expiration
ai_provisioned_at TIMESTAMPTZ           -- When AI was provisioned
```

#### New Table: `ai_call_logs`
```sql
CREATE TABLE ai_call_logs (
  id UUID PRIMARY KEY,
  distributor_id UUID REFERENCES distributors(id),
  vapi_call_id TEXT,
  caller_number TEXT,
  ai_phone_number TEXT,
  duration_seconds INTEGER,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  transcript TEXT,
  call_summary TEXT,
  lead_quality TEXT CHECK (lead_quality IN ('hot', 'warm', 'cold', 'spam')),
  minutes_charged DECIMAL(10, 2),
  cost_usd DECIMAL(10, 4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Helper Functions:
- `is_ai_trial_active(distributor_id)` - Check if trial is still valid
- `deduct_ai_minutes(distributor_id, minutes_used)` - Deduct minutes from balance

### 3. **API Endpoints**

#### `POST /api/signup/provision-ai`
Provisions VAPI assistant + phone number for a distributor.

**Request Body:**
```typescript
{
  distributorId: string
  firstName: string
  lastName: string
  phone: string           // For area code extraction
  sponsorSlug?: string    // For personalized AI prompt
}
```

**Response:**
```typescript
{
  success: boolean
  phoneNumber?: string    // +12145551234
  assistantId?: string    // VAPI assistant ID
  error?: string
}
```

**Process:**
1. Get sponsor info from database
2. Generate personalized AI prompt with distributor's name, sponsor's name, and replicated site URL
3. Create VAPI assistant with network marketing prompt
4. Provision phone number (VAPI-managed, backed by Twilio)
5. Link assistant to phone number
6. Update distributor record with AI details
7. Set 20 free minutes and 24-hour trial expiration

#### `GET /api/signup/provision-ai?distributorId=xxx`
Check provisioning status and get AI phone details.

**Response:**
```typescript
{
  isProvisioned: boolean
  trialActive: boolean
  phoneNumber?: string
  minutesRemaining?: number
  trialExpiresAt?: string
  provisionedAt?: string
}
```

### 4. **Signup Flow Integration**

Modified `src/app/api/signup/route.ts`:

- After distributor is created, calls `/api/signup/provision-ai` asynchronously
- If AI provisioning succeeds, returns `redirectUrl: /signup/welcome?distributorId=xxx`
- If AI provisioning fails, logs error but doesn't fail signup (AI can be provisioned manually later)

### 5. **Welcome Page**

**File:** `src/app/signup/welcome/page.tsx`

Features:
- ✨ Confetti animation on load
- 📞 Large phone number display (tap to call on mobile)
- 📊 Stats cards showing free minutes and trial time remaining
- 📋 3-step onboarding guide ("Call your AI", "Share your number", "Complete enrollment")
- 🎨 Apex blue color scheme (#2c5aa0, #1a4075)
- 📱 Fully mobile-responsive

### 6. **Dashboard Integration**

**Component:** `src/components/dashboard/AIPhoneStats.tsx`
**Added to:** `src/app/dashboard/page.tsx`

Features:
- Displays AI phone number with click-to-call link
- Shows minutes remaining (warns when < 5 minutes)
- Shows trial time remaining (updates in real-time)
- Badge indicators: "Trial Active" or "Trial Ended"
- Call-to-action to upgrade when trial expires or minutes run low
- Auto-refreshes status on mount

---

## Network Marketing AI Prompt

**File:** `src/lib/vapi/prompts/network-marketing.ts`

### Prompt Highlights

The AI is trained to:

1. **Greet callers enthusiastically** and introduce itself as the distributor's AI assistant
2. **Build excitement** about having an AI ("pretty cool, right?")
3. **Explain Apex** as a network marketing company with real insurance products
4. **Handle common objections:**
   - "Is this MLM?" → Yes, and that's how people build wealth
   - "How much does it cost?" → One-time enrollment fee + monthly business center
   - "Can I really make money?" → Proven compensation plan, but requires effort
   - "Do I need to be licensed?" → Only if you want to sell insurance directly
5. **Schedule calls** with the distributor for interested prospects
6. **Collect lead information** (name, phone, email, best time to call)
7. **Encourage enrollment** with the distributor's replicated site URL
8. **Stay professional** - never overpromise, pressure, or guarantee income

### Personalization Variables

Each distributor's AI prompt is customized with:
- `{{FIRST_NAME}}` - Distributor's first name
- `{{LAST_NAME}}` - Distributor's last name
- `{{SPONSOR_NAME}}` - Sponsor's name (for credibility)
- `{{REPLICATED_SITE_URL}}` - Distributor's unique replicated site

---

## Environment Variables Required

Add these to `.env.local`:

```bash
# VAPI (Voice AI Platform)
VAPI_API_KEY=your_vapi_api_key

# Twilio (Phone Number Provider)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_MESSAGING_SERVICE_SID=your_messaging_service_sid  # Optional for SMS A2P

# App URL (for webhooks)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### How to Get API Keys

**VAPI:**
1. Sign up at https://vapi.ai
2. Go to Dashboard → API Keys
3. Create a new API key
4. Add to `.env.local` as `VAPI_API_KEY`

**Twilio:**
1. Sign up at https://twilio.com
2. Go to Console → Account Info
3. Copy Account SID and Auth Token
4. Add to `.env.local`

---

## Testing Instructions

### 1. **Apply Database Migration**

```bash
# Connect to Supabase
npx supabase db push

# Or apply manually via Supabase Dashboard
# Copy contents of supabase/migrations/20260323000001_add_ai_phone_fields.sql
# Paste into SQL Editor and run
```

### 2. **Verify Environment Variables**

```bash
# Check all required env vars are set
echo $VAPI_API_KEY
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN
echo $NEXT_PUBLIC_APP_URL
```

### 3. **Test End-to-End Signup Flow**

#### Step 1: Create a Test Account
```
1. Go to /signup
2. Fill out signup form with test data
3. Use a real phone number (for area code matching)
4. Submit form
```

#### Step 2: Check Logs
Watch the server logs for:
```
[Signup] Provisioning AI phone for distributor: <id>
   Creating VAPI assistant...
   ✅ Created VAPI assistant: <assistant_id>
   Provisioning phone number (area code: XXX)...
   ✅ Provisioned VAPI phone: +1XXXXXXXXXX
[Signup] AI phone provisioned successfully: +1XXXXXXXXXX
```

#### Step 3: Verify Welcome Page
```
1. After signup, should redirect to /signup/welcome?distributorId=xxx
2. Page should show:
   ✅ Confetti animation
   ✅ AI phone number in large text
   ✅ "20 Free Minutes" badge
   ✅ "24 Hour Trial" badge
   ✅ 3-step onboarding guide
```

#### Step 4: Test the AI
```
1. Call the provisioned phone number
2. AI should answer with greeting
3. AI should introduce itself as distributor's assistant
4. Ask the AI questions about Apex
5. Verify AI handles objections appropriately
```

#### Step 5: Check Dashboard
```
1. Login as the test distributor
2. Go to /dashboard
3. Verify AIPhoneStats widget appears
4. Should show:
   ✅ Phone number
   ✅ Minutes remaining (20)
   ✅ Trial time remaining (~24h)
```

### 4. **Test API Endpoints Directly**

#### Provision AI
```bash
curl -X POST http://localhost:3000/api/signup/provision-ai \
  -H "Content-Type: application/json" \
  -d '{
    "distributorId": "your-distributor-id",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+12145551234",
    "sponsorSlug": "apex-vision"
  }'
```

Expected response:
```json
{
  "success": true,
  "phoneNumber": "+12145551234",
  "assistantId": "asst_xxx"
}
```

#### Check Status
```bash
curl "http://localhost:3000/api/signup/provision-ai?distributorId=your-distributor-id"
```

Expected response:
```json
{
  "isProvisioned": true,
  "trialActive": true,
  "phoneNumber": "+12145551234",
  "minutesRemaining": 20,
  "trialExpiresAt": "2026-03-24T12:00:00Z",
  "provisionedAt": "2026-03-23T12:00:00Z"
}
```

---

## Files Created/Modified

### New Files
```
src/lib/vapi/client.ts                              (copied from AI Agents)
src/lib/vapi/assistants.ts                          (copied from AI Agents)
src/lib/vapi/prompts/network-marketing.ts           (NEW)
src/lib/twilio/provisioning.ts                      (NEW)
src/lib/twilio/a2p-helpers.ts                       (NEW)
src/app/api/signup/provision-ai/route.ts            (NEW)
src/app/signup/welcome/page.tsx                     (NEW)
src/components/dashboard/AIPhoneStats.tsx           (NEW)
supabase/migrations/20260323000001_add_ai_phone_fields.sql  (NEW)
```

### Modified Files
```
src/app/api/signup/route.ts                         (added AI provisioning call)
src/app/dashboard/page.tsx                          (added AIPhoneStats component)
```

---

## Cost Estimates

### VAPI Pricing (as of 2026)
- Phone number rental: ~$2/month
- Voice AI calls: ~$0.10/minute
- 20 free trial minutes = ~$2.00 of AI usage

### Twilio Pricing (if using Twilio-backed numbers)
- Phone number rental: ~$1/month
- Voice minutes: ~$0.01/minute

**Total Cost per Distributor (Monthly):**
- Trial users: $0 (first 24 hours)
- Paid users: ~$3-5/month for AI + phone number rental
- Per-minute usage: $0.10/min (charge distributors $0.15/min for profit margin)

---

## Future Enhancements

### Phase 2 (Recommended)
1. **Call Logs Dashboard** - Show transcript, duration, lead quality for each call
2. **Lead Auto-Capture** - Automatically create CRM contacts from AI call transcripts
3. **Minute Top-Up** - Stripe integration to buy more AI minutes
4. **Call Analytics** - Track conversion rates, peak call times, common objections
5. **Voicemail Detection** - Skip AI greeting if call goes to voicemail
6. **SMS Follow-Up** - Auto-send SMS after AI call with replicated site link
7. **Multi-Language Support** - Spanish, French, etc. for AI prompts
8. **Custom Voice Training** - Let distributors upload voice samples to clone their voice

### Phase 3 (Advanced)
1. **AI Calendar Integration** - Book appointments directly during call
2. **AI Drip Campaigns** - Outbound AI calls to warm leads
3. **Team AI Sharing** - Upline sponsors can share their AI with downline
4. **AI Performance Leaderboard** - Gamify who has the best-performing AI

---

## Troubleshooting

### Issue: AI phone number not provisioning

**Symptoms:** Signup succeeds but no phone number assigned

**Check:**
1. VAPI_API_KEY is set correctly
2. TWILIO credentials are valid
3. Check server logs for error details
4. Verify VAPI has available phone numbers in desired area codes

**Fix:**
- Run provisioning manually via API:
  ```bash
  curl -X POST /api/signup/provision-ai -d '{"distributorId":"xxx",...}'
  ```

### Issue: AI doesn't answer calls

**Symptoms:** Phone rings but AI doesn't pick up

**Check:**
1. VAPI assistant is created (check `distributors.vapi_assistant_id`)
2. Phone number is linked to assistant (check `distributors.vapi_phone_number_id`)
3. NEXT_PUBLIC_APP_URL is correct (for webhooks)

**Fix:**
- Update phone number webhooks:
  ```sql
  UPDATE distributors SET vapi_phone_number_id = NULL WHERE id = 'xxx';
  ```
  Then re-provision.

### Issue: Trial expired but still showing as active

**Symptoms:** Dashboard shows "Trial Active" even after 24 hours

**Check:**
1. Server time is correct (check `ai_trial_expires_at` vs current timestamp)
2. Trial expiration calculation is correct (NOW() + 24 hours)

**Fix:**
- Manually expire trial:
  ```sql
  UPDATE distributors SET ai_trial_expires_at = NOW() - INTERVAL '1 hour' WHERE id = 'xxx';
  ```

---

## Support

For issues with this system, contact:
- **VAPI Support:** https://vapi.ai/support
- **Twilio Support:** https://support.twilio.com
- **Apex Dev Team:** Slack #ai-phone-provisioning

---

## Changelog

### 2026-03-23 - Initial Release
- ✅ Copied VAPI/Twilio libraries from AI Agents project
- ✅ Created network marketing AI prompt
- ✅ Added database migration for AI phone fields
- ✅ Built AI provisioning API endpoint
- ✅ Integrated into signup flow
- ✅ Created welcome page with AI phone number
- ✅ Added dashboard widget for AI stats
- ✅ Wrote complete documentation and testing guide

---

**System Status:** Production Ready ✅
**Next Steps:** Test with real distributors and monitor call quality/conversion rates
