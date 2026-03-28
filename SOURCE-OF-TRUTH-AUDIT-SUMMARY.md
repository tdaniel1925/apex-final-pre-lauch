# Source of Truth Audit Summary

**Generated:** 3/22/2026, 3:44:56 AM

**Total Issues:** 62

## Severity Breakdown

- 🔴 **CRITICAL:** 1
- 🟠 **HIGH:** 9
- 🟡 **MEDIUM:** 52
- 🔵 **LOW:** 0

## Issues by Category

### Downline Counts (4 issues)

#### 1. MEDIUM: Using cached count field

**File:** `src\lib\types\index.ts:104`

**Current Source:** Cached count column

**Correct Source:** COUNT query on distributors.sponsor_id

**Impact:** Count may be stale if not updated via trigger

**Code:**
```typescript
downline_count: number;
```

#### 2. MEDIUM: Using cached count field

**File:** `src\components\distributor\DistributorDetailsModal.tsx:43`

**Current Source:** Cached count column

**Correct Source:** COUNT query on distributors.sponsor_id

**Impact:** Count may be stale if not updated via trigger

**Code:**
```typescript
l1_count: number;
```

#### 3. MEDIUM: Using cached count field

**File:** `src\components\distributor\DistributorDetailsModal.tsx:295`

**Current Source:** Cached count column

**Correct Source:** COUNT query on distributors.sponsor_id

**Impact:** Count may be stale if not updated via trigger

**Code:**
```typescript
{details.team.l1_count}
```

#### 4. MEDIUM: Using cached count field

**File:** `src\app\api\distributor\[id]\details\route.ts:177`

**Current Source:** Cached count column

**Correct Source:** COUNT query on distributors.sponsor_id

**Impact:** Count may be stale if not updated via trigger

**Code:**
```typescript
l1_count: l1Count,
```

### Data Flow (48 issues)

#### 1. MEDIUM: Querying autopilot_subscriptions table 4 times in same file

**File:** `src\lib\stripe\autopilot-helpers.ts:1`

**Current Source:** 4 separate queries to autopilot_subscriptions

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('autopilot_subscriptions') appears 4 times
```

#### 2. MEDIUM: Querying members table 6 times in same file

**File:** `src\lib\matrix\placement-algorithm.ts:1`

**Current Source:** 6 separate queries to members

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('members') appears 6 times
```

#### 3. MEDIUM: Querying smartoffice_agents table 10 times in same file

**File:** `src\lib\smartoffice\sync-service.ts:1`

**Current Source:** 10 separate queries to smartoffice_agents

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('smartoffice_agents') appears 10 times
```

#### 4. MEDIUM: Querying smartoffice_policies table 4 times in same file

**File:** `src\lib\smartoffice\sync-service.ts:1`

**Current Source:** 4 separate queries to smartoffice_policies

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('smartoffice_policies') appears 4 times
```

#### 5. MEDIUM: Querying smartoffice_sync_logs table 4 times in same file

**File:** `src\lib\smartoffice\sync-service.ts:1`

**Current Source:** 4 separate queries to smartoffice_sync_logs

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('smartoffice_sync_logs') appears 4 times
```

#### 6. MEDIUM: Querying distributors table 6 times in same file

**File:** `src\lib\genealogy\tree-service.ts:1`

**Current Source:** 6 separate queries to distributors

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('distributors') appears 6 times
```

#### 7. MEDIUM: Querying distributors table 4 times in same file

**File:** `src\lib\enrollees\enrollee-counter.ts:1`

**Current Source:** 4 separate queries to distributors

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('distributors') appears 4 times
```

#### 8. MEDIUM: Querying autopilot_subscriptions table 6 times in same file

**File:** `src\lib\db\autopilot-subscription-queries.ts:1`

**Current Source:** 6 separate queries to autopilot_subscriptions

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('autopilot_subscriptions') appears 6 times
```

#### 9. MEDIUM: Querying email_campaigns table 5 times in same file

**File:** `src\lib\email\campaign-service.ts:1`

**Current Source:** 5 separate queries to email_campaigns

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('email_campaigns') appears 5 times
```

#### 10. MEDIUM: Querying distributors table 15 times in same file

**File:** `src\lib\admin\matrix-manager.ts:1`

**Current Source:** 15 separate queries to distributors

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('distributors') appears 15 times
```

#### 11. MEDIUM: Querying distributors table 4 times in same file

**File:** `src\lib\admin\entity-resolver.ts:1`

**Current Source:** 4 separate queries to distributors

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('distributors') appears 4 times
```

#### 12. MEDIUM: Querying distributors table 11 times in same file

**File:** `src\lib\admin\distributor-service.ts:1`

**Current Source:** 11 separate queries to distributors

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('distributors') appears 11 times
```

#### 13. MEDIUM: Querying distributors table 7 times in same file

**File:** `src\lib\admin\command-executor.ts:1`

**Current Source:** 7 separate queries to distributors

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('distributors') appears 7 times
```

#### 14. MEDIUM: Querying distributor_activity_log table 4 times in same file

**File:** `src\lib\admin\command-executor.ts:1`

**Current Source:** 4 separate queries to distributor_activity_log

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('distributor_activity_log') appears 4 times
```

#### 15. MEDIUM: Querying distributors table 4 times in same file

**File:** `src\lib\admin\ai-database-access.ts:1`

**Current Source:** 4 separate queries to distributors

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('distributors') appears 4 times
```

#### 16. MEDIUM: Querying distributors table 4 times in same file

**File:** `src\components\dashboard\Road500Banner.tsx:1`

**Current Source:** 4 separate queries to distributors

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('distributors') appears 4 times
```

#### 17. MEDIUM: Querying distributors table 7 times in same file

**File:** `src\app\admin\page.tsx:1`

**Current Source:** 7 separate queries to distributors

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('distributors') appears 7 times
```

#### 18. MEDIUM: Querying distributor_replicated_sites table 6 times in same file

**File:** `src\lib\integrations\user-sync\service.ts:1`

**Current Source:** 6 separate queries to distributor_replicated_sites

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('distributor_replicated_sites') appears 6 times
```

#### 19. MEDIUM: Querying reps table 6 times in same file

**File:** `src\lib\compensation\_OLD_BACKUP\commission-run.ts:1`

**Current Source:** 6 separate queries to reps

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('reps') appears 6 times
```

#### 20. MEDIUM: Querying cab_records table 4 times in same file

**File:** `src\lib\compensation\_OLD_BACKUP\commission-run.ts:1`

**Current Source:** 4 separate queries to cab_records

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('cab_records') appears 4 times
```

#### 21. MEDIUM: Querying commission_runs table 4 times in same file

**File:** `src\lib\compensation\_OLD_BACKUP\commission-run.ts:1`

**Current Source:** 4 separate queries to commission_runs

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('commission_runs') appears 4 times
```

#### 22. MEDIUM: Querying cab_records table 9 times in same file

**File:** `src\lib\compensation\_OLD_BACKUP\cab-state-machine.ts:1`

**Current Source:** 9 separate queries to cab_records

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('cab_records') appears 9 times
```

#### 23. MEDIUM: Querying subscriptions table 6 times in same file

**File:** `src\lib\compensation\_OLD_BACKUP\cab-state-machine.ts:1`

**Current Source:** 6 separate queries to subscriptions

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('subscriptions') appears 6 times
```

#### 24. MEDIUM: Querying reps table 4 times in same file

**File:** `src\lib\compensation\_OLD_BACKUP\bonuses.ts:1`

**Current Source:** 4 separate queries to reps

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('reps') appears 4 times
```

#### 25. MEDIUM: Querying distributors table 10 times in same file

**File:** `src\app\api\signup\route.ts:1`

**Current Source:** 10 separate queries to distributors

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('distributors') appears 10 times
```

#### 26. MEDIUM: Querying distributors table 5 times in same file

**File:** `src\app\dashboard\matrix\[id]\page.tsx:1`

**Current Source:** 5 separate queries to distributors

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('distributors') appears 5 times
```

#### 27. MEDIUM: Querying training_progress table 4 times in same file

**File:** `src\app\api\training\progress\route.ts:1`

**Current Source:** 4 separate queries to training_progress

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('training_progress') appears 4 times
```

#### 28. MEDIUM: Querying training_streaks table 4 times in same file

**File:** `src\app\api\training\progress\route.ts:1`

**Current Source:** 4 separate queries to training_streaks

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('training_streaks') appears 4 times
```

#### 29. MEDIUM: Querying training_subscriptions table 5 times in same file

**File:** `src\app\api\training\subscription\route.ts:1`

**Current Source:** 5 separate queries to training_subscriptions

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('training_subscriptions') appears 5 times
```

#### 30. MEDIUM: Querying distributors table 4 times in same file

**File:** `src\app\api\dashboard\matrix-position\route.ts:1`

**Current Source:** 4 separate queries to distributors

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('distributors') appears 4 times
```

#### 31. MEDIUM: Querying event_flyers table 4 times in same file

**File:** `src\app\api\autopilot\flyers\route.ts:1`

**Current Source:** 4 separate queries to event_flyers

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('event_flyers') appears 4 times
```

#### 32. MEDIUM: Querying meeting_events table 5 times in same file

**File:** `src\app\api\rep\meetings\[id]\route.ts:1`

**Current Source:** 5 separate queries to meeting_events

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('meeting_events') appears 5 times
```

#### 33. MEDIUM: Querying distributors table 6 times in same file

**File:** `src\app\api\distributor\[id]\details\route.ts:1`

**Current Source:** 6 separate queries to distributors

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('distributors') appears 6 times
```

#### 34. MEDIUM: Querying crm_pipeline table 4 times in same file

**File:** `src\app\api\autopilot\crm\pipeline\route.ts:1`

**Current Source:** 4 separate queries to crm_pipeline

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('crm_pipeline') appears 4 times
```

#### 35. MEDIUM: Querying smartoffice_agents table 6 times in same file

**File:** `src\app\api\admin\smartoffice\reports\route.ts:1`

**Current Source:** 6 separate queries to smartoffice_agents

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('smartoffice_agents') appears 6 times
```

#### 36. MEDIUM: Querying smartoffice_policies table 4 times in same file

**File:** `src\app\api\admin\smartoffice\reports\route.ts:1`

**Current Source:** 4 separate queries to smartoffice_policies

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('smartoffice_policies') appears 4 times
```

#### 37. MEDIUM: Querying distributors table 6 times in same file

**File:** `src\app\api\admin\matrix\tree\route.ts:1`

**Current Source:** 6 separate queries to distributors

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('distributors') appears 6 times
```

#### 38. MEDIUM: Querying company_events table 6 times in same file

**File:** `src\app\api\admin\events\[id]\route.ts:1`

**Current Source:** 6 separate queries to company_events

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('company_events') appears 6 times
```

#### 39. MEDIUM: Querying distributors table 5 times in same file

**File:** `src\app\api\admin\matrix\create-and-place\route.ts:1`

**Current Source:** 5 separate queries to distributors

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('distributors') appears 5 times
```

#### 40. MEDIUM: Querying integrations table 5 times in same file

**File:** `src\app\api\admin\integrations\[id]\route.ts:1`

**Current Source:** 5 separate queries to integrations

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('integrations') appears 5 times
```

#### 41. MEDIUM: Querying business_card_templates table 4 times in same file

**File:** `src\app\api\admin\business-card-templates\[id]\route.ts:1`

**Current Source:** 4 separate queries to business_card_templates

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('business_card_templates') appears 4 times
```

#### 42. MEDIUM: Querying social_posts table 5 times in same file

**File:** `src\app\api\autopilot\social\posts\[id]\route.ts:1`

**Current Source:** 5 separate queries to social_posts

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('social_posts') appears 5 times
```

#### 43. MEDIUM: Querying crm_contacts table 4 times in same file

**File:** `src\app\api\autopilot\crm\contacts\[id]\route.ts:1`

**Current Source:** 4 separate queries to crm_contacts

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('crm_contacts') appears 4 times
```

#### 44. MEDIUM: Querying distributors table 6 times in same file

**File:** `src\app\api\admin\prospects\[id]\convert\route.ts:1`

**Current Source:** 6 separate queries to distributors

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('distributors') appears 6 times
```

#### 45. MEDIUM: Querying integration_product_mappings table 4 times in same file

**File:** `src\app\api\admin\integrations\product-mappings\[id]\route.ts:1`

**Current Source:** 4 separate queries to integration_product_mappings

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('integration_product_mappings') appears 4 times
```

#### 46. MEDIUM: Querying social_posts table 5 times in same file

**File:** `src\app\api\autopilot\social\posts\[id]\post-now\route.ts:1`

**Current Source:** 5 separate queries to social_posts

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('social_posts') appears 5 times
```

#### 47. MEDIUM: Querying training_shares table 4 times in same file

**File:** `src\app\api\autopilot\team\training\shared\[id]\route.ts:1`

**Current Source:** 4 separate queries to training_shares

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('training_shares') appears 4 times
```

#### 48. MEDIUM: Querying admin_notes table 4 times in same file

**File:** `src\app\api\admin\distributors\[id]\notes\[noteId]\route.ts:1`

**Current Source:** 4 separate queries to admin_notes

**Correct Source:** Single query with proper JOINs or data structure

**Impact:** N+1 query problem, poor performance

**Code:**
```typescript
from('admin_notes') appears 4 times
```

### Matrix Placement (7 issues)

#### 1. HIGH: Computing matrix placement from enrollment tree

**File:** `src\lib\compensation\override-resolution.ts:73`

**Current Source:** Derived from enroller_id

**Correct Source:** distributors.matrix_parent_id + matrix_position

**Impact:** Matrix and enrollment are separate - this will be wrong

**Code:**
```typescript
* @param matrixLevel - Position in matrix (1-5), only used if not enroller
```

#### 2. HIGH: Computing matrix placement from enrollment tree

**File:** `src\lib\compensation\override-resolution.ts:80`

**Current Source:** Derived from enroller_id

**Correct Source:** distributors.matrix_parent_id + matrix_position

**Impact:** Matrix and enrollment are separate - this will be wrong

**Code:**
```typescript
matrixLevel?: number
```

#### 3. HIGH: Computing matrix placement from enrollment tree

**File:** `src\lib\compensation\override-resolution.ts:88`

**Current Source:** Derived from enroller_id

**Correct Source:** distributors.matrix_parent_id + matrix_position

**Impact:** Matrix and enrollment are separate - this will be wrong

**Code:**
```typescript
level: isEnroller ? 1 : (matrixLevel ?? 0),
```

#### 4. HIGH: Computing matrix placement from enrollment tree

**File:** `src\lib\compensation\override-resolution.ts:190`

**Current Source:** Derived from enroller_id

**Correct Source:** distributors.matrix_parent_id + matrix_position

**Impact:** Matrix and enrollment are separate - this will be wrong

**Code:**
```typescript
* This traverses the matrix/enroller tree and calculates overrides for each level
```

#### 5. HIGH: Computing matrix placement from enrollment tree

**File:** `src\lib\compensation\override-resolution.ts:206`

**Current Source:** Derived from enroller_id

**Correct Source:** distributors.matrix_parent_id + matrix_position

**Impact:** Matrix and enrollment are separate - this will be wrong

**Code:**
```typescript
const matrixLevel = i + 1; // L1, L2, L3, L4, L5
```

#### 6. HIGH: Computing matrix placement from enrollment tree

**File:** `src\lib\compensation\override-resolution.ts:209`

**Current Source:** Derived from enroller_id

**Correct Source:** distributors.matrix_parent_id + matrix_position

**Impact:** Matrix and enrollment are separate - this will be wrong

**Code:**
```typescript
const result = calculateOverride(member, sale, isEnroller, matrixLevel);
```

#### 7. HIGH: Computing matrix placement from enrollment tree

**File:** `src\lib\compensation\override-calculator.ts:59`

**Current Source:** Derived from enroller_id

**Correct Source:** distributors.matrix_parent_id + matrix_position

**Impact:** Matrix and enrollment are separate - this will be wrong

**Code:**
```typescript
override_type: 'L1_enroller' | `L${number}_matrix`;
```

### Enrollment Tree (1 issues)

#### 1. CRITICAL: Using members.enroller_id for enrollment tree queries

**File:** `src\app\dashboard\team\page.tsx:119`

**Current Source:** members.enroller_id

**Correct Source:** distributors.sponsor_id

**Impact:** Enrollment counts and trees will be incorrect

**Code:**
```typescript
.from('members')
```

### BV/Credits (2 issues)

#### 1. HIGH: Using cached BV fields from distributors table

**File:** `src\app\api\admin\matrix\tree\route.ts:25`

**Current Source:** distributors.personal_bv_monthly

**Correct Source:** members.personal_credits_monthly (via JOIN)

**Impact:** Stale data if members table updated but distributors not synced

**Code:**
```typescript
personal_bv_monthly?: number | null;
```

#### 2. HIGH: Using cached BV fields from distributors table

**File:** `src\app\api\admin\matrix\tree\route.ts:26`

**Current Source:** distributors.personal_bv_monthly

**Correct Source:** members.personal_credits_monthly (via JOIN)

**Impact:** Stale data if members table updated but distributors not synced

**Code:**
```typescript
group_bv_monthly?: number | null;
```

## Source of Truth Rules

| Data Type | Correct Source | Wrong Sources |
|-----------|----------------|---------------|
| Enrollment Tree | `distributors.sponsor_id` | `members.enroller_id`, cached stats |
| Matrix Placement | `distributors.matrix_parent_id + matrix_position` | Derived from enrollment |
| User Identity | `distributors.auth_user_id` | Multiple lookups |
| Rep Numbers | `distributors.rep_number` | `members.rep_number` |
| BV/Credits | `members.personal_credits_monthly` | Cached in distributors |
| Downline Counts | `COUNT(distributors.sponsor_id)` | Cached count fields |

