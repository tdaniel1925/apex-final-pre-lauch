# APEX AFFINITY GROUP - COMPREHENSIVE FEATURE SPECIFICATION

## PROJECT OVERVIEW

**Platform**: Next.js 16 (React 19) with TypeScript
**Database**: Supabase (PostgreSQL)
**Authentication**: Supabase Auth
**Payment Processing**: Stripe
**Email**: Resend
**Styling**: TailwindCSS v4
**Deployment**: Vercel

**Business Model**: Multi-Level Marketing (MLM) platform for AgentPulse insurance agent tools with 4-tier business center system and 16-stream compensation plan.

---

## 1. AUTHENTICATION & USER MANAGEMENT

### 1.1 User Types
- **Distributors**: Main user type - can be licensed or non-licensed agents
- **Admins**: System administrators with role-based access
- **Prospects**: Pre-signup leads (not yet distributors)
- **Customers**: Retail customers (not distributors)

### 1.2 Authentication Features
**Files**: `src/app/actions/auth.ts`, `src/lib/auth/server.ts`, `src/lib/auth/admin.ts`

**Capabilities**:
- Email/password signup and login
- Password reset flow with token-based verification
- Supabase Auth integration with SSR
- Admin authentication checks
- Session management with middleware

**Database Tables**:
- `auth.users` (Supabase managed)
- `password_reset_tokens` - Token-based password reset system

**API Routes**:
- `/api/auth/*` - Authentication endpoints
- `/api/admin/distributors/[id]/reset-password` - Admin password reset
- `/api/admin/distributors/[id]/change-email` - Admin email change

**Pages**:
- `/login` - Login page
- `/signup` - Multi-step signup with sponsor tracking
- `/signup/credentials` - Credentials collection
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset with token
- `/welcome` - Post-signup welcome page

---

## 2. DISTRIBUTOR SYSTEM

### 2.1 Core Distributor Features
**Database Table**: `distributors` (46 fields)

**Key Fields**:
- Personal info (name, email, phone, address)
- MLM structure (sponsor_id, matrix_parent_id, matrix_position, matrix_depth, rep_number)
- Banking info (ACH details for commission payouts)
- Tax info (SSN/EIN, date of birth)
- Profile (photo, bio, social links)
- Business center tier (free, basic, enhanced, platinum)
- Affiliate code (8-char unique referral code)
- Licensing status (licensed vs non-licensed)
- Onboarding tracking
- Admin flags (is_admin, is_master, status, suspended_at)

### 2.2 Licensing System (Feature Gating)
**Files**: `src/lib/features/access-control.ts`, `src/components/common/FeatureGate.tsx`

**Two User Types**:
1. **Licensed Agents**: Insurance-licensed professionals
   - Access to advanced commission tracking
   - Priority support
   - Professional certifications
   - Client management tools

2. **Non-Licensed**: General distributors
   - Basic commission access
   - Standard support
   - Limited marketing tools

**Feature Categories**:
- Insurance licensing section
- Commission reporting (advanced)
- Training materials (tiered)
- Lead generation (basic + advanced)
- Marketing campaigns
- Business analytics
- Client management

### 2.3 Onboarding System
**Fields**: `onboarding_completed`, `onboarding_step`, `onboarding_permanently_skipped`

**Flow**:
- Multi-step profile completion
- Banking/tax info collection
- Matrix placement
- Welcome email

### 2.4 Distributor Management (Admin)
**Pages**:
- `/admin/distributors` - List all distributors with search/filter
- `/admin/distributors/new` - Create new distributor
- `/admin/distributors/[id]` - Detailed distributor view

**API Routes** (Admin):
- `GET/PUT/DELETE /api/admin/distributors/[id]` - CRUD operations
- `POST /api/admin/distributors/[id]/suspend` - Suspend distributor
- `DELETE /api/admin/distributors/[id]/permanent-delete` - Hard delete
- `POST /api/admin/distributors/[id]/resend-welcome` - Resend welcome email
- `GET /api/admin/distributors/[id]/activity` - Activity log
- `GET /api/admin/distributors/[id]/downline` - Personal downline
- `GET /api/admin/distributors/[id]/team-statistics` - Team stats
- `GET /api/admin/distributors/[id]/sponsors` - Sponsor lineage
- `PUT /api/admin/distributors/[id]/licensing-status` - Update licensing

### 2.5 Admin Notes System
**Database Table**: `admin_notes`

**Features**:
- Internal notes on distributors
- Note types: general, warning, important, follow_up, compliance, password_reset, status_change
- Pinning/priority system
- Follow-up dates and resolution tracking
- Track notes count on distributor record

**Files**: `src/components/admin/NotesPanel.tsx`

---

## 3. MLM STRUCTURE

### 3.1 Dual MLM System

**Two Genealogies**:
1. **Sponsor Tree** (enrollment/recruiting)
   - `sponsor_id` - Who enrolled this distributor
   - Used for: Fast Start bonuses, matching bonuses

2. **Matrix Tree** (binary compensation)
   - `matrix_parent_id` - Parent in 5-wide matrix
   - `matrix_position` - Position under parent (1-5)
   - `matrix_depth` - Level in matrix (1-7, unlimited with infinity)
   - Used for: Matrix commissions, overrides, infinity bonus

### 3.2 Matrix Placement System
**Files**: `src/lib/matrix/placement.ts`, `src/lib/admin/matrix-manager.ts`

**Placement Algorithm**:
- BFS (Breadth-First Search) auto-placement
- 5-wide matrix (each distributor can have 5 direct matrix children)
- 7 levels deep (with infinity at level 8+)
- Admin can manually place or override placement

**API Routes**:
- `GET /api/admin/matrix` - Get matrix tree
- `GET /api/admin/matrix/level/[level]` - Get specific level
- `GET /api/admin/matrix/available-parents` - Find available placement spots
- `GET /api/admin/matrix/available-positions` - Get available positions under parent
- `POST /api/admin/matrix/place` - Place distributor in matrix
- `POST /api/admin/matrix/place-existing` - Move existing distributor
- `POST /api/admin/matrix/create-and-place` - Create + auto-place
- `GET /api/admin/matrix/unplaced-reps` - Find unplaced distributors
- `GET /api/admin/distributors/[id]/matrix-children` - Get matrix children
- `PUT /api/admin/distributors/[id]/matrix-position` - Update matrix position

**Pages**:
- `/admin/matrix` - Admin matrix view
- `/admin/matrix/debug` - Matrix debugging tools
- `/dashboard/matrix` - User matrix view
- `/dashboard/matrix/[id]` - View specific node
- `/admin/genealogy` - Genealogy tree view

**Components**:
- `MatrixView.tsx` - Visual matrix tree
- `MatrixChildren.tsx` - List matrix children
- `MatrixPositionManager.tsx` - Admin placement tool

### 3.3 Rep Number System
**Field**: `rep_number` (auto-generated sequential number)

**Generation**: Atomic function ensures unique sequential numbers

---

## 4. COMPENSATION PLAN (16 INCOME STREAMS)

### 4.1 Configuration
**File**: `src/lib/compensation/config.ts`

**Rank System**:
- INACTIVE (< 50 PBV)
- ASSOCIATE (50 PBV, 0 GBV)
- BRONZE (100 PBV, 500 GBV)
- SILVER (150 PBV, 2,500 GBV)
- GOLD (200 PBV, 10,000 GBV)
- PLATINUM (250 PBV, 25,000 GBV)
- DIAMOND, CROWN DIAMOND, ROYAL DIAMOND (extended ranks)

**BV (Business Volume)**: 1 BV = $1.00 member price

### 4.2 Commission Types

**Database Tables** (16 types):

1. **`commissions_retail`** - Weekly Retail Cash
   - Retail price - wholesale price
   - Paid weekly on Fridays
   - Week-ending tracking

2. **`commissions_cab`** - Customer Acquisition Bonus
   - $5-$75 based on first order BV
   - One-time per customer
   - Retention requirement (60 days)

3. **`commissions_customer_milestone`** - Customer Milestone Bonuses
   - 5, 10, 15, 20, 30 new customers per month
   - Progressive bonuses

4. **`commissions_retention`** - Customer Retention Bonus
   - Active autoship tracking (10, 25, 50, 100 customers)
   - Monthly bonuses

5. **`commissions_matrix`** - Matrix Commissions (Levels 1-7)
   - Commission on each of 7 levels
   - Rate varies by rank
   - Standard vs PowerLine rates
   - Organization tracking (up to 3 orgs)

6. **`commissions_matching`** - Matching Bonus (Gen 1-3)
   - Gen 1: All personally sponsored
   - Gen 2: Next Silver+ in each line
   - Gen 3: Next Silver+ below Gen 2
   - $25k monthly cap

7. **`commissions_override`** - Override Bonuses
   - Earn on lower-ranked downline
   - Rank differential determines rate
   - Compression applied

8. **`commissions_infinity`** - Coded Infinity Bonus (Level 8+)
   - 1%, 2%, or 3% based on rank
   - Unlimited depth beyond Level 7
   - Circuit breaker protection

9. **`commissions_fast_start`** - Fast Start Bonus
   - 4 categories: enrollment, GBV, customer, rank
   - 30-day achievement window
   - 10% to sponsor (upline fast start)

10. **`commissions_rank_advancement`** - Rank Advancement Bonus
    - $250 (Bronze) to $50k (Royal Diamond)
    - Speed multipliers (1x, 1.5x, 2x)
    - Diamond+ paid in 3 installments
    - Momentum bonuses

11. **`commissions_car`** - Car Bonus
    - 4 tiers: Cruiser ($500), Executive ($1k), Prestige ($2k), Apex ($3k)
    - Based on rank + GBV
    - Consecutive month qualification
    - $3k monthly cap across all orgs

12. **`commissions_vacation`** - Vacation Bonus
    - One-time per rank achieved
    - $500 (Bronze) to $30k (Royal Diamond)
    - Cash equivalent option

13. **`commissions_infinity_pool`** - Infinity Pool
    - 3% of company BV
    - Diamond+ only
    - Share-based distribution (1, 2, or 4 shares)
    - Paid on 20th of month

14. **Additional Bonuses** (in config):
    - Gold Accelerator: $3,467
    - Infinity Bonus: $500/month (90 consecutive Platinum days)

### 4.3 Compensation Engine
**Files**:
- `src/lib/compensation/commission-run.ts` - Main calculation engine
- `src/lib/compensation/waterfall.ts` - Payment waterfall logic
- `src/lib/compensation/compression.ts` - Rank compression
- `src/lib/compensation/bonuses.ts` - Bonus calculations
- `src/lib/compensation/cab-state-machine.ts` - CAB processing state machine
- `src/lib/compensation/rank.ts` - Rank evaluation

**Waterfall Structure**:
1. BotMakers Fee: 30%
2. Bonus Pool: 5%
3. Apex Margin: 30%
4. Field Commissions: 35% (60% of remainder)
   - Seller Commission
   - Override Pool (40% of field)

**API Routes**:
- `POST /api/admin/compensation/run` - Run monthly commission calculation
- `POST /api/admin/compensation/stress-test` - Test commission calculations
- `POST /api/admin/compensation/cab-processing` - Process CAB bonuses
- `POST /api/admin/commissions/run` - Alternative commission run endpoint

**Admin Pages**:
- `/admin/commissions` - Commission overview and controls

### 4.4 BV Tracking System
**Database Table**: `bv_snapshots`

**Fields**:
- `month_year` - YYYY-MM format
- `personal_bv` (PBV) - Distributor's own purchases
- `group_bv` (GBV) - Entire downline
- `retail_orders_bv` - From retail customer orders
- `personal_orders_bv` - Distributor's own orders
- `team_orders_bv` - From downline orders
- `active_autoship_customers` - Subscription count
- `is_active` - Met 50 PBV minimum
- `is_locked` - Locked after commission run

### 4.5 Rank History
**Database Table**: `rank_history`

**Tracks**:
- Rank progressions over time
- Qualification details (PBV, GBV, legs)
- Speed tracking for multipliers
- Grace period tracking
- Achievement dates

---

## 5. PAYOUT SYSTEM

### 5.1 Payout Batches
**Database Table**: `payout_batches`

**Features**:
- Monthly payout processing
- Weekly retail payouts
- Infinity pool payouts (20th of month)
- ACH file generation
- Approval workflow
- Status tracking: draft → pending_review → approved → processing → completed
- Safeguard tracking (payout ratio monitoring)

**API Routes**:
- `GET /api/admin/payouts` - List payout batches
- `POST /api/admin/payouts/[id]/approve` - Approve batch
- `POST /api/admin/payouts/[id]/generate-ach` - Generate ACH file

**Admin Page**: `/admin/payouts`

### 5.2 Payout Items
**Database Table**: `payout_items`

**Individual Distributor Payouts**:
- Links to payout batch
- Bank account details (last 4 only)
- Status tracking
- Failure tracking with retry count

### 5.3 Bank Accounts
**Database Table**: `distributor_bank_accounts`

**ACH Information**:
- Account holder name
- Routing number
- Encrypted account number
- Account type (checking/savings)
- Verification status
- Verification method (micro_deposits, instant, manual)

---

## 6. PRODUCTS & ORDERS

### 6.1 Product System
**Database Tables**:
- `product_categories` - 4 categories (AgentPulse, Estate Planning, Education, Bundles)
- `products` - All sellable products

**Product Fields**:
- Name, slug, description
- Retail price, wholesale price, BV
- Subscription options (monthly/annual/quarterly)
- Stock status (in_stock, out_of_stock, discontinued)
- Media (image, thumbnail)
- SEO metadata
- Features (JSON array)
- Active/featured flags

**Seeded Products** (from config):
- PULSEGUARD: $59 member / $79 retail / 59 BV
- PULSEFLOW: $109 member / $149 retail / 109 BV
- PULSEDRIVE: $219 member / $299 retail / 219 BV
- PULSECOMMAND: $349 member / $469 retail / 349 BV
- SMARTLOCK: $95 member / $135 retail / 95 BV
- BIZCENTER: $39 member / $39 retail / 39 BV

**API Routes**:
- `GET/POST /api/admin/products` - List/create products
- `GET/PUT/DELETE /api/admin/products/[id]` - Product CRUD

**Admin Page**: `/admin/products`

**Components**:
- `ProductsTable.tsx` - Admin product management
- `AddProductButton.tsx`, `AddProductModal.tsx` - Create products
- `EditProductModal.tsx` - Edit products

### 6.2 Order System
**Database Tables**:
- `orders` - All orders (customer or distributor)
- `order_items` - Line items within orders
- `subscriptions` - Recurring subscriptions

**Order Features**:
- Customer OR distributor purchaser (mutually exclusive)
- Personal purchase flag (counts as PBV)
- Total BV tracking for commissions
- Stripe payment integration
- Fulfillment status tracking
- Shipping information
- Order number generation (APEX-000001)

### 6.3 Customer System
**Database Table**: `customers`

**Retail Customers** (not distributors):
- Contact information
- Shipping address
- Referral tracking (referred_by_distributor_id, referred_by_affiliate_code)
- Stripe customer ID
- Upgrade tracking (if they become a distributor)
- Tags and notes

### 6.4 Subscription System
**Database Table**: `subscriptions`

**Recurring Orders**:
- Customer or distributor subscriber
- Interval (monthly/annual/quarterly)
- Billing cycle tracking
- Stripe subscription integration
- Cancellation handling
- Status (active, past_due, canceled, paused, trialing)

---

## 7. BUSINESS CENTER SYSTEM (4 TIERS)

### 7.1 Tiers
**Database Table**: `business_center_subscriptions`

**Tiers**:
1. **FREE** - Basic distributor access
2. **BASIC** - Entry-level business tools
3. **ENHANCED** - Advanced CRM and email tools
4. **PLATINUM** - Full white-label business center

**Tier Field**: `distributors.business_center_tier`

**Subscription Management**:
- Stripe integration
- Status tracking (active, canceled, past_due, trialing)
- Billing period tracking
- Cancel at period end option

### 7.2 Affiliate System
**Database Tables**:
- `affiliate_clicks` - Track affiliate link clicks
- `affiliate_conversions` - Track sales/signups from affiliate links

**Features**:
- 8-character unique affiliate codes
- UTM parameter tracking
- IP and user agent tracking
- Conversion value and BV tracking
- Conversion types: product_sale, distributor_signup, subscription_start

**Field**: `distributors.affiliate_code`

### 7.3 CRM System (Enhanced + Platinum)
**Database Table**: `crm_contacts`

**Contact Management**:
- Contact info (name, email, phone)
- Tags and notes
- Source tracking
- Engagement scoring (0-100)
- Kanban stages: cold_lead → contacted → meeting_set → follow_up → enrolled
- Email tracking (opens, clicks)
- Last contact date

### 7.4 Email Campaign System
**Database Tables**:
- `email_sequence_templates` - Pre-built email sequences (10 templates seeded)
- `email_campaigns` - User-created campaigns
- `campaign_emails_sent` - Individual email tracking

**Email Templates** (Seeded):
1. Welcome Series (Enhanced)
2. Follow-Up Series (Enhanced)
3. Product Launch (Enhanced)
4. Event Invitation (Enhanced)
5. Re-Engagement (Enhanced)
6. Income Opportunity (Platinum) - 7-email sequence
7. Objection Handler (Platinum) - 5-email sequence
8. Distributor Onboarding (Platinum) - 10-email sequence
9. Customer to Distributor Upgrade (Platinum)
10. Inactive Re-Activation (Platinum)

**Campaign Features**:
- Template-based or custom
- Contact filtering by tags
- A/B testing (Platinum) - subject line testing
- Scheduling and automation
- Status: draft → scheduled → running → paused → completed
- Email tracking: delivered, opened, clicked, bounced

**Email Tracking**:
- Resend integration
- Webhook tracking (delivery, opens, clicks, bounces)
- A/B variant tracking

**Template Variables**:
- {{name}}, {{sender_name}}, {{affiliate_link}}, etc.

**Files**: `src/lib/email/template-variables.ts`, `src/lib/email/campaign-service.ts`

### 7.5 CRM Tasks
**Database Table**: `crm_tasks`

**Task Management**:
- Manual and auto-created tasks
- Priority levels (low, medium, high, urgent)
- Due dates
- Contact linking
- Google Calendar integration
- Trigger-based creation (email opened, no response, meeting complete)

### 7.6 Lead Capture Forms (Enhanced + Platinum)
**Database Tables**:
- `lead_capture_forms` - Form definitions
- `form_submissions` - Submitted data

**Features**:
- Custom field builder (JSON schema)
- Auto-tagging
- Auto-campaign enrollment
- Success messages and redirects
- URL-friendly slugs
- Submission tracking

### 7.7 Branding Settings
**Database Table**: `business_center_branding`

**Customization**:
- Logo, favicon, OG image uploads
- Color scheme (primary, secondary, accent)
- Tagline
- Custom domain (Platinum)
- White-label option (hide Apex branding - Platinum)

### 7.8 API Keys & Webhooks (Platinum Only)
**Database Tables**:
- `api_keys` - API access keys
- `webhook_endpoints` - Webhook configuration

**API Key Features**:
- Key hash storage (SHA-256)
- Scope-based permissions
- Usage tracking
- Expiration dates

**Webhook Features**:
- Event subscriptions (contact.created, email.opened, task.completed)
- HMAC signature verification
- Failure tracking and retry count
- URL endpoint configuration

### 7.9 Team Broadcasts
**Database Table**: `team_broadcasts`

**Mass Email to Downline**:
- Recipient filtering (all_downline, direct_sponsors, active_only, specific_ranks)
- Scheduling
- Recipient count tracking
- Status: draft → scheduled → sending → sent

### 7.10 Calendar Integration (Platinum)
**Database Table**: `calendar_integrations`

**Google Calendar Sync**:
- OAuth token management
- Calendar selection
- Task sync
- Last synced tracking

---

## 8. AGENTPULSE PRODUCT SUITE

### 8.1 AgentPulse Pages
**Base Path**: `/dashboard/agentpulse`

**Products** (7 modules):
1. **AgentPilot** - AI assistant for agents
2. **LeadLoop** - Lead management and nurture system
3. **PolicyPing** - Policy renewal reminders
4. **PulseFollow** - Follow-up automation
5. **PulseInsight** - Analytics and insights
6. **WarmLine** - Warm calling system
7. **Nurture** (no dedicated page) - Lead nurturing

**Files**:
- `src/app/dashboard/agentpulse/page.tsx` - Main AgentPulse dashboard
- `src/app/dashboard/agentpulse/[module]/page.tsx` - Individual module pages
- `src/components/apps/LeadLoopBoard.tsx` - Kanban board
- `src/components/apps/NurtureApp.tsx` - Nurture system
- `src/components/apps/PolicyPingDashboard.tsx` - Policy tracking
- `src/components/apps/PulseFollowDemo.tsx` - Follow-up demo

### 8.2 AgentPulse Marketing
**Components**:
- `AgentPulseSidebarBanner.tsx` - Promotional banner
- `ComingSoonBanner.tsx` - Pre-launch banner
- `CountdownTimer.tsx` - Launch countdown
- `ModuleCard.tsx` - Module display cards
- `TierComparison.tsx` - Pricing tier comparison
- `WaitlistForm.tsx` - Pre-launch signup

### 8.3 Waitlist System
**Database Table**: Implied (likely `waitlist` or similar)

**Admin Page**: `/admin/waitlist`

**Component**: `AdminWaitlistClient.tsx`

---

## 9. ADMIN FEATURES

### 9.1 Admin Dashboard
**Pages**:
- `/admin` - Main admin dashboard
- `/admin/layout.tsx` - Admin layout with sidebar

**Components**:
- `AdminSidebar.tsx` - Navigation sidebar
- `EnrolleeStats.tsx` - Enrollment statistics
- `StatCard.tsx` - Metric display cards

### 9.2 Admin Activity Logging
**Database Table**: `admin_activity_log`

**File**: `src/lib/admin/activity-logger.ts`

**Tracked Actions**:
- Distributor modifications
- Suspensions
- Deletions
- Password resets
- Email changes
- Matrix placements
- Status changes

**Admin Page**: `/admin/activity`

**Component**: `ActivityLogPanel.tsx`

**API Route**: `/api/activity-feed` (for all users, not just admin)

### 9.3 Debug Tools
**Pages**:
- `/admin/debug-data` - Data inspection
- `/debug` - General debug page

**API Routes**:
- `/api/admin/check-status` - System status check
- `/api/test/*` - Various test endpoints

### 9.4 Services Monitoring
**Admin Page**: `/admin/services`

**Tracked Services**:
- OpenAI usage
- Redis usage
- Resend email usage
- Supabase usage
- Vercel metrics

**Files**:
- `src/lib/services/openai-tracked.ts`
- `src/lib/services/redis-tracked.ts`
- `src/lib/services/resend-tracked.ts`
- `src/lib/services/supabase-usage.ts`
- `src/lib/services/vercel-usage.ts`
- `src/lib/services/tracking.ts`

**API Routes**:
- `GET /api/admin/services/usage` - Get usage stats
- `GET /api/admin/services/budget` - Budget tracking
- `POST /api/admin/services/alerts/[id]/acknowledge` - Acknowledge alerts
- `POST /api/admin/services/collect-platform` - Collect platform metrics

### 9.5 Settings
**Admin Page**: `/admin/settings`

**System Configuration**:
- Global settings
- Feature flags
- Platform configuration

---

## 10. PROSPECTS & LEAD MANAGEMENT

### 10.1 Prospects System
**Database Table**: `prospects`

**Prospect Lifecycle**:
- Status: new → contacted → pending → qualified → converted → declined/archived
- Assignment to admins
- Contact tracking (last contacted, contact count)
- Conversion tracking (converted to distributor)
- Admin notes

**API Routes**:
- `GET/POST /api/admin/prospects` - List/create prospects
- `GET/PUT/DELETE /api/admin/prospects/[id]` - Prospect CRUD
- `POST /api/admin/prospects/[id]/convert` - Convert to distributor

**Admin Page**: `/admin/prospects`

**Public API**:
- `GET/POST /api/prospects` - Public prospect signup

### 10.2 Invites System
**Page**: `/invites`

**API Routes**: `/api/invites`

---

## 11. CONTENT & MARKETING

### 11.1 Social Media Content
**Database Table**: `social_content`

**Content Library**:
- Categories: personal, educational, cta, engagement, testimonial, recruiting
- Pre-made graphics with templates
- Caption templates
- Hashtag suggestions
- Best day recommendations
- Sort ordering

**Link Tracking**:
**Database Table**: `social_link_clicks`

**Analytics**:
- Source tracking (qr_code, instagram_bio, facebook_post)
- Referrer tracking
- Click timestamps
- Per-distributor analytics

**Admin Page**: `/admin/social-content`

**User Page**: `/dashboard/social-media`

**Components**:
- `SocialContentManager.tsx` - Admin management
- `ContentCard.tsx` - Content display

**API Routes**:
- `GET/POST /api/admin/social-content` - Content CRUD
- `GET/PUT/DELETE /api/admin/social-content/[id]` - Individual content
- `POST /api/admin/upload-social-content` - Upload content

### 11.2 Email Templates
**Database Table**: `email_sequence_templates` (seeded with 10 templates)

**Admin Management**:
**Admin Page**: `/admin/email-templates`

**API Routes**:
- `GET/POST /api/admin/email-templates` - Template CRUD
- `GET/PUT/DELETE /api/admin/email-templates/[id]` - Individual template
- `POST /api/admin/email-templates/generate` - AI template generation

**Component**: `EmailTemplatesManager.tsx`

**Email Sending**:
**Files**:
- `src/lib/email/resend.ts` - Resend integration
- `src/lib/email/apex-email-template.ts` - Email layouts
- `src/lib/email/apex-email-template-v2.ts` - V2 layouts
- `src/lib/email/launch-email.ts` - Launch announcements
- `src/lib/email/reminder-email.ts` - Reminder emails
- `src/lib/email/send-training-email.ts` - Training emails
- `src/lib/email/templates/training-content.tsx` - React Email templates

**API Routes**:
- `POST /api/test-email` - Test email sending

### 11.3 Training Materials
**Admin Page**: `/admin/training-audio`

**User Page**: `/dashboard/training`

**API Routes**: `/api/training/*`

---

## 12. BUSINESS TOOLS

### 12.1 Business Card Designer
**Database Tables**:
- `business_card_templates` - Card templates
- Canvas-based builder schema

**Migration**: `20260222000008_canvas_builder_schema.sql`

**User Pages**:
- `/dashboard/business-cards` (implied)

**Components**:
- `BusinessCardDesigner.tsx` - Card design tool
- `BusinessCardOrder.tsx` - Order interface
- `CardDesignerForm.tsx` - Design form
- `CardPreviewRenderer.tsx` - Preview rendering
- `CanvasBuilder.tsx` - Canvas-based builder (admin)

**Admin Page**: `/admin/business-card-templates`

**API Routes**:
- `GET/DELETE /api/admin/business-card-templates/[id]` - Template management
- `GET/POST /api/business-cards` (implied)

**Template System**:
- Pre-seeded templates (Blue template migration)
- Position-based element placement
- Canvas builder for admins

### 12.2 Reports
**Admin Page**: `/admin/reports`

**User Pages**:
- `/reports-v2` (versioned report views)

### 12.3 Activity Feed
**Database Table**: `activity_feed_events` (implied from migration)

**User Component**: `ActivityFeed.tsx`

**API Route**: `/api/activity-feed`

**Features**:
- Real-time activity tracking
- Event types
- Per-user feeds

---

## 13. DASHBOARD SYSTEM

### 13.1 Main Dashboard Versions
**Pages**:
- `/dashboard` - Main dashboard (current version)
- `/dashboard-v2` - Version 2
- `/dashboard-v3` - Version 3
- `/dashboard-v4` - Version 4 (latest)

**Components**:
- `DashboardClient.tsx` - Client component
- `DashboardV3Client.tsx` - V3 client
- `DashboardV4Client.tsx` - V4 client

### 13.2 Dashboard Features
**Pages**:
- `/dashboard/profile` - Profile management
- `/dashboard/settings` - User settings
- `/dashboard/team` - Team view
- `/dashboard/road-to-500` - Achievement tracking

**Components**:
- `AccordionProfileForm.tsx` - Profile editing
- Profile validation: `src/lib/profile/validation.ts`

**API Routes**:
- `GET/POST /api/profile` - Profile management
- `POST /api/init-profile` - Initialize profile
- `POST /api/test-profile` - Test profile data
- `GET/POST /api/licensed-agent` - Licensing management

---

## 14. PUBLIC PAGES

### 14.1 Landing Pages
**Pages**:
- `/` (root) - Main landing page
- `/about` - About page
- `/one-pager` - One-page overview
- `/[slug]` - Personalized distributor landing pages (slug-based)

**Slug System**:
- Each distributor gets a unique slug
- Personalized landing pages
- Affiliate tracking

**API Routes**:
- `GET /api/check-slug` - Check slug availability
- `GET /api/slugs` - Slug management
- `POST /api/update-slug` - Update distributor slug

**Files**: `src/lib/utils/slug.ts`, `src/lib/utils/slug-client.ts`

---

## 15. GENEALOGY & VISUALIZATION

### 15.1 Genealogy Views
**Pages**:
- `/admin/genealogy` - Admin genealogy view
- `/genealogy-v2` - V2 genealogy
- `/genealogy-v4` - V4 genealogy

**Files**: `src/lib/genealogy/tree-service.ts`

**Components**:
- `PersonalDownline.tsx` - Downline list
- `SponsorLineage.tsx` - Sponsor tree
- `TeamStatistics.tsx` - Team metrics

### 15.2 Matrix Views
**Pages**:
- `/matrix-v2` - V2 matrix view
- `/matrix-v4` - V4 matrix view
- `/dashboard/matrix` - User matrix view
- `/dashboard/matrix/[id]` - Specific node view

**Components**:
- `MatrixView.tsx` - Visual matrix rendering
- `MatrixChildren.tsx` - Child list
- `MatrixPositionManager.tsx` - Position management

---

## 16. THIRD-PARTY INTEGRATIONS

### 16.1 Stripe (Payments)
**Package**: `stripe`, `@stripe/stripe-js`

**Features**:
- Payment processing
- Subscription management
- Customer management
- Webhook handling

### 16.2 Resend (Email)
**Package**: `resend`, `@react-email/components`

**Features**:
- Transactional emails
- Email campaigns
- Webhook tracking
- Template rendering

### 16.3 OpenAI (AI)
**Package**: `openai`

**Features**:
- Template generation
- Content assistance
- AI-powered tools

**Files**: `src/lib/services/openai-tracked.ts`

**API Routes**: `/api/ai/*`

### 16.4 Upstash (Redis)
**Package**: `@upstash/redis`, `@upstash/ratelimit`

**Features**:
- Rate limiting
- Caching
- Session management

**File**: `src/lib/rate-limit.ts`

### 16.5 Google APIs
**Package**: `googleapis`

**Features**:
- Calendar integration
- OAuth management

### 16.6 FFmpeg
**Package**: `@ffmpeg-installer/ffmpeg`, `fluent-ffmpeg`

**Use Case**: Video/audio processing for training materials

---

## 17. UTILITY SYSTEMS

### 17.1 File Processing
**Packages**:
- `html2canvas` - Screenshot generation
- `jspdf` - PDF generation
- `qrcode` - QR code generation
- `papaparse` - CSV parsing

### 17.2 Form Management
**Packages**:
- `react-hook-form` - Form state
- `@hookform/resolvers` - Validation
- `zod` - Schema validation

### 17.3 UI Components
**Packages**:
- `lucide-react` - Icons
- `recharts` - Charts and graphs
- `react-easy-crop` - Image cropping
- `class-variance-authority`, `clsx`, `tailwind-merge` - Styling utilities

**File**: `src/lib/design-system.ts`

### 17.4 Date Handling
**Package**: `date-fns`

**Format Utilities**: `src/lib/utils/format-phone.ts`

---

## 18. TESTING

### 18.1 Testing Setup
**Packages**:
- `vitest` - Unit testing
- `@vitest/ui` - Test UI
- `@playwright/test` - E2E testing

**Scripts**:
- `npm run test` - Run unit tests
- `npm run test:watch` - Watch mode
- `npm run test:ui` - Test UI
- `npm run test:e2e` - E2E tests
- `npm run test:e2e:ui` - E2E UI

### 18.2 Stress Testing
**API Route**: `/api/admin/compensation/stress-test`

**Page**: `/test-waterfall` - Test compensation waterfall

---

## 19. DATA MIGRATIONS & SEEDING

### 19.1 Migration Files (47 total)
**Key Migrations**:
1. `20260221000001_fix_partial_migrations.sql` - Cleanup
2. `20260221000002_business_center_system.sql` - 4-tier business center (17 tables)
3. `20260221000003_products_and_orders.sql` - E-commerce (7 tables)
4. `20260221000004_commission_engine_core.sql` - Commissions (17 tables)
5. `20260221000005_commission_calculation_functions.sql` - SQL functions
6. `20260221000006_seed_products.sql` - Product seeding
7. `20260222000005_business_card_templates.sql` - Business cards
8. `20260222000010_social_media_content.sql` - Social content
9. `20260223000002_admin_notes_system.sql` - Admin notes
10. `20260223000003_admin_activity_log.sql` - Activity logging
11. `20260223000004_prospects_system.sql` - Prospects
12. `20260226000001_activity_feed_system.sql` - Activity feed
13. `20260226000002_password_reset_tokens.sql` - Password resets
14. `20260310000001_replace_products_agentpulse.sql` - AgentPulse products
15. `20260310000002_atomic_signup_functions.sql` - Atomic signup
16. `20260310000004_fix_rep_number_generation.sql` - Rep number fix

### 19.2 Seeding Scripts
**Scripts**:
- `scripts/seed-master.ts` - Seed master distributor
- `scripts/seed-email-templates.ts` - Seed email templates
- `scripts/test-email.ts` - Test email sending

**Commands**:
- `npm run seed:master`
- `npm run seed:emails`
- `npm run test:email`

---

## 20. SECURITY & ACCESS CONTROL

### 20.1 Row Level Security (RLS)
**Applied to All Tables**:
- Distributors can view own records
- Admins can view all
- Public can insert prospects/form submissions
- Cascading policies for related records

### 20.2 Admin System
**Database Table**: `admins`

**Roles**:
- super_admin
- admin
- support
- viewer

**File**: `src/lib/auth/admin.ts`

**Features**:
- Role-based access control
- Admin activity logging
- Suspension/deletion controls

### 20.3 Middleware
**File**: `src/lib/supabase/middleware.ts`

**Protection**:
- Route protection
- Auth session refresh
- Admin route guards

---

## 21. ENVIRONMENT & CONFIGURATION

### 21.1 Environment Variables (Expected)
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

# Resend
RESEND_API_KEY

# OpenAI
OPENAI_API_KEY

# Upstash Redis
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

# Google
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

# Platform
NEXT_PUBLIC_APP_URL
```

### 21.2 Supabase Clients
**Files**:
- `src/lib/supabase/client.ts` - Client-side
- `src/lib/supabase/server.ts` - Server-side
- `src/lib/supabase/service.ts` - Service role
- `src/lib/supabase/middleware.ts` - Middleware

---

## 22. API SUMMARY

### 22.1 Total API Routes: 111+

**Categories**:
- **Admin** (80+ routes)
  - Distributors (15 routes)
  - Matrix (8 routes)
  - Compensation (3 routes)
  - Commissions (1 route)
  - Products (2 routes)
  - Prospects (3 routes)
  - Payouts (2 routes)
  - Email Templates (3 routes)
  - Social Content (3 routes)
  - Business Cards (1 route)
  - Services (4 routes)
  - Misc (5+ routes)

- **Public/User** (30+ routes)
  - Auth (multiple)
  - Profile (3 routes)
  - Business Cards (implied)
  - Distributors (public endpoints)
  - Matrix (user view)
  - Training
  - Waitlist
  - Prospects (signup)
  - Invites
  - Slugs (3 routes)
  - Activity Feed
  - Alerts
  - Apps
  - Cron
  - Licensed Agent
  - Test/Debug (multiple)

---

## 23. PAGE SUMMARY

### 23.1 Total Pages: 60+

**Public**:
- Landing, About, One-Pager
- Login, Signup, Forgot Password, Reset Password, Welcome
- [slug] - Dynamic distributor pages

**Dashboard** (User):
- Main Dashboard (4 versions)
- Profile, Settings, Team
- Matrix, Genealogy
- AgentPulse (7 modules)
- Training, Social Media
- Road to 500

**Admin** (22 pages):
- Dashboard
- Distributors (list, detail, new)
- Matrix (main, debug)
- Genealogy
- Commissions
- Payouts
- Products
- Prospects
- Email Templates
- Social Content
- Business Card Templates
- Training Audio
- Waitlist
- Activity
- Reports
- Services
- Settings
- Debug Data

**Other**:
- Invites
- Debug

---

## 24. DATABASE SUMMARY

### 24.1 Total Tables: 50+

**Core**:
1. distributors (46 fields)
2. admins
3. prospects
4. customers

**MLM Structure**:
5. rank_history
6. bv_snapshots

**Commissions** (14 tables):
7. commissions_retail
8. commissions_cab
9. commissions_customer_milestone
10. commissions_retention
11. commissions_matrix
12. commissions_matching
13. commissions_override
14. commissions_infinity
15. commissions_fast_start
16. commissions_rank_advancement
17. commissions_car
18. commissions_vacation
19. commissions_infinity_pool
20. payout_batches
21. payout_items
22. distributor_bank_accounts

**Products & Orders**:
23. product_categories
24. products
25. orders
26. order_items
27. subscriptions

**Business Center** (17 tables):
28. business_center_subscriptions
29. affiliate_clicks
30. affiliate_conversions
31. crm_contacts
32. crm_tasks
33. email_sequence_templates
34. email_campaigns
35. campaign_emails_sent
36. lead_capture_forms
37. form_submissions
38. calendar_integrations
39. business_center_branding
40. api_keys
41. webhook_endpoints
42. team_broadcasts
43. analytics_cache

**Content & Marketing**:
44. social_content
45. social_link_clicks
46. business_card_templates
47. admin_notes
48. admin_activity_log
49. activity_feed_events
50. password_reset_tokens

---

## 25. KEY TECHNICAL DECISIONS

### 25.1 Architecture
- **Next.js 16 App Router** - Latest server components
- **Supabase PostgreSQL** - Managed database with RLS
- **TypeScript** - Full type safety
- **TailwindCSS v4** - Utility-first styling
- **Vercel Deployment** - Edge functions

### 25.2 Patterns
- Server actions for mutations
- Client components for interactivity
- API routes for complex operations
- Middleware for auth protection
- RLS for data security

### 25.3 State Management
- React Hook Form for forms
- Server-side data fetching
- Client-side caching (implied)

---

## CONCLUSION

This is a **comprehensive MLM platform** with:
- **16 commission streams**
- **Dual genealogy system** (sponsor + matrix)
- **4-tier business center** (free → platinum)
- **Complete CRM and email marketing** (10 pre-built sequences)
- **AgentPulse product suite** (7 modules)
- **Full admin controls** (distributors, matrix, commissions, payouts)
- **E-commerce system** (products, orders, subscriptions)
- **White-label capabilities** (branding, custom domains, API access)
- **Extensive tracking** (activity logs, analytics, affiliate conversions)

**Total Codebase Size**:
- 198 route files
- 60+ pages
- 50+ database tables
- 111+ API endpoints
- 47 database migrations

**Target Market**: Insurance agents and MLM distributors selling AgentPulse tools

**Deployment**: Production-ready on Vercel with Supabase backend

---

## NEXT STEPS FOR REBUILD/UPGRADE

### Recommended Priorities:

1. **Complete Shadcn/ui Migration** - Finish converting all pages to use shadcn components for consistent, modern UI
2. **Fix TypeScript Errors** - Resolve remaining TypeScript compilation issues in compensation engine
3. **Complete AgentPulse Modules** - Finish implementing all 7 AgentPulse product modules
4. **Testing Coverage** - Add comprehensive unit and E2E tests
5. **Performance Optimization** - Add Redis caching, optimize database queries
6. **Mobile Optimization** - Ensure all pages are fully responsive
7. **Documentation** - Add API documentation, user guides, admin guides

### Technical Debt:

- Multiple dashboard versions (v1-v4) - consolidate
- Incomplete compensation engine (stress tests failing)
- Missing test coverage
- Some API routes need error handling improvements
- Business card designer needs completion

### Feature Completeness:

- ✅ Core MLM structure (100%)
- ✅ Authentication & user management (100%)
- ⚠️ Compensation plan (95% - needs testing)
- ✅ Business center tiers (100%)
- ⚠️ AgentPulse suite (60% - demo phase)
- ✅ Admin tools (100%)
- ✅ CRM & email marketing (100%)
- ⚠️ Business card designer (80%)
- ✅ Affiliate tracking (100%)
- ⚠️ API documentation (0%)

---

**Document Version**: 1.0
**Date**: March 10, 2026
**Prepared for**: System Rebuild/Upgrade Specification
