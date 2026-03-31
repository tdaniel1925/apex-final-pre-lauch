# Product Catalog Enhancement - UI Guide

## Admin Products Page

### Table Layout

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Service Subscriptions                                           [+ Add Service]  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  [Total: 6]  [Active: 6]  [Subscriptions: 6]  [One-Time: 0]                    │
│                                                                                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Service         │ Category  │ Price    │ Credits │ Type    │ Onboarding  │ ... │
├─────────────────┼───────────┼──────────┼─────────┼─────────┼─────────────┼─────┤
│ 📦 PulseMarket  │ AgentP... │ $59/mo   │ 59      │ 📅 Sub  │ ✓ Required  │ ✏️ 🗑️│
│                 │           │ Ret: $79 │         │         │ 30 min      │     │
├─────────────────┼───────────┼──────────┼─────────┼─────────┼─────────────┼─────┤
│ 📦 PulseFlow    │ AgentP... │ $129/mo  │ 129     │ 📅 Sub  │ ✓ Required  │ ✏️ 🗑️│
│                 │           │ Ret: $149│         │         │ 30 min      │     │
├─────────────────┼───────────┼──────────┼─────────┼─────────┼─────────────┼─────┤
│ 📦 Business...  │ AgentP... │ $30/mo   │ 30      │ 📅 Sub  │ ✗ Not Req.  │ ✏️ 🗑️│
│                 │           │ Ret: $40 │         │         │             │     │
└─────────────────┴───────────┴──────────┴─────────┴─────────┴─────────────┴─────┘
```

### Onboarding Column Details

**When Required:**
```
┌─────────────────┐
│  ✓ Required     │  ← Blue badge
│  30 min         │  ← Gray text
└─────────────────┘
```

**When Not Required:**
```
┌─────────────────┐
│  ✗ Not Required │  ← Gray badge
└─────────────────┘
```

## Product Form - Onboarding Section

### New Product Form

Located between "Service Access" and "Status" sections:

```
┌───────────────────────────────────────────────────────────────────┐
│  Onboarding Settings                                              │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ☑ Require onboarding session after purchase                     │
│                                                                    │
│  ┌──────────────────────────────────┬─────────────────────────┐  │
│  │ Session Duration (minutes)       │                         │  │
│  │ [ 30                         ]   │                         │  │
│  │ Typical session length           │                         │  │
│  └──────────────────────────────────┴─────────────────────────┘  │
│                                                                    │
│  Onboarding Instructions                                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Special instructions or topics to cover during             │  │
│  │ onboarding...                                              │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│  Internal notes for the onboarding team                          │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘
```

### When Checkbox is Unchecked

```
┌───────────────────────────────────────────────────────────────────┐
│  Onboarding Settings                                              │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ☐ Require onboarding session after purchase                     │
│                                                                    │
│  (Duration and instructions fields hidden)                        │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘
```

## Product Success Page

### With Onboarding Required

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                            ✓                                        │
│                         (Large Green Checkmark)                     │
│                                                                     │
│                   Thank You for Your Purchase!                      │
│                                                                     │
│           Your subscription has been successfully activated.        │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                          📅                                  │  │
│  │                                                              │  │
│  │           Schedule Your Onboarding Session                  │  │
│  │                                                              │  │
│  │  To get started with your new AI-powered tools, you'll     │  │
│  │  need to schedule a 30-minute onboarding session with      │  │
│  │  BotMakers.                                                 │  │
│  │                                                              │  │
│  │           You will be redirected in a moment...             │  │
│  │                                                              │  │
│  │  [ 📅 Schedule Now ]    [ Skip for Now ]                   │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Questions? Contact support at support@theapexway.net              │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Without Onboarding

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                            ✓                                        │
│                         (Large Green Checkmark)                     │
│                                                                     │
│                   Thank You for Your Purchase!                      │
│                                                                     │
│           Your subscription has been successfully activated.        │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  What Happens Next?                          │  │
│  │                                                              │  │
│  │  ✓ You'll receive a confirmation email with your order     │  │
│  │    details                                                   │  │
│  │                                                              │  │
│  │  ✓ Access to your service will be activated within 24      │  │
│  │    hours                                                     │  │
│  │                                                              │  │
│  │  ✓ Your referring distributor has been credited with       │  │
│  │    Business Volume (BV)                                     │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│     [ View All Products ]    [ Return Home ]                       │
│                                                                     │
│  Questions? Contact support at support@theapexway.net              │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Loading State

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                                                                     │
│                            ⟳                                        │
│                      (Spinning Loader)                              │
│                                                                     │
│                   Processing your purchase...                       │
│                                                                     │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

## Edit Product Page

### Page Header

```
┌────────────────────────────────────────────────────────────────────┐
│  ← Back to Services                                                │
│                                                                     │
│  Edit Service                                                       │
│  Update service subscription details                                │
│                                                                     │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  (Product Form with pre-populated data)                            │
│                                                                     │
│  Basic Information                                                  │
│  ├─ Service Name: [PulseMarket                            ]       │
│  ├─ URL Slug: [pulsemarket                                ]       │
│  └─ ...                                                            │
│                                                                     │
│  Pricing                                                            │
│  ├─ Retail Price: [79.00                                  ]       │
│  ├─ Wholesale Price: [59.00                               ]       │
│  └─ Credits (BV): [59                                     ]       │
│                                                                     │
│  Onboarding Settings                                               │
│  ├─ ☑ Require onboarding session after purchase                   │
│  ├─ Session Duration: [30                                 ]       │
│  └─ Instructions: [Cover lead gen features...            ]        │
│                                                                     │
│  Status                                                             │
│  ├─ ☑ Active (visible in store)                                   │
│  └─ ☐ Featured                                                     │
│                                                                     │
│                                [ Cancel ]  [ 💾 Update Service ]   │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

## Color Reference

### Status Badges

- **Required (Onboarding):** Blue badge (`bg-blue-100 text-blue-800`)
- **Not Required:** Gray badge (`bg-gray-100 text-gray-800`)
- **Active:** Green badge (`bg-green-100 text-green-800`)
- **Inactive:** Gray badge (`bg-gray-100 text-gray-800`)
- **Subscription:** Purple badge (`bg-purple-100 text-purple-800`)
- **One-Time:** Blue badge (`bg-blue-100 text-blue-800`)

### Buttons

- **Primary (Save/Create):** Dark slate (`bg-slate-900 hover:bg-slate-800`)
- **Secondary (Cancel):** Border with slate (`border-slate-300 hover:bg-slate-50`)
- **Success (Schedule Now):** Blue (`bg-blue-600 hover:bg-blue-700`)

### Text Colors

- **Headings:** `text-slate-900`
- **Body Text:** `text-slate-700`
- **Helper Text:** `text-slate-500` or `text-slate-600`

## Responsive Behavior

### Mobile View

On smaller screens:
- Table scrolls horizontally
- Form fields stack vertically (single column)
- Buttons stack on mobile

### Desktop View

- Table fits full width
- Form uses 2-column grid for related fields
- Buttons display inline

## Accessibility

- All form inputs have proper labels
- Helper text provides context
- Color contrast meets WCAG AA standards
- Keyboard navigation supported
- Screen reader friendly

## Animation

- **Loading Spinner:** Smooth rotation animation
- **Auto-redirect:** 3-second countdown with visual feedback
- **Hover States:** Subtle color transitions on buttons and links

## Error States

### Form Validation
```
┌───────────────────────────────────────────────────────────────────┐
│  ⚠️ Retail price must be greater than wholesale price            │
└───────────────────────────────────────────────────────────────────┘
```

### API Error
```
┌───────────────────────────────────────────────────────────────────┐
│  ❌ Failed to update product. Please try again.                  │
└───────────────────────────────────────────────────────────────────┘
```

## Success States

### Product Created
```
✓ Service created successfully!
(Redirect to /admin/products)
```

### Product Updated
```
✓ Service updated successfully!
(Redirect to /admin/products)
```
