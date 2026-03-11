# APEX AFFINITY GROUP — COMPLETE CODEBASE DOCUMENTATION

**Generated:** March 11, 2026
**Version:** 2.4.1
**Repository:** C:\dev\1 - Apex Pre-Launch Site
**Branch:** feature/shadcn-dashboard-redesign
**Status:** Active Development — Finance Dashboard Screens

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Architecture](#database-architecture)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Business Logic Reference](#business-logic-reference)
7. [Component Library](#component-library)
8. [Authentication & Authorization](#authentication--authorization)
9. [Compensation Engine](#compensation-engine)
10. [Key Features](#key-features)
11. [Configuration](#configuration)
12. [Deployment](#deployment)
13. [Development Workflow](#development-workflow)

---

## EXECUTIVE SUMMARY

### Project Overview

**Apex Affinity Group** is a dual-line (insurance + SaaS) MLM platform built for recruiting, training, and compensating independent distributors. The system supports:

- **Multi-level marketing compensation** (16 commission types, 7-phase calculation)
- **Matrix placement** (3-leg binary tree with spillover)
- **Insurance licensing** integration (Winflex SSO)
- **SaaS product distribution** (AgentPulse, PulseMarket, PulseFlow)
- **Training platform** with gamification
- **CFO finance dashboard** for compensation configuration
- **Admin portal** for distributor management

### Statistics

| Metric | Count |
|--------|-------|
| **Total Files** | 358 TypeScript files |
| **Lines of Code** | ~50,000 LOC |
| **API Endpoints** | 59 routes |
| **Database Tables** | 80+ tables |
| **Migrations** | 51 SQL files |
| **Edge Functions** | 3 serverless |
| **React Components** | 250+ components |
| **Business Logic Modules** | 50+ modules |
| **Documentation Files** | 33 markdown files |

### Business Model

**Revenue Streams:**
1. Insurance commissions (Life, Annuities, Disability, LTC)
2. SaaS subscriptions (Member & Retail pricing)
3. Business Center package sales ($149/ea, $5 to promotion fund)

**Compensation Plan:**
- Retail commissions (weekly)
- Customer Acquisition Bonuses ($50 CAB, 60-day hold)
- Matrix commissions (7 levels, rank-based rates)
- Matching bonuses (3 generations, $25k cap)
- Override bonuses (rank differential)
- Infinity bonuses (Level 8+, coded infinity)
- Fast start, rank advancement, car, vacation bonuses
- Builder & achievement bonuses (promotion fund)
- Check match (sponsor override match)

---

## TECHNOLOGY STACK

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1 | React framework (App Router) |
| **React** | 19.0 | UI library |
| **TypeScript** | 5.7 | Type safety |
| **Tailwind CSS** | 4.0 | Styling |
| **shadcn/ui** | Latest | Component library |
| **React Hook Form** | 7.54 | Form management |
| **Zod** | 3.24 | Schema validation |
| **Recharts** | 2.15 | Data visualization |
| **Lucide React** | 0.469 | Icon library |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase** | 2.49 | PostgreSQL database + Auth |
| **Edge Functions** | Deno | Serverless (Stripe webhooks, notifications, BV snapshots) |
| **Stripe** | 18.4 | Payment processing |
| **Resend** | 4.0 | Email delivery |
| **OpenAI** | 4.77 | AI features (photo analysis, bio rewrite) |
| **Upstash Redis** | 1.35 | Caching & rate limiting |

### Testing & Dev Tools

| Tool | Purpose |
|------|---------|
| **Playwright** | E2E testing |
| **Vitest** | Unit testing |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **TypeScript** | Type checking |

### Deployment

| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting |
| **Supabase Cloud** | Database & Auth |
| **Stripe** | Payment processing |
| **Resend** | Email delivery |
| **Upstash** | Redis hosting |

---

## PROJECT STRUCTURE

### Root Directory

```
/
├── src/                          [Application source code]
├── supabase/                     [Database migrations & functions]
├── mockups/                      [UX Magic design mockups]
├── public/                       [Static assets]
├── docs/                         [Additional documentation]
├── tests/                        [Test files]
├── .env.example                  [Environment template]
├── package.json                  [Dependencies & scripts]
├── tsconfig.json                 [TypeScript config]
├── next.config.ts                [Next.js config]
├── tailwind.config.ts            [Tailwind config]
├── middleware.ts                 [Request middleware]
├── CLAUDE.md                     [CodeBakers workflow]
├── DEPENDENCY-AUDIT.md           [Dependency analysis]
├── EMERGENCY-SECURITY-FIXES.md   [Security fixes log]
├── COMPLETE-CODEBASE-DOCUMENTATION.md [This file]
└── README.md                     [Project overview]
```

### src/ Directory Structure

```
src/
├── app/                          [Next.js App Router]
│   ├── (public)/                 [Public pages - no auth]
│   │   ├── page.tsx              [Landing page]
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── about/
│   │   └── [slug]/               [Replicated profile pages]
│   ├── dashboard/                [Rep dashboard - auth required]
│   ├── finance/                  [CFO finance dashboard - CFO only]
│   ├── admin/                    [Admin portal - admin only]
│   ├── api/                      [API routes]
│   ├── layout.tsx                [Root layout]
│   └── globals.css               [Global styles]
├── components/                   [React components]
│   ├── ui/                       [shadcn/ui components]
│   ├── admin/                    [Admin components]
│   ├── dashboard/                [Dashboard widgets]
│   ├── finance/                  [Finance components]
│   ├── forms/                    [Form components]
│   ├── genealogy/                [Tree rendering]
│   ├── training/                 [Training UI]
│   └── [...]
├── lib/                          [Business logic]
│   ├── compensation/             [Commission engine]
│   ├── supabase/                 [Database clients]
│   ├── auth/                     [Auth helpers]
│   ├── email/                    [Email system]
│   ├── genealogy/                [Tree operations]
│   ├── matrix/                   [Matrix placement]
│   ├── services/                 [External services]
│   ├── validations/              [Validation schemas]
│   └── [...]
└── types/                        [TypeScript types]
```

---

## DATABASE ARCHITECTURE

### Core Tables (30+ tables)

#### User & Organization

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **distributors** | Rep profiles | id, email, first_name, last_name, sponsor_id, rank, status, role |
| **distributor_genealogy** | Sponsor hierarchy | id, distributor_id, ancestor_id, depth |
| **distributor_matrix** | Matrix positions | id, distributor_id, parent_id, position (L/C/R), level |
| **customers** | Customer records | id, rep_id, first_name, last_name, email, status |
| **products** | Product catalog | id, name, slug, retail_price_cents, wholesale_price_cents, bv |

#### Compensation & Commissions

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **commission_runs** | Monthly runs | id, month, year, status, total_payout_cents |
| **commissions_retail** | Retail commissions | id, rep_id, amount, status, week_ending |
| **commissions_cab** | CAB records | id, rep_id, customer_id, amount, state, release_eligible_date |
| **commissions_matrix** | Matrix bonuses | id, rep_id, level, amount, month_year |
| **commissions_matching** | Matching bonuses | id, rep_id, generation, amount, cap_applied |
| **commissions_override** | Override bonuses | id, rep_id, from_rep_id, rank_diff, amount |
| **commissions_infinity** | Infinity bonuses | id, rep_id, level, percent, amount |
| **commissions_[...]** | 16 commission types total | Various fields |

#### Commission Engine Config (20+ tables)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **ranks** | Rank definitions | id, name, slug, personal_bv_req, team_bv_req |
| **matrix_level_rates** | Matrix payout rates | id, rank_id, level, rate_percent |
| **matching_bonus_rates** | Matching rates | id, rank_id, generation, rate_percent, monthly_cap |
| **override_rates** | Override rates | id, from_rank, to_rank, rate_percent |
| **bonus_triggers** | Bonus thresholds | id, bonus_type, threshold_bv, amount |
| **waterfall_config** | Revenue split | id, botmakers_percent, seller_percent, override_percent |
| **[...]** | 15+ more config tables | Various |

#### BV & Orders

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **orders** | Order history | id, rep_id, customer_id, product_id, gross_amount_cents, bv_amount, status |
| **bv_snapshots** | Monthly BV freezes | id, rep_id, snapshot_month, personal_bv, team_bv, org_bv, rank_at_snapshot |
| **org_bv_cache** | Real-time BV | id, rep_id, personal_bv, team_bv, org_bv, last_calculated_at |
| **subscription_renewals** | Renewal tracking | id, rep_id, customer_id, renewal_date, status, stripe_invoice_id |

#### Training & Content

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **training_content** | Training modules | id, title, description, category, type, url |
| **training_episodes** | Video episodes | id, content_id, episode_number, title, vimeo_id, duration_seconds |
| **training_progress** | Progress tracking | id, distributor_id, content_id, episode_id, completed, watch_time |
| **gamification_badges** | Badges | id, name, description, icon, criteria |
| **leaderboards** | Leaderboards | id, name, metric, period |

#### Communications

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **notifications** | In-app notifications | id, user_id, type, title, message, read, created_at |
| **email_templates** | Email templates | id, name, subject, body_html, variables |
| **email_campaigns** | Email campaigns | id, name, template_id, status, scheduled_at |
| **email_campaign_sends** | Send tracking | id, campaign_id, distributor_id, status, sent_at, opened_at |

#### System & Admin

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **audit_log** | Activity audit trail | id, actor_id, action, table_name, record_id, changes, timestamp |
| **change_log** | Finance change log | id, changed_by, table_name, record_id, field, old_value, new_value |
| **feature_flags** | Feature toggles | id, key, enabled, description |
| **waitlist** | Pre-launch waitlist | id, email, first_name, invited, invited_at |

### Database Functions

| Function | Purpose |
|----------|---------|
| `recalculate_sponsor_chain(rep_id)` | Recalculate BV up sponsor chain |
| `get_promotion_fund_balance()` | Get current promotion fund balance |
| `calculate_renewal_rate(rep_id, month)` | Calculate renewal rate for rep |
| `is_rep_active(rep_id, month)` | Check if rep meets activity requirement |
| `get_carry_forward(rep_id, month)` | Get carry forward from prior month |
| `handle_termination(rep_id)` | Re-sponsor downline on termination |

### Row Level Security (RLS)

**Enabled on 6 critical tables:**
- `distributors` — Users see only their own record; Admins/CFOs see all
- `customers` — Reps see only their own customers
- `notifications` — Users see only their own notifications
- `orders` — Reps see only their own orders
- `commissions` — Reps see only their own commissions
- `audit_log` — Admin/CFO only

**Policy Pattern:**
```sql
-- Example: Reps can view own customers
CREATE POLICY "Reps can view own customers"
  ON public.customers
  FOR SELECT
  USING (
    rep_id IN (
      SELECT id FROM public.distributors
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );
```

---

## API ENDPOINTS REFERENCE

### Authentication (4 endpoints)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/auth/signin` | Sign in with email/password | Public |
| POST | `/api/auth/signout` | Sign out current user | Auth |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| POST | `/api/auth/reset-password` | Reset password with token | Public |

### Profile Management (10 endpoints)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET/PUT | `/api/profile/personal` | Get/update personal info | Auth |
| GET/PUT | `/api/profile/password` | Change password | Auth |
| GET/POST | `/api/profile/payment` | Bank account management | Auth |
| GET/POST | `/api/profile/tax` | Tax information (W9) | Auth |
| GET/PUT | `/api/profile/notifications` | Notification preferences | Auth |
| GET | `/api/profile/sessions` | Active sessions | Auth |
| DELETE | `/api/profile/sessions/:id` | Revoke session | Auth |
| POST | `/api/profile/upload-photo` | Upload profile photo | Auth |
| GET | `/api/profile/licensing-status` | Get licensing status | Auth |
| POST | `/api/profile/resend-welcome` | Resend welcome email | Auth |

### Admin — Distributors (20+ endpoints)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/admin/distributors` | List distributors with filters | Admin |
| POST | `/api/admin/distributors` | Create new distributor | Admin |
| GET | `/api/admin/distributors/:id` | Get distributor details | Admin |
| PUT | `/api/admin/distributors/:id` | Update distributor | Admin |
| DELETE | `/api/admin/distributors/:id` | Soft delete distributor | Admin |
| GET | `/api/admin/distributors/:id/activity` | Get activity log | Admin |
| GET | `/api/admin/distributors/:id/downline` | Get downline tree | Admin |
| GET | `/api/admin/distributors/:id/matrix-children` | Get matrix children | Admin |
| GET | `/api/admin/distributors/:id/matrix-position` | Get matrix position | Admin |
| GET | `/api/admin/distributors/:id/sponsors` | Get sponsor chain | Admin |
| GET | `/api/admin/distributors/:id/team-statistics` | Get team stats | Admin |
| POST | `/api/admin/distributors/:id/suspend` | Suspend distributor | Admin |
| POST | `/api/admin/distributors/:id/reset-password` | Force password reset | Admin |
| POST | `/api/admin/distributors/:id/change-email` | Change email | Admin |
| POST | `/api/admin/distributors/:id/resend-welcome` | Resend welcome | Admin |
| GET/POST/PUT | `/api/admin/distributors/:id/notes` | Manage notes | Admin |
| GET | `/api/admin/distributors/:id/licensing-status` | Get licensing | Admin |
| DELETE | `/api/admin/distributors/:id/permanent-delete` | Permanent delete | Admin |

### Admin — Compensation (4 endpoints)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST/GET | `/api/admin/compensation/run` | Run/get commission run | CFO/Admin |
| POST/GET | `/api/admin/compensation/cab-processing` | Process CAB transitions | CFO/Admin |
| POST/GET | `/api/admin/compensation/stress-test` | Run stress tests | CFO/Admin |
| POST | `/api/admin/commissions/run` | Legacy commission run | Admin |

### Admin — Matrix (8 endpoints)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/admin/matrix` | Get full matrix | Admin |
| GET | `/api/admin/matrix/level/:level` | Get specific level | Admin |
| GET | `/api/admin/matrix/available-parents` | Find placement parents | Admin |
| GET | `/api/admin/matrix/available-positions` | Find open positions | Admin |
| POST | `/api/admin/matrix/place` | Place in matrix | Admin |
| POST | `/api/admin/matrix/place-existing` | Place existing rep | Admin |
| POST | `/api/admin/matrix/create-and-place` | Create & place | Admin |
| GET | `/api/admin/matrix/unplaced-reps` | Get unplaced reps | Admin |

### Admin — Products & Services (6 endpoints)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET/POST | `/api/admin/products` | List/create products | Admin |
| GET/PUT/DELETE | `/api/admin/products/:id` | Manage product | Admin |
| GET | `/api/admin/services/usage` | Get service usage | Admin |
| GET | `/api/admin/services/budget` | Get budget status | Admin |
| POST | `/api/admin/services/collect-platform` | Collect usage data | Admin |

### Admin — Payouts (4 endpoints)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/admin/payouts` | List payout batches | Admin |
| GET | `/api/admin/payouts/:id` | Get batch details | Admin |
| POST | `/api/admin/payouts/:id/approve` | Approve batch | Admin |
| POST | `/api/admin/payouts/:id/generate-ach` | Generate ACH file | Admin |

### Training (8 endpoints)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET/POST | `/api/training/content` | List/create content | Auth |
| GET/PUT/DELETE | `/api/training/content/:id` | Manage content | Auth |
| GET/POST | `/api/training/episodes` | List/create episodes | Auth |
| GET/PUT/DELETE | `/api/training/episodes/:id` | Manage episode | Auth |

### Email (6 endpoints)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET/POST | `/api/admin/email-templates` | List/create templates | Admin |
| GET/PUT/DELETE | `/api/admin/email-templates/:id` | Manage template | Admin |
| POST | `/api/admin/email-templates/generate` | Generate email HTML | Admin |
| POST | `/api/test-email` | Send test email | Auth |

### AI Features (3 endpoints)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/ai/analyze-photo` | Analyze profile photo | Auth |
| POST | `/api/ai/enhance-photo` | Enhance photo | Auth |
| POST | `/api/ai/rewrite-bio` | Rewrite bio with AI | Auth |

### Business Cards (3 endpoints)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/business-cards/products` | List BC products | Auth |
| POST | `/api/business-cards/order` | Place BC order | Auth |
| GET/POST/PUT | `/api/admin/business-card-templates` | Manage templates | Admin |

### Misc (10+ endpoints)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/signup` | Create new distributor account | Public |
| GET | `/api/check-slug` | Check slug availability | Public |
| POST | `/api/invites/send` | Send invitation | Auth |
| GET | `/api/activity-feed` | Get activity feed | Auth |
| POST | `/api/init-profile` | Initialize profile | Auth |
| GET/POST | `/api/prospects` | Manage prospects | Auth |
| POST | `/api/cron/nurture-send` | Send nurture emails (cron) | Cron |
| POST | `/api/cron/collect-platform-usage` | Collect usage (cron) | Cron |

---

## BUSINESS LOGIC REFERENCE

### src/lib/compensation/ — Commission Engine (8 files)

#### waterfall.ts — Revenue Waterfall

**Purpose:** Splits gross revenue into Botmakers fee, seller commission, and override pool.

**Key Functions:**
```typescript
calculateWaterfall(grossPrice: number, isBizCenter: boolean): WaterfallResult
calculateMargins(result: WaterfallResult): MarginBreakdown
validateWaterfall(result: WaterfallResult, expected: any, tolerance: number): string[]
```

**Waterfall Formula (Non-Business Center):**
- Gross Revenue: 100%
- Botmakers Fee: 27% of gross
- Seller Commission: 26% of gross
- Override Pool: 47% of gross

**Waterfall Formula (Business Center $149):**
- Botmakers Fee: $40.23
- Seller Commission: $38.74
- Override Pool: $70.03

#### bonuses.ts — Bonus Calculations

**Purpose:** Calculate all bonus types (CAB, Customer Milestone, Retention, Fast Start, etc.)

**Key Functions:**
```typescript
calculateCAB(customerCount: number): number
calculateCustomerMilestone(customerCount: number): number
calculateRetentionBonus(renewalRate: number, isActive: boolean): number
calculateFastStart(daysActive: number, personalBV: number): number
```

**Bonus Formulas:**
- CAB: $50 per customer (60-day hold, capped at 15/month)
- Customer Milestone: Tiered ($50 at 5, $100 at 10, $200 at 15, $500 at 20, $1000 at 30)
- Retention: $50-$100 based on 80%+ renewal rate
- Fast Start: 3% personal BV bonus (first 30 days)

#### rank.ts — Rank Determination

**Purpose:** Evaluate rank qualification based on BV and team structure.

**Key Functions:**
```typescript
evaluateRank(personal_bv: number, team_bv: number, org_bv: number): string
validateRankEvaluation(rank: string, bv: any, expected: any): string[]
```

**Rank Thresholds (SaaS):**
- Associate: 0 personal BV, 0 team BV
- Bronze: 50 personal BV, 200 team BV
- Silver: 100 personal BV, 500 team BV
- Gold: 200 personal BV, 1500 team BV
- Platinum: 300 personal BV, 5000 team BV

#### commission-run.ts — Commission Orchestrator

**Purpose:** Execute monthly commission calculation (7-phase process).

**Key Function:**
```typescript
executeCommissionRun(month: number, year: number, db: SupabaseClient): Promise<RunResult>
```

**7 Phases:**
1. **Seller Commission** — Calculate retail commissions
2. **Override Allocation** — Calculate override bonuses by rank differential
3. **Bonuses** — Calculate all bonus types (CAB, Milestone, Retention, Matrix, Matching, Infinity, etc.)
4. **Subtotal** — Sum phases 1-3
5. **Check Match** — Match sponsor's override
6. **Threshold & Carry Forward** — Apply $25 minimum, carry forward if under
7. **Lock & Commit** — Lock BV snapshots, commit to database

#### cab-state-machine.ts — CAB State Management

**Purpose:** Manage CAB lifecycle (PENDING → EARNED or VOIDED).

**Key Functions:**
```typescript
processCABTransitions(db: SupabaseClient): Promise<{ earned: number, voided: number }>
```

**CAB States:**
- **PENDING** — Waiting for 60-day hold period
- **EARNED** — Released after 60 days (customer still active)
- **VOIDED** — Customer cancelled within 60 days
- **CLAWBACK** — Customer cancelled within 60 days, commission recovered

#### config.ts — Configuration

**Purpose:** Centralized compensation plan configuration.

**Key Exports:**
```typescript
PRODUCT_PRICES: { PulseMarket: {...}, PulseFlow: {...}, ... }
COMP_PLAN_CONFIG: {
  rank_thresholds: {...},
  matrix_level_rates: {...},
  matching_bonus_rates: {...},
  bonuses: {...},
  minimum_payout: 25,
  ...
}
```

#### compression.ts — Compression Logic

**Purpose:** Handle inactive rep skip logic (compression up to active upline).

**Key Functions:**
```typescript
compressUpline(repId: string, level: number, db: SupabaseClient): Promise<string | null>
```

#### types.ts — Type Definitions

**Purpose:** TypeScript types for compensation system.

**Key Types:**
```typescript
interface WaterfallResult { ... }
interface CommissionRunResult { ... }
interface BonusCalculation { ... }
```

### src/lib/genealogy/ — Tree Operations (1 file)

#### tree-service.ts

**Purpose:** Build and traverse sponsor hierarchies.

**Key Functions:**
```typescript
buildSponsorTree(rootId: string, maxDepth: number, db: SupabaseClient): Promise<TreeNode>
getSponsorChain(repId: string, db: SupabaseClient): Promise<string[]>
getDownlineCount(repId: string, db: SupabaseClient): Promise<number>
```

### src/lib/matrix/ — Matrix Placement (1 file)

#### placement.ts

**Purpose:** Binary matrix placement algorithm (3-leg tree with spillover).

**Key Functions:**
```typescript
findNextAvailablePosition(parentId: string, db: SupabaseClient): Promise<Position>
placeInMatrix(repId: string, parentId: string, position: 'L' | 'C' | 'R', db: SupabaseClient): Promise<void>
```

### src/lib/auth/ — Authentication (3 files)

#### admin.ts

**Purpose:** Admin authentication and authorization.

**Key Functions:**
```typescript
requireAdmin(): Promise<AdminContext>  // For pages (redirects)
getAdminUser(): Promise<AdminContext | null>  // For API routes
hasAdminRole(admin: Admin, requiredRole: AdminRole): boolean
```

#### finance.ts (NEW — Security Fix)

**Purpose:** CFO/Finance authentication and authorization.

**Key Functions:**
```typescript
requireFinanceAccess(): Promise<FinanceContext>  // For pages (redirects)
getFinanceUser(): Promise<FinanceContext | null>  // For API routes
hasFinanceAccess(distributor: Distributor): boolean
```

#### server.ts

**Purpose:** Supabase server-side auth helpers.

**Key Functions:**
```typescript
getUser(): Promise<User | null>
getSession(): Promise<Session | null>
```

### src/lib/email/ — Email System (10 files)

#### resend.ts

**Purpose:** Resend API integration.

**Key Functions:**
```typescript
sendEmail(to: string, subject: string, html: string): Promise<EmailResult>
```

#### template-variables.ts

**Purpose:** Email variable substitution engine.

**Key Functions:**
```typescript
substituteVariables(template: string, variables: Record<string, any>): string
```

#### campaign-service.ts

**Purpose:** Email campaign management.

**Key Functions:**
```typescript
createCampaign(name: string, templateId: string, distributorIds: string[]): Promise<Campaign>
sendCampaign(campaignId: string): Promise<void>
```

### src/lib/services/ — External Services (6 files)

#### openai-tracked.ts

**Purpose:** OpenAI API with cost tracking.

**Key Functions:**
```typescript
createTrackedCompletion(prompt: string, model: string, userId: string): Promise<TrackedResult>
```

#### redis-tracked.ts

**Purpose:** Redis operations with cost tracking.

**Key Functions:**
```typescript
get(key: string): Promise<any>
set(key: string, value: any, ttl?: number): Promise<void>
```

#### resend-tracked.ts

**Purpose:** Email sending with cost tracking.

**Key Functions:**
```typescript
sendTrackedEmail(to: string, subject: string, html: string, userId: string): Promise<void>
```

### src/lib/supabase/ — Database Clients (4 files)

#### client.ts

**Purpose:** Browser client for client components.

**Usage:**
```typescript
import { createBrowserClient } from '@supabase/ssr';
const supabase = createBrowserClient(url, key);
```

#### server.ts

**Purpose:** Server client for server components and API routes (respects RLS).

**Usage:**
```typescript
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();
```

#### service.ts

**Purpose:** Service role client (bypasses RLS, server-only).

**Usage:**
```typescript
import { createServiceClient } from '@/lib/supabase/service';
const supabase = createServiceClient();
```

**⚠️ CRITICAL:** Service client bypasses RLS - use only for:
- System operations (commission runs, BV snapshots)
- Admin operations (after authentication check)
- Edge functions (Stripe webhooks, notifications)

#### middleware.ts

**Purpose:** Middleware auth refresh.

---

## COMPONENT LIBRARY

### shadcn/ui Components (src/components/ui/)

**Base Components (50+):**
- `button.tsx`, `input.tsx`, `select.tsx`, `textarea.tsx`
- `dialog.tsx`, `sheet.tsx`, `popover.tsx`, `dropdown-menu.tsx`
- `card.tsx`, `table.tsx`, `tabs.tsx`, `accordion.tsx`
- `alert.tsx`, `badge.tsx`, `avatar.tsx`, `separator.tsx`
- `toast.tsx`, `tooltip.tsx`, `skeleton.tsx`, `progress.tsx`
- And more...

### Admin Components (src/components/admin/)

- `distributor-table.tsx` — Paginated distributor list
- `commission-run-controls.tsx` — Commission run UI
- `matrix-visualizer.tsx` — Matrix tree display
- `activity-timeline.tsx` — Activity log timeline
- `payout-batch-table.tsx` — Payout batch manager
- `email-template-editor.tsx` — WYSIWYG email editor

### Dashboard Components (src/components/dashboard/)

- `earnings-card.tsx` — Earnings summary card
- `downline-stats.tsx` — Downline statistics
- `commission-breakdown.tsx` — Commission breakdown chart
- `activity-feed.tsx` — Recent activity feed
- `quick-actions.tsx` — Quick action buttons

### Finance Components (src/components/finance/)

- `waterfall-calculator.tsx` — Waterfall simulator
- `bonus-weighting-editor.tsx` — Weighting config
- `rank-threshold-editor.tsx` — Rank config
- `commission-run-simulator.tsx` — Pre-run simulation

### Genealogy Components (src/components/genealogy/)

- `sponsor-tree.tsx` — Recursive tree renderer
- `matrix-tree.tsx` — Binary matrix tree
- `tree-node.tsx` — Individual tree node
- `tree-controls.tsx` — Zoom, pan, filter controls

### Training Components (src/components/training/)

- `video-player.tsx` — Vimeo video player
- `course-card.tsx` — Course card with progress
- `episode-list.tsx` — Episode list with checkmarks
- `badge-display.tsx` — Earned badges
- `leaderboard.tsx` — Leaderboard table

---

## AUTHENTICATION & AUTHORIZATION

### Auth Flow

```
1. User visits /login
2. Submit email + password → /api/auth/signin
3. Supabase validates credentials
4. Session cookie set
5. Redirect to /dashboard
6. Middleware refreshes session on each request
7. Server components use createClient() → respects RLS
8. Client components use createBrowserClient() → respects RLS
```

### Role-Based Access Control (RBAC)

**Roles:**
- **Distributor** (default) — Rep dashboard access
- **Admin** — Admin portal access, distributor management
- **CFO** — Finance dashboard access, compensation configuration
- **Support** — Limited admin access (future)

**Role Storage:**
- `distributors.role` field (admin, cfo, distributor)
- `admins` table (separate admin records with role hierarchy)

**Access Control Patterns:**

#### Page-Level Protection
```typescript
// Finance page (CFO only)
import { requireFinanceAccess } from '@/lib/auth/finance';

export default async function FinancePage() {
  const { distributor } = await requireFinanceAccess();
  // ... page content
}
```

#### API Route Protection
```typescript
// Finance API route (CFO only)
import { getFinanceUser } from '@/lib/auth/finance';

export async function POST(request: NextRequest) {
  const financeUser = await getFinanceUser();
  if (!financeUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... API logic
}
```

#### Middleware Protection
```typescript
// src/middleware.ts
if (request.nextUrl.pathname.startsWith('/finance')) {
  const { data: distributor } = await supabase
    .from('distributors')
    .select('role')
    .eq('email', user.email)
    .single();

  if (!['cfo', 'admin'].includes(distributor.role)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}
```

### Row Level Security (RLS)

**Policy Examples:**

```sql
-- Reps can view their own commissions
CREATE POLICY "Reps can view own commissions"
  ON public.commissions
  FOR SELECT
  USING (
    rep_id IN (
      SELECT id FROM public.distributors
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- CFOs and Admins can view all commissions
CREATE POLICY "CFOs and Admins can view all commissions"
  ON public.commissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role IN ('admin', 'cfo')
    )
  );
```

---

## COMPENSATION ENGINE

### 16 Commission Types

| Type | Frequency | Criteria | Amount/Rate |
|------|-----------|----------|-------------|
| **Retail** | Weekly | Retail sale | Retail - Wholesale |
| **CAB** | Monthly | New customer | $50 (60-day hold) |
| **Customer Milestone** | One-time | Customer count | $50-$1000 (tiered) |
| **Retention** | Monthly | 80%+ renewal rate | $50-$100 |
| **Matrix** | Monthly | Active, downline BV | Level 1-7, rank-based % |
| **Matching** | Monthly | Active, 3 generations | Gen 1-3, rank-based %, $25k cap |
| **Override** | Monthly | Rank differential | Rank-based % |
| **Infinity** | Monthly | Level 8+ | 1-3% (coded infinity) |
| **Fast Start** | One-time | First 30 days | 3% personal BV |
| **Rank Advancement** | One-time | Rank promotion | $250-$50k |
| **Car** | Monthly | Gold+ rank | $500-$2k/month, $3k cap |
| **Vacation** | One-time | Rank milestone | $500-$30k |
| **Infinity Pool** | Monthly | Top producers | 3% of company BV |
| **Check Match** | Monthly | Sponsor override match | Match sponsor's override |
| **Builder Bonus** | Monthly | Promotion fund | Allocation |
| **Achievement Bonus** | Monthly | Promotion fund | Allocation |

### 7-Phase Commission Run

```
Phase 1: Seller Commission
  ├─ Calculate retail commissions (weekly)
  └─ Calculate seller portion from waterfall

Phase 2: Override Allocation
  ├─ Calculate override bonuses by rank differential
  └─ Apply compression (skip inactive reps)

Phase 3: Bonuses
  ├─ CAB (release eligible + new)
  ├─ Customer Milestone
  ├─ Retention
  ├─ Matrix (Levels 1-7)
  ├─ Matching (Gen 1-3)
  ├─ Infinity (Level 8+)
  ├─ Fast Start
  ├─ Rank Advancement
  ├─ Car
  ├─ Vacation
  ├─ Infinity Pool
  ├─ Builder Bonus
  └─ Achievement Bonus

Phase 4: Subtotal
  └─ Sum Phases 1-3

Phase 5: Check Match
  └─ Match sponsor's override (if qualified)

Phase 6: Threshold & Carry Forward
  ├─ Apply $25 minimum payout
  ├─ If under $25 → carry forward to next month
  └─ Otherwise → payout

Phase 7: Lock & Commit
  ├─ Lock BV snapshots
  ├─ Mark commission run as complete
  └─ Create payout batch
```

### BV (Business Volume) System

**BV Sources:**
1. Personal orders (member pricing)
2. Customer orders (retail pricing)
3. Business Center sales (fixed $149 BV)

**BV Calculations:**
- **Personal BV** — Rep's own purchases + customer purchases attributed to rep
- **Team BV** — Sum of direct downline personal BV
- **Org BV** — Sum of entire downline personal BV (recursive)

**BV Snapshots:**
- Taken monthly (before commission run)
- Frozen for rank evaluation
- Cannot be modified after lock

**BV Weighting (Insurance Products):**
- Life Insurance: 100% (1:1 premium to BV)
- Annuities: 4% (25:1 premium to BV)
- Disability: 50% (2:1 premium to BV)
- Long-Term Care: 50% (2:1 premium to BV)
- SaaS: 30% (3.33:1 price to BV)

### Promotion Fund

**Source:** $5 from each Business Center sale

**Allocation:**
- Builder Bonus (performance-based)
- Achievement Bonus (milestone-based)

**Ledger Tracking:**
- All credits/debits recorded
- Running balance maintained
- Transparent allocation to reps

---

## KEY FEATURES

### 1. Multi-Level Compensation

- 16 commission types
- 7-phase monthly calculation
- Rank-based rates
- Compression logic
- $25 minimum payout
- Carry forward support

### 2. Matrix Placement

- 3-leg binary tree (L/C/R)
- Automatic spillover
- Level-based commissions (7 levels)
- Infinity bonuses (Level 8+)
- Matrix visualization

### 3. Rep Dashboard

- Earnings overview
- Commission breakdown
- Downline genealogy
- Matrix visualization
- Customer management
- Training access
- Profile settings

### 4. Admin Portal

- Distributor management
- Commission configuration
- Matrix administration
- Payout batch approval
- ACH file generation
- Email campaigns
- Activity audit log

### 5. Finance Dashboard (CFO)

- Compensation engine configuration
- Bonus weighting
- Commission waterfall
- Rank promotion thresholds
- Commission run controls
- Stress testing
- Financial reporting

### 6. Training Platform

- Video content (Vimeo integration)
- Audio courses
- Episode tracking
- Progress monitoring
- Gamification (badges, leaderboards)
- Completion certificates

### 7. Email System

- Campaign management
- Template builder
- Variable substitution
- Scheduled sends
- Open/click tracking
- Resend integration

### 8. Business Cards

- Product catalog
- Custom templates
- Online ordering
- Template preview
- Order history

### 9. Licensed Agent Integration

- Winflex SSO
- Licensing status tracking
- Carrier assignments
- Appointment tracking

### 10. Cost Tracking

- OpenAI usage
- Redis operations
- Email sends
- Vercel analytics
- Supabase queries
- Budget alerts

---

## CONFIGURATION

### Environment Variables (.env.example)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email (Resend)
RESEND_API_KEY=re_xxx

# OpenAI
OPENAI_API_KEY=sk-xxx

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Winflex SSO
WINFLEX_SSO_URL=https://xxx.winflex.com
WINFLEX_API_KEY=xxx

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Design Tokens (tailwind.config.ts)

```typescript
colors: {
  primary: {
    50: '#E6EBF5',
    100: '#CCD8EB',
    // ... Navy #1B3A7D
    800: '#1B3A7D',
    900: '#0F1F42',
  },
  secondary: {
    50: '#FDEAEA',
    // ... Red #C7181F
    700: '#C7181F',
  },
  neutral: {
    50: '#F8F9FA',
    // ... Grays
    900: '#1A1A1A',
  },
},
borderRadius: {
  small: '0.375rem',
  medium: '0.5rem',
  large: '0.75rem',
},
boxShadow: {
  custom: '0 1px 3px rgba(0, 0, 0, 0.08)',
  'custom-hover': '0 4px 12px rgba(0, 0, 0, 0.12)',
},
```

### Commission Plan Config (src/lib/compensation/config.ts)

```typescript
export const COMP_PLAN_CONFIG = {
  rank_thresholds: {
    Associate: { personal_bv: 0, team_bv: 0 },
    Bronze: { personal_bv: 50, team_bv: 200 },
    Silver: { personal_bv: 100, team_bv: 500 },
    Gold: { personal_bv: 200, team_bv: 1500 },
    Platinum: { personal_bv: 300, team_bv: 5000 },
  },
  matrix_level_rates: {
    Associate: [10, 5, 3, 2, 1, 1, 1],
    Bronze: [15, 8, 5, 3, 2, 1, 1],
    Silver: [20, 10, 7, 5, 3, 2, 1],
    Gold: [25, 15, 10, 7, 5, 3, 2],
    Platinum: [30, 20, 15, 10, 7, 5, 3],
  },
  bonuses: {
    cab: { amount: 50, retention_days: 60, monthly_cap: 15 },
    customer_milestone: { 5: 50, 10: 100, 15: 200, 20: 500, 30: 1000 },
    retention: { rate_80: 50, rate_90: 75, rate_95: 100 },
    fast_start: { days: 30, rate: 0.03 },
  },
  minimum_payout: 25,
};
```

---

## DEPLOYMENT

### Vercel Deployment

**Build Command:**
```bash
npm run build
```

**Environment Variables:** Set all `.env` variables in Vercel dashboard

**Deployment Trigger:** Automatic on `git push` to `main` branch

### Supabase Deployment

**Apply Migrations:**
```bash
cd supabase
supabase db push
```

**Deploy Edge Functions:**
```bash
supabase functions deploy stripe-webhook
supabase functions deploy send-notification
supabase functions deploy snapshot-monthly-bv
```

**Set Secrets:**
```bash
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set STRIPE_SECRET_KEY=sk_xxx
```

### Database Backup

**Manual Backup:**
```bash
supabase db dump -f backup.sql
```

**Automated Backups:** Enabled in Supabase dashboard (daily)

### Monitoring

- **Vercel Analytics** — Performance monitoring
- **Supabase Logs** — Database query logs
- **Sentry** (future) — Error tracking
- **Cost Tracking** — Built-in usage monitoring

---

## DEVELOPMENT WORKFLOW

### Setup

```bash
# Clone repository
git clone [repo-url]
cd "1 - Apex Pre-Launch Site"

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Fill in .env.local with your credentials

# Run development server
npm run dev
```

### Branch Strategy

- `main` — Production branch
- `feature/shadcn-dashboard-redesign` — Current feature branch
- `feature/*` — Feature branches
- `fix/*` — Bug fix branches
- `hotfix/*` — Emergency fixes

### Code Style

- **TypeScript** — Strict mode enabled
- **ESLint** — Enforce code quality
- **Prettier** — Code formatting
- **React** — Functional components, hooks
- **Naming** — camelCase for functions, PascalCase for components

### Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run type check
npm run type-check

# Run linter
npm run lint
```

### Database Changes

1. Create migration file: `supabase migration new [name]`
2. Write SQL in `supabase/migrations/[timestamp]_[name].sql`
3. Apply locally: `supabase db push`
4. Test thoroughly
5. Commit migration file
6. Deploy to production

### Debugging

**Server Logs:**
```bash
npm run dev
# Check terminal output
```

**Database Queries:**
```bash
supabase db studio
# Opens browser-based SQL editor
```

**Edge Function Logs:**
```bash
supabase functions logs stripe-webhook
```

---

## APPENDIX

### Key File Paths Reference

| Purpose | Path |
|---------|------|
| **Landing Page** | `src/app/page.tsx` |
| **Rep Dashboard** | `src/app/dashboard/page.tsx` |
| **Finance Home** | `src/app/finance/page.tsx` |
| **Admin Home** | `src/app/admin/page.tsx` |
| **Commission Engine** | `src/lib/compensation/commission-run.ts` |
| **Waterfall** | `src/lib/compensation/waterfall.ts` |
| **Matrix Placement** | `src/lib/matrix/placement.ts` |
| **Auth Helpers** | `src/lib/auth/admin.ts`, `src/lib/auth/finance.ts` |
| **Supabase Clients** | `src/lib/supabase/client.ts`, `server.ts`, `service.ts` |
| **Design Tokens** | `src/lib/design-system.ts` |
| **Middleware** | `src/middleware.ts` |
| **Migrations** | `supabase/migrations/` |
| **Edge Functions** | `supabase/functions/` |
| **Documentation** | `*.md` files in root |

### Database Schema Visualization

```
distributors (users)
├─ has many → customers
├─ belongs to → sponsor (distributors)
├─ has many → downline (distributors)
├─ has one → matrix_position
├─ has many → orders
├─ has many → commissions (all types)
├─ has many → notifications
└─ has many → training_progress

orders
├─ belongs to → distributor (rep)
├─ belongs to → customer
├─ belongs to → product
└─ has one → commission_run

commissions (16 types)
├─ belongs to → distributor
└─ belongs to → commission_run

commission_runs
├─ has many → commissions
├─ has many → bv_snapshots
└─ has one → payout_batch

payout_batches
├─ has many → payout_items
└─ approved by → admin
```

### Common Tasks

**Add New API Endpoint:**
1. Create `src/app/api/[name]/route.ts`
2. Add authentication check
3. Implement GET/POST/PUT/DELETE handlers
4. Add to this documentation

**Add New Database Table:**
1. Create migration: `supabase migration new add_[table]`
2. Write SQL schema
3. Add RLS policies
4. Create TypeScript types
5. Update documentation

**Add New Commission Type:**
1. Create table in migration: `commissions_[type]`
2. Add calculation function in `src/lib/compensation/bonuses.ts`
3. Add to commission run orchestrator
4. Add to config tables
5. Test thoroughly

**Deploy to Production:**
1. Merge to `main` branch
2. Vercel auto-deploys frontend
3. Apply database migrations: `supabase db push`
4. Deploy edge functions: `supabase functions deploy [name]`
5. Verify deployment
6. Monitor for errors

---

## CHANGELOG

**Version 2.4.1** (Current)
- ✅ Emergency security fixes (finance routes, API auth, RLS)
- ✅ Finance dashboard screens (SaaS engine config)
- ✅ Compensation engine configuration tables
- ✅ Dependency connections (BV snapshots, promotion fund, org cache)
- ⏳ Remaining dependency connections (orders, CAB clawback, renewals)

**Version 2.3.0**
- Dashboard redesign with shadcn/ui
- Training platform with gamification
- Email campaign system
- Business card ordering

**Version 2.0.0**
- Matrix v4 implementation
- Genealogy v4 implementation
- Commission engine v2

---

## SUPPORT & DOCUMENTATION

**Primary Documentation:**
- This file: `COMPLETE-CODEBASE-DOCUMENTATION.md`
- Dependency Audit: `DEPENDENCY-AUDIT.md`
- Security Fixes: `EMERGENCY-SECURITY-FIXES.md`
- Design System: `DESIGN-SYSTEM.md`
- Feature Spec: `APEX_COMPLETE_FEATURE_SPECIFICATION.md`

**External Links:**
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

**For Questions:**
- Check documentation first
- Review code comments
- Ask in team chat
- Escalate to lead developer

---

**End of Complete Codebase Documentation**
**Last Updated:** March 11, 2026
**Maintained By:** Development Team
