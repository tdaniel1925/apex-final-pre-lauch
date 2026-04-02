# Mass Email Privacy Policy

**MANDATORY REQUIREMENT: All mass emails MUST use BCC to protect recipient privacy.**

---

## The Problem

When sending mass emails to distributors/members, using the TO field exposes all recipient email addresses to everyone on the list. This is a **privacy violation**.

**Example of WRONG approach:**
```javascript
// ❌ PRIVACY VIOLATION
await fetch('https://api.resend.com/emails', {
  body: JSON.stringify({
    from: 'sender@example.com',
    to: [user1@example.com, user2@example.com, user3@example.com], // EXPOSED!
    subject: 'Update',
    html: emailHtml
  })
});
```

When recipients open this email, they can see ALL email addresses in the TO field.

---

## The Solution: BCC (Blind Carbon Copy)

**BCC = Blind Carbon Copy**

When you use BCC:
- Recipients receive the email
- Recipients **CANNOT** see other recipients' email addresses
- Privacy is protected

---

## How to Use BCC for Mass Emails

### Option 1: Use the `sendMassEmailBCC()` Function (Recommended)

```typescript
import { sendMassEmailBCC } from '@/lib/email/resend';

const result = await sendMassEmailBCC({
  recipients: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
  subject: 'Important Update',
  html: emailHtml,
  from: 'Apex Affinity Group <theapex@theapexway.net>',
});

if (result.success) {
  console.log('✅ Email sent with privacy protection');
  console.log(`📧 Email ID: ${result.id}`);
}
```

### Option 2: Use the `sendEmail()` Function with BCC Parameter

```typescript
import { sendEmail } from '@/lib/email/resend';

const result = await sendEmail({
  to: 'theapex@theapexway.net', // Send to sender (won't expose)
  bcc: ['user1@example.com', 'user2@example.com', 'user3@example.com'], // Private
  subject: 'Important Update',
  html: emailHtml,
  from: 'Apex Affinity Group <theapex@theapexway.net>',
});
```

### Option 3: Direct Resend API Call with BCC

```javascript
await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${RESEND_API_KEY}`
  },
  body: JSON.stringify({
    from: 'Apex Affinity Group <theapex@theapexway.net>',
    to: 'theapex@theapexway.net', // TO = sender
    bcc: recipients, // BCC = all recipients (private)
    subject: 'Important Update',
    html: emailHtml
  })
});
```

---

## Complete Example Script

See `send-mass-email-bcc-example.js` for a complete working example.

**Key features:**
- Fetches all non-test distributors from database
- Sends email with all recipients in BCC field
- Protects privacy by hiding recipient emails from each other
- Includes error handling and logging

---

## MANDATORY Rules

1. **ALWAYS use BCC for mass emails** to distributors, members, or any group
2. **NEVER expose recipient emails** in the TO field for mass sends
3. **Use `sendMassEmailBCC()`** function for simplicity and consistency
4. **Document any mass email scripts** with BCC requirement noted

---

## Files Updated

1. **`src/lib/email/resend.ts`**
   - Added `bcc` parameter to `SendEmailParams` interface
   - Added `bcc` support to `sendEmail()` function
   - Created `sendMassEmailBCC()` function for mass emails

2. **`CLAUDE.md`**
   - Added "Mass Email Privacy" as mandatory rule
   - Documented correct vs incorrect approaches
   - Made this a concrete requirement for all AI-assisted development

3. **`send-mass-email-bcc-example.js`**
   - Reference implementation for future mass emails
   - Shows correct BCC usage
   - Includes privacy protection notes

---

## Why This Matters

**Privacy:** Protects distributor/member email addresses from exposure

**Compliance:** Follows email privacy best practices

**Trust:** Shows respect for recipient privacy

**Security:** Prevents email harvesting and spam targeting

---

## Questions?

If you need to send a mass email:
1. Use `send-mass-email-bcc-example.js` as template
2. Or use `sendMassEmailBCC()` function in your code
3. Always verify recipients are in BCC field, not TO field

**This is a MANDATORY requirement - no exceptions.**
