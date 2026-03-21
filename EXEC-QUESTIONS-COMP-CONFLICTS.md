# Compensation Plan Clarification Request

**To:** APEX Executive Leadership Team
**From:** Trent Daniel, Technology & Operations
**Date:** March 21, 2026
**Re:** Critical Discrepancies in Insurance Compensation Documentation

---

## Executive Summary

During the technical implementation of the insurance compensation engine, I've identified **material conflicts** between our compensation plan documents that require executive clarification before we proceed with system development. These conflicts impact:

1. How we calculate rank advancement
2. How we track and pay overrides
3. How we communicate opportunity to agents
4. Our legal compliance with state insurance regulations

**Action Required:** Please review the conflicts below and provide definitive answers by **[DATE]** so we can complete the compensation engine implementation without further delay.

---

## CONFLICT #1: MGA Tier Naming Convention

### The Issue:
We have two different naming structures for MGA leadership tiers in our official documents.

### Document A: `APEX_COMP_ENGINE_SPEC_FINAL.md`
```
2 MGAs:  Associate MGA
4 MGAs:  Senior MGA
6 MGAs:  Regional MGA
8 MGAs:  National MGA
10 MGAs: Executive MGA
12 MGAs: Premier MGA
```

### Document B: `Insurance Comp. Plan - Final.txt`
```
2 MGAs:  Associate MGA
4 MGAs:  Sr. Associate MGA
6 MGAs:  Executive MGA
8 MGAs:  Sr. Executive MGA
10 MGAs: National MGA
12 MGAs: Premier MGA
```

### Why This Matters:
- **System Implementation:** We're building database tables and UI that display rank names. Which structure is authoritative?
- **Marketing Materials:** Agent-facing materials will show inconsistent rank names if not aligned.
- **Legal Compliance:** Compensation plan disclosures must use consistent terminology across all documents.
- **Agent Confusion:** Agents at 4 MGAs won't know if they're "Senior MGA" or "Sr. Associate MGA."

### Questions for Leadership:
1. **Which naming convention should we use as the single source of truth?**
2. Should we retire one of these documents or merge them?
3. Do the names have any regulatory implications (e.g., "Regional" vs "Executive")?

---

## CONFLICT #2: MGA Base Shop Override Rate

### The Issue:
Two different override percentages are shown for MGA base shop production in the same document.

### Document: `Insurance Comp. Plan - Final.txt`
- **Line 247:** "As an MGA, you will earn an additional **15%** override on Direct Recruits in your base shop."
- **Line 298:** "Base Shop Override (**20%**)"

### Why This Matters:
- **Compensation Accuracy:** A 5% difference on $600K base shop = **$30,000/year** difference in earnings.
- **Agent Expectations:** If we tell agents "20%" in marketing but pay "15%," we have a breach of contract.
- **Financial Projections:** The $420K Regional MGA example (line 319) uses 20%, not 15%.
- **System Logic:** Our payment engine needs the correct percentage to calculate correctly.

### Questions for Leadership:
1. **Is the MGA base shop override 15% or 20%?**
2. If it's 15%, do we need to recalculate the Regional MGA income example ($420K)?
3. If it's 20%, should we update line 247 in the document?
4. Is there a scenario where both are true (e.g., different rates for different MGA tiers)?

---

## CONFLICT #3: Annual vs. 90-Day Production Requirements

### The Issue:
We show both annual and 90-day production requirements, but they don't align perfectly for all ranks.

### Document: `Insurance Comp. Plan - Final.txt`

| Rank | Annual (Lines 7-26) | 90-Day (Lines 79-107) | Math Check (Annual ÷ 4) |
|------|--------------------|-----------------------|-------------------------|
| Pre-Associate | $40,000 | $10,000 | ✅ $10,000 |
| Associate | $80,000 | $20,000 | ✅ $20,000 |
| Agent | $120,000 | $30,000 | ❌ $30,000 (should be $30K, not $30K) |
| Sr. Agent | $300,000 | $75,000 | ✅ $75,000 |
| MGA | $600,000 | $150,000 | ✅ $150,000 |

**Actually, these DO align perfectly.**

However, **APEX_COMP_ENGINE_SPEC_FINAL.md** shows different 90-day numbers:
- Associate: **$25K/90 days** (not $20K)
- Agent: **$45K/90 days** (not $30K)

### Why This Matters:
- **Promotion Timing:** If we use the wrong threshold, agents will promote too early or too late.
- **Agent Frustration:** "I hit $25K but the system says I need $20K - which is it?"
- **Compliance:** State insurance regulators require us to follow our published comp plan exactly.
- **Cross-Ladder Calculations:** The tech ladder and insurance ladder cross-credit calculations depend on these thresholds.

### Questions for Leadership:
1. **Which 90-day production requirements are authoritative?**
   - Insurance Comp Plan: $10K → $20K → $30K → $75K → $150K
   - APEX Spec: $10K → $25K → $45K → $75K → $150K
2. Do we want to show annual AND 90-day, or just 90-day rolling windows?
3. Should we update the spec to match the insurance comp plan, or vice versa?

---

## CONFLICT #4: Downline Producer Definition Discrepancy

### The Issue:
The insurance comp plan has a much stricter definition of "downline producer" than what we've been using.

### Document: `Insurance Comp. Plan - Final.txt` (Lines 63-64, 367-368)
> "A downline producer is an active writing agent with a minimum of **$2,500 per month** in production. The agent must have produced a minimum of the **last two consecutive months** and have been with APEX for at least **90 days** to be considered an active downline agent."

### Current System Logic:
- We count anyone with `status='active'` as a "downline producer"
- We don't check for $2,500/month minimum
- We don't verify 2 consecutive months of production
- We don't enforce the 90-day waiting period

### Why This Matters:
- **Rank Advancement:** Sr. Agent requires "10 downline producers" - if we're counting incorrectly, agents will promote too early.
- **Override Payments:** If we're paying overrides on non-qualifying agents, we're overpaying.
- **Agent Expectations:** "I have 12 agents in my org, why does the system only count 5?"
- **Financial Accuracy:** This could be costing APEX significant money if we're overpaying unqualified downlines.

### Example Scenario:
```
Agent has 10 recruits:
- 4 wrote $5K/month for 2+ months ✅ COUNT
- 3 wrote $2K/month consistently ❌ DON'T COUNT ($2,500 minimum)
- 2 just joined 30 days ago ❌ DON'T COUNT (need 90 days)
- 1 wrote $3K last month, $0 this month ❌ DON'T COUNT (need 2 consecutive)

Actual qualifying downline producers: 4 (not 10)
```

This agent thinks they're 1 recruit away from Sr. Agent (needs 5), but they actually need 1 more **qualifying** downline producer, not just any recruit.

### Questions for Leadership:
1. **Should we enforce the $2,500/month × 2 consecutive months + 90 days rule?**
2. If yes, do we grandfather in existing agents who were promoted under the old logic?
3. Do we need to audit current ranks and potentially demote agents who don't meet this standard?
4. Should we add a "qualifying downline" counter in the dashboard so agents know their real progress?

---

## CONFLICT #5: Override Access by Rank (Not a Conflict - Needs Confirmation)

### The Claim:
Insurance Comp Plan states that override access is tiered by rank:
- **Agent (70%):** Gen 1-3 overrides
- **Sr. Agent (80%):** Gen 1-5 overrides
- **MGA (90%):** Gen 1-6 overrides (full access)

### Current System Logic:
- We're not restricting override depth by rank
- Everyone gets paid on all 6 generations if they have the downline

### Why This Matters:
- **Overpayment Risk:** If we're paying Gen 4-6 overrides to Agents and Sr. Agents, we're overpaying.
- **Compensation Accuracy:** This could be a significant cost to APEX if we're not enforcing rank-based limits.
- **Agent Motivation:** The tiered access is an incentive to advance ranks - if everyone gets all 6 gens, there's less motivation.

### Questions for Leadership:
1. **Do we enforce override depth restrictions by rank?**
2. If yes, when does this take effect? (Immediately, or only for new agents?)
3. If an Agent (70%) has 6 generations of downline, do we just NOT PAY them for Gen 4-6?
4. Or do those Gen 4-6 overrides "roll up" to the next qualified upline MGA?

---

## ADDITIONAL CLARIFICATION NEEDED

### Recruitment Rollup Rule

**Document: `Insurance Comp. Plan - Final.txt` (Lines 65-68)**
> "Until the recruiter achieves Agent status or a 70% contract level, the recruited agent will remain under the up-line for training and management."

### What This Means:
- If a **Pre-Associate** (Level 2) recruits someone, that recruit is placed under the Pre-Associate's upline (Phil or Ahn) for "training and management"
- The Pre-Associate gets **35% production credit** toward their next promotion
- The upline (Phil/Ahn) gets the **override compensation**
- When the Pre-Associate reaches **Agent (70%)**, they "get back" their recruits (start receiving overrides)

### Questions for Leadership:
1. **Is this the intended behavior?**
2. Does "remain under the up-line" mean:
   - **Enrollment tree:** The recruit's `enroller_id` = Pre-Associate, but `sponsor_id` = Phil/Ahn?
   - **Matrix tree:** The recruit's `matrix_parent_id` = Phil/Ahn (not the Pre-Associate)?
3. When the recruiter hits Agent (70%), do their recruits **automatically roll back** to them?
4. Or do the recruits stay with Phil/Ahn permanently, and the new Agent only gets overrides on **future** recruits?
5. How do we handle this in the database? (Do we need a `temporary_sponsor_id` field?)

---

## CONFLICT #6: Direct MGA Recruitment Provision (UNDOCUMENTED)

### The Issue:
There is a verbal understanding that **existing MGAs can bring in new recruits directly at MGA rank** until the end of 2026, bypassing the normal New Hire → Pre-Associate → Associate → Agent → Sr. Agent → MGA progression.

### Current Documentation:
**NONE** of the compensation plan documents mention this provision:
- `Insurance Comp. Plan - Final.txt` - Shows standard 6-rank progression only
- `APEX_COMP_ENGINE_SPEC_FINAL.md` - Shows standard progression only
- All `ins-comp/` documents - No mention of direct MGA recruitment

### Why This Matters:
- **System Logic:** Our signup flow assumes everyone starts at New Hire (50%). If MGAs can bring in new MGAs, we need a completely different onboarding path.
- **Database Schema:** We need to track "direct MGA recruits" vs "promoted MGAs" for compliance and reporting.
- **Legal Compliance:** State insurance regulators require **written disclosure** of all compensation pathways. A verbal-only provision is not compliant.
- **Agent Confusion:** "Why did John start at MGA but I had to work my way up from New Hire?"
- **Financial Impact:** If we allow direct MGA recruitment but don't document requirements, we could be giving away 90% contracts with no production accountability.
- **Equity Issues:** This creates two classes of MGAs - those who earned it vs. those who were recruited directly.

### Real-World Scenario:
```
Phil (MGA) recruits Sarah directly at MGA rank:
- Does Sarah get 90% commission immediately?
- Does Sarah need to meet $150K/90 days + 10 downline + 3 new/quarter?
- Or does she get a "grace period" to ramp up?
- What happens if she doesn't meet MGA requirements after 90 days?
- Does she get demoted, or is MGA rank "locked in"?
- How do carrier contracts work if we assign 90% but she's producing $0?
```

### Example Impact on Comp Plan:
If Phil recruits Sarah as a direct MGA:
- **Scenario A:** Sarah produces $0 in first 90 days but keeps 90% contract → APEX loses money
- **Scenario B:** Sarah produces $200K in first 90 days → She earns $180K commission (90% of $200K) → This is HUGE for a new agent
- **Scenario C:** Sarah recruits 5 agents as a new MGA → Do they roll up to Phil, or does Sarah keep them?

### Questions for Leadership:

1. **Does this provision actually exist, or is it a misunderstanding?**
2. If it exists, **when does it expire?** (End of 2026? Specific date?)
3. **Who is eligible to recruit direct MGAs?** (Any MGA? Only Regional+ MGAs? Only Phil/Ahn?)
4. **What are the requirements for the new recruit to qualify for direct MGA placement?**
   - Do they need prior insurance experience?
   - Do they need to demonstrate production capability?
   - Is there a probationary period?
5. **Does the direct MGA need to meet ongoing MGA requirements?**
   - $150K/90 days production?
   - 10 qualified downline producers?
   - 3 new producers every 90 days?
6. **What happens if a direct MGA fails to meet requirements?**
   - Demote to Sr. Agent (80%)?
   - Termination?
   - Grace period to improve?
7. **How does this affect override calculations?**
   - If Phil recruits Sarah as MGA, does Phil get Gen 1 (15%) override on Sarah's production?
   - Or does Sarah operate independently with no upline overrides?
8. **Is this documented ANYWHERE in writing?**
   - Contract addendum?
   - Email from executives?
   - Legal memo?
9. **Has this been cleared with state insurance regulators in all 50 states?**
10. **After the end-of-2026 deadline, what happens?**
    - All future MGAs must follow standard progression?
    - Direct MGA recruits before deadline are "grandfathered in"?

### Recommended Action:

If this provision is real, we need **immediate written documentation** that includes:
1. ✅ Eligibility criteria for recruiter (who can do this)
2. ✅ Eligibility criteria for recruit (who qualifies)
3. ✅ Expiration date (when does this end)
4. ✅ Performance requirements (must maintain MGA standards)
5. ✅ Consequences for non-performance (demotion policy)
6. ✅ Override structure (how does upline compensation work)
7. ✅ Legal compliance sign-off from each state

**If this provision does NOT exist,** we need to clarify the misunderstanding immediately so expectations are aligned.

**Risk Level:** 🔴 **CRITICAL** - Implementing this wrong could result in regulatory violations, unfair compensation, and agent lawsuits.

---

## IMPACT ON SYSTEM DEVELOPMENT

These conflicts are **blocking** the following features:

1. ✅ **Rank Calculation Engine** - Can't finalize until we know correct thresholds and downline definitions
2. ✅ **Override Payment Engine** - Can't code until we know 15% vs 20%, and Gen 1-6 access by rank
3. ✅ **Recruitment Rollup Logic** - Can't implement until we know how to handle Pre-Associate recruits
4. ✅ **Agent Dashboard** - Can't show correct rank names or progress bars
5. ✅ **Marketing Materials** - Can't finalize income projections or tier names
6. ✅ **Legal Compliance** - Can't submit for state regulatory approval with conflicting docs
7. 🔴 **Direct MGA Recruitment** - CRITICAL - Need immediate clarification if this exists

**Estimated Delay:** Each day without answers adds **2-3 days** to development timeline due to rework.

---

## RECOMMENDED NEXT STEPS

1. **Executive Review Meeting:** Schedule 60-minute session with executives, legal, and compliance to resolve conflicts
2. **Single Source of Truth:** Designate ONE document as authoritative (recommend `Insurance Comp. Plan - Final.txt` as it's most detailed)
3. **Document Reconciliation:** Update all other documents to match the authoritative source
4. **Change Control:** Implement version control for compensation plan changes going forward
5. **System Update:** Once answers received, we can complete implementation in 5-7 business days

---

## URGENCY LEVEL: HIGH

**Why This Can't Wait:**
- Pre-launch site goes live in **[X weeks]**
- Agents are signing up and recruiting NOW
- We're potentially overpaying or underpaying based on wrong logic
- State insurance regulators require accurate, consistent compensation disclosures
- Our technology platform must match our legal agreements

**I need definitive answers by [DATE] to complete the compensation engine without further delays.**

---

## APPENDIX: Documents Reviewed

1. `APEX_COMP_ENGINE_SPEC_FINAL.md` - Master compensation specification
2. `Insurance Comp. Plan - Final.txt` - Insurance compensation presentation deck
3. `Level Descriptions (1).docx` - Rank qualitative descriptions
4. `APEX Bonus Program May 28th 2025 (1).docx` - Bonus program details
5. `APEX Deliverables for Agents and Senior Agents.docx` - Role responsibilities
6. `Achieve Regional MGA Level.docx` - Regional MGA income projection
7. `Beginner full time agent compensation.docx` - New agent examples
8. `Beginner part-time agent compensation.docx` - Part-time agent examples

All documents reviewed for consistency. Conflicts documented above.

---

**Please reply to this memo with definitive answers, or let's schedule a call to resolve these questions together.**

Thank you,

**Trent Daniel**
Technology & Operations
Apex Affinity Group
trent@reachtheapex.net
