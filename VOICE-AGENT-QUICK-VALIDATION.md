# Voice Agent - Quick Validation Checklist

**Status:** Ready for manual testing
**Auto Tests:** 3/12 passed (core logic ✅)
**Full E2E:** Requires running application

---

## 🔧 Setup (Do This First)

### 1. Run Database Migrations
```bash
# Apply the two new migrations
npx supabase db push

# Or if using npm scripts:
npm run db:migrate
```

### 2. Verify Migrations Applied
```sql
-- Check in Supabase SQL Editor or psql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'distributors'
AND column_name IN ('bio', 'first_call_completed');

-- Should return:
-- bio              | text
-- first_call_completed | boolean
```

### 3. Add Environment Variable
```bash
# Add to .env.local
VAPI_WEBHOOK_SECRET=8kJ2mN9pL4qR7sT0vW3xY6zB1cD5eF8gH2iJ4kL7mN0pQ3rS6tU9vW2xY5zA8bC
```

### 4. Start Dev Server
```bash
npm run dev
```

---

## ✅ Quick Validation Tests (5 minutes)

### Test 1: Bio Field in Signup Form
**Time:** 30 seconds

1. Navigate to `http://localhost:3000/signup`
2. Look for textarea field labeled "Tell us about yourself"
3. **Expected:** Bio field visible, optional, max 500 chars

**Result:** ☐ Pass ☐ Fail
**Notes:** _____________________________

---

### Test 2: Profile Page Voice Agent Section
**Time:** 1 minute

1. Login to dashboard
2. Navigate to `/dashboard/profile`
3. Scroll down to find voice agent card
4. **Expected:**
   - "Apex Voice Agent" card visible
   - Phone number displayed
   - Tier badge shown (FREE/PAID)
   - Owner Mode explanation
   - Prospect Mode explanation

**Result:** ☐ Pass ☐ Fail
**Notes:** _____________________________

---

### Test 3: Welcome Page Voice Agent Display
**Time:** 1 minute

1. Sign up a new test user with bio
2. View welcome page after signup
3. **Expected:**
   - Voice agent phone number prominently displayed
   - Purple/blue gradient styling
   - "Personalized welcome" messaging
   - Encouragement to call

**Result:** ☐ Pass ☐ Fail
**Notes:** _____________________________

---

### Test 4: AI Chatbot Tier Awareness (FREE)
**Time:** 1 minute

1. Login as FREE tier user
2. Navigate to `/dashboard/ai-assistant`
3. Ask: "Can you customize my voice agent?"
4. **Expected:**
   - Chatbot responds with upgrade message
   - Mentions Business Center ($39/month)
   - Explains FREE tier limitations

**Result:** ☐ Pass ☐ Fail
**Chatbot Response:** _____________________________

---

### Test 5: Database Fields Exist
**Time:** 1 minute

```sql
-- Run in Supabase SQL Editor
SELECT
  id,
  first_name,
  last_name,
  bio,
  first_call_completed,
  business_center_tier,
  ai_phone_number
FROM distributors
LIMIT 1;
```

**Expected:**
- All fields exist
- No SQL errors
- bio and first_call_completed columns present

**Result:** ☐ Pass ☐ Fail
**Notes:** _____________________________

---

## 🎯 Core Features Validation

### ✅ Automated Tests Confirmed Working:
- [x] VAPI prompt generation with caller detection
- [x] Owner Mode vs Prospect Mode structure
- [x] Tier-based customization logic
- [x] Provision AI endpoint structure

### ⏳ Needs Manual Testing:
- [ ] Signup form bio field
- [ ] Welcome page display
- [ ] Profile page voice agent section
- [ ] AI chatbot tier checking
- [ ] VAPI webhook (requires real call)
- [ ] SMS notifications (requires Twilio + real call)

---

## 📱 Real-World Call Testing (Optional)

**Only do this if you want to test actual calls:**

### Test 6: Owner First Call
1. Sign up new distributor with bio
2. Note AI phone number from welcome page
3. Call from signup phone number
4. **Expected:** Special welcome message

### Test 7: Prospect Call + SMS
1. Call AI number from different phone
2. Have conversation, leave message
3. **Expected:** SMS arrives at owner's phone

---

## 🎉 Success Criteria

**Minimum for "Working":**
- [ ] Bio field appears in signup
- [ ] Profile page shows voice agent section
- [ ] Welcome page highlights voice agent
- [ ] AI chatbot knows user's tier
- [ ] Database migrations applied

**Full Production Ready:**
- [ ] All above PLUS real call testing
- [ ] SMS notifications confirmed
- [ ] VAPI webhook processing verified
- [ ] First call tracking works

---

## 📝 Sign-Off

**Basic Features:** ☐ Validated ☐ Issues Found
**Ready for Testing:** ☐ Yes ☐ No
**Tester:** _____________ **Date:** _____________

**Issues Found:**
```
_____________________________________________
_____________________________________________
```
