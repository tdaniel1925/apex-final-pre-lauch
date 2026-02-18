# Email Domain Setup Instructions

## Current Status
✅ **Emails are working** using Resend's default onboarding email: `onboarding@resend.dev`

⚠️ **Custom domain not yet verified**: `theapexway.net`

## Next Steps to Use Your Own Domain

### 1. Verify Your Domain on Resend

1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter: `theapexway.net`
4. Follow Resend's instructions to add DNS records:
   - SPF record
   - DKIM records
   - DMARC record (optional but recommended)

### 2. Wait for Verification

- DNS propagation can take 24-48 hours
- Resend will verify automatically once DNS records are detected

### 3. Update Email Configuration

Once verified, update the sender email in:

**File**: `src/lib/email/resend.ts` (line 26)

```typescript
// Change from:
from = 'Apex Affinity Group <onboarding@resend.dev>',

// To:
from = 'Apex Affinity Group <noreply@theapexway.net>',
```

**File**: `src/app/api/alerts/photo-warning/route.ts` (line 30)

```typescript
// Change from:
from: 'Apex Alerts <onboarding@resend.dev>',

// To:
from: 'Apex Alerts <alerts@theapexway.net>',
```

### 4. Recommended Email Addresses

- **Welcome emails**: `noreply@theapexway.net`
- **Alerts/notifications**: `alerts@theapexway.net`
- **Support emails**: `support@theapexway.net`

## Why Use a Custom Domain?

✅ **Professional appearance** - Emails from @theapexway.net look more trustworthy
✅ **Better deliverability** - Custom domains have higher inbox rates
✅ **Brand consistency** - Matches your website and business name
✅ **Email analytics** - Track opens, clicks, and engagement

## Current Configuration

All emails are sent from: `onboarding@resend.dev`

This works immediately without any domain setup, but recipients will see "resend.dev" in the sender address.
