# 🚨 SINGLE SOURCE OF TRUTH: Enrollment Hierarchy

**LAST UPDATED:** 2026-03-22
**CRITICAL DOCUMENT** - Read before working on team/genealogy features

---

## ⚠️ THE PROBLEM

This system has **TWO separate hierarchical trees** in the database:

1. **ENROLLMENT TREE** (`sponsor_id`) - Who enrolled whom
2. **PLACEMENT TREE** (`matrix_parent_id`) - Forced matrix placement (legacy)

**These trees contain DIFFERENT data and will cause inconsistencies if mixed.**

---

## ✅ THE RULE (NON-NEGOTIABLE)

### **ALWAYS use `sponsor_id` for:**
- ✅ Team page display
- ✅ Genealogy tree display
- ✅ Matrix view display
- ✅ Compensation calculations
- ✅ Override calculations
- ✅ Downline statistics
- ✅ Any "who enrolled whom" queries

### **NEVER use `matrix_parent_id` for:**
- ❌ Team display
- ❌ Genealogy display
- ❌ Compensation calculations
- ❌ Any user-facing hierarchy

### **Only use `matrix_parent_id` for:**
- ⚠️ Admin forced placement tools (if needed)
- ⚠️ Legacy matrix position tracking (read-only)

---

## 📊 EXAMPLE OF THE DIFFERENCE

### Real Data from Production:

```sql
-- Charles Potter
sponsor_id: 529723da-b55c-4c54-a724-245488d4625f (apex-vision) ✓
matrix_parent_id: 2a4e222e-8d30-4bd4-8bdd-b40247a4702a (someone else) ✗

-- Donna Potter
sponsor_id: 712a4dbf-7397-4fe6-8fcf-8a9a51172858 (Charles) ✓
matrix_parent_id: 529723da-b55c-4c54-a724-245488d4625f (apex-vision) ✗
```

### What Users Should See:
```
apex-vision
└── Charles Potter (enrolled by apex-vision)
    └── Donna Potter (enrolled by Charles)
```

### What `matrix_parent_id` Would Show (WRONG):
```
apex-vision
├── Donna Potter (directly under apex-vision - WRONG!)
└── (Charles is elsewhere in tree - WRONG!)
```

---

## 🔍 HOW THE BUG HAPPENED

**March 22, 2026** - Matrix API was accidentally using `matrix_parent_id`:

```typescript
// WRONG CODE (caused the bug)
const { data } = await supabase
  .from('distributors')
  .eq('matrix_parent_id', parentId) // ❌ WRONG TREE
```

**Result:** Matrix showed Charles NOT under apex-vision, Donna NOT under Charles

**Fix:**
```typescript
// CORRECT CODE
const { data } = await supabase
  .from('distributors')
  .eq('sponsor_id', parentId) // ✅ CORRECT TREE
```

---

## 🛡️ ENFORCEMENT MECHANISMS

### 1. **Automated Tests**
Location: `tests/integration/source-of-truth.test.ts`

Runs on every CI/CD build. Verifies:
- ✅ Charles Potter appears under apex-vision
- ✅ Donna Potter appears under Charles
- ✅ Matrix API returns same data as Team page
- ✅ No queries use matrix_parent_id for display

### 2. **Pre-Commit Hook**
Location: `.husky/check-source-of-truth.js`

Scans staged files for forbidden patterns:
- Blocks commits with `.eq('matrix_parent_id')`
- Blocks commits with `.in('matrix_parent_id')`
- Allows exceptions for admin placement tools only

### 3. **Code Comments**
All team hierarchy code has inline warnings:
```typescript
// CRITICAL: Use sponsor_id NOT matrix_parent_id!
// See: SINGLE-SOURCE-OF-TRUTH.md
```

### 4. **This Documentation**
You're reading it. Reference it before writing any hierarchy code.

---

## 📝 CORRECT QUERY PATTERNS

### ✅ Get Direct Enrollees (Level 1)
```typescript
const { data } = await supabase
  .from('distributors')
  .select('*')
  .eq('sponsor_id', parentDistributorId) // ✓ CORRECT
  .eq('status', 'active');
```

### ✅ Get Grandchildren (Level 2)
```typescript
const { data } = await supabase
  .from('distributors')
  .select('*')
  .in('sponsor_id', level1Ids) // ✓ CORRECT
  .eq('status', 'active');
```

### ✅ Recursive Downline Query
```typescript
async function getAllEnrollees(sponsorId: string) {
  // Use sponsor_id recursively
  const { data: level1 } = await supabase
    .from('distributors')
    .select('*')
    .eq('sponsor_id', sponsorId); // ✓ CORRECT

  // Then recurse on each enrollee
  for (const enrollee of level1) {
    const children = await getAllEnrollees(enrollee.id);
    // ... process children
  }
}
```

### ❌ WRONG PATTERNS (DO NOT USE)
```typescript
// ❌ WRONG - Uses placement tree
.eq('matrix_parent_id', parentId)

// ❌ WRONG - Uses placement tree
.in('matrix_parent_id', parentIds)

// ❌ WRONG - Filters by placement
.filter('matrix_parent_id', 'eq', parentId)
```

---

## 🎯 WHERE THIS APPLIES

### Pages That MUST Use `sponsor_id`:
- ✅ `/dashboard/team` - Team page
- ✅ `/dashboard/genealogy` - Genealogy tree
- ✅ `/dashboard/matrix` - Matrix view (old)
- ✅ `/dashboard/matrix-v2` - Matrix view (new)
- ✅ `/dashboard/compensation/*` - All compensation pages

### API Routes That MUST Use `sponsor_id`:
- ✅ `/api/team/*`
- ✅ `/api/genealogy/*`
- ✅ `/api/matrix/hybrid` (new)
- ✅ `/api/admin/matrix/tree` (read-only display)
- ✅ Any route that calculates overrides or commissions

### Components That MUST Use `sponsor_id`:
- ✅ `<TeamMemberCard />`
- ✅ `<GenealogyTree />`
- ✅ `<HybridMatrixView />`
- ✅ Any component showing team hierarchy

---

## 🚨 IF YOU'RE UNSURE

**Ask yourself:**
> "Am I showing who enrolled whom?"

**If YES:** Use `sponsor_id`
**If NO:** You probably still need `sponsor_id`

**If you think you need `matrix_parent_id`:**
1. Stop
2. Read this document again
3. Ask: "Why do I think I need the placement tree?"
4. Discuss with team lead

---

## 📞 CONTACT

**Issue Date:** March 22, 2026
**Reported By:** User (Charles/Donna Potter inconsistency)
**Fixed By:** Claude Code Agent
**Commit:** 7fd8a3a

**Questions?** Reference:
- This document
- `tests/integration/source-of-truth.test.ts`
- Git commit `7fd8a3a` for detailed history

---

## ✅ CHECKLIST FOR NEW CODE

Before committing any code that queries the `distributors` table:

- [ ] Does it show team hierarchy? → Use `sponsor_id`
- [ ] Does it calculate compensation? → Use `sponsor_id`
- [ ] Does it show "who enrolled whom"? → Use `sponsor_id`
- [ ] Have I checked NO `matrix_parent_id` queries exist?
- [ ] Have I run `npm test` (includes source of truth tests)?
- [ ] Have I read this document?

**If all checked:** You're good to commit ✅

---

**🔒 This is a CRITICAL system integrity rule. Violations cause data inconsistency bugs.**
