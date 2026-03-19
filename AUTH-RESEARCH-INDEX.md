# Authentication & Email System Research - Document Index

Research completed: March 18, 2026

## Documents Created

### 1. AUTH-AND-EMAIL-RESEARCH.md (Primary Document)
Comprehensive research report covering:
- Supabase Auth configuration and architecture
- How auth.users connects to distributors table via auth_user_id
- Dual email storage and synchronization requirements
- Email verification flows (password reset)
- Password management (user and admin initiated)
- Email change restrictions and security
- Auth.users relationship and identity management
- Supporting database tables
- Orphaned user cleanup mechanism
- Security concerns and best practices
- Implementation patterns
- Summary of email change requirements
- Complete file reference guide

**Start here for:** In-depth understanding of the entire auth system

---

### 2. AUTH-QUICK-REFERENCE.md (Quick Reference)
Quick reference guide covering:
- Core architecture diagram
- Email change authorization flow diagram
- Database tables overview
- API endpoints summary
- Key validation rules
- Service clients explanation
- 10 security features
- FAQ (common questions)
- Files quick index

**Start here for:** Quick lookup, quick answers, endpoint reference

---

## Key Findings Summary

### 1. Is Supabase Auth being used?
**YES** - Exclusively. Email/password auth only (no OAuth).

### 2. How auth.users connected to distributors?
**Via auth_user_id column** - UUID that links distributors.auth_user_id to auth.users.id

### 3. Email in two places?
**YES** - auth.users.email AND distributors.email (both must stay in sync)

### 4. Email verification flows?
**YES** - Password reset has full flow with tokens. Email changes are admin-only with immediate confirmation.

### 5. Password reset process?
1. User requests reset with email
2. System generates 32-byte random token
3. Stores in password_reset_tokens table (1 hour expiry)
4. Sends email with reset link
5. User enters new password with token
6. Token marked as used (one-time)
7. Rate limited: 5 per IP per hour

### 6. Email change restrictions?
**Admin-Only:**
- Must be admin (via getAdminUser())
- Must validate email format
- Must check email not in use
- Changes immediate, no verification
- Logged in distributor_activity_log
- Notification sent to new email

**User Self-Changes:**
- NOT IMPLEMENTED
- Profile update endpoint specifically excludes email

### 7. auth_user_id and email relationship?
- **Email** = login identifier in auth.users
- **auth_user_id** = UUID link to auth.users.id
- Users login with email
- System uses auth_user_id to find distributor record
- Distributor stores denormalized email copy

---

## Critical Files

### Authentication Core
- `/src/lib/auth/server.ts` - getCurrentUser() implementation
- `/src/lib/auth/admin.ts` - Admin context and authorization
- `/src/lib/supabase/server.ts` - Standard Supabase client
- `/src/lib/supabase/service.ts` - Service role client

### Email/Password Management
- `/src/app/api/auth/signin/route.ts` - Login endpoint
- `/src/app/api/auth/forgot-password/route.ts` - Password reset request
- `/src/app/api/auth/reset-password/route.ts` - Password reset completion
- `/src/app/api/admin/distributors/[id]/change-email/route.ts` - Admin email change **KEY FILE**
- `/src/app/api/profile/password/route.ts` - User password change

### Profile Management
- `/src/app/api/profile/update/route.ts` - Profile updates (note: email NOT included)

### Types & Definitions
- `/src/lib/types/index.ts` - Distributor interface with all fields

---

## Architecture Overview

```
LOGIN FLOW:
-----------
User submits email + password
        ↓
POST /api/auth/signin
        ↓
supabase.auth.signInWithPassword()
        ↓
auth.users table validated
        ↓
Session established
        ↓
App gets auth.users.id
        ↓
Query distributors WHERE auth_user_id = auth.users.id
        ↓
Distributor record loaded
        ↓
User can now access app

EMAIL CHANGE FLOW:
------------------
Admin requests change
        ↓
POST /api/admin/distributors/[id]/change-email
        ↓
Verify admin access (getAdminUser)
        ↓
Validate new email (format + uniqueness)
        ↓
serviceClient.auth.admin.updateUserById() → auth.users
        ↓
serviceClient.from('distributors').update() → distributors
        ↓
If distributors fails: rollback auth.users change
        ↓
Log in distributor_activity_log
        ↓
Send notification email
        ↓
Return success/error response
```

---

## Database Schema (Key Fields)

### auth.users (Supabase)
- id: UUID (primary key)
- email: string (login credential)
- email_confirmed_at: timestamp
- created_at, updated_at: timestamp

### distributors
- id: UUID (primary key)
- auth_user_id: UUID (links to auth.users.id)
- email: string (denormalized copy)
- first_name, last_name: string
- phone, address_line1, address_line2, city, state, zip: string
- (Plus: banking, tax, profile fields)

### password_reset_tokens
- token: string (primary key, 32-byte hex)
- user_id: UUID (links to auth.users.id)
- expires_at: timestamp (1 hour)
- used: boolean

### password_reset_rate_limits
- ip_address: string
- email: string
- created_at: timestamp
(Prevents 5+ resets per IP per hour)

### distributor_activity_log
- distributor_id: UUID
- action: string ('email_changed', etc.)
- details: JSON

---

## Security Features Implemented

✅ Email uniqueness enforcement
✅ UUID format validation for auth_user_id
✅ Admin-only email changes
✅ Service client for privileged operations
✅ Transactional updates with rollback
✅ Rate limiting on password resets
✅ Token expiration (1 hour)
✅ One-time token use
✅ Audit logging
✅ Notification emails

---

## Security Gaps

❌ No user self-service email changes
❌ Email stored in two places (sync risk)
❌ Email uniqueness check via listUsers() (not indexed)
❌ No email verification tokens for user changes

---

## How to Use These Documents

**For understanding the system:** Start with AUTH-AND-EMAIL-RESEARCH.md
**For quick reference:** Use AUTH-QUICK-REFERENCE.md
**For implementation:** Reference the critical files list above

---

## Next Steps / Recommendations

1. **Implement User Email Changes**
   - Add email field to profile update endpoint
   - Implement verification token flow (similar to password reset)
   - Update both auth.users and distributors atomically

2. **Optimize Email Uniqueness Check**
   - Index or cache auth user emails
   - Reduce listUsers() call overhead

3. **Add Email Verification**
   - For user-initiated changes, require verification
   - Send confirmation email to new address
   - Use one-time token pattern

4. **Monitor Sync Issues**
   - Add audit logging for email mismatches
   - Create periodic validation job
   - Alert on divergence

5. **Prevent Orphaned Users**
   - Run cleanup job periodically
   - Improve signup transaction handling
   - Test distributor creation reliability

