# Apex Terminology Guide

## User Types (OFFICIAL DEFINITIONS)

### 🔷 Enrollee
**Who:** Anyone participating in the compensation plan
**Access:** Back office dashboard, recruiting tools, commission reports
**Database:** Has `distributor_id` (links to `distributors` table)
**Can:** Recruit others, earn commissions, access comp plan
**Example:** Phil Resch, Grayson Millard, Hannah Townsend

### 💚 Customer
**Who:** Product subscriber only (no comp plan participation)
**Access:** My Account dashboard, product features
**Database:** Has NO `distributor_id` (NULL)
**Can:** Use products, upgrade to enrollee status
**Example:** Someone who just wants PulseFlow for their business

### 🟣 Admin
**Who:** System administrator
**Access:** Full admin panel, all backend controls
**Database:** `role = 'admin'`
**Can:** Manage all users, run reports, system configuration
**Example:** Trent Daniel, system support team

---

## Database Structure

```
members table (EVERYONE)
├── Enrollees (distributor_id NOT NULL) → distributors table
├── Customers (distributor_id NULL, role = 'user')
└── Admins (role = 'admin')
```

---

## Terminology Mapping (OLD → NEW)

| ❌ OLD TERM (Confusing) | ✅ NEW TERM (Clear) | Context |
|------------------------|-------------------|---------|
| Distributor | Enrollee | Anyone in comp plan |
| Member | Enrollee OR Customer | Depends on context |
| Total Members | Total Enrollees | In comp plan reports |
| Total Members | Total Customers | In product reports |
| Total Members | Total Users | System-wide count |
| Downline | Team / Organization | People you enrolled |
| Upline | Sponsor Line | People above you |
| Rep | Enrollee | Short for representative |

---

## UI Label Standards

### Admin Dashboard Stats:
- ✅ "Total Enrollees" - People with back office
- ✅ "Total Customers" - Product-only subscribers
- ✅ "Total Users" - Everyone (enrollees + customers + admins)
- ✅ "Active Enrollees" - Enrollees with recent activity
- ✅ "New Enrollees This Month" - Recent signups to comp plan

### Genealogy/Matrix Views:
- ✅ "Organization Size: X enrollees"
- ✅ "Direct Enrollees: X"
- ✅ "Team Size: X enrollees"

### Email Reports:
- ✅ "You have X enrollees in your organization"
- ✅ "Your team of X enrollees generated..."
- ✅ "New enrollee joined: [Name]"

### Team Page:
- ✅ "My Enrollees" (not "My Team Members")
- ✅ "Direct Enrollees: X"
- ✅ "Total Organization: X enrollees"

---

## Code Variable Naming

```typescript
// ✅ GOOD (Clear)
const totalEnrollees = distributors.length;
const customerCount = nonEnrollees.length;
const myEnrollees = await getDirectEnrollees(userId);

// ❌ BAD (Confusing)
const totalMembers = distributors.length;  // Which members?
const memberCount = nonEnrollees.length;   // Members or customers?
const myMembers = await getDirectEnrollees(userId); // Ambiguous
```

---

## Helper Functions

Use these helper functions for clarity:

```typescript
import { isEnrollee, isCustomer, isAdmin, getUserTypeLabel } from '@/lib/utils/user-helpers';

// Check user type
if (isEnrollee(user)) {
  // Show back office
}

if (isCustomer(user)) {
  // Show product dashboard only
}

// Get display label
const label = getUserTypeLabel(user); // "Enrollee", "Customer", or "Admin"
```

---

## Common Questions

**Q: Is every enrollee a customer?**
A: Yes! All enrollees have product access. Not all customers are enrollees.

**Q: Can a customer become an enrollee?**
A: Yes! When a customer signs up for the comp plan, we create a `distributor` record and link it.

**Q: What's the difference between enrollee and distributor?**
A: Same thing! We use "enrollee" in UI for clarity, but database uses `distributors` table.

**Q: Why not rename the database tables?**
A: Too risky. Instead, we use clear UI labels and helper functions to make the distinction obvious.

---

## Migration Path

**Phase 1: UI Labels** ✅ (Current)
- Update all visible labels to use "Enrollee" / "Customer" / "Admin"
- Keep database unchanged

**Phase 2: Variable Names** (Ongoing)
- Rename variables in new code to use clear terms
- Use helper functions for type checking

**Phase 3: Documentation** (Ongoing)
- Update all docs to use official terminology
- Train support team on correct terms

---

Last Updated: 2026-03-30
