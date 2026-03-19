# 📱 Phone Number Formatting System

**Last Updated:** March 19, 2026
**Status:** ✅ Implemented

---

## 🎯 Overview

Consistent phone number formatting system for:
- **Storage:** E.164 format (`+1XXXXXXXXXX`) in database
- **Display:** Friendly format (`1-XXX-XXX-XXXX`) in UI
- **Input:** Auto-formatting as user types (`XXX-XXX-XXXX`)
- **Twilio:** E.164 format for SMS delivery

---

## 📐 Format Standards

### 1. **E.164 Format (Storage/Twilio)**
```
+15551234567
```
- **Used for:** Database storage, Twilio SMS
- **Format:** `+[country code][10 digits]`
- **Example:** `+16517287626`

### 2. **Display Format (UI)**
```
1-555-123-4567
```
- **Used for:** All UI displays (admin, distributor dashboards, replicated sites)
- **Format:** `1-XXX-XXX-XXXX`
- **Example:** `1-651-728-7626`

### 3. **Input Format (As User Types)**
```
555-123-4567
```
- **Used for:** Phone input fields
- **Format:** `XXX-XXX-XXXX` (auto-formats to display format when saved)
- **Example:** User types `5551234567` → Shows `555-123-4567` → Saves as `+15551234567`

---

## 🔧 Implementation

### **Core Utility File**
`src/lib/utils/format-phone.ts`

Contains all phone formatting functions:

```typescript
// Convert to E.164 for storage/Twilio
formatPhoneToE164(phone: string | null) → string | null

// Convert to display format (1-XXX-XXX-XXXX)
formatPhoneForDisplay(phone: string | null) → string

// Auto-format as user types
formatPhoneInput(input: string) → string

// Validate US phone number
isValidUSPhone(phone: string | null) → boolean

// Legacy alias (deprecated)
formatPhoneNumber(phone: string | null) → string
```

---

## 📁 Modified Files

### **1. Backend API** (`src/app/api/profile/personal/route.ts`)
- ✅ Auto-converts phone to E.164 before saving
- ✅ Ensures consistent storage format

**Code:**
```typescript
import { formatPhoneToE164 } from '@/lib/utils/format-phone';

const formattedPhone = phone ? formatPhoneToE164(phone) : null;

await supabase
  .from('user_profiles')
  .update({ phone: formattedPhone })
```

### **2. Profile Input Form** (`src/app/dashboard/profile/components/tabs/PersonalInfoTab.tsx`)
- ✅ Auto-formats as user types (`555-123-4567`)
- ✅ Shows helpful hint about E.164 conversion

**Code:**
```typescript
import { formatPhoneInput } from '@/lib/utils/format-phone';

<input
  type="tel"
  onChange={(e) => {
    const formatted = formatPhoneInput(e.target.value);
    e.target.value = formatted;
  }}
  placeholder="555-123-4567"
/>
<p className="text-xs text-gray-500">
  Will be formatted as 1-xxx-xxx-xxxx for SMS
</p>
```

### **3. Display Components**
- ✅ Optive replicated sites (`src/components/optive/OptiveReplicatedSite.tsx`)
- ✅ All other display locations use `formatPhoneForDisplay()`

**Code:**
```typescript
import { formatPhoneForDisplay } from '@/lib/utils/format-phone';

<a href={`tel:${distributor.phone}`}>
  {formatPhoneForDisplay(distributor.phone)}
</a>
```

### **4. Legacy Compatibility**
- ✅ Updated `src/lib/validation/profile-schemas.ts`
- ✅ Updated `src/lib/profile/validation.ts`
- Both now use consistent `1-XXX-XXX-XXXX` format
- Marked as `@deprecated` with migration notes

---

## 🧪 Test Results

### **Input Variations** (All convert to E.164 correctly)
```
Input:              E.164 Storage:      Display:
5551234567       →  +15551234567    →  1-555-123-4567
555-123-4567     →  +15551234567    →  1-555-123-4567
(555) 123-4567   →  +15551234567    →  1-555-123-4567
+15551234567     →  +15551234567    →  1-555-123-4567
15551234567      →  +15551234567    →  1-555-123-4567
+1 555 123 4567  →  +15551234567    →  1-555-123-4567
555.123.4567     →  +15551234567    →  1-555-123-4567
```

### **As User Types** (Auto-formatting)
```
User Types:      Displays:
5            →   5
55           →   55
555          →   555
5551         →   555-1
55512        →   555-12
555123       →   555-123
5551234      →   555-123-4
55512345     →   555-123-45
555123456    →   555-123-456
5551234567   →   555-123-4567
```

---

## 🔄 Data Flow

### **User Updates Phone Number:**

```
1. User enters: "555-123-4567" (or any format)
   ↓
2. Input field shows: "555-123-4567" (auto-formatted)
   ↓
3. Form submits to: /api/profile/personal
   ↓
4. Backend converts to: "+15551234567" (E.164)
   ↓
5. Database stores: "+15551234567"
   ↓
6. UI displays: "1-555-123-4567"
   ↓
7. Twilio receives: "+15551234567" (for SMS)
```

---

## 📊 SMS Integration

### **Attendance Notification Flow:**

```typescript
// File: src/lib/sms/send-attendance-notification.ts

export async function sendAttendanceNotification({
  distributorPhone,  // ← Must be E.164 format
  recipientName,
  meetingTitle,
  meetingDateTime,
}) {
  await twilioClient.messages.create({
    to: distributorPhone,     // E.164: +15551234567
    from: fromPhoneNumber,    // E.164: +16517287626
    body: `🎉 ${recipientName} just joined your meeting...`,
  });
}
```

**Phone number is already E.164 from database** → No conversion needed!

---

## 🔒 Validation

### **Backend Validation:**
```typescript
// Profile schema already validates US phone format
const US_PHONE_REGEX = /^\+?1?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
```

### **E.164 Validation (for Twilio):**
```typescript
export function isValidPhoneNumber(phone: string): boolean {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}
```

---

## 📋 Migration Guide

### **For Existing Phone Numbers:**

If you have phone numbers in the database with inconsistent formats:

```sql
-- Run this SQL to normalize all existing phone numbers to E.164
UPDATE distributors
SET phone = CONCAT('+1', REGEXP_REPLACE(phone, '[^0-9]', '', 'g'))
WHERE phone IS NOT NULL
  AND phone != ''
  AND phone NOT LIKE '+1%';
```

**Before:**
```
(555) 123-4567
555-123-4567
5551234567
+1 555 123 4567
```

**After:**
```
+15551234567
+15551234567
+15551234567
+15551234567
```

---

## 🎨 UI Examples

### **Profile Edit Form:**
```
┌─────────────────────────────────────────┐
│ Phone Number                            │
│ ┌─────────────────────────────────────┐ │
│ │ 555-123-4567                        │ │
│ └─────────────────────────────────────┘ │
│ Will be formatted as 1-xxx-xxx-xxxx     │
│ for SMS                                 │
└─────────────────────────────────────────┘
```

### **Admin Dashboard:**
```
┌─────────────────────────────────────────┐
│ Distributor: John Smith                │
│ Email: john@example.com                 │
│ Phone: 1-555-123-4567                   │
│        └─ Click to call                 │
└─────────────────────────────────────────┘
```

### **Replicated Site:**
```
┌─────────────────────────────────────────┐
│ 📞 Call Me                              │
│    1-555-123-4567                       │
│    └─ Formatted consistently            │
└─────────────────────────────────────────┘
```

---

## 🚨 Troubleshooting

### **Problem: SMS not sending**

**Check:**
1. Phone number in database is E.164 format (`+1XXXXXXXXXX`)
2. Twilio credentials configured in `.env.local`
3. Twilio phone number verified

**Fix:**
```typescript
// Check if phone is E.164
import { isValidPhoneNumber } from '@/lib/sms/send-attendance-notification';

if (!isValidPhoneNumber(distributorPhone)) {
  console.error('Invalid E.164 format:', distributorPhone);
}
```

### **Problem: Phone displays incorrectly**

**Check:**
1. Using `formatPhoneForDisplay()` not `formatPhoneNumber()`
2. Phone exists in database
3. Not using deprecated formatting functions

**Fix:**
```typescript
// ✅ Correct
import { formatPhoneForDisplay } from '@/lib/utils/format-phone';
{formatPhoneForDisplay(phone)}

// ❌ Wrong (deprecated)
import { formatPhoneNumber } from '@/lib/validation/profile-schemas';
```

### **Problem: Input field not auto-formatting**

**Check:**
1. Using `formatPhoneInput()` in `onChange` handler
2. Not using `register()` from react-hook-form (conflicts)
3. Input type is `tel`

**Fix:**
```typescript
<input
  type="tel"
  onChange={(e) => {
    const formatted = formatPhoneInput(e.target.value);
    e.target.value = formatted;
  }}
/>
```

---

## ✅ Benefits

### **For Developers:**
- ✅ Single source of truth for phone formatting
- ✅ Consistent format across entire codebase
- ✅ No manual E.164 conversion needed
- ✅ Works seamlessly with Twilio

### **For Users:**
- ✅ Enter phone in any format
- ✅ Auto-formats as they type
- ✅ Always displays consistently
- ✅ SMS notifications work reliably

### **For Business:**
- ✅ Reliable SMS delivery
- ✅ Professional appearance
- ✅ No data quality issues
- ✅ Easy to audit/debug

---

## 🔗 Related Files

| File | Purpose |
|------|---------|
| `src/lib/utils/format-phone.ts` | Core formatting utilities |
| `src/app/api/profile/personal/route.ts` | Backend E.164 conversion |
| `src/app/dashboard/profile/components/tabs/PersonalInfoTab.tsx` | Input auto-formatting |
| `src/components/optive/OptiveReplicatedSite.tsx` | Display formatting |
| `src/lib/sms/send-attendance-notification.ts` | Twilio SMS integration |
| `test-phone-formatting.js` | Test script |

---

## 📞 Example Usage

### **Get phone for Twilio:**
```typescript
// Phone is already E.164 in database
const { data } = await supabase
  .from('distributors')
  .select('phone')
  .eq('id', distributorId)
  .single();

// data.phone is already "+15551234567" - ready for Twilio!
await sendAttendanceNotification({
  distributorPhone: data.phone,
  // ...
});
```

### **Display phone in UI:**
```typescript
import { formatPhoneForDisplay } from '@/lib/utils/format-phone';

// Converts "+15551234567" → "1-555-123-4567"
<span>{formatPhoneForDisplay(distributor.phone)}</span>
```

### **Handle user input:**
```typescript
import { formatPhoneInput } from '@/lib/utils/format-phone';

<input
  type="tel"
  onChange={(e) => {
    // Auto-formats "5551234567" → "555-123-4567"
    e.target.value = formatPhoneInput(e.target.value);
  }}
/>
```

---

## 🎯 Summary

- ✅ **Storage:** Always E.164 (`+1XXXXXXXXXX`)
- ✅ **Display:** Always `1-XXX-XXX-XXXX`
- ✅ **Input:** Auto-formats as `XXX-XXX-XXXX`
- ✅ **Twilio:** Receives E.164 automatically
- ✅ **Consistent:** Across entire application
- ✅ **Tested:** All input formats work correctly

---

**Questions?** Check `src/lib/utils/format-phone.ts` for implementation details.
