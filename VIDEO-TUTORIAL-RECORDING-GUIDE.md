# Video Tutorial Recording Guide
## Using Guidde + Scribe for Business Center Tutorials

**Tools needed:**
- Guidde (AI voiceover videos): https://guidde.com
- Scribe (screenshot guides): https://scribehow.com
- Test account with sample data

**Total time estimate:** 2-3 hours for all 7 tutorials

---

## Setup (One-time, 10 minutes)

### 1. Install Guidde Extension
- Go to https://guidde.com
- Sign up for free account
- Install Chrome extension
- Enable microphone access (for clicks only, not voice)

### 2. Install Scribe Extension
- Go to https://scribehow.com
- Sign up for free account
- Install Chrome extension

### 3. Prepare Test Account
- Create test distributor account
- Add sample data:
  - 3-5 leads in CRM
  - 2-3 contacts
  - 1-2 nurture campaigns
  - Sample AI chat history

---

## Tutorial 1: AI Chatbot (Target: 3-4 minutes)

### Recording Script

**Actions to perform:**
1. Navigate to dashboard
2. Click blue AI Assistant button (bottom-right)
3. Type question: "Who are my top performers this month?"
4. Show AI response
5. Click "Team Insights" tab
6. Show insights page
7. Click "History" tab
8. Show past conversations
9. Type question: "How much BV do I need for Regional Director?"
10. Show response
11. Close modal

**Guidde will automatically:**
- Record these clicks
- Generate voiceover: "First, click the AI Assistant button in the bottom-right corner..."
- Create 3-4 minute video
- Add captions

**Scribe will automatically:**
- Take screenshots of each step
- Write descriptions: "Step 1: Click the AI Assistant button"
- Generate shareable guide

---

## Tutorial 2: AI Voice Agent (Target: 5-6 minutes)

### Recording Script

**Actions to perform:**
1. Navigate to Business Center → AI Voice Calls
2. Click "Start Practice Call"
3. Select scenario: "Cold Call - Small Business Owner"
4. Click "Begin Call"
5. Show call interface (2 min of fake call)
6. Click "End Call"
7. View feedback page
8. Show tone analysis
9. Show objection handling score
10. Show suggested improvements
11. Click "Practice Again"

**Note:** For the actual call portion, you can:
- Option A: Talk for 2 minutes (Guidde records audio)
- Option B: Skip/fast-forward (edit in post)
- Option C: Use placeholder screen "Call in progress..."

---

## Tutorial 3: Lead Autopilot (Target: 4-5 minutes)

### Recording Script

**Actions to perform:**
1. Navigate to Business Center → Lead Autopilot
2. Click "Meeting Reservations" tab
3. Click "Create New Meeting"
4. Fill in meeting details:
   - Title: "Monthly Business Overview"
   - Date: [next week]
   - Time: "7:00 PM CST"
   - Zoom link: "https://zoom.us/j/example"
   - Description: "Learn how agents are earning..."
5. Click "Save Meeting"
6. Click "Send Invitations"
7. Enter 3 test emails
8. Customize invitation message
9. Click "Send to 3 recipients"
10. View invitations sent confirmation
11. Show meeting page with RSVP tracking

---

## Tutorial 4: AI Lead Nurture (Target: 5-6 minutes)

### Recording Script

**Actions to perform:**
1. Navigate to Business Center → AI Lead Nurture
2. Click "Create New Campaign"
3. Fill in prospect details:
   - Name: "Sarah Johnson"
   - Email: "sarah@example.com"
   - How you met: "Coffee shop networking event"
   - Interests: "Work from home, passive income"
   - Birthday: "05-15"
   - Kids: "2"
   - Hobbies: "Yoga, reading"
4. Click "Create Campaign"
5. Show "Campaign created" confirmation
6. View campaign in list
7. Click campaign to expand
8. Show "Week 1 of 7" status
9. Show next email scheduled date
10. Click "Preview Email" button (if exists)
11. Show sample Week 1 email

---

## Tutorial 5: CRM System (Target: 6-7 minutes)

### Recording Script

**Actions to perform:**
1. Navigate to Business Center → CRM Dashboard
2. Show overview stats (leads, contacts, tasks)
3. Click "Activities" tab
4. Show recent activities list
5. Click "Tasks" tab
6. Show pending tasks
7. Click "Add New Task"
8. Fill in task:
   - Title: "Follow up with John"
   - Due date: [tomorrow]
   - Priority: "High"
9. Click "Save Task"
10. Return to "Overview" tab
11. Show updated task count

---

## Tutorial 6: Leads Management (Target: 3-4 minutes)

### Recording Script

**Actions to perform:**
1. Navigate to Business Center → Leads
2. Show leads list
3. Click "Add New Lead"
4. Fill in lead details:
   - Name: "Mike Smith"
   - Email: "mike@example.com"
   - Phone: "555-123-4567"
   - Source: "Facebook ad"
   - Status: "New"
   - Interest level: "High"
5. Click "Save Lead"
6. Show lead in list
7. Click lead to open profile
8. Click "Log Activity"
9. Add activity: "Called, left voicemail"
10. Click "Set Follow-up Task"
11. Create task: "Call again in 3 days"
12. Show completed lead profile

---

## Tutorial 7: Contacts Management (Target: 3-4 minutes)

### Recording Script

**Actions to perform:**
1. Navigate to Business Center → Contacts
2. Show contacts list
3. Click existing contact to view profile
4. Show contact details
5. Click "Add Note"
6. Add note: "Interested in Business Center upgrade"
7. Click "View Purchase History"
8. Show subscriptions/purchases
9. Click "Send Email" button
10. Show email modal
11. Click "Export Contacts"
12. Show export options (CSV, Excel)

---

## Post-Recording Workflow

### For Each Tutorial:

#### Step 1: Guidde Processing (Automatic)
1. Guidde processes recording (2-3 min)
2. AI generates voiceover
3. Review video
4. Edit if needed:
   - Trim beginning/end
   - Add title card
   - Adjust voiceover speed
5. Click "Share" → Get embed code

#### Step 2: Scribe Processing (Automatic)
1. Scribe generates guide (1 min)
2. Review screenshots
3. Edit descriptions if needed
4. Click "Share" → Get embed code

#### Step 3: Add to Help Page
```typescript
// Example: src/app/help/business-center/ai-chatbot/page.tsx

import VideoEmbed from '@/components/help/VideoEmbed';

export default function AIChatbotHelpPage() {
  return (
    <div>
      <h1>How to Use AI Chatbot</h1>

      {/* Video Tutorial */}
      <VideoEmbed
        guiddeUrl="https://app.guidde.com/share/[id]"
        title="AI Chatbot Tutorial"
      />

      {/* Screenshot Guide */}
      <div className="my-8">
        <h2>Step-by-Step Guide</h2>
        <iframe
          src="https://scribehow.com/embed/[id]"
          width="100%"
          height="640"
          allowFullScreen
        />
      </div>
    </div>
  );
}
```

---

## Time Breakdown

| Tutorial | Recording | Processing | Total |
|----------|-----------|------------|-------|
| AI Chatbot | 5 min | 3 min | 8 min |
| AI Voice Agent | 7 min | 3 min | 10 min |
| Lead Autopilot | 6 min | 3 min | 9 min |
| AI Lead Nurture | 7 min | 3 min | 10 min |
| CRM System | 8 min | 3 min | 11 min |
| Leads Management | 5 min | 3 min | 8 min |
| Contacts Management | 5 min | 3 min | 8 min |
| **TOTAL** | **43 min** | **21 min** | **64 min (~1 hour)** |

---

## Tips for Better Recordings

### 1. **Prepare Sample Data**
- Have realistic lead names ready
- Use professional email addresses
- Create believable scenarios

### 2. **Clean Your Screen**
- Close unnecessary tabs
- Hide bookmarks bar
- Full screen the app
- Use incognito mode (clean state)

### 3. **Slow Down Actions**
- Click deliberately
- Pause 1-2 seconds between steps
- Give Guidde/Scribe time to capture

### 4. **Consistent Naming**
- Use same test names across tutorials
- Makes it easier for users to follow

### 5. **Test First**
- Do a practice run
- Make sure all features work
- Verify test data exists

---

## Alternative: Fully Automated with AI

### **Option B: Use ChatGPT to Generate Voiceover Scripts**

If Guidde's AI voiceover isn't good enough, you can:

1. **Record silently with Guidde**
2. **Export video**
3. **Use ChatGPT to generate voiceover script:**

```
Prompt: "Create a professional voiceover script for a tutorial on [feature].
Steps performed: [list actions from recording].
Target audience: Insurance agents new to the platform.
Tone: Friendly, helpful, professional.
Length: 3-4 minutes."
```

4. **Use ElevenLabs AI voice** (https://elevenlabs.io) to generate audio
5. **Add audio to video** with CapCut or DaVinci Resolve

**Cost:** ~$5/month for ElevenLabs

---

## Recommended Approach for Apex

### **Use Guidde for Everything**

**Why:**
- AI voiceover is surprisingly good
- No video editing skills needed
- Fastest option (1 hour for all 7 videos)
- Free tier allows 25 videos/month
- Professional-looking results

### **Workflow:**
1. Install Guidde extension
2. Record all 7 tutorials (1 hour)
3. Let AI generate voiceovers
4. Review and publish
5. Embed in help pages

**Total time:** 2 hours (including review/edits)

---

## Next Steps

**Want me to:**
1. ✅ Create Guidde account for you?
2. ✅ Set up test account with sample data?
3. ✅ Create detailed recording checklist?
4. ✅ Build VideoEmbed component for help pages?

**Or would you prefer to:**
- Try Guidde yourself first?
- Use a different tool?
- Record videos manually with Loom?

Let me know and I'll help you get started!
