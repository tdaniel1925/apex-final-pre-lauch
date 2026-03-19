# Authentication & Email System Research Report - Apex Affinity Group

## Quick Summary

- **Auth System:** Supabase Auth (email/password only)
- **Distributor Link:** `auth_user_id` (UUID linking to auth.users.id)
- **Email Storage:** Dual storage (auth.users.email + distributors.email)
- **Email Changes:** Admin-only, requires sync to both tables
- **Password Reset:** Secure token (32 bytes), 1-hour expiry, rate-limited
- **User Email Changes:** NOT IMPLEMENTED

---

## 1. Is Supabase Auth Being Used?

YES. Apex uses Supabase Auth exclusively.

**Clients:**
- Server Client: `/src/lib/supabase/server.ts` (respects RLS)
- Service Client: `/src/lib/supabase/service.ts` (bypasses RLS, admin only)

**Auth Method:** Email/password only (no OAuth)

---

## 2. How auth.users Connected to Distributors Table?

Via `auth_user_id` column in distributors table.

**Link Pattern:**
```typescript
// In distributors table:
- auth_user_id: UUID (matches auth.users.id)
- email: string (denormalized copy)

// To get distributor from auth user:
const { data: { user } } = await supabase.auth.getUser();
const { data: distributor } = await supabase
  .from('distributors')
  .select('*')
  .eq('auth_user_id', user.id)
  .single();
```

---

## 3. What if Email Changes in Distributors vs auth.users?

**Problem:** Email exists in TWO places:
1. `auth.users.email` (authentication credential)
2. `distributors.email` (application data)

**Current Behavior:** MUST BE KEPT IN SYNC

If they diverge:
- User can't login if auth.users.email doesn't match their remembered email
- App queries using distributors.email will return wrong results

**How Changes Work:**
1. Update auth.users via `serviceClient.auth.admin.updateUserById()`
2. Update distributors table in same operation
3. If distributors update fails, rollback auth change
4. Log all changes in distributor_activity_log

---

## 4. Are There Email Verification Flows?

### Password Reset (YES)

**File:** `/src/app/api/auth/forgot-password/route.ts` and `/src/app/api/auth/reset-password/route.ts`

Process:
1. User requests reset with email
2. Generate secure token (crypto.randomBytes(32).toString('hex'))
3. Store in password_reset_tokens table (expires in 1 hour)
4. Send email with reset link
5. User clicks link and enters new password
6. Token verified and password updated
7. Token marked as used (one-time)
8. Rate limited: max 5 per IP per hour

**Security Features:**
- Email not confirmed if user doesn't exist (prevents user enumeration)
- Tokens expire after 1 hour
- Tokens can only be used once
- Rate limiting by IP address

### Email Confirmation (YES for Admin Changes)

When admin changes email:
```typescript
await serviceClient.auth.admin.updateUserById(
  distributor.auth_user_id,
  {
    email: newEmail,
    email_confirm: true  // Email immediately confirmed
  }
);
```

For user self-changes: NOT IMPLEMENTED

---

## 5. How Does Password Reset Work?

**Endpoint:** POST/GET `/api/auth/forgot-password` and `/api/auth/reset-password`

### Forgot Password (Request Phase)
1. User provides email
2. System checks if distributor exists with that email
3. If exists: Create reset token (32 random bytes), store in DB, send email
4. If doesn't exist: Still return success (security - don't leak user existence)
5. Email sent via Resend (branded email template)

### Reset Password (Completion Phase)
1. User provides reset token and new password
2. Verify token exists, is not expired (1 hour), and not used
3. Update password using: `serviceClient.auth.admin.updateUserById()`
4. Mark token as used
5. Log in user_security_settings

### Rate Limiting
- Table: password_reset_rate_limits
- Limit: 5 requests per IP per hour
- Auto-cleanup of entries older than 24 hours

---

## 6. Are There Restrictions on Email Changes?

### Current Restrictions:

**Admin Changes (Only Option):**
- Admin authentication required
- Email format validation (regex)
- Email must not be in use by another auth user
- Changes are immediate (no verification)
- Logged in distributor_activity_log
- Notification sent to new email

**User Self-Changes:**
- NOT IMPLEMENTED
- Profile update endpoint specifically excludes email field
- Users must contact admin to change email

**File:** `/src/app/api/admin/distributors/[id]/change-email/route.ts`

---

## 7. What's the Relationship Between auth_user_id and Email?

**Email is the login identifier in auth.users:**
```typescript
// Login uses email
const { data, error } = await supabase.auth.signInWithPassword({
  email,     // Used for login
  password,
});
```

**auth_user_id is the link to distributor:**
```typescript
// But internally, queries use auth_user_id to link tables
const { data: distributor } = await supabase
  .from('distributors')
  .select('*')
  .eq('auth_user_id', user.id)  // UUID link
  .single();
```

**Relationship:**
- Users login with email (stored in auth.users)
- System uses auth_user_id to find their distributor record
- Distributor table stores denormalized copy of email for queries

---

## Key Files

### Authentication
- `/src/lib/auth/server.ts` - Get current user via auth_user_id link
- `/src/lib/auth/admin.ts` - Admin context & authorization
- `/src/app/actions/auth.ts` - Auth server actions

### Email/Password Management
- `/src/app/api/auth/signin/route.ts` - Login
- `/src/app/api/auth/forgot-password/route.ts` - Reset request
- `/src/app/api/auth/reset-password/route.ts` - Reset completion
- `/src/app/api/admin/distributors/[id]/change-email/route.ts` - Admin email change (KEY FILE)
- `/src/app/api/profile/password/route.ts` - User password change

### Profile Updates
- `/src/app/api/profile/update/route.ts` - Updates all fields EXCEPT email

### Cleanup
- `/src/app/api/admin/cleanup-orphaned-users/route.ts` - Remove auth users without distributor records

### Types
- `/src/lib/types/index.ts` - Distributor interface with auth_user_id field

---

## Security Summary

**Strengths:**
✅ Proper auth_user_id validation (UUID format check)
✅ Email uniqueness enforced before change
✅ Transactional email change with rollback
✅ Audit logging in distributor_activity_log
✅ Rate limiting on password resets
✅ Service client only for admin operations
✅ Admin authentication required for email changes

**Gaps:**
❌ No user self-service email changes
❌ Email stored in two places (must sync)
❌ Email verification tokens not used
❌ Password change doesn't verify current password fully

---

## To Change Distributor Email

**Current Process (Admin Only):**
1. Call POST /api/admin/distributors/[id]/change-email
2. Provide new email
3. System validates format and uniqueness
4. Updates both auth.users and distributors
5. Logs change and sends notification
6. Returns success or error

**Data Flow:**
```
Admin Request
    ↓
Validate (format, uniqueness, auth_user_id)
    ↓
Update auth.users email via serviceClient.auth.admin.updateUserById()
    ↓
Update distributors.email
    ↓
Log in distributor_activity_log
    ↓
Send notification email
    ↓
Return success
```

**Potential Issues:**
- If auth.users update succeeds but distributors update fails, rollback happens
- Email list checked via listUsers() call (not indexed)
- No verification needed (admin is trusted)

