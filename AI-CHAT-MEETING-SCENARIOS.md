# AI Chat Meeting Setup - All Scenarios & Edge Cases

## 🎯 CRITICAL ISSUES FOUND

### 1. **MISSING `physicalAddress` in Tool Schema** ❌
```typescript
// Handler expects it (line 111):
if (params.locationType === 'physical' && params.physicalAddress) {
  physicalAddress = params.physicalAddress;
}

// But tool schema doesn't define it!
// AI has NO WAY to pass the address
```

### 2. **Missing `hybrid` Location Type** ❌
- Schema: `enum: ['virtual', 'physical']`
- Database supports: `'virtual', 'physical', 'hybrid'`
- Users might want BOTH virtual link AND physical location

### 3. **No Multi-Turn Conversation Support** ❌
- User says: "I need a meeting"
- AI can't ask follow-up questions
- Current flow: Call tool immediately or fail

---

## 📋 ALL POSSIBLE USER SCENARIOS

### Scenario 1: Complete Information (One Message)
```
"Home Meeting, Tuesday the 24th of march, 6:30 pm, in person at 281 main street, dallas, texas 77494, 60 minutes, max attendees 20"
```
**Expected:** AI creates meeting immediately

### Scenario 2: Minimal Information
```
"I need to set up a meeting"
"Can you create a registration page?"
"Need a page for my Tuesday meeting"
```
**Expected:** AI asks follow-up questions

### Scenario 3: Partial Information
```
"I'm having a meeting on Tuesday at 6:30pm"
```
**Expected:** AI asks for location, title, duration

### Scenario 4: Virtual Meeting
```
"Virtual meeting on March 25th at 7pm, zoom link is zoom.us/j/12345"
"Online meeting next Thursday at 6pm"
"Zoom call on Friday"
```
**Expected:** AI recognizes virtual, asks for link if not provided

### Scenario 5: In-Person Meeting
```
"In person meeting at my house"
"Physical meeting at 123 Main St"
"Meeting at the office"
```
**Expected:** AI asks for full address

### Scenario 6: Hybrid Meeting (CURRENTLY BROKEN)
```
"Meeting at my house with a Zoom option for remote attendees"
"In person at 123 Main St but also on Zoom"
```
**Expected:** AI should support hybrid, ask for BOTH address and link
**Current:** FAILS - hybrid not in enum

---

## 🗓️ DATE FORMAT EDGE CASES

| User Says | AI Must Convert To |
|-----------|-------------------|
| "Tuesday" | YYYY-MM-DD (next Tuesday) |
| "next Tuesday" | YYYY-MM-DD |
| "March 25th" | 2026-03-25 |
| "3/25/2026" | 2026-03-25 |
| "tomorrow" | YYYY-MM-DD (tomorrow's date) |
| "this Thursday" | YYYY-MM-DD (this week's Thursday) |
| "2026-03-25" | ✅ Already correct |

**Current Issue:** Tool description doesn't guide AI to convert dates

---

## ⏰ TIME FORMAT EDGE CASES

| User Says | AI Must Convert To |
|-----------|-------------------|
| "6:30 pm" | 18:30 |
| "6:30pm" | 18:30 |
| "6pm" | 18:00 |
| "6:30 PM Central" | 18:30 |
| "evening" | ❓ Needs clarification |
| "morning" | ❓ Needs clarification |
| "18:30" | ✅ Already correct |

**Current Issue:** Tool description doesn't guide AI to convert to 24-hour

---

## 📍 LOCATION EDGE CASES

### Physical Location Variations:
| User Says | What AI Needs |
|-----------|---------------|
| "281 Main Street Dallas Texas 77494" | ✅ Full address |
| "123 Main St" | ❌ Incomplete (no city/zip) |
| "at my house" | ❌ Needs full address |
| "Dallas, TX" | ❌ Not specific enough |
| "TBD" | ❓ Should ask again |
| "to be determined" | ❓ Should ask again |

### Virtual Location Variations:
| User Says | What AI Needs |
|-----------|---------------|
| "zoom.us/j/12345" | ✅ Has link |
| "on Zoom" | ❌ Needs actual link |
| "Teams meeting" | ❌ Needs actual link |
| "virtual" | ❌ Needs link |

### Hybrid (CURRENTLY BROKEN):
```
"In person at 123 Main St, also on Zoom at zoom.us/j/12345"
```
**Current:** FAILS - hybrid not supported

---

## ⏱️ DURATION EDGE CASES

| User Says | AI Must Convert To |
|-----------|-------------------|
| "1 hour" | 60 |
| "90 minutes" | 90 |
| "2 hours" | 120 |
| "30 minutes" | 30 |
| "all day" | ❓ Needs clarification |
| (not specified) | 60 (default) |

---

## 👥 ATTENDEE LIMIT EDGE CASES

| User Says | Value |
|-----------|-------|
| "max 20 people" | 20 |
| "max 20 attendees" | 20 |
| "up to 50" | 50 |
| "unlimited" | null |
| (not specified) | null |

---

## ✍️ TITLE EDGE CASES

| User Says | Title to Use |
|-----------|--------------|
| "Home Meeting" | "Home Meeting" |
| "Tuesday meeting" | Should ask for better title |
| "Meeting" | Should ask for descriptive title |
| (not specified) | Must ask |

---

## 🌍 TIMEZONE EDGE CASES

| Scenario | What to Do |
|----------|------------|
| User says "Central" | America/Chicago |
| User says "EST" or "Eastern" | America/New_York |
| User says "PST" or "Pacific" | America/Los_Angeles |
| Not specified | Default: America/Chicago |
| User in different timezone | Should ask |

---

## 🚨 VALIDATION EDGE CASES

### Duplicate Slugs:
```
- User creates "Home Meeting"
- Slug: "home-meeting"
- User creates another "Home Meeting"
- Slug conflict!
```
**Current:** No check for duplicates

### Past Dates:
```
User: "Meeting on March 1st" (but it's already March 22nd)
```
**Current:** No validation

### Invalid Times:
```
User: "25:00" or "6:70pm"
```
**Current:** No validation

---

## 🔄 CONVERSATIONAL FLOW EXAMPLES

### Example 1: Missing Information
```
User: "I need a meeting"
AI: "I'd be happy to help! What's the title/name for your meeting?"
User: "Home Meeting"
AI: "Great! When is it? Please provide the date and time."
User: "Tuesday at 6:30pm"
AI: "Will this be virtual or in-person?"
User: "In person"
AI: "What's the address for the meeting?"
User: "123 Main St, Dallas TX 75001"
AI: [Creates meeting]
```

### Example 2: Ambiguous Info
```
User: "Meeting on Zoom"
AI: "Got it! What's the Zoom link for this meeting?"
User: "zoom.us/j/12345"
AI: "Perfect! What date and time works for you?"
```

---

## 🛠️ FIXES NEEDED

1. **Add `physicalAddress` to tool schema**
2. **Add `hybrid` to location type enum**
3. **Improve tool descriptions for date/time conversion**
4. **Add slug uniqueness check**
5. **Add date validation (no past dates)**
6. **Consider multi-turn conversation (follow-up questions)**
7. **Add timezone detection/asking**
8. **Better title suggestions**

---

## 🧪 TEST CASES

### Test 1: Typos (like user's message)
```
Input: "Home Meetong, Tuesday teh 24th of march, 6:30 pm, in eprosn at 281 main strteet, daals, etxa 77494, 60 minutes, max attendes 20"
Expected: AI should understand despite typos
```

### Test 2: Minimal
```
Input: "I need a meeting"
Expected: AI asks for required fields
```

### Test 3: Virtual
```
Input: "Zoom meeting tomorrow at 7pm, link is zoom.us/j/12345"
Expected: Creates virtual meeting
```

### Test 4: Hybrid (BROKEN)
```
Input: "Meeting at 123 Main St Dallas TX but also on Zoom at zoom.us/j/12345"
Expected: Should create hybrid meeting
Current: FAILS
```

### Test 5: Relative Dates
```
Input: "Meeting next Tuesday at 6pm"
Expected: Converts "next Tuesday" to YYYY-MM-DD
```

### Test 6: 12-Hour Time
```
Input: "Meeting at 6:30 PM"
Expected: Converts to 18:30
```

### Test 7: No Duration
```
Input: "Meeting Tuesday at 6pm"
Expected: Defaults to 60 minutes
```

### Test 8: No Max Attendees
```
Input: "Meeting Tuesday at 6pm"
Expected: maxAttendees = null (unlimited)
```
