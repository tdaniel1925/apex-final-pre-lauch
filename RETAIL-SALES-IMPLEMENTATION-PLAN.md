# RETAIL SALES SYSTEM - COMPLETE IMPLEMENTATION PLAN

**Date**: March 26, 2026
**Status**: Awaiting Approval
**Estimated Timeline**: 10-12 days

---

## EXECUTIVE SUMMARY

This plan implements a complete retail sales system where reps can sell Pulse products to retail customers via replicated site links. The system includes:

1. **Services page** (public info + rep-specific with cart buttons)
2. **Shopping cart** (multi-product checkout)
3. **Stripe checkout** (retail pricing for customers)
4. **Commission system** (60% of BV to seller, 40% for L1-L5 overrides)
5. **Onboarding booking** (custom calendar system, 9am-7pm CT)
6. **Admin dashboard** (view all onboarding sessions)
7. **Email reminders** (booking confirmations and reminders)
8. **Rep notifications** (when their customer books)

---

## CRITICAL COMPENSATION DECISION REQUIRED

### Current Commission Structure (Tech Ladder)

**For distributor self-purchases:**
- Seller: 60% of BV
- L1 (Enrollment Override): 30% of BV
- L2-L5 (Matrix Overrides): Additional % based on rank
- **Total can exceed 100% of BV**

### Proposed for Retail Customer Sales

**Option A: Simplified 60/40 Split** (RECOMMENDED)
```
Seller Commission:     60% of BV
L1 (Sponsor):         30% of BV (75% of override pool)
L2 (Matrix):           5% of BV (12.5% of override pool)
L3 (Matrix):           3% of BV (7.5% of override pool)
L4 (Matrix):           1% of BV (2.5% of override pool)
L5 (Matrix):           1% of BV (2.5% of override pool)
────────────────────────────────────
TOTAL:               100% of BV
```

**Example: $149 PulseFlow Sale (BV = $69)**
- Customer pays: $149 (retail)
- Seller gets: $41.40 (60% of $69 BV)
- L1 Override: $20.70 (30% of BV)
- L2 Override: $3.45 (5% of BV, if qualified)
- L3 Override: $2.07 (3% of BV, if qualified)
- L4 Override: $0.69 (1% of BV, if qualified)
- L5 Override: $0.69 (1% of BV, if qualified)

**Qualifications:**
- All overrides require 50+ BV/month personal sales
- Rank determines depth access (Bronze = L1-L2, Silver = L1-L3, etc.)

**Option B: Match Current Tech System**
- Use existing L1-L5 percentages (can total 100% of BV)
- Apply compression if needed
- More complex, but consistent with existing structure

**DECISION NEEDED**: Which option do you prefer?

---

## PHASE 1: REMOVE SIGNUP BUTTONS FROM MAIN SITE (1 day)

### Current State
- Main site (`reachtheapex.net`) uses `OptiveReplicatedSite` component
- Has "Join Now" / "Get Started" buttons
- Same design as replicated sites

### Changes Required

**1. Read OptiveReplicatedSite component**
- Location: `src/components/optive/OptiveReplicatedSite.tsx`
- Find all CTA buttons (Join, Get Started, Sign Up)

**2. Add `isMainSite` prop**
```typescript
interface OptiveReplicatedSiteProps {
  distributor: Distributor;
  isMainSite?: boolean;  // NEW
}
```

**3. Conditionally hide buttons**
```typescript
{!isMainSite && (
  <Button>Join Now</Button>
)}
```

**4. Update main site page**
```typescript
// src/app/page.tsx
<OptiveReplicatedSite
  distributor={genericDistributor}
  isMainSite={true}  // NEW
/>
```

**5. Keep buttons on replicated sites**
```typescript
// src/app/[slug]/page.tsx
<OptiveReplicatedSite
  distributor={distributor}
  isMainSite={false}  // Show buttons
/>
```

### Testing
- [ ] Main site has NO signup buttons
- [ ] Replicated sites KEEP signup buttons
- [ ] All other content remains the same

---

## PHASE 2: CREATE SERVICES PAGE (2-3 days)

### Database Schema (if needed)

**Products already exist** - no schema changes needed:
- PulseGuard: $79 retail / $59 member
- PulseFlow: $149 retail / $129 member
- PulseDrive: $299 retail / $219 member
- PulseCommand: $499 retail / $349 member
- Business Center: $39
- SmartLook: $99

### Pages to Create

**1. Public Services Page (informational only)**
- URL: `/services`
- Shows all 6 Pulse products
- Retail pricing displayed
- Feature descriptions
- NO cart/buy buttons
- Professional design matching brand

**2. Rep Services Page (with cart buttons)**
- URL: `/{slug}/services`
- Same content as public page
- ADDS "Add to Cart" buttons
- Attribution tracking (rep gets credit)
- Cookie-based tracking system

### Component Structure

```
src/app/services/page.tsx                    # Public (no buttons)
src/app/[slug]/services/page.tsx             # Rep version (with buttons)
src/components/services/ProductCard.tsx      # Reusable product card
src/components/services/ServiceHero.tsx      # Hero section
src/components/services/ProductGrid.tsx      # Grid layout
```

### Product Card Design

**Each product shows:**
- Product name and tagline
- Key features (3-4 bullet points)
- Retail price (large, prominent)
- Monthly subscription badge
- "Add to Cart" button (rep sites only)
- Service access link (for members)

**Example: PulseFlow Card**
```
┌─────────────────────────────────┐
│  PulseFlow                      │
│  Complete Business Automation   │
│                                 │
│  ✓ AI-powered workflow engine   │
│  ✓ Custom automation builder    │
│  ✓ Multi-platform integration   │
│  ✓ Advanced analytics dashboard │
│                                 │
│  $149/month                     │
│                                 │
│  [ Add to Cart ]  (rep sites)   │
└─────────────────────────────────┘
```

### Attribution Tracking System

**When customer visits `/{slug}/services`:**

1. **Extract slug from URL**
```typescript
const { slug } = params;
```

2. **Store rep attribution in cookie**
```typescript
// Set 30-day cookie
cookies().set('rep_attribution', slug, {
  maxAge: 30 * 24 * 60 * 60,
  httpOnly: true,
  secure: true,
});
```

3. **Load rep info for display**
```typescript
const rep = await getRepBySlug(slug);
// Show "Your representative: John Doe"
```

4. **Persist through checkout**
- Cookie follows customer to checkout
- Rep credited when order completes

### Files to Create

```typescript
// src/lib/attribution/track-rep.ts
export async function setRepAttribution(slug: string) {
  const { cookies } = await import('next/headers');
  cookies().set('rep_attribution', slug, {
    maxAge: 30 * 24 * 60 * 60,
    httpOnly: true,
    secure: true,
  });
}

export async function getRepAttribution(): Promise<string | null> {
  const { cookies } = await import('next/headers');
  return cookies().get('rep_attribution')?.value || null;
}

// src/lib/services/get-products.ts
export async function getPublicProducts() {
  const supabase = createClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('retail_price_cents', { ascending: true });
  return data;
}
```

### Testing
- [ ] Public `/services` page loads (no buttons)
- [ ] Rep `/{slug}/services` page loads (with buttons)
- [ ] Cookie set when visiting rep page
- [ ] All 6 products display correctly
- [ ] Pricing shows retail amounts

---

## PHASE 3: SHOPPING CART SYSTEM (2-3 days)

### Database Schema

**Create `cart_sessions` table:**
```sql
CREATE TABLE cart_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,  -- Browser session ID
  rep_slug TEXT,                     -- Attribution
  items JSONB NOT NULL DEFAULT '[]', -- Cart items
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

CREATE INDEX idx_cart_sessions_session_id ON cart_sessions(session_id);
CREATE INDEX idx_cart_sessions_expires_at ON cart_sessions(expires_at);
```

**Cart Item Structure (JSONB):**
```typescript
interface CartItem {
  product_id: string;
  product_slug: string;
  product_name: string;
  quantity: number;
  retail_price_cents: number;
  bv_cents: number;
}
```

### Cart Management API

**Create API routes:**

```typescript
// src/app/api/cart/add/route.ts
POST /api/cart/add
Body: { product_id, quantity }
Response: { success, cart_count }

// src/app/api/cart/remove/route.ts
POST /api/cart/remove
Body: { product_id }
Response: { success, cart_count }

// src/app/api/cart/get/route.ts
GET /api/cart
Response: { items: CartItem[], total_cents, rep_slug }

// src/app/api/cart/update/route.ts
POST /api/cart/update
Body: { product_id, quantity }
Response: { success, cart_count }

// src/app/api/cart/clear/route.ts
POST /api/cart/clear
Response: { success }
```

### Cart UI Components

```typescript
// src/components/cart/CartButton.tsx
// Floating cart button (bottom right)
// Shows item count badge
// Opens cart drawer on click

// src/components/cart/CartDrawer.tsx
// Slide-in drawer from right
// Lists all cart items
// Shows subtotal
// "Checkout" button

// src/components/cart/CartItem.tsx
// Individual item in cart
// Quantity selector
// Remove button
// Price display

// src/components/cart/AddToCartButton.tsx
// Button on product cards
// Handles add to cart
// Shows loading state
// Success animation
```

### Cart State Management

**Use React Context:**
```typescript
// src/contexts/CartContext.tsx
interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
}
```

### Session Management

**Create session ID:**
```typescript
// Use existing session or generate new UUID
const sessionId = cookies().get('cart_session')?.value || crypto.randomUUID();
cookies().set('cart_session', sessionId, { maxAge: 7 * 24 * 60 * 60 });
```

**Cleanup expired carts:**
```typescript
// Cron job or manual cleanup
DELETE FROM cart_sessions WHERE expires_at < NOW();
```

### Testing
- [ ] Add product to cart
- [ ] Update quantity
- [ ] Remove item
- [ ] Cart persists on page reload
- [ ] Multiple items in cart
- [ ] Total calculates correctly
- [ ] Rep attribution persists

---

## PHASE 4: STRIPE CHECKOUT FOR RETAIL CUSTOMERS (2 days)

### Checkout Flow

```
Customer has items in cart
  ↓
Clicks "Checkout"
  ↓
Redirects to Stripe Checkout
  ↓
Customer enters payment info
  ↓
Stripe processes payment
  ↓
Webhook received
  ↓
Order created in database
  ↓
Customer redirected to booking page
```

### API Route: Create Checkout Session

```typescript
// src/app/api/checkout/retail/route.ts
export async function POST(request: Request) {
  // 1. Get cart items
  const sessionId = cookies().get('cart_session')?.value;
  const cart = await getCart(sessionId);

  // 2. Get rep attribution
  const repSlug = cookies().get('rep_attribution')?.value;
  const rep = await getRepBySlug(repSlug);

  // 3. Create Stripe line items (retail prices)
  const lineItems = cart.items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.product_name },
      unit_amount: item.retail_price_cents,
      recurring: { interval: 'month' },
    },
    quantity: item.quantity,
  }));

  // 4. Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_URL}/booking?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/${repSlug}/services`,
    metadata: {
      cart_session_id: sessionId,
      rep_distributor_id: rep?.id || null,
      rep_slug: repSlug || null,
      sale_type: 'retail',
    },
  });

  return NextResponse.json({ url: session.url });
}
```

### Webhook Handler Enhancement

**Modify existing webhook:**
```typescript
// src/app/api/webhooks/stripe/route.ts

if (event.type === 'checkout.session.completed') {
  const session = event.data.object;
  const metadata = session.metadata;

  if (metadata.sale_type === 'retail') {
    // 1. Create customer record
    const customer = await createCustomer({
      email: session.customer_email,
      name: session.customer_details.name,
      referred_by_distributor_id: metadata.rep_distributor_id,
    });

    // 2. Create order
    const order = await createOrder({
      customer_id: customer.id,
      total_cents: session.amount_total,
      payment_status: 'paid',
      referred_by_distributor_id: metadata.rep_distributor_id,
    });

    // 3. Create order items
    const cart = await getCart(metadata.cart_session_id);
    for (const item of cart.items) {
      await createOrderItem({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price_cents: item.retail_price_cents,
        bv_cents: item.bv_cents,
      });
    }

    // 4. Calculate BV and commissions
    const totalBV = cart.items.reduce((sum, item) =>
      sum + (item.bv_cents * item.quantity), 0
    );

    // 5. Pay seller commission (60% of BV)
    await createSellerCommission({
      distributor_id: metadata.rep_distributor_id,
      order_id: order.id,
      bv_cents: totalBV,
      commission_cents: Math.round(totalBV * 0.60),
    });

    // 6. Calculate L1-L5 overrides
    await calculateRetailOverrides({
      order_id: order.id,
      seller_distributor_id: metadata.rep_distributor_id,
      bv_cents: totalBV,
    });

    // 7. Clear cart
    await clearCart(metadata.cart_session_id);

    // 8. Send order confirmation email
    await sendOrderConfirmation(customer.email, order);
  }
}
```

### Database Functions

**Create BV calculation function:**
```sql
-- supabase/migrations/[timestamp]_bv_calculation.sql
CREATE OR REPLACE FUNCTION calculate_bv(price_cents INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- BV = Price × 0.70 × 0.70 × 0.985 × 0.965
  -- Simplified: Price × 0.4606
  RETURN (price_cents * 0.4606)::INTEGER;
END;
$$ LANGUAGE plpgsql;
```

**Create retail override calculation:**
```sql
-- supabase/migrations/[timestamp]_retail_overrides.sql
CREATE OR REPLACE FUNCTION calculate_retail_overrides(
  p_order_id UUID,
  p_seller_distributor_id UUID,
  p_bv_cents INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_sponsor_id UUID;
  v_sponsor_member_id UUID;
  v_sponsor_bv INTEGER;
  v_matrix_parent_id UUID;
  v_current_level INTEGER := 2;
  v_override_pct DECIMAL;
  v_override_amount INTEGER;
BEGIN
  -- L1: Enrollment Override (30% of BV)
  SELECT sponsor_id INTO v_sponsor_id
  FROM distributors
  WHERE id = p_seller_distributor_id;

  IF v_sponsor_id IS NOT NULL THEN
    -- Get sponsor's member_id and BV
    SELECT m.member_id, m.personal_bv_monthly
    INTO v_sponsor_member_id, v_sponsor_bv
    FROM members m
    INNER JOIN distributors d ON d.id = m.distributor_id
    WHERE d.id = v_sponsor_id;

    -- Check 50 BV qualification
    IF v_sponsor_bv >= 50 THEN
      INSERT INTO earnings_ledger (
        member_id,
        earning_type,
        override_level,
        override_percentage,
        base_amount_cents,
        final_amount_cents,
        source_member_id,
        source_order_id,
        status,
        period_month,
        period_year
      ) VALUES (
        v_sponsor_member_id,
        'override',
        1,
        0.30,
        (p_bv_cents * 0.30)::INTEGER,
        (p_bv_cents * 0.30)::INTEGER,
        (SELECT member_id FROM members WHERE distributor_id = p_seller_distributor_id),
        p_order_id,
        'pending',
        EXTRACT(MONTH FROM NOW())::INTEGER,
        EXTRACT(YEAR FROM NOW())::INTEGER
      );
    END IF;
  END IF;

  -- L2-L5: Matrix Overrides (walk up matrix tree)
  -- Get first matrix parent
  SELECT matrix_parent_id INTO v_matrix_parent_id
  FROM distributors
  WHERE id = p_seller_distributor_id;

  -- Override percentages for L2-L5 (10% total pool)
  -- L2: 5%, L3: 3%, L4: 1%, L5: 1%
  WHILE v_matrix_parent_id IS NOT NULL AND v_current_level <= 5 LOOP
    -- Determine override percentage based on level
    v_override_pct := CASE v_current_level
      WHEN 2 THEN 0.05
      WHEN 3 THEN 0.03
      WHEN 4 THEN 0.01
      WHEN 5 THEN 0.01
      ELSE 0
    END;

    -- Check rank qualification for this level
    -- (Bronze = L2, Silver = L3, Gold = L4, Platinum+ = L5)
    -- Check 50 BV qualification

    -- Insert override if qualified
    -- (Implementation details here)

    -- Move up the tree
    SELECT matrix_parent_id INTO v_matrix_parent_id
    FROM distributors
    WHERE id = v_matrix_parent_id;

    v_current_level := v_current_level + 1;
  END LOOP;

  RETURN 1;
END;
$$ LANGUAGE plpgsql;
```

### Testing
- [ ] Checkout session created
- [ ] Stripe payment processes
- [ ] Order created in database
- [ ] Customer record created
- [ ] Rep attribution saved
- [ ] Seller commission calculated (60% of BV)
- [ ] L1-L5 overrides calculated
- [ ] Cart cleared after purchase
- [ ] Email confirmation sent

---

## PHASE 5: ONBOARDING BOOKING SYSTEM (3-4 days)

### Database Schema

```sql
-- Onboarding sessions table
CREATE TABLE onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  order_id UUID REFERENCES orders(id),
  rep_distributor_id UUID REFERENCES distributors(id),

  -- Session details
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  timezone TEXT DEFAULT 'America/Chicago',
  duration_minutes INTEGER DEFAULT 60,

  -- Status
  status TEXT CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',

  -- Customer info (denormalized for easy access)
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,

  -- Products purchased (for session prep)
  products_purchased JSONB,

  -- Notes
  session_notes TEXT,
  completed_notes TEXT,

  -- Reminders sent
  confirmation_sent_at TIMESTAMPTZ,
  reminder_24h_sent_at TIMESTAMPTZ,
  reminder_1h_sent_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES distributors(id),
  cancellation_reason TEXT
);

CREATE INDEX idx_onboarding_sessions_date ON onboarding_sessions(scheduled_date, scheduled_time);
CREATE INDEX idx_onboarding_sessions_customer ON onboarding_sessions(customer_id);
CREATE INDEX idx_onboarding_sessions_rep ON onboarding_sessions(rep_distributor_id);
CREATE INDEX idx_onboarding_sessions_status ON onboarding_sessions(status);
```

### Booking Page (`/booking`)

**Page loads after successful checkout:**
- URL: `/booking?session_id={CHECKOUT_SESSION_ID}`
- Retrieves order details from Stripe session
- Shows calendar interface
- Available slots: 9am - 7pm CT, Mon-Fri
- 60-minute sessions
- Shows "Onboarding Specialist" as the host

**Components:**

```typescript
// src/app/booking/page.tsx
// Main booking page (server component)

// src/components/booking/BookingCalendar.tsx
// Calendar interface showing available slots

// src/components/booking/TimeSlotPicker.tsx
// Time slot selection (9am-7pm CT)

// src/components/booking/BookingConfirmation.tsx
// Success message after booking
```

### Calendar Logic

**Available slots:**
- Monday - Friday
- 9:00 AM - 7:00 PM Central Time
- 60-minute sessions
- No double-booking (one session per time slot)

**Check availability:**
```typescript
// src/lib/booking/availability.ts
export async function getAvailableSlots(date: Date) {
  const dayOfWeek = date.getDay();

  // Skip weekends
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return [];
  }

  // Generate time slots (9am-7pm CT)
  const slots = [];
  for (let hour = 9; hour < 19; hour++) {
    const slotTime = `${hour.toString().padStart(2, '0')}:00:00`;

    // Check if slot is already booked
    const { data: existing } = await supabase
      .from('onboarding_sessions')
      .select('id')
      .eq('scheduled_date', date.toISOString().split('T')[0])
      .eq('scheduled_time', slotTime)
      .in('status', ['scheduled', 'confirmed'])
      .single();

    if (!existing) {
      slots.push({
        time: slotTime,
        display: formatTime(hour),  // "9:00 AM"
        available: true,
      });
    }
  }

  return slots;
}
```

### Booking API

```typescript
// src/app/api/booking/create/route.ts
export async function POST(request: Request) {
  const { sessionId, date, time } = await request.json();

  // 1. Get order from Stripe session
  const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
  const orderId = stripeSession.metadata.order_id;

  // 2. Get order and customer details
  const order = await getOrder(orderId);
  const customer = await getCustomer(order.customer_id);

  // 3. Get products purchased
  const orderItems = await getOrderItems(orderId);
  const products = orderItems.map(item => ({
    name: item.product_name,
    price: item.unit_price_cents,
  }));

  // 4. Create onboarding session
  const { data: session, error } = await supabase
    .from('onboarding_sessions')
    .insert({
      customer_id: customer.id,
      order_id: order.id,
      rep_distributor_id: order.referred_by_distributor_id,
      scheduled_date: date,
      scheduled_time: time,
      timezone: 'America/Chicago',
      duration_minutes: 60,
      customer_name: customer.full_name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      products_purchased: products,
      status: 'scheduled',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 5. Send confirmation email to customer
  await sendBookingConfirmation(customer.email, session);

  // 6. Notify rep
  await notifyRepOfBooking(order.referred_by_distributor_id, session);

  return NextResponse.json({ success: true, session });
}
```

### Email Templates

**1. Customer Booking Confirmation**
```
Subject: Your Onboarding Session is Scheduled!

Hi [Customer Name],

Thank you for purchasing [Products]!

Your onboarding session is scheduled:
📅 Date: [Date]
🕐 Time: [Time] Central Time
⏱️ Duration: 60 minutes
👤 Host: Onboarding Specialist

What to expect:
✓ Product walkthrough and setup
✓ Best practices and tips
✓ Q&A session
✓ Next steps

Prepare: Have your laptop ready and any questions written down.

[Add to Calendar Button]

Need to reschedule? Reply to this email.

See you soon!
Apex Team
```

**2. Rep Notification**
```
Subject: Your Customer Booked an Onboarding Session

Hi [Rep Name],

Great news! Your customer [Customer Name] has scheduled their onboarding session.

Session Details:
📅 Date: [Date]
🕐 Time: [Time] CT
📦 Products: [Product List]

Your customer will meet with our Onboarding Specialist. You'll receive a notification when the session is completed.

View session details: [Link to admin dashboard]

Keep up the great work!
Apex Team
```

**3. 24-Hour Reminder**
```
Subject: Reminder: Your Onboarding Session is Tomorrow

Hi [Customer Name],

This is a friendly reminder that your onboarding session is tomorrow!

📅 Tomorrow at [Time] Central Time
⏱️ 60 minutes
👤 Host: Onboarding Specialist

[Add to Calendar Button]
[Join Meeting Link - if virtual]

See you tomorrow!
Apex Team
```

**4. 1-Hour Reminder**
```
Subject: Starting Soon: Your Onboarding Session

Hi [Customer Name],

Your onboarding session starts in 1 hour!

🕐 [Time] Central Time (in 60 minutes)
👤 Host: Onboarding Specialist

[Join Meeting Link]

See you soon!
Apex Team
```

### Email Reminder Cron Job

```typescript
// src/lib/cron/booking-reminders.ts
// Run every hour via Inngest or Vercel Cron

export async function sendBookingReminders() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 24-hour reminders
  const sessions24h = await getSessionsForDate(tomorrow);
  for (const session of sessions24h) {
    if (!session.reminder_24h_sent_at) {
      await send24HourReminder(session);
      await markReminderSent(session.id, '24h');
    }
  }

  // 1-hour reminders
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  const sessions1h = await getSessionsInNextHour(oneHourFromNow);
  for (const session of sessions1h) {
    if (!session.reminder_1h_sent_at) {
      await send1HourReminder(session);
      await markReminderSent(session.id, '1h');
    }
  }
}
```

### Testing
- [ ] Booking page loads after checkout
- [ ] Calendar shows available slots
- [ ] Weekends are blocked
- [ ] Time slots 9am-7pm CT only
- [ ] No double-booking
- [ ] Session created in database
- [ ] Confirmation email sent to customer
- [ ] Rep notified of booking
- [ ] 24-hour reminder sent
- [ ] 1-hour reminder sent

---

## PHASE 6: ADMIN ONBOARDING SESSIONS DASHBOARD (1-2 days)

### Admin Dashboard Tab

**Location:** `/admin/onboarding-sessions`

**Features:**
- View all upcoming sessions
- Filter by date, status, rep
- Search by customer name/email
- Mark sessions as completed/no-show
- Add session notes
- Reschedule sessions
- Cancel sessions
- Export to CSV

### Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  Onboarding Sessions                        [+ Manual]   │
├─────────────────────────────────────────────────────────┤
│  Filters:                                               │
│  [Date Range ▼] [Status ▼] [Rep ▼] [Search...     ]   │
├─────────────────────────────────────────────────────────┤
│  📅 Today (3 sessions)                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 9:00 AM - John Smith                            │   │
│  │ Products: PulseFlow, PulseDrive                 │   │
│  │ Rep: Jane Doe (#12345)                          │   │
│  │ Status: ✅ Confirmed                            │   │
│  │ [View] [Complete] [Reschedule] [Cancel]       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 11:00 AM - Mary Johnson                        │   │
│  │ Products: PulseGuard                            │   │
│  │ Rep: Bob Smith (#23456)                         │   │
│  │ Status: 📅 Scheduled                            │   │
│  │ [View] [Complete] [Reschedule] [Cancel]       │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  📅 Tomorrow (2 sessions)                               │
│  ...                                                    │
└─────────────────────────────────────────────────────────┘
```

### API Routes

```typescript
// src/app/api/admin/onboarding-sessions/route.ts
GET /api/admin/onboarding-sessions
Query: ?date=2026-03-27&status=scheduled&rep_id=xxx
Response: { sessions: [...] }

// src/app/api/admin/onboarding-sessions/[id]/route.ts
GET /api/admin/onboarding-sessions/[id]
Response: { session: {...} }

PATCH /api/admin/onboarding-sessions/[id]
Body: { status: 'completed', completed_notes: '...' }
Response: { success: true }

DELETE /api/admin/onboarding-sessions/[id]
Response: { success: true }

// src/app/api/admin/onboarding-sessions/[id]/reschedule/route.ts
POST /api/admin/onboarding-sessions/[id]/reschedule
Body: { new_date, new_time }
Response: { success: true }
```

### Components

```typescript
// src/app/admin/onboarding-sessions/page.tsx
// Main admin page

// src/components/admin/onboarding/SessionList.tsx
// List of sessions grouped by date

// src/components/admin/onboarding/SessionCard.tsx
// Individual session card

// src/components/admin/onboarding/SessionDetailsModal.tsx
// Modal with full session details

// src/components/admin/onboarding/RescheduleModal.tsx
// Modal for rescheduling

// src/components/admin/onboarding/CompleteSessionModal.tsx
// Modal for marking completed with notes
```

### Session Details View

```
Session Details
─────────────────────────────────────
Customer: John Smith
Email: john@example.com
Phone: (555) 123-4567

Products Purchased:
✓ PulseFlow ($149/month)
✓ PulseDrive ($299/month)

Rep: Jane Doe (#12345)
Rep Email: jane@example.com

Scheduled:
📅 March 27, 2026
🕐 9:00 AM - 10:00 AM Central Time
⏱️ 60 minutes

Status: ✅ Confirmed

Reminders Sent:
✓ Confirmation: March 25, 2:15 PM
✓ 24-hour: March 26, 9:00 AM
⏳ 1-hour: Pending

Session Notes:
[Text area for notes]

[Mark Completed] [No-Show] [Cancel] [Reschedule]
```

### Manual Session Creation

**For admin to manually add sessions:**
- Button: "+ Manual Session"
- Form: Customer info, date, time, products
- Use case: Phone bookings, special requests

### Testing
- [ ] Admin can view all sessions
- [ ] Filtering works correctly
- [ ] Mark session as completed
- [ ] Add session notes
- [ ] Reschedule session
- [ ] Cancel session
- [ ] Create manual session
- [ ] Export to CSV

---

## PHASE 7: INTEGRATION & END-TO-END TESTING (1 day)

### Complete Flow Testing

**Test Scenario 1: Happy Path**
1. Customer visits `reachtheapex.net/johndoe/services`
2. Rep attribution cookie set
3. Customer adds PulseFlow to cart
4. Customer adds PulseDrive to cart
5. Cart shows 2 items, correct total
6. Customer clicks "Checkout"
7. Stripe checkout session created
8. Customer completes payment
9. Order created in database
10. Customer record created
11. Seller commission calculated (60% of BV)
12. L1-L5 overrides calculated
13. Customer redirected to `/booking`
14. Customer selects date/time
15. Onboarding session created
16. Confirmation email sent to customer
17. Rep notified of booking
18. Session appears in admin dashboard

**Verify:**
- [ ] Rep attribution persists through entire flow
- [ ] Cart items correct
- [ ] Payment processes
- [ ] Order created with correct details
- [ ] Customer record created
- [ ] Commissions calculated correctly
- [ ] Overrides calculated correctly
- [ ] Booking created
- [ ] Emails sent
- [ ] Admin dashboard updated

**Test Scenario 2: No Rep Attribution**
1. Customer visits `reachtheapex.net/services` (no rep)
2. Tries to add to cart
3. Should show: "This product requires a representative link"
4. OR: Allow purchase but credit to corporate account

**Decision needed:** What happens if no rep attribution?

**Test Scenario 3: Cart Abandonment**
1. Customer adds items to cart
2. Doesn't checkout
3. Cart expires after 7 days
4. Verify cleanup works

**Test Scenario 4: Failed Payment**
1. Customer initiates checkout
2. Payment fails
3. No order created
4. No commissions calculated
5. Customer returned to cart

**Test Scenario 5: Multiple Sessions Same Day**
1. Book session at 9am
2. Book another at 10am
3. Both show in admin dashboard
4. No conflicts

### Commission Verification

**Create test orders and verify:**
- [ ] BV calculated correctly
- [ ] Seller gets 60% of BV
- [ ] L1 override = 30% of BV
- [ ] L2-L5 overrides = 10% of BV total
- [ ] 50 BV qualification enforced
- [ ] Rank depth qualification enforced
- [ ] Total payout = 100% of BV

### Email Testing

**Verify all emails send:**
- [ ] Order confirmation
- [ ] Booking confirmation
- [ ] Rep notification
- [ ] 24-hour reminder
- [ ] 1-hour reminder

### Performance Testing

- [ ] Cart operations < 200ms
- [ ] Checkout session creation < 500ms
- [ ] Webhook processing < 2s
- [ ] Booking page load < 1s
- [ ] Admin dashboard load < 1s

---

## PHASE 8: DOCUMENTATION & TRAINING (1 day)

### User Documentation

**For Reps:**
- How to share service links
- How to track their sales
- How to see their customers' bookings
- Commission structure explained

**For Customers:**
- How to purchase products
- How to book onboarding
- What to expect in session
- How to reschedule

**For Admins:**
- How to view sessions
- How to mark completed
- How to reschedule
- How to generate reports

### Internal Documentation

**Technical Docs:**
- Architecture overview
- Database schema
- API endpoints
- Commission calculation logic
- Email templates
- Cron jobs

**Maintenance:**
- How to update product pricing
- How to adjust override percentages
- How to handle refunds
- How to modify booking hours

---

## TIMELINE SUMMARY

| Phase | Days | Dependencies |
|-------|------|--------------|
| 1. Remove signup buttons | 1 | None |
| 2. Create services page | 2-3 | Phase 1 |
| 3. Shopping cart | 2-3 | Phase 2 |
| 4. Stripe checkout | 2 | Phase 3 |
| 5. Booking system | 3-4 | Phase 4 |
| 6. Admin dashboard | 1-2 | Phase 5 |
| 7. Testing | 1 | All phases |
| 8. Documentation | 1 | All phases |
| **TOTAL** | **13-17 days** | |

**Realistic Timeline: 2-3 weeks**

---

## TECHNICAL STACK

**Frontend:**
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- Shadcn UI components

**Backend:**
- Next.js API routes
- Supabase (PostgreSQL + Auth)
- Stripe (payments)
- Resend (emails)

**Infrastructure:**
- Vercel (hosting)
- Vercel Cron (scheduled jobs)
- Supabase Edge Functions (optional)

---

## CRITICAL DECISIONS NEEDED

### 1. Commission Structure (REQUIRED)
- [ ] Option A: Simplified 60/40 split (recommended)
- [ ] Option B: Match current tech system with compression

### 2. No Rep Attribution
- [ ] Block purchase (require rep link)
- [ ] Allow purchase, credit to corporate account
- [ ] Allow purchase, no commission

### 3. Booking System
- [ ] Virtual meetings (add Zoom/Teams link)
- [ ] In-person meetings (add location field)
- [ ] Phone calls only (add phone field)

### 4. Session Duration
- [ ] 60 minutes (recommended)
- [ ] 30 minutes (shorter)
- [ ] Custom per product

### 5. Booking Restrictions
- [ ] One session per order (recommended)
- [ ] One session per product
- [ ] Multiple sessions allowed

---

## RISKS & MITIGATION

### Risk 1: Commission Calculation Complexity
**Mitigation:** Start with simplified Option A, test thoroughly

### Risk 2: Webhook Reliability
**Mitigation:** Add retry logic, manual reconciliation tools

### Risk 3: Double-Booking
**Mitigation:** Transaction locks on session creation

### Risk 4: Email Deliverability
**Mitigation:** Use Resend with proper SPF/DKIM, monitor bounce rates

### Risk 5: Cart Abandonment
**Mitigation:** Send reminder emails (future enhancement)

---

## SUCCESS CRITERIA

**System is successful when:**
- [ ] Reps can share product links
- [ ] Customers can purchase without friction
- [ ] Commissions calculate correctly (60/40 split)
- [ ] Bookings create automatically
- [ ] Emails send reliably
- [ ] Admin can manage sessions
- [ ] Zero manual intervention required for 95% of orders

---

## NEXT STEPS

1. **Review this plan** and provide feedback
2. **Approve commission structure** (Option A or B)
3. **Answer critical decisions** above
4. **Approve timeline** and resource allocation
5. **Begin Phase 1** implementation

---

**END OF IMPLEMENTATION PLAN**

Ready to proceed when you approve this plan and answer the critical decisions.
