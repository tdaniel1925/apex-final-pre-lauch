# Apex Voice Agent - Complete Test Plan

**Test Date:** ___________
**Tester:** ___________
**Environment:** Production / Staging / Local

---

## Pre-Test Setup

- [ ] Run database migrations:
  ```bash
  npm run db:migrate
  # or
  supabase db push
  ```

- [ ] Verify environment variables:
  ```bash
  VAPI_API_KEY=sk_...
  VAPI_WEBHOOK_SECRET=...
  TWILIO_ACCOUNT_SID=...
  TWILIO_AUTH_TOKEN=...
  TWILIO_PHONE_NUMBER=...
  ANTHROPIC_API_KEY=...
  ```

- [ ] Create test accounts:
  - FREE tier user: `test-free@example.com`
  - PAID tier user: `test-paid@example.com`

---

## Test 1: Signup with Bio Field (Phase 1)

**Goal:** Verify bio field is collected during signup

### Steps:
1. Navigate to `/signup`
2. Fill out all required fields
3. **NEW:** Enter bio in textarea field:
   - Bio: "I'm a former teacher passionate about helping families with technology and insurance."
   - Verify max 500 characters
4. Submit signup form

### Expected Results:
- [ ] Bio field is visible on signup form
- [ ] Bio field accepts 1-2 sentences
- [ ] Bio field is optional (can skip)
- [ ] Bio field has 500 character limit
- [ ] Signup succeeds with bio
- [ ] Signup succeeds without bio

### Actual Results:
```
✅ Pass / ❌ Fail
Notes: _______________________________
```

---

## Test 2: Database Schema (Phase 1)

**Goal:** Verify database fields exist and store data correctly

### Steps:
1. Query distributors table after signup:
   ```sql
   SELECT id, first_name, bio, first_call_completed, business_center_tier
   FROM distributors
   WHERE email = 'test-free@example.com';
   ```

### Expected Results:
- [ ] `bio` field exists and contains entered text
- [ ] `first_call_completed` field exists and defaults to FALSE
- [ ] `business_center_tier` field exists and defaults to 'free'

### Actual Results:
```
bio: ___________________________
first_call_completed: ___________
business_center_tier: ___________
```

---

## Test 3: Welcome Page Display (Phase 4)

**Goal:** Verify welcome page shows voice agent information

### Steps:
1. Complete signup
2. View `/signup/welcome` page

### Expected Results:
- [ ] "Your Apex Voice Agent" heading visible
- [ ] AI phone number displayed prominently
- [ ] Step 1 mentions "personalized welcome" and "wow you"
- [ ] Purple gradient styling on voice agent section
- [ ] Encouragement to call the number

### Actual Results:
```
✅ Pass / ❌ Fail
Notes: _______________________________
```

---

## Test 4: Profile Page - Voice Agent Section (Phase 5)

**Goal:** Verify profile page shows voice agent card

### Steps:
1. Login as test user
2. Navigate to `/dashboard/profile`
3. Scroll to voice agent section

### Expected Results:
- [ ] "Apex Voice Agent" card visible
- [ ] AI phone number displayed
- [ ] Subscription tier shown (FREE or PAID)
- [ ] Owner Mode explanation present
- [ ] Prospect Mode explanation present
- [ ] "Customize Voice Agent" link visible for PAID tier only

### Actual Results:
```
Phone Number: _____________________
Tier Displayed: ___________________
Customize Link: ☐ Visible ☐ Hidden
```

---

## Test 5: VAPI Prompt Generation (Phase 2)

**Goal:** Verify VAPI prompt includes caller detection logic

### Steps:
1. Check VAPI assistant in VAPI dashboard
2. View system prompt for newly created assistant
3. Search for key phrases

### Expected Results:
- [ ] Prompt includes "CALLER DETECTION" section
- [ ] Prompt includes "{{call.customer.number}}" variable
- [ ] Prompt includes "OWNER MODE" section
- [ ] Prompt includes "PROSPECT MODE" section
- [ ] First call welcome message present
- [ ] Returning call greeting present
- [ ] Bio is referenced in Owner Mode
- [ ] FREE tier restrictions in Prospect Mode

### Actual Results:
```
✅ Pass / ❌ Fail
Key sections found: ___________________
```

---

## Test 6: First Call - Owner Mode (Phases 2 & 6)

**Goal:** Verify special welcome on first call from owner

### Steps:
1. Sign up new distributor
2. Note their AI phone number
3. Call the AI phone number FROM the phone number used in signup
4. Listen to greeting

### Expected Results:
- [ ] AI recognizes it's the owner calling
- [ ] AI says: "Welcome to Apex Affinity Group!"
- [ ] AI asks: "What would you like to know about your new AI Voice agent?"
- [ ] AI references bio naturally in conversation
- [ ] Conversation is warm, engaging, and impressive
- [ ] After call, check database: `first_call_completed` = TRUE

### Actual Results:
```
Greeting Heard: _______________________________
Bio Referenced: ☐ Yes ☐ No
first_call_completed updated: ☐ Yes ☐ No
```

---

## Test 7: Second Call - Owner Mode (Phases 2 & 6)

**Goal:** Verify simple greeting on subsequent owner calls

### Steps:
1. Call AI phone number again FROM owner's phone
2. Listen to greeting

### Expected Results:
- [ ] AI recognizes it's the owner
- [ ] AI says: "Hey [FirstName], how can I help you today?"
- [ ] No special welcome message
- [ ] Simple, friendly tone

### Actual Results:
```
Greeting Heard: _______________________________
✅ Pass / ❌ Fail
```

---

## Test 8: Prospect Call - SMS Notification (Phase 6)

**Goal:** Verify prospect calls trigger SMS to owner

### Steps:
1. Call AI phone number FROM a DIFFERENT phone number
2. Have a conversation with AI
3. Leave a message for the owner
4. End call
5. Check owner's phone for SMS

### Expected Results:
- [ ] AI recognizes this is NOT the owner
- [ ] AI says: "Hi! You've reached [Name]'s Apex business line..."
- [ ] AI discusses Apex (FREE tier)
- [ ] AI takes message professionally
- [ ] SMS arrives at owner's phone
- [ ] SMS format: "New call from [number]: [transcript]"

### Actual Results:
```
AI Greeting Correct: ☐ Yes ☐ No
SMS Received: ☐ Yes ☐ No
SMS Content: _______________________________
```

---

## Test 9: VAPI Webhook Processing (Phase 6)

**Goal:** Verify webhook handler processes calls correctly

### Steps:
1. Check server logs during/after call
2. Verify webhook endpoint receives data

### Expected Results:
- [ ] Webhook receives POST to `/api/vapi/webhooks`
- [ ] Logs show: "VAPI Webhook Received: end-of-call-report"
- [ ] Logs show: "Owner call detected" OR "Prospect call detected"
- [ ] For owner: "Marking first call as completed" (first time only)
- [ ] For prospect: "Sending SMS"
- [ ] No errors in logs

### Actual Results:
```
✅ Pass / ❌ Fail
Logs: _______________________________
```

---

## Test 10: AI Chatbot - FREE Tier Restriction (Phase 7)

**Goal:** Verify FREE tier users cannot customize voice agent

### Steps:
1. Login as FREE tier user
2. Navigate to `/dashboard/ai-assistant`
3. Ask chatbot: "Can you make my voice agent talk about my real estate business?"

### Expected Results:
- [ ] Chatbot checks user's tier
- [ ] Chatbot responds with: "Voice Agent Customization Not Available"
- [ ] Message explains user is on FREE tier
- [ ] Message mentions upgrade to Business Center ($39/month)
- [ ] Message lists customization benefits
- [ ] No voice agent update occurs

### Actual Results:
```
Response Correct: ☐ Yes ☐ No
Upgrade Mentioned: ☐ Yes ☐ No
```

---

## Test 11: AI Chatbot - PAID Tier Customization (Phase 7)

**Goal:** Verify PAID tier users can customize voice agent

### Steps:
1. Upgrade test user to PAID tier (basic/enhanced/platinum)
2. Login as PAID tier user
3. Navigate to `/dashboard/ai-assistant`
4. Ask chatbot: "Update my voice agent to mention I also do real estate. Tell prospects about my services at ABC Realty."

### Expected Results:
- [ ] Chatbot checks user's tier → PAID detected
- [ ] Chatbot shows preview: "Voice Agent Customization Preview"
- [ ] Preview shows custom programming
- [ ] User can refine or confirm
- [ ] On confirmation, chatbot updates VAPI assistant
- [ ] Success message: "Voice Agent Updated Successfully!"
- [ ] AI phone number included in response

### Actual Results:
```
Preview Shown: ☐ Yes ☐ No
Update Applied: ☐ Yes ☐ No
Success Message: ☐ Yes ☐ No
```

---

## Test 12: PAID Tier Custom Prompt in Action

**Goal:** Verify custom programming works for prospect calls

### Steps:
1. After customizing voice agent (Test 11)
2. Call AI phone number FROM a different phone
3. Listen to greeting and conversation

### Expected Results:
- [ ] AI uses custom programming for prospect
- [ ] AI mentions real estate (or whatever was programmed)
- [ ] Owner Mode still uses standard greeting (not custom)
- [ ] SMS notification still works

### Actual Results:
```
Custom Programming Used: ☐ Yes ☐ No
Content Heard: _______________________________
```

---

## Test 13: Tier Display in Chatbot Context

**Goal:** Verify chatbot knows user's tier at all times

### Steps:
1. Login as FREE tier user
2. Ask chatbot: "What tier am I on?"
3. Upgrade to PAID tier
4. Ask again: "What tier am I on now?"

### Expected Results:
- [ ] Chatbot correctly identifies FREE tier
- [ ] Chatbot correctly identifies PAID tier after upgrade
- [ ] System prompt includes tier information
- [ ] Chatbot behavior changes based on tier

### Actual Results:
```
FREE Tier Identified: ☐ Yes ☐ No
PAID Tier Identified: ☐ Yes ☐ No
```

---

## Test 14: Profile Page - PAID Tier Customize Link

**Goal:** Verify customize link appears for PAID tier

### Steps:
1. Login as PAID tier user
2. Navigate to `/dashboard/profile`
3. Find voice agent section

### Expected Results:
- [ ] "PAID Tier (Customizable)" badge shown
- [ ] "Customize Voice Agent" button visible
- [ ] Button links to `/dashboard/ai-assistant?customize=voice`

### Actual Results:
```
Badge Correct: ☐ Yes ☐ No
Button Visible: ☐ Yes ☐ No
Link Correct: ☐ Yes ☐ No
```

---

## Test 15: End-to-End Integration

**Goal:** Test complete flow from signup to customization

### Steps:
1. Sign up new distributor with bio
2. Verify welcome page shows voice agent
3. Call AI phone number from owner's phone → First call welcome
4. Call again → Simple greeting
5. Have someone else call → Prospect mode + SMS
6. Check profile page → Voice agent section visible
7. Upgrade to PAID tier
8. Customize voice agent via chatbot
9. Test custom programming with prospect call

### Expected Results:
- [ ] All phases work together seamlessly
- [ ] No errors or issues
- [ ] Data flows correctly between components
- [ ] User experience is smooth

### Actual Results:
```
✅ Complete Success / ⚠️ Partial Success / ❌ Failed
Issues Found: _______________________________
```

---

## Performance & Edge Cases

### Test 16: Multiple Concurrent Calls
- [ ] Two prospects call at same time
- [ ] Both calls processed correctly
- [ ] Both SMS notifications sent

### Test 17: Invalid Phone Number Format
- [ ] Caller has international format
- [ ] Webhook handles gracefully
- [ ] SMS still sent (if possible)

### Test 18: Missing Bio
- [ ] User signed up without bio
- [ ] First call welcome works without bio reference
- [ ] No errors in prompt generation

### Test 19: Voice Agent Not Provisioned
- [ ] User without voice agent asks to customize
- [ ] Chatbot responds: "No Voice Agent Found"
- [ ] Suggests contacting support

---

## Bug Report Template

**Test:** ____________
**Severity:** ☐ Critical ☐ High ☐ Medium ☐ Low
**Description:** _______________________________
**Steps to Reproduce:** _______________________________
**Expected:** _______________________________
**Actual:** _______________________________
**Screenshots/Logs:** _______________________________

---

## Sign-Off

**All Tests Passed:** ☐ Yes ☐ No
**Total Tests:** _____ Passed / _____ Failed
**Ready for Production:** ☐ Yes ☐ No
**Signed:** ____________ **Date:** ____________

---

## Notes / Additional Findings

```
_____________________________________________
_____________________________________________
_____________________________________________
```
