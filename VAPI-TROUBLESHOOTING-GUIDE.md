# VAPI Integration Troubleshooting Guide

## Overview

This guide covers common issues with VAPI (Voice AI Platform) integration during the signup process.

## VAPI Agent Creation Flow

```
Signup Submit
    ↓
Create Auth User
    ↓
Create Distributor
    ↓
Create Member
    ↓
[ASYNC] Call /api/signup/provision-ai
    ↓
Create VAPI Assistant
    ↓
Buy VAPI Phone Number
    ↓
Update Distributor Record
```

## Common Issues

### 1. VAPI Agent Not Created

**Symptom**: After signup, `vapi_assistant_id` is null in distributor record.

**Possible Causes**:

1. **Missing VAPI API Key**
   ```bash
   # Check .env.local
   VAPI_API_KEY="your-key-here"
   ```

2. **API Provisioning Failed Silently**
   - Check application logs
   - Look for errors in `/api/signup/provision-ai`

3. **Async Process Still Running**
   - AI provisioning runs asynchronously
   - May take 10-30 seconds
   - Wait and query again

**Solution**:
```bash
# Check logs
tail -f .next/server-logs.log | grep provision-ai

# Query distributor record after 30 seconds
SELECT vapi_assistant_id, ai_phone_number, ai_provisioned_at
FROM distributors
WHERE id = 'xxx';
```

---

### 2. Phone Number Not Assigned

**Symptom**: `vapi_assistant_id` exists but `ai_phone_number` is null.

**Possible Causes**:

1. **No Available Numbers in Area Code**
   - VAPI tries requested area code first
   - Then tries nearby area codes
   - Finally tries any US number

2. **VAPI Phone Number Purchase Failed**
   - Check VAPI account balance
   - Verify account has phone number quota

**Solution**:
```typescript
// Check provisioning logs
console.log('📞 Provisioning phone number (area code: 214)...')
console.log('   Trying primary area code: 214')
console.log('   Trying nearby area codes: 469, 972')
console.log('   Falling back to any US number')
```

**Manual Fix**:
```bash
# Manually buy phone number via VAPI dashboard
# Then update distributor record
UPDATE distributors
SET ai_phone_number = '+12025551234',
    vapi_phone_number_id = 'phone_xyz123'
WHERE id = 'xxx';
```

---

### 3. Area Code Not Matching

**Symptom**: Phone number has different area code than distributor's phone.

**Cause**: Requested area code not available, fallback area code used.

**Expected Behavior**: This is normal. VAPI tries:
1. Exact area code match
2. Nearby area codes (Dallas: 214 → 469, 972)
3. Any US number

**Solution**: No action needed - this is by design.

---

### 4. Assistant Created But Not Working

**Symptom**: Can call number but agent doesn't respond or sounds robotic.

**Possible Causes**:

1. **System Prompt Not Set**
   - Check assistant creation code
   - Verify prompt includes distributor name, sponsor, etc.

2. **Voice Configuration Issues**
   - Voice provider not set
   - Voice ID invalid

**Verification**:
```bash
# Check VAPI assistant via API
curl https://api.vapi.ai/assistant/{assistantId} \
  -H "Authorization: Bearer YOUR_VAPI_KEY"
```

**Expected Response**:
```json
{
  "id": "asst_xxx",
  "name": "John Doe - Apex AI",
  "model": {
    "provider": "openai",
    "model": "gpt-4",
    "systemPrompt": "You are an AI assistant for John Doe..."
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "21m00Tcm4TlvDq8ikWAM"
  }
}
```

---

### 5. "Recording Not Enabled" Issue

**Symptom**: Call recordings not saved in VAPI dashboard.

**Solution**: Verify recording enabled in assistant config:
```typescript
const assistant = await createVapiAssistant({
  name: `${firstName} ${lastName} - Apex AI`,
  recordingEnabled: true, // ← Must be true
  // ...
});
```

---

### 6. Multiple Agents Created for Same User

**Symptom**: User has multiple VAPI assistants/phone numbers.

**Cause**:
- Signup process ran multiple times
- Provision-AI endpoint called multiple times

**Solution**:
```sql
-- Find duplicate agents
SELECT distributor_id, vapi_assistant_id, ai_phone_number
FROM distributors
WHERE vapi_assistant_id IS NOT NULL
GROUP BY distributor_id
HAVING COUNT(*) > 1;

-- Keep latest, delete old VAPI resources
-- Use VAPI dashboard to delete old assistants
```

---

### 7. VAPI API Rate Limiting

**Symptom**: `429 Too Many Requests` from VAPI API.

**Cause**: Too many assistant/phone number creation requests.

**Solution**:
- Add exponential backoff retry logic
- Implement queue for provisioning requests
- Contact VAPI support to increase rate limits

---

### 8. Free Trial Minutes Not Set

**Symptom**: User has no `ai_minutes_balance` or `ai_trial_expires_at`.

**Solution**: Check provisioning code sets these fields:
```typescript
await supabase
  .from('distributors')
  .update({
    ai_minutes_balance: 20, // 20 free minutes
    ai_trial_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
  })
  .eq('id', distributorId)
```

---

## Verification Checklist

After signup, verify:

- [ ] `vapi_assistant_id` is set
- [ ] `ai_phone_number` is set (format: +1XXXXXXXXXX)
- [ ] `vapi_phone_number_id` is set
- [ ] `ai_minutes_balance` = 20
- [ ] `ai_trial_expires_at` is 24 hours from now
- [ ] `ai_provisioned_at` is set
- [ ] Can call phone number and agent responds

## Manual Provisioning (Emergency Fix)

If automated provisioning fails, manually provision:

### Step 1: Create VAPI Assistant

```bash
curl -X POST https://api.vapi.ai/assistant \
  -H "Authorization: Bearer YOUR_VAPI_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe - Apex AI",
    "model": {
      "provider": "openai",
      "model": "gpt-4",
      "systemPrompt": "You are an AI assistant..."
    },
    "voice": {
      "provider": "11labs",
      "voiceId": "21m00Tcm4TlvDq8ikWAM"
    },
    "recordingEnabled": true
  }'
```

Response:
```json
{ "id": "asst_abc123" }
```

### Step 2: Buy Phone Number

```bash
curl -X POST https://api.vapi.ai/phone-number/buy \
  -H "Authorization: Bearer YOUR_VAPI_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe - Apex",
    "assistantId": "asst_abc123",
    "areaCode": "214"
  }'
```

Response:
```json
{
  "id": "phone_xyz789",
  "number": "+12145551234"
}
```

### Step 3: Update Database

```sql
UPDATE distributors
SET
  vapi_assistant_id = 'asst_abc123',
  vapi_phone_number_id = 'phone_xyz789',
  ai_phone_number = '+12145551234',
  ai_minutes_balance = 20,
  ai_trial_expires_at = NOW() + INTERVAL '24 hours',
  ai_provisioned_at = NOW()
WHERE id = 'distributor-uuid-here';
```

## Monitoring VAPI Health

### Check VAPI Account Status

```bash
curl https://api.vapi.ai/account \
  -H "Authorization: Bearer YOUR_VAPI_KEY"
```

Response includes:
- Account balance
- Phone number quota
- API usage stats

### Check Individual Assistant

```bash
curl https://api.vapi.ai/assistant/{assistantId} \
  -H "Authorization: Bearer YOUR_VAPI_KEY"
```

### List All Phone Numbers

```bash
curl https://api.vapi.ai/phone-number \
  -H "Authorization: Bearer YOUR_VAPI_KEY"
```

## Debugging Tips

### 1. Enable Verbose Logging

In `src/app/api/signup/provision-ai/route.ts`:

```typescript
console.log('🤖 Provisioning AI for', firstName, lastName, distributorId)
console.log('   Creating VAPI assistant...')
console.log('   Provisioning phone number (area code: XX)...')
console.log('   ✅ Created VAPI assistant:', assistant.id)
console.log('   ✅ Provisioned VAPI phone:', vapiPhone.number)
```

### 2. Test VAPI Client Directly

```typescript
// scripts/test-vapi-client.ts
import { createVapiAssistant, buyVapiPhoneNumber } from '@/lib/vapi/client'

async function testVapi() {
  const assistant = await createVapiAssistant({
    name: 'Test Assistant',
    model: { provider: 'openai', model: 'gpt-4', systemPrompt: 'Hello' },
    voice: { provider: '11labs', voiceId: '21m00Tcm4TlvDq8ikWAM' },
    recordingEnabled: true,
    transcriber: { provider: 'deepgram', model: 'nova-2' },
  })

  console.log('Assistant created:', assistant.id)
}

testVapi()
```

### 3. Check Network/Firewall

VAPI API endpoints:
- `https://api.vapi.ai/assistant`
- `https://api.vapi.ai/phone-number`
- `https://api.vapi.ai/call`

Ensure these are not blocked by firewall/proxy.

## Error Codes Reference

| Code | Error | Solution |
|------|-------|----------|
| 401 | Unauthorized | Check VAPI_API_KEY is correct |
| 402 | Payment Required | Add credits to VAPI account |
| 429 | Too Many Requests | Add rate limiting/retry logic |
| 500 | Server Error | Contact VAPI support |

## Contact VAPI Support

If issues persist:
- **Dashboard**: https://dashboard.vapi.ai/
- **Documentation**: https://docs.vapi.ai/
- **Support Email**: support@vapi.ai
- **Discord**: https://discord.gg/vapi

## Related Documentation

- **VAPI Client Library**: `src/lib/vapi/client.ts`
- **Provisioning API**: `src/app/api/signup/provision-ai/route.ts`
- **System Prompts**: `src/lib/vapi/prompts/network-marketing.ts`
- **E2E Test**: `scripts/test-signup-e2e.ts`

---

**Last Updated**: 2026-03-25
