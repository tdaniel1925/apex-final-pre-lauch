# AI Employee Discovery Interview Script

## Interview Flow (Voice & Chat)

**Duration:** 5-7 minutes
**Objective:** Understand business needs, identify pain points, determine AI employee scope

---

## Opening (Voice Call)

```
Hi [Name], this is the Apex AI assistant calling! Thanks for scheduling time to talk about getting a custom AI employee for [Business Name].

This call should only take about 5-7 minutes. I'm going to ask you some questions to understand your business so we can build the perfect AI employee for you.

Sound good? Great, let's dive in!
```

## Opening (Chat)

```
Hi [Name]! I'm excited to learn about [Business Name]. Let's dive in — this should only take about 5 minutes.

First question: Tell me about your business. What products or services do you offer?
```

---

## Question 1: Business Overview

**Ask:**
> "Tell me about your business. What products or services do you offer, and who are your main customers?"

**What to capture:**
- Industry/vertical
- Products/services
- Target customer profile
- Business stage (startup, growth, established)

**Follow-up if needed:**
> "And how long have you been in business?"

---

## Question 2: Current Pain Points

**Ask:**
> "What are the biggest time-consuming tasks in your business right now? What keeps you busy that you wish you could hand off to someone else?"

**What to capture:**
- Specific repetitive tasks
- Bottlenecks
- Time drains
- Manual processes

**Follow-up probes:**
- "Are you spending a lot of time on marketing tasks?"
- "How about sales outreach and follow-ups?"
- "What about administrative work like scheduling and emails?"

---

## Question 3: Marketing Activities

**Ask:**
> "Let's talk about marketing. Are you currently doing any of these: blog posts, social media, email campaigns, SEO, or paid advertising?"

**What to capture:**
- Current marketing activities
- What's working
- What's neglected
- Frequency (daily, weekly, monthly)

**Follow-up:**
> "Which of these marketing activities would you love to do MORE of if you had the time?"

---

## Question 4: Sales Process

**Ask:**
> "Walk me through how you typically get new customers. Do you do outbound prospecting, or do customers mostly find you?"

**What to capture:**
- Lead generation method
- Sales process
- Follow-up system
- Conversion bottlenecks

**Follow-up:**
> "How much time do you spend on sales activities each week?"

---

## Question 5: Team & Tools

**Ask:**
> "Do you have a team, or are you mostly running this solo? And what tools or software do you use regularly?"

**What to capture:**
- Team size
- Current responsibilities
- Software stack (CRM, email, social media, etc.)
- Integration needs

**Examples to prompt:**
- "Do you use a CRM like HubSpot or Salesforce?"
- "What about email marketing — MailChimp, Constant Contact?"
- "Social media scheduling tools?"

---

## Question 6: Desired Outcomes

**Ask:**
> "If you had an AI employee starting tomorrow, what would be the ONE thing you'd want them to handle that would make the biggest impact on your business?"

**What to capture:**
- Top priority task
- Expected results
- Success metrics

**Follow-up:**
> "And what does success look like? For example, more leads per month, more social media engagement, faster follow-ups?"

---

## Question 7: Content & Voice

**Ask:**
> "Does your business have existing content like a website, blog posts, or marketing materials? Or would the AI employee need to create everything from scratch based on our conversations?"

**What to capture:**
- Existing content assets
- Brand voice/tone
- Style preferences
- Examples they like

---

## Question 8: Timeline & Budget

**Ask:**
> "When would you ideally like to have your AI employee up and running? And just to confirm, you indicated your budget is [budget range from form] per month — is that still accurate?"

**What to capture:**
- Start date preference
- Budget confirmation
- Flexibility on scope

**Follow-up if budget concern:**
> "We can work with that! Depending on the role complexity and workload, we typically range from $500 to $1,000 per month. Does that work for you?"

---

## Question 9: Decision Process

**Ask:**
> "Are you the sole decision maker for this, or will anyone else need to review the proposal before moving forward?"

**What to capture:**
- Decision maker
- Other stakeholders
- Approval process

---

## Question 10: Communication Preferences

**Ask:**
> "Last question: Once your AI employee is built, how would you prefer to interact with it? Via email, a dashboard, Slack, or something else?"

**What to capture:**
- Preferred communication channel
- Notification preferences
- Delivery format (email reports, dashboard, Slack updates, etc.)

---

## Closing

**Voice:**
```
Perfect! I've got everything I need. Here's what happens next:

Within the next 24 hours, you'll receive a custom proposal via email showing:
- Exactly what your AI employee will do
- Expected deliverables and timeline
- Your custom pricing

After that, you'll get an SMS with a link to approve the proposal. Once you approve, our team will start building your AI employee right away — typically takes 3-5 business days.

Any questions before we wrap up? ... Great! Thanks so much [Name], talk soon!
```

**Chat:**
```
Perfect! I've got everything I need, [Name].

Here's what happens next:
1. Within 24 hours: You'll receive a custom proposal via email
2. Via SMS: You'll get a link to review and approve your quote
3. Once approved: Our team builds your AI employee (3-5 business days)

Thanks for your time! Keep an eye on your email and text messages. 🎉
```

---

## Data Points to Extract for Proposal Generation

After the interview, the AI system should analyze the conversation and extract:

1. **Business Profile**
   - Industry/vertical
   - Business stage
   - Team size
   - Current revenue (if mentioned)

2. **Pain Points (Ranked)**
   - Top 3 time-consuming tasks
   - Bottlenecks
   - Neglected activities

3. **Recommended AI Employee Role**
   - Marketing Manager
   - Social Media Manager
   - Content Writer
   - Sales Development Rep
   - Executive Assistant
   - Customer Success Manager
   - Data Analyst

4. **Scope of Work**
   - Specific tasks (list)
   - Frequency (daily, weekly, monthly)
   - Expected deliverables

5. **Tools & Integrations**
   - CRM
   - Email marketing platform
   - Social media tools
   - Other software

6. **Success Metrics**
   - KPIs to track
   - Expected outcomes

7. **Pricing**
   - Base on complexity
   - $500-$750 (basic role, limited tasks)
   - $750-$1,000 (advanced role, multiple systems)

8. **Timeline**
   - Preferred start date
   - Build time estimate (3-5 days typical)

---

## VAPI Voice Agent Configuration

**Voice Settings:**
- Voice: Professional, friendly (Alloy or Nova)
- Speed: 1.0x (natural pace)
- Personality: Consultative, expert, warm

**System Prompt:**
```
You are a discovery specialist for Apex Affinity Group's AI Employee service. Your goal is to understand the prospect's business needs through a conversational interview.

Guidelines:
- Be warm and consultative, not salesy
- Ask follow-up questions when answers are vague
- Take notes on specific pain points and tasks mentioned
- If they mention a task, ask "how much time does that take each week?"
- Confirm understanding by summarizing their needs
- Keep the call to 5-7 minutes
- End with clear next steps

Do NOT:
- Talk too much — let them share
- Use jargon or technical terms
- Rush through questions
- Miss opportunities to probe deeper
```

**Functions Available:**
- `save_interview_data()` - Saves responses to database
- `schedule_followup()` - If they need to reschedule
- `send_immediate_proposal()` - For urgent cases

---

## Chat Bot Configuration

**Personality:**
- Emoji usage: Minimal (1-2 per message)
- Tone: Professional but friendly
- Message length: Short (2-3 sentences max)

**System Prompt:**
```
You are conducting a text-based discovery interview for Apex's AI Employee service. Ask one question at a time, wait for the response, then ask the next question.

Keep messages short and conversational. Use the interview script as a guide but adapt naturally to their responses. If they give a short answer, ask a follow-up to get more detail.

After collecting all information, summarize what you learned and explain next steps.
```

**Auto-save:** After each user response, save to database with interview_id

---

## Success Criteria

**Interview is successful if we capture:**
- ✅ Clear understanding of business
- ✅ Top 3 pain points identified
- ✅ Specific tasks they want automated
- ✅ Budget confirmation
- ✅ Timeline expectations
- ✅ Decision maker identified

**Red flags to watch for:**
- Budget concerns (below $500/month)
- Unclear pain points ("I don't know, just want to try AI")
- No specific tasks mentioned
- "Just browsing" or not ready to commit

---

## After Interview: Proposal Generation

The system should automatically:

1. **Analyze transcript** using Claude/GPT-4
2. **Identify:**
   - Recommended AI employee role
   - Scope of work
   - Integration needs
   - Success metrics
3. **Generate proposal** including:
   - Executive summary
   - What the AI employee will do (specific tasks)
   - Expected deliverables (weekly/monthly)
   - Tools/integrations required
   - Success metrics
   - Timeline (build time + deployment)
   - Pricing (monthly subscription)
4. **Create quote:**
   - Monthly price: $X
   - Setup fee (if applicable): $Y
   - Total first month: $X + $Y
5. **Send via email** (with PDF attachment)
6. **Send SMS** with approval link

---

## Sample Questions for Different Roles

### Marketing Manager
- "Do you have a content calendar or marketing plan?"
- "How often do you publish blog posts or social content?"
- "Are you tracking SEO rankings or website traffic?"

### Sales Rep
- "How many leads do you typically work per month?"
- "What's your follow-up process look like?"
- "Do you have a sales script or email templates?"

### Executive Assistant
- "How much time do you spend on email each day?"
- "Do you manage your own calendar or have help?"
- "What reports or data do you need regularly?"

---

## Edge Cases

**If they say "I don't know":**
> "No worries! Let me ask it differently: If you had an extra 10 hours a week, what would you work on in your business?"

**If budget is too low (<$500):**
> "I understand budget is important. What if we started with a smaller scope and scaled up as you see results? We could focus on just [one high-value task] to start."

**If they're not ready:**
> "Totally understandable! Can I send you some information about what our AI employees can do? No pressure — just want to make sure you have it when you're ready."

**If they ask about technical details:**
> "Great question! Our technical team will handle all of that during the build phase. Right now, I just want to understand what you need so we can design the perfect solution."

---

## Interview Transcript Storage

After interview, store in database:

```sql
CREATE TABLE ai_employee_interviews (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  interview_type TEXT, -- 'voice' or 'chat'
  transcript JSONB, -- Full Q&A transcript
  analysis JSONB, -- AI analysis of needs
  recommended_role TEXT,
  estimated_price DECIMAL,
  status TEXT, -- 'completed', 'incomplete', 'follow_up_needed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

This script is designed to be conversational, consultative, and data-gathering. The goal is to have enough information to create a compelling, customized proposal that the prospect will want to approve.
