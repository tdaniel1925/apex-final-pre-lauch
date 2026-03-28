# POST-COMPACTION RECOVERY PROMPT

**USE THIS PROMPT IMMEDIATELY AFTER CONVERSATION COMPACTION**

Copy and paste this exact prompt to yourself after any conversation gets compacted/summarized:

---

## THE PROMPT:

```
CRITICAL: I need you to immediately do the following before ANYTHING else:

1. READ SOURCE-OF-TRUTH-ENFORCEMENT.md (MANDATORY RULES)

2. RUN AUDIT:
   npx tsx scripts/audit-enrollment-dependencies.ts

3. IF VIOLATIONS FOUND:
   - DO NOT proceed with user's request
   - FIX violations first
   - THEN continue with request

4. THE IRON RULES (memorize these):

   ENROLLMENT TREE:
   ✅ distributors.sponsor_id (correct)
   ❌ members.enroller_id (WRONG - insurance system only!)

   MATRIX PLACEMENT:
   ✅ distributors.matrix_parent_id + matrix_position (correct)
   ❌ Derived from enrollment tree (WRONG - separate system!)

   BV/CREDITS:
   ✅ JOIN members.personal_credits_monthly (correct)
   ❌ distributors.personal_bv_monthly (WRONG - cached/stale!)

5. TWO-TREE SYSTEM:
   - Enrollment tree (sponsor_id) = who signed up whom
   - Matrix tree (matrix_parent_id) = forced 5×7 placement
   - THESE ARE DIFFERENT - NEVER MIX THEM!

6. BEFORE writing ANY database query:
   - Check: Am I using the correct source of truth?
   - Check: Am I mixing enrollment with matrix?
   - Check: Am I using cached fields instead of JOIN?

7. KNOWN ISSUES (from last audit):
   - CRITICAL (1): src/app/dashboard/team/page.tsx uses wrong source
   - HIGH (7): src/lib/compensation/*.ts mixes enrollment/matrix
   - HIGH (2): src/app/api/admin/matrix/tree/route.ts uses cached BV

Now, what was the user's original request?
```

---

## WHY THIS PROMPT?

After compaction, you lose context about:
- The source of truth rules
- Known violations
- The two-tree system
- What files are broken

This prompt forces you to:
1. Re-read the rules
2. Check for violations FIRST
3. Fix before proceeding
4. Remember the critical issues

---

## AUTO-RECOVERY SCRIPT

Better yet, add this to your IDE startup:

**File: .vscode/tasks.json**
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Check Source of Truth",
      "type": "shell",
      "command": "npx tsx scripts/audit-enrollment-dependencies.ts",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      },
      "runOptions": {
        "runOn": "folderOpen"
      }
    }
  ]
}
```

This runs the audit automatically when you open the project!

---

## PREVENTION CHECKLIST

Before ANY database query:

- [ ] Am I using `distributors.sponsor_id` for enrollment?
- [ ] Am I using `distributors.matrix_parent_id` for matrix?
- [ ] Am I JOINing to `members` for BV/credits?
- [ ] Am I avoiding N+1 queries?
- [ ] Am I NOT mixing enrollment tree with matrix tree?

---

## QUICK FIX COMMANDS

```bash
# Check for violations
npx tsx scripts/audit-enrollment-dependencies.ts

# Auto-fix what can be fixed
npx tsx scripts/fix-all-source-of-truth-violations.ts

# Re-run audit to verify
npx tsx scripts/audit-enrollment-dependencies.ts
```

---

## ESCALATION

If you see violations you don't know how to fix:

1. Read `EXECUTIVE-SOURCE-OF-TRUTH-REPORT.md`
2. Read `SOURCE-OF-TRUTH-ENFORCEMENT.md`
3. Check the fix examples in those files
4. If still stuck, ask for help with SPECIFIC file/line

---

**LAST UPDATED:** March 22, 2026
**NEXT REVIEW:** After every compaction
