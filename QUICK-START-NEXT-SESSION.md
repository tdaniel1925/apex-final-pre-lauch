# 🚀 Quick Start - Next Session

**Read this first, then see COMPANY-EVENTS-HANDOFF.md for full details**

---

## ⚡ TL;DR

Building admin-managed company events system. 70% done. Need to finish UI forms and tests.

---

## 📂 What Exists

```
✅ Database: supabase/migrations/20260319000010_company_events_system.sql
✅ API: src/app/api/admin/events/route.ts (GET, POST)
✅ API: src/app/api/admin/events/[id]/route.ts (GET, PATCH, DELETE)
✅ API: src/app/api/autopilot/events/route.ts (distributor view)
✅ Tests: tests/unit/api/admin-events.test.ts (22/22 passing)
✅ UI: src/app/admin/events/page.tsx (list view)
✅ Config: BV tracking added to autopilot-products.ts
```

---

## 🎯 Next 3 Tasks

### 1. Create Event Form (NEW)
**File**: `src/app/admin/events/new/page.tsx`

Copy the validation schema from `src/app/api/admin/events/route.ts` lines 17-66.

Use React Hook Form + Zod. Fields needed:
- event_name, event_type, event_description
- event_date_time (date picker), event_duration_minutes, event_timezone
- location_type (radio), venue fields OR virtual meeting fields
- requires_registration, max_attendees, rsvp_deadline
- invitation templates (subject, body, reminder, confirmation)
- status, is_featured, is_public, visible_to_ranks
- display_order, internal_notes, tags

### 2. Create Event Form (EDIT)
**File**: `src/app/admin/events/[id]/page.tsx`

Same as #1 but:
- Fetch event data on load: `GET /api/admin/events/{id}`
- Pre-populate form
- Submit to: `PATCH /api/admin/events/{id}`

### 3. Find & Update Invitation Form
**Search for**: "meeting_invitations" or "invite" in `src/app/`

Add:
- Radio: "Custom Meeting" or "Company Event"
- If Company Event: dropdown fetching `/api/autopilot/events`
- Pre-fill templates from selected event

---

## 🧪 Then Test

**Create**: `e2e/admin-events.spec.ts`

5 tests:
1. Admin creates event
2. Admin edits event
3. Admin deletes event
4. Distributor sees available events
5. Distributor can't see admin-only events

---

## 🔥 Copy-Paste Prompt

```
Continue the Company Events System build. I need:

1. Create src/app/admin/events/new/page.tsx - event creation form
   - Use validation schema from src/app/api/admin/events/route.ts
   - POST to /api/admin/events
   - Redirect to /admin/events on success

2. Create src/app/admin/events/[id]/page.tsx - event edit form
   - Fetch from GET /api/admin/events/{id}
   - PATCH to /api/admin/events/{id}
   - Same fields as new form

3. Find the meeting invitation form and add company event selection
   - Radio to choose "Custom" or "Company Event"
   - If Company Event: dropdown from /api/autopilot/events
   - Pre-fill templates from event

4. Write e2e/admin-events.spec.ts with 5 tests

Reference files:
- API: src/app/api/admin/events/route.ts
- List UI: src/app/admin/events/page.tsx
- Migration: supabase/migrations/20260319000010_company_events_system.sql

Use React Hook Form, Zod, shadcn/ui components.
```

---

## 📋 Current Branch

`feature/apex-lead-autopilot`

---

## ✅ Quick Checklist

- [ ] Event creation form
- [ ] Event edit form
- [ ] Invitation form update
- [ ] 5 E2E tests
- [ ] Apply database migration
- [ ] Manual test flow
- [ ] Update Stripe price (manual - see STRIPE-PRICING-UPDATE-GUIDE.md)

---

**Full details**: See COMPANY-EVENTS-HANDOFF.md
