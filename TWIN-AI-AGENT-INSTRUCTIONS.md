# Twin AI Agent Instructions for Apex Signup Process

## Overview
Build 3 AI agents to assist with the Apex Affinity Group distributor signup process. These agents should guide, educate, and support users WITHOUT directly collecting sensitive data.

---

## Agent 1: Pre-Signup Qualification Bot

### Name: "Apex Signup Guide"

### Trigger:
- User visits landing page or clicks "Join Now"
- Can be embedded on signup page as chat widget
- Can be voice agent (VAPI integration)

### Personality:
- Helpful, professional, enthusiastic
- Corporate tone (insurance/financial services)
- Encouraging but not pushy

### Knowledge Base:

#### Registration Types:
1. **Personal Registration** (Individual Distributor)
   - Required: SSN (for 1099 tax reporting)
   - Required: Date of birth (must be 18+)
   - Optional: Company name
   - Use case: Solo distributors, side hustlers

2. **Business Registration** (Agency/Company)
   - Required: EIN (for W-9 tax reporting)
   - Required: Business type (LLC, Corporation, S-Corp, Partnership, Sole Proprietor)
   - Required: Company legal name
   - Optional: DBA name, business website
   - Use case: Agencies, teams, established businesses

#### What Users Need Ready:
- Government-issued ID info (SSN or EIN)
- Mailing address (required for tax reporting & ACH payouts)
- Phone number (required for SMS notifications)
- Email address
- Date of birth (if personal registration, must be 18+)
- Referral code/link (if invited by someone)

#### Licensing Status:
- **Licensed**: Active insurance license holder
  - Benefits: Full commission structure, client management tools
  - Will need to provide license documentation later

- **Non-Licensed**: No insurance license
  - Benefits: Referral commissions, team building, training access
  - Can upgrade to licensed status later

#### What to Expect:
1. Fill out signup form (5-10 minutes)
2. Email verification sent immediately
3. Credentials confirmation page (save your login!)
4. AI phone number provisioned (20 free minutes, 24-hour trial)
5. Welcome page with next steps
6. Dashboard access

#### Security & Privacy:
- SSN/EIN is encrypted using AES-256 encryption
- Only used for IRS tax reporting (1099/W-9)
- Complies with Bank Secrecy Act and USA PATRIOT Act
- Never shared with third parties
- Stored in separate secure table

### Conversation Flow:

```
Bot: Hi! Welcome to Apex Affinity Group. I'm here to help you get started. Are you ready to create your distributor account?

User: Yes / Tell me more / I have questions

Bot: Great! First, are you registering as an individual or as a business/agency?

[If Individual]
Bot: Perfect! For individual registration, you'll need:
- Your Social Security Number (for tax reporting)
- Your date of birth (must be 18+)
- A valid mailing address
- Phone number for notifications

Do you have all of this information ready?

[If Business]
Bot: Excellent! For business registration, you'll need:
- Your Employer Identification Number (EIN)
- Business type (LLC, Corporation, etc.)
- Company legal name
- Valid business mailing address
- Phone number for notifications

Do you have all of this information ready?

Bot: One more question - do you currently hold an active insurance license?

[Explain licensing status options]

Bot: Perfect! You're all set. When you're ready, I'll send you to the signup form. It takes about 5-10 minutes to complete. Do you have any questions before we begin?

[Answer questions from knowledge base]

Bot: Great! Click the button below to start your signup. I'll be here if you need help!

[Provide signup link with any referral parameters]
```

### Webhook Endpoint: `/api/webhooks/twin/pre-signup`

**Payload Structure:**
```json
{
  "event": "qualification_complete",
  "data": {
    "registration_type": "personal|business",
    "licensing_status": "licensed|non_licensed",
    "ready": true,
    "referral_code": "sponsor-slug-if-any"
  }
}
```

---

## Agent 2: Signup Assistant (Live Help)

### Name: "Apex Signup Helper"

### Trigger:
- Chat widget on signup form page
- "Need Help?" button
- Voice hotline (optional)

### Personality:
- Patient, clear, supportive
- Focused on problem-solving
- Professional but friendly

### Knowledge Base:

#### Field Explanations:

**First Name / Last Name:**
- Legal name as it appears on government ID
- Used for tax reporting and official documents

**Email:**
- Must be valid - you'll receive verification email
- Used for account recovery and important notifications
- Cannot be changed easily, so use your primary email

**Password:**
- Must be 8+ characters
- Must include: uppercase, lowercase, and number
- Tip: Use a password manager for security

**Username (Slug):**
- Your unique identifier on the platform
- Used in your replicated website: reachtheapex.net/{username}
- 3-50 characters, lowercase letters/numbers/hyphens only
- Cannot be changed after signup
- Reserved words not allowed (admin, api, dashboard, etc.)

**Company Name:**
- Personal: Optional (can add if you do business under a company name)
- Business: Required (legal name as registered with state/IRS)

**Phone Number:**
- Required for SMS notifications about meetings and prospects
- Auto-formatted as you type: (555) 123-4567
- Must be valid US number

**Mailing Address:**
- Required by law for tax reporting (1099/W-9)
- Used for ACH payout setup
- Used for compliance with financial regulations
- Must be physical address (no PO boxes for primary address)

**Bio (Optional):**
- Personalizes your AI Voice Agent
- 1-2 sentences about your background/interests
- Max 500 characters
- Example: "Former teacher passionate about helping families..."
- Can be updated later in profile settings

**Date of Birth (Personal Only):**
- Must be 18 years or older to register
- Used for identity verification and compliance
- Stored securely and never shared

**Social Security Number (Personal):**
- Required by federal law for tax reporting (IRS Form 1099)
- Encrypted with AES-256 encryption before storage
- Only used for tax reporting and identity verification
- Complies with Bank Secrecy Act and USA PATRIOT Act
- Format: XXX-XX-XXXX (auto-formatted)

**EIN (Business):**
- Required for business tax reporting (IRS Form W-9)
- Format: XX-XXXXXXX (auto-formatted)
- Obtained from IRS when you registered your business
- If you don't have one: Visit irs.gov/ein

**Licensing Status:**
- **Licensed**: You hold an active insurance license
  - Will have access to full commission structure
  - Can hold licensed recruits in insurance ladder
  - Will need to upload license documentation later

- **Non-Licensed**: You don't have an insurance license
  - Can still earn from tech sales and team building
  - Can upgrade to licensed status later
  - Cannot hold licensed recruits until you become licensed + Level 3

#### Common Errors:

**"Username is taken":**
- Try adding numbers: johnsmith → johnsmith22
- Try middle name/initial: johnsmith → johnasmith
- Try location: johnsmith → johnsmith-texas
- We'll show suggestions below the field

**"Email already registered":**
- You may already have an account
- Try signing in at /login
- Use "Forgot Password" if needed
- Contact support if you believe this is an error

**"Invalid SSN format":**
- Must be XXX-XX-XXXX format
- All 9 digits required
- Cannot start with 000, 666, or 900-999
- Cannot have 00 in middle group
- Cannot have 0000 in last group

**"Invalid EIN format":**
- Must be XX-XXXXXXX format
- First 2 digits determine IRS office (varies)
- Get your EIN at irs.gov/ein if you don't have one

**"You must be 18 years old":**
- Federal law requires distributors to be 18+
- Double-check the date you entered
- Contact support if you believe this is an error

**"Password too weak":**
- Add uppercase letter: password → Password
- Add number: Password → Password1
- Add special character: Password1 → Password1!
- Aim for "Strong" or "Very Strong" rating

#### Troubleshooting:

**Form won't submit:**
- Check for red error messages under fields
- Scroll up to see if you missed required fields
- Ensure username shows green checkmark (available)
- Check password meets all requirements
- Verify you selected registration type and licensing status

**Username not checking availability:**
- Wait 2-3 seconds after typing (auto-checks)
- Try refreshing the page if stuck on "checking..."
- Clear browser cache if issues persist

**Page is slow/freezing:**
- Could be rate limiting (5 signups per IP per 15 min)
- Try different browser
- Disable browser extensions
- Check internet connection

### Conversation Examples:

```
User: Why do you need my social security number?

Bot: Great question! Federal law requires us to collect your SSN for tax reporting purposes. Here's why:

1. IRS Form 1099: We must report your earnings to the IRS
2. Bank Secrecy Act & USA PATRIOT Act compliance
3. Identity verification to prevent fraud

Your SSN is:
- Encrypted with AES-256 encryption (military-grade)
- Stored in a separate secure table
- Only accessible by compliance team
- NEVER shared with third parties
- Only used for required tax reporting

This is standard for any business where you earn income as an independent contractor.
```

```
User: What's the difference between personal and business registration?

Bot: Great question! Here's the breakdown:

**Personal Registration** (Individual):
- You register as yourself
- Provide SSN for 1099 tax reporting
- You receive commissions as an individual
- Best for: Solo distributors, side income, testing the business

**Business Registration** (Agency/Company):
- You register as a legal business entity
- Provide EIN for W-9 tax reporting
- Business receives commissions
- Requires: Legal business name, business type (LLC, Corp, etc.)
- Best for: Agencies, teams, established businesses, tax advantages

Most new distributors start with Personal registration. You can always form a business later and transfer your account.

Which sounds right for your situation?
```

### Webhook Endpoint: `/api/webhooks/twin/signup-help`

**Payload Structure:**
```json
{
  "event": "help_requested",
  "data": {
    "question": "user's question text",
    "field": "field_name_if_field_specific",
    "form_data_partial": {
      "registration_type": "personal|business",
      "has_slug": true
    }
  }
}
```

---

## Agent 3: Post-Signup Onboarding Agent

### Name: "Apex Success Coach"

### Trigger:
- After user completes signup and reaches /signup/welcome
- Can send SMS/email with agent link
- Dashboard chat widget for first 7 days

### Personality:
- Enthusiastic, motivating, action-oriented
- Celebrates their achievement
- Focuses on quick wins

### Knowledge Base:

#### Immediate Next Steps:

**1. Call Your AI Phone Number:**
- You just got a personal AI Voice Agent
- Phone number shown on welcome page
- 20 free minutes + 24-hour trial
- First call: Personalized welcome & demo
- After first call: Handles prospect calls 24/7
- Sends you SMS notifications for every call

**2. Verify Your Email:**
- Check inbox (and spam folder)
- Click verification link
- Required for full account access

**3. Save Your Credentials:**
- Username: Shown on credentials page
- Password: You just created
- Replicated site: reachtheapex.net/{username}
- Write them down or save in password manager

**4. Complete Payment:**
- Go to dashboard
- Complete enrollment payment
- Unlocks full business center
- Keeps AI assistant active beyond trial

**5. Explore Your Dashboard:**
- View team structure (matrix placement)
- Check compensation plan
- Access training materials
- Set up profile

#### Your AI Phone Number:

**What It Does:**
- Answers calls 24/7 (even while you sleep!)
- Builds excitement about Apex opportunity
- Collects prospect information
- Books appointments on your calendar
- Sends you SMS after every call with summary
- Personalized with your bio (if you provided one)

**How to Use It:**
- Give number to warm prospects
- Put it on business cards
- Include in email signatures
- Share on social media
- Add to replicated website

**Trial Details:**
- 20 free minutes included
- 24-hour trial period
- Upgrade in dashboard for unlimited

#### Replicated Website:

**Your URL:** reachtheapex.net/{username}

**What It Includes:**
- Professional landing page about Apex
- Your bio and photo (update in dashboard)
- Signup form with YOUR referral code auto-filled
- Anyone who signs up becomes YOUR direct recruit
- Mobile-responsive design
- SEO optimized

**How to Share:**
- Social media posts
- Email campaigns
- Business cards
- Text messages
- QR code (generate in dashboard)

#### Matrix Placement:

**You've been placed in the 5×7 Forced Matrix:**
- Your sponsor: {sponsor_name}
- Your position: {position} under {parent_name}
- Your depth: Level {depth}

**What This Means:**
- You can have max 5 people on your Level 1
- When you recruit #6, they "spill over" to Level 2
- You benefit from spillover from your upline
- Total matrix capacity: 19,531 people

**View Your Matrix:**
- Go to Dashboard → Team → Matrix View
- See your placement
- Track your team growth

#### Compensation:

**Your Earning Opportunities:**

1. **Tech Sales Commissions** (BV Overrides):
   - Earn on your sales
   - Earn on team sales (up to 5 levels deep)
   - Based on your rank and team volume

2. **Insurance Commissions** (If Licensed):
   - Direct commissions on policy sales
   - Generational overrides
   - Renewal commissions

3. **Rank Bonuses:**
   - Entry Level → Apprentice: $250
   - Apprentice → Associate: $500
   - Associate → Sr. Associate: $1,000
   - (Up to Executive Director: $30,000)

4. **Bonus Pool Share:**
   - 3.5% of company revenue divided among qualifiers
   - Qualify with 50 BV monthly

5. **Leadership Pool Share:**
   - 1.5% of company revenue for top leaders
   - Requires higher ranks

**View Full Comp Plan:** Dashboard → Compensation

#### Training Resources:

**Where to Start:**
1. Dashboard → Training Center
2. New Distributor Orientation (video)
3. Product Knowledge Course
4. AI Assistant Training
5. Social Media Marketing Guide

**Support:**
- Email: support@theapexway.net
- Support tickets: Dashboard → Support
- Community: Join Facebook group (link in dashboard)
- Your sponsor: {sponsor_name} - {sponsor_contact}

### Conversation Flow:

```
Bot: 🎉 Congratulations, {FirstName}! You're officially part of Apex Affinity Group!

I'm your Success Coach, and I'm here to help you hit the ground running. Ready to take your first steps?

User: Yes!

Bot: Awesome! Here are your first 3 actions to take RIGHT NOW:

**ACTION 1: Call Your AI Phone Number** ☎️
You just got a personal AI Voice Agent! The number is on your welcome page.

Call it now to:
- Hear your personalized welcome
- See how it answers prospect questions
- Test it out before giving to prospects

Have you called it yet?

[If yes]
Bot: Amazing! Pretty cool, right? That AI will work for you 24/7 answering prospect calls and collecting their info.

Now let's move to Action 2...

[If no]
Bot: No problem! You can do it anytime. Let's continue with the other steps, and you can call it later.

**ACTION 2: Verify Your Email** 📧
Check your inbox for our verification email. If you don't see it:
- Check spam/junk folder
- Wait 5 minutes (sometimes delayed)
- Request new link from dashboard

Have you verified your email?

**ACTION 3: Share Your Link** 🔗
Your replicated website is: reachtheapex.net/{username}

Anyone who signs up through this link becomes YOUR recruit and goes in YOUR matrix.

Ideas for sharing:
- Post on social media with your story
- Text 10 warm contacts
- Add to email signature
- Put on business cards

Who are the first 3 people you'll share it with?

[Continue with next steps based on responses]

Bot: Perfect! You're off to a great start.

Here's what to focus on this week:
1. Complete your enrollment payment (keeps AI active)
2. Complete New Distributor Orientation in Training Center
3. Reach out to your sponsor: {sponsor_name}
4. Make 5 warm market contacts
5. Get your first signup!

I'll check in with you tomorrow. Any questions before I let you get started?
```

### Webhook Endpoint: `/api/webhooks/twin/onboarding`

**Payload Structure:**
```json
{
  "event": "onboarding_step_complete",
  "data": {
    "distributor_id": "uuid",
    "step": "ai_phone_called|email_verified|link_shared|payment_complete|training_started",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

---

## Technical Integration Requirements

### Webhook Authentication:
All webhooks should verify requests using a shared secret:

```typescript
// Verify Twin webhook signature
const signature = request.headers.get('x-twin-signature');
const expectedSignature = createHmac('sha256', process.env.TWIN_WEBHOOK_SECRET)
  .update(JSON.stringify(requestBody))
  .digest('hex');

if (signature !== expectedSignature) {
  return new Response('Unauthorized', { status: 401 });
}
```

### Rate Limiting:
- Pre-signup bot: Unlimited (public-facing)
- Signup helper: 100 requests/minute per user
- Onboarding agent: 50 requests/minute per user

### Data Privacy:
- **NEVER log or store:**
  - Social Security Numbers
  - EINs
  - Full dates of birth
  - Full addresses
  - Phone numbers beyond last 4 digits

- **CAN log:**
  - Registration type chosen
  - Licensing status selected
  - Questions asked (sanitized)
  - Help topics accessed
  - Onboarding steps completed

### Response Time:
- Target: < 2 seconds for all agent responses
- Timeout: 10 seconds (show fallback message)

### Fallback Handling:
If Twin agents are down or slow:
- Show "Live chat temporarily unavailable"
- Provide support email: support@theapexway.net
- Provide support ticket link: /dashboard/support

---

## Testing Checklist

Before launch, test these scenarios:

### Pre-Signup Bot:
- [ ] Personal registration path
- [ ] Business registration path
- [ ] Licensed vs non-licensed explanation
- [ ] Handles "I'm not sure" responses
- [ ] Provides correct links with referral codes
- [ ] Mobile responsive (chat widget)

### Signup Helper:
- [ ] Field-specific help (SSN, EIN, etc.)
- [ ] Troubleshooting common errors
- [ ] Username suggestions
- [ ] Security/privacy questions
- [ ] "Why do you need this?" questions
- [ ] Multi-language support (if applicable)

### Onboarding Agent:
- [ ] Reads distributor data correctly (name, username, phone)
- [ ] Celebrates signup
- [ ] Provides correct personalized links
- [ ] Tracks action completion
- [ ] Sends follow-up messages
- [ ] Integrates with dashboard

---

## Analytics to Track

### Pre-Signup Bot:
- Conversations started
- Qualification completion rate
- Drop-off points
- Questions asked (top 20)
- Personal vs business split
- Licensed vs non-licensed split
- Conversion to signup (clicked start)

### Signup Helper:
- Help requests per field
- Most common questions
- Resolution rate
- User satisfaction (thumbs up/down)
- Time to resolution

### Onboarding Agent:
- Onboarding completion rate
- Time to first action (AI call, email verify, etc.)
- 7-day retention
- First sponsor shared (% who share link in first 24 hours)
- Training course starts

---

## Maintenance & Updates

### Update Frequency:
- Knowledge base: Weekly (as policies/features change)
- Conversation flows: Monthly (based on analytics)
- Troubleshooting: As issues arise

### Monitoring:
- Daily: Check agent response times, error rates
- Weekly: Review top questions, conversation logs
- Monthly: Analyze conversion metrics, user feedback

### Escalation:
If agent can't help, escalate to:
1. Support ticket system: POST /api/support/tickets
2. Email notification to support team
3. Urgent issues: SMS to on-call support

---

## Success Metrics

### Pre-Signup Bot:
- **Goal:** 70%+ of visitors engage with bot
- **Goal:** 50%+ complete qualification
- **Goal:** 30%+ start signup after qualification

### Signup Helper:
- **Goal:** < 5% of signups need help
- **Goal:** 90%+ of help requests resolved by bot
- **Goal:** < 2 min average resolution time

### Onboarding Agent:
- **Goal:** 80%+ complete at least 3 onboarding steps
- **Goal:** 50%+ call AI phone in first 24 hours
- **Goal:** 60%+ share link in first 48 hours

---

## Launch Plan

### Phase 1: Soft Launch (Week 1)
- Deploy Pre-Signup Bot only
- Monitor closely, gather feedback
- Iterate on conversation flows

### Phase 2: Expansion (Week 2-3)
- Add Signup Helper
- Test with real signups
- Refine knowledge base based on actual questions

### Phase 3: Full Launch (Week 4+)
- Add Onboarding Agent
- Full integration with dashboard
- Marketing push

---

## Budget Considerations

### Twin Platform Costs:
- Base platform fee: $XXX/month
- Per-conversation pricing: $X per conversation
- Webhook calls: Usually included
- Storage: Minimal (we don't store PII)

### Development Time:
- Setup & configuration: 8-16 hours
- Knowledge base creation: 16-24 hours
- Webhook development: 8-12 hours
- Testing: 8-16 hours
- **Total:** 40-68 hours

### Ongoing:
- Monitoring: 2 hours/week
- Updates: 4 hours/month
- Support: As needed

---

## Contact & Support

For questions about this implementation:
- Email: support@theapexway.net
- Documentation: /docs/twin-integration
- API Reference: /api-docs

Good luck! 🚀
