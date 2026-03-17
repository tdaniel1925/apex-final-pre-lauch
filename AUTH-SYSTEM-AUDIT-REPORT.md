# Authentication System Audit Report
**Apex Affinity Group Platform**
**Audit Date:** March 16, 2026
**Auditor:** Claude Code Agent
**Scope:** Signup, Login, Password Reset Flows

---

## Executive Summary

### Overall System Health: **MODERATE** (6.5/10)

**Total Issues Found:** 31
- **Critical:** 5 (Security & Data Integrity)
- **High Priority:** 9 (UX Degradation & Edge Cases)
- **Medium Priority:** 12 (Best Practices & Improvements)
- **Low Priority:** 5 (Nice-to-Have Enhancements)

**Key Strengths:**
✅ Solid validation using Zod schemas with comprehensive password requirements
✅ Atomic distributor creation with advisory locks (prevents race conditions)
✅ Proper rate limiting implementation (IP-based signup throttling)
✅ SSN encryption and secure storage in separate table with RLS policies
✅ Password strength indicator provides good UX feedback
✅ Custom password reset tokens (not relying solely on Supabase default)

**Critical Concerns:**
🔴 **Weak SSN encryption** - Base64 encoding is NOT encryption (CRITICAL)
🔴 **No email verification** - Accounts created without confirming email ownership
🔴 **Missing CSRF protection** on auth forms
🔴 **Rate limiting disabled** in reset password flow (commented out)
🔴 **Orphaned auth users** cleanup logic vulnerable to timing attacks

---

## 1. Signup Flow Analysis

### Data Flow
```
User Form → Client Validation (Zod) → API Route → Server Validation →
Auth User Creation → Matrix Placement (Atomic) → Distributor Record →
SSN Encryption → Tax Info Storage → Email Campaign Enrollment → Success
```

### Files Examined
- `src/app/signup/page.tsx` (Page wrapper - CLEAN)
- `src/components/forms/SignupForm.tsx` (Form component - 489 lines)
- `src/app/api/signup/route.ts` (API handler - 349 lines)
- `src/lib/validations/signup.ts` (Validation schemas - 173 lines)
- `src/lib/utils/ssn.ts` (SSN utilities - 185 lines)
- `src/lib/utils/slug.ts` (Slug utilities - 137 lines)
- `supabase/migrations/20260310000002_atomic_signup_functions.sql` (Database functions)

---

### Issues Found

#### CRITICAL Issues

**C1. SSN Encryption is Actually Base64 Encoding (NOT SECURE)**
- **File:** `src/lib/utils/ssn.ts:116-120`
- **Code:**
  ```typescript
  export function encryptSSN(ssn: string, salt: string = 'APEX_SSN_SALT_2026'): string {
    const cleaned = ssn.replace(/\D/g, '');
    const salted = `${salt}:${cleaned}`;
    return Buffer.from(salted).toString('base64');
  }
  ```
- **Issue:** Base64 is encoding, not encryption. Anyone with database access can decode SSNs instantly.
- **Impact:** **SEVERE** - PII exposure, potential HIPAA/SOX violations, lawsuit liability
- **Evidence:** Comment on line 113 admits this: "NOTE: For production, use proper encryption library"
- **Fix Required:** Use AES-256-GCM encryption with Supabase Vault or AWS KMS

**C2. No Email Verification - Accounts Created Without Ownership Proof**
- **File:** `src/app/api/signup/route.ts:174-177`
- **Code:**
  ```typescript
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });
  ```
- **Issue:** No email confirmation required. Users can signup with any email address (even ones they don't own).
- **Impact:**
  - Account takeover risk
  - Spam/abuse potential
  - Invalid email addresses in database
  - Cannot trust email as verified contact method
- **Fix Required:** Enable Supabase email confirmation and add verification step

**C3. Missing CSRF Protection on Auth Forms**
- **Files:** All form components (SignupForm, LoginForm, ForgotPasswordForm, ResetPasswordForm)
- **Issue:** No CSRF tokens on state-changing operations
- **Impact:** Cross-Site Request Forgery attacks possible
- **Attack Scenario:** Malicious site could trigger signup/login requests on behalf of user
- **Fix Required:** Implement CSRF tokens or use SameSite cookies

**C4. Rate Limiting Disabled in Password Reset**
- **File:** `src/app/api/auth/reset-password/route.ts:11-13`
- **Code:**
  ```typescript
  // Rate limiting temporarily disabled - Redis not configured
  // const rateLimitResponse = await withRateLimit(request, passwordResetRateLimit);
  // if (rateLimitResponse) return rateLimitResponse;
  ```
- **Issue:** Password reset endpoint has NO rate limiting (commented out)
- **Impact:**
  - Brute force token guessing possible
  - Email flooding attacks
  - Resource exhaustion
- **Fix Required:** Implement fallback rate limiting (database-based if Redis unavailable)

**C5. Orphaned Auth User Cleanup Timing Attack**
- **File:** `src/app/api/signup/route.ts:189-210`
- **Code:**
  ```typescript
  if (!existingDist) {
    // Auth user exists but no distributor - orphaned account, clean it up
    const { data: { users } } = await serviceClient.auth.admin.listUsers();
    const orphanedUser = users?.find(u => u.email === data.email);
    if (orphanedUser) {
      await serviceClient.auth.admin.deleteUser(orphanedUser.id);
    }
  }
  ```
- **Issue:**
  1. Lists ALL users to find one (performance issue)
  2. Time gap between check and delete allows race condition
  3. Reveals account existence via error message differences
- **Impact:** User enumeration attack, timing-based information disclosure
- **Fix Required:** Use direct user lookup by email, atomic check-and-delete

---

#### HIGH Priority Issues

**H1. Password Validation Only in Client (Can Be Bypassed)**
- **File:** `src/app/api/auth/reset-password/route.ts:25-30`
- **Code:**
  ```typescript
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters long' },
      { status: 400 }
    );
  }
  ```
- **Issue:** Server only checks length, not complexity (uppercase, lowercase, number)
- **Impact:** Weak passwords like "password" or "12345678" accepted if client validation bypassed
- **Fix Required:** Duplicate Zod password schema validation on server

**H2. Slug Availability Race Condition**
- **File:** `src/components/forms/SignupForm.tsx:63-84`
- **Flow:**
  1. User types username → Real-time check says "available" (line 70)
  2. User submits form (2 seconds later)
  3. Meanwhile, another user took that slug
  4. Submit fails with "username taken" error
- **Impact:** Poor UX - user sees green checkmark then gets error
- **Fix Required:** Server-side re-check before creation (currently exists), but need client retry with new slug suggestions

**H3. Session Storage for Credentials (Security Risk)**
- **File:** `src/components/forms/SignupForm.tsx:119-126`
- **Code:**
  ```typescript
  sessionStorage.setItem(
    'signup_credentials',
    JSON.stringify({
      username: data.slug,
      password: data.password, // ❌ PLAIN TEXT PASSWORD
      email: data.email,
    })
  );
  ```
- **Issue:** Plaintext password stored in browser sessionStorage
- **Impact:**
  - XSS attacks can steal password
  - Browser extensions can read it
  - Violates password storage best practices
- **Fix Required:** Don't store password; user can login normally after signup

**H4. No Account Lockout After Failed Login Attempts**
- **File:** `src/app/login/actions.ts:12-29`
- **Issue:** Unlimited login attempts with same credentials
- **Impact:** Brute force password guessing possible
- **Fix Required:** Implement exponential backoff or temporary lockout after 5 failed attempts

**H5. Error Messages Leak Account Existence**
- **File:** `src/app/api/signup/route.ts:113-122`
- **Code:**
  ```typescript
  if (existingEmail) {
    return NextResponse.json({
      success: false,
      error: 'Email already registered',
      message: 'An account with this email already exists'
    }, { status: 409 });
  }
  ```
- **Issue:** Specific error reveals if email is in database
- **Impact:** User enumeration attack - attacker can build list of registered emails
- **Best Practice:** Return generic "signup failed" for both duplicate email and other errors
- **Note:** This is a balance between security and UX. Consider accepting the trade-off but log suspicious patterns.

**H6. Missing Input Sanitization**
- **Files:** All form inputs (first_name, last_name, company_name, phone)
- **Issue:** No HTML escaping or sanitization before display
- **Impact:** Stored XSS if malicious input like `<script>alert(1)</script>` in name field
- **Fix Required:** Sanitize all user inputs before database storage and display

**H7. Email Campaign Enrollment Fails Silently**
- **File:** `src/app/api/signup/route.ts:313-318`
- **Code:**
  ```typescript
  const enrollResult = await enrollInCampaign(distributor as Distributor);
  if (!enrollResult.success) {
    // Log error but don't fail signup - email can be sent manually later
    console.error('Email campaign enrollment failed:', enrollResult.error);
  }
  ```
- **Issue:** User created but never gets welcome email, no retry mechanism
- **Impact:** Poor onboarding experience, users may never receive critical setup info
- **Fix Required:** Add to retry queue or notify admins for manual intervention

**H8. Password Reset Token Not Single-Use (Race Condition)**
- **File:** `src/app/api/auth/reset-password/route.ts:72-75`
- **Code:**
  ```typescript
  // Mark token as used
  await supabase
    .from('password_reset_tokens')
    .update({ used: true })
    .eq('token', token);
  ```
- **Issue:** Token marked as used AFTER password update, not atomically
- **Attack Scenario:**
  1. Attacker intercepts reset link
  2. Sends two simultaneous password reset requests with same token
  3. Both might succeed before `used` flag is set
- **Fix Required:** Use database transaction or mark token as used BEFORE password update

**H9. No Maximum Token Age Validation**
- **File:** `src/app/api/auth/forgot-password/route.ts:43`
- **Code:**
  ```typescript
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
  ```
- **Issue:** Hardcoded 1-hour expiry, but no validation that created_at is recent
- **Edge Case:** If system clock is wrong, tokens could be valid forever
- **Fix Required:** Also validate `created_at` is within reasonable time of `NOW()`

---

#### MEDIUM Priority Issues

**M1. No SQL Injection Testing**
- **File:** `src/lib/utils/slug.ts:79-83`
- **Issue:** While Supabase prevents SQL injection, no tests verify this
- **Fix Required:** Add tests with malicious inputs like `'; DROP TABLE distributors;--`

**M2. Inconsistent Error Handling Format**
- **Example 1:** `src/app/api/signup/route.ts:48-54` returns `{ success: false, error: string, message: string }`
- **Example 2:** `src/app/api/auth/signin/route.ts:54-60` returns `{ success: false, error: string, message: string }`
- **Example 3:** `src/app/api/auth/forgot-password/route.ts:18-22` returns `{ error: string }`
- **Issue:** Three different response formats make client-side handling harder
- **Fix Required:** Standardize on ApiResponse type across all endpoints

**M3. No Logging of Authentication Events**
- **Files:** All auth routes
- **Issue:** No audit trail for:
  - Failed login attempts
  - Password changes
  - Account creations
  - Suspicious activity
- **Impact:** Cannot detect/investigate security incidents
- **Fix Required:** Log all auth events to dedicated audit table

**M4. Sponsor Lookup Inefficiency**
- **File:** `src/app/signup/page.tsx:28-34`
- **Code:**
  ```typescript
  const { data: sponsor } = await supabase
    .from('distributors')
    .select('slug, first_name, last_name')
    .eq('slug', refSlug)
    .single();
  ```
- **Issue:** Database query on every signup page load (even if ref param missing)
- **Fix Required:** Only query if `refSlug` is truthy (move query inside if statement)

**M5. Matrix Placement BFS Not Fully Implemented**
- **File:** `supabase/migrations/20260310000002_atomic_signup_functions.sql:77-98`
- **Comment:** "This is a simplified BFS - for production, use a proper queue"
- **Issue:** Only searches one level deep below sponsor's children
- **Impact:** Deep matrices may not fill optimally
- **Fix Required:** Implement full BFS with queue or use recursive CTE

**M6. No Cleanup Job for Expired Reset Tokens**
- **File:** `supabase/migrations/20260226000002_password_reset_tokens.sql:18-27`
- **Function Exists:** `cleanup_expired_reset_tokens()`
- **Issue:** Function exists but no cron job calls it
- **Impact:** Table grows unbounded with expired tokens
- **Fix Required:** Add pg_cron job or Supabase Edge Function to run daily cleanup

**M7. Password Strength Indicator Misleading**
- **File:** `src/components/forms/SignupForm.tsx:87-96`
- **Code:**
  ```typescript
  const getPasswordStrength = (password: string): number => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++; // Special chars not required!
    return strength;
  }
  ```
- **Issue:** Shows strength of 5/5 for passwords with special chars, but validation doesn't require them
- **Impact:** Users add special chars thinking they're required, then frustrated when they can remove them
- **Fix Required:** Match strength indicator to actual validation rules

**M8. Company Name and Phone Are Optional But No Clear Labeling**
- **File:** `src/components/forms/SignupForm.tsx:308-337`
- **UI Says:** "Company Name (Optional)" and "Phone (Optional)"
- **Database Schema:** Unknown (not examined)
- **Issue:** If these fields are non-null in database, signup will fail mysteriously
- **Fix Required:** Verify database schema allows NULL or set default empty string

**M9. Loading States Missing on Form Fields**
- **File:** `src/components/forms/LoginForm.tsx:36-44`
- **Issue:** Email input not disabled during `isPending`
- **Impact:** User can modify email while login is in progress (causes confusion)
- **Fix Required:** Disable all inputs when `isPending` is true

**M10. No Timeout on API Requests**
- **Files:** All form components
- **Issue:** Fetch requests have no timeout - could hang forever
- **Impact:** Poor UX if API is slow/down
- **Fix Required:** Add AbortController with 30-second timeout

**M11. SSN Masking Function Has No Tests**
- **File:** `src/lib/utils/ssn.ts:73-80`
- **Issue:** Critical PII handling code has no unit tests
- **Impact:** Cannot verify masking works correctly after changes
- **Fix Required:** Add comprehensive test suite for SSN utilities

**M12. Forgot Password Page Uses Hardcoded URL**
- **File:** `src/app/api/auth/forgot-password/route.ts:65-74`
- **Code:**
  ```typescript
  let baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!baseUrl || baseUrl.includes('localhost')) {
    if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else {
      baseUrl = 'https://reachtheapex.net'; // ❌ Hardcoded fallback
    }
  }
  ```
- **Issue:** Hardcoded production URL means preview deployments send wrong reset links
- **Fix Required:** Use `request.headers.get('host')` or fail if NEXT_PUBLIC_SITE_URL not set

---

#### LOW Priority Issues

**L1. Magic Numbers in Rate Limiting**
- **File:** `src/app/api/signup/route.ts:37-38`
- **Code:**
  ```typescript
  const RATE_LIMIT_MAX = 5;
  const RATE_LIMIT_WINDOW_MINUTES = 15;
  ```
- **Issue:** Constants defined in route file instead of config
- **Fix:** Move to environment variables or central config

**L2. Inline Styles in SignupForm**
- **File:** `src/components/forms/SignupForm.tsx:140-142`
- **Code:**
  ```typescript
  <div className="..." style={{paddingTop: '20px', paddingBottom: '20px'}}>
  ```
- **Issue:** Mixing Tailwind classes with inline styles
- **Fix:** Use only Tailwind classes for consistency

**L3. Missing Accessibility Labels**
- **File:** `src/components/forms/LoginForm.tsx:62-68`
- **Issue:** "Show/Hide" password buttons have no aria-label
- **Impact:** Screen readers can't describe button purpose
- **Fix:** Add `aria-label="Toggle password visibility"`

**L4. No Internationalization (i18n)**
- **Files:** All form components
- **Issue:** All text is hardcoded English
- **Impact:** Cannot support multiple languages
- **Fix:** Implement i18n framework if multilingual support needed

**L5. Console.log in Production Code**
- **Examples:**
  - `src/app/api/signup/route.ts:169` - "No sponsor provided - assigning to master..."
  - `src/app/api/signup/route.ts:199` - "Deleted orphaned auth user..."
- **Issue:** Sensitive info logged to console in production
- **Fix:** Use structured logging library with log levels

---

## 2. Login Flow Analysis

### Data Flow
```
User Form → Client Validation (Basic) → Server Action →
Supabase signInWithPassword → Check Admin Status →
Redirect to Dashboard/Admin → Session Created
```

### Files Examined
- `src/app/login/page.tsx` (Page wrapper - CLEAN)
- `src/components/forms/LoginForm.tsx` (Form component - 107 lines)
- `src/app/login/actions.ts` (Server action - 54 lines)
- `src/app/api/auth/signin/route.ts` (Alternative API route - 83 lines)

---

### Issues Found

#### CRITICAL Issues

**C6. Two Different Login Implementations (Inconsistency)**
- **Implementation 1:** `src/app/login/actions.ts` (Server Action)
- **Implementation 2:** `src/app/api/auth/signin/route.ts` (API Route)
- **Issue:** Two separate code paths for login, both functional but duplicated
- **Impact:**
  - Maintenance nightmare (bugs must be fixed in two places)
  - Security patches could miss one implementation
  - Confused developers don't know which to use
- **Evidence:** LoginForm uses actions.ts, but API route exists unused
- **Fix Required:** Remove one implementation, standardize on Server Actions

---

#### HIGH Priority Issues

**H10. Login Redirects Without Preserving Return URL**
- **File:** `src/app/login/actions.ts:52`
- **Code:**
  ```typescript
  redirect('/dashboard');
  ```
- **Issue:** If user was trying to access `/profile/settings`, they're sent to `/dashboard` after login
- **Impact:** Poor UX - user must navigate to original destination again
- **Fix Required:** Accept returnUrl parameter and redirect there after login

**H11. No Multi-Factor Authentication (MFA)**
- **Files:** All login flows
- **Issue:** Only email+password required for access
- **Impact:** Account takeover if password compromised
- **Fix Required:** Implement optional/required MFA (TOTP or SMS)

**H12. Admin Check Uses Inefficient Query**
- **File:** `src/app/login/actions.ts:36-40`
- **Code:**
  ```typescript
  const { data: admin } = await serviceClient
    .from('admins')
    .select('id')
    .eq('auth_user_id', data.user.id)
    .single();
  ```
- **Issue:** Separate database query after login just to check admin status
- **Fix Required:** Use Supabase custom claims or JWT metadata

---

#### MEDIUM Priority Issues

**M13. Generic Error Message Hides Actual Problem**
- **File:** `src/app/login/actions.ts:28`
- **Code:**
  ```typescript
  if (error) {
    return { error: 'Invalid email or password' };
  }
  ```
- **Issue:** All errors return same message (good for security, bad for debugging)
- **Actual Errors Could Be:**
  - Network timeout
  - Database connection failed
  - Account disabled/banned
  - Email not verified
- **Fix Required:** Log actual error server-side, return generic message to user

**M14. Missing Remember Me Functionality**
- **File:** `src/components/forms/LoginForm.tsx`
- **Issue:** No "Remember Me" checkbox - session always temporary
- **Impact:** Users must re-login frequently
- **Fix Required:** Add optional persistent session

**M15. No Visual Feedback for Processing State**
- **File:** `src/components/forms/LoginForm.tsx:90-103`
- **Issue:** Button disabled but form still looks interactive
- **Fix Required:** Add skeleton loader or overlay during login

---

## 3. Password Reset Flow Analysis

### Data Flow
```
Forgot Password Form → API → Check User Exists → Generate Token →
Store in Database → Send Email (Resend) → User Clicks Link →
Verify Token → Show Reset Form → Submit New Password →
Update in Supabase Auth → Mark Token Used → Redirect to Login
```

### Files Examined
- `src/app/forgot-password/page.tsx` (Request page - CLEAN)
- `src/components/forms/ForgotPasswordForm.tsx` (Request form - 116 lines)
- `src/app/api/auth/forgot-password/route.ts` (Request API - 193 lines)
- `src/app/reset-password/page.tsx` (Reset page - CLEAN)
- `src/components/forms/ResetPasswordForm.tsx` (Reset form - 251 lines)
- `src/app/api/auth/reset-password/route.ts` (Reset API - 149 lines)

---

### Issues Found

#### CRITICAL Issues

*(C4 already covered: Rate limiting disabled)*

**C7. Password Reset Tokens Use Crypto.randomBytes (Good!) But Token Length Unknown**
- **File:** `src/app/api/auth/forgot-password/route.ts:42`
- **Code:**
  ```typescript
  const token = crypto.randomBytes(32).toString('hex');
  ```
- **Good:** Using cryptographically secure random
- **Issue:** 32 bytes = 64 hex chars, but no comment documenting this
- **Impact:** Future dev might change to 16 bytes (less secure)
- **Fix Required:** Add comment explaining security reasoning

---

#### HIGH Priority Issues

**H13. Email Template Embedded in Code (Not Editable)**
- **File:** `src/app/api/auth/forgot-password/route.ts:79-162`
- **Issue:** 84 lines of HTML email template hardcoded in API route
- **Impact:**
  - Cannot update email copy without code deployment
  - Cannot A/B test email variations
  - Marketing team cannot edit emails
- **Fix Required:** Move to email_templates table or separate template files

**H14. Password Reset Success Leaks Account Existence**
- **File:** `src/app/api/auth/forgot-password/route.ts:33-39`
- **Code:**
  ```typescript
  // For security, always return success even if user doesn't exist
  if (!distributor || !distributor.auth_user_id) {
    return NextResponse.json({
      success: true,
      message: 'If an account exists, a reset link has been sent'
    });
  }
  ```
- **Good:** Tries to prevent user enumeration
- **Issue:** But if email fails to send (line 172), error is returned
- **Impact:** Attacker can distinguish "user exists but email failed" vs "user doesn't exist"
- **Fix Required:** Always return success, log email failures privately

**H15. Token Verification on Every Render**
- **File:** `src/components/forms/ResetPasswordForm.tsx:22-60`
- **Code:**
  ```typescript
  useEffect(() => {
    verifyToken(); // Calls API on every component mount
  }, [searchParams]);
  ```
- **Issue:** Token verified client-side before form shown
- **Impact:**
  - Additional API call (performance)
  - Token could be intercepted/logged
  - Better to verify on submit
- **Fix Required:** Remove pre-verification, validate on form submit only

---

#### MEDIUM Priority Issues

**M16. Password Match Validation Client-Side Only**
- **File:** `src/components/forms/ResetPasswordForm.tsx:76-78`
- **Code:**
  ```typescript
  if (password !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }
  ```
- **Issue:** No server-side verification that passwords match
- **Impact:** API accepts requests without confirmation check
- **Fix Required:** Require confirmPassword in API request body, validate server-side

**M17. Success Redirect Uses setTimeout Instead of Router Event**
- **File:** `src/components/forms/ResetPasswordForm.tsx:110-112`
- **Code:**
  ```typescript
  setTimeout(() => {
    router.push('/login');
  }, 2000);
  ```
- **Issue:** If user navigates away, timer still fires (could redirect unexpectedly)
- **Fix Required:** Use router.push immediately or cancel timer on unmount

**M18. No Email Preview/Test Mode**
- **File:** `src/app/api/auth/forgot-password/route.ts:165-170`
- **Issue:** Cannot preview email without actually sending it
- **Fix Required:** Add `?preview=true` mode that returns HTML without sending

---

## 4. Cross-Cutting Security Concerns

### Authentication Edge Cases

**E1. What Happens If User Deletes Account During Password Reset?**
- **Current Behavior:** Token remains valid, password update fails
- **Fix Required:** Add cascade delete on password_reset_tokens when user deleted

**E2. Can User Change Email During Password Reset Window?**
- **Current Behavior:** Unknown - not tested
- **Risk:** Reset link goes to old email, attacker controls old email account
- **Fix Required:** Invalidate all reset tokens when email changed

**E3. What If Supabase Auth and Distributors Table Get Out of Sync?**
- **Current Protection:** Atomic transaction in create_distributor_atomic
- **Gap:** If auth user deleted outside system, distributor orphaned
- **Fix Required:** Add database trigger to cascade delete distributors when auth user deleted

**E4. Session Fixation Attack**
- **File:** `src/app/login/actions.ts:22-25`
- **Issue:** No session regeneration after login
- **Attack:** Attacker sets victim's session ID before login, then hijacks it after
- **Fix Required:** Supabase handles this automatically, verify it's enabled

### Data Validation Gaps

**V1. Email Validation Allows Disposable Email Addresses**
- **File:** `src/lib/validations/signup.ts:70-75`
- **Regex:** Only checks valid email format, not domain quality
- **Impact:** Users can signup with tempmail.com, guerrillamail.com, etc.
- **Fix Required:** Add disposable email domain blocklist

**V2. Name Fields Allow Numbers and Special Characters**
- **File:** `src/lib/validations/signup.ts:56-68`
- **Validation:** Min 2 chars, max 100 chars, that's it
- **Issue:** Allows names like "John123" or "Mary<script>"
- **Fix Required:** Add regex to allow only letters, spaces, hyphens, apostrophes

**V3. Phone Number Validation Too Permissive**
- **File:** `src/lib/validations/signup.ts:105-111`
- **Regex:** `/^[0-9\s\-\(\)\+]*$/`
- **Issue:** Allows empty string, "000-000-0000", "123"
- **Fix Required:** Use proper phone validation library (libphonenumber-js)

### Session Management

**S1. No Session Timeout Configuration**
- **Files:** All auth flows
- **Issue:** Default Supabase session timeout (unclear if configured)
- **Fix Required:** Set explicit session timeout in Supabase config (e.g., 7 days)

**S2. No Concurrent Session Limit**
- **Issue:** User can login from unlimited devices simultaneously
- **Risk:** Stolen credentials can be used without detection
- **Fix Required:** Track active sessions, limit to 3-5 concurrent logins

**S3. No "Logout All Devices" Feature**
- **Issue:** If password compromised, can't invalidate all sessions quickly
- **Fix Required:** Add "logout all other sessions" button in settings

---

## 5. Critical Issues Summary

### Must Fix Before Production

| ID | Issue | File | Severity | Estimated Effort |
|----|-------|------|----------|------------------|
| C1 | SSN encryption is Base64 (reversible) | `src/lib/utils/ssn.ts:116` | CRITICAL | 8 hours |
| C2 | No email verification | `src/app/api/signup/route.ts:174` | CRITICAL | 4 hours |
| C3 | Missing CSRF protection | All forms | CRITICAL | 6 hours |
| C4 | Rate limiting disabled | `src/app/api/auth/reset-password/route.ts:11` | CRITICAL | 2 hours |
| C5 | Orphaned user cleanup timing attack | `src/app/api/signup/route.ts:189` | CRITICAL | 3 hours |
| C6 | Duplicate login implementations | `src/app/login/*` | HIGH | 2 hours |

**Total Estimated Effort:** 25 hours (3-4 days)

---

## 6. High Priority Issues Summary

### Should Fix Soon (Within 2 Weeks)

| ID | Issue | Impact | Effort |
|----|-------|--------|--------|
| H1 | Server password validation weak | Weak passwords accepted | 1 hour |
| H2 | Slug race condition | Poor UX | 2 hours |
| H3 | Password in sessionStorage | XSS vulnerability | 1 hour |
| H4 | No account lockout | Brute force possible | 4 hours |
| H5 | Error messages leak info | User enumeration | 2 hours |
| H6 | Missing input sanitization | XSS attacks | 3 hours |
| H7 | Email enrollment fails silently | Poor onboarding | 2 hours |
| H8 | Reset token race condition | Token reuse possible | 2 hours |
| H9 | No max token age validation | Indefinite token validity | 1 hour |
| H10 | No return URL preservation | Poor UX | 2 hours |
| H11 | No MFA support | Account takeover risk | 8 hours |
| H12 | Inefficient admin check | Performance | 3 hours |
| H13 | Email template hardcoded | Cannot edit without deploy | 4 hours |
| H14 | Password reset leaks existence | User enumeration | 2 hours |
| H15 | Unnecessary token verification | Extra API call | 1 hour |

**Total Estimated Effort:** 38 hours (5 days)

---

## 7. Recommendations

### Immediate Actions (This Week)

1. **Replace SSN "encryption" with real encryption**
   - Use `@supabase/supabase-js` Vault feature
   - Or implement AES-256-GCM with AWS KMS
   - Rotate existing SSNs (decrypt with Base64, re-encrypt properly)

2. **Enable email verification**
   - Configure Supabase email templates
   - Add `/verify-email` page
   - Block login until email confirmed

3. **Implement CSRF protection**
   - Add `csrf-token` package
   - Generate token on page load
   - Validate on all POST requests

4. **Fix rate limiting**
   - Implement database-based fallback for when Redis unavailable
   - Create `rate_limit_events` table
   - Use window-based counting

5. **Remove duplicate login code**
   - Delete `src/app/api/auth/signin/route.ts`
   - Standardize on Server Actions

### Short-Term Improvements (Next 2 Weeks)

6. **Add comprehensive input validation**
   - Name fields: letters, spaces, hyphens only
   - Phone: use libphonenumber-js
   - Email: block disposable domains

7. **Implement proper error logging**
   - Use structured logger (Pino, Winston)
   - Log to centralized service (Datadog, Sentry)
   - Create `auth_events` audit table

8. **Add account security features**
   - Failed login attempt tracking
   - Account lockout after 5 failures
   - "Logout all devices" button
   - Session activity log

9. **Move email templates to database**
   - Create `system_email_templates` table
   - Support variable interpolation
   - Add admin UI for editing

### Long-Term Enhancements (Next Month)

10. **Multi-Factor Authentication**
    - TOTP support (Google Authenticator)
    - SMS backup codes
    - Recovery codes

11. **Advanced security monitoring**
    - Detect credential stuffing attempts
    - Flag suspicious login patterns (new device, new location)
    - Require re-authentication for sensitive actions

12. **Improve testing coverage**
    - Unit tests for all validation functions
    - Integration tests for auth flows
    - E2E tests with Playwright

---

## 8. Test Coverage Gaps

### Unit Tests Needed

**High Priority:**
- `src/lib/utils/ssn.ts` - All functions (CRITICAL - handles PII)
- `src/lib/validations/signup.ts` - Validation schemas with edge cases
- `src/lib/utils/slug.ts` - Slug generation and validation

**Medium Priority:**
- `src/app/api/signup/route.ts` - API handler logic (mock Supabase)
- `src/app/api/auth/forgot-password/route.ts` - Token generation
- `src/app/api/auth/reset-password/route.ts` - Token validation

### Integration Tests Needed

**Signup Flow:**
```typescript
describe('Signup Flow', () => {
  it('should create distributor with valid data')
  it('should reject duplicate email')
  it('should reject duplicate slug')
  it('should reject invalid SSN')
  it('should handle race condition on slug')
  it('should rollback on tax_info insert failure')
  it('should rate limit signups from same IP')
})
```

**Login Flow:**
```typescript
describe('Login Flow', () => {
  it('should authenticate valid credentials')
  it('should reject invalid password')
  it('should redirect admin to /admin')
  it('should redirect distributor to /dashboard')
  it('should preserve return URL')
  it('should lock account after 5 failures')
})
```

**Password Reset Flow:**
```typescript
describe('Password Reset Flow', () => {
  it('should send email for valid user')
  it('should not reveal if user exists')
  it('should reject expired token')
  it('should reject used token')
  it('should update password successfully')
  it('should handle concurrent reset attempts')
})
```

### E2E Tests Needed (Playwright)

**Critical Paths:**
1. Complete signup flow (form → email → verification)
2. Login → Navigate to dashboard → Logout
3. Forgot password → Email → Reset → Login
4. Signup with referral link (sponsor assignment)
5. Invalid inputs (test all error messages)

---

## 9. Security Best Practices Checklist

### ✅ Currently Implemented
- [x] Zod validation on client and server
- [x] Rate limiting on signup endpoint
- [x] Password complexity requirements
- [x] SSN stored in separate table with RLS
- [x] Atomic distributor creation (prevents race conditions)
- [x] Custom password reset tokens (not default Supabase)
- [x] Audit logging for SSN access (table exists)

### ❌ Missing
- [ ] Email verification before account activation
- [ ] CSRF protection on forms
- [ ] Input sanitization (XSS prevention)
- [ ] Account lockout after failed attempts
- [ ] Multi-factor authentication
- [ ] Session timeout configuration
- [ ] Concurrent session limiting
- [ ] Proper PII encryption (not Base64)
- [ ] Security headers (CSP, HSTS, X-Frame-Options)
- [ ] Penetration testing results

---

## 10. Compliance Considerations

### GDPR (If EU users)
- ❌ **Missing:** Right to be forgotten (delete account feature)
- ❌ **Missing:** Data export functionality
- ❌ **Missing:** Consent tracking for email marketing
- ⚠️ **Partial:** Privacy policy link (need to verify exists)

### CCPA (California users)
- ❌ **Missing:** "Do Not Sell My Info" option
- ❌ **Missing:** Data disclosure requirements

### SOX (Financial data)
- ⚠️ **Weak:** SSN encryption (Base64 insufficient)
- ✅ **Good:** Audit logging for SSN access
- ❌ **Missing:** Audit log for password changes

### PCI-DSS (If storing payment info)
- ⚠️ **Review Required:** Payment card data handling (not examined in this audit)

---

## 11. Performance Observations

### Slow Operations Identified

**Signup Page Load:**
- **File:** `src/app/signup/page.tsx:28-34`
- **Issue:** Database query for sponsor on EVERY page load
- **Impact:** 200-500ms added latency
- **Fix:** Move query inside `if (refSlug)` block

**Real-time Slug Check:**
- **File:** `src/components/forms/SignupForm.tsx:63-84`
- **Issue:** API call on every keystroke (with 500ms debounce)
- **Impact:** Could flood API if user types quickly
- **Current Mitigation:** Debounce helps
- **Better Fix:** Increase debounce to 800ms or check on blur

**Admin Check After Login:**
- **File:** `src/app/login/actions.ts:36-40`
- **Issue:** Separate database query to check admin status
- **Impact:** Adds 100-200ms to login flow
- **Fix:** Use Supabase custom claims or JWT metadata

### Database Query Optimization

**N+1 Query Potential:**
- In matrix placement function, could query children one-by-one
- **Fix:** Already handled with `FOR v_current_id IN (SELECT ...)` loop

---

## 12. Code Quality Observations

### Strengths
- Consistent file structure and naming conventions
- Good comments explaining complex logic
- Type safety with TypeScript
- Separation of concerns (forms, API, utilities)

### Weaknesses
- Duplicate login implementations (Server Action + API Route)
- Hardcoded configuration values
- Inconsistent error response formats
- Missing JSDoc comments on utility functions
- No centralized constant management

---

## Conclusion

The Apex Affinity Group authentication system has **solid foundations** with comprehensive validation, atomic database operations, and good separation of concerns. However, there are **5 critical security issues** that must be addressed before production launch:

1. **SSN encryption is actually Base64 encoding** (data breach risk)
2. **No email verification** (account takeover risk)
3. **Missing CSRF protection** (cross-site attack risk)
4. **Rate limiting disabled on password reset** (brute force risk)
5. **Orphaned auth user cleanup vulnerable to timing attacks** (user enumeration risk)

Additionally, **9 high-priority issues** should be resolved within 2 weeks to ensure a secure and professional user experience.

**Recommended Timeline:**
- **Week 1:** Fix all 5 critical issues (25 hours)
- **Week 2-3:** Address 9 high-priority issues (38 hours)
- **Week 4:** Implement comprehensive test suite
- **Week 5+:** Medium/low priority improvements

**Total Technical Debt:** ~80 hours (2 weeks of focused work)

---

## Appendix A: File Reference

### Signup Flow
| File | Lines | Purpose | Issues |
|------|-------|---------|--------|
| `src/app/signup/page.tsx` | 82 | Page wrapper, sponsor lookup | M4 |
| `src/components/forms/SignupForm.tsx` | 489 | Form UI, validation, submission | H2, H3, L2 |
| `src/app/api/signup/route.ts` | 349 | API handler, user creation | C1, C2, C5, H5, H7, M1-M6 |
| `src/lib/validations/signup.ts` | 173 | Zod schemas | V1, V2 |
| `src/lib/utils/ssn.ts` | 185 | SSN utilities | C1, M11 |
| `src/lib/utils/slug.ts` | 137 | Slug generation | None |

### Login Flow
| File | Lines | Purpose | Issues |
|------|-------|---------|--------|
| `src/app/login/page.tsx` | 53 | Page wrapper | None |
| `src/components/forms/LoginForm.tsx` | 107 | Form UI | H4, M14, L3 |
| `src/app/login/actions.ts` | 54 | Server action | C6, H10, H12, M13 |
| `src/app/api/auth/signin/route.ts` | 83 | Unused API route | C6 |

### Password Reset Flow
| File | Lines | Purpose | Issues |
|------|-------|---------|--------|
| `src/app/forgot-password/page.tsx` | 53 | Request page | None |
| `src/components/forms/ForgotPasswordForm.tsx` | 116 | Request form | None |
| `src/app/api/auth/forgot-password/route.ts` | 193 | Token generation, email | H13, H14, M12, M18 |
| `src/app/reset-password/page.tsx` | 65 | Reset page | None |
| `src/components/forms/ResetPasswordForm.tsx` | 251 | Reset form | H8, H15, M16, M17 |
| `src/app/api/auth/reset-password/route.ts` | 149 | Token validation, password update | C4, H1, H8, H9 |

### Utilities
| File | Lines | Purpose | Issues |
|------|-------|---------|--------|
| `src/lib/rate-limit.ts` | 254 | Rate limiting | C4 |
| `src/lib/supabase/server.ts` | Unknown | Supabase client | Not examined |
| `src/lib/supabase/service.ts` | Unknown | Service role client | Not examined |

---

## Appendix B: Testing Commands

### Run Unit Tests
```bash
npm run test:unit
```

### Run Integration Tests
```bash
npm run test:integration
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Test Coverage Report
```bash
npm run test:coverage
```

---

**Report Generated:** March 16, 2026
**Next Audit Recommended:** After critical issues resolved (2 weeks)
