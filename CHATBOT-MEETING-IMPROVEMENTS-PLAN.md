# AI Chatbot Meeting Registration Improvements Plan

## Overview
Comprehensive improvements to the meeting registration flow in the AI chatbot to create a better user experience with preview, iteration, and voice input capabilities.

---

## 1. Improved Meeting Registration Flow

### Current Flow:
- User asks to create meeting
- Chatbot asks for all details at once
- Meeting created immediately
- No preview or approval step

### New Flow:
1. **Information Gathering (Conversational)**:
   - Ask for meeting type/purpose first
   - Based on type, ask for WHO it's for
   - Ask for any extra special information
   - Ask for date, time, location details

2. **Description Generation**:
   - Use Claude to write a beautiful, engaging meeting description
   - Consider the purpose, audience, and special details
   - Create compelling copy that will attract attendees

3. **Preview & Approval**:
   - Show inline preview of:
     - Meeting description/message
     - Full registration page preview (embedded iframe or screenshot)
   - Ask user: "Does this look good?"

4. **Iterative Refinement**:
   - If user says no → Ask "What would you like to change?"
   - User provides feedback
   - Regenerate description with changes
   - Show new preview
   - Repeat until approved

5. **Creation**:
   - When approved → Create meeting with custom_message field populated
   - Display beautiful formatted message on registration page

---

## 2. Fix Broken Image Preview

### Current Issue:
- Preview shows as broken image link
- Not helpful for user

### Solution:
- **Option A**: Inline iframe embed of registration page
  ```tsx
  <iframe
    src={registrationUrl}
    className="w-full h-96 border rounded-lg"
    title="Registration Page Preview"
  />
  ```

- **Option B**: Use Puppeteer/Playwright to generate screenshot
  - Take screenshot of registration page
  - Display as image in chat
  - More reliable but slower

- **Recommended**: Start with iframe (Option A), add screenshot fallback if needed

---

## 3. Edit Capability

### Before Registration Creation:
- Already handled by iterative preview/approval flow
- User can request changes before finalizing

### After Registration Creation:
- Add `edit_meeting` tool
- Input schema:
  ```typescript
  {
    meetingId: string,
    field: 'title' | 'description' | 'custom_message' | 'date' | 'time' | 'location',
    newValue: string
  }
  ```
- Update database
- Show new preview
- Confirm changes

---

## 4. Microphone Button for Voice Input

### Implementation:
1. **Frontend Component** (`AIChatInterface.tsx`):
   - Add microphone button next to send button
   - Use Web Speech API (`webkitSpeechRecognition` or `SpeechRecognition`)
   - Show recording indicator when active
   - Convert speech to text
   - Insert into text input

2. **UI Design**:
   ```tsx
   <button
     onClick={handleVoiceInput}
     className="p-2 text-gray-500 hover:text-blue-600 transition"
   >
     {isRecording ? (
       <MicOff className="w-5 h-5 text-red-500 animate-pulse" />
     ) : (
       <Mic className="w-5 h-5" />
     )}
   </button>
   ```

3. **Fallback**:
   - If browser doesn't support Web Speech API, show tooltip:
     "Voice input not supported in your browser"

---

## 5. Beautiful Registration Page Format

### Custom Message Display:
- Store in `custom_message` field (already exists in DB)
- Display in beautiful card on registration page
- Use email template styling (professional, corporate)

Example Format:
```html
<div class="custom-message bg-gradient-to-r from-slate-50 to-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg mb-6">
  <h3 class="text-xl font-semibold text-slate-900 mb-3">
    About This Meeting
  </h3>
  <div class="prose prose-slate text-slate-700">
    {custom_message content}
  </div>
</div>
```

---

## Implementation Order

1. ✅ Create this plan document
2. ⏳ Update `create_meeting_registration` tool to support draft mode
3. ⏳ Add `generate_meeting_description` tool
4. ⏳ Add `preview_meeting_draft` tool (inline iframe)
5. ⏳ Update chatbot system prompt for new flow
6. ⏳ Add microphone button to chat interface
7. ⏳ Implement Web Speech API integration
8. ⏳ Add `edit_meeting` tool
9. ⏳ Update registration page to display custom_message beautifully
10. ⏳ Test entire flow end-to-end

---

## Files to Modify

### Backend:
- `src/app/api/dashboard/ai-chat/route.ts`:
  - Add `generate_meeting_description` tool
  - Add `preview_meeting_draft` tool
  - Add `edit_meeting` tool
  - Update `create_meeting_registration` to accept `custom_message`
  - Update system prompt for new conversational flow

### Frontend:
- `src/components/dashboard/AIChatInterface.tsx`:
  - Add microphone button
  - Add Web Speech API integration
  - Handle voice input state
  - Add inline iframe preview rendering

- `src/components/dashboard/AIModalChat.tsx`:
  - Same changes as AIChatInterface.tsx

- `src/app/[slug]/register/[registrationSlug]/page.tsx`:
  - Display `custom_message` in beautiful format
  - Use professional styling similar to email templates

---

## Testing Checklist

- [ ] User can create meeting with step-by-step questions
- [ ] Description is generated based on meeting details
- [ ] Inline preview shows correctly (not broken link)
- [ ] User can request changes and see updated preview
- [ ] Iteration works smoothly (multiple rounds if needed)
- [ ] Meeting is created only after approval
- [ ] Custom message displays beautifully on registration page
- [ ] Microphone button appears and is functional
- [ ] Voice input converts to text correctly
- [ ] User can edit meeting after creation
- [ ] Preview updates after edits
- [ ] All changes persist in database

---

## Future Enhancements (Optional)

- AI-generated meeting images/banners
- Calendar file (.ics) download
- WhatsApp/SMS share buttons
- RSVP reminder emails
- Post-meeting thank you emails
- Meeting analytics dashboard
