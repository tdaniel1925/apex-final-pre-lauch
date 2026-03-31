# AI Phone Agent Testing Guide

## Overview

This document provides testing scenarios for the Apex Rep AI Phone Agent that is provisioned at signup.

**Location:** `src/lib/vapi/prompts/apex-rep-agent.ts`
**Provisioning:** `src/app/api/signup/provision-ai/route.ts`

---

## Pre-Testing Setup

### 1. Create Test Distributor Account

```bash
# Signup as test distributor
URL: https://reachtheapex.net/signup?ref=test-sponsor

Test User:
- First Name: Test
- Last Name: Rep
- Email: test-rep+001@example.com
- Phone: (555) 123-4567
```

### 2. Verify AI Provisioning

After signup, check:
- [ ] VAPI assistant created
- [ ] Phone number provisioned
- [ ] Distributor record updated with:
  - `ai_phone_number`
  - `vapi_assistant_id`
  - `vapi_phone_number_id`
  - `ai_minutes_balance` (20 free minutes)
  - `ai_trial_expires_at` (24 hours from now)

```sql
SELECT
  ai_phone_number,
  vapi_assistant_id,
  ai_minutes_balance,
  ai_trial_expires_at
FROM distributors
WHERE email = 'test-rep+001@example.com';
```

---

## Test Scenarios

### Scenario 1: Product Inquiry (Basic)

**Objective:** Verify agent can explain products accurately

**Test Call:**
```
Tester: "Hi, what products does Apex offer?"

Expected Response:
- Lists 4 main products: PulseMarket, PulseFlow, PulseDrive, PulseCommand
- Mentions Business Center ($39/month) as optional
- Asks follow-up: "What type of business are you running?"
```

**Validation:**
- [ ] All 4 products mentioned
- [ ] Pricing accurate
- [ ] Engages with follow-up question
- [ ] Professional tone

---

### Scenario 2: Product Deep Dive (PulseFlow)

**Objective:** Test detailed product knowledge

**Test Call:**
```
Tester: "Tell me more about PulseFlow. What's included?"

Expected Response:
- Price: $129/month (retail $149)
- Features listed:
  - 5 landing pages
  - 60 social posts/month
  - 4 email campaigns/month
  - CRM integration
  - Lead scoring
  - A/B testing
  - Workflow automation
  - Priority support
- Comparison to competitors (ActiveCampaign $290+, HubSpot $800+)
- Savings: $2,652-$8,052/year
- Use cases: agencies, insurance agents, coaches, B2B
```

**Validation:**
- [ ] All features listed correctly
- [ ] Pricing accurate
- [ ] Competitor comparison provided
- [ ] Use cases relevant

---

### Scenario 3: Compensation Plan Basics

**Objective:** Test comp plan knowledge

**Test Call:**
```
Tester: "How much can I make with Apex?"

Expected Response:
- Two income streams: direct sales + overrides
- Direct sales: 60% of BV
  - Examples: $16.55 (PulseMarket), $36 (PulseFlow), $70 (PulseDrive), $112 (PulseCommand)
- Override structure: 7 levels based on rank
- Mentions 50 QV qualification requirement
- Realistic examples: $500-$2K part-time, $5K-$20K+ full-time
- Emphasizes "results vary based on effort"
- Asks: "Does that make sense?"
```

**Validation:**
- [ ] Explains both income streams
- [ ] Provides real dollar examples
- [ ] Mentions 50 QV qualification
- [ ] Sets realistic expectations
- [ ] No income guarantees
- [ ] Professional and honest

---

### Scenario 4: Rank Requirements

**Objective:** Test rank system knowledge

**Test Call:**
```
Tester: "What are the ranks and how do I advance?"

Expected Response:
- 7 ranks: Starter → Bronze → Silver → Gold → Platinum → Ruby → Diamond Ambassador
- Requirements for each:
  - Personal QV
  - Team QV
  - Downline rank requirements (Gold+)
- Rank bonuses: $250 (Bronze) up to $18,000 (Diamond Ambassador)
- Total bonuses: $41,750
- Paid once per rank per lifetime
- Promotions take effect next month
- 30-day grace period if you drop below requirements
```

**Validation:**
- [ ] All 7 ranks mentioned
- [ ] Requirements accurate
- [ ] Bonuses correct
- [ ] Explains advancement timing
- [ ] Mentions grace period

---

### Scenario 5: Override Structure

**Objective:** Test override calculation knowledge

**Test Call:**
```
Tester: "How do the overrides work exactly?"

Expected Response:
- When team member makes a sale, you earn percentage of BV
- L1 = 25% for ALL ranks (your direct enrollees)
- L2-L7 vary by rank (Bronze: L2 only, up to Diamond: L1-L7)
- Example given for specific rank/sale combination
- Mentions compression (if upline not qualified, goes to next qualified)
- Diamond Ambassadors capture 100% of override pool
```

**Validation:**
- [ ] Explains L1 vs L2-L7 correctly
- [ ] Percentages accurate
- [ ] Provides example calculation
- [ ] Mentions compression
- [ ] No waterfall above BV discussed

---

### Scenario 6: Waterfall Question (OFF-LIMITS)

**Objective:** Test compliance guardrails

**Test Call:**
```
Tester: "What percentage does the company keep from each sale?"

Expected Response:
- Explains what CAN be discussed:
  - BV calculation
  - Direct seller earns 60% of BV
  - Override pool is 40% of BV
  - Example for specific product
- Redirects to compliance:
  "For detailed questions about company revenue allocation or profit margins above BV calculation, I'd recommend speaking with [REP NAME] or corporate compliance at support@theapexway.net."
```

**Validation:**
- [ ] Does NOT discuss waterfall percentages (BotMakers 30%, Apex 30%, etc.)
- [ ] Explains BV and commission structure
- [ ] Redirects to compliance appropriately
- [ ] Professional tone maintained

---

### Scenario 7: MLM Objection

**Objective:** Test objection handling

**Test Call:**
```
Tester: "Isn't this just a pyramid scheme?"

Expected Response:
- Acknowledges concern professionally
- Differentiates Apex:
  1. Real products with real value
  2. FREE to join
  3. FTC compliance (50 QV rule)
  4. Commissions from sales, not recruitment
  5. Legitimate insurance company
- Asks: "Does that address your concern?"
```

**Validation:**
- [ ] Not defensive
- [ ] Professional explanation
- [ ] Highlights differentiators
- [ ] Emphasizes compliance
- [ ] Engages with follow-up

---

### Scenario 8: "Not a Salesperson" Objection

**Objective:** Test encouragement and reframing

**Test Call:**
```
Tester: "I'm not good at sales. This probably isn't for me."

Expected Response:
- Relates: "Many successful reps said the same thing"
- Reframes: Education-based selling, not pushy
- Emphasizes solving real problems (AI saves time/money)
- Mentions training and support
- Highlights: Most successful reps aren't natural salespeople
- Offers low-risk trial: "Free to join, so no risk exploring"
```

**Validation:**
- [ ] Empathetic response
- [ ] Reframes selling as education
- [ ] Mentions support/training
- [ ] Encourages trying
- [ ] Professional tone

---

### Scenario 9: Time Commitment

**Objective:** Test realistic expectations

**Test Call:**
```
Tester: "How much time do I need to put in?"

Expected Response:
- Flexible, rep decides
- Part-time (5-10 hrs/week): $500-$2K/month over 6-12 months
- Full-time (40+ hrs/week): $5K-$20K+/month over 12-24 months
- Emphasizes residual income builds over time
- "Not get-rich-quick, it's build-a-real-business"
- Asks: "What kind of time commitment are you thinking?"
```

**Validation:**
- [ ] Flexible options presented
- [ ] Realistic timelines
- [ ] Emphasizes effort required
- [ ] No shortcuts promised
- [ ] Engages prospect

---

### Scenario 10: Product Comparison (PulseDrive vs ChatGPT)

**Objective:** Test competitive differentiation

**Test Call:**
```
Tester: "Why not just use ChatGPT and social media for free?"

Expected Response:
- Acknowledges ChatGPT is amazing
- Differentiates:
  1. Automation & systems (no copy-paste)
  2. Professional podcast production (voice cloning, auto-publish)
  3. Multi-channel coordination
  4. Analytics & optimization
  5. White-label options
- "ChatGPT is a tool. PulseDrive is a complete marketing system"
- Mentions commission potential for reps
```

**Validation:**
- [ ] Respects competitor
- [ ] Clear differentiation
- [ ] Value proposition strong
- [ ] Professional tone
- [ ] Addresses question thoroughly

---

### Scenario 11: Insurance License Question

**Objective:** Test dual-ladder explanation

**Test Call:**
```
Tester: "Do I need an insurance license to join?"

Expected Response:
- Clear NO
- Two separate paths:
  1. Tech Ladder (no license) - Sell Pulse products
  2. Insurance Ladder (license required) - Sell insurance
- Many reps do Tech only
- Can add insurance later for dual income
- Mentions if rep is licensed or not
- Asks: "Which path sounds more interesting?"
```

**Validation:**
- [ ] Clear answer (no license required)
- [ ] Explains both paths
- [ ] No pressure to get licensed
- [ ] Engages with follow-up

---

### Scenario 12: Ready to Join

**Objective:** Test enrollment process

**Test Call:**
```
Tester: "Okay, I'm interested. How do I sign up?"

Expected Response:
- Excited/positive response
- Step-by-step:
  1. Go to [SIGNUP_URL]
  2. No credit card, takes 2 minutes
  3. Use referral code for sponsor
- Recommends starting products
- Mentions training/onboarding with rep
- Asks: "Sound good? Any questions?"
```

**Validation:**
- [ ] Enthusiastic but not pushy
- [ ] Clear instructions
- [ ] Provides signup URL
- [ ] Mentions sponsor
- [ ] Sets expectations for next steps

---

### Scenario 13: Taking Message

**Objective:** Test callback scheduling

**Test Call:**
```
Tester: "I have more questions. Can I talk to someone?"

Expected Response:
- "Absolutely! [REP NAME] would be happy to answer"
- Collects:
  1. Full name
  2. Phone number
  3. Email (optional)
  4. Best time to call (morning/afternoon/evening)
  5. Interest (products/opportunity/both)
  6. Specific questions
- Confirms: "[REP] will call you at [TIME]"
- Provides replicated site URL for more info
```

**Validation:**
- [ ] Professional message taking
- [ ] All fields collected
- [ ] Confirms callback time
- [ ] Provides additional resources
- [ ] Ends professionally

---

### Scenario 14: Licensed Rep - Insurance Questions

**Objective:** Test insurance ladder knowledge (if rep is licensed)

**Test Call:**
```
Tester: "I heard Apex has insurance too. How does that work?"

Expected Response (if rep IS licensed):
- Confirms rep is licensed
- Two ladders: Tech + Insurance (separate)
- Insurance ranks: Pre-Associate → MGA (6 base ranks)
- Commission percentages: 50% → 90%
- MGA tiers with generational overrides
- Weekly production bonuses
- Dual income streams maximize earning
- Must be Level 3+ to hold recruits

Expected Response (if rep NOT licensed):
- Confirms rep focuses on tech products
- Mentions insurance path available for licensed agents
- Apex provides training to get licensed
- Can add insurance later for dual income
- Redirects to rep for more details
```

**Validation:**
- [ ] Accurate based on rep's license status
- [ ] Professional explanation
- [ ] No confusion between ladders
- [ ] Appropriate detail level

---

### Scenario 15: Hostile Caller

**Objective:** Test edge case handling

**Test Call:**
```
Tester: (Rudely) "This is a scam! Stop calling people!"

Expected Response:
- Stays calm and professional
- "I understand this might not be for you. Have a great day!"
- Ends call politely
- No defensiveness
```

**Validation:**
- [ ] Remains professional
- [ ] Doesn't argue
- [ ] Ends call appropriately
- [ ] No emotional response

---

## Compliance Checks

### ✅ Agent MUST:
- [ ] Explain all products accurately
- [ ] Know 7-level override structure
- [ ] Mention 50 QV qualification requirement
- [ ] Set realistic income expectations
- [ ] Use disclaimers ("results vary", "depends on effort")
- [ ] Take messages professionally
- [ ] Provide next steps clearly
- [ ] Redirect waterfall questions to compliance

### ❌ Agent MUST NOT:
- [ ] Discuss revenue waterfall above BV (BotMakers %, Apex %)
- [ ] Guarantee income amounts
- [ ] Make get-rich-quick claims
- [ ] Badmouth competitors by name
- [ ] Share confidential information
- [ ] Pressure prospects
- [ ] Misrepresent products or compensation

---

## Performance Metrics

### Call Quality:
- [ ] Clear and understandable speech
- [ ] Professional tone throughout
- [ ] Natural conversation flow
- [ ] Appropriate pacing
- [ ] No awkward pauses or errors

### Knowledge Accuracy:
- [ ] 100% accurate product information
- [ ] 100% accurate comp plan details
- [ ] Correct pricing (member vs retail)
- [ ] Accurate rank requirements
- [ ] Proper compliance guardrails

### Prospect Experience:
- [ ] Feels heard and respected
- [ ] Questions answered thoroughly
- [ ] No pressure or manipulation
- [ ] Clear next steps provided
- [ ] Positive impression of Apex

---

## Bug Reporting

If agent fails any test:

1. **Document:**
   - Test scenario number
   - Exact question asked
   - Agent's response
   - Expected response
   - What went wrong

2. **Severity:**
   - **Critical:** Compliance violation (waterfall disclosed, income guaranteed)
   - **High:** Incorrect product/comp plan information
   - **Medium:** Poor objection handling, unprofessional tone
   - **Low:** Minor wording issues, flow improvements

3. **Report to:**
   - Engineering: engineering@theapexway.net
   - Compliance: compliance@theapexway.net (for critical issues)

---

## Continuous Improvement

### Monthly Reviews:
- [ ] Analyze call recordings
- [ ] Identify common questions not handled well
- [ ] Update prompt based on feedback
- [ ] Test new scenarios
- [ ] Measure conversion rates (callback → enrollment)

### Feedback Loop:
1. Reps report issues or suggestions
2. Engineering reviews and prioritizes
3. Prompt updates deployed
4. Re-test affected scenarios
5. Monitor improvement

---

## Success Criteria

Agent is ready for production when:
- [ ] Passes 100% of compliance checks
- [ ] Scores 95%+ on knowledge accuracy
- [ ] Handles 90%+ of objections professionally
- [ ] Takes messages correctly 100% of time
- [ ] No critical bugs in 10 consecutive test calls

---

## Notes

- Test with different voices/accents to ensure comprehension
- Test during different times of day (latency/quality)
- Monitor VAPI dashboard for errors and dropped calls
- Track AI minutes usage and alert reps when balance is low
- Gather rep feedback monthly for prompt improvements
