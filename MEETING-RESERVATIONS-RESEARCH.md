# Meeting Reservations - Dependency Research Report

**Created:** 2026-03-22
**Phase:** 1 - Research & Planning
**Status:** Complete

---

## Executive Summary

This research report documents all existing patterns, dependencies, and integration points for implementing the Meeting Reservations system. All required dependencies are already installed, routing patterns are well-established, and clear integration points exist in the Autopilot dashboard.

**Key Findings:**
- ✅ All npm dependencies already installed (no new packages needed)
- ✅ Clear migration patterns established with RLS policies
- ✅ Existing email system using `@theapexway.net` with template wrapper
- ✅ Autopilot dashboard has clear tab integration pattern
- ✅ URL routing pattern: `reachtheapex.net/[slug]/register/[meetingSlug]` (NOT subdomain)
- ✅ Testing infrastructure ready (Playwright E2E + Vitest unit)

---

## 1. Database Schema Analysis

### Existing Tables Relevant to Meetings
1. **distributors** - Rep information, used for `distributor_id` foreign key
2. **autopilot_subscriptions** - Subscription tiers (free, social_connector, lead_autopilot_pro, team_edition)
3. **meeting_invitations** - ALREADY EXISTS! Similar but different structure (email invitations vs. event registration)

### Migration Pattern Discovered

**File:** `supabase/migrations/20260318000004_apex_lead_autopilot_schema.sql`

**Key Patterns:**
```sql
-- Standard header with description
-- =============================================
-- TABLE NAME
-- Description of purpose
-- =============================================

CREATE TABLE IF NOT EXISTS table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys with ON DELETE CASCADE
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Text fields with CHECK constraints for enums
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes on foreign keys and commonly queried fields
CREATE INDEX idx_table_distributor ON table_name(distributor_id);

-- Comments for documentation
COMMENT ON TABLE table_name IS 'Description of table purpose';
```

### RLS Policy Pattern

All tables have Row Level Security enabled with patterns like:
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Distributors can view their own records
CREATE POLICY "Distributors can view own records"
  ON table_name FOR SELECT
  USING (auth.uid() IN (
    SELECT auth_user_id FROM distributors WHERE id = distributor_id
  ));
```

### Updated_at Trigger Pattern

Consistent trigger function already exists:
```sql
-- Trigger to auto-update updated_at
CREATE TRIGGER update_table_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**IMPORTANT:** The `update_updated_at_column()` function likely already exists in an earlier migration.

---

## 2. Routing Patterns

### Dynamic Route Structure

**File:** `src/app/[slug]/page.tsx`

**Pattern Discovered:**
```typescript
// 1. Reserved slugs handling
const RESERVED_SLUGS = [
  'api', 'admin', 'dashboard', 'login', 'signup', 'join',
  'about', 'contact', 'terms', 'privacy', 'live', '_next', 'favicon.ico'
];

// 2. Server component with async params
export default async function DistributorPage({ params }: PageProps) {
  const { slug } = await params;

  // 3. Reserved route redirects
  if (RESERVED_ROUTES[slug.toLowerCase()]) {
    redirect(RESERVED_ROUTES[slug.toLowerCase()]);
  }

  // 4. Distributor lookup with status check
  const supabase = await createClient();
  const { data: distributor } = await supabase
    .from('distributors')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!distributor) {
    notFound();
  }

  // 5. Status handling
  if (dist.status === 'suspended' || dist.status === 'deleted') {
    return <UnavailableMessage />;
  }
}
```

### Nested Route Strategy

For `src/app/[slug]/register/[meetingSlug]/page.tsx`:
- Follow same async params pattern: `const { slug, meetingSlug } = await params;`
- Lookup distributor by slug first
- Then lookup meeting by `meetingSlug` AND `distributor_id` (ensure ownership)
- Handle all status checks (active, capacity, deadline)

**No existing nested [slug]/[something] routes found** - This will be the first.

---

## 3. Autopilot Dashboard Integration

### Existing Tab Structure

**File:** `src/components/autopilot/AutopilotDashboard.tsx`

**Current Tabs:**
```typescript
type Tab = 'invitations' | 'social' | 'flyers' | 'crm' | 'stats';

const tabs = [
  { id: 'invitations', name: 'Send Invitations', icon: <Mail />, enabled: true },
  { id: 'social', name: 'Social Posts', icon: <MessageSquare />, enabled: false },
  { id: 'flyers', name: 'Create Flyers', icon: <Image />, enabled: false },
  { id: 'crm', name: 'My Contacts', icon: <Users />, enabled: false },
  { id: 'stats', name: 'Statistics', icon: <Sparkles />, enabled: false },
];
```

**Tab Rendering Pattern:**
```typescript
{activeTab === 'invitations' && (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Send Invitations</h2>
      <p className="text-slate-600">Description...</p>
    </div>
    <MeetingInvitationForm />
  </div>
)}
```

### Integration Strategy

**Add new tab:**
```typescript
type Tab = 'invitations' | 'social' | 'flyers' | 'crm' | 'stats' | 'meetings';

// Add after invitations tab
{
  id: 'meetings',
  name: 'Meeting Reservations',
  icon: <Calendar />, // from lucide-react
  description: 'Create event registration pages',
  enabled: true,
}
```

**Component Structure:**
- `MeetingsTab.tsx` - Main tab component (list + create button)
- `CreateMeetingModal.tsx` - Modal form for creating meetings
- `MeetingsList.tsx` - Table/grid of meetings with registrations count
- `MeetingCard.tsx` - Individual meeting display with actions

---

## 4. Email System

### Email Service Pattern

**File:** `src/lib/services/resend-tracked.ts`

**CRITICAL FINDINGS:**

1. **Email Sending Function:**
```typescript
import { sendTrackedEmail } from '@/lib/services/resend-tracked';

const result = await sendTrackedEmail({
  from: 'Apex <noreply@theapexway.net>', // MUST use @theapexway.net
  to: attendee.email,
  subject: 'Meeting Confirmation',
  html: emailHtml,
  triggeredBy: 'system', // or 'user' or 'admin'
  userId: distributor.id,
  feature: 'meeting-reservations',
});

// Response structure
if (result.error) {
  console.error('Email failed:', result.error);
}
if (result.data?.id) {
  console.log('Email sent:', result.data.id);
}
```

2. **Template Wrapper:**
```typescript
import { wrapEmailTemplate } from '@/lib/email/template-wrapper';

const emailContent = '<p>Your meeting details...</p>';
const emailHtml = wrapEmailTemplate(
  emailContent,
  'Meeting Confirmation',
  'https://reachtheapex.net/unsubscribe?token=xxx'
);
```

**IMPORTANT:** The `sendTrackedEmail` function AUTOMATICALLY wraps HTML with base template unless `skipTemplateWrap: true`.

3. **Base Template:** `src/lib/email/templates/base-email-template.html`
   - Navy blue branding (#2c5aa0)
   - Professional corporate style
   - Apex logo header
   - Footer with company info
   - Replaces `{{email_content}}` placeholder

### Email Domain Requirements

**MANDATORY (from CLAUDE.md lines 23-63):**
- ✅ Domain: `@theapexway.net` (NEVER `@reachtheapex.net`)
- ✅ From addresses: `noreply@theapexway.net`, `support@theapexway.net`, `theapex@theapexway.net`
- ✅ Professional tone, no emojis
- ✅ Navy blue (#2c5aa0), grays (#212529, #495057, #6c757d)
- ✅ Always check `result.error` before logging success
- ✅ Access `result.data.id` (NOT `result.id`)

### Template Variable Pattern

Variables are replaced manually:
```typescript
let html = templateContent;
html = html.replace('{{attendee_name}}', name);
html = html.replace('{{meeting_title}}', title);
// etc.
```

---

## 5. API Patterns

### Authentication Pattern (Rep Routes)

**File:** `src/app/api/admin/distributors/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';

export async function GET(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... rest of logic
}
```

**For Rep Routes (non-admin):**
```typescript
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get distributor from user
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
  }

  // Use distributor.id for ownership checks
}
```

### Validation Pattern

**File:** `src/app/api/prospects/route.ts`

```typescript
import { z } from 'zod';

const prospectSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();

  const validation = prospectSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: validation.error.issues[0].message },
      { status: 400 }
    );
  }

  const data = validation.data;
  // ... use validated data
}
```

### Public Endpoint Pattern (Service Client)

**File:** `src/app/api/prospects/route.ts`

```typescript
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: Request) {
  const serviceClient = createServiceClient();

  // Service client bypasses RLS - use for public operations
  const { data, error } = await serviceClient
    .from('table_name')
    .insert({ ... });
}
```

### Rate Limiting Pattern

**Dependencies:** `@upstash/ratelimit` and `@upstash/redis` already installed (package.json lines 33-34)

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  prefix: 'meeting-registration',
});

const ip = request.headers.get('x-forwarded-for') || 'unknown';
const { success } = await ratelimit.limit(ip);

if (!success) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
```

**NOTE:** Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` environment variables.

### Error Response Format

**Consistent format found:**
```typescript
// Success
return NextResponse.json({ success: true, data: result });

// Client error (400)
return NextResponse.json({ error: 'Validation failed' }, { status: 400 });

// Unauthorized (401)
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// Not found (404)
return NextResponse.json({ error: 'Not found' }, { status: 404 });

// Server error (500)
return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
```

---

## 6. Type Patterns

### TypeScript Conventions

**File:** `src/lib/types/index.ts`

**Patterns Found:**
1. **Interface naming:** PascalCase, descriptive names
2. **Database types:** Match table columns exactly (snake_case preserved)
3. **Dates:** Always `string` type (ISO 8601 from Supabase)
4. **Optional fields:** Use `| null` for nullable database columns
5. **Enums:** Use string literal unions
6. **Separate types:** Database types vs. API request/response types

**Example:**
```typescript
export interface Distributor {
  id: string;
  first_name: string; // Database field - snake_case preserved
  email: string;
  created_at: string; // ISO 8601 string, NOT Date object
  phone: string | null; // Nullable fields
  status?: string | null; // Optional fields use ?
}

// API Request type (subset of database fields)
export interface CreateDistributorRequest {
  firstName: string; // camelCase for API
  lastName: string;
  email: string;
}
```

### Date Handling

**CRITICAL:** Supabase returns dates as ISO 8601 strings, NOT Date objects.
- Database: `created_at TIMESTAMPTZ`
- TypeScript: `created_at: string`
- Usage: `new Date(distributor.created_at)` to convert when needed

---

## 7. Form Validation

### Zod Usage Pattern

**Dependency:** `zod: ^4.3.6` (package.json line 64)

**Pattern from API routes:**
```typescript
import { z } from 'zod';

// Define schema with refinements
const createMeetingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  event_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  location_type: z.enum(['virtual', 'physical', 'hybrid']),
  virtual_link: z.string().url().optional(),
  max_attendees: z.number().int().positive().optional(),
}).refine(
  (data) => {
    // Conditional validation
    if (data.location_type === 'virtual' && !data.virtual_link) {
      return false;
    }
    return true;
  },
  {
    message: 'Virtual link required for virtual meetings',
    path: ['virtual_link'],
  }
);

// Use in API
const validation = createMeetingSchema.safeParse(body);
if (!validation.success) {
  return NextResponse.json(
    { error: validation.error.issues[0].message },
    { status: 400 }
  );
}

const data = validation.data; // Typed correctly
```

**No client-side form validation found** - Forms submit directly to API which validates.

---

## 8. Testing Strategy

### Testing Infrastructure

**Files:**
- E2E: `tests/e2e/**/*.spec.ts` (Playwright)
- Unit: `tests/unit/**/*.test.ts` (Vitest - assumed)

**Scripts (package.json):**
```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

### E2E Test Pattern (Playwright)

**Example files:**
- `tests/e2e/autopilot-invitations.spec.ts`
- `tests/e2e/auth-flows.spec.ts`

**Pattern (inferred):**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Meeting Registration Flow', () => {
  test('should allow public registration', async ({ page }) => {
    // 1. Navigate to registration page
    await page.goto('/john-smith/register/business-webinar');

    // 2. Fill form
    await page.fill('[name="firstName"]', 'Jane');
    await page.fill('[name="email"]', 'jane@example.com');

    // 3. Submit
    await page.click('button[type="submit"]');

    // 4. Verify success
    await expect(page.locator('text=Registration Confirmed')).toBeVisible();
  });
});
```

### Unit Test Pattern (Vitest)

**Expected pattern:**
```typescript
import { describe, it, expect } from 'vitest';
import { generateICS } from '@/lib/calendar/ics-generator';

describe('ICS Generator', () => {
  it('should generate valid ICS format', () => {
    const ics = generateICS({
      title: 'Test Meeting',
      startDate: new Date('2026-04-01T10:00:00Z'),
      endDate: new Date('2026-04-01T11:00:00Z'),
      location: 'Virtual',
      organizerName: 'John Doe',
      organizerEmail: 'john@example.com',
    });

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('SUMMARY:Test Meeting');
    expect(ics).toContain('END:VCALENDAR');
  });
});
```

### Mock Patterns

**Supabase client mocking** (expected):
```typescript
import { vi } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: (table: string) => ({
      select: vi.fn().mockResolvedValue({ data: mockData }),
      insert: vi.fn().mockResolvedValue({ data: mockData }),
    }),
  }),
}));
```

---

## 9. Gaps & Concerns

### Missing Utilities

1. **Slug Generator for Meetings**
   - Need function to generate unique URL-friendly slug from meeting title
   - Should check uniqueness within distributor's meetings
   - Pattern: `business-opportunity-webinar`, `april-training-2026`

2. **ICS Calendar Generator**
   - Need to create `src/lib/calendar/ics-generator.ts`
   - Must handle timezone conversions correctly
   - RFC 5545 compliant format

3. **Capacity Check Helper**
   - Helper to check if meeting is at capacity
   - Should account for denormalized `total_registered` field

### Potential Conflicts

1. **Existing `meeting_invitations` Table**
   - Already exists in migration `20260318000004_apex_lead_autopilot_schema.sql`
   - Different purpose: Email invitations (sent to specific recipients)
   - Our system: Event registration pages (public, shareable link)
   - **NO CONFLICT** - These are complementary features

2. **Email Domain Confusion**
   - Some existing code may use `@reachtheapex.net`
   - **MUST enforce** `@theapexway.net` for ALL new emails
   - Review existing email sending code to ensure compliance

3. **Rate Limiting Setup**
   - Requires Upstash Redis setup
   - Need to verify environment variables exist
   - May need to add to `.env.example`

### Unclear Patterns

1. **Error Logging**
   - Some files use `console.error`, some use `console.log`
   - No centralized logging service found
   - **Decision:** Use `console.error` for errors, `console.log` for info

2. **Email Tracking**
   - `sendTrackedEmail` logs to `service_usage_tracking` table
   - Should we also log to a `meeting_emails_sent` table?
   - **Decision:** Let `sendTrackedEmail` handle tracking, add `confirmation_email_sent` boolean to registration table

3. **Timezone Handling**
   - Default timezone: `America/Chicago` (found in `meeting_invitations` table)
   - How to display times to users in different timezones?
   - **Decision:** Store in database with timezone, display in meeting's timezone with label

---

## 10. Implementation Dependencies Verified

### NPM Packages (All Installed ✅)

```json
"resend": "^6.9.2",              // Email service
"date-fns": "^4.1.0",            // Date formatting
"zod": "^4.3.6",                 // Validation schemas
"lucide-react": "^0.564.0",      // Icons (Calendar icon)
"@supabase/supabase-js": "^2.95.3",
"@supabase/ssr": "^0.8.0",
"@upstash/ratelimit": "^2.0.8",  // Rate limiting
"@upstash/redis": "^1.36.2",     // Redis for rate limiting
"@playwright/test": "^1.58.2",   // E2E testing
"vitest": "^4.0.18"              // Unit testing
```

**NO NEW DEPENDENCIES NEEDED** ✅

### Environment Variables Required

**Existing (verified in code):**
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `RESEND_API_KEY`

**May Need to Add:**
- ⚠️ `UPSTASH_REDIS_REST_URL` (for rate limiting)
- ⚠️ `UPSTASH_REDIS_REST_TOKEN` (for rate limiting)

**Action:** Check if Upstash is already configured, if not, rate limiting can be added later.

---

## 11. File Creation Checklist

### Phase 2: Database (1 file)
- [ ] `supabase/migrations/20260322000001_meeting_reservations.sql`

### Phase 3: Types (1 file)
- [ ] `src/types/meeting.ts`

### Phase 4: Validation (1 file)
- [ ] `src/lib/validators/meeting-schemas.ts`

### Phase 5: Rep API Routes (7 files)
- [ ] `src/app/api/rep/meetings/route.ts` (GET, POST)
- [ ] `src/app/api/rep/meetings/[id]/route.ts` (GET, PUT, DELETE)
- [ ] `src/app/api/rep/meetings/[id]/registrations/route.ts` (GET)
- [ ] `src/app/api/rep/meetings/[id]/registrations/[regId]/route.ts` (PUT)

**NOTE:** API structure needs directory creation first!

### Phase 6: Public API Routes (2 files)
- [ ] `src/app/api/public/meetings/[id]/details/route.ts` (GET)
- [ ] `src/app/api/public/meetings/[id]/register/route.ts` (POST)

### Phase 7: Public Page (1 file)
- [ ] `src/app/[slug]/register/[meetingSlug]/page.tsx`

### Phase 8: Components (5 files)
- [ ] `src/components/autopilot/MeetingsTab.tsx`
- [ ] `src/components/autopilot/CreateMeetingModal.tsx`
- [ ] `src/components/autopilot/MeetingsList.tsx`
- [ ] `src/components/autopilot/MeetingCard.tsx`
- [ ] `src/components/MeetingRegistrationForm.tsx` (public form)

### Phase 9: Email Templates (4 files)
- [ ] `src/lib/email/templates/meeting-confirmation.html`
- [ ] `src/lib/email/templates/meeting-reminder.html`
- [ ] `src/lib/email/templates/meeting-new-registration.html`
- [ ] `src/lib/email/templates/meeting-followup.html`

### Phase 10: Utilities (2 files)
- [ ] `src/lib/calendar/ics-generator.ts`
- [ ] `src/lib/utils/meeting-slug-generator.ts` (NEW - not in spec but needed)

### Phase 11: Tests (6+ files)
- [ ] `tests/unit/ics-generator.test.ts`
- [ ] `tests/unit/meeting-schemas.test.ts`
- [ ] `tests/unit/meeting-api.test.ts`
- [ ] `tests/e2e/meeting-registration-flow.spec.ts`
- [ ] `tests/e2e/rep-meeting-creation.spec.ts`
- [ ] `tests/e2e/rep-meeting-management.spec.ts`

**TOTAL: 28+ files to create**

---

## 12. Key Decisions Made

### 1. URL Structure
**Decision:** `reachtheapex.net/[slug]/register/[meetingSlug]`
**Rationale:** Matches spec, consistent with existing `[slug]` pattern

### 2. Email Domain
**Decision:** `@theapexway.net` for ALL emails
**Rationale:** CLAUDE.md mandate, existing template system already configured

### 3. Slug Generation Strategy
**Decision:** Generate from title, append random string if duplicate
**Example:** `business-webinar-a3f2` if `business-webinar` exists
**Rationale:** Human-readable but guaranteed unique

### 4. Registration Uniqueness
**Decision:** Unique constraint on `(meeting_event_id, email)`
**Rationale:** Prevent duplicate registrations, allow same email across different meetings

### 5. Denormalized Stats
**Decision:** Store counts on `meeting_events` table
**Rationale:** Avoid expensive COUNT queries on list view, update via triggers

### 6. Public vs Rep Routing
**Decision:**
- Rep routes: `/api/rep/meetings/*` (requires auth)
- Public routes: `/api/public/meetings/*` (no auth, rate limited)
**Rationale:** Clear separation, different security models

### 7. Calendar File Strategy
**Decision:** Generate on-demand, not stored
**Rationale:** Small file, dynamic data (rep contact info), no storage needed

### 8. Email Timing
**Decision:**
- Confirmation: Immediate (on registration)
- Reminder: Manual trigger by rep OR cron job (Phase 2 feature)
- Follow-up: Manual trigger by rep
**Rationale:** Simplify Phase 1, add automation later

---

## 13. Next Steps

### Immediate Actions (Phase 2)

1. **Create Migration File**
   - Copy pattern from `20260318000004_apex_lead_autopilot_schema.sql`
   - Add `meeting_events` and `meeting_registrations` tables
   - Include RLS policies, indexes, triggers, comments
   - Add denormalized stats update trigger
   - Include helper functions

2. **Test Migration Locally**
   - Apply migration to local Supabase instance
   - Verify tables created
   - Test RLS policies work correctly
   - Seed test data

3. **Document Schema**
   - Add schema diagram to this report
   - Document all fields, constraints, indexes

### Phase Progression

**Complete phases in order:**
1. ✅ Phase 1: Research (COMPLETE)
2. 🔄 Phase 2: Database Schema (NEXT)
3. ⏳ Phase 3: TypeScript Types
4. ⏳ Phase 4: Validation Schemas
5. ⏳ Phase 5: Rep API Routes
6. ⏳ Phase 6: Public API Routes
7. ⏳ Phase 7: Public Registration Page
8. ⏳ Phase 8: Autopilot Dashboard Integration
9. ⏳ Phase 9: Email Templates
10. ⏳ Phase 10: Calendar Generator
11. ⏳ Phase 11: Testing
12. ⏳ Phase 12: Documentation

---

## 14. Risk Assessment

### Low Risk ✅
- Database schema creation (clear patterns exist)
- TypeScript types (straightforward mapping)
- Email sending (system already working)
- Public page routing (pattern established)

### Medium Risk ⚠️
- Autopilot dashboard integration (first time adding tab)
- Rate limiting setup (may require Upstash config)
- E2E test coverage (complex user flows)

### High Risk ❌
- None identified (all patterns exist, dependencies installed)

---

## 15. Success Criteria Confirmation

### All Requirements Met:
- ✅ URL pattern understood and documented
- ✅ Email system requirements documented (`@theapexway.net`)
- ✅ Database patterns clear (RLS, triggers, indexes)
- ✅ API patterns established (auth, validation, errors)
- ✅ Integration points identified (Autopilot dashboard)
- ✅ Testing strategy defined (Playwright + Vitest)
- ✅ Type conventions documented (string dates, snake_case)
- ✅ No new dependencies needed

### Ready to Proceed:
**YES** - All patterns documented, no blockers identified.

---

## Appendix A: Code Snippets Reference

### A1: Create Supabase Client (Server Component)
```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data, error } = await supabase.from('table_name').select('*');
```

### A2: Create Service Client (Public API)
```typescript
import { createServiceClient } from '@/lib/supabase/service';

const supabase = createServiceClient();
const { data, error } = await supabase.from('table_name').insert({ ... });
```

### A3: Send Tracked Email
```typescript
import { sendTrackedEmail } from '@/lib/services/resend-tracked';

const result = await sendTrackedEmail({
  from: 'Apex <noreply@theapexway.net>',
  to: email,
  subject: 'Subject',
  html: htmlContent,
  triggeredBy: 'system',
  userId: distributorId,
  feature: 'meeting-reservations',
});

if (result.error) {
  console.error('Email error:', result.error);
}
```

### A4: Zod Validation
```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

const validation = schema.safeParse(body);
if (!validation.success) {
  return NextResponse.json(
    { error: validation.error.issues[0].message },
    { status: 400 }
  );
}
```

### A5: Rate Limiting
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  prefix: 'meeting-registration',
});

const ip = request.headers.get('x-forwarded-for') || 'unknown';
const { success } = await ratelimit.limit(ip);

if (!success) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
```

---

**END OF RESEARCH REPORT**

**Date Completed:** 2026-03-22
**Ready for Phase 2:** YES ✅
**Blockers:** None
