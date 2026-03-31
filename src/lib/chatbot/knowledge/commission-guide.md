# Commission System - Complete Guide (7-Level System)

## How Apex Commissions Work

Apex uses a **dual-tree compensation system** with **7 ranks** and **7 override levels**:
1. **Enrollment Tree** (L1 Override) - Who YOU personally enrolled (sponsor_id)
2. **Matrix Tree** (L2-L7 Overrides) - Your position in the 5×7 forced matrix (matrix_parent_id)

### Quick Overview

**You earn commissions from:**
- Your personal sales (seller commission - 60% of BV)
- Your team's sales through enrollment overrides (L1 - 25% of override pool for direct enrollees)
- Your team's sales through matrix overrides (L2-L7 - varies by rank, % of override pool)
- Rank advancement bonuses (one-time, paid once per rank per lifetime)
- Leadership pool (Diamond Ambassador rank only - 1.5% of total sales)
- Bonus pool (equal share among all who earned rank bonuses that month - 3.5% of total sales)

### CRITICAL: Understanding QV and BV

**QV (Qualifying Volume)** is used for rank qualification:
- Personal QV: Your direct sales volume
- Team QV: Your + entire team's sales volume
- Usually 100% of product price (e.g., $149 product = 149 QV)

**BV (Business Volume)** is the commission pool after company deductions:
- ALL commissions are calculated from BV, NOT retail price
- Example: $149 product has $69.39 BV
- Seller Commission: 60% of BV = $41.63
- Override Pool: 40% of BV = $27.76 (distributed L1-L7)

**Note:** The exact BV calculation method is confidential company information.

## Personal Sales Commission (Seller)

### What It Is
- 60% of BV on YOUR personal sales
- This is what YOU earn when you sell a product
- Paid monthly on recurring subscriptions

### Example
```
You sell PulseFlow at $149/month (retail)
BV = $69.39
Your Seller Commission: 60% of $69.39 = $41.63/month
```

### How to Check Your Seller Earnings
Ask the AI: "Show me my personal sales commissions" or "What's my seller commission?"

## Enrollment Override (L1)

### What It Is
- 25% of override pool on sales made by people YOU personally enrolled
- This is your "direct enrollment override"
- Applies to ALL your direct enrollees (unlimited)
- Uses enrollment tree (sponsor_id)
- ALWAYS 25% regardless of your rank

### Example
```
You enroll Sarah
Sarah sells PulseFlow at $149/month
BV = $69.39
Override Pool = 40% of $69.39 = $27.76
Your L1 Override: 25% of override pool = 25% of $27.76 = $6.94/month
```

### How to Check Your L1 Earnings
Ask the AI: "Show me my enrollment overrides" or "What's my L1 override?"

## Matrix Overrides (L2-L7)

### What Is the Matrix?
The matrix is a 5×7 **forced matrix** with automatic spillover:
- Each person can have up to 5 people on their first level
- Goes 7 levels deep
- When your 5 spots are filled, new enrollees "spill over" to the next available spot
- Uses matrix tree (matrix_parent_id)

### Matrix Override Percentages by Rank (% of Override Pool)

| Rank | L1 | L2 | L3 | L4 | L5 | L6 | L7 | Total | Breakage |
|------|----|----|----|----|----|----|----| ------|----------|
| **Starter** | 25% | — | — | — | — | — | — | 25% | 75% |
| **Bronze** | 25% | 20% | — | — | — | — | — | 45% | 55% |
| **Silver** | 25% | 20% | 18% | — | — | — | — | 63% | 37% |
| **Gold** | 25% | 20% | 18% | 15% | — | — | — | 78% | 22% |
| **Platinum** | 25% | 20% | 18% | 15% | 10% | — | — | 88% | 12% |
| **Ruby** | 25% | 20% | 18% | 15% | 10% | 7% | — | 95% | 5% |
| **Diamond Ambassador** | 25% | 20% | 18% | 15% | 10% | 7% | 5% | 100% | 0% |

**Key Points:**
- Percentages are of the override pool (40% of BV), NOT retail price
- L1 is ALWAYS 25% and uses enrollment tree
- L2-L7 use matrix tree and vary by upline's rank
- Breakage (unpaid %) goes 100% to Apex
- Diamond Ambassador earns 100% of override pool (0% breakage)

### Example: Gold Rank Commission
```
You are Gold rank (unlocks L1-L4)
Override Pool per sale: 40% of $69.39 BV = $27.76

Matrix Position:
- L1 (enrollment): 5 people personally enrolled
  Each sells PulseFlow: 5 × ($27.76 × 25%) = 5 × $6.94 = $34.70/month

- L2 (matrix): 5 people in matrix
  Each sells PulseFlow: 5 × ($27.76 × 20%) = 5 × $5.55 = $27.75/month

- L3 (matrix): 25 people in matrix
  Each sells PulseFlow: 25 × ($27.76 × 18%) = 25 × $5.00 = $125.00/month

- L4 (matrix): 125 people in matrix
  Each sells PulseFlow: 125 × ($27.76 × 15%) = 125 × $4.16 = $520.00/month

Total Override Income: $707.45/month
```

### How to Check Matrix Earnings
Ask the AI: "Show me my matrix commissions" or "Break down my commissions by level"

## Product BV & QV Reference

### Standard Products

| Product | Member Price | Retail Price | QV | BV (Member) | BV (Retail) | Seller Earns (60% BV) |
|---------|--------------|--------------|-----|-------------|-------------|----------------------|
| PulseMarket | $59 | $79 | 59/79 | $27.58 | $36.94 | $16.55 / $22.16 |
| PulseFlow | $129 | $149 | 129/149 | $60.32 | $69.65 | $36.19 / $41.79 |
| PulseDrive | $249 | $299 | 249/299 | $116.48 | $139.83 | $69.89 / $83.90 |
| PulseCommand | $399 | $499 | 399/499 | $186.62 | $233.37 | $111.97 / $140.02 |
| SmartLook | $99 | $99 | 99 | $46.29 | $46.29 | $27.77 |
| Business Center | $39 | — | 39 | $18.10 | — | $5.00 (fixed) |

**Business Center Exception:**
- Fixed commission amounts (not percentage-based)
- Rep earns $5 flat
- Override pool: $13.10 total ($1.75 per level × 7 levels)
- All 7 levels earn $1.75 flat (regardless of rank)

### Personal QV vs Team QV
- **Personal QV**: Sum of QV from YOUR direct sales only
- **Team QV**: Personal QV + all downline QV (entire enrollment tree)

### Checking Your QV
Ask the AI:
- "What's my personal QV?"
- "What's my team QV?"
- "Am I on track for my next rank?"

## Rank Advancement Requirements (7 Ranks)

### Starter (Default)
- **Requirements:** None
- **Override Levels:** L1 only (25%)
- **Rank Bonus:** None
- **Total Breakage:** 75% to Apex

### Bronze
- **Requirements:** 150 personal QV, 300 team QV
- **Override Levels:** L1-L2 (25%, 20%)
- **Rank Bonus:** $250 (one-time)
- **Total Breakage:** 55% to Apex

### Silver
- **Requirements:** 500 personal QV, 1,500 team QV
- **Override Levels:** L1-L3 (25%, 20%, 18%)
- **Rank Bonus:** $1,000 (one-time)
- **Total Breakage:** 37% to Apex

### Gold
- **Requirements:** 1,200 personal QV, 5,000 team QV, **1 Bronze sponsored**
- **Override Levels:** L1-L4 (25%, 20%, 18%, 15%)
- **Rank Bonus:** $3,000 (one-time)
- **Total Breakage:** 22% to Apex

### Platinum
- **Requirements:** 2,500 personal QV, 15,000 team QV, **2 Silvers sponsored**
- **Override Levels:** L1-L5 (25%, 20%, 18%, 15%, 10%)
- **Rank Bonus:** $7,500 (one-time)
- **Total Breakage:** 12% to Apex

### Ruby
- **Requirements:** 4,000 personal QV, 30,000 team QV, **2 Golds sponsored**
- **Override Levels:** L1-L6 (25%, 20%, 18%, 15%, 10%, 7%)
- **Rank Bonus:** $12,000 (one-time)
- **Total Breakage:** 5% to Apex

### Diamond Ambassador
- **Requirements:** 5,000 personal QV, 50,000 team QV, **(3 Golds OR 2 Platinums sponsored)**
- **Override Levels:** L1-L7 (25%, 20%, 18%, 15%, 10%, 7%, 5%)
- **Rank Bonus:** $18,000 (one-time)
- **Leadership Pool:** 1.5% of total sales (proportional share)
- **Total Breakage:** 0% (earns 100% of override pool)

**Total Rank Bonuses Starter → Diamond Ambassador: $41,750**

**Critical Notes:**
- Bonuses paid **once per rank per lifetime** (re-qualification does NOT earn second bonus)
- Downline rank requirements must be **personally SPONSORED** (via sponsor_id, not matrix spillover)
- Promotions take effect on the 1st of the following month
- 30-day grace period before payment level drops

## Override Qualification - 50 QV Minimum

**CRITICAL RULE:** You must generate 50+ personal QV per month to earn overrides and bonuses.

**If below 50 QV:**
- Seller commission: STILL PAID (60% of BV)
- Overrides: $0 (not qualified)
- Bonuses: $0 (not qualified)
- Rank advancement: Not eligible

Ask the AI: "Am I qualified for overrides this month?"

## When Are Commissions Paid?

### Commission Cycle
- **Period**: Calendar month (1st - last day)
- **Rank Evaluation**: End of month
- **Promotions Effective**: 1st of following month
- **Payment**: Monthly (direct deposit or check)
- **Minimum Payout**: $50

### Checking Your Current Month
Ask the AI: "What are my commissions this month?"

## Understanding Your Commission Statement

### What's Included
1. **Personal Sales (Seller Commission)**
   - Your direct sales
   - 60% of BV per product
   - Total personal seller earnings

2. **L1 Enrollment Overrides (25%)**
   - Sales from people YOU personally enrolled
   - 25% of override pool per sale
   - Breakdown by enrollee

3. **Matrix Overrides (L2-L7)**
   - Level breakdown (L2, L3, L4, L5, L6, L7)
   - Number of sales per level
   - Override percentage (varies by your rank)
   - Total per level

4. **Bonuses**
   - Rank advancement bonuses (one-time)
   - Bonus pool share (if you earned a rank bonus that month)
   - Leadership pool share (Diamond Ambassador only)

5. **Deductions**
   - Processing fees (if applicable)
   - Chargebacks (rare)

### Viewing Your Statement
Ask the AI: "Show me my commission breakdown" or "Give me a detailed commission report"

## Maximizing Your Commissions

### Focus on Personal Enrollments (L1)
- 25% of override pool = $6.94 per PulseFlow sale
- Build a solid base of personal enrollees
- These are YOUR customers/distributors
- Goal: 5-10 active personal enrollees

### Build Depth in the Matrix
- Help your team enroll others
- Spillover benefits everyone
- Higher ranks unlock more levels (up to L7)
- Each level multiplies your earning potential

### Rank Advancement Strategy
- Each rank unlocks new override levels AND increases percentages
- Focus on team building, not just personal sales
- Track your progress: Ask me "How close am I to [rank]?"
- Meet downline rank requirements (personally sponsor qualified members)

### Maintain 50 QV Minimum
- ALWAYS maintain 50+ personal QV monthly
- Without it, you lose ALL overrides and bonuses
- Stay active and lead by example

## Bonus Pool & Leadership Pool

### Bonus Pool (3.5% of Total Sales)
- Divided EQUALLY among all members who earned rank bonuses that month
- If 10 people hit new ranks: Each gets 1/10th of bonus pool
- Example: $10,000 pool ÷ 10 people = $1,000 each
- Paid monthly

### Leadership Pool (1.5% of Total Sales)
- Diamond Ambassador rank ONLY
- Divided proportionally by production points (personal + team QV)
- Formula: Your points ÷ Total Ambassador points × Leadership pool
- Example: You have 60,000 points, total is 300,000 points, pool is $15,000
  → You earn: 60,000 ÷ 300,000 × $15,000 = $3,000
- Paid monthly

## Common Commission Questions

### "Why did my commissions decrease?"
Possible reasons:
- Team member canceled subscription
- Temporary dip in new enrollments
- Waiting for pending sales to process
- Fell below 50 QV minimum (lost override qualification)

Check by asking: "Show me my active team members"

### "When will I see my rank bonus?"
- Paid in the month AFTER you qualify
- Promotions take effect on 1st of following month
- Added to your regular commission payment
- One-time payment per rank (lifetime)

### "How do I track my team's sales?"
Ask the AI:
- "Show me this month's team sales"
- "Who's been most active this month?"
- "What's my team's total QV?"

### "What's the difference between QV and BV?"
- **QV** = Qualifying Volume for rank advancement (usually 100% of price)
- **BV** = Business Volume for commission calculation (varies by product)
- Example: $149 product = 149 QV, but only $69.39 BV

### "What's the difference between enrollment tree and matrix tree?"
- **Enrollment Tree** (sponsor_id): Who YOU personally enrolled → L1 override
- **Matrix Tree** (matrix_parent_id): 5×7 forced matrix with spillover → L2-L7 overrides
- NEVER mixed! Separate trees for different purposes

## Commission Boosting Strategies

### 1. The Personal Enrollment Focus
- Enroll 5-10 personal members
- Each brings ~$6.94/month L1 override (PulseFlow)
- Goal: $35-$70/month passive from L1

### 2. The Matrix Builder
- Help your L1 enrollees get their first 5
- This builds your L2 depth
- Unlock L2-L7 overrides by advancing ranks
- Each level multiplies your income

### 3. The Rank Climber
- Set rank goals (Bronze → Silver → Gold → Platinum → Ruby → Diamond Ambassador)
- Each rank unlocks more override levels
- Focus on total team QV growth
- Meet downline rank requirements

### 4. The Duplication Master
- Teach your team these same strategies
- Your success multiplies as they succeed
- Leadership bonuses kick in at Diamond Ambassador
- Help team members hit ranks (earn bonus pool share)

## Tools to Track Commissions

### AI Assistant Commands
- "What's my commission balance?"
- "Show me this month's earnings"
- "Break down my commissions by source"
- "Am I on track to earn [$X]?"
- "Show me my highest earners"
- "What's my average monthly commission?"
- "Am I qualified for overrides?" (50 QV check)
- "How close am I to [rank]?"

### Dashboard Quick View
- Top stats show current month commissions
- Commission tab has detailed breakdown
- Real-time updates as sales happen

## Tax Information

**Important**: Commissions are taxable income.
- You'll receive a 1099 form if you earn over $600/year
- Track your income monthly
- Consider setting aside 20-30% for taxes
- Consult a tax professional for personalized advice

Ask the AI: "How do I track my income for taxes?"

## Getting Help

### Questions About Commissions?
Ask the AI:
- "Explain how commissions work"
- "Why didn't I earn on [person's name] sale?"
- "How do I increase my commissions?"
- "What's the best strategy for my rank?"
- "What's the difference between L1 and L2 overrides?"

### Commission Discrepancies?
Contact support with:
- Your distributor ID
- The month in question
- Specific transaction details
- Your calculation vs. what you received

## Commission Growth Timeline

### Month 1-2: Foundation
- Focus: Personal enrollments (3-5 L1 members)
- Rank: Starter → Bronze
- Expected: $20-$50/month (seller + L1 overrides)

### Month 3-6: Building
- Focus: Help L1 get their first enrollees, reach Silver/Gold
- Rank: Bronze → Silver → Gold
- Expected: $100-$300/month (L1-L4 overrides + rank bonuses)

### Month 6-12: Growth
- Focus: Team duplication, Platinum/Ruby rank
- Rank: Gold → Platinum → Ruby
- Expected: $300-$1,000/month (L1-L6 overrides + bonus pool)

### Month 12+: Scale
- Focus: Diamond Ambassador rank, leadership development
- Rank: Ruby → Diamond Ambassador
- Expected: $1,000-$10,000+/month (L1-L7 overrides + leadership pool)

## Success Mindset

**Remember:**
1. Commissions compound over time
2. Focus on helping others succeed
3. Consistency beats intensity
4. Small team, high activity > large team, no activity
5. Your rank determines your earning potential
6. Always maintain 50+ personal QV monthly
7. Downline rank requirements = personally sponsored (not spillover)

**Ask yourself weekly:**
- "Did I enroll anyone new this week?"
- "Did I help a team member get started?"
- "Am I closer to my next rank?"
- "Am I maintaining 50+ personal QV?"
- "What's my plan for next week?"

The AI can help you stay on track - just ask!
