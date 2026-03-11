# Integration Guide: 5 Dependency Connection Fixes

This document outlines how to integrate the 5 missing dependency connections into the Apex platform screens.

---

## ✅ COMPLETED

1. **Supabase Migration**: `supabase/migrations/20260311000003_dependency_connections.sql`
   - New tables: `bv_snapshots`, `promotion_fund_ledger`, `org_bv_cache`
   - New columns on `rank_upgrade_requests` and `products`
   - Database functions: `recalculate_sponsor_chain()`, `get_promotion_fund_balance()`
   - Triggers: Auto-recalculate on new distributor insert

2. **Edge Function**: `supabase/functions/snapshot-monthly-bv/index.ts`
   - Creates monthly BV snapshots for all active reps
   - Calculates personal_bv, team_bv, org_bv
   - Logs completion to audit_log
   - Schedule via cron: Last day of month at 11:59 PM CT

---

## 🔧 SCREEN INTEGRATIONS NEEDED

### FIX 1: BV Snapshot Integration

**Screen 15** (`/app/admin/commission-engine/page.tsx`):

```tsx
// Add state
const [bvSnapshotStatus, setBvSnapshotStatus] = useState<'available' | 'missing' | 'checking'>('checking');
const [snapshotMonth, setSnapshotMonth] = useState('');

// Check for BV snapshot before running commission
async function checkBVSnapshot(month: string) {
  const { data } = await supabase
    .from('bv_snapshots')
    .select('id')
    .eq('snapshot_month', month)
    .limit(1);

  setBvSnapshotStatus(data && data.length > 0 ? 'available' : 'missing');
}

// Add "Run BV Snapshot" button
<button
  onClick={async () => {
    const response = await fetch('/api/snapshot-bv', { method: 'POST' });
    const result = await response.json();
    alert(`Snapshot complete: ${result.successful_snapshots} reps`);
  }}
  className="px-4 py-2 bg-blue-600 text-white rounded"
>
  Run BV Snapshot
</button>

// Block commission run if snapshot missing
{bvSnapshotStatus === 'missing' && (
  <div className="bg-red-50 border border-red-200 p-4 rounded">
    <p className="text-red-800 font-semibold">
      BV snapshot missing for {snapshotMonth} — run snapshot first
    </p>
  </div>
)}
```

**API Route** (`/app/api/snapshot-bv/route.ts`):
```tsx
// Call Supabase Edge Function
export async function POST(req: Request) {
  const response = await fetch(
    `${process.env.SUPABASE_URL}/functions/v1/snapshot-monthly-bv`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );

  const data = await response.json();
  return Response.json(data);
}
```

---

### FIX 2: Stripe Price Sync Warning

**Screen 17** (`/app/admin/products/page.tsx`):

```tsx
// After saving product price
async function handleSaveProduct(product) {
  // Save to Supabase
  await supabase.from('products').update({
    member_price: product.member_price
  }).eq('id', product.id);

  // Check Stripe price
  const stripePrice = await fetch(`/api/stripe/check-price?productId=${product.stripe_product_id}`);
  const { price: stripePriceValue } = await stripePrice.json();

  if (stripePriceValue !== product.member_price) {
    // Set mismatch status
    await supabase.from('products').update({
      price_sync_status: 'mismatch',
      stripe_last_checked_at: new Date().toISOString()
    }).eq('id', product.id);

    // Show warning banner
    setStripeMismatch({
      product: product.name,
      supabasePrice: product.member_price,
      stripePrice: stripePriceValue,
      stripeUrl: `https://dashboard.stripe.com/products/${product.stripe_product_id}`
    });
  }
}

// Warning Banner
{stripeMismatch && (
  <div className="bg-red-50 border border-red-200 p-4 rounded flex items-center justify-between">
    <div>
      <p className="text-red-800 font-semibold">
        Stripe price mismatch on {stripeMismatch.product}
      </p>
      <p className="text-red-700 text-sm">
        Supabase: ${stripeMismatch.supabasePrice} • Stripe: ${stripeMismatch.stripePrice}
      </p>
      <p className="text-red-600 text-xs mt-1">
        Active subscribers will continue to be charged ${stripeMismatch.stripePrice} until Stripe is updated.
      </p>
    </div>
    <div className="flex gap-2">
      <a
        href={stripeMismatch.stripeUrl}
        target="_blank"
        className="px-4 py-2 bg-[#635BFF] text-white rounded text-sm"
      >
        Open Stripe Dashboard
      </a>
      <button
        onClick={() => handleDismissMismatch(product.id)}
        className="px-4 py-2 border border-gray-300 rounded text-sm"
      >
        I'll Handle Manually
      </button>
    </div>
  </div>
)}
```

**Screen 12** (`/app/admin/page.tsx`):
```tsx
// Show alert badge if any product has mismatch
const { data: mismatchProducts } = await supabase
  .from('products')
  .select('name')
  .eq('price_sync_status', 'mismatch');

{mismatchProducts && mismatchProducts.length > 0 && (
  <div className="bg-amber-50 border border-amber-200 p-3 rounded">
    <p className="text-amber-800 text-sm">
      ⚠️ {mismatchProducts.length} product(s) have Stripe price mismatches
    </p>
  </div>
)}
```

---

### FIX 3: Smart Office Rank Sync Checklist

**Screen 16** (`/app/admin/rank-approvals/page.tsx`):

```tsx
// After admin approves insurance rank upgrade
async function handleApproveRank(requestId: string) {
  await supabase
    .from('rank_upgrade_requests')
    .update({ status: 'approved' })
    .eq('id', requestId);

  // Show Alexandra's checklist
  setShowSOChecklist(requestId);
}

// Checklist Panel
{showSOChecklist && (
  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
    <h3 className="font-bold text-blue-900 mb-3">Alexandra's Post-Approval Checklist</h3>
    <div className="space-y-2">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={soChecklist.smartOfficeUpdated}
          onChange={async (e) => {
            await supabase.from('rank_upgrade_requests').update({
              smart_office_updated: e.target.checked,
              smart_office_updated_at: new Date().toISOString(),
              smart_office_updated_by: currentUser.id
            }).eq('id', showSOChecklist);

            setSOChecklist({...soChecklist, smartOfficeUpdated: e.target.checked});
          }}
        />
        <span className="text-sm">Smart Office rank updated</span>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={soChecklist.carrierContractsUpdated}
          onChange={async (e) => {
            await supabase.from('rank_upgrade_requests').update({
              carrier_contracts_updated: e.target.checked,
              carrier_contracts_updated_at: new Date().toISOString()
            }).eq('id', showSOChecklist);

            setSOChecklist({...soChecklist, carrierContractsUpdated: e.target.checked});
          }}
        />
        <span className="text-sm">Carrier contract level updated</span>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={soChecklist.repNotified}
          onChange={(e) => setSOChecklist({...soChecklist, repNotified: e.target.checked})}
        />
        <span className="text-sm">Rep notified of new contract rate</span>
      </label>
    </div>

    <button
      onClick={async () => {
        if (allChecklistComplete) {
          await supabase.from('rank_upgrade_requests').update({
            status: 'complete'
          }).eq('id', showSOChecklist);

          // Send email to rep
          await fetch('/api/send-email', {
            method: 'POST',
            body: JSON.stringify({
              to: request.rep_email,
              subject: 'Rank Upgraded - Contracts Updated',
              body: 'Your rank and carrier contracts have been updated.'
            })
          });

          setShowSOChecklist(null);
        }
      }}
      disabled={!allChecklistComplete}
      className="mt-4 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
    >
      Complete Request
    </button>
  </div>
)}
```

**Screen 12** (`/app/admin/page.tsx`):
```tsx
// Show count of incomplete rank approvals
const { data: incompleteApprovals } = await supabase
  .from('rank_upgrade_requests')
  .select('id')
  .eq('status', 'in_progress')
  .or('smart_office_updated.eq.false,carrier_contracts_updated.eq.false');

{incompleteApprovals && incompleteApprovals.length > 0 && (
  <div className="bg-amber-50 p-3 rounded">
    <p className="text-amber-800 text-sm">
      ⚠️ {incompleteApprovals.length} rank approval(s) waiting for Alexandra's checklist
    </p>
  </div>
)}
```

---

### FIX 4: Promotion Fund Ledger

**Screen 22** (`/app/finance/page.tsx`):

```tsx
// Add Promotion Fund balance card
const { data: fundBalance } = await supabase.rpc('get_promotion_fund_balance');

<div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
  <p className="text-xs text-blue-600 mb-1">Promotion Fund Balance</p>
  <p className="text-2xl font-bold text-blue-900">${fundBalance?.toLocaleString() || '0.00'}</p>
</div>
```

**Screen 21** (`/app/admin/settings/page.tsx`):

```tsx
// Add Promotion Fund Ledger section
const { data: ledgerEntries } = await supabase
  .from('promotion_fund_ledger')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(50);

<div className="bg-white rounded-lg p-6">
  <h3 className="text-lg font-bold mb-4">Promotion Fund Ledger</h3>
  <table className="w-full text-sm">
    <thead>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Amount</th>
        <th>Source</th>
        <th>Balance After</th>
      </tr>
    </thead>
    <tbody>
      {ledgerEntries?.map(entry => (
        <tr key={entry.id}>
          <td>{new Date(entry.created_at).toLocaleDateString()}</td>
          <td>{entry.transaction_type}</td>
          <td className={entry.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}>
            {entry.transaction_type === 'credit' ? '+' : '-'}${entry.amount}
          </td>
          <td>{entry.source_order_id || entry.bonus_type}</td>
          <td className="font-bold">${entry.balance_after.toLocaleString()}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

**Screen 31** (`/app/finance/saas-engine/page.tsx`):

```tsx
// Show promotion fund balance next to builder bonuses
const { data: fundBalance } = await supabase.rpc('get_promotion_fund_balance');

<div className="p-3 bg-blue-50 border border-blue-200 rounded">
  <p className="text-xs text-blue-600">Current Promotion Fund Balance</p>
  <p className="text-lg font-bold text-blue-900">${fundBalance?.toLocaleString() || '0.00'}</p>
  <p className="text-xs text-blue-600 mt-1">
    Funds $5 from each Business Center sale for achievement/builder bonuses
  </p>
</div>
```

**Stripe Webhook Handler** (when Business Center order completes):
```tsx
// In webhook handler after successful BC purchase
if (bonusEnabled('promotion_fund')) {
  const currentBalance = await supabase.rpc('get_promotion_fund_balance');

  await supabase.from('promotion_fund_ledger').insert({
    transaction_type: 'credit',
    amount: 5.00,
    source_rep_id: buyer_id,
    source_order_id: order.id,
    balance_after: currentBalance + 5.00,
    notes: 'Business Center purchase contribution'
  });
}
```

**Commission Run** (when paying builder/achievement bonuses):
```tsx
// Check promotion fund before paying
const fundBalance = await supabase.rpc('get_promotion_fund_balance');

if (fundBalance >= bonusAmount) {
  // Pay bonus
  await payBonus(rep_id, bonusAmount);

  // Debit from fund
  await supabase.from('promotion_fund_ledger').insert({
    transaction_type: 'debit',
    amount: bonusAmount,
    bonus_type: 'silver_builder',
    recipient_rep_id: rep_id,
    balance_after: fundBalance - bonusAmount
  });
} else {
  // Flag as "Pending Fund" - carry to next run
  await supabase.from('pending_bonuses').insert({
    rep_id,
    bonus_type: 'silver_builder',
    amount: bonusAmount,
    status: 'pending_fund',
    reason: 'Insufficient promotion fund balance'
  });
}
```

---

### FIX 5: Sponsor Recalculation (Already Automated)

**Automatic via Database Trigger**:
- ✅ Trigger fires on `INSERT` to `distributors` table
- ✅ Calls `recalculate_sponsor_chain(new_rep_id)`
- ✅ Updates `org_bv_cache` for entire sponsor chain
- ✅ Checks rank eligibility and auto-promotes if eligible (SaaS only)

**Screen 1** (`/app/dashboard/page.tsx`):
```tsx
// Read from org_bv_cache instead of live calculation
const { data: bvCache } = await supabase
  .from('org_bv_cache')
  .select('*')
  .eq('rep_id', currentUser.id)
  .single();

// Display cached values for instant load
<div>
  <p>Personal BV: ${bvCache?.personal_bv || 0}</p>
  <p>Team BV: ${bvCache?.team_bv || 0}</p>
  <p>Org BV: ${bvCache?.org_bv || 0}</p>
  <p>Direct Count: {bvCache?.direct_count || 0}</p>
</div>
```

---

## 📝 TESTING CHECKLIST

- [ ] Run migration: `supabase db reset`
- [ ] Deploy edge function: `supabase functions deploy snapshot-monthly-bv`
- [ ] Test BV snapshot: POST to `/functions/v1/snapshot-monthly-bv`
- [ ] Test price mismatch: Change product price in admin, verify warning appears
- [ ] Test SO checklist: Approve insurance rank, verify checklist appears
- [ ] Test promotion fund: Complete BC order, verify $5 credited to ledger
- [ ] Test sponsor recalc: Create new distributor, verify sponsor BV updates

---

## 🚀 DEPLOYMENT

1. Apply migration: `supabase db push`
2. Deploy edge function: `supabase functions deploy snapshot-monthly-bv`
3. Set up cron trigger for edge function (last day of month, 11:59 PM CT)
4. Update screens as outlined above
5. Test all 5 fixes in staging environment
6. Deploy to production

---

## 📊 MONITORING

**Key Metrics**:
- BV snapshots: Check `bv_snapshots` table count per month
- Stripe sync: Monitor `price_sync_status` column on `products`
- SO checklist: Track `smart_office_updated` completion rate
- Promotion fund: Monitor `promotion_fund_ledger` balance growth
- Sponsor recalc: Check `org_bv_cache` update frequency

**Alerts**:
- BV snapshot failures (check audit_log)
- Stripe price mismatches (> 24 hours old)
- SO checklist incomplete (> 48 hours after approval)
- Promotion fund balance < $100 (insufficient for payouts)
- Sponsor recalc errors (check Supabase logs)
