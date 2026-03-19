# Email Template System - Enforcement & Usage Guide
**Status:** MANDATORY - All emails must follow these standards
**Last Updated:** March 19, 2026

---

## ✅ THE APPROVED PROFESSIONAL TEMPLATE

**Location:** `src/lib/email/templates/base-email-template.html`

**Design Approved By User:** YES ✅
**Quote:** "that template is perfect!!!!! make sure we always use this it is excellnet!"

This is now the **ONLY** approved email template for all system communications.

---

## 🚨 MANDATORY RULES (NO EXCEPTIONS)

### Rule 1: Email Domain
```
✅ ALWAYS: emails@theapexway.net
✅ ALWAYS: support@theapexway.net
✅ ALWAYS: noreply@theapexway.net
❌ NEVER: @reachtheapex.net
❌ NEVER: @notifications.anything
❌ NEVER: Any other domain
```

**Enforcement:** `send-template-email.ts` throws error if domain is not `@theapexway.net`

### Rule 2: Template System
```
✅ ALWAYS: Use base-email-template.html as wrapper
✅ ALWAYS: Create content in src/lib/email/templates/[name].html
✅ ALWAYS: Use sendTemplateEmail() utility function
❌ NEVER: Call resend.emails.send() directly
❌ NEVER: Create inline HTML in code
❌ NEVER: Use different template structure
```

### Rule 3: Design Standards
```
✅ ALWAYS: Professional corporate tone
✅ ALWAYS: Navy blue (#2c5aa0) for primary elements
✅ ALWAYS: Gray tones for text (#212529, #495057, #6c757d)
❌ NEVER: Emojis (unless specifically requested for that one email)
❌ NEVER: Purple gradients
❌ NEVER: Bright playful colors
❌ NEVER: Casual language
```

### Rule 4: Error Handling
```
✅ ALWAYS: Check result.error before logging success
✅ ALWAYS: Access result.data.id (NOT result.id)
✅ ALWAYS: Log failures to console with full context
❌ NEVER: Silent failures
❌ NEVER: Assume send succeeded without checking
```

---

## 📝 HOW TO CREATE A NEW EMAIL

### Step 1: Create Content Template

**File:** `src/lib/email/templates/[your-email-name].html`

```html
<!-- Professional greeting -->
<p style="color: #212529; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
    Dear {{recipient_name}},
</p>

<!-- Your content here using approved styles -->

<!-- Professional closing -->
<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 24px 0 0 0;">
    <strong>The Apex Team</strong>
</p>
```

**Approved Style Guide:**

```html
<!-- Headers -->
<h2 style="color: #2c5aa0; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">
    Section Title
</h2>

<!-- Body text -->
<p style="color: #212529; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
    Regular paragraph text
</p>

<!-- Info box (blue) -->
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-left: 3px solid #2c5aa0; margin: 0 0 24px 0;">
    <tr>
        <td style="padding: 24px;">
            <h3 style="color: #2c5aa0; margin: 0 0 12px 0; font-size: 17px; font-weight: 600;">
                Info Title
            </h3>
            <p style="color: #495057; font-size: 15px; line-height: 1.6; margin: 0;">
                Info content
            </p>
        </td>
    </tr>
</table>

<!-- Warning box (amber) -->
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 3px solid #856404; margin: 0 0 28px 0;">
    <tr>
        <td style="padding: 24px;">
            <h3 style="color: #856404; margin: 0 0 12px 0; font-size: 17px; font-weight: 600;">
                Warning Title
            </h3>
            <p style="color: #856404; font-size: 15px; line-height: 1.6; margin: 0;">
                Warning content
            </p>
        </td>
    </tr>
</table>

<!-- CTA Button -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 28px 0;">
    <tr>
        <td align="center" style="padding: 20px 0;">
            <a href="{{button_url}}" style="display: inline-block; background-color: #2c5aa0; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 4px; font-size: 15px; font-weight: 600;">
                Button Text
            </a>
        </td>
    </tr>
</table>

<!-- List with borders -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 28px 0;">
    <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
            <p style="color: #212529; font-size: 15px; line-height: 1.6; margin: 0;">
                <strong>Item Label:</strong> Description
            </p>
        </td>
    </tr>
</table>
```

### Step 2: Send the Email

```typescript
import { sendTemplateEmail } from '@/lib/email/send-template-email';

const result = await sendTemplateEmail({
  to: 'user@example.com',
  subject: 'Professional Subject Line',
  templateName: 'your-email-name', // Filename without .html
  variables: {
    recipient_name: 'John Doe',
    email_title: 'Page Title',
    button_url: 'https://theapexway.net/action',
    unsubscribe_url: 'https://theapexway.net/unsubscribe',
    // Add any {{variables}} from your template
  },
  from: 'theapex@theapexway.net', // Optional, defaults to this
});

// ALWAYS check result
if (result.success) {
  console.log('✅ Email sent:', result.messageId);
  // Store messageId in database for tracking
} else {
  console.error('❌ Email failed:', result.error);
  // Handle error appropriately
}
```

---

## 🔍 CODE REVIEW CHECKLIST

Before any email code is committed, verify:

- [ ] Uses `@theapexway.net` domain
- [ ] Uses `sendTemplateEmail()` utility
- [ ] Template file in `src/lib/email/templates/`
- [ ] Follows approved color scheme (navy blue, grays)
- [ ] No emojis (unless specifically approved for this email)
- [ ] Professional, corporate tone
- [ ] Checks `result.error` before logging
- [ ] Accesses `result.data.id` (not `result.id`)
- [ ] Handles failures appropriately

---

## 🚫 COMMON MISTAKES TO AVOID

### ❌ Wrong Domain
```typescript
// WRONG
from: 'notifications@reachtheapex.net'

// CORRECT
from: 'theapex@theapexway.net'
```

### ❌ Direct Resend Call
```typescript
// WRONG
await resend.emails.send({ from, to, subject, html })

// CORRECT
await sendTemplateEmail({ to, subject, templateName, variables })
```

### ❌ Wrong Response Access
```typescript
// WRONG
console.log(`Sent! ID: ${result.id}`); // undefined!

// CORRECT
console.log(`Sent! ID: ${result.data?.id}`);
```

### ❌ No Error Checking
```typescript
// WRONG
const result = await sendEmail();
console.log('✅ Sent!'); // Might have failed!

// CORRECT
const result = await sendEmail();
if (result.error) {
  console.error('Failed:', result.error);
} else {
  console.log('✅ Sent!', result.messageId);
}
```

### ❌ Playful Design
```typescript
// WRONG
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
🚀 New Feature!

// CORRECT
background-color: #2c5aa0
New Feature Available
```

---

## 📊 COLOR PALETTE REFERENCE

**PRIMARY**
- Navy Blue: `#2c5aa0` - Headers, CTAs, brand elements
- White: `#ffffff` - Backgrounds

**TEXT**
- Dark: `#212529` - Primary text
- Medium: `#495057` - Secondary text
- Light: `#6c757d` - Tertiary text, notes

**BACKGROUNDS**
- Light Gray: `#f8f9fa` - Info boxes
- Lighter Gray: `#e9ecef` - Borders, footer
- Amber: `#fff3cd` - Warning boxes (use with `#856404` text)

**BORDERS**
- Primary: `#2c5aa0` - Important sections
- Light: `#dee2e6` - List separators
- Warning: `#856404` - Alert sections

---

## 🎨 APPROVED EXAMPLES

### Example 1: Phone Number Request ✅
**File:** `src/lib/email/templates/phone-number-request.html`
- Professional greeting
- Navy blue info box
- Amber warning box for action required
- Navy CTA button
- Gray instructional box
- Professional closing

### Example 2: Meeting Invitation (TO BE UPDATED)
**Current:** Uses emojis and playful colors ❌
**Action Required:** Convert to professional template

### Example 3: Welcome Email (TO BE UPDATED)
**Current:** May use old styles ❌
**Action Required:** Convert to professional template

---

## 🔄 MIGRATION PLAN FOR EXISTING EMAILS

1. **Audit:** Find all `resend.emails.send()` calls
2. **Convert:** Create template files for each email type
3. **Update:** Change to use `sendTemplateEmail()`
4. **Test:** Send test emails to verify
5. **Deploy:** Roll out gradually

**Files to Update:** See grep results in investigation

---

## 📞 SUPPORT

**Questions about email templates?**
- Review approved template: `src/lib/email/templates/phone-number-request.html`
- Check this guide
- Test email function: `send-test-email-professional.ts`

**Need to send a different style email?**
- Get explicit approval from user first
- Document the exception
- Still use `@theapexway.net` domain

---

## ✅ APPROVAL STATUS

**Base Template:** ✅ APPROVED by user March 19, 2026
**Color Scheme:** ✅ APPROVED (navy blue, professional grays)
**Tone:** ✅ APPROVED (serious, corporate, no emojis)
**Domain:** ✅ APPROVED (theapexway.net only)

**This system is now the standard for ALL Apex email communications.**
