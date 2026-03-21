# Apex Affinity Group - Compensation Master Index

**Last Updated**: 2026-03-21
**Status**: Awaiting Executive Answers to 6 Critical Conflicts

---

## 🎯 DUAL COMPENSATION SYSTEM OVERVIEW

Apex Affinity Group operates **TWO COMPLETELY SEPARATE** compensation structures:

### 1. TECH PRODUCTS (5-Wide Forced Matrix)
- **Structure**: 5-wide forced matrix (P1-P5 at each level)
- **Depth**: 7 levels (19,531 total positions)
- **Width**: LIMITED to 5 positions per level
- **Spillover**: Yes (recruits #6+ spill to downline)
- **Database Tracking**: `matrix_parent_id`, `matrix_position`
- **Commission**: 30% enrollment override + matrix depth overrides
- **Documentation**: See `COMPENSATION-STRUCTURE-DIAGRAM.md`

### 2. INSURANCE PRODUCTS (Unlimited Generational)
- **Structure**: Traditional insurance MLM (unlimited width)
- **Depth**: 6 generations of overrides (Gen 7 = bonus pool)
- **Width**: UNLIMITED at every generation
- **Spillover**: No spillover (pure generational tree)
- **Database Tracking**: `sponsor_id`, `enroller_id`
- **Commission**: 15% Gen 1, 5% Gen 2, 3% Gen 3, 2% Gen 4, 1% Gen 5, 0.5% Gen 6
- **Documentation**: See `INSURANCE-COMP-PLAN-DIAGRAM.md`

---

## 📚 DOCUMENTATION INDEX

### Core Diagrams
| Document | Purpose | Status |
|----------|---------|--------|
| `COMPENSATION-STRUCTURE-DIAGRAM.md` | Tech Products (5-wide matrix) | ✅ Complete |
| `INSURANCE-COMP-PLAN-DIAGRAM.md` | Insurance (unlimited generational) | ✅ Complete |
| `COMPENSATION-MASTER-INDEX.md` | This file - master overview | ✅ Complete |

### Source Documents
| Document | Purpose | Status |
|----------|---------|--------|
| `ins-comp/Insurance Comp. Plan - Final.txt` | Insurance single source of truth | ✅ Reference |
| Original Spec (in codebase) | Tech products specification | ⚠️ Conflicts exist |

### Analysis Documents
| Document | Purpose | Status |
|----------|---------|--------|
| `EXEC-QUESTIONS-COMP-CONFLICTS.md` | 6 critical conflicts requiring executive answers | 🔴 Awaiting Response |
| `COMPENSATION-PLAN-REBUILD-PROPOSAL.md` | 6-phase implementation plan (30-44 days) | ⏸️ On Hold (awaiting exec answers) |
| `SYSTEM-IF-INSURANCE-DOCS-ARE-SOURCE-OF-TRUTH.md` | Financial impact analysis | ✅ Complete |
| `INSURANCE-REQUIREMENTS-EXTRACTED.md` | What insurance docs contain vs don't contain | ✅ Complete |

---

## 🚨 CRITICAL CONFLICTS (BLOCKING IMPLEMENTATION)

**6 Conflicts Requiring Executive Answers**:

| # | Conflict | Impact | Documents |
|---|----------|--------|-----------|
| 1 | MGA Tier Naming | Spec shows 6 tiers, insurance shows 7 | High |
| 2 | Base Shop Override | Spec: 15%, Insurance final slide: 20% | Medium |
| 3 | Production Thresholds | Multiple conflicting numbers | High |
| 4 | Downline Producer Definition | Strict definition in insurance docs, not enforced in code | High |
| 5 | Override Access by Rank | Insurance restricts access by rank, spec doesn't | High |
| 6 | Direct MGA Recruitment | Undocumented verbal provision until end 2026? | Critical |

**Full Details**: See `EXEC-QUESTIONS-COMP-CONFLICTS.md`

---

## 📋 INSURANCE RANK STRUCTURE (From Insurance Docs)

| Rank | Commission | 90-Day Req | Annual Req | Team Req | Override Access |
|------|------------|------------|------------|----------|-----------------|
| New Hire | 50% | $0 | $0 | None | None |
| Pre-Associate | 55% | $10K | $40K | None | None |
| Associate | 60% | $20K | $80K | None | None |
| **Agent** | 70% | $30K | $120K | None | Gen 1-3 |
| Sr. Agent | 80% | $75K | $300K | 5 DL + 1 new/90d | Gen 1-5 |
| **MGA** | 90% | $150K | $600K | 10 DL + 3 new/90d | Gen 1-6 (full) |

**Key Rule**: Recruits from Pre-Associate/Associate roll up to sponsor until recruiter hits Agent rank.

---

## 🔄 RECRUITMENT ROLLUP SYSTEM (INSURANCE ONLY)

**Critical Rule from Insurance Docs (Lines 65-68)**:

> "If a New Hire, Pre-Associate, or Associate recruits an agent, they will receive production credit for up to 35% (of total combined production of anyone they have recruited) for the required amount needed to obtain their next promotion. The remaining production requirement must be met through the agent's personal production. Until the recruiter achieves Agent status or a 70% contract level, the recruited agent will remain under the up-line for training and management."

### Database Implementation:
```typescript
// When Pre-Associate/Associate recruits someone:
newRecruit.enroller_id = recruiter.member_id; // ALWAYS set
newRecruit.sponsor_id = recruiter.sponsor_id; // ROLLUP to upline
newRecruit.temporary_sponsor_id = recruiter.sponsor_id; // Mark as rolled up
newRecruit.original_recruiter_id = recruiter.member_id; // Track for rollback

// When recruiter hits Agent rank:
// 1. Find all recruits where original_recruiter_id = this_agent
// 2. Update sponsor_id = original_recruiter_id (bring them back)
// 3. Set rollup_released_at = NOW()
// 4. Clear temporary_sponsor_id
```

---

## 🎯 TECH LADDER RANK STRUCTURE

| Rank | Matrix Access | Team Req | Monthly Req |
|------|---------------|----------|-------------|
| Starter | Level 1 only | 0 | $0 |
| Bronze | Levels 1-2 | 2 active | $500 |
| Silver | Levels 1-3 | 5 active | $1,000 |
| Gold | Levels 1-4 | 10 active | $2,000 |
| Platinum | Levels 1-7 | 20 active | $5,000 |

**Note**: These are from original spec - no conflicts found in tech side documentation.

---

## 💰 COMMISSION EXAMPLES

### Example 1: Tech Products (5-Wide Matrix)
```
You recruit 8 people (Tech products):
- Enrollment: 8 × 30% = 30% override on all 8 (unlimited)
- Matrix: First 5 fill P1-P5, last 3 spill to downline
- If Bronze rank: Earn matrix overrides on all 8 (Levels 1-2)
```

### Example 2: Insurance (Unlimited Generational)
```
You recruit 10 insurance agents (as MGA):
- Gen 1: 10 agents × $5,000/mo × 15% = $7,500/month
- Gen 2: 25 agents × $5,000/mo × 5% = $6,250/month
- Gen 3: 50 agents × $5,000/mo × 3% = $7,500/month
Total: $21,250/month in overrides (NO WIDTH LIMITS!)
```

---

## 🔧 IMPLEMENTATION STATUS

### Database Schema:
- ✅ `members` table has `enroller_id`, `sponsor_id`
- ✅ `distributors` table has `matrix_parent_id`, `matrix_position`
- ⚠️ Missing: `temporary_sponsor_id`, `original_recruiter_id`, `rollup_released_at`
- ⚠️ Missing: Insurance rank tracking fields

### Matrix Page:
- 🔴 Currently shows enrollment tree only (incorrect)
- 🔴 Should show BOTH trees (enrollment + matrix placement)
- 🔴 22 unplaced distributors need matrix placement

### Commission Calculation:
- ⚠️ Current system calculates enrollments only
- 🔴 Missing: Matrix depth override calculation
- 🔴 Missing: Insurance generational override calculation
- 🔴 Missing: Override access restrictions by rank

---

## 📅 IMPLEMENTATION PLAN

**See**: `COMPENSATION-PLAN-REBUILD-PROPOSAL.md`

**Timeline**: 30-44 days (6 phases)
**Blockers**: 6 executive conflicts must be resolved first

### Phase Summary:
1. **Documentation** (3-5 days) - Resolve conflicts, finalize specs
2. **Insurance Ladder** (7-10 days) - Implement ranks, rollup, overrides
3. **Tech Ladder** (7-10 days) - Implement matrix, placement, overrides
4. **UI Rebuild** (5-7 days) - Matrix page, dashboard, reports
5. **Testing** (5-7 days) - Unit, integration, E2E tests
6. **Migration** (3-5 days) - Place existing members, verify data

---

## 🎓 KEY DEFINITIONS

### Downline Producer (Insurance)
"An agent in your organization who has submitted a minimum of $2,500/month in personal production for 2 consecutive months within their first 90 days."

### Matrix Parent (Tech)
The distributor under whom you are placed in the 5-wide forced matrix. May be different from your enroller if spillover occurred.

### Enrollment Tree (Both)
The unlimited-width tree of who recruited whom, tracked by `enroller_id`. Used for 30% direct enrollment overrides on tech products.

### Generational Tree (Insurance)
The unlimited-width tree of insurance agents, tracked by `sponsor_id`. Used for insurance overrides (15% Gen 1 down to 0.5% Gen 6).

### Placement Matrix (Tech)
The 5-wide forced matrix for tech products, tracked by `matrix_parent_id` and `matrix_position` (1-5).

---

## 🔗 RELATED DOCUMENTS

- Database Schema: See `src/db/schema/` (members, distributors, commissions tables)
- Matrix Page: `src/app/(dashboard)/matrix/page.tsx`
- Commission Calculation: `src/lib/commissions/` (needs rebuild)
- Rank Advancement: `src/lib/ranks/` (needs rebuild)

---

## ✅ NEXT STEPS

1. **IMMEDIATE**: Send `EXEC-QUESTIONS-COMP-CONFLICTS.md` to executives
2. **AWAITING**: Executive answers to 6 conflicts
3. **THEN**: Begin Phase 1 of implementation plan
4. **GOAL**: Complete rebuild in 30-44 days after answers received

---

## 📞 QUESTIONS?

This master index consolidates all compensation documentation. For specific details:
- Tech Products → `COMPENSATION-STRUCTURE-DIAGRAM.md`
- Insurance → `INSURANCE-COMP-PLAN-DIAGRAM.md`
- Conflicts → `EXEC-QUESTIONS-COMP-CONFLICTS.md`
- Implementation → `COMPENSATION-PLAN-REBUILD-PROPOSAL.md`
