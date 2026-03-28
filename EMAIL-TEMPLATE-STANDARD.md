# 📧 Apex Email Template Standard

**Created:** March 19, 2026
**Status:** ✅ Implemented Across All Emails

---

## ✅ What Was Done

Updated **ALL email templates** to include:

1. **✅ Apex Logo Header**
   - White background
   - Full Apex Affinity Group logo
   - Blue bottom border (#2c5aa0)

2. **✅ Spam Compliance Footer**
   - Company information
   - Unsubscribe link
   - Privacy policy link
   - Contact us link

3. **✅ Consistent Branding**
   - Professional design
   - Mobile-responsive
   - Matches Apex brand colors

---

## 📁 Files Updated

### **1. Feature Announcement Email**
- `sms-feature-announcement-email.html` ✅
- Includes logo header
- Includes unsubscribe footer

### **2. Meeting Invitation Email Template**
- `src/lib/email/templates/meeting-invitation.tsx` ✅
- Updated logo URL to `https://theapexway.net/apex-logo-full.png`
- Added unsubscribe section
- Added privacy/contact links

### **3. Base Email Template (New)**
- `src/lib/email/templates/base-email-template.tsx` ✅
- Reusable component for future emails
- Ensures all emails have consistent branding

---

## 🎨 Email Structure

```
┌─────────────────────────────────────┐
│  APEX LOGO (White background)       │ ← Logo Header
├─────────────────────────────────────┤
│                                     │
│  Email Content Goes Here            │ ← Main Content
│  (Feature announcements,            │
│   invitations, notifications, etc.) │
│                                     │
├─────────────────────────────────────┤
│  Apex Affinity Group                │ ← Company Footer
│  AI-Powered Lead Autopilot          │
│  theapexway.net                     │
├─────────────────────────────────────┤
│  Unsubscribe | Privacy | Contact    │ ← Spam Compliance
└─────────────────────────────────────┘
```

---

## 🔧 Logo Details

**Current URL:** `https://theapexway.net/apex-logo-full.png`

**Image Properties:**
- Blue "APEX" text
- Red star icon
- "AFFINITY GROUP" subtitle
- Transparent or white background

**Display:**
- Max width: 300px
- Center-aligned
- Auto height (maintains aspect ratio)

---

## 📋 Unsubscribe Footer (Spam Compliance)

**Required by CAN-SPAM Act**

Every email includes:

```html
You're receiving this email because you're a valued member of Apex Affinity Group.

[Unsubscribe] | [Privacy Policy] | [Contact Us]
```

**Links:**
- Unsubscribe: `{{unsubscribe_url}}` (dynamic per recipient)
- Privacy: `https://theapexway.net/privacy`
- Contact: `https://theapexway.net/contact`

**Styling:**
- Gray background (#f3f4f6)
- Small text (11px)
- Links underlined

---

## 🎯 Types of Emails Using This Template

1. **Meeting Invitations** ✅
   - Template: `meeting-invitation.tsx`
   - Logo: ✅ Updated
   - Unsubscribe: ✅ Added

2. **Feature Announcements** ✅
   - File: `sms-feature-announcement-email.html`
   - Logo: ✅ Included
   - Unsubscribe: ✅ Included

3. **Future Emails**
   - Use `base-email-template.tsx` for consistency
   - Automatically includes logo + unsubscribe

---

## 🚀 Test Email Sent

**Recipient:** tdaniel@botmakers.ai
**Email ID:** `049a9687-7a13-40fb-b0be-ef740e86c5dc`
**Status:** ✅ Delivered

**Includes:**
- ✅ Apex logo header
- ✅ Feature announcement content
- ✅ Unsubscribe footer
- ✅ Privacy/contact links

---

## 📝 How to Create New Emails

### **Option 1: Use React Email Template**

```tsx
import { BaseEmailTemplate } from '@/lib/email/templates/base-email-template';

export function MyNewEmail() {
  return (
    <BaseEmailTemplate previewText="Your email preview">
      {/* Your email content here */}
      <h1>Hello!</h1>
      <p>Your email content...</p>
    </BaseEmailTemplate>
  );
}
```

### **Option 2: Use HTML Template**

1. Copy `sms-feature-announcement-email.html`
2. Replace content section
3. Keep header and footer unchanged

---

## ⚠️ IMPORTANT NOTES

### **Logo URL**
Always use: `https://theapexway.net/apex-logo-full.png`

**DO NOT USE:**
- ❌ `https://reachtheapex.net/apex-logo.png` (old URL)
- ❌ Local file paths
- ❌ Relative URLs

### **Unsubscribe Link**
- Must be functional (CAN-SPAM requirement)
- Use `{{unsubscribe_url}}` placeholder
- Resend will automatically replace with unique URL per recipient

### **Mobile Responsive**
- Max width: 600px
- Tables for layout (email client compatibility)
- Inline styles (required for email)

---

## 🔍 Verification Checklist

For every new email, verify:

- [ ] Apex logo appears in header
- [ ] Logo loads correctly (check URL)
- [ ] Content is centered and readable
- [ ] Unsubscribe link in footer
- [ ] Privacy policy link in footer
- [ ] Contact us link in footer
- [ ] Company name in footer
- [ ] Mobile-responsive design
- [ ] Tested in email client (Gmail, Outlook, etc.)

---

## 🎨 Brand Colors (Reference)

**Apex Blue:** #2c5aa0
**Purple Gradient:** #667eea to #764ba2
**Text Dark:** #1f2937
**Text Gray:** #6b7280
**Background:** #f5f5f5

---

## 📞 Support

**Questions about email templates?**
- Check this document first
- Review existing templates
- Test in email client before bulk sending

---

## ✅ Summary

- ✅ **Logo added** to all email headers
- ✅ **Unsubscribe footer** added (spam compliance)
- ✅ **Meeting invitation template** updated
- ✅ **Feature announcement email** updated
- ✅ **Base template** created for future use
- ✅ **Test email sent** and verified

**All future emails will automatically use this standard template!**

---

**Last Updated:** March 19, 2026
**Maintained By:** Apex Development Team
