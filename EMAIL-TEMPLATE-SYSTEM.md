# 📧 Email Template System

**Last Updated:** March 19, 2026
**Status:** ✅ Active - ALL system emails use this template

---

## 🎯 Overview

All emails sent from the Apex system **automatically** use the standardized Apex base template with:
- ✅ Apex logo header
- ✅ Consistent branding
- ✅ CAN-SPAM compliant footer
- ✅ Unsubscribe links
- ✅ Company address and contact info

---

## 🏗️ Architecture

### **Base Template** (`src/lib/email/templates/base-email.html`)
```html
<!DOCTYPE html>
<html>
  <body>
    <!-- Apex Logo Header -->
    <img src="https://theapexway.net/apex-logo-full.png" />

    <!-- Your Email Content Goes Here -->
    {{EMAIL_CONTENT}}

    <!-- Footer with Company Info -->
    <footer>
      Apex Affinity Group
      1600 Highway 6 Ste 400, Sugar Land, TX 77478
    </footer>

    <!-- Unsubscribe Section (CAN-SPAM) -->
    <a href="{{unsubscribe_url}}">Unsubscribe</a>
  </body>
</html>
```

### **Template Wrapper** (`src/lib/email/template-wrapper.ts`)
```typescript
export function wrapEmailTemplate(
  emailContent: string,      // Your HTML content
  emailTitle: string,         // Email subject/title
  unsubscribeUrl: string      // Unsubscribe URL
): string
```

### **Tracked Email Service** (`src/lib/services/resend-tracked.ts`)
**Automatically wraps ALL emails** unless `skipTemplateWrap: true`

---

## 📝 How to Send Emails

### **Option 1: Automatic Wrapping (Recommended)**

```typescript
import { sendTrackedEmail } from '@/lib/services/resend-tracked';

await sendTrackedEmail({
  from: 'Apex <notifications@reachtheapex.net>',
  to: 'user@example.com',
  subject: 'Welcome to Apex!',

  // Just provide the content - template is automatic!
  html: `
    <h1>Welcome!</h1>
    <p>Your content here...</p>
  `,

  triggeredBy: 'system',
  feature: 'welcome-email',

  // Optional: Custom unsubscribe URL
  unsubscribeUrl: 'https://reachtheapex.net/unsubscribe?token=xxx',
});
```

**Result:** Email is automatically wrapped with Apex template!

---

### **Option 2: Manual Wrapping (Advanced)**

```typescript
import { wrapEmailTemplate } from '@/lib/email/template-wrapper';
import { resend } from '@/lib/services/resend-tracked';

const emailContent = `
  <h1>Your Content</h1>
  <p>More content here...</p>
`;

const fullHtml = wrapEmailTemplate(
  emailContent,
  'Email Subject',
  'https://reachtheapex.net/unsubscribe?token=xxx'
);

await resend().emails.send({
  from: 'Apex <notifications@reachtheapex.net>',
  to: 'user@example.com',
  subject: 'Email Subject',
  html: fullHtml,
});
```

---

### **Option 3: Skip Template Wrapping (Not Recommended)**

Only use this for transactional emails that need custom styling:

```typescript
await sendTrackedEmail({
  from: 'Apex <notifications@reachtheapex.net>',
  to: 'user@example.com',
  subject: 'Custom Email',
  html: '<html><!-- Your complete HTML --></html>',

  skipTemplateWrap: true,  // ⚠️ Skips Apex template

  triggeredBy: 'system',
});
```

---

## 🎨 Template Features

### **1. Apex Logo Header**
```html
<img src="https://theapexway.net/apex-logo-full.png"
     alt="Apex Affinity Group"
     style="max-width: 300px;" />
```

### **2. Consistent Styling**
- Background: Light gray (#f5f5f5)
- Content: White (#ffffff)
- Border: Blue (#2c5aa0)
- Max width: 600px (mobile-friendly)

### **3. Footer**
```
Apex Affinity Group
AI-Powered Lead Autopilot | theapexway.net
1600 Highway 6 Ste 400, Sugar Land, TX 77478
```

### **4. CAN-SPAM Compliance**
```
You're receiving this email because you're a
valued member of the Apex Affinity Group.

[Unsubscribe] | [Privacy Policy] | [Contact Us]
```

---

## 📧 Email Types

### **System Emails** (Auto-wrapped)
- Welcome emails
- Password reset
- Email verification
- Meeting invitations
- SMS feature announcements
- Training emails
- Nurture campaigns

### **Transactional Emails** (Auto-wrapped)
- Order confirmations
- Payment receipts
- Account updates
- Notifications

### **Custom Emails** (Manual wrapping)
- Admin bulk sends
- Special announcements
- Marketing campaigns

---

## 🔧 Customization

### **Per-Email Customization**

```typescript
await sendTrackedEmail({
  from: 'Apex <notifications@reachtheapex.net>',
  to: 'user@example.com',
  subject: 'Special Offer',

  html: `
    <!-- Custom banner -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0;">🚀 Special Offer!</h1>
    </div>

    <!-- Your content -->
    <p>Content here...</p>
  `,

  unsubscribeUrl: 'https://reachtheapex.net/unsubscribe?token=xxx',
  triggeredBy: 'admin',
  adminId: 'admin-id',
});
```

### **Global Template Customization**

Edit `src/lib/email/templates/base-email.html`:
- Logo URL
- Company address
- Footer links
- Styling/colors

**⚠️ IMPORTANT:** Changes affect ALL future emails!

---

## 📊 Examples

### **Example 1: Welcome Email**

```typescript
await sendTrackedEmail({
  from: 'Apex <welcome@reachtheapex.net>',
  to: newUser.email,
  subject: 'Welcome to Apex Affinity Group!',

  html: `
    <h2>Welcome, ${newUser.first_name}!</h2>
    <p>We're excited to have you join the Apex family.</p>

    <div style="background: #f0f9ff; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0;">🎯 Next Steps:</h3>
      <ol style="margin: 0; padding-left: 20px;">
        <li>Complete your profile</li>
        <li>Set up your replicated site</li>
        <li>Schedule your training call</li>
      </ol>
    </div>

    <p>
      <a href="https://reachtheapex.net/login"
         style="display: inline-block; background: #2c5aa0; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Get Started →
      </a>
    </p>
  `,

  unsubscribeUrl: `https://reachtheapex.net/unsubscribe?token=${newUser.unsubscribe_token}`,
  triggeredBy: 'system',
  userId: newUser.id,
  feature: 'welcome-email',
});
```

**Result:** Beautiful branded email with Apex header/footer!

---

### **Example 2: Meeting Invitation**

```typescript
await sendTrackedEmail({
  from: `${distributor.first_name} via Apex <meetings@reachtheapex.net>`,
  to: invitee.email,
  subject: `${distributor.first_name} invited you to: ${meeting.title}`,

  html: `
    <h2>You're Invited!</h2>
    <p>${distributor.first_name} ${distributor.last_name} has invited you to join an exclusive meeting:</p>

    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; color: #1f2937;">${meeting.title}</h3>
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        📅 ${meeting.date}<br/>
        🕐 ${meeting.time}<br/>
        📍 ${meeting.location}
      </p>
    </div>

    <p>
      <a href="${meeting.rsvp_url}"
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
        Yes, I'll Attend
      </a>
    </p>
  `,

  unsubscribeUrl: `https://reachtheapex.net/meetings/unsubscribe?id=${invitation.id}`,
  triggeredBy: 'user',
  userId: distributor.id,
  feature: 'meeting-invitation',
});
```

---

### **Example 3: SMS Feature Announcement** (Already Sent!)

```typescript
const emailTemplate = fs.readFileSync('sms-feature-announcement-email.html', 'utf8');

await sendTrackedEmail({
  from: 'Apex Affinity Group <notifications@reachtheapex.net>',
  to: distributor.email,
  subject: '🚀 New AI Feature: Real-Time SMS Notifications',

  html: emailTemplate,  // Already has content, just needs wrapping

  unsubscribeUrl: `https://reachtheapex.net/unsubscribe?token=${distributor.unsubscribe_token}`,
  triggeredBy: 'admin',
  adminId: 'admin-id',
  feature: 'sms-announcement',
});
```

---

## ✅ Benefits

### **For Developers:**
- ✅ No need to manually add Apex branding
- ✅ Automatic CAN-SPAM compliance
- ✅ Consistent look across all emails
- ✅ Single source of truth for template
- ✅ Easy to update globally

### **For Users:**
- ✅ Professional, branded emails
- ✅ Clear unsubscribe options
- ✅ Consistent experience
- ✅ Mobile-friendly design

### **For Business:**
- ✅ CAN-SPAM compliant (legal requirement)
- ✅ Brand consistency
- ✅ Professional appearance
- ✅ Easy to audit/track

---

## 🚨 Important Rules

### **1. ALWAYS Use Tracked Email Service**
```typescript
// ✅ Correct
import { sendTrackedEmail } from '@/lib/services/resend-tracked';
await sendTrackedEmail({ ... });

// ❌ Wrong (no template, no tracking)
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({ ... });
```

### **2. Template is Automatic**
Unless you explicitly set `skipTemplateWrap: true`, the Apex template is **always** applied.

### **3. Provide Clean HTML Content**
```typescript
// ✅ Correct - Just your content
html: `
  <h1>Title</h1>
  <p>Content</p>
`

// ❌ Wrong - Don't include full HTML structure
html: `
  <!DOCTYPE html>
  <html>
    <body>
      <h1>Title</h1>
    </body>
  </html>
`
```

### **4. Always Include Unsubscribe URL**
```typescript
await sendTrackedEmail({
  // ...
  unsubscribeUrl: `https://reachtheapex.net/unsubscribe?token=${user.token}`,
});
```

---

## 📁 Files Reference

| File | Purpose |
|------|---------|
| `src/lib/email/templates/base-email.html` | Base template (Apex branding) |
| `src/lib/email/template-wrapper.ts` | Template wrapping function |
| `src/lib/services/resend-tracked.ts` | Tracked email service (auto-wraps) |
| `sms-feature-announcement-email.html` | Example full email |

---

## 🔄 Migration from Old Emails

### **Before (Old Way):**
```typescript
await resend.emails.send({
  from: 'noreply@example.com',
  to: 'user@example.com',
  subject: 'Test',
  html: '<p>Content</p>',  // No Apex branding
});
```

### **After (New Way):**
```typescript
await sendTrackedEmail({
  from: 'Apex <notifications@reachtheapex.net>',
  to: 'user@example.com',
  subject: 'Test',
  html: '<p>Content</p>',  // Automatically wrapped!
  triggeredBy: 'system',
});
```

---

## 🧪 Testing

### **Send Test Email:**

```typescript
await sendTrackedEmail({
  from: 'Apex <test@reachtheapex.net>',
  to: 'tdaniel@botmakers.ai',  // Your test email
  subject: 'Test Email with Apex Template',

  html: `
    <h1>This is a test</h1>
    <p>This email should have:</p>
    <ul>
      <li>✅ Apex logo at top</li>
      <li>✅ White content area</li>
      <li>✅ Company footer</li>
      <li>✅ Unsubscribe link</li>
    </ul>
  `,

  unsubscribeUrl: 'https://reachtheapex.net/unsubscribe',
  triggeredBy: 'system',
  feature: 'test',
});
```

---

## 📞 Support

**Questions about the email template system?**
- Check: `src/lib/email/template-wrapper.ts`
- Example: `sms-feature-announcement-email.html`
- Docs: This file

---

## ✅ Summary

- ✅ **All emails automatically use Apex template**
- ✅ **No manual template wrapping needed**
- ✅ **CAN-SPAM compliant by default**
- ✅ **Consistent branding across all emails**
- ✅ **Easy to customize per-email content**
- ✅ **Single source of truth for global changes**

**Just write your content, the system handles the rest!**
