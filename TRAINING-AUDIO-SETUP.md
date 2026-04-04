# Daily Training Audio Setup

## Current Status

✅ Training page created at `/training/[day]`
✅ Training content for Days 1-3 written
✅ Email templates created
✅ Sample email scripts ready
❌ Audio files not yet generated (requires active OpenAI billing)

## How to Generate Audio Files

### Option 1: OpenAI TTS (Recommended - Best Quality)

**Requirements:**
- Active OpenAI account with billing enabled
- OpenAI API key in `.env.local`

**Steps:**
1. Add credits to your OpenAI account at https://platform.openai.com/account/billing
2. Run the generation script:
   ```bash
   npx tsx scripts/generate-training-audio.ts
   ```

**Cost:** ~$0.015 per 1,000 characters (~$0.05 per training script = $1.50 total for 30 days)

**Voice:** Onyx (deep, professional male voice)

### Option 2: ElevenLabs (Free Tier)

**Requirements:**
- ElevenLabs account (free tier: 10,000 characters/month)
- API key in `.env.local` as `ELEVENLABS_API_KEY`

**Steps:**
1. Sign up at https://elevenlabs.io
2. Get your API key from Settings
3. Add to `.env.local`:
   ```
   ELEVENLABS_API_KEY=your_key_here
   ```
4. Update `scripts/generate-training-audio.ts` to use ElevenLabs client
5. Run the script

**Free Tier:** 10,000 characters/month (enough for ~3-4 training scripts)

### Option 3: Google Cloud TTS

**Requirements:**
- Google Cloud account with billing enabled
- Service account JSON key

**Steps:**
1. Enable Text-to-Speech API in Google Cloud Console
2. Create service account and download JSON key
3. Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable
4. Update script to use Google Cloud TTS
5. Run the script

**Cost:** $4 per 1 million characters (~$0.01 per script)

### Option 4: Manual Upload

If you have audio files from another source:

1. Place MP3 files in `/public/audio/` directory
2. Name them: `training-day-1.mp3`, `training-day-2.mp3`, etc.
3. Files should be ~2 minutes each

## Training Page Features

The training pages include:

- 🎧 **Audio Player** - HTML5 audio with controls
- 📝 **Full Transcript** - Complete script below audio
- 💡 **Key Takeaways** - Bullet-point summary
- 🎯 **Action Item** - Daily task to complete
- 📊 **Progress Tracking** - Visual progress bar
- ⬅️➡️ **Navigation** - Previous/Next day buttons
- 🎨 **Apex Branding** - Logo and professional design

## Testing the System

### 1. Test Training Page

Visit: https://reachtheapex.net/training/1

Should show:
- Apex logo header
- Audio player (if audio file exists)
- Full transcript
- Action item
- Navigation

### 2. Send Sample Email

**With Audio Link (Current Approach):**
```bash
node send-daily-training-with-link.js
```

**With Training Page Link:**
```bash
node send-training-page-sample.js
```

### 3. Test Email Rendering

Check in multiple clients:
- ✅ Gmail (web)
- ✅ Outlook (web)
- ✅ Apple Mail
- ✅ Mobile Gmail
- ✅ Mobile Apple Mail

## Next Steps

### Phase 1: Complete Audio Generation (URGENT)

1. **Activate OpenAI Billing:**
   - Go to https://platform.openai.com/account/billing
   - Add $5 minimum credit
   - This will cover all 30 audio files

2. **Generate Audio for Days 1-3:**
   ```bash
   npx tsx scripts/generate-training-audio.ts
   ```

3. **Test Audio Playback:**
   - Visit https://reachtheapex.net/training/1
   - Click play button
   - Verify audio plays correctly

4. **Deploy Audio Files:**
   ```bash
   git add public/audio/
   git commit -m "add: training audio files for Days 1-3"
   git push
   ```

### Phase 2: Complete Training Content (27 more scripts)

Need to write training scripts for Days 4-30. Topics to cover:

**Week 1 (Days 4-7): Prospecting**
- Day 4: Overcoming "I'm too busy" objection
- Day 5: Social media prospecting that works
- Day 6: The follow-up system
- Day 7: Tracking your numbers

**Week 2 (Days 8-14): Objection Handling**
- Day 8: "I don't have money" objection
- Day 9: "I need to think about it"
- Day 10: "Is this a pyramid scheme?"
- Day 11: "I'm not a salesperson"
- Day 12: "I don't have time"
- Day 13: "I need to ask my spouse"
- Day 14: Week 2 review

**Week 3 (Days 15-21): Team Building**
- Day 15: How to onboard new reps
- Day 16: The first 48 hours
- Day 17: Training your team to duplicate
- Day 18: Recognition systems
- Day 19: Team calls and accountability
- Day 20: Coaching vs managing
- Day 21: Week 3 review

**Week 4 (Days 22-28): Leadership & Mindset**
- Day 22: The mindset of top earners
- Day 23: Dealing with rejection
- Day 24: Setting income goals
- Day 25: Time blocking for success
- Day 26: Building belief in yourself
- Day 27: Building belief in the product
- Day 28: Week 4 review

**Week 5 (Days 29-30): Launch**
- Day 29: Your 90-day action plan
- Day 30: Becoming unstoppable

### Phase 3: Automated Daily Emails

1. **Create Email Schedule Table:**
   ```sql
   CREATE TABLE daily_training_emails (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     distributor_id UUID NOT NULL REFERENCES distributors(id),
     training_day INTEGER NOT NULL,
     scheduled_for TIMESTAMPTZ NOT NULL,
     sent_at TIMESTAMPTZ,
     status TEXT DEFAULT 'scheduled',
     UNIQUE(distributor_id, training_day)
   );
   ```

2. **Create Cron Job:**
   - API route: `/api/cron/send-daily-training`
   - Runs: Daily at 7:00 AM
   - Sends: Individual emails (not mass BCC)

3. **Schedule on Signup:**
   - When new distributor signs up
   - Schedule 30 emails (one per day)
   - Starting day after signup

## File Structure

```
├── public/audio/
│   ├── training-day-1.mp3  # ❌ Not yet generated
│   ├── training-day-2.mp3  # ❌ Not yet generated
│   └── training-day-3.mp3  # ❌ Not yet generated
├── scripts/
│   └── generate-training-audio.ts  # ✅ Ready to use
├── src/
│   ├── app/training/[day]/
│   │   └── page.tsx  # ✅ Training page
│   └── lib/training/
│       └── daily-training-content.ts  # ✅ Days 1-3 only
├── send-daily-training-with-link.js  # ✅ Sample email with audio link
├── send-training-page-sample.js  # ✅ Sample email with page link
└── TRAINING-AUDIO-SETUP.md  # ✅ This file
```

## Troubleshooting

### Audio Player Shows but No Sound

**Cause:** Audio file doesn't exist at `/public/audio/training-day-X.mp3`

**Fix:** Generate audio files using one of the options above

### 404 Error on Training Page

**Cause:** Next.js not awaiting params (fixed in latest code)

**Fix:** Already fixed - redeploy if seeing this error

### Email Audio Link Doesn't Work

**Cause:** Some email clients block audio elements

**Fix:** Use the "training page" approach (link to website) instead of embedded audio

## Cost Breakdown

**OpenAI TTS (Recommended):**
- 30 scripts × ~300 words = 9,000 words
- 9,000 words × 5 chars/word = 45,000 characters
- $0.015 per 1,000 chars = $0.68 total

**ElevenLabs Free Tier:**
- 10,000 characters/month free
- Enough for 3-4 training scripts
- Need to spread generation over 6+ months for all 30

**Google Cloud TTS:**
- Similar pricing to OpenAI (~$0.50-1.00 total)

## Recommended Workflow

1. **Today:** Add $5 to OpenAI billing
2. **Today:** Generate audio for Days 1-3
3. **Today:** Test and deploy
4. **Today:** Send sample email to yourself
5. **This Week:** Write scripts for Days 4-10
6. **This Week:** Generate audio for Days 4-10
7. **Next Week:** Complete Days 11-20
8. **Following Week:** Complete Days 21-30
9. **Then:** Set up automated daily email system

## Questions?

Contact: tdaniel@botmakers.ai
