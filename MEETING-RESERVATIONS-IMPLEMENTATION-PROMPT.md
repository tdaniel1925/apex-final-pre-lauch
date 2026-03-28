# 🎯 MEETING RESERVATIONS SYSTEM - COMPLETE IMPLEMENTATION PROMPT

**Project:** Apex Affinity Group - Meeting Reservations Feature
**Context:** Add event registration system to Autopilot where reps create meeting links that prospects register for
**URL Structure:** `reachtheapex.net/slug/register/meeting-slug` (NOT subdomain)
**Integration:** Must integrate with existing Autopilot dashboard system

---

## 📋 CRITICAL CONSTRAINTS & REQUIREMENTS

### **URL Structure (IMPORTANT)**
- ❌ **NOT:** `https://[slug].reachtheapex.net/register/[meeting-slug]` (subdomain)
- ✅ **CORRECT:** `https://reachtheapex.net/[slug]/register/[meeting-slug]`
- Example: `https://reachtheapex.net/john-smith/register/business-opportunity-webinar`

### **Existing Routing Pattern**
- Replicated sites: `src/app/[slug]/page.tsx` (already exists)
- Must create: `src/app/[slug]/register/[meetingSlug]/page.tsx`
- Reserved slugs to avoid: `api, admin, dashboard, login, signup, join, about, contact, terms, privacy, live, _next, favicon.ico`

### **Autopilot Integration**
- Autopilot dashboard: `src/app/dashboard/autopilot/page.tsx`
- Main component: `src/components/autopilot/AutopilotDashboard.tsx`
- Add "Meetings" tab to existing tabs: invitations, social, flyers, crm, team
- Follow existing patterns in `src/components/autopilot/` directory

### **Database Conventions**
- Use Supabase (already configured)
- Follow existing patterns in `supabase/migrations/` directory
- All tables must have RLS (Row Level Security) policies
- Service client for admin operations: `createServiceClient()`
- User client for rep operations: `createClient()`
- Naming convention: `snake_case` for tables/columns, `camelCase` for TypeScript

### **Dependencies Already Installed**
```json
{
  "resend": "^6.9.2",           // Email service (REQUIRED - use this, not @react-email/components)
  "date-fns": "^4.1.0",         // Date formatting
  "zod": "^4.3.6",              // Validation schemas
  "lucide-react": "^0.564.0",   // Icons
  "tailwindcss": "^4",          // Styling (no custom config needed)
  "@supabase/supabase-js": "^2.95.3",
  "@supabase/ssr": "^0.8.0"
}
```

**DO NOT add any new dependencies.** Use what's already installed.

---

## 🔍 DEPENDENCY RESEARCH CHECKLIST

Before writing ANY code, you MUST research and document the following:

### **1. Existing Database Schema**
- [ ] Read ALL migration files in `supabase/migrations/` directory
- [ ] Document existing tables: `distributors`, `autopilot_*`, `crm_contacts`, etc.
- [ ] Identify foreign key constraints and relationships
- [ ] Check for existing `updated_at` trigger functions
- [ ] Verify RLS policy patterns used in other tables

**Files to check:**
- `supabase/migrations/*.sql` (all migrations)
- `src/lib/supabase/server.ts` (client setup)
- `src/lib/supabase/service.ts` (service client setup)

### **2. Existing Routing Patterns**
- [ ] Study `src/app/[slug]/page.tsx` - how dynamic routes work
- [ ] Check if nested `[slug]/[something]` routes exist
- [ ] Verify reserved slug handling pattern
- [ ] Understand distributor lookup logic
- [ ] Check status handling (active, suspended, deleted)

**Files to check:**
- `src/app/[slug]/page.tsx` (replicated site routing)
- `src/lib/utils/slug.ts` (slug utilities)

### **3. Autopilot Dashboard Structure**
- [ ] Read `src/components/autopilot/AutopilotDashboard.tsx` completely
- [ ] Document existing tab structure and how tabs are added
- [ ] Check existing tab components (InvitationList, SocialPostsList, etc.)
- [ ] Identify shared UI patterns (cards, tables, modals, forms)
- [ ] Note state management patterns (useState, props drilling, etc.)

**Files to check:**
- `src/components/autopilot/AutopilotDashboard.tsx`
- `src/components/autopilot/InvitationList.tsx` (reference for list UI)
- `src/components/autopilot/SocialPostComposer.tsx` (reference for form modals)
- `src/components/autopilot/crm/ContactList.tsx` (reference for tables)

### **4. Email System**
- [ ] Check existing email templates in `src/lib/email/templates/`
- [ ] Read email sending service: `src/lib/services/resend-tracked.ts`
- [ ] Verify email domain: `@theapexway.net` (MANDATORY)
- [ ] Check template variable replacement pattern
- [ ] Verify base template usage

**Files to check:**
- `src/lib/email/templates/base-email-template.html` (MUST USE THIS)
- `src/lib/services/resend-tracked.ts` (email sending)
- `src/lib/email/template-variables.ts` (variable replacement)
- `CLAUDE.md` - lines 23-63 (EMAIL SYSTEM RULES - MANDATORY)

**CRITICAL EMAIL RULES (from CLAUDE.md):**
- ✅ ALWAYS use `@theapexway.net` domain
- ✅ ALWAYS use base template at `src/lib/email/templates/base-email-template.html`
- ✅ Professional tone, no emojis, navy blue (#2c5aa0), corporate style
- ✅ Use Resend SDK through `src/lib/services/resend-tracked.ts`
- ✅ ALWAYS check `result.error` before logging success
- ✅ Response structure: Access `result.data.id` (NOT `result.id`)

### **5. API Route Patterns**
- [ ] Study existing API routes in `src/app/api/`
- [ ] Check authentication patterns: `requireAuth()` or `getUser()`
- [ ] Identify error response format
- [ ] Note rate limiting patterns (if any)
- [ ] Check CORS handling for public endpoints

**Files to check:**
- `src/app/api/rep/*/route.ts` (rep API patterns)
- `src/lib/auth/admin.ts` (auth helpers)
- Any API route with `POST` method (reference for request handling)

### **6. TypeScript Type Patterns**
- [ ] Check existing type definitions in `src/lib/types.ts` or `src/types/`
- [ ] Identify naming conventions (interface vs type)
- [ ] Note optional vs required field patterns
- [ ] Check Date/timestamp handling (string vs Date object)

**Files to check:**
- `src/lib/types.ts` (if exists)
- Any `types/*.ts` files

### **7. Form Validation Patterns**
- [ ] Check existing Zod schemas (search for `z.object`)
- [ ] Identify validation error handling patterns
- [ ] Note form submission patterns (react-hook-form, manual, etc.)

**Files to check:**
- Search for `zod` import across codebase
- `src/components/forms/*.tsx` (form examples)

### **8. Testing Patterns**
- [ ] Check existing test files in `tests/` directory
- [ ] Identify test patterns (Vitest for unit, Playwright for E2E)
- [ ] Note mock patterns for Supabase client
- [ ] Check test data setup/teardown patterns

**Files to check:**
- `tests/unit/**/*.test.ts`
- `tests/e2e/**/*.spec.ts`

---

## 🏗️ IMPLEMENTATION REQUIREMENTS

### **Phase 1: Research & Planning (MANDATORY FIRST STEP)**

**You MUST complete this research phase BEFORE writing ANY code:**

1. **Create Research Report** (`MEETING-RESERVATIONS-RESEARCH.md`)
   ```markdown
   # Meeting Reservations - Dependency Research Report

   ## 1. Database Schema Analysis
   - Existing tables: [list]
   - Foreign key patterns: [document]
   - RLS policy patterns: [document]
   - Trigger patterns: [document]

   ## 2. Routing Patterns
   - Dynamic route structure: [explain]
   - Reserved slug handling: [document]
   - Nested route examples: [list]

   ## 3. Autopilot Dashboard Integration
   - Existing tabs: [list]
   - Tab addition pattern: [document]
   - State management: [explain]
   - Component structure: [diagram]

   ## 4. Email System
   - Email service: [document]
   - Template patterns: [explain]
   - Domain requirements: [list]
   - Variable replacement: [document]

   ## 5. API Patterns
   - Auth pattern: [document]
   - Error format: [show examples]
   - Rate limiting: [yes/no + pattern]

   ## 6. Type Patterns
   - Naming conventions: [document]
   - Date handling: [string or Date?]
   - Optional fields: [pattern]

   ## 7. Form Validation
   - Zod usage: [yes/no + examples]
   - Error handling: [pattern]

   ## 8. Testing Strategy
   - Unit test pattern: [document]
   - E2E test pattern: [document]
   - Mock patterns: [document]

   ## 9. Gaps & Concerns
   - Missing utilities: [list]
   - Potential conflicts: [list]
   - Unclear patterns: [list]
   ```

2. **Validate All Dependencies**
   - Confirm no new npm packages needed
   - Verify all file paths exist
   - Check TypeScript compiler for existing errors
   - Ensure test suites run

3. **Create File Map**
   ```markdown
   # Files to Create (18 total)

   ## Database (1 file)
   - [ ] supabase/migrations/20260322000001_meeting_reservations.sql

   ## Types (1 file)
   - [ ] src/types/meeting.ts

   ## API Routes (8 files)
   - [ ] src/app/api/rep/meetings/route.ts
   - [ ] src/app/api/rep/meetings/[id]/route.ts
   - [ ] src/app/api/rep/meetings/[id]/registrations/route.ts
   - [ ] src/app/api/rep/meetings/[id]/registrations/[regId]/route.ts
   - [ ] src/app/api/public/meetings/[id]/details/route.ts
   - [ ] src/app/api/public/meetings/[id]/register/route.ts

   ## Pages (1 file)
   - [ ] src/app/[slug]/register/[meetingSlug]/page.tsx

   ## Components (5 files)
   - [ ] src/components/autopilot/MeetingsTab.tsx
   - [ ] src/components/autopilot/CreateMeetingModal.tsx
   - [ ] src/components/autopilot/MeetingsList.tsx
   - [ ] src/components/autopilot/MeetingCard.tsx
   - [ ] src/components/autopilot/MeetingRegistrationForm.tsx

   ## Email Templates (4 files)
   - [ ] src/lib/email/templates/meeting-confirmation.html
   - [ ] src/lib/email/templates/meeting-reminder.html
   - [ ] src/lib/email/templates/meeting-new-registration.html
   - [ ] src/lib/email/templates/meeting-followup.html

   ## Utilities (2 files)
   - [ ] src/lib/validators/meeting-schemas.ts
   - [ ] src/lib/calendar/ics-generator.ts

   ## Tests (6 files)
   - [ ] tests/unit/meeting-api.test.ts
   - [ ] tests/unit/ics-generator.test.ts
   - [ ] tests/e2e/meeting-registration-flow.spec.ts
   ```

---

### **Phase 2: Database Schema**

**File:** `supabase/migrations/20260322000001_meeting_reservations.sql`

**Requirements:**
1. Create 2 tables: `meeting_events`, `meeting_registrations`
2. Follow existing migration patterns (comments, sections, RLS)
3. Use existing trigger patterns for `updated_at`
4. Include denormalized stats fields for performance
5. Add helper functions (slug generation, capacity check)
6. Write comprehensive comments for every table/column
7. Create proper indexes on foreign keys and date fields
8. Unique constraint on `(meeting_event_id, email)` for registrations

**Schema Requirements:**

`meeting_events`:
- `id` UUID primary key
- `distributor_id` UUID foreign key to `distributors(id)` ON DELETE CASCADE
- `title` TEXT not null
- `description` TEXT nullable
- `custom_message` TEXT nullable (rep's personal invitation)
- `event_date` DATE not null
- `event_time` TIME not null
- `event_timezone` TEXT default 'America/Chicago'
- `duration_minutes` INTEGER default 60
- `location_type` TEXT CHECK IN ('virtual', 'physical', 'hybrid')
- `virtual_link` TEXT nullable
- `physical_address`, `physical_city`, `physical_state`, `physical_zip` TEXT nullable
- `registration_slug` TEXT not null (unique per distributor)
- `status` TEXT CHECK IN ('draft', 'active', 'closed', 'completed', 'canceled')
- `max_attendees` INTEGER nullable (null = unlimited)
- `registration_deadline` TIMESTAMPTZ nullable
- `allow_questions` BOOLEAN default true
- `require_phone` BOOLEAN default true
- **Denormalized stats:**
  - `total_registered` INTEGER default 0
  - `total_confirmed` INTEGER default 0
  - `total_not_going` INTEGER default 0
  - `total_needs_followup` INTEGER default 0
  - `total_with_questions` INTEGER default 0
- `created_at`, `updated_at` TIMESTAMPTZ

`meeting_registrations`:
- `id` UUID primary key
- `meeting_event_id` UUID foreign key to `meeting_events(id)` ON DELETE CASCADE
- `distributor_id` UUID foreign key to `distributors(id)` ON DELETE CASCADE
- `first_name`, `last_name`, `email` TEXT not null
- `phone` TEXT nullable
- `has_questions` BOOLEAN default false
- `questions_text` TEXT nullable
- `status` TEXT CHECK IN ('confirmed', 'not_going', 'not_responded', 'follow_up', 'attended', 'no_show')
- `status_changed_at` TIMESTAMPTZ
- `confirmation_email_sent` BOOLEAN default false
- `reminder_email_sent` BOOLEAN default false
- `registered_at`, `updated_at` TIMESTAMPTZ

**RLS Policies:**
- Reps can view/edit only their own meetings
- Public can register (no auth required) via service client
- Admins can view all

**Triggers:**
- Update `updated_at` on both tables
- Update denormalized stats on `meeting_events` when registrations change

---

### **Phase 3: TypeScript Types**

**File:** `src/types/meeting.ts`

**Requirements:**
1. Match database schema exactly
2. Use `string` for dates (database returns ISO strings)
3. All fields must be explicitly typed (no `any`)
4. Create request/response types for API
5. Export all types

**Required Types:**
```typescript
export interface MeetingEvent { /* all fields from table */ }
export interface MeetingRegistration { /* all fields from table */ }
export interface CreateMeetingRequest { /* subset for creation */ }
export interface UpdateMeetingRequest { /* partial fields */ }
export interface PublicRegistrationRequest { /* registration form data */ }
export interface MeetingStats { /* aggregate stats */ }
```

---

### **Phase 4: Zod Validation Schemas**

**File:** `src/lib/validators/meeting-schemas.ts`

**Requirements:**
1. Use Zod (already installed: `^4.3.6`)
2. Create schemas for all API inputs
3. Include custom refinements for conditional validation
4. Match TypeScript types exactly

**Required Schemas:**
- `createMeetingSchema` - validates meeting creation
  - Refinement: If `location_type` is 'virtual' or 'hybrid', `virtual_link` is required
  - Refinement: If `location_type` is 'physical' or 'hybrid', `physical_address` is required
- `publicRegistrationSchema` - validates registration form
  - Phone optional unless meeting requires it
- `updateRegistrationStatusSchema` - validates status updates

---

### **Phase 5: API Routes - Rep Side**

**Authentication Pattern:**
```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Get distributor
const { data: distributor } = await supabase
  .from('distributors')
  .select('id')
  .eq('auth_user_id', user.id)
  .single();

if (!distributor) {
  return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
}
```

**Required Endpoints:**

1. **POST /api/rep/meetings**
   - Create new meeting
   - Generate unique slug using title
   - Return full meeting object with `registration_url`

2. **GET /api/rep/meetings**
   - List all meetings for authenticated rep
   - Optional query params: `status`, `upcoming`
   - Order by `event_date DESC`

3. **GET /api/rep/meetings/[id]**
   - Get single meeting with registrations
   - Verify meeting belongs to rep
   - Include aggregate stats

4. **PUT /api/rep/meetings/[id]**
   - Update meeting details
   - Verify ownership
   - Validate status transitions

5. **DELETE /api/rep/meetings/[id]**
   - Soft delete or hard delete (cascade to registrations)
   - Verify ownership

6. **GET /api/rep/meetings/[id]/registrations**
   - List all registrations for a meeting
   - Optional filters: `status`, `has_questions`
   - Verify meeting ownership

7. **PUT /api/rep/meetings/[id]/registrations/[regId]**
   - Update registration status
   - Track status history
   - Verify meeting ownership

---

### **Phase 6: API Routes - Public Side**

**No Authentication Required** (use service client)

**Rate Limiting Required:**
```typescript
// Use @upstash/ratelimit (already installed)
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 registrations per hour
  prefix: 'meeting-registration',
});

const ip = request.headers.get('x-forwarded-for') || 'unknown';
const { success } = await ratelimit.limit(ip);

if (!success) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
```

**Required Endpoints:**

1. **GET /api/public/meetings/[id]/details**
   - Return meeting details for registration form
   - Check if meeting is active, not expired, not at capacity
   - Include distributor name/info

2. **POST /api/public/meetings/[id]/register**
   - Create registration record
   - Validate inputs with Zod
   - Check capacity and deadline
   - Prevent duplicate email registrations (unique constraint)
   - Send confirmation email to attendee
   - Send notification email to rep
   - Return success + registration ID

---

### **Phase 7: Public Registration Page**

**File:** `src/app/[slug]/register/[meetingSlug]/page.tsx`

**Requirements:**
1. Server component (fetch meeting details server-side)
2. Verify slug matches meeting owner
3. Check meeting status (active, not expired, not full)
4. Render client component for form

**URL Pattern:** `reachtheapex.net/[slug]/register/[meetingSlug]`

**Logic:**
```typescript
export default async function MeetingRegistrationPage({ params }) {
  const { slug, meetingSlug } = await params;

  // 1. Look up distributor by slug
  const supabase = await createClient();
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, first_name, last_name')
    .eq('slug', slug)
    .single();

  if (!distributor) {
    notFound();
  }

  // 2. Look up meeting by slug AND distributor_id
  const { data: meeting } = await supabase
    .from('meeting_events')
    .select('*')
    .eq('registration_slug', meetingSlug)
    .eq('distributor_id', distributor.id)
    .single();

  if (!meeting) {
    notFound();
  }

  // 3. Check status, capacity, deadline
  if (meeting.status !== 'active') {
    return <div>Registration closed</div>;
  }

  if (meeting.max_attendees && meeting.total_registered >= meeting.max_attendees) {
    return <div>Event is full</div>;
  }

  if (meeting.registration_deadline && new Date() > new Date(meeting.registration_deadline)) {
    return <div>Registration deadline passed</div>;
  }

  // 4. Render form
  return <MeetingRegistrationForm meeting={meeting} distributor={distributor} />;
}
```

---

### **Phase 8: Autopilot Dashboard Integration**

**File to Modify:** `src/components/autopilot/AutopilotDashboard.tsx`

**Requirements:**
1. Add 'meetings' tab to existing tabs array
2. Add tab content conditional rendering
3. Follow existing patterns exactly

**Pattern to Follow:**
```typescript
// Add to tabs array
const tabs = [
  { id: 'invitations', name: 'Send Invitations', icon: <Mail />, ... },
  { id: 'meetings', name: 'Meeting Reservations', icon: <Calendar />, ... }, // NEW
  // ... existing tabs
];

// Add to tab content
{activeTab === 'meetings' && (
  <MeetingsTab distributorId={distributorId} />
)}
```

---

### **Phase 9: Email Templates**

**MANDATORY REQUIREMENTS (from CLAUDE.md):**
- ✅ Base template: `src/lib/email/templates/base-email-template.html`
- ✅ Domain: `@theapexway.net` (NO EXCEPTIONS)
- ✅ Professional tone, navy blue (#2c5aa0), no emojis
- ✅ Use `src/lib/services/resend-tracked.ts` for sending
- ✅ Check `result.error` before assuming success
- ✅ Access `result.data.id` (NOT `result.id`)

**Template Structure:**
```html
<!-- src/lib/email/templates/meeting-confirmation.html -->
<div style="max-width: 600px; padding: 20px;">
  <h2 style="color: #2c5aa0;">You're Registered!</h2>
  <p>Hi {{attendee_first_name}},</p>
  <p>You're confirmed for <strong>{{meeting_title}}</strong></p>

  <div style="background: #f8f9fa; padding: 15px; margin: 20px 0;">
    <p><strong>Date:</strong> {{meeting_date}}</p>
    <p><strong>Time:</strong> {{meeting_time}} {{meeting_timezone}}</p>
    <p><strong>Duration:</strong> {{duration_minutes}} minutes</p>
    <p><strong>Location:</strong> {{location_info}}</p>
  </div>

  {{#if virtual_link}}
  <p><a href="{{virtual_link}}" style="background: #2c5aa0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Join Meeting</a></p>
  {{/if}}

  {{#if custom_message}}
  <div style="border-left: 3px solid #2c5aa0; padding-left: 15px; margin: 20px 0;">
    <p><em>{{custom_message}}</em></p>
  </div>
  {{/if}}

  <p>Questions? Contact {{rep_first_name}} {{rep_last_name}} at {{rep_email}} or {{rep_phone}}.</p>
</div>
```

**Email Sending Pattern:**
```typescript
import { trackEmail } from '@/lib/services/resend-tracked';

const result = await trackEmail({
  to: attendee.email,
  from: 'Apex Affinity Group <noreply@theapexway.net>', // MANDATORY DOMAIN
  subject: `You're registered for ${meeting.title}`,
  html: compiledTemplate, // After variable replacement
  tags: [
    { name: 'type', value: 'meeting-confirmation' },
    { name: 'meeting_id', value: meeting.id },
  ],
  replyTo: `${rep.first_name} ${rep.last_name} <${rep.email}>`,
});

if (result.error) {
  console.error('[Meeting] Email failed:', result.error);
  // DO NOT throw - just log
}

if (result.data?.id) {
  console.log('[Meeting] Email sent:', result.data.id);
  // Update database: confirmation_email_sent = true
}
```

**Required Templates:**
1. `meeting-confirmation.html` - Sent immediately to attendee
2. `meeting-reminder.html` - Sent 24h before (cron job or manual)
3. `meeting-new-registration.html` - Sent to rep when someone registers
4. `meeting-followup.html` - Rep can send manually

---

### **Phase 10: Calendar File Generator**

**File:** `src/lib/calendar/ics-generator.ts`

**Requirements:**
1. Generate RFC 5545 compliant .ics files
2. Handle timezones correctly
3. Escape special characters in text fields
4. Include organizer info (rep)

**Example:**
```typescript
export function generateICS(params: {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  organizerName: string;
  organizerEmail: string;
}): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeText = (text: string) => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Apex Affinity Group//Meeting Reservations//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@theapexway.net`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(params.startDate)}`,
    `DTEND:${formatDate(params.endDate)}`,
    `SUMMARY:${escapeText(params.title)}`,
    `DESCRIPTION:${escapeText(params.description)}`,
    `LOCATION:${escapeText(params.location)}`,
    `ORGANIZER;CN=${escapeText(params.organizerName)}:MAILTO:${params.organizerEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
```

---

### **Phase 11: Testing**

**Required Tests:**

**Unit Tests (Vitest):**
- [ ] `ics-generator.test.ts` - Validate .ics format, timezone handling
- [ ] `meeting-schemas.test.ts` - Test Zod validation edge cases

**API Tests (Vitest):**
- [ ] Create meeting (success, validation errors, auth errors)
- [ ] List meetings (filtering, ordering)
- [ ] Public registration (success, duplicate email, capacity full, expired)
- [ ] Update registration status

**E2E Tests (Playwright):**
- [ ] Rep creates meeting, copies link
- [ ] Public user visits link, fills form, submits
- [ ] Confirmation email sent (check database flag)
- [ ] Rep sees registration in dashboard
- [ ] Rep changes status to "Not Going"

**Test Pattern:**
```typescript
// tests/unit/meeting-api.test.ts
import { describe, it, expect, beforeEach } from 'vitest';

describe('Meeting API', () => {
  beforeEach(async () => {
    // Setup test data
  });

  it('creates meeting with valid data', async () => {
    // Test implementation
  });
});
```

---

## 🚨 CRITICAL VALIDATION CHECKLIST

Before considering ANY phase complete, verify:

**Database Migration:**
- [ ] Migration file follows naming convention: `YYYYMMDDHHMMSS_description.sql`
- [ ] All tables have RLS enabled
- [ ] All foreign keys have ON DELETE actions
- [ ] All indexes created on foreign keys and frequently queried fields
- [ ] Unique constraints where needed
- [ ] Check constraints for enum-like fields
- [ ] Comments on all tables and complex columns
- [ ] Triggers for `updated_at` on all tables
- [ ] Helper functions tested with sample queries

**TypeScript Types:**
- [ ] All database columns mapped to TypeScript properties
- [ ] Dates are `string` type (ISO format from database)
- [ ] No `any` types used
- [ ] Request/response types separate from database types
- [ ] Exported from dedicated types file

**API Routes:**
- [ ] All routes have authentication (except public endpoints)
- [ ] All inputs validated with Zod
- [ ] Errors return proper HTTP status codes (400, 401, 404, 500)
- [ ] Success responses have consistent format: `{ success: true, data: ... }`
- [ ] Public endpoints have rate limiting
- [ ] No SQL injection vulnerabilities (use parameterized queries)

**Email System:**
- [ ] `@theapexway.net` domain used (NO EXCEPTIONS)
- [ ] Base template loaded and used
- [ ] Variable replacement works correctly
- [ ] Error handling: check `result.error`
- [ ] Access `result.data.id` (NOT `result.id`)
- [ ] Professional tone, no emojis, navy blue colors
- [ ] Reply-to set to rep's email

**URL Routing:**
- [ ] Correct pattern: `reachtheapex.net/[slug]/register/[meetingSlug]`
- [ ] NOT subdomain pattern
- [ ] Slug verification: meeting belongs to distributor
- [ ] Reserved slug checks
- [ ] 404 handling for invalid slugs/meetings

**Autopilot Integration:**
- [ ] Tab added to existing tabs array
- [ ] Icon imported from lucide-react
- [ ] Tab content renders conditionally
- [ ] Follows exact pattern of existing tabs
- [ ] No breaking changes to existing tabs

**Security:**
- [ ] RLS policies prevent unauthorized access
- [ ] Service client only used where necessary
- [ ] No sensitive data in client-side code
- [ ] Rate limiting on public endpoints
- [ ] Input sanitization (XSS prevention)
- [ ] CSRF protection (Next.js handles this)

**Testing:**
- [ ] All unit tests pass
- [ ] API tests cover success and error cases
- [ ] E2E test covers full user flow
- [ ] TypeScript compiles without errors
- [ ] No ESLint errors

---

## 📝 IMPLEMENTATION SEQUENCE

**DO NOT skip any step. Complete each phase BEFORE moving to the next.**

1. **Research Phase** (1-2 hours)
   - Read all files listed in dependency checklist
   - Create `MEETING-RESERVATIONS-RESEARCH.md`
   - Document all patterns found
   - Identify any gaps or concerns

2. **Database Schema** (2-3 hours)
   - Write complete migration file
   - Test migration on local Supabase
   - Verify RLS policies work
   - Seed test data

3. **TypeScript Types** (1 hour)
   - Create `src/types/meeting.ts`
   - Match database schema exactly
   - Export all types

4. **Validation Schemas** (1 hour)
   - Create `src/lib/validators/meeting-schemas.ts`
   - Write Zod schemas with refinements
   - Test with sample data

5. **Rep API Routes** (3-4 hours)
   - Create all 7 rep endpoints
   - Add authentication to each
   - Validate inputs with Zod
   - Test with Postman/Thunder Client

6. **Public API Routes** (2-3 hours)
   - Create 2 public endpoints
   - Add rate limiting
   - Test registration flow

7. **Public Registration Page** (2-3 hours)
   - Create `src/app/[slug]/register/[meetingSlug]/page.tsx`
   - Create `MeetingRegistrationForm.tsx`
   - Test URL routing

8. **Email Templates** (2-3 hours)
   - Create 4 HTML templates
   - Test variable replacement
   - Send test emails

9. **Calendar Generator** (1-2 hours)
   - Create `src/lib/calendar/ics-generator.ts`
   - Test .ics file generation
   - Verify imports to Google/Outlook

10. **Autopilot Components** (4-5 hours)
    - Create `MeetingsTab.tsx`
    - Create `CreateMeetingModal.tsx`
    - Create `MeetingsList.tsx`
    - Create `MeetingCard.tsx`
    - Integrate into `AutopilotDashboard.tsx`

11. **Testing** (3-4 hours)
    - Write unit tests
    - Write API tests
    - Write E2E test
    - Fix any bugs found

12. **Documentation** (1 hour)
    - Document usage in README
    - Add inline code comments
    - Create user guide

**Total Estimated Time:** 24-31 hours (3-4 full days)

---

## ✅ DEFINITION OF DONE

The Meeting Reservations feature is COMPLETE when ALL of the following are true:

**Database:**
- [ ] Migration applied successfully
- [ ] All tables created with RLS
- [ ] Test data exists
- [ ] Queries return expected results

**API Routes:**
- [ ] All 9 endpoints working
- [ ] Authentication enforced on rep routes
- [ ] Rate limiting active on public routes
- [ ] All inputs validated
- [ ] Errors handled gracefully

**Frontend:**
- [ ] Registration page renders at `reachtheapex.net/[slug]/register/[meetingSlug]`
- [ ] Form submission works
- [ ] Autopilot tab shows meetings list
- [ ] Create meeting modal works
- [ ] Registration management works

**Email:**
- [ ] Confirmation email sends successfully
- [ ] Notification email sends to rep
- [ ] Templates use `@theapexway.net` domain
- [ ] Templates use base template
- [ ] Variables replace correctly

**Testing:**
- [ ] All unit tests pass (100%)
- [ ] All API tests pass (100%)
- [ ] E2E test passes
- [ ] TypeScript compiles (0 errors)
- [ ] ESLint passes (0 errors)

**Documentation:**
- [ ] Research report created
- [ ] User guide created
- [ ] Inline comments added
- [ ] README updated

**Code Quality:**
- [ ] No hardcoded values (use env vars)
- [ ] No `console.log` in production code (use proper logging)
- [ ] Consistent naming conventions
- [ ] Follows existing patterns exactly
- [ ] No TODO comments left in code

---

## 🎯 SUCCESS METRICS

**Functional:**
- Rep can create a meeting in <2 minutes
- Registration link works in browser
- Public user can register in <1 minute
- Emails send within 5 seconds
- Calendar file downloads and imports correctly

**Technical:**
- API response time <500ms
- Database queries use indexes (no full table scans)
- No N+1 query problems
- No memory leaks in frontend
- Mobile responsive (works on phones)

**Quality:**
- 100% test coverage on critical paths
- 0 TypeScript errors
- 0 ESLint errors
- WCAG AA accessible (forms, buttons, colors)

---

## 🚫 COMMON PITFALLS TO AVOID

1. **URL Structure Mistake**
   - ❌ Using subdomain pattern
   - ✅ Use path pattern: `reachtheapex.net/[slug]/register/...`

2. **Email Domain Mistake**
   - ❌ Using wrong domain or hardcoded email
   - ✅ ALWAYS use `@theapexway.net`

3. **Database Pattern Mistakes**
   - ❌ Forgetting RLS policies
   - ❌ Not using service client for public operations
   - ✅ Follow existing migration patterns exactly

4. **TypeScript Mistakes**
   - ❌ Using `any` type
   - ❌ Using `Date` object for database dates
   - ✅ Use `string` for dates (ISO format)

5. **API Pattern Mistakes**
   - ❌ Inconsistent error responses
   - ❌ No rate limiting on public endpoints
   - ✅ Follow existing API patterns

6. **Testing Mistakes**
   - ❌ Not testing error cases
   - ❌ Hardcoded test data
   - ✅ Test both success and failure paths

7. **Component Mistakes**
   - ❌ Breaking existing Autopilot tabs
   - ❌ Not following existing UI patterns
   - ✅ Match existing component structure

---

## 📚 REFERENCE FILES

**MUST READ before coding:**
- `CLAUDE.md` - Lines 23-63 (EMAIL SYSTEM RULES)
- `src/app/[slug]/page.tsx` - Routing pattern
- `src/components/autopilot/AutopilotDashboard.tsx` - Tab structure
- `src/lib/email/templates/base-email-template.html` - Email base
- `src/lib/services/resend-tracked.ts` - Email sending
- `supabase/migrations/*.sql` - Migration patterns

**Reference for patterns:**
- `src/components/autopilot/InvitationList.tsx` - List UI
- `src/components/autopilot/SocialPostComposer.tsx` - Modal form
- `src/components/autopilot/crm/ContactList.tsx` - Table UI
- `src/app/api/rep/*/route.ts` - API patterns

---

## 🎬 FINAL NOTES

**This prompt is comprehensive and complete.** Everything you need to know is documented above. If you follow this prompt exactly:

1. ✅ No dependency issues will occur (all packages already installed)
2. ✅ No logic gaps will exist (all flows documented)
3. ✅ No routing conflicts will happen (correct URL pattern specified)
4. ✅ No email issues will occur (domain and patterns enforced)
5. ✅ No database issues will arise (schema and RLS documented)
6. ✅ No integration issues will happen (Autopilot patterns specified)

**Start with Phase 1 (Research) and work sequentially through all phases.**

**Do NOT skip the research phase.** Understanding existing patterns is CRITICAL to success.

**When in doubt, ask questions BEFORE coding.** It's better to clarify than to rebuild.

**Good luck!** 🚀
