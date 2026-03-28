# Rank vs Pay Level - System Clarification

**Date:** March 22, 2026
**Status:** Needs Implementation
**Priority:** MEDIUM

---

## 🎯 Your Business Rules

### **Rule 1: Rank is Permanent** ✅
- Once you achieve a rank, **you NEVER lose it**
- `highest_tech_rank` field already exists in database ✅
- This is your "lifetime achievement" rank

### **Rule 2: Pay Level Can Drop** ⚠️
- Your **payment level** is based on current monthly performance
- If you don't maintain the requirements, you get **paid at a lower level**
- But your **title/rank remains** the same

---

## 📊 Current System Status

### ✅ **What EXISTS:**
```typescript
members table:
  - tech_rank              // Current rank (can go up/down)
  - highest_tech_rank      // Lifetime max rank achieved ✅
  - tech_rank_grace_period_start
  - tech_rank_lock_until
  - personal_credits_monthly
  - team_credits_monthly
```

### ❌ **What's MISSING:**
```typescript
members table:
  - paying_rank            // ❌ NOT IMPLEMENTED
  - pay_level              // ❌ NOT IMPLEMENTED
```

### ⚠️ **What's WRONG:**

**File:** `src/lib/compensation/config.ts` (line 204)
```typescript
export const RANK_GRACE_PERIOD_MONTHS = 2; // 2 months below requirements before demotion
```

**Problem:** Comment says "demotion" but rank should NEVER demote!

**Should Say:**
```typescript
export const PAY_LEVEL_GRACE_PERIOD_MONTHS = 2; // 2 months below requirements before pay level drops
```

---

## 🏗️ How It SHOULD Work

### **Example Scenario:**

**John achieves Platinum:**
- `tech_rank` = `platinum`
- `highest_tech_rank` = `platinum` ✅ (NEVER CHANGES)
- `paying_rank` = `platinum` (starts same as rank)

**Next month, John's credits drop below Platinum requirements:**
- After 2-month grace period:
  - `tech_rank` = `platinum` ✅ (STAYS!)
  - `highest_tech_rank` = `platinum` ✅ (STAYS!)
  - `paying_rank` = `gold` ⬇️ (DROPS to highest qualified level)

**John gets paid at Gold rates:**
- Override schedule: Gold rates (L1-L4)
- No rank bonus (already got it when achieving Platinum)
- But his **title is still Platinum**!

**If John brings his credits back up:**
- `paying_rank` goes back to `platinum` ⬆️
- No new rank bonus (already got it once)

---

## 🔧 Implementation Required

### **1. Database Migration** (Add `paying_rank` field)

```sql
-- Migration: Add paying_rank field
ALTER TABLE members
ADD COLUMN paying_rank TEXT DEFAULT 'starter',
ADD CONSTRAINT members_paying_rank_check
  CHECK (paying_rank IN ('starter', 'bronze', 'silver', 'gold', 'platinum', 'ruby', 'diamond', 'crown', 'elite'));

-- Initialize paying_rank = tech_rank for existing members
UPDATE members SET paying_rank = tech_rank;

-- Add comment
COMMENT ON COLUMN members.paying_rank IS 'Current payment level (can drop with grace period, but tech_rank never drops)';
COMMENT ON COLUMN members.tech_rank IS 'Current qualified rank (can drop after grace period for display, but highest_tech_rank stays forever)';
COMMENT ON COLUMN members.highest_tech_rank IS 'Highest rank ever achieved (NEVER drops - lifetime achievement)';
```

---

### **2. Update Config Comments**

**File:** `src/lib/compensation/config.ts`

```typescript
// BEFORE (WRONG):
export const RANK_GRACE_PERIOD_MONTHS = 2; // 2 months below requirements before demotion

// AFTER (CORRECT):
export const PAY_LEVEL_GRACE_PERIOD_MONTHS = 2;
// 2 months below requirements before PAYMENT LEVEL drops
// Note: tech_rank may also drop for display purposes, but highest_tech_rank NEVER drops!
```

---

### **3. Update Compensation Calculator**

**File:** `src/lib/compensation/override-calculator.ts`

```typescript
// BEFORE:
const schedule = OVERRIDE_SCHEDULES[uplineMember.tech_rank as TechRank];

// AFTER:
const schedule = OVERRIDE_SCHEDULES[uplineMember.paying_rank as TechRank];
//                                                  ^^^^^^^^^^^ Use paying_rank for commission calc!
```

---

### **4. Update Rank Calculation Logic**

**File:** `src/lib/compensation/rank-calculator.ts` (or wherever rank updates happen)

```typescript
export async function updateRankAndPayLevel(memberId: string) {
  // 1. Calculate what rank they QUALIFY for based on credits
  const qualifiedRank = calculateQualifiedRank(member);

  // 2. Check grace period for dropping
  const gracePeriodExpired = checkGracePeriod(member);

  // 3. Update tech_rank (can drop after grace period)
  if (qualifiedRank > member.tech_rank || gracePeriodExpired) {
    await updateTechRank(memberId, qualifiedRank);
  }

  // 4. Update highest_tech_rank (ONLY goes UP, NEVER down!)
  if (qualifiedRank > member.highest_tech_rank) {
    await supabase
      .from('members')
      .update({
        highest_tech_rank: qualifiedRank,
        tech_rank_achieved_date: new Date().toISOString()
      })
      .eq('member_id', memberId);
  }

  // 5. Update paying_rank (can drop after grace period)
  if (qualifiedRank !== member.paying_rank) {
    if (qualifiedRank < member.paying_rank && !gracePeriodExpired) {
      // Start grace period
      await startGracePeriod(memberId);
    } else if (gracePeriodExpired) {
      // Grace period expired, drop paying_rank
      await supabase
        .from('members')
        .update({ paying_rank: qualifiedRank })
        .eq('member_id', memberId);
    }
  }
}
```

---

### **5. Update UI to Show Both**

**File:** `src/components/dashboard/RankDisplay.tsx` (example)

```tsx
<div className="rank-display">
  <div className="current-rank">
    <h3>{member.tech_rank}</h3>
    <p className="text-sm text-slate-600">Your Current Rank</p>
  </div>

  {member.paying_rank !== member.tech_rank && (
    <div className="paying-rank">
      <p className="text-sm text-orange-600">
        Currently paid at: {member.paying_rank} level
      </p>
      <p className="text-xs text-slate-500">
        Bring your credits up to get paid at {member.tech_rank} level!
      </p>
    </div>
  )}

  <div className="lifetime-rank">
    <h4>{member.highest_tech_rank}</h4>
    <p className="text-xs text-slate-500">Lifetime Achievement</p>
  </div>
</div>
```

---

## 📝 Summary

### **Current State:**
- ✅ `highest_tech_rank` field exists (lifetime rank)
- ❌ `paying_rank` field missing (current pay level)
- ❌ Config comments misleading (say "demotion" instead of "pay level drop")
- ❌ Compensation calculator uses `tech_rank` instead of `paying_rank`

### **What Needs to Happen:**
1. Add `paying_rank` column to members table
2. Update config comments to clarify pay level vs rank
3. Update compensation calculator to use `paying_rank`
4. Update rank calculation logic to maintain both fields
5. Update UI to show both rank and paying rank (if different)

### **Estimated Time:** 3-4 hours

---

**Last Updated:** March 22, 2026
