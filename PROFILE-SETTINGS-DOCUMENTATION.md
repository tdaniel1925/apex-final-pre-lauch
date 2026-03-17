# Profile & Settings Pages Documentation

## Overview

Complete rebuild of the Profile and Settings pages with professional design, dual-ladder compensation tracking, and proper data wiring.

## Files Modified/Created

### Pages
- **src/app/dashboard/profile/page.tsx** - Complete rebuild with tabbed layout
- **src/app/dashboard/settings/page.tsx** - Complete rebuild with account preferences

### Tests
- **tests/unit/profile-settings.test.ts** - Comprehensive test suite (35 tests, all passing)

---

## Profile Page (`/dashboard/profile`)

### Features

#### 1. **Profile Header Card**
- Large avatar (24x24) with initials fallback
- Full name and Rep Number display
- Dual-ladder rank badges (Tech + Insurance)
- Member since date

#### 2. **Tabbed Layout**

##### Personal Info Tab
Displays:
- Full Name
- Email
- Phone
- Date of Birth
- Full Address (line 1, line 2, city, state, zip)

##### Compensation Stats Tab
**Tech Ladder Stats:**
- Current Tech Rank (with badge styling)
- Highest Tech Rank Achieved
- Rank achievement date
- Personal Credits This Month
- Team Credits This Month

**Insurance Ladder Stats** (if licensed):
- Current Insurance Rank (with badge styling)
- Highest Insurance Rank Achieved
- Rank achievement date
- Personal Credits This Month
- Team Credits This Month

**Overall Performance:**
- Total Lifetime Earnings (calculated from earnings_ledger)
- Override Qualified Status (Yes/No with requirement info)
- Total Credits This Month

##### Banking Info Tab
Displays (with masking for security):
- Bank Name
- Routing Number (****XXXX - last 4 shown)
- Account Number (****XXXX - last 4 shown)
- Account Type (checking/savings)
- Verification Status (Verified/Pending badge)

##### Tax Info Tab
Displays (view-only, privacy-protected):
- Tax ID Type (SSN)
- SSN Last 4 Digits (XXX-XX-XXXX format)
- Security notice about encryption

---

## Settings Page (`/dashboard/settings`)

### Features

#### 1. **Tabbed Layout**

##### Account Tab
**Account Information:**
- Name (read-only)
- Email Address (read-only)
- Account Created Date

**Email Preferences:**
- Commission Notifications (toggle - disabled for now)
- Team Activity Updates (toggle - disabled for now)
- New Referral Alerts (toggle - disabled for now)
- Marketing Communications (toggle - disabled for now)

**Notification Settings:**
- Email Notifications (toggle - disabled for now)
- SMS Notifications (toggle - disabled for now)

**Language & Region:**
- Language Selector (disabled - shows English US)
- Time Zone Selector (disabled - shows America/Chicago)

##### Privacy Tab
**Profile Visibility:**
- Show in Team Directory (toggle - disabled for now)
- Show Activity Status (toggle - disabled for now)

**Data & Privacy:**
- Download Your Data (button - disabled for now)
- Delete Account Data (button - disabled for now)

##### Security Tab
**Password:**
- Change Password (button - disabled for now)

**Two-Factor Authentication:**
- Status Display (Disabled)
- Enable 2FA (button - disabled for now)

**Active Sessions:**
- Current Session Display
- Sign Out All Other Sessions (button - disabled for now)

**Account Security:**
- Login Alerts (toggle - disabled for now)

---

## Data Wiring

### Profile Page Data Sources

#### Main Distributor Query
```typescript
const { data: distributor } = await serviceClient
  .from('distributors')
  .select(`
    *,
    member:members!members_distributor_id_fkey (
      member_id,
      tech_rank,
      highest_tech_rank,
      insurance_rank,
      highest_insurance_rank,
      personal_credits_monthly,
      team_credits_monthly,
      tech_personal_credits_monthly,
      tech_team_credits_monthly,
      insurance_personal_credits_monthly,
      insurance_team_credits_monthly,
      override_qualified,
      tech_rank_achieved_date,
      insurance_rank_achieved_date
    ),
    tax_info:distributor_tax_info!distributor_tax_info_distributor_id_fkey (
      ssn_last_4
    )
  `)
  .eq('auth_user_id', user.id)
  .single();
```

#### Lifetime Earnings Calculation
```typescript
const { data: allEarnings } = await serviceClient
  .from('earnings_ledger')
  .select('amount_usd')
  .eq('member_id', member.member_id)
  .eq('status', 'approved');

const lifetimeEarnings = allEarnings?.reduce(
  (sum, e) => sum + (e.amount_usd || 0),
  0
) || 0;
```

### Settings Page Data Sources

#### Distributor Info Query
```typescript
const { data: distributor } = await serviceClient
  .from('distributors')
  .select('slug, email, first_name, last_name')
  .eq('auth_user_id', user.id)
  .single();
```

---

## Design System

### Color Scheme
- **Background**: Slate 50 (`bg-slate-50`)
- **Cards**: White with slate borders (`bg-white border-slate-200`)
- **Text Primary**: Slate 900 (`text-slate-900`)
- **Text Secondary**: Slate 600 (`text-slate-600`)
- **Text Muted**: Slate 500 (`text-slate-500`)

### Rank Badge Colors

#### Tech Ranks
- **Starter**: `bg-slate-100 text-slate-800`
- **Bronze**: `bg-amber-700 text-white`
- **Silver**: `bg-slate-400 text-white`
- **Gold**: `bg-yellow-500 text-slate-900`
- **Platinum**: `bg-slate-700 text-white`
- **Ruby**: `bg-red-600 text-white`
- **Diamond**: `bg-blue-500 text-white`
- **Crown**: `bg-purple-600 text-white`
- **Elite**: `bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-900`

#### Insurance Ranks
- **Inactive**: `bg-slate-200 text-slate-600`
- **Associate**: `bg-blue-100 text-blue-800`
- **Manager**: `bg-blue-500 text-white`
- **Director**: `bg-indigo-600 text-white`
- **Senior Director**: `bg-purple-600 text-white`
- **Executive Director**: `bg-violet-700 text-white`
- **MGA**: `bg-gradient-to-r from-indigo-600 to-purple-600 text-white`

---

## Privacy & Security

### Data Masking

#### Banking Information
- **Routing Numbers**: Shows `****6789` (last 4 digits only)
- **Account Numbers**: Shows `****4321` (last 4 digits only)
- **Full numbers**: NEVER exposed in UI

#### Tax Information
- **SSN Display**: `XXX-XX-1234` (last 4 digits only)
- **Full SSN**: Encrypted in database, only accessible to authorized admins
- **Access Logging**: All SSN access is logged in `ssn_access_log` table

### Read-Only Fields
All profile data is currently **view-only**. Users cannot edit their information directly from these pages. Future implementations will add:
- Edit Profile functionality
- Banking info updates
- Preference toggles

---

## What's Editable vs Read-Only

### Currently Read-Only (View-Only)
- ✅ All Personal Information
- ✅ All Compensation Stats
- ✅ Banking Information
- ✅ Tax Information
- ✅ All Settings Preferences

### Future Editable Fields
The following will be made editable in future updates:
- Personal Info (name, phone, address)
- Email Preferences (notification toggles)
- Privacy Settings (visibility toggles)
- Security Settings (password, 2FA)

---

## Testing

### Test Coverage
- **35 tests** covering all major functionality
- **All tests passing** (100% pass rate)
- Test file: `tests/unit/profile-settings.test.ts`

### Test Categories
1. Profile Page Rendering
2. Settings Page Rendering
3. Data Fetching & Wiring
4. Rank Display & Formatting
5. Data Privacy & Masking
6. Currency Formatting
7. Date Formatting

---

## Technical Implementation Notes

### Component Structure
- **Server Components**: Both pages are Next.js Server Components
- **Data Fetching**: Uses Supabase service client for privileged queries
- **Authentication**: Checks auth and redirects unauthenticated users to `/login`

### Helper Functions

#### Currency Formatting
```typescript
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
```

#### Date Formatting
```typescript
function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
```

### UI Components Used
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` (from `@/components/ui/card`)
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` (from `@/components/ui/tabs`)
- `Avatar`, `AvatarImage`, `AvatarFallback` (from `@/components/ui/avatar`)
- `Badge` (from `@/components/ui/badge`)

---

## Future Enhancements

### Profile Page
1. **Edit Profile Button** → Modal/drawer for editing personal info
2. **Avatar Upload** → Allow users to upload profile photos
3. **Download Earnings Report** → Export lifetime earnings as PDF/CSV
4. **Rank History Timeline** → Visual timeline of rank progressions

### Settings Page
1. **Functional Toggles** → Wire up all preference toggles
2. **Password Change** → Implement password update flow
3. **2FA Setup** → Add two-factor authentication setup wizard
4. **Session Management** → Show all active sessions with logout capability
5. **Data Export** → Allow users to download their data (GDPR compliance)

---

## Database Schema Dependencies

### Tables Used
- `distributors` - Primary user profile data
- `members` - Dual-ladder rank and credit tracking
- `distributor_tax_info` - Encrypted tax information
- `earnings_ledger` - Commission earnings history

### Foreign Key Relationships
```
distributors.id <-> members.distributor_id (1:1)
distributors.id <-> distributor_tax_info.distributor_id (1:1)
members.member_id <-> earnings_ledger.member_id (1:many)
```

---

## Maintenance Notes

### When Adding New Ranks
1. Update `TECH_RANK_NAMES` or `INSURANCE_RANK_NAMES` constants
2. Update `getTechRankColor()` or `getInsuranceRankColor()` functions
3. Ensure database constraints include new rank values
4. Update tests to include new ranks

### When Adding New Data Fields
1. Update database schema/migrations
2. Update Supabase query `.select()` clause
3. Update UI to display new fields
4. Update tests to cover new fields
5. Update this documentation

---

## Support & Contact

For questions or issues with Profile/Settings pages:
- Check this documentation first
- Review test file for expected behavior
- Contact development team for data schema questions
