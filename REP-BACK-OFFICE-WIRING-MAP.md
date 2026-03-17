# Rep Back Office - Database Wiring & Dependency Map

**Generated**: March 16, 2026
**Purpose**: Comprehensive documentation of how all rep back office pages are wired to the database

---

## Overview

All rep back office pages have been rebuilt to wire directly to the compensation plan database schema. This document provides a complete reference for:

- Database table relationships
- Query patterns used across pages
- Component dependencies
- Data flow diagrams

---

## Database Architecture

### Core Tables

#### 1. `distributors` (Organization Structure)
- **Purpose**: Stores rep organizational data
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `auth_user_id` (UUID) - Links to Supabase auth
  - `enroller_id` (UUID) - Who enrolled this distributor (immutable)
  - `sponsor_id` (UUID) - Matrix position (can change)
  - `first_name`, `last_name`, `email`
  - `rep_number` - Unique rep identifier
  - `slug` - URL-safe username for referral links
  - `is_licensed_agent` (boolean)
  - `created_at`, `updated_at`

#### 2. `members` (Compensation Data)
- **Purpose**: Stores compensation plan participation data
- **Key Fields**:
  - `member_id` (UUID) - Primary key
  - `distributor_id` (UUID) - FK to distributors table
  - `enroller_id` (UUID) - Links to enrolling member
  - `tech_rank` - Current Tech Ladder rank (starter → elite)
  - `highest_tech_rank` - Highest rank achieved
  - `insurance_rank` - Current Insurance Ladder rank
  - `personal_credits_monthly` (numeric) - Credits from personal sales
  - `team_credits_monthly` (numeric) - Credits from team
  - `override_qualified` (boolean) - Meets 50 credit minimum for overrides
  - `created_at`, `updated_at`

#### 3. `earnings_ledger` (Commission Tracking)
- **Purpose**: Records all commission payments and bonuses
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `member_id` (UUID) - FK to members table
  - `earning_type` - override, rank_bonus, pool, direct_commission
  - `amount_usd` (numeric) - Dollar amount
  - `credits_earned` (numeric) - Credits generated
  - `level` - For overrides (L1-L5)
  - `status` - pending, approved, paid
  - `created_at`

#### 4. `products` (Product Catalog)
- **Purpose**: Defines all 6 products and their credit/commission values
- **Key Fields**:
  - `id` (UUID)
  - `name` - Product name
  - `price_usd` (numeric) - Retail price
  - `memberCommission` (numeric) - Commission % for members
  - `retailCommission` (numeric) - Commission % for non-members
  - `memberCredits` (numeric) - Credits % for member sales
  - `retailCredits` (numeric) - Credits % for retail sales

#### 5. `subscriptions` (Active Subscriptions)
- **Purpose**: Tracks active product subscriptions
- **Key Fields**:
  - `id` (UUID)
  - `distributor_id` (UUID) - FK to distributors
  - `product_id` (UUID) - FK to products
  - `status` - active, cancelled, paused
  - `created_at`

---

## Table Relationships

```
┌─────────────────┐
│  distributors   │
│  (org data)     │
└────────┬────────┘
         │
         │ 1:1
         │
┌────────▼────────┐
│    members      │
│  (comp data)    │
└────────┬────────┘
         │
         │ 1:many
         │
┌────────▼────────┐
│ earnings_ledger │
│  (commissions)  │
└─────────────────┘

┌─────────────────┐        ┌─────────────────┐
│  distributors   │────────│  subscriptions  │
└─────────────────┘ 1:many └────────┬────────┘
                                    │
                                    │ many:1
                                    │
                            ┌───────▼────────┐
                            │    products    │
                            └────────────────┘
```

---

## Page-by-Page Wiring

### 1. Dashboard (`/dashboard`)

**File**: `src/app/dashboard/page.tsx`

**Data Sources**:
- `distributors` + `members` (JOIN)
- `earnings_ledger` (monthly earnings)

**Query Pattern**:
```typescript
const { data: distributor } = await serviceClient
  .from('distributors')
  .select(`
    *,
    member:members!members_distributor_id_fkey (
      member_id,
      personal_credits_monthly,
      team_credits_monthly,
      tech_rank,
      highest_tech_rank,
      override_qualified
    )
  `)
  .eq('auth_user_id', user.id)
  .single();

// Monthly earnings
const startOfMonth = new Date();
startOfMonth.setDate(1);
const { data: earnings } = await serviceClient
  .from('earnings_ledger')
  .select('amount_usd')
  .eq('member_id', distributor.member?.member_id)
  .eq('status', 'approved')
  .gte('created_at', startOfMonth.toISOString());

const monthlyEarnings = earnings?.reduce((sum, e) => sum + e.amount_usd, 0) || 0;
```

**Components**:
- `CEOVideoSection` - Placeholder for CEO welcome video
- `CompensationStatsWidget` - 4 stat cards:
  - Personal Credits (from `personal_credits_monthly`)
  - Group Credits (from `team_credits_monthly`)
  - Current Rank (from `tech_rank`)
  - Monthly Earnings (from `earnings_ledger` sum)
- `QuickActions` - Action buttons (Enroll Rep, Share Link, Schedule Call)

**Tests**: `src/app/dashboard/page.test.tsx` (11 tests)

---

### 2. Matrix (`/dashboard/matrix`)

**File**: `src/app/dashboard/matrix/page.tsx`

**Data Sources**:
- `distributors` + `members` (JOIN for current user)
- `members` (recursive query for L1-L5 levels)
- `earnings_ledger` (override earnings)

**Query Pattern**:
```typescript
// Get current user
const { data: userData } = await serviceClient
  .from('distributors')
  .select(`
    *,
    member:members!members_distributor_id_fkey (
      member_id, tech_rank, personal_credits_monthly, team_credits_monthly
    )
  `)
  .eq('auth_user_id', user.id)
  .single();

// Get all members for matrix calculation
const { data: allMembers } = await serviceClient
  .from('members')
  .select(`
    *,
    distributor:distributors!members_distributor_id_fkey (
      id, first_name, last_name, rep_number
    )
  `);

// Recursive level calculation (L1-L5)
function calculateMatrixLevels(allMembers, currentMemberId, maxDepth) {
  const levels = [[], [], [], [], []]; // L1-L5

  // L1: Direct enrollees
  const l1 = allMembers.filter(m => m.enroller_id === currentMemberId);
  levels[0] = l1;

  // L2-L5: Recursively find enrollees
  for (let i = 1; i < maxDepth; i++) {
    levels[i] = allMembers.filter(m =>
      levels[i-1].some(parent => parent.member_id === m.enroller_id)
    );
  }

  return levels;
}

// Override earnings
const { data: overrideEarnings } = await serviceClient
  .from('earnings_ledger')
  .select('amount_usd, level')
  .eq('member_id', userData.member.member_id)
  .eq('earning_type', 'override')
  .gte('created_at', startOfMonth.toISOString());
```

**Rank-Based Depth Limits**:
- Starter: L1 only
- Bronze/Silver: L1-L2
- Gold/Platinum: L1-L3
- Ruby/Diamond: L1-L4
- Crown/Elite: L1-L5

**Components**:
- `MatrixNodeCard` - Individual team member card with avatar, rank, credits
- `MatrixLevelView` - Horizontal scrollable level rows

**Tests**: `src/app/dashboard/matrix/page.test.tsx`

---

### 3. Genealogy (`/dashboard/genealogy`)

**File**: `src/app/dashboard/genealogy/page.tsx`

**Data Sources**:
- `distributors` + `members` (JOIN for current user)
- `members` (recursive tree building)

**Query Pattern**:
```typescript
// Recursive tree building
async function buildEnrollmentTree(enrollerId: string, depth: number = 0): Promise<TreeNode[]> {
  const { data: directEnrollees } = await serviceClient
    .from('members')
    .select(`
      *,
      distributor:distributors!members_distributor_id_fkey (
        id, first_name, last_name, rep_number, created_at
      )
    `)
    .eq('enroller_id', enrollerId);

  if (!directEnrollees || directEnrollees.length === 0) {
    return [];
  }

  const tree: TreeNode[] = [];
  for (const member of directEnrollees) {
    const children = await buildEnrollmentTree(member.member_id, depth + 1);
    tree.push({
      ...member,
      depth,
      children,
      totalCredits: member.personal_credits_monthly + sumTreeCredits(children)
    });
  }

  return tree;
}

// Recursive credits summation
function sumTreeCredits(tree: TreeNode[]): number {
  return tree.reduce((sum, node) =>
    sum + node.personal_credits_monthly + sumTreeCredits(node.children),
    0
  );
}
```

**Components**:
- `TreeNodeCard` - Expandable/collapsible tree node
- `CompensationTreeView` - Full tree with search, filters, expand/collapse

**Features**:
- Search by name or rep number
- Filter by rank
- Expand/collapse all
- Visual indentation for depth

**Tests**: `src/app/dashboard/genealogy/page.test.tsx` (21 tests)

---

### 4. Team (`/dashboard/team`)

**File**: `src/app/dashboard/team/page.tsx`

**Data Sources**:
- `distributors` + `members` (JOIN for current user)
- `members` (L1 direct enrollees only)
- `members` (count of each member's enrollees)

**Query Pattern**:
```typescript
// Get L1 direct enrollees
const { data: teamMembers } = await serviceClient
  .from('members')
  .select(`
    *,
    distributor:distributors!members_distributor_id_fkey (
      id, first_name, last_name, rep_number, slug, created_at
    )
  `)
  .eq('enroller_id', userData.member.member_id)
  .order('created_at', { ascending: false });

// For each member, calculate stats
const membersWithStats = await Promise.all(
  teamMembers.map(async (member) => {
    // Count their personal enrollees
    const { count } = await serviceClient
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('enroller_id', member.member_id);

    return {
      ...member,
      personalEnrolleeCount: count || 0,
      isActive: member.personal_credits_monthly >= 50
    };
  })
);
```

**Components**:
- `TeamMemberCard` - Individual member card
- `TeamFilters` - Search, rank filter, status filter, sorting
- `TeamStatsHeader` - Summary stats (total team, active, total credits)

**Features**:
- Search by name or rep number
- Filter by rank (all ranks, starter, bronze, etc.)
- Filter by status (all, active, inactive)
- Sort by: name, rank, credits, join date
- Pagination (20 per page)

**Tests**: `src/app/dashboard/team/page.test.tsx` (19 tests)

---

### 5. Profile (`/dashboard/profile`)

**File**: `src/app/dashboard/profile/page.tsx`

**Data Sources**:
- `distributors` + `members` + `distributor_tax_info` (triple JOIN)
- `earnings_ledger` (lifetime earnings)

**Query Pattern**:
```typescript
// Full profile with all data
const { data: profile } = await serviceClient
  .from('distributors')
  .select(`
    *,
    member:members!distributors_id_fkey (
      member_id,
      tech_rank,
      highest_tech_rank,
      insurance_rank,
      personal_credits_monthly,
      team_credits_monthly,
      override_qualified
    ),
    tax_info:distributor_tax_info!distributor_tax_info_distributor_id_fkey (
      ssn_last_4
    )
  `)
  .eq('auth_user_id', user.id)
  .single();

// Lifetime earnings
const { data: allEarnings } = await serviceClient
  .from('earnings_ledger')
  .select('amount_usd')
  .eq('member_id', profile.member.member_id)
  .eq('status', 'approved');

const lifetimeEarnings = allEarnings?.reduce((sum, e) => sum + e.amount_usd, 0) || 0;

// Monthly earnings
const { data: monthlyEarnings } = await serviceClient
  .from('earnings_ledger')
  .select('amount_usd')
  .eq('member_id', profile.member.member_id)
  .eq('status', 'approved')
  .gte('created_at', startOfMonth.toISOString());

const currentMonthEarnings = monthlyEarnings?.reduce((sum, e) => sum + e.amount_usd, 0) || 0;
```

**Tabs**:
1. **Personal Info**: Name, email, rep number, phone, address
2. **Compensation Stats**:
   - Dual ladder ranks (Tech & Insurance)
   - Personal/Team credits
   - Lifetime/Monthly earnings
   - Override qualification status
3. **Banking Info**: Account number (masked), routing number
4. **Tax Info**: SSN last 4 digits only

**Tests**: `src/app/dashboard/profile/page.test.tsx` (35 tests)

---

### 6. Settings (`/dashboard/settings`)

**File**: `src/app/dashboard/settings/page.tsx`

**Data Sources**:
- `distributors` (basic profile info)

**Query Pattern**:
```typescript
const { data: distributor } = await serviceClient
  .from('distributors')
  .select('*')
  .eq('auth_user_id', user.id)
  .single();
```

**Tabs**:
1. **Account**: Email, password change (placeholders)
2. **Privacy**: Data sharing preferences (placeholders)
3. **Security**: 2FA, login history (placeholders)

**Note**: Settings page is primarily placeholders for future functionality.

---

### 7. Training (`/dashboard/training`)

**File**: `src/app/dashboard/training/page.tsx`

**Data Sources**:
- `distributors` + `members` (JOIN for rank)

**Query Pattern**:
```typescript
const { data: distributor } = await serviceClient
  .from('distributors')
  .select(`
    *,
    member:members!members_distributor_id_fkey (
      tech_rank
    )
  `)
  .eq('auth_user_id', user.id)
  .single();

const techRank = distributor?.member?.tech_rank || 'starter';

// Filter modules by rank
const RANK_LEVELS = {
  starter: 0, bronze: 1, silver: 2, gold: 3,
  platinum: 4, ruby: 5, diamond: 6, crown: 7, elite: 8
};

const availableModules = allModules.filter(module =>
  !module.rankRequired ||
  RANK_LEVELS[module.rankRequired] <= RANK_LEVELS[techRank]
);
```

**Training Modules**:
1. Getting Started (All ranks)
2. Product Training (All ranks)
3. Compensation Plan (All ranks)
4. Leadership Skills (Gold+)
5. Advanced Strategies (Ruby+)

**Components**:
- Module cards with lock icons for unavailable modules
- Progress tracking (placeholder)

**Tests**: `src/app/dashboard/training/page.test.tsx`

---

### 8. Social Media (`/dashboard/social-media`)

**File**: `src/app/dashboard/social-media/page.tsx`

**Data Sources**:
- `distributors` (for referral link slug)

**Query Pattern**:
```typescript
const { data: distributor } = await serviceClient
  .from('distributors')
  .select('slug, first_name, last_name')
  .eq('auth_user_id', user.id)
  .single();

const referralLink = `https://apexaffinity.com/join/${distributor.slug}`;
```

**Features**:
1. **Pre-made Templates**: 10 social post templates with copy button
2. **UTM Builder**: Build custom tracking links
3. **QR Code Generator**: Generate QR codes for referral links
4. **Marketing Materials**: Downloadable graphics (placeholder)

**Components**:
- `ReferralLinkGenerator` - UTM builder and QR code

**Tests**: `src/app/dashboard/social-media/page.test.tsx`

---

## Common Query Patterns

### Pattern 1: Get Current User with Compensation Data
```typescript
const { data: userData } = await serviceClient
  .from('distributors')
  .select(`
    *,
    member:members!members_distributor_id_fkey (
      member_id,
      tech_rank,
      insurance_rank,
      personal_credits_monthly,
      team_credits_monthly,
      override_qualified
    )
  `)
  .eq('auth_user_id', user.id)
  .single();
```

### Pattern 2: Calculate Monthly Earnings
```typescript
const startOfMonth = new Date();
startOfMonth.setDate(1);

const { data: earnings } = await serviceClient
  .from('earnings_ledger')
  .select('amount_usd')
  .eq('member_id', memberId)
  .eq('status', 'approved')
  .gte('created_at', startOfMonth.toISOString());

const total = earnings?.reduce((sum, e) => sum + e.amount_usd, 0) || 0;
```

### Pattern 3: Get Team Members (Direct Enrollees)
```typescript
const { data: team } = await serviceClient
  .from('members')
  .select(`
    *,
    distributor:distributors!members_distributor_id_fkey (
      id, first_name, last_name, rep_number
    )
  `)
  .eq('enroller_id', currentMemberId);
```

### Pattern 4: Recursive Tree Building
```typescript
async function buildTree(parentId: string): Promise<Node[]> {
  const { data: children } = await serviceClient
    .from('members')
    .select('*')
    .eq('enroller_id', parentId);

  const tree: Node[] = [];
  for (const child of children || []) {
    const grandchildren = await buildTree(child.member_id);
    tree.push({ ...child, children: grandchildren });
  }

  return tree;
}
```

---

## Security Considerations

### Row Level Security (RLS)

All queries use the **service client** (`createServiceClient()`) which bypasses RLS for admin-level queries. This is necessary because:

1. Reps need to see their team data (other members)
2. Recursive queries would be impossible with RLS
3. Earnings data needs cross-member access for override calculations

**Important**: Service client queries MUST include explicit filtering by `auth_user_id` or `enroller_id` to prevent unauthorized data access.

### Encrypted Fields

- `distributor_tax_info.ssn_encrypted` - Full SSN encrypted at rest
- `distributor_tax_info.ssn_last_4` - Last 4 digits only (shown in UI)
- Banking account numbers - Masked in UI (show last 4 only)

---

## Testing Coverage

All pages include comprehensive test suites:

| Page | Test File | Test Count | Coverage |
|------|-----------|------------|----------|
| Dashboard | `page.test.tsx` | 11 | Full |
| Matrix | `page.test.tsx` | 8 | Full |
| Genealogy | `page.test.tsx` | 21 | Full |
| Team | `page.test.tsx` | 19 | Full |
| Profile | `page.test.tsx` | 35 | Full |
| Settings | `page.test.tsx` | 5 | Basic |
| Training | `page.test.tsx` | 5 | Basic |
| Social Media | `page.test.tsx` | 5 | Basic |

**Total**: 109 tests

**Run tests**: `npm test`

---

## Design System

All pages follow the **Professional Slate** design:

- **Color Palette**: slate-700 to slate-900
- **Typography**: Clean, professional, NO emojis
- **Layout**: Card-based, responsive grid
- **Components**: Consistent across all pages

**Key Components**:
- Card containers with `bg-white rounded-lg shadow`
- Headers with `text-2xl font-bold text-slate-900`
- Stats with large numbers `text-3xl font-bold text-slate-900`
- Labels with `text-sm font-medium text-slate-600`
- Buttons with slate-700/slate-800 backgrounds

---

## Future Enhancements

### Planned Features
1. Real-time updates via Supabase Realtime subscriptions
2. Editable profile fields with validation
3. Team messaging system
4. Performance dashboards with charts (Recharts/D3)
5. Export functionality (CSV, PDF)
6. Mobile app views (React Native)

### Performance Optimizations
1. Cache frequently accessed data (React Query)
2. Implement pagination for large team lists
3. Lazy load genealogy tree branches
4. Add loading skeletons for better UX

---

## Troubleshooting

### Common Issues

**Issue**: "Member not found" error
**Cause**: User has distributor record but no member record
**Solution**: Ensure members record is created when distributor signs up

**Issue**: Matrix shows empty levels
**Cause**: No team members enrolled yet
**Solution**: This is expected for new reps

**Issue**: Earnings show $0
**Cause**: No approved earnings in ledger
**Solution**: Check earnings_ledger for status='approved' records

**Issue**: Tree won't expand
**Cause**: JavaScript recursion limit
**Solution**: Limit tree depth to 10 levels max

---

## File Structure

```
src/
├── app/
│   └── dashboard/
│       ├── page.tsx                    # Dashboard
│       ├── matrix/
│       │   └── page.tsx               # Matrix
│       ├── genealogy/
│       │   └── page.tsx               # Genealogy
│       ├── team/
│       │   └── page.tsx               # Team
│       ├── profile/
│       │   └── page.tsx               # Profile
│       ├── settings/
│       │   └── page.tsx               # Settings
│       ├── training/
│       │   └── page.tsx               # Training
│       └── social-media/
│           └── page.tsx               # Social Media
│
└── components/
    ├── dashboard/
    │   ├── CEOVideoSection.tsx
    │   ├── CompensationStatsWidget.tsx
    │   └── QuickActions.tsx
    ├── matrix/
    │   ├── MatrixNodeCard.tsx
    │   └── MatrixLevelView.tsx
    ├── genealogy/
    │   ├── TreeNodeCard.tsx
    │   └── CompensationTreeView.tsx
    ├── team/
    │   ├── TeamMemberCard.tsx
    │   ├── TeamFilters.tsx
    │   └── TeamStatsHeader.tsx
    └── social-media/
        └── ReferralLinkGenerator.tsx
```

---

## Summary

All 8 rep back office pages are now fully wired to the compensation plan database with:

- ✅ Proper table joins (distributors ↔ members ↔ earnings_ledger)
- ✅ Recursive calculations for matrix and genealogy
- ✅ Real compensation data (credits, ranks, earnings)
- ✅ Professional slate design throughout
- ✅ Comprehensive test coverage (109 tests)
- ✅ Consistent query patterns
- ✅ Security considerations (service client with explicit filters)

**Next Steps**:
1. Test all pages end-to-end
2. Commit changes to Git
3. Deploy to staging for user acceptance testing
