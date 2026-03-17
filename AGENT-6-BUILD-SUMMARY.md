# Agent 6 Build Summary: Training & Social Media Pages Rebuild

## Overview
Rebuilt the Training and Social Media dashboard pages with professional slate color scheme, card-based layouts, and proper data wiring.

---

## Files Created/Modified

### Pages (Server Components)
1. **`src/app/dashboard/training/page.tsx`** - COMPLETELY REPLACED
   - Server-side page with rank-based module filtering
   - Fetches user data from `distributors` and `members` tables
   - Professional slate theme with gradient hero section

2. **`src/app/dashboard/social-media/page.tsx`** - COMPLETELY REPLACED
   - Server-side page with social media tools
   - Generates referral links and provides marketing materials
   - Fetches distributor data for personalization

### Client Components (New)
3. **`src/components/dashboard/SocialShareCard.tsx`**
   - Individual card for social post templates
   - Copy-to-clipboard functionality
   - Platform icons (Facebook, LinkedIn, Twitter, Instagram)

4. **`src/components/dashboard/ReferralLinkGenerator.tsx`**
   - UTM parameter builder
   - QR code generator (uses `qrcode` npm package)
   - Referral link management

### Tests
5. **`tests/unit/training-page.test.ts`** - Unit tests for training logic
6. **`tests/unit/social-share.test.ts`** - Unit tests for social media tools

---

## Training Page Features

### 1. Hero Section
- Gradient background (slate-700 to slate-900)
- "Welcome to Rep Training"
- Shows user's current tech rank and sales rank
- Rank indicators with colored dots

### 2. Progress Tracker
- Overall completion percentage (0-100%)
- Progress bar visualization
- Certificate badges for completed modules
- X of Y modules completed

### 3. Training Modules (Hardcoded)
Five modules defined in code:
- **Getting Started** (30 min) - All ranks
- **Product Training** (45 min) - All ranks
- **Compensation Plan Deep Dive** (60 min) - All ranks
- **Leadership Training** (50 min) - Gold+ only
- **Advanced Strategies** (75 min) - Platinum+ only

### 4. Rank-Based Filtering
- Modules filter based on user's tech rank
- Locked modules shown with lock icon
- "Unlock More Training" section for unavailable modules
- Rank requirement displayed on locked modules

### 5. Module Cards
Each available module card shows:
- Title and description
- Duration estimate
- Completion status (checkmark icon)
- "Start Training" or "Review" button

---

## Social Media Page Features

### 1. Quick Share Posts
Four pre-made social post templates:
- **Welcome Post** (introduction)
- **Product Introduction** (product awareness)
- **Business Opportunity** (recruiting)
- **Customer Success Story** (testimonial)

Each template includes:
- Category badge
- Full text with distributor's referral link appended
- Platform icons (best platforms for that content)
- Copy to clipboard button

### 2. Referral Link Generator
- **Base Link Display**: Shows `https://apexaffinity.com/join/{slug}`
- **UTM Parameter Builder**: Add source, medium, campaign tracking
- **Generated Link Preview**: Shows custom link with UTM params
- **Copy to Clipboard**: One-click copy for any link

### 3. QR Code Generator
- Generate QR code for referral link
- Download QR as PNG image
- Named file: `{distributor-slug}-referral-qr.png`
- Preview QR code inline

### 4. Marketing Materials
Four downloadable PDFs (placeholders):
- Product Brochure
- Compensation Plan Overview
- Business Opportunity Presentation
- Product Comparison Chart

Each material card shows:
- Document icon
- Title and description
- PDF badge
- Download and Preview buttons

### 5. Best Practices Section
Tips for:
- Posting strategy (frequency, content mix)
- Engagement tactics (response time, questions, hashtags)

---

## Data Wiring

### Training Page Query
```typescript
const { data: userData } = await serviceClient
  .from('distributors')
  .select(`
    id,
    first_name,
    last_name,
    member:members!members_distributor_id_fkey (
      tech_rank,
      sales_rank
    )
  `)
  .eq('auth_user_id', user.id)
  .single();
```

**Filters Modules By:**
```typescript
const RANK_LEVELS = {
  starter: 0, bronze: 1, silver: 2, gold: 3,
  platinum: 4, ruby: 5, diamond: 6, crown: 7, elite: 8
};

const userRankLevel = getRankLevel(techRank);
const isAccessible = !module.rankRequired ||
  getRankLevel(module.rankRequired) <= userRankLevel;
```

### Social Media Page Query
```typescript
const { data: distributor } = await serviceClient
  .from('distributors')
  .select('id, first_name, last_name, slug, city, email')
  .eq('auth_user_id', user.id)
  .single();
```

**Generates Referral Link:**
```typescript
const referralLink = `https://apexaffinity.com/join/${distributor.slug}`;
```

**Personalizes Templates:**
```typescript
const personalizedText = `${template.text}\n\n${referralLink}`;
```

---

## Training Module Structure (Hardcoded)

```typescript
interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  rankRequired: string | null; // null = all ranks
  category: 'fundamental' | 'product' | 'compensation' | 'leadership' | 'advanced';
  completed: boolean; // TODO: Track in database
  videoUrl?: string; // Placeholder for future
}
```

**Example Module:**
```typescript
{
  id: 'leadership-fundamentals',
  title: 'Leadership Training',
  description: 'Build and manage your team effectively...',
  duration: '50 min',
  rankRequired: 'gold', // Locked for Starter, Bronze, Silver
  category: 'leadership',
}
```

---

## Social Media Template Structure (Hardcoded)

```typescript
interface SocialPostTemplate {
  id: string;
  title: string;
  category: string;
  text: string;
  platforms: string[]; // ['facebook', 'linkedin', 'twitter', 'instagram']
}
```

**Example Template:**
```typescript
{
  id: 'product-intro',
  title: 'Product Introduction',
  category: 'product',
  text: "Did you know that identity theft affects millions every year?...",
  platforms: ['facebook', 'linkedin', 'instagram'],
}
```

---

## Rank-Based Filtering Logic

### How It Works
1. **Fetch user's tech rank** from `members` table via join
2. **Convert rank to numeric level** using `RANK_LEVELS` map
3. **Filter modules** where `module.rankRequired` level ≤ user level
4. **Split into two lists:**
   - `accessibleModules` - User can start
   - `lockedModules` - User cannot access yet

### Example
User has rank: **Gold** (level 3)
- ✅ Getting Started (no requirement)
- ✅ Product Training (no requirement)
- ✅ Compensation Deep Dive (no requirement)
- ✅ Leadership Training (requires Gold = level 3)
- ❌ Advanced Strategies (requires Platinum = level 4)

---

## Referral Link Generation

### Base Link
```
https://apexaffinity.com/join/john-smith
```

### With UTM Parameters
```
https://apexaffinity.com/join/john-smith?
  utm_source=facebook&
  utm_medium=social&
  utm_campaign=spring2024
```

### UTM Builder Logic
```typescript
const params: string[] = [];
if (utmSource) params.push(`utm_source=${encodeURIComponent(utmSource)}`);
if (utmMedium) params.push(`utm_medium=${encodeURIComponent(utmMedium)}`);
if (utmCampaign) params.push(`utm_campaign=${encodeURIComponent(utmCampaign)}`);

const link = params.length > 0
  ? `${baseLink}?${params.join('&')}`
  : baseLink;
```

---

## QR Code Generation

Uses `qrcode` npm package (already installed):
```typescript
const url = await QRCode.toDataURL(generatedLink, {
  width: 300,
  margin: 2,
  color: {
    dark: '#1e293b', // slate-900
    light: '#ffffff',
  },
});
```

Downloads as:
- File name: `{distributor-slug}-referral-qr.png`
- Format: PNG
- Size: 300x300px

---

## Design System

### Color Scheme
- **Primary**: Slate (700-900 range)
- **Success**: Green (for completed modules)
- **Background**: White cards on light background
- **Text**: Slate-900 (headings), Slate-600/700 (body)

### Card Pattern
```tsx
<div className="bg-white border border-slate-200 rounded-lg p-6
                hover:border-slate-300 hover:shadow-md transition-all">
  {/* Card content */}
</div>
```

### Button Pattern
```tsx
<button className="px-4 py-2 bg-slate-700 text-white text-sm
                   font-medium rounded-lg hover:bg-slate-800
                   transition-colors">
  Action
</button>
```

---

## Tests

### Training Page Tests (`tests/unit/training-page.test.ts`)
```typescript
✓ should define training modules correctly
✓ should filter modules based on user rank
```

### Social Media Tests (`tests/unit/social-share.test.ts`)
```typescript
✓ should generate referral link correctly
✓ should build UTM parameters correctly
✓ should personalize social post templates
```

**All 5 tests passing ✅**

---

## Future Enhancements (TODOs in Code)

### Training Page
1. **Track Completion in Database**
   - Add `training_progress` table
   - Store `distributor_id`, `module_id`, `completed`, `progress_pct`
   - Update `completed` boolean from database

2. **Add Video Content**
   - Populate `videoUrl` field in modules
   - Embed video player in module detail view

3. **Module Detail Pages**
   - Click module to view full training content
   - Track watch time and completion

### Social Media Page
1. **Link Click Tracking**
   - Store UTM links in database
   - Track clicks via analytics

2. **Upload Real Marketing Materials**
   - Replace placeholder PDF URLs
   - Store PDFs in Supabase Storage or CDN

3. **Custom Graphics Generator**
   - Generate personalized images with rep name/photo
   - Overlay referral QR code on branded graphics

4. **Social Posting History**
   - Track which templates were used
   - Show usage stats (most popular templates)

---

## Database Schema (Current)

### Tables Used
- `distributors` - User profile (auth_user_id, first_name, last_name, slug)
- `members` - Rep data (distributor_id, tech_rank, sales_rank)

### Join Relationship
```sql
distributors.id = members.distributor_id
```

### Foreign Key
```
members.distributor_id → distributors.id
```

---

## No Emojis ✓
Per requirements, all emoji usage removed from:
- Hero sections
- Card headers
- Button text
- Section titles

---

## Build Validation

### TypeScript
- ✅ All new files type-checked
- ✅ No type errors in created components
- ⚠️ Pre-existing errors in other files (matrix/page.tsx)

### Tests
- ✅ 5 new tests created
- ✅ All 5 tests passing
- ✅ Training rank logic validated
- ✅ Social media utilities validated

### Lint Status
- Files follow existing code style
- Professional slate color scheme applied
- Card-based layouts implemented
- Server/client component separation correct

---

## Summary

**Status**: ✅ Complete

**Files Modified**: 2 pages (completely replaced)
**Files Created**: 4 (2 components, 2 test files)

**Key Features**:
- Rank-based training module access
- Social post templates with copy-to-clipboard
- Referral link generator with UTM builder
- QR code generator for print materials
- Marketing materials section (placeholders)
- Professional slate theme, card-based UI

**Tests**: 5/5 passing ✅
**Data Wiring**: Properly connected to distributors & members tables
**Documentation**: Complete with examples and future TODOs
