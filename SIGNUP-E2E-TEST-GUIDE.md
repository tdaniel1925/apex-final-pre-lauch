# End-to-End Signup Test with VAPI Agent Creation

## Overview

This guide provides comprehensive documentation for the end-to-end signup test script that validates the complete user registration flow including VAPI agent provisioning.

## What Does This Test?

The test validates the entire signup journey:

1. **Signup API Endpoint** (`POST /api/signup`)
   - Personal vs Business registration validation
   - Required field validation
   - Email/slug uniqueness checks
   - SSN/EIN encryption

2. **Database Record Creation**
   - Auth user creation (`auth.users`)
   - Distributor record (`distributors`)
   - Member record (`members`)
   - Tax information (`distributor_tax_info`)
   - Matrix placement

3. **VAPI Agent Provisioning** (`POST /api/signup/provision-ai`)
   - VAPI assistant creation
   - Phone number provisioning
   - Area code matching (if possible)
   - Database updates with agent details

4. **End-to-End Verification**
   - Verify all database records exist
   - Verify VAPI assistant is active
   - Verify phone number is assigned
   - Confirm agent can receive calls

## Prerequisites

### Required Environment Variables

Ensure these are set in your `.env.local` file:

```bash
# API URL
NEXT_PUBLIC_APP_URL="http://localhost:3050"  # or production URL

# Supabase (for database operations)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# VAPI (for agent creation and verification)
VAPI_API_KEY="your-vapi-api-key"
```

### Required Services Running

- **Local Development**: Next.js dev server running on port 3050
  ```bash
  npm run dev
  ```

- **Production**: Application deployed and accessible

## Usage

### Basic Test (Personal Registration)

```bash
npm run test:signup
```

This will:
- Generate random test user data
- Create a personal registration
- Verify all database records
- Verify VAPI agent creation
- Leave test data in database (for manual inspection)

### Business Registration Test

```bash
npm run test:signup -- --type=business
```

This will:
- Generate random business test data
- Create a business registration
- Include company name, EIN, business type
- Verify all records

### Test with Automatic Cleanup

```bash
npm run test:signup -- --cleanup
```

This will:
- Run the complete test
- **Automatically delete all test data** after verification
- Clean up auth user, distributor, member, VAPI agent

### Production Test

```bash
npm run test:signup -- --prod
```

**WARNING**: This tests against production. Only use when:
- You want to verify production VAPI integration
- You understand test data will be created
- You use `--cleanup` flag to remove test data

### Combined Options

```bash
# Test business registration on production with cleanup
npm run test:signup -- --type=business --prod --cleanup

# Test personal registration with cleanup (local)
npm run test:signup -- --cleanup
```

## Test Output

### Successful Test Example

```
╔════════════════════════════════════════════════════════════╗
║       🧪 End-to-End Signup Test with VAPI Agent          ║
╚════════════════════════════════════════════════════════════╝

📋 Test Configuration:
   Environment: LOCAL/STAGING
   API URL: http://localhost:3050
   Registration Type: personal
   Cleanup After: NO

📝 Generating test data...
   ✅ Test data generated
      - Name: Test UserABC
      - Email: test-1711234567890-xyz@apextest.local
      - Phone: 5551234567
      - Slug: test-xyz-1711234567890

📤 Submitting signup form...
   Type: personal
   Email: test-1711234567890-xyz@apextest.local
   Phone: 5551234567
✅ Signup successful!
   Distributor ID: 12345678-1234-1234-1234-123456789012
   AI Phone Provisioned: YES

💾 Verifying distributor record...
   ✅ Distributor record found
      - ID: 12345678-1234-1234-1234-123456789012
      - Slug: test-xyz-1711234567890
      - Email: test-1711234567890-xyz@apextest.local
      - Matrix Position: 3
      - Matrix Depth: 2

💾 Verifying member record...
   ✅ Member record found
      - Member ID: AAG-000123
      - Status: active
      - Tech Rank: starter

🤖 Verifying VAPI assistant...
   ✅ VAPI assistant found
      - Assistant ID: asst_abc123def456
      - Name: Test UserABC - Apex AI

📞 Verifying VAPI phone number...
   ✅ VAPI phone number found
      - Phone Number: +12025551234
      - Provider: twilio

📞 Test Call Instructions:
   Call +12025551234 to test the AI agent
   Expected: Professional greeting and information about Apex Affinity Group

╔════════════════════════════════════════════════════════════╗
║                  ✅ All Tests Passed!                     ║
╚════════════════════════════════════════════════════════════╝

📊 Test Summary:
   ✅ Signup API: Success
   ✅ Distributor Record: Created
   ✅ Member Record: Created
   ✅ Matrix Placement: Position 3
   ✅ VAPI Agent: Provisioned
   ✅ Phone Number: +12025551234

🔑 Test Account Credentials:
   Email: test-1711234567890-xyz@apextest.local
   Password: TestPass123!
   Login URL: http://localhost:3050/login
   Dashboard: http://localhost:3050/dashboard
```

### Failed Test Example

```
❌ Test Failed!
   Error: Signup failed: Email already registered

   Stack Trace:
   Error: Signup failed: Email already registered
       at submitSignup (scripts/test-signup-e2e.ts:123:11)
       at runTest (scripts/test-signup-e2e.ts:456:23)
```

## What Gets Created

### Database Records

1. **auth.users**
   - Email/password authentication
   - User metadata (first name, last name)

2. **distributors**
   - Complete profile information
   - Matrix placement (parent_id, position, depth)
   - VAPI agent details (assistant_id, phone_number, etc.)
   - Registration type (personal/business)

3. **members**
   - Compensation tracking record
   - Tech rank: starter
   - Status: active
   - Linked to sponsor (if provided)

4. **distributor_tax_info**
   - Encrypted SSN (personal) or EIN (business)
   - Last 4 digits visible
   - Tax ID type

### VAPI Resources

1. **Assistant**
   - GPT-4 powered conversational AI
   - Personalized system prompt
   - Voice: Professional female (Eleven Labs)
   - Recording enabled

2. **Phone Number**
   - Twilio-provided number
   - Area code matching (when available)
   - Inbound call routing to assistant

## Manual Testing Steps

After running the automated test:

1. **Login Test**
   ```bash
   # Use credentials shown in test output
   Email: test-xxx@apextest.local
   Password: TestPass123!
   ```

2. **Dashboard Check**
   - Verify user can access dashboard
   - Check matrix position display
   - Verify AI agent phone number shown

3. **Call Test**
   - Call the VAPI phone number
   - Verify professional greeting
   - Ask about Apex Affinity Group
   - Verify conversation quality

4. **Database Inspection**
   ```sql
   -- Check distributor record
   SELECT * FROM distributors WHERE email = 'test-xxx@apextest.local';

   -- Check member record
   SELECT * FROM members WHERE distributor_id = 'xxx';

   -- Check matrix placement
   SELECT matrix_parent_id, matrix_position, matrix_depth
   FROM distributors
   WHERE id = 'xxx';
   ```

## Troubleshooting

### Test Fails at Signup API

**Error**: `Validation failed: [field] is required`

**Solution**: Check that test data generator includes all required fields for the registration type.

---

**Error**: `Too many requests`

**Solution**: Rate limiting is active. Wait 15 minutes or disable rate limiting in dev:
```typescript
// In src/app/api/signup/route.ts
const isDevelopment = process.env.NODE_ENV === 'development';
```

---

### Test Fails at VAPI Agent Creation

**Error**: `VAPI_API_KEY not set`

**Solution**: Add VAPI API key to `.env.local`:
```bash
VAPI_API_KEY="your-vapi-api-key-here"
```

---

**Error**: `No numbers available in area code XXX`

**Solution**: VAPI will automatically try nearby area codes, then any US number. This is normal.

---

### Test Fails at Database Verification

**Error**: `Distributor record not found`

**Solution**:
1. Check Supabase connection
2. Verify service role key has correct permissions
3. Check if signup actually succeeded (check response)

---

### VAPI Agent Shows as "Pending"

**Cause**: AI provisioning is asynchronous and may take 10-30 seconds.

**Solution**:
1. Wait 30 seconds
2. Query distributor record again:
   ```sql
   SELECT vapi_assistant_id, ai_phone_number
   FROM distributors
   WHERE id = 'xxx';
   ```
3. If still null, check application logs for provisioning errors

## Cleanup

### Manual Cleanup (If --cleanup Not Used)

```sql
-- Find test accounts
SELECT id, email, slug FROM distributors
WHERE email LIKE '%@apextest.local';

-- Delete test user (cascade will delete related records)
-- Use Supabase Dashboard > Authentication > Users
-- Or use service role key to delete via API
```

### Automatic Cleanup

When using `--cleanup` flag, the script will:
1. Delete auth user (cascade deletes distributor, member, tax info)
2. Delete VAPI assistant (releases phone number)

**Note**: Matrix placement adjustments may be needed if test user was placed in active tree.

## Best Practices

### Local Development Testing

✅ **DO**:
- Run tests frequently during development
- Use `--cleanup` to avoid database clutter
- Test both personal and business types
- Verify VAPI integration works

❌ **DON'T**:
- Run without cleaning up (database fills with test data)
- Test with production VAPI credentials in dev
- Skip verification steps

### Production Testing

✅ **DO**:
- Use `--prod --cleanup` flags together
- Test during low-traffic periods
- Verify VAPI phone numbers are released
- Document test runs

❌ **DON'T**:
- Run production tests without cleanup
- Test during peak hours
- Leave test data in production

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: E2E Signup Test

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  test-signup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - run: npm run test:signup -- --cleanup
        env:
          NEXT_PUBLIC_APP_URL: ${{ secrets.STAGING_URL }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          VAPI_API_KEY: ${{ secrets.VAPI_API_KEY }}
```

## Monitoring

### Success Metrics

- **Signup Success Rate**: Should be 100% with valid data
- **VAPI Provisioning Rate**: Should be >95% (some area codes unavailable)
- **Average Test Duration**: 15-30 seconds
- **Database Consistency**: All related records created

### Failure Alerts

Set up monitoring for:
- Signup API failures
- VAPI provisioning failures
- Database constraint violations
- Orphaned auth users (auth exists but no distributor)

## Additional Resources

- **Signup API Documentation**: `src/app/api/signup/route.ts`
- **VAPI Client Library**: `src/lib/vapi/client.ts`
- **Validation Schemas**: `src/lib/validations/signup.ts`
- **Database Schema**: `supabase/migrations/`

## Support

For issues or questions:
1. Check this documentation
2. Review application logs
3. Inspect database records manually
4. Contact development team

---

**Last Updated**: 2026-03-25
**Script Version**: 1.0.0
