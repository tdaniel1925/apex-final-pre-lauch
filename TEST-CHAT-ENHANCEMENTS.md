# Testing AI Chat Enhancements

## Quick Test Guide

### Test 1: iframe Preview Display

**Test Scenario:**
Have the AI chatbot respond with an iframe preview link.

**Steps:**
1. Open the AI chat interface (dashboard or modal)
2. Send a message: "Create a test meeting registration page"
3. Wait for AI to respond with a link using `[preview:URL]` syntax
4. Verify the preview appears as an inline iframe (not a broken link)

**Expected Result:**
```markdown
Here's your meeting page:

[preview:https://reachtheapex.net/john/register/test-meeting]

The preview should appear as an embedded page above this text.
```

**Alternative Manual Test:**
You can test the rendering by having the AI respond with:
```
Test iframe preview:

[iframe:https://example.com]

Did the iframe display correctly?
```

---

### Test 2: Microphone Button UI

**Steps:**
1. Open the AI chat interface
2. Look at the input area at the bottom
3. Verify there's a microphone button between the text input and send button

**Expected Result:**
- Button visible with Mic icon (from lucide-react)
- Button is gray by default
- Button shows hover state (blue) when mouse over
- If browser doesn't support Web Speech API, button should be disabled with low opacity

**Visual Checklist:**
- [ ] Microphone button is visible
- [ ] Button is positioned between input and send button
- [ ] Icon is gray when not recording
- [ ] Hover changes color to blue (#2c5aa0)
- [ ] Disabled state shows 30% opacity

---

### Test 3: Voice Input Functionality

**Steps:**
1. Click the microphone button
2. Verify icon changes to MicOff (red, pulsing)
3. Speak a message (e.g., "Hello, this is a test message")
4. Wait for speech to stop
5. Verify transcript appears in input field
6. Send the message

**Expected Results:**
- Icon changes from Mic to MicOff when recording starts
- Icon is red and pulsing during recording
- Transcript appears in input field after speaking
- If input already has text, new transcript is appended with a space
- Recording stops automatically when you finish speaking
- Can also stop manually by clicking button again

**Browser Compatibility:**
- ✅ Chrome/Edge (Chromium): Should work perfectly
- ✅ Safari 14.1+: Should work
- ❌ Firefox: May not work, button should be disabled

**Error Scenarios:**
- If microphone permission denied → Recording stops, error logged to console
- If browser doesn't support API → Button disabled, tooltip shows "not supported"

---

## Test Scenarios for AI Responses

### Scenario 1: Registration Page Preview
**User:** "Create a meeting registration page for tomorrow's opportunity call"

**Expected AI Response Format:**
```markdown
I've created your meeting registration page! Here's the preview:

[preview:https://reachtheapex.net/[username]/register/opportunity-call]

You can now share this link with your team to get registrations.
```

**Verify:**
- iframe displays the actual registration page
- iframe is responsive (works on mobile)
- iframe has rounded corners and border

---

### Scenario 2: Multiple Previews
**User:** "Show me both my business card page and my meeting page"

**Expected AI Response Format:**
```markdown
Here are your pages:

**Business Card:**
[preview:https://reachtheapex.net/[username]]

**Opportunity Meeting:**
[preview:https://reachtheapex.net/[username]/register/opportunity]

You can share either link depending on your goal.
```

**Verify:**
- Both iframes render correctly
- Each has proper spacing (my-3 margin)
- Both are independently scrollable

---

### Scenario 3: Mixed Media
**User:** "Show me the training video and my registration page"

**Expected AI Response Format:**
```markdown
Here's the training video:

[video:https://youtube.com/watch?v=EXAMPLE]

And here's your registration page:

[preview:https://reachtheapex.net/[username]/register/training]

Review the video first, then start sharing your page!
```

**Verify:**
- Video renders with 56.25% aspect ratio
- Preview renders with 75% aspect ratio
- Both display correctly in same message

---

## Voice Input Test Scenarios

### Scenario 1: Empty Input
**Steps:**
1. Clear input field
2. Click microphone
3. Say: "What is my commission balance"
4. Wait for transcript

**Expected:**
- Transcript appears: "What is my commission balance"
- No extra spaces at start or end

---

### Scenario 2: Append to Existing Text
**Steps:**
1. Type: "Show me"
2. Click microphone
3. Say: "my top performers"
4. Wait for transcript

**Expected:**
- Final text: "Show me my top performers"
- Single space between existing text and transcript

---

### Scenario 3: Multiple Voice Inputs
**Steps:**
1. Click microphone, say: "Create a meeting"
2. Wait for transcript
3. Click microphone again, say: "for tomorrow"
4. Wait for transcript

**Expected:**
- Final text: "Create a meeting for tomorrow"
- Properly spaced

---

### Scenario 4: Permission Denied
**Steps:**
1. Click microphone
2. Deny microphone permission in browser
3. Observe behavior

**Expected:**
- Recording stops
- Error logged to console
- No crash or freeze
- Can try again after granting permission

---

## Mobile Testing

### Responsive Design
**Test on mobile devices:**
- [ ] iframe preview displays correctly (75% padding-bottom)
- [ ] Microphone button is touch-friendly (48px minimum)
- [ ] Recording state visible on small screens
- [ ] Voice input works on mobile Chrome/Safari

### Touch Interactions
- [ ] Single tap on microphone starts recording
- [ ] Tap again stops recording
- [ ] Visual feedback clear on mobile

---

## Edge Cases

### Edge Case 1: Very Long Voice Input
**Steps:**
1. Click microphone
2. Speak continuously for 30+ seconds

**Expected:**
- Recording continues until you pause
- Full transcript captured
- No truncation

### Edge Case 2: Multiple iframes Performance
**Steps:**
1. Have AI respond with 5+ preview links
2. Scroll through message
3. Observe performance

**Expected:**
- Smooth scrolling
- All iframes lazy-load
- No significant lag

### Edge Case 3: Invalid iframe URL
**Steps:**
1. Test with invalid URL: `[preview:not-a-url]`

**Expected:**
- iframe renders but shows error inside
- Chat doesn't crash
- Other content still displays

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab to microphone button
- [ ] Enter/Space activates recording
- [ ] Tab to send button works
- [ ] Focus visible on all buttons

### Screen Reader
- [ ] Microphone button has proper ARIA label
- [ ] Recording state announced
- [ ] iframe has descriptive title
- [ ] All interactive elements accessible

### Color Contrast
- [ ] Gray microphone icon readable (passes WCAG AA)
- [ ] Red recording state high contrast
- [ ] Blue hover state sufficient contrast

---

## Performance Benchmarks

### Load Time
- [ ] No noticeable delay adding microphone button
- [ ] Web Speech API check is instant
- [ ] iframe preview loads within 2 seconds

### Memory Usage
- [ ] Single recognition instance (not multiple)
- [ ] No memory leaks during extended use
- [ ] iframes cleaned up when messages removed

---

## Security Testing

### Voice Input
- [ ] Microphone permission required before recording
- [ ] No audio stored locally
- [ ] No network transmission of audio
- [ ] Transcript treated as user input (not executed)

### iframe Preview
- [ ] iframe sandboxing applied
- [ ] Cross-origin restrictions respected
- [ ] No JavaScript injection possible via URL

---

## Regression Testing

### Existing Features
Verify these still work after changes:
- [ ] Video embeds `[video:URL]`
- [ ] Audio embeds `[audio:URL]`
- [ ] Markdown rendering (bold, italic, lists)
- [ ] Code blocks with syntax highlighting
- [ ] Mermaid diagrams
- [ ] Links and tables
- [ ] Send button functionality
- [ ] Typing indicator
- [ ] Message timestamps
- [ ] Auto-scroll to bottom

---

## Developer Testing

### TypeScript Compilation
```bash
npm run build
```
**Expected:** No TypeScript errors ✅

### Code Quality
```bash
npm run lint
```
**Expected:** No linting errors

### Browser Console
**Expected:** No errors or warnings when using features

---

## Sign-off Checklist

- [ ] All three features implemented in AIChatInterface.tsx
- [ ] Features automatically work in AIModalChat.tsx (wrapper)
- [ ] TypeScript compilation successful
- [ ] No linting errors
- [ ] Browser compatibility verified
- [ ] Mobile responsive design confirmed
- [ ] Accessibility standards met
- [ ] No regression in existing features
- [ ] Documentation complete (this file + summary)
- [ ] Ready for production deployment

---

## Notes for QA Team

1. **Best browser for testing:** Chrome (full support for all features)
2. **Microphone permission:** Must be granted for voice input tests
3. **iframe previews:** Require network connection to load external URLs
4. **Mobile testing:** Test on both iOS Safari and Chrome Mobile
5. **Voice input:** May not work in all browsers, this is expected behavior

---

## Known Limitations

1. **Firefox Web Speech API:** Limited support, may require about:config flags
2. **Safari < 14.1:** No Web Speech API support
3. **iframe previews:** Depend on target site's X-Frame-Options policy
4. **Voice input language:** Currently English only (en-US)
5. **Continuous recording:** Not supported (by design for chat interface)

---

## Success Metrics

### Definition of Done
- ✅ iframe preview displays instead of broken link
- ✅ Microphone button visible and functional
- ✅ Voice input transcribes speech to text
- ✅ Works in both standalone and modal chat
- ✅ TypeScript compiles without errors
- ✅ No regression in existing features
- ✅ Graceful degradation in unsupported browsers

### User Experience Goals
- Users can see registration page previews inline
- Users can input text via voice without typing
- Interface remains fast and responsive
- Features work seamlessly across devices
