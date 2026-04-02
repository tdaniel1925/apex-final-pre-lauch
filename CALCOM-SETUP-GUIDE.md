# 📅 Cal.com Integration Setup Guide

**Status:** ✅ **READY - Just need your Cal.com account!**

---

## What's Been Implemented

### ✅ Complete Modal Integration
- Professional booking modal component
- Cal.com React embed installed
- Auto-opens after purchase
- Shows on success page
- Mobile responsive
- Professional styling

### ✅ All Checkout Routes Updated
1. Personal purchase → Success page with modal
2. Retail purchase → Success page with modal
3. Stripe checkout → Success page with modal

### ✅ Smart Behavior
- Modal auto-opens 1 second after purchase
- Can be manually opened by clicking "Schedule Now"
- Can be closed and reopened
- Tracks booking completion
- No page redirects needed

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Cal.com Account

1. Go to https://cal.com
2. Click "Sign up" (it's FREE!)
3. Choose your username (e.g., "botmakers")
   - This becomes: `cal.com/botmakers`

### Step 2: Create Event Type

1. In Cal.com dashboard, click **"Event Types"**
2. Click **"New Event Type"**
3. Configure:
   - **Name:** "Onboarding Session"
   - **URL:** "onboarding"
   - **Duration:** 30 minutes
   - **Location:** Dialpad (or Zoom/Google Meet)

4. Set **Availability:**
   - Monday-Saturday
   - 9:00 AM - 6:00 PM Central Time
   - 30-minute slots

5. Click **"Create"**

### Step 3: Get Your Cal.com Link

Your link will be:
```
https://cal.com/YOUR_USERNAME/onboarding
```

Example:
```
https://cal.com/botmakers/onboarding
```

### Step 4: Update Your Code

**Edit:** `src/app/products/success/page.tsx`

**Find line ~170:**
```typescript
<CalComModal
  isOpen={showBookingModal}
  onClose={() => setShowBookingModal(false)}
  calLink="botmakers/onboarding"  // ← CHANGE THIS
/>
```

**Replace `"botmakers/onboarding"`** with **your Cal.com link:**
```typescript
calLink="YOUR_USERNAME/onboarding"
```

### Step 5: Test It!

1. Make a test purchase: http://localhost:3050/products
2. Use test card: `4242 4242 4242 4242`
3. After payment → **Modal appears automatically!** 🎉
4. Select date/time
5. Complete booking

---

## 📝 Cal.com Account Configuration

### Recommended Settings

**1. Email Notifications:**
- ✅ Booking confirmation (to customer)
- ✅ Booking notification (to you)
- ✅ 24-hour reminder
- ✅ 1-hour reminder

**2. Calendar Integration:**
- Connect Google Calendar (or Outlook)
- Prevents double-bookings
- Auto-syncs meetings

**3. Branding:**
- Upload Apex logo
- Set brand color: `#2B4C7E` (navy blue)
- Customize confirmation email

**4. Questions to Ask:**
- Name (required)
- Email (required)
- Phone number (optional)
- "What product did you purchase?" (dropdown)
- "Anything we should know before the session?" (text)

---

## 🎨 Modal Customization

### Change Cal.com Username

**File:** `src/app/products/success/page.tsx`

```typescript
<CalComModal
  calLink="YOUR_USERNAME/onboarding"
  // ...
/>
```

### Pre-fill Customer Data

```typescript
<CalComModal
  calLink="botmakers/onboarding"
  prefillData={{
    name: "John Doe",
    email: "john@example.com",
    notes: "Purchased PulseMarket on 2026-04-01"
  }}
/>
```

### Change Modal Size

**File:** `src/components/booking/CalComModal.tsx`

**Line 75:**
```typescript
<Cal
  style={{ width: '100%', height: '600px' }}  // ← Change height
  // ...
/>
```

### Change Theme

```typescript
<Cal
  config={{
    layout: 'month_view',  // or 'week_view', 'column_view'
    theme: 'light',        // or 'dark'
  }}
/>
```

---

## 🔧 Advanced Configuration

### Use Environment Variable

**1. Add to `.env.local`:**
```bash
NEXT_PUBLIC_CALCOM_LINK=botmakers/onboarding
```

**2. Update component:**
```typescript
<CalComModal
  calLink={process.env.NEXT_PUBLIC_CALCOM_LINK || "botmakers/onboarding"}
/>
```

### Multiple Cal.com Links

For different products:

```typescript
// Determine which Cal.com link to use
const getCalLink = (productSlug: string) => {
  switch(productSlug) {
    case 'pulsecommand':
      return 'botmakers/pulsecommand-onboarding';
    case 'pulsemarket':
      return 'botmakers/pulsemarket-onboarding';
    default:
      return 'botmakers/onboarding';
  }
};

<CalComModal
  calLink={getCalLink(productSlug)}
/>
```

---

## 🧪 Testing

### Test Purchase Flow

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Make purchase:**
   - Go to http://localhost:3050/products
   - Click "Buy Now"
   - Card: `4242 4242 4242 4242`
   - Exp: `12/27`, CVC: `123`

3. **Expected result:**
   - ✅ Redirects to success page
   - ✅ Modal auto-opens after 1 second
   - ✅ Shows Cal.com booking interface
   - ✅ Can select date/time
   - ✅ Can complete booking

### Test Modal Manually

**Success page URL:**
```
http://localhost:3050/products/success?session_id=test123
```

Should show:
- Success message
- "Schedule Now" button
- Clicking button → Modal opens

---

## 📊 Cal.com Analytics

View bookings in Cal.com dashboard:
- https://app.cal.com/bookings

See:
- Upcoming sessions
- Past sessions
- No-shows
- Rescheduled bookings
- Customer details

---

## 🎯 Benefits of Cal.com

### ✅ vs Custom Solution

| Feature | Cal.com | Custom Build |
|---------|---------|--------------|
| Setup time | 5 minutes | Days |
| Maintenance | None | Ongoing |
| Calendar sync | Built-in | Complex |
| Reminders | Automatic | Must code |
| Rescheduling | Built-in | Must code |
| Mobile app | Yes | No |
| Cost | Free | Time = $$$ |

### ✅ Professional Features

- ✅ Automatic email confirmations
- ✅ SMS reminders (with Twilio)
- ✅ Timezone detection
- ✅ Google Calendar sync
- ✅ Zoom/Meet integration
- ✅ Team scheduling
- ✅ Buffer times
- ✅ Custom questions
- ✅ Webhooks for automation
- ✅ Mobile-friendly

---

## 🔗 Useful Links

- **Cal.com Dashboard:** https://app.cal.com
- **Documentation:** https://cal.com/docs
- **Embed Guide:** https://cal.com/docs/introduction/embed
- **API Reference:** https://cal.com/docs/api-reference
- **Support:** https://cal.com/slack

---

## 🚨 Troubleshooting

### Modal doesn't appear

**Check:**
1. Did purchase complete successfully?
2. Is `requiresOnboarding` being set to `true`?
3. Check browser console for errors

**Debug:**
```typescript
console.log('Show modal?', showBookingModal);
console.log('Requires onboarding?', requiresOnboarding);
```

### Cal.com not loading in modal

**Check:**
1. Is your Cal.com username correct?
2. Is event type published (not draft)?
3. Check network tab for API errors

**Test link directly:**
```
https://cal.com/YOUR_USERNAME/onboarding
```

### Wrong timezone

Cal.com auto-detects timezone from browser.

**To force Central Time:**
```typescript
<Cal
  config={{
    layout: 'month_view',
    theme: 'light',
    timezone: 'America/Chicago',
  }}
/>
```

---

## 📝 Next Steps

1. ✅ **Create Cal.com account** (if you haven't)
2. ✅ **Set up "Onboarding Session" event type**
3. ✅ **Update code with your Cal.com link**
4. ✅ **Test purchase flow**
5. ✅ **Deploy to production**

---

## 🎉 Summary

**What's Working:**
- ✅ Cal.com React embed installed
- ✅ Professional booking modal created
- ✅ All checkout routes updated
- ✅ Auto-opens after purchase
- ✅ Mobile responsive
- ✅ Fully customizable

**What You Need:**
- 🔲 Cal.com account (free signup)
- 🔲 Create "onboarding" event type
- 🔲 Update code with your username
- 🔲 Test and deploy

**Time to complete:** 5 minutes! ⏱️

---

**Status:** ✅ **READY FOR YOUR CAL.COM LINK!**

Just create your Cal.com account, update the `calLink` prop, and you're live! 🚀
