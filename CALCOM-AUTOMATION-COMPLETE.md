# 🎉 Cal.com Booking Automation - COMPLETE

**Status:** ✅ READY (Webhook setup required after deployment)

---

## ✅ What's Been Configured

### 1. Cal.com Event Type Settings
- **Title:** Apex Affinity Group Onboarding
- **Slug:** apex-affinity-group-onboarding
- **Duration:** 30 minutes
- **Meeting Location:** https://meetings.dialpad.com/room/aicallers ✅
- **Availability:** Monday-Friday, 9:00 AM - 6:00 PM CT
- **Buffer Time:** 15 minutes between sessions

### 2. Booking Form Fields
- **Name** (required)
- **Email** (required) ← Captured for confirmations
- **Phone** (required) ← Captured for contact
- **Product Purchased** (auto-filled from purchase)
- **Notes** (optional)

### 3. Automated Email System
When a booking is made, the following emails are sent automatically:

**📧 Admin Notifications:**
- **To:** tavaresdavis81@gmail.com
- **To:** tdaniel@botmakers.ai
- **Subject:** New Onboarding Booking - {Customer Name}
- **Includes:** Customer details, product, date/time, sponsor info, Dialpad link

**📧 Client Confirmation:**
- **To:** {Customer Email}
- **Subject:** Your Onboarding Session is Confirmed
- **Includes:** Session details, date/time, Dialpad meeting link

**📧 Sponsor Notification:**
- **To:** {Sponsor Email}
- **Subject:** {Customer Name} Booked Their Onboarding Session
- **Includes:** Customer name, product purchased, session date/time

### 4. Back Office Notification
- **Created in:** Sponsor's notifications table
- **Type:** booking_created
- **Includes:** Full booking details, meeting link, customer info

---

## 📋 Complete Workflow

### User Journey:
```
1. Customer makes purchase on products page
   ↓
2. Stripe processes payment
   ↓
3. Redirects to success page (/products/success?session_id=...)
   ↓
4. Cal.com modal auto-opens after 1 second
   ↓
5. Customer sees booking form with:
   - Name, Email, Phone fields
   - Product name (pre-filled)
   - Available dates (Mon-Fri 9am-6pm)
   - 30-minute time slots with 15-min gaps
   ↓
6. Customer selects date/time and completes booking
   ↓
7. Cal.com sends webhook to /api/webhooks/calcom
   ↓
8. System automatically sends:
   ✅ Email to tavaresdavis81@gmail.com
   ✅ Email to tdaniel@botmakers.ai
   ✅ Confirmation to customer
   ✅ Notification to sponsor
   ✅ Back office notification
```

---

## 🔗 Webhook Setup (Required After Deployment)

### Step 1: Deploy Your Application
Deploy to production (Vercel, etc.) and note your domain:
```
https://yourdomain.com
```

### Step 2: Configure Cal.com Webhook
1. Go to: https://app.cal.com/settings/developer/webhooks
2. Click **"New Webhook"**
3. Configure:
   - **Subscriber URL:** `https://yourdomain.com/api/webhooks/calcom`
   - **Trigger Events:** Select "BOOKING_CREATED"
   - **Active:** ✅ Enabled
4. Click **"Create Webhook"**

### Step 3: Test the Webhook
After setting up the webhook:
1. Make a test purchase
2. Complete a booking in the modal
3. Check that all emails were sent:
   - tavaresdavis81@gmail.com
   - tdaniel@botmakers.ai
   - Customer email
   - Sponsor email (if applicable)
4. Check sponsor's back office for notification

---

## 📁 Files Created/Modified

### Created:
- ✅ `src/app/api/webhooks/calcom/route.ts` - Webhook handler
- ✅ `setup-calcom-automation.js` - Automation setup script
- ✅ `update-calcom-availability.js` - Availability configuration
- ✅ `update-calcom-slug.js` - Slug update script
- ✅ `verify-calcom-settings.js` - Settings verification
- ✅ `CALCOM-AUTOMATION-COMPLETE.md` - This file

### Modified:
- ✅ `src/app/products/success/page.tsx` - Added prefillData with product & session_id
- ✅ `src/components/booking/CalComModal.tsx` - Added product/metadata support

---

## 🧪 Testing Checklist

### Local Testing (Before Webhook Setup):
- ✅ Make test purchase at http://localhost:3050/products
- ✅ Verify success page appears
- ✅ Verify Cal.com modal auto-opens
- ✅ Verify Dialpad link shown in booking form
- ✅ Verify product name pre-filled
- ✅ Verify Mon-Fri 9am-6pm slots available
- ✅ Verify 15-minute gaps between slots

### Production Testing (After Webhook Setup):
- ⏸️ Deploy application to production
- ⏸️ Set up Cal.com webhook
- ⏸️ Make real test purchase
- ⏸️ Complete booking
- ⏸️ Verify emails received:
  - [ ] tavaresdavis81@gmail.com
  - [ ] tdaniel@botmakers.ai
  - [ ] Customer confirmation
  - [ ] Sponsor notification
- ⏸️ Verify back office notification created
- ⏸️ Join Dialpad meeting to test link

---

## 📧 Email Examples

### Admin Notification Email:
```
Subject: New Onboarding Booking - John Doe

New Onboarding Booking
A new onboarding session has been booked.

Booking Details:
  Client: John Doe
  Email: john@example.com
  Phone: (555) 123-4567
  Product: PulseMarket
  Date: Friday, April 5, 2026
  Time: 10:00 AM CT
  Sponsor: Jane Smith (jane@example.com)
  Notes: Questions about API integration

[Join Meeting Button] → https://meetings.dialpad.com/room/aicallers
```

### Client Confirmation Email:
```
Subject: Your Onboarding Session is Confirmed

Onboarding Session Confirmed
Thank you for booking your onboarding session! We're excited to help you get started with PulseMarket.

Session Details:
  Date: Friday, April 5, 2026
  Time: 10:00 AM CT
  Duration: 30 minutes

[Join Meeting (Dialpad) Button]

You'll receive a reminder 24 hours before your session.
```

### Sponsor Notification Email:
```
Subject: John Doe Booked Their Onboarding Session

Your Customer Booked an Onboarding Session
Great news! Your customer has scheduled their onboarding session.

Customer Details:
  Name: John Doe
  Product: PulseMarket
  Session Date: Friday, April 5, 2026
  Session Time: 10:00 AM CT

Your customer is taking the next step to get started with their purchase.
```

---

## 🔧 Troubleshooting

### Webhook Not Firing
**Issue:** No emails sent after booking

**Solutions:**
1. Check Cal.com webhook configuration:
   - URL correct (https://yourdomain.com/api/webhooks/calcom)
   - BOOKING_CREATED event selected
   - Webhook is active
2. Check server logs for webhook errors
3. Test webhook manually using Cal.com's webhook testing tool

### Emails Not Sending
**Issue:** Webhook fires but emails not delivered

**Solutions:**
1. Check `RESEND_API_KEY` env variable set
2. Check email sending quota not exceeded
3. Check spam folders
4. Review server logs for sendEmail errors
5. Verify `theapex@theapexway.net` is verified in Resend

### Sponsor Not Found
**Issue:** Sponsor notification not sent

**Solutions:**
1. Check session_id being passed to Cal.com
2. Verify transaction exists with that session_id
3. Check sponsor relationship in database
4. Review webhook logs for sponsor lookup errors

### Wrong Product Name
**Issue:** Product field shows wrong name

**Solutions:**
1. Check product name passed in prefillData
2. Verify productName state set correctly in success page
3. Check onboarding-check API returns correct product

---

## 🚀 Deployment Checklist

Before deploying to production:

- ✅ Cal.com event type configured
- ✅ Dialpad meeting link added
- ✅ Availability set (Mon-Fri 9am-6pm)
- ✅ Webhook handler created (/api/webhooks/calcom)
- ✅ Email templates tested
- ✅ Success page passes product & session_id
- ⏸️ RESEND_API_KEY in production env vars
- ⏸️ Application deployed
- ⏸️ Cal.com webhook configured
- ⏸️ End-to-end test completed

---

## 📊 Integration Points

### Database Tables Used:
- `transactions` - Look up purchase by session_id
- `distributors` - Find sponsor relationship
- `notifications` - Create back office notification

### Environment Variables Required:
- `RESEND_API_KEY` - For sending emails
- `NEXT_PUBLIC_SITE_URL` - For webhook URL (production)

### External Services:
- **Cal.com:** Booking interface, webhooks
- **Dialpad:** Video meeting platform
- **Resend:** Email delivery service
- **Stripe:** Payment session tracking

---

## 📝 Summary

✅ **Booking System:** Cal.com with Dialpad integration
✅ **Availability:** Mon-Fri 9am-6pm CT with 15-min buffers
✅ **Capture:** Email, phone, product name
✅ **Admin Emails:** tavaresdavis81@gmail.com, tdaniel@botmakers.ai
✅ **Client Confirmation:** Automatic with meeting link
✅ **Sponsor Notification:** Email + back office notification
✅ **Meeting Link:** https://meetings.dialpad.com/room/aicallers

---

**Next Step:** Deploy to production and configure Cal.com webhook! 🚀
