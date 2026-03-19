# Quick Reference: Auth & Email System

## The Core Structure

```
User Login Request
        ↓
  Email/Password
        ↓
  auth.users (Supabase Auth)
        ↓
  Find distributor with matching auth_user_id
        ↓
  Distributor Record (with denormalized email)
        ↓
  App Uses Distributor Data
```

---

## Email Change Authorization Flow

```
Only Admins Can Change Email
        ↓
Must verify auth_user_id exists and is valid UUID
        ↓
Must verify new email not in use
        ↓
Update auth.users.email
        ↓
Update distributors.email
        ↓
If distributors fails, rollback auth.users
        ↓
Log in activity_log + Send notification email
```

---

## Database Tables

### auth.users (Supabase)
- id (UUID) - Primary key
- email (string) - Login credential
- email_confirmed_at (timestamp)
- created_at, updated_at

### distributors
- id (UUID)
- auth_user_id (UUID) - LINKS to auth.users.id
- email (string) - Denormalized copy
- first_name, last_name, etc.

### password_reset_tokens
- token (string) - Reset link token
- user_id (UUID) - Links to auth.users.id
- expires_at (timestamp) - 1 hour
- used (boolean)

### password_reset_rate_limits
- ip_address (string)
- email (string)
- created_at (timestamp)
(Prevents more than 5 resets per IP per hour)

### distributor_activity_log
- distributor_id (UUID)
- action ('email_changed', etc.)
- details (JSON)

---

## API Endpoints

### Login
`POST /api/auth/signin`
- Input: email, password
- Uses: supabase.auth.signInWithPassword()

### Forgot Password (Request)
`POST /api/auth/forgot-password`
- Input: email
- Creates: password_reset_tokens entry
- Sends: Email with reset link

### Reset Password (Completion)
`POST /api/auth/reset-password` (with token)
`GET /api/auth/reset-password?token=...` (verify token)
- Updates: auth.users password

### Change Email (Admin Only)
`POST /api/admin/distributors/[id]/change-email`
- Requires: Admin authentication
- Updates: Both auth.users and distributors
- Logs: Activity + sends notification

### Update Profile
`POST /api/profile/update`
- Updates: All distributors fields EXCEPT email
- Note: Email field not included in this endpoint

### Change Password
`PUT /api/profile/password`
- Requires: Current password verification
- Updates: auth.users password

---

## Key Validation Rules

### Email
- Must be in valid format (regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/)
- Must not be in use by another auth user
- Case-insensitive comparison for uniqueness

### auth_user_id
- Must be valid UUID format
- Must exist in auth.users
- Must be non-null

### Password
- Minimum 8 characters (for reset)
- No other validation rules visible

### Reset Token
- 32 random bytes (hex encoded)
- Expires after 1 hour
- Can only be used once

---

## Service Clients

### Server Client (Default)
```typescript
const supabase = await createClient();
// Uses NEXT_PUBLIC_SUPABASE_ANON_KEY
// Respects RLS policies
// Used in server components, API routes with user auth
```

### Service Client (Admin Only)
```typescript
const supabase = createServiceClient();
// Uses SUPABASE_SERVICE_ROLE_KEY
// Bypasses RLS
// Used for: email changes, password resets, admin operations
```

---

## Security Features

1. **Email Uniqueness** - Checked before any update
2. **Service Client Only** - Admin ops use privileged client
3. **Admin Authentication** - Email changes require admin role
4. **Audit Logging** - All email changes logged
5. **Transactional Updates** - Rollback if any step fails
6. **Rate Limiting** - Max 5 password resets per IP per hour
7. **Token Expiration** - Reset tokens expire after 1 hour
8. **One-Time Tokens** - Reset tokens can only be used once
9. **UUID Validation** - auth_user_id must be valid UUID format
10. **Notification** - User notified of email changes

---

## Common Questions

### Q: Can users change their own email?
A: No, not currently. Only admins can change email via admin endpoint.

### Q: What happens if email is different in auth.users vs distributors?
A: This would be a bug. Email must be kept in sync. If update fails halfway, there's rollback.

### Q: Does email need verification when admin changes it?
A: No. Admin changes set email_confirm: true immediately.

### Q: What if distributor doesn't have auth_user_id?
A: Email change returns error: "not linked to an authentication account"

### Q: How long does password reset token last?
A: 1 hour. After that, user must request a new reset.

### Q: Can same email be used by multiple accounts?
A: No. Email uniqueness is enforced.

### Q: What authenticates email changes?
A: Admin role + service client (which bypasses RLS).

### Q: Are there orphaned auth users?
A: Yes, possible if signup creates auth user but fails to create distributor.
   Cleanup endpoint available at /api/admin/cleanup-orphaned-users

---

## Files Quick Index

**Core Auth:**
- `/src/lib/auth/server.ts` - getCurrentUser() function
- `/src/lib/auth/admin.ts` - Admin context & authorization
- `/src/lib/supabase/server.ts` - Standard Supabase client
- `/src/lib/supabase/service.ts` - Service role client

**Email/Password:**
- `/src/app/api/auth/signin/route.ts` - Login
- `/src/app/api/auth/forgot-password/route.ts` - Reset request
- `/src/app/api/auth/reset-password/route.ts` - Reset completion
- `/src/app/api/admin/distributors/[id]/change-email/route.ts` - Email change ⭐ KEY FILE

**Profile:**
- `/src/app/api/profile/update/route.ts` - Profile update (no email)
- `/src/app/api/profile/password/route.ts` - Password change

**Types:**
- `/src/lib/types/index.ts` - Distributor interface

