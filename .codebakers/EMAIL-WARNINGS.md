# EMAIL SYSTEM - CRITICAL WARNINGS

## ⚠️ DO NOT RUN EMAIL SCRIPTS MULTIPLE TIMES

**What happened**: 2026-03-13 - Sent 21 duplicate emails to 7 users by running script 3 times

**Rule**: ALWAYS check if emails were already sent before running any email script

**How to check**:
```sql
SELECT * FROM email_sends WHERE created_at > NOW() - INTERVAL '1 day';
```

## 📧 TWO SEPARATE EMAIL SYSTEMS

**System 1: Signup Welcome Emails (Automated)**
- **Purpose**: Send welcome email with login credentials when someone signs up
- **Code**: `src/lib/email/send-welcome.ts`
- **Called by**: `src/app/api/signup/route.ts` (Step 8b)
- **Template**: Hardcoded in send-welcome.ts (not in database)

**System 2: Prospect Nurture Campaigns (Rep-initiated)**
- **Purpose**: Reps send AI-generated 6-email sequences to prospects
- **Tables**: `email_campaigns`, `email_templates`, `email_credits`
- **Code**: `src/lib/email/campaign-service.ts`
- **Used by**: Email marketing page at `/email-marketing`

## ✅ Correct Welcome Email Template

**Location**: `src/lib/email/send-welcome.ts`

**Format**:
- Apex logo at top (from https://reachtheapex.net/apex-logo-email.png)
- "Welcome to Apex Affinity Group, {FIRST_NAME}!"
- Body: "We're thrilled to have you join our team! Your journey to building a successful insurance business starts now."
- **🔑 Your Login Credentials** box with:
  - Username: {email}
  - Login URL: https://reachtheapex.net/dashboard
- Next steps bullet list
- "Go to Your Dashboard" button
- Footer with company address

## ❌ DO NOT CONFUSE THESE

1. **Verification email** (`src/lib/email/send-verification.ts`) - For email verification ONLY, not welcome
2. **Prospect campaign emails** (`email_templates` table) - For rep → prospect nurturing, not signup
3. **Campaign enrollment** (`enrollInCampaign()`) - For prospect campaigns, not signup

## ✅ Fixed (2026-03-13)

- Removed broken `enrollInCampaign()` call from signup flow
- Created clean `send-welcome.ts` with hardcoded template
- Signup now sends welcome email correctly via `sendWelcomeEmail()`
