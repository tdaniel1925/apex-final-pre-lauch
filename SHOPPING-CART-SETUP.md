# Shopping Cart System - Setup Guide

## ✅ What's Included

Your shopping cart system is now complete with:

### 📄 Pages Created:
1. **`/cart`** - Full shopping cart page
   - Add/remove items
   - Update quantities
   - See order total
   - Rep attribution display
   - Empty cart state

2. **`/checkout`** - Checkout page
   - Customer information form
   - Shipping address
   - Ready for Stripe payment integration
   - Order summary

### 🔌 API Endpoints:
- ✅ `GET /api/cart` - Get cart contents
- ✅ `POST /api/cart/add` - Add item to cart
- ✅ `POST /api/cart/update` - Update item quantity
- ✅ `POST /api/cart/remove` - Remove item from cart
- ✅ `POST /api/cart/clear` - Clear entire cart

### 🧩 Components:
- **`CartIcon`** - Shopping cart icon with item count badge

---

## 🚀 How to Use

### Add Cart Icon to Navigation

Add the cart icon to any header/navigation:

```tsx
import CartIcon from '@/components/cart/CartIcon';

export default function Header() {
  return (
    <header>
      {/* Your other nav items */}
      <CartIcon />
    </header>
  );
}
```

### Add "Add to Cart" Button to Product Pages

```tsx
const handleAddToCart = async (productId: string) => {
  const response = await fetch('/api/cart/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id: productId }),
  });

  const data = await response.json();

  if (data.success) {
    alert('Added to cart!');
    // Optionally refresh cart count
  }
};
```

---

## 🎨 Features

### Cart Page (`/cart`)
- ✅ Real-time quantity updates
- ✅ Instant local updates (optimistic UI)
- ✅ Remove items with one click
- ✅ Clear entire cart option
- ✅ Rep attribution tracking
- ✅ Beautiful empty state
- ✅ Responsive design
- ✅ Loading states

### Checkout Page (`/checkout`)
- ✅ Customer information form
- ✅ Shipping address collection
- ✅ Order summary sidebar
- ✅ Form validation
- ✅ Ready for Stripe integration

### Cart Icon
- ✅ Shows item count badge
- ✅ Auto-updates every 30 seconds
- ✅ Hover effects
- ✅ Accessible (ARIA labels)
- ✅ Mobile-friendly

---

## 🔗 Next Steps

### 1. Add Cart Icon to Your Navigation

Find your header component (likely in `src/components/` or `src/app/layout.tsx`) and add:

```tsx
import CartIcon from '@/components/cart/CartIcon';

// In your header JSX:
<CartIcon />
```

### 2. Add "Add to Cart" Buttons to Products

On any product display page, add a button:

```tsx
<button
  onClick={() => handleAddToCart(product.id)}
  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  Add to Cart
</button>
```

### 3. Complete Stripe Checkout Integration

Create `/api/checkout/create-session/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  const { customer_info, rep_slug } = await request.json();

  // Get cart from session
  const cartResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/cart`);
  const cart = await cartResponse.json();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: cart.items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product_name,
        },
        unit_amount: item.retail_price_cents,
      },
      quantity: item.quantity,
    })),
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
    customer_email: customer_info.email,
    metadata: {
      rep_slug: rep_slug || '',
    },
  });

  return NextResponse.json({ url: session.url });
}
```

---

## 📦 Database Schema

The cart uses the existing `cart_sessions` table:

```sql
CREATE TABLE cart_sessions (
  session_id TEXT PRIMARY KEY,
  rep_slug TEXT,
  items JSONB,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Item format in `items` JSONB:
```json
{
  "product_id": "uuid",
  "product_slug": "product-slug",
  "product_name": "Product Name",
  "quantity": 1,
  "retail_price_cents": 9900,
  "bv_cents": 4000
}
```

---

## 🎯 Rep Attribution

The cart automatically tracks which rep referred the customer via cookies:

1. Customer visits: `yoursite.com/rep/john-doe`
2. Cookie set: `rep_attribution=john-doe`
3. When they purchase, rep gets credited

This works alongside your existing MLM compensation system.

---

## 🔒 Security Features

- ✅ Server-side cart storage (not localStorage)
- ✅ HttpOnly cookies for session
- ✅ 7-day cart expiration
- ✅ Product validation on add
- ✅ Price verification from database

---

## 📱 Mobile Responsive

All cart pages are fully responsive:
- Desktop: Side-by-side layout
- Tablet: Stacked with proper spacing
- Mobile: Single column, touch-friendly buttons

---

## 🧪 Test Your Cart

1. Visit `/cart` - See empty state
2. Add a product (you'll need to add this button)
3. Visit `/cart` - See item
4. Update quantity
5. Proceed to checkout
6. Fill out form
7. Complete payment (after Stripe integration)

---

## 💡 Tips

### Show Cart Count in Multiple Places
```tsx
// Any component can fetch cart count
const [count, setCount] = useState(0);

useEffect(() => {
  fetch('/api/cart')
    .then(res => res.json())
    .then(data => setCount(data.cart_count));
}, []);
```

### Toast Notifications for Cart Actions
```tsx
import { toast } from 'sonner'; // or your toast library

await fetch('/api/cart/add', { ... });
toast.success('Added to cart!');
```

### Cart Persistence
Cart persists for 7 days via cookies. Items remain even if user closes browser.

---

## 🎨 Customization

All styling uses Tailwind CSS classes. Customize colors/spacing by editing the components.

---

## 📞 Need Help?

If you need any modifications:
- Change styling
- Add shipping calculator
- Custom checkout flow
- Additional payment methods
- Inventory tracking

Just ask!
