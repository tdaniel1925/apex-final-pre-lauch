# ⚡ Attendance Tracking - Quick Start Guide

**Status:** ✅ Twilio Configured | ⏳ Database Migration Pending

---

## 🎯 What You Have Now

Your meeting invitation system now tracks attendance and sends SMS notifications to distributors when their invitees join meetings!

---

## 🚀 Next Steps (In Order)

### **Step 1: Run Database Migration** ⚠️ REQUIRED

The migration file is already created. You need to run it to add the attendance tracking columns:

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to: https://supabase.com/dashboard/project/brejvdvzwshroxkkhmzy/editor
2. Click "SQL Editor"
3. Copy/paste the contents of: `supabase/migrations/20260319000001_add_attendance_tracking.sql`
4. Click "Run"

**Option B: Via CLI**
```bash
npx supabase db push
```
(May require migration repair - see error message if it fails)

---

### **Step 2: Add Phone Numbers to Your Distributors**

For SMS notifications to work, distributors need phone numbers in the database:

```sql
-- Update YOUR phone number for testing
UPDATE distributors
SET phone = '+16517287626'  -- Your Twilio number or your actual cell
WHERE email = 'your-email@example.com';
```

**Phone Format:** Must be E.164 format: `+1234567890`

Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/brejvdvzwshroxkkhmzy/editor

---

### **Step 3: Test the Flow**

1. **Send yourself a test invitation:**
   - Go to your Autopilot dashboard
   - Create a meeting invitation
   - Send it to your email address

2. **Check your email:**
   - Should receive invitation email
   - Click the "Join Meeting" button

3. **You'll land on the entrance page:**
   - Beautiful page at `/live/{invitation-id}`
   - Shows meeting details
   - Has an "Enter Room" button

4. **Click "Enter Room":**
   - Should redirect to your meeting link (Zoom/Teams)
   - Database should mark attendance
   - You should receive SMS notification! 📱

5. **Verify in database:**
   ```sql
   SELECT
     recipient_name,
     meeting_title,
     entrance_page_viewed,
     attended,
     attended_at
   FROM meeting_invitations
   ORDER BY created_at DESC
   LIMIT 5;
   ```

---

## 📊 What's Different Now?

### **Before:**
```
Email → Direct Zoom/Teams Link
❌ No tracking
❌ No notifications
```

### **After:**
```
Email → Entrance Page → "Enter Room" → Meeting Link
✅ Tracks page views
✅ Tracks attendance
✅ SMS to distributor
```

---

## 🎯 Quick Test Checklist

- [ ] Database migration ran successfully
- [ ] Distributor has phone number in database
- [ ] Sent test invitation to yourself
- [ ] Clicked link in email
- [ ] Saw entrance page (`/live/{id}`)
- [ ] Clicked "Enter Room" button
- [ ] Redirected to meeting link
- [ ] Received SMS notification 📱
- [ ] Checked database - `attended = true`

---

## 🐛 Troubleshooting

### **SMS Not Received?**

1. **Check distributor phone number:**
   ```sql
   SELECT id, first_name, last_name, phone
   FROM distributors
   WHERE email = 'your-email@example.com';
   ```
   - Should return your phone number in E.164 format (+16517287626)

2. **Check Twilio credentials:**
   ```bash
   # In .env.local
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
   ```

3. **Check server logs:**
   - Look for `[Attendance SMS]` logs
   - Should see: "Successfully sent" with message ID
   - Or: "Twilio not configured" if credentials missing

4. **Verify Twilio account:**
   - Go to: https://console.twilio.com/
   - Check if account is active
   - Check if phone number is verified

### **Entrance Page Shows 404?**

- Invitation might not exist in database
- Check invitation ID is correct
- Try sending a new test invitation

### **"Enter Room" Doesn't Redirect?**

- Check if `meeting_link` is set on the invitation
- Check browser console for errors
- Check server logs for API errors

---

## 📱 SMS Message Format

When someone attends your meeting, you'll receive:

```
🎉 John Doe just joined your meeting "Product Demo"
scheduled for Wed, Mar 19, 7:00 PM CST!
```

---

## 🔧 Environment Variables (Already Set)

✅ **Twilio Configured:**
```bash
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
```

✅ **Resend Configured:**
```bash
RESEND_API_KEY=re_N7WUE23T_FuSdXfAbD7WodviGa3nJnPtw
```

✅ **Supabase Configured:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://brejvdvzwshroxkkhmzy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=... (set)
```

---

## 📝 Database Schema Changes

The migration adds these columns to `meeting_invitations`:

| Column | Type | Purpose |
|--------|------|---------|
| `entrance_page_viewed` | BOOLEAN | Did they view the entrance page? |
| `entrance_page_viewed_at` | TIMESTAMPTZ | When did they view it? |
| `attended` | BOOLEAN | Did they click "Enter Room"? |
| `attended_at` | TIMESTAMPTZ | When did they attend? |

Plus 2 indexes for fast queries.

---

## 🎯 Success Criteria

You'll know it's working when:

1. ✅ Migration ran without errors
2. ✅ Test invitation email received
3. ✅ Entrance page loads with meeting details
4. ✅ "Enter Room" redirects to meeting link
5. ✅ SMS received on your phone
6. ✅ Database shows `attended = true`

---

## 📚 Full Documentation

For detailed information, see:
- **`ATTENDANCE-TRACKING-IMPLEMENTATION.md`** - Complete implementation guide
- **`AUTOPILOT-INVITATIONS-FIX-SUMMARY.md`** - Previous fixes summary

---

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Check server logs: `grep "Attendance" logs/api.log`
3. Verify Twilio dashboard: https://console.twilio.com/
4. Check Supabase logs: https://supabase.com/dashboard/project/brejvdvzwshroxkkhmzy/logs

---

**Last Updated:** March 19, 2026
**Status:** Ready for Testing (after database migration)
