# Insurance Placement System - Implementation Plan

**Date**: March 26, 2026
**Status**: 🚧 IN PROGRESS - Awaiting Review
**Priority**: HIGH

---

## 🎯 BUSINESS REQUIREMENTS

### Core Rules:
1. **Unlicensed sponsors CANNOT hold licensed agents**
   - Licensed agent signs up under unlicensed sponsor → Temporarily placed with Phil/Ahn
   - Returns to original sponsor when sponsor becomes licensed AND reaches Level 3

2. **Licensed sponsors below Level 3 CANNOT hold licensed recruits**
   - Licensed recruit → Temporarily placed with Phil/Ahn
   - Returns when sponsor reaches Level 3 (Sr. Associate - $25K 90-day premium)

3. **Round-robin placement** between Phil Resch and Ahn Doan
   - Count existing placements and alternate

4. **Corporate approval required** for ALL licensing status changes
   - User clicks "Change Status" → Creates pending request
   - Corporate reviews → Approves or rejects
   - Only approved changes trigger placement logic

5. **Historical commissions stay with Phil/Ahn**
   - No retroactive transfers when agent returns to original sponsor

---

## 📊 DATABASE SCHEMA (✅ COMPLETED)

### New Table: `insurance_placement_change_requests`
```sql
- id (uuid, primary key)
- agent_id (uuid) - Member whose placement is changing
- requested_by (uuid) - Who initiated request
- request_type ('license_status_change' | 'return_to_sponsor' | 'manual_placement')
- current_status (text) - Current licensing_status
- proposed_status (text) - Proposed licensing_status
- current_enroller_id (uuid) - Current insurance parent
- proposed_enroller_id (uuid) - Proposed insurance parent
- reason (text) - Explanation
- documentation_url (text) - License docs
- status ('pending' | 'approved' | 'rejected')
- reviewed_by (uuid) - Admin who reviewed
- reviewed_at (timestamptz)
- rejection_reason (text)
- created_at, updated_at
```

### Modified Table: `insurance_agents`
```sql
NEW FIELDS:
- original_enroller_id (uuid) - Who they'll return to
- temporary_placement (boolean) - Are they with Phil/Ahn?
- temporary_placement_reason (text) - Why?
- placed_with_fallback_at (timestamptz) - When?
```

### New Table: `system_settings`
```sql
- key (text, primary key)
- value (jsonb)
- description (text)

INITIAL RECORD:
key: 'insurance_fallback_placement'
value: {"last_assigned": null, "phil_count": 0, "ahn_count": 0}
```

---

## 🔄 WORKFLOW DIAGRAMS

### Scenario 1: Rep Requests to Become Licensed
```
User Profile
  ↓
[Change Licensing Status] button clicked
  ↓
Modal: "Are you licensed?"
  ↓
User selects "Yes, I am licensed" + uploads docs
  ↓
❌ NO IMMEDIATE UPDATE
  ↓
Create insurance_placement_change_requests record:
  - agent_id: user's member_id
  - requested_by: user's member_id
  - request_type: 'license_status_change'
  - current_status: 'non_licensed'
  - proposed_status: 'licensed'
  - status: 'pending'
  ↓
Email sent to corporate admins
  ↓
Show user: "Your request has been submitted for review"
  ↓

ADMIN REVIEWS:
  ↓
Admin Dashboard → Placement Requests tab
  ↓
Review docs → [Approve] or [Reject]
  ↓

IF APPROVED:
  1. Update distributors.licensing_status = 'licensed'
  2. Update distributors.licensing_verified = true
  3. Check if sponsor is licensed
     ├─ YES → Check if sponsor is Level 3+
     │    ├─ YES → Place under sponsor normally
     │    └─ NO → Temp place under Phil/Ahn (round-robin)
     └─ NO → Temp place under Phil/Ahn (round-robin)
  4. Update insurance_placement_change_requests.status = 'approved'
  5. Send approval email to user

IF REJECTED:
  1. Update insurance_placement_change_requests.status = 'rejected'
  2. Send rejection email with reason
```

### Scenario 2: Sponsor Reaches Level 3 (Sr. Associate)
```
System detects rank change:
  distributors.insurance_rank = 'sr_associate'
  ↓
Find all agents where:
  - insurance_agents.original_enroller_id = sponsor_id
  - insurance_agents.temporary_placement = true
  ↓
For each agent:
  1. Create insurance_placement_change_requests:
     - request_type: 'return_to_sponsor'
     - proposed_enroller_id: sponsor_id (original)
     - status: 'pending'
  2. Email corporate admins
  ↓

ADMIN REVIEWS:
  ↓
[Approve Return to Sponsor]
  ↓
  1. Move agent: insurance_agents.insurance_enroller_id = original_enroller_id
  2. Clear temp flags:
     - temporary_placement = false
     - original_enroller_id = null
     - temporary_placement_reason = null
  3. Send email to sponsor: "Your agent [Name] has returned!"
  4. Send email to agent: "You've been placed with [Sponsor Name]"
```

### Scenario 3: Licensed Rep Recruits Licensed Agent (But Below Level 3)
```
New licensed agent signs up
  ↓
System checks sponsor:
  - Is sponsor licensed? YES
  - Is sponsor Level 3+? NO (Pre-Associate, Associate, or Agent)
  ↓
Auto-create placement request:
  - request_type: 'manual_placement'
  - proposed_enroller_id: Phil or Ahn (round-robin)
  - reason: 'Sponsor below Level 3'
  ↓
Email corporate admins
  ↓

ADMIN APPROVES:
  ↓
  1. Place agent under Phil/Ahn
  2. Set insurance_agents fields:
     - insurance_enroller_id = phil_or_ahn_id
     - original_enroller_id = sponsor_id
     - temporary_placement = true
     - temporary_placement_reason = 'sponsor_below_level_3'
  3. Send notifications
```

---

## 🛠️ IMPLEMENTATION CHECKLIST

### Phase 1: Database & Core Logic ✅
- [x] Create migration for placement system
- [ ] Run migration on Supabase
- [ ] Find Phil Resch and Ahn Doan member IDs
- [ ] Test round-robin logic

### Phase 2: API Changes
- [ ] Modify `/api/profile/licensing-status/route.ts`:
  - Change from direct update to create request
  - Return pending status
- [ ] Create `/api/admin/insurance-placement-requests/route.ts`:
  - GET: List all requests (admin only)
  - POST: Approve/reject request
- [ ] Create `/api/admin/insurance-placement-requests/[id]/approve/route.ts`:
  - Approve request
  - Execute placement logic
  - Send notifications
- [ ] Create `/api/admin/insurance-placement-requests/[id]/reject/route.ts`:
  - Reject request
  - Send notification with reason

### Phase 3: Placement Logic Service
- [ ] Create `src/lib/insurance/placement-service.ts`:
  ```typescript
  - getRoundRobinFallbackAgent()
  - placeAgentTemporarily()
  - returnAgentToSponsor()
  - checkSponsorEligibility()
  ```

### Phase 4: Admin Interface
- [ ] Create admin page: `/src/app/admin/insurance-placement-requests/page.tsx`
- [ ] Components:
  - Request list with filters (pending/approved/rejected)
  - Request detail modal
  - Approve/reject buttons
  - Document viewer for license uploads
- [ ] Add nav link to admin sidebar

### Phase 5: User Interface Updates
- [ ] Modify `LicensingStatusManager.tsx`:
  - Show "Request pending" state
  - Disable button while request pending
- [ ] Add status badge: "License Verification Pending"
- [ ] Show rejection reason if rejected

### Phase 6: Background Jobs
- [ ] Create cron job: `/api/cron/check-level-3-promotions/route.ts`
  - Runs daily
  - Finds new Level 3 promotions
  - Creates return requests
  - Sends admin notifications

### Phase 7: Notifications
- [ ] Email template: License request submitted (to user)
- [ ] Email template: License request approved (to user)
- [ ] Email template: License request rejected (to user)
- [ ] Email template: New placement request (to admins)
- [ ] Email template: Agent returned to sponsor (to sponsor)
- [ ] Email template: You've been placed with sponsor (to agent)

### Phase 8: Testing
- [ ] Test: User requests license → Admin approves → Placement logic
- [ ] Test: User requests license → Admin rejects → No changes
- [ ] Test: Sponsor reaches Level 3 → Agents return
- [ ] Test: Round-robin alternates correctly
- [ ] Test: Historical commissions stay with Phil/Ahn

---

## 🎨 UI MOCKUPS

### User View: License Request Pending
```
┌──────────────────────────────────────┐
│ Licensing Status                     │
├──────────────────────────────────────┤
│ Current Status: Non-Licensed         │
│                                      │
│ 📋 License Request Pending Review    │
│                                      │
│ Your request to become licensed has  │
│ been submitted and is awaiting       │
│ corporate approval.                  │
│                                      │
│ Submitted: Mar 26, 2026             │
│ Status: Pending                      │
│                                      │
│ [View Request Details]               │
└──────────────────────────────────────┘
```

### Admin View: Placement Requests List
```
┌──────────────────────────────────────────────────────────────┐
│ Insurance Placement Requests                    [Filters ▼]  │
├──────────────────────────────────────────────────────────────┤
│ ● PENDING (5)   ○ APPROVED (23)   ○ REJECTED (2)           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ John Doe - License Status Change                           │
│ Requested: Mar 26, 2026  │  Type: Become Licensed          │
│ [View Docs] [Approve] [Reject]                             │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ Sarah Smith - Return to Sponsor                            │
│ Requested: Mar 26, 2026  │  Sponsor reached Level 3        │
│ [Review] [Approve] [Reject]                                │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚨 CRITICAL CONSIDERATIONS

### Security:
- ✅ Only admins can approve/reject requests
- ✅ Users can only create requests for themselves
- ✅ RLS policies enforce data isolation
- ✅ Service client used for admin operations

### Performance:
- ✅ Indexes on status, agent_id, created_at
- ✅ Background job runs daily (not per-request)
- ✅ Round-robin uses cached count (not full table scan)

### Data Integrity:
- ✅ Foreign keys with CASCADE delete
- ✅ Check constraints on status/type enums
- ✅ Trigger for updated_at timestamps

### Edge Cases:
- What if Phil/Ahn are deleted? → Should be permanent system accounts
- What if sponsor downgrades from Level 3? → Keep agent with them (no auto-return)
- What if user submits multiple requests? → Allow, but show "pending request exists"
- What if admin approves stale request? → Check current status before applying

---

## 📝 NEXT STEPS

1. **Review this plan** - Does it match your business requirements?
2. **Run the migration** - Apply database changes
3. **Find Phil/Ahn IDs** - Need their member_id values
4. **Begin Phase 2** - Modify APIs

**Questions for you:**
1. Should we limit users to 1 pending request at a time?
2. What should happen if sponsor downgrades from Level 3? Keep agent or move back to Phil/Ahn?
3. Do Phil and Ahn need special "fallback agent" role in the system?
4. Should there be an expiration on pending requests (e.g., auto-reject after 30 days)?

---

**Ready to proceed with implementation?**
