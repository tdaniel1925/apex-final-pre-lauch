# Signup Flow with VAPI Integration - Visual Diagram

## Complete Signup Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER SUBMITS SIGNUP FORM                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Validate Form Data   │
                │  - Personal/Business  │
                │  - SSN/EIN format     │
                │  - Email/Slug unique  │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   Rate Limit Check    │
                │  (5 per IP/15 min)    │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Create Auth User     │
                │  (Supabase Auth)      │
                └───────────┬───────────┘
                            │
                            ▼
          ┌─────────────────────────────────┐
          │  Create Distributor (Atomic)    │
          │  - Find matrix placement        │
          │  - Insert distributor record    │
          │  - Set matrix position          │
          └─────────────┬───────────────────┘
                        │
                        ▼
          ┌─────────────────────────────────┐
          │     Create Member Record        │
          │  - Link to distributor          │
          │  - Set tech_rank: starter       │
          │  - Set status: active           │
          └─────────────┬───────────────────┘
                        │
                        ▼
          ┌─────────────────────────────────┐
          │   Store Tax Info (Encrypted)    │
          │  - SSN (personal) or EIN (biz)  │
          │  - Encrypt full number          │
          │  - Store last 4 visible         │
          └─────────────┬───────────────────┘
                        │
                        ▼
          ┌─────────────────────────────────┐
          │    Enroll in Email Campaign     │
          │  - Send welcome email           │
          │  - Add to Resend audience       │
          └─────────────┬───────────────────┘
                        │
                        ▼
          ┌─────────────────────────────────┐
          │  Create Replicated Sites        │
          │  (External platforms - async)   │
          └─────────────┬───────────────────┘
                        │
                        ▼
     ┌──────────────────────────────────────────┐
     │   🤖 Provision AI Phone (ASYNC)          │
     │   POST /api/signup/provision-ai          │
     └──────────────────┬───────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌───────────────────┐         ┌────────────────────┐
│ Create VAPI       │         │  Get Sponsor Info  │
│ Assistant         │         │  Get Replicated    │
│                   │         │  Site URL          │
│ - Name: John Doe  │         └────────────────────┘
│ - Model: GPT-4    │
│ - Voice: 11labs   │
│ - Recording: ON   │
└────────┬──────────┘
         │
         ▼
┌────────────────────────────┐
│   Buy VAPI Phone Number    │
│                            │
│ 1. Try requested area code │
│ 2. Try nearby area codes   │
│ 3. Fallback: any US number │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│  Update Distributor Record │
│                            │
│ - vapi_assistant_id        │
│ - ai_phone_number          │
│ - vapi_phone_number_id     │
│ - ai_minutes_balance: 20   │
│ - ai_trial_expires_at      │
│ - ai_provisioned_at        │
└────────┬───────────────────┘
         │
         ▼
    ┌────────┐
    │ DONE!  │
    └────────┘
```

## Database Records Created

```
┌──────────────────────────────────────────────────────────────────┐
│                         auth.users                               │
├──────────────────────────────────────────────────────────────────┤
│ id: uuid (auth_user_id)                                          │
│ email: user@example.com                                          │
│ encrypted_password: bcrypt hash                                  │
│ email_confirmed_at: timestamp                                    │
│ user_metadata: { first_name, last_name }                         │
└──────────────────────────────────────────────────────────────────┘
                              ▲
                              │ FK: auth_user_id
                              │
┌──────────────────────────────────────────────────────────────────┐
│                         distributors                             │
├──────────────────────────────────────────────────────────────────┤
│ id: uuid                                                         │
│ auth_user_id: uuid (FK → auth.users.id)                         │
│ email: user@example.com                                          │
│ first_name, last_name                                            │
│ slug: unique username                                            │
│ phone: phone number                                              │
│ sponsor_id: uuid (FK → distributors.id) ← ENROLLMENT TREE       │
│ matrix_parent_id: uuid (FK → distributors.id) ← MATRIX TREE     │
│ matrix_position: 1-7                                             │
│ matrix_depth: level in matrix                                    │
│ registration_type: 'personal' | 'business'                       │
│ licensing_status: 'licensed' | 'non_licensed'                    │
│ vapi_assistant_id: string (VAPI assistant ID)                    │
│ ai_phone_number: string (e.g., +12025551234)                     │
│ vapi_phone_number_id: string (VAPI phone ID)                     │
│ ai_minutes_balance: 20 (free trial minutes)                      │
│ ai_trial_expires_at: timestamp (24 hours)                        │
│ ai_provisioned_at: timestamp                                     │
│ created_at, updated_at                                           │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ FK: distributor_id
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                           members                                │
├──────────────────────────────────────────────────────────────────┤
│ member_id: AAG-XXXXXX (auto-generated)                           │
│ distributor_id: uuid (FK → distributors.id)                      │
│ email: user@example.com                                          │
│ full_name: First Last                                            │
│ enroller_id: AAG-XXXXXX (sponsor's member_id) - INSURANCE ONLY  │
│ sponsor_id: AAG-XXXXXX (same as enroller_id)                     │
│ tech_rank: 'starter'                                             │
│ insurance_rank: 'inactive'                                       │
│ status: 'active'                                                 │
│ personal_credits_monthly: 0                                      │
│ team_credits_monthly: 0                                          │
│ enrollment_date: timestamp                                       │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    distributor_tax_info                          │
├──────────────────────────────────────────────────────────────────┤
│ id: uuid                                                         │
│ distributor_id: uuid (FK → distributors.id)                      │
│ ssn_encrypted: encrypted SSN or EIN                              │
│ ssn_last_4: last 4 digits (visible)                              │
│ tax_id_type: 'ssn' | 'ein'                                       │
│ created_by: uuid (who created this record)                       │
│ created_at, updated_at                                           │
└──────────────────────────────────────────────────────────────────┘
```

## VAPI Resources Created

```
┌──────────────────────────────────────────────────────────────────┐
│                      VAPI Assistant                              │
├──────────────────────────────────────────────────────────────────┤
│ id: asst_xxxxxxxxxxxxx                                           │
│ name: "John Doe - Apex AI"                                       │
│ model:                                                           │
│   - provider: "openai"                                           │
│   - model: "gpt-4"                                               │
│   - systemPrompt: "You are an AI assistant for John Doe..."      │
│ voice:                                                           │
│   - provider: "11labs"                                           │
│   - voiceId: "21m00Tcm4TlvDq8ikWAM" (Rachel)                     │
│ firstMessage: "Hello! Thanks for calling..."                     │
│ recordingEnabled: true                                           │
│ transcriber:                                                     │
│   - provider: "deepgram"                                         │
│   - model: "nova-2"                                              │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ Linked via assistantId
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      VAPI Phone Number                           │
├──────────────────────────────────────────────────────────────────┤
│ id: phone_xxxxxxxxxxxxx                                          │
│ number: "+12025551234" (E.164 format)                            │
│ name: "John Doe - Apex"                                          │
│ provider: "twilio"                                               │
│ assistantId: asst_xxxxxxxxxxxxx                                  │
│ areaCode: "202" (requested or nearby)                            │
└──────────────────────────────────────────────────────────────────┘
```

## Test Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  E2E TEST SCRIPT FLOW                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Generate Test Data   │
                │  - Random email       │
                │  - Random phone       │
                │  - Test SSN/EIN       │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  POST /api/signup     │
                │  - Submit form data   │
                │  - Wait for response  │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Verify Response      │
                │  - Success: true      │
                │  - Distributor ID     │
                │  - AI provisioned     │
                └───────────┬───────────┘
                            │
                            ▼
           ┌────────────────────────────────┐
           │  Query Database (Supabase)     │
           │  - distributors table          │
           │  - members table               │
           │  - distributor_tax_info        │
           └────────────┬───────────────────┘
                        │
                        ▼
           ┌────────────────────────────────┐
           │  Verify VAPI (VAPI API)        │
           │  - GET /assistant/{id}         │
           │  - GET /phone-number/{id}      │
           └────────────┬───────────────────┘
                        │
                        ▼
           ┌────────────────────────────────┐
           │  Display Results               │
           │  - Success indicators          │
           │  - Test credentials            │
           │  - Phone number for testing    │
           └────────────┬───────────────────┘
                        │
                        ▼
           ┌────────────────────────────────┐
           │  Cleanup (if --cleanup flag)   │
           │  - Delete auth user            │
           │  - Delete VAPI assistant       │
           │  - Release phone number        │
           └────────────────────────────────┘
```

## Area Code Fallback Logic

```
User Phone: (214) 555-1234
    │
    ▼
Extract Area Code: 214
    │
    ▼
┌────────────────────────────────┐
│  Try Primary Area Code: 214    │
└───────────┬────────────────────┘
            │
            ├─ Available? ──► Use 214 ──► ✅ Phone: +12145551234
            │
            └─ Not Available
                   │
                   ▼
┌────────────────────────────────────────┐
│  Try Nearby Area Codes: 469, 972      │
└───────────┬────────────────────────────┘
            │
            ├─ 469 Available? ──► Use 469 ──► ✅ Phone: +14695551234
            │
            ├─ 972 Available? ──► Use 972 ──► ✅ Phone: +19725551234
            │
            └─ None Available
                   │
                   ▼
┌────────────────────────────────┐
│  Fallback: Any US Number       │
└───────────┬────────────────────┘
            │
            └─ Get Random ──► ✅ Phone: +13105551234
```

## Success Criteria

```
✅ Signup API
   └─ Response: { success: true, distributor: {...} }

✅ Database Records
   ├─ auth.users exists
   ├─ distributors exists
   │  ├─ matrix_position set
   │  ├─ vapi_assistant_id set
   │  └─ ai_phone_number set
   ├─ members exists
   │  ├─ status: 'active'
   │  └─ tech_rank: 'starter'
   └─ distributor_tax_info exists
      └─ ssn_encrypted or ein_encrypted set

✅ VAPI Resources
   ├─ Assistant exists in VAPI
   │  ├─ Model: GPT-4
   │  ├─ Voice: 11labs
   │  └─ Recording enabled
   └─ Phone Number exists in VAPI
      ├─ Number format: +1XXXXXXXXXX
      ├─ Provider: twilio
      └─ Linked to assistant
```

## Error Handling Flow

```
Error at any step
    │
    ▼
┌────────────────────────────┐
│  Rollback Transaction      │
│  - Delete auth user        │
│  - Delete distributor      │
│  - Delete member           │
│  - Delete tax info         │
└───────────┬────────────────┘
            │
            ▼
┌────────────────────────────┐
│  Log Error                 │
│  - Error message           │
│  - Stack trace             │
│  - Context data            │
└───────────┬────────────────┘
            │
            ▼
┌────────────────────────────┐
│  Return Error Response     │
│  - success: false          │
│  - error: error type       │
│  - message: user-friendly  │
└────────────────────────────┘
```

---

**Note**: This diagram shows the complete flow from user signup through VAPI agent provisioning. The test script validates each step in this flow.
