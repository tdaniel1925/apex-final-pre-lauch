# Admin Financial Dashboard

## Overview

Real-time financial monitoring dashboard for Apex administrators. Provides comprehensive transaction tracking, revenue breakdowns, commission calculations, and export functionality.

## Features

### 1. Real-Time Transaction Feed
- Live transaction updates using Supabase real-time subscriptions
- Displays last 100 transactions with auto-refresh
- Filterable by:
  - Order type (Member, Retail, Business Center)
  - Status (Pending, Complete, Refunded)
  - Search by order number or distributor name
- Sortable by date, amount, or BV
- Pagination support (50 transactions per page)

### 2. Key Metrics Cards
- **Today**: Revenue, BV, order count
- **This Week**: Last 7 days statistics
- **This Month**: Month-to-date totals
- **Active Distributors**: Count of distributors with sales this month

### 3. Revenue Breakdown
Based on the 7-level compensation spec (APEX_COMP_ENGINE_SPEC_7_LEVEL.md):

```
Total Revenue
├─ BotMakers Fee (30%)
├─ Apex Take (30% of adjusted gross)
├─ Bonus Pool (3.5% of remainder)
├─ Leadership Pool (1.5% of remainder)
└─ Commission Pool (remaining)
   ├─ Seller Commission (60%)
   └─ Override Pool (40%)
```

### 4. Commission Run Status
- Last commission run details
- Total sales and commissions paid
- Historical run data
- Run status indicators (Pending, Processing, Locked)

### 5. Preliminary Commission Payouts
Month-to-date commission estimates for top distributors:
- Distributor name and rank
- Personal BV (business volume)
- Team BV
- Estimated commission (60% of personal BV - preliminary calculation)
- Override qualification status (50 QV minimum)

**Note**: These are preliminary estimates only. Actual commissions are calculated during the monthly commission run and include overrides, bonuses, and adjustments.

### 6. Data Export
- Export filtered transactions to CSV
- Includes all visible columns
- Filename format: `transactions-YYYY-MM-DD.csv`

## Database Queries

### Orders Table
```typescript
{
  id: UUID
  order_number: string
  order_type: 'member' | 'retail' | 'business_center'
  gross_amount_cents: number
  bv_amount: number
  status: string
  rep_id: UUID
  created_at: timestamp
}
```

### Commission Runs Table
```typescript
{
  id: UUID
  period_start: date
  period_end: date
  status: string
  total_sales_cents: number
  total_commissions_cents: number
  breakage_pool_cents: number
  created_at: timestamp
}
```

### Members/Distributors Join
```typescript
{
  distributors: {
    id, first_name, last_name
  },
  members: {
    tech_rank,
    personal_bv_monthly,
    team_bv_monthly,
    personal_qv_monthly,
    override_qualified
  }
}
```

## Access Control

### Middleware Protection
Route: `/admin/finance/*`

**Requirements:**
- Must be authenticated via Supabase auth
- Must be in `admins` table (any role), OR
- Must have `is_admin = true` in `distributors` table, OR
- Must have `admin_role IN ('cfo', 'admin')` in `distributors` table

**Fallback:**
- Unauthenticated users → `/login?redirect=/admin/finance/dashboard`
- Unauthorized users → `/dashboard`

## Real-Time Updates

Uses Supabase Realtime subscriptions to listen for new transactions:

```typescript
supabase
  .channel('finance-dashboard')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'orders'
  }, (payload) => {
    // Add new transaction to feed
    // Update today's stats
  })
  .subscribe();
```

## Calculations

### Waterfall Calculation
Based on `src/lib/compensation/waterfall.ts`:

```typescript
const botmakersFee = revenue * 0.3;
const adjustedGross = revenue - botmakersFee;
const apexTake = adjustedGross * 0.3;
const remainder = adjustedGross - apexTake;
const bonusPool = remainder * 0.035;
const leadershipPool = remainder * 0.015;
const commissionPool = remainder - bonusPool - leadershipPool;
const overridePool = commissionPool * 0.4;
```

### Preliminary Commission Estimate
```typescript
const estimatedCommission = personalBV * 0.6;
```

**Important**: This is a simplified estimate. Actual commission calculation includes:
- Seller commission (60% of BV)
- Override commissions (L1-L7 based on rank)
- Rank bonuses
- Bonus pool distributions
- Leadership pool distributions
- Clawbacks and adjustments

See `src/lib/compensation/` for full calculation logic.

## UI Components

### Professional Design
Follows the design system from `src/components/homepage/ProfessionalHomepage.tsx`:
- Clean, corporate aesthetic
- Navy blue (#2c5aa0) and slate grays
- Consistent spacing and typography
- Accessible contrast ratios (WCAG AA)

### Color Coding
- **Green**: Success, revenue, commissions
- **Blue**: Information, member orders
- **Purple**: Leadership, retail orders
- **Orange**: Warnings, Business Center orders
- **Red**: Errors, refunds
- **Yellow**: Pending states

### Typography
- Headings: `font-bold text-slate-900`
- Body: `text-sm text-slate-600`
- Values: `font-mono text-slate-900`
- Subtext: `text-xs text-slate-500`

## Future Enhancements

### Missing Data Fields
The following fields would enhance the dashboard but require database migrations:

1. **Commission Ledger Table**
   - Individual commission line items per distributor
   - Commission type (seller, override, bonus)
   - Breakdown by level (L1-L7)

2. **Real-Time BV Tracking**
   - Live BV updates as orders complete
   - Team BV recalculation triggers
   - Rank progression indicators

3. **Commission Run Controls**
   - Manual commission run trigger
   - Preview mode before finalizing
   - Edit/adjustment interface
   - Approval workflow

4. **Advanced Filters**
   - Date range picker
   - Product filter
   - Rank filter
   - BV threshold filter

5. **Charts and Visualizations**
   - Revenue trends (line chart)
   - Top products (bar chart)
   - Distributor performance (leaderboard)
   - Commission breakdown (pie chart)

## Related Files

- **Server Component**: `page.tsx` (data fetching)
- **Client Component**: `FinanceDashboardClient.tsx` (interactive UI)
- **Compensation Logic**: `src/lib/compensation/waterfall.ts`
- **Compensation Config**: `src/lib/compensation/config.ts`
- **Spec Document**: `APEX_COMP_ENGINE_SPEC_7_LEVEL.md`
- **Middleware**: `src/middleware.ts` (route protection)
- **Utilities**: `src/lib/utils/format.ts` (formatting helpers)

## Testing

### Manual Testing Checklist
- [ ] Load dashboard as admin user
- [ ] Verify all metrics cards display correctly
- [ ] Filter transactions by type, status, search
- [ ] Sort transactions by date, amount, BV
- [ ] Export CSV and verify data
- [ ] Check revenue breakdown calculations
- [ ] Verify commission run history
- [ ] Verify preliminary payouts table
- [ ] Test real-time updates (create test order)
- [ ] Test unauthorized access (non-admin user)

### Sample Data
To test with sample data:
```sql
-- Create test orders
INSERT INTO orders (order_number, order_type, gross_amount_cents, bv_amount, status, rep_id)
VALUES
  ('ORD-TEST-001', 'member', 14900, 69.65, 'complete', 'YOUR_REP_ID'),
  ('ORD-TEST-002', 'retail', 29900, 139.83, 'complete', 'YOUR_REP_ID'),
  ('ORD-TEST-003', 'business_center', 3900, 18.10, 'complete', 'YOUR_REP_ID');
```

## Support

For questions or issues, contact:
- **Technical**: Development team
- **Business Logic**: Refer to APEX_COMP_ENGINE_SPEC_7_LEVEL.md
- **Access Issues**: Admin team

---

**Version**: 1.0.0
**Last Updated**: March 31, 2026
**Author**: Apex Development Team
