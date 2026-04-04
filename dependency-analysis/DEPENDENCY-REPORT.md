# Apex Affinity Group - Dependency Analysis Report

Generated: 2026-04-04T06:21:29.838Z

## Overview

- **Total Files:** 974
- **Total Dependencies:** 1466
- **Average Dependencies per File:** 1.5
- **Circular Dependencies:** 1
- **Orphan Files:** 113

## Most Dependent Files

These files import the most other modules:

1. **components/admin/DistributorDetailView.tsx** (14 dependencies)
2. **components/admin/SmartOfficeClient.tsx** (12 dependencies)
3. **app/api/signup/route.ts** (10 dependencies)
4. **app/dashboard/page.tsx** (9 dependencies)
5. **app/admin/compensation-settings/page.tsx** (8 dependencies)
6. **app/api/webhooks/stripe/route.ts** (8 dependencies)
7. **app/dashboard/business-center/page.tsx** (8 dependencies)
8. **app/dashboard/team/page.tsx** (8 dependencies)
9. **components/admin/smartoffice/developer-tools.tsx** (8 dependencies)
10. **components/autopilot/SocialPostComposer.tsx** (8 dependencies)
11. **app/api/admin/matrix/create-and-place/route.ts** (7 dependencies)
12. **app/dashboard-v3/page.tsx** (7 dependencies)
13. **app/dashboard/profile/page.tsx** (7 dependencies)
14. **components/dashboard/AIChatModal.tsx** (7 dependencies)
15. **app/api/dashboard/ai-chat/route.ts** (6 dependencies)
16. **app/dashboard/commissions/page.tsx** (6 dependencies)
17. **app/dashboard/genealogy/page.tsx** (6 dependencies)
18. **app/dashboard/layout.tsx** (6 dependencies)
19. **app/dashboard/sales/page.tsx** (6 dependencies)
20. **app/dashboard/settings/page.tsx** (6 dependencies)

## Most Depended Upon Files

These files are imported by the most other modules (core utilities):

1. **lib/supabase/server.ts** (imported 244 times)
2. **lib/supabase/service.ts** (imported 177 times)
3. **lib/auth/admin.ts** (imported 103 times)
4. **lib/types/index.ts** (imported 74 times)
5. **components/ui/button.tsx** (imported 46 times)
6. **lib/auth/server.ts** (imported 41 times)
7. **lib/supabase/client.ts** (imported 23 times)
8. **components/ui/card.tsx** (imported 22 times)
9. **lib/subscription/check-business-center.ts** (imported 17 times)
10. **lib/compensation/config.ts** (imported 16 times)
11. **components/dashboard/FeatureGate.tsx** (imported 14 times)
12. **lib/utils.ts** (imported 14 times)
13. **lib/email/resend.ts** (imported 13 times)
14. **lib/smartoffice/types.ts** (imported 13 times)
15. **components/ui/badge.tsx** (imported 12 times)
16. **types/meeting.ts** (imported 11 times)
17. **lib/admin/matrix-manager.ts** (imported 10 times)
18. **lib/autopilot/invitation-helpers.ts** (imported 10 times)
19. **lib/stripe/autopilot-products.ts** (imported 9 times)
20. **lib/stripe/autopilot-helpers.ts** (imported 8 times)

## Circular Dependencies

⚠️ Found 1 circular dependency cycles:

### Cycle 1
```
components/organization/OrganizationTable.tsx →
components/organization/OrganizationRow.tsx
```

## Orphan Files

⚠️ Found 113 orphan files (not imported and don't import anything):

- `app/[slug]/live/page.tsx`
- `app/[slug]/not-found.tsx`
- `app/about/page.tsx`
- `app/admin/commission-run/page.tsx`
- `app/admin/downloads/page.tsx`
- `app/admin/fulfillment/kanban/page.tsx`
- `app/admin/ledger/page.tsx`
- `app/admin/loading.tsx`
- `app/admin/support/page.tsx`
- `app/admin/transactions/page.tsx`
- `app/ai-employee/page.tsx`
- `app/api/admin/create-cart-table/route.ts`
- `app/api/admin/run-migrations/route.ts`
- `app/api/admin/seed-products/route.ts`
- `app/api/alerts/photo-warning/route.ts`
- `app/api/apps/pulsefollow/route.ts`
- `app/api/cron/nurture-send/route.ts`
- `app/api/dashboard/ai-chat/tools/tool-definitions.ts`
- `app/api/debug-stripe/route.ts`
- `app/api/email-content/route.ts`
- `app/api/invites/send/route.ts`
- `app/api/test-email/route.ts`
- `app/api/training/generate-script/route.ts`
- `app/cart/page.tsx`
- `app/checkout/page.tsx`
- `app/dashboard/ai-assistant/AIAssistantClient.tsx`
- `app/dashboard/ai-assistant/page.tsx`
- `app/dashboard/business-center/ai-nurture/page.tsx`
- `app/dashboard/downloads/page.tsx`
- `app/dashboard/genealogy/loading.tsx`
- `app/dashboard/loading.tsx`
- `app/dashboard/support/page.tsx`
- `app/dashboard/support/tickets/[id]/page.tsx`
- `app/dashboard/support/tickets/page.tsx`
- `app/email-preview/page.tsx`
- `app/genealogy-v2/page.tsx`
- `app/live/page.tsx`
- `app/matrix-v2/page.tsx`
- `app/one-pager/page.tsx`
- `app/products/page.backup.tsx`
- `app/products/pulsecommand/page.tsx`
- `app/products/pulsedrive/page.tsx`
- `app/products/pulseflow/page.tsx`
- `app/products/pulsemarket/page.tsx`
- `app/products/smartlook/page.tsx`
- `app/profile-v2/page.tsx`
- `app/reports-v2/page.tsx`
- `app/showcase/page.tsx`
- `app/signup/credentials/page.tsx`
- `app/signup/welcome/page.tsx`
- `app/welcome/page.tsx`
- `components/DashboardSwitcher.tsx`
- `components/admin/NewDistributorForm.tsx`
- `components/admin/TemplateManager.tsx`
- `components/admin/TerminologyLegend.tsx`
- `components/agentpulse/AgentPulseSidebarBanner.tsx`
- `components/agentpulse/ComingSoonBanner.tsx`
- `components/cart/CartIcon.tsx`
- `components/dashboard-v2/ChatHeader.tsx`
- `components/dashboard-v2/QuickActionBar.tsx`
- `components/dashboard-v2/SlidingSidebar.tsx`
- `components/dashboard-v2/chat/ButtonGrid.tsx`
- `components/dashboard-v2/chat/ChartCard.tsx`
- `components/dashboard-v2/chat/MatrixVisualization.tsx`
- `components/dashboard-v2/chat/StatCard.tsx`
- `components/dashboard-v2/chat/TeamMemberCard.tsx`
- `components/dashboard/AIAssistantBanner.tsx`
- `components/dashboard/AIAssistantCard.tsx`
- `components/dashboard/AIRecommendations.tsx`
- `components/dashboard/CEOVideoSection.tsx`
- `components/dashboard/CopyReferralButton.tsx`
- `components/dashboard/QuickActions.tsx`
- `components/dashboard/RaceTo100Banner.tsx`
- `components/dashboard/RecentAICallsWidget.tsx`
- `components/dashboard/ReferralLink.tsx`
- `components/dashboard/SlugChangeForm.tsx`
- `components/dashboard/StoreClient.tsx`
- `components/dashboard/TrainingAudioPlayer.tsx`
- `components/dashboard/UsageLimitModal.tsx`
- `components/forms/ProspectSignupForm.tsx`
- `components/genealogy/GenealogyPageSkeleton.tsx`
- `components/marketing/AboutStats.tsx`
- `components/marketing/CompanyLogos.tsx`
- `components/marketing/FAQ.tsx`
- `components/marketing/Footer.tsx`
- `components/marketing/GettingStarted.tsx`
- `components/marketing/StatsSection.tsx`
- `components/marketing/Testimonials.tsx`
- `components/marketing/WhyApex.tsx`
- `components/race-to-100/ConfettiCelebration.tsx`
- `components/team/TeamPageSkeleton.tsx`
- `components/waitlist/WaitlistScreen.tsx`
- `db/schema.ts`
- `emails/DistributorWelcomeEmail.tsx`
- `hooks/useAIChatSessions.ts`
- `hooks/useUserContext.ts`
- `lib/compensation/qv-bv-calculator.ts`
- `lib/compensation/types.ts`
- `lib/design-system.ts`
- `lib/email/apex-email-template-v2.ts`
- `lib/email/apex-email-template.ts`
- `lib/email/logo-url.ts`
- `lib/email/reminder-email.ts`
- `lib/email/send-template-email.ts`
- `lib/email/templates/base-email-template.tsx`
- `lib/genealogy/tree-utils.ts`
- `lib/matrix/level-calculator.ts`
- `lib/profile/validation-notification-fix.ts`
- `lib/supabase/middleware.ts`
- `lib/utils/user-helpers.ts`
- `lib/vapi/assistants.ts`
- `middleware.ts`
- `types/vitest.d.ts`

## Recommendations

### High Priority

1. **Fix Circular Dependencies** - Circular dependencies can cause runtime errors and make code harder to maintain.
2. **Review Orphan Files** - These files may be unused and can be removed to reduce bundle size.


### Code Quality

1. **Core Utilities** - Files in the "Most Depended Upon" list are critical. Changes to these files affect many parts of the app.
2. **Complex Files** - Files in the "Most Dependent" list may be doing too much and could benefit from refactoring.

## Usage Guide

### Before Making Changes

1. Check if file is in "Most Depended Upon" list
2. If yes, review all dependent files before modifying
3. Run tests after changes
4. Re-run this analysis to verify no new circular dependencies

### Adding New Features

1. Keep dependencies minimal
2. Import from core utilities when possible
3. Avoid creating circular dependencies
4. Re-run analysis periodically

### Refactoring

1. Target files with high dependency counts
2. Extract reusable logic to utilities
3. Break up large files into smaller modules
4. Verify dependency graph improves

## Commands

```bash
# Re-run analysis
npm run analyze:deps

# Generate visual graph only
npx madge --image dependency-graph.svg src

# Find circular dependencies
npx madge --circular src

# Analyze specific directory
npx madge --image api-graph.svg src/app/api
```
