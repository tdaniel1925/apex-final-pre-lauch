# Signup E2E Test - Implementation Summary

## What Was Created

A comprehensive end-to-end testing system for the signup process and VAPI agent creation.

## Files Created

### 1. Main Test Script
**File**: `scripts/test-signup-e2e.ts`

Automated test script that:
- Generates realistic test data (personal or business)
- Submits signup via API
- Verifies all database records
- Verifies VAPI assistant and phone number
- Provides detailed output and error reporting
- Supports cleanup mode

**Command**: `npm run test:signup`

---

### 2. NPM Script
**File**: `package.json` (updated)

Added test script:
```json
"test:signup": "tsx scripts/test-signup-e2e.ts"
```

---

### 3. Comprehensive Documentation
**File**: `SIGNUP-E2E-TEST-GUIDE.md`

Full documentation including:
- Prerequisites and setup
- Usage examples
- Expected output
- Troubleshooting
- Integration with CI/CD
- Best practices

---

### 4. Quick Reference
**File**: `SIGNUP-TEST-QUICK-REFERENCE.md`

One-page quick reference with:
- Command syntax
- Common options
- Test data format
- Success indicators
- Common issues and solutions

---

### 5. VAPI Troubleshooting Guide
**File**: `VAPI-TROUBLESHOOTING-GUIDE.md`

VAPI-specific troubleshooting:
- VAPI integration flow
- Common VAPI issues
- Manual provisioning steps
- Health monitoring
- Error codes reference

---

## Usage Examples

### Basic Test (Personal)
```bash
npm run test:signup
```

### Business Registration with Cleanup
```bash
npm run test:signup -- --type=business --cleanup
```

### Production Test
```bash
npm run test:signup -- --prod --cleanup
```

## What Gets Tested

1. **Signup API** (`POST /api/signup`)
   - Request validation
   - Email/slug uniqueness
   - SSN/EIN encryption
   - Rate limiting

2. **Database Creation**
   - Auth user (`auth.users`)
   - Distributor record (`distributors`)
   - Member record (`members`)
   - Tax info (`distributor_tax_info`)
   - Matrix placement

3. **VAPI Provisioning** (`POST /api/signup/provision-ai`)
   - Assistant creation (GPT-4)
   - Phone number purchase
   - Area code matching
   - Database updates

4. **End-to-End Verification**
   - All records exist
   - VAPI assistant active
   - Phone number assigned
   - Trial minutes/expiry set

## Test Output Example

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

📤 Submitting signup form...
✅ Signup successful!

💾 Verifying distributor record...
   ✅ Distributor record found

💾 Verifying member record...
   ✅ Member record found

🤖 Verifying VAPI assistant...
   ✅ VAPI assistant found

📞 Verifying VAPI phone number...
   ✅ VAPI phone number found
   Phone Number: +12025551234

╔════════════════════════════════════════════════════════════╗
║                  ✅ All Tests Passed!                     ║
╚════════════════════════════════════════════════════════════╝

🔑 Test Account Credentials:
   Email: test-xxx@apextest.local
   Password: TestPass123!
```

## Key Features

### 1. Realistic Test Data
- Random emails using `@apextest.local` domain
- Test SSN: `123-45-6789`
- Test EIN: `12-3456789`
- Random phone numbers (555 area code)

### 2. Comprehensive Verification
- Database record existence
- VAPI API verification
- Phone number provisioning
- Trial minutes setup

### 3. Cleanup Support
- `--cleanup` flag deletes all test data
- Removes auth user, distributor, member
- Deletes VAPI assistant and phone number

### 4. Detailed Reporting
- Step-by-step progress
- Success/failure indicators
- Error messages with stack traces
- Test credentials for manual verification

## Environment Variables Required

```bash
# API URL
NEXT_PUBLIC_APP_URL="http://localhost:3050"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# VAPI
VAPI_API_KEY="your-vapi-api-key"
```

## Testing Workflow

1. **Run Test**
   ```bash
   npm run test:signup -- --cleanup
   ```

2. **Review Output**
   - Check all ✅ indicators
   - Note test credentials
   - Record VAPI phone number

3. **Manual Verification** (Optional)
   - Login with test credentials
   - Check dashboard display
   - Call VAPI phone number
   - Verify agent conversation

4. **Cleanup** (if not using --cleanup flag)
   - Delete test user via Supabase Dashboard
   - Or let test data remain for inspection

## Integration Points

### Tested APIs
- `POST /api/signup` - Main signup endpoint
- `POST /api/signup/provision-ai` - VAPI provisioning

### Database Tables
- `auth.users`
- `distributors`
- `members`
- `distributor_tax_info`

### External Services
- Supabase Auth
- Supabase Database
- VAPI (Voice AI Platform)
- Twilio (via VAPI for phone numbers)

## Common Use Cases

### Development Testing
```bash
# Quick test during development
npm run test:signup -- --cleanup

# Test business flow
npm run test:signup -- --type=business --cleanup
```

### Pre-Deployment Validation
```bash
# Test on staging
npm run test:signup -- --cleanup

# Verify VAPI integration
npm run test:signup
# (Then manually call the phone number)
```

### Production Smoke Test
```bash
# ALWAYS use --cleanup in production
npm run test:signup -- --prod --cleanup
```

## Error Handling

The test script handles:
- API validation errors
- Database constraint violations
- VAPI provisioning failures
- Network timeouts
- Missing environment variables

All errors include:
- Clear error message
- Stack trace (when available)
- Rollback/cleanup on failure

## Next Steps

1. **Run First Test**
   ```bash
   npm run test:signup
   ```

2. **Verify All Checkmarks Pass**

3. **Test Manual Login**
   - Use credentials from output
   - Verify dashboard access

4. **Test VAPI Agent**
   - Call phone number from output
   - Verify professional greeting
   - Ask questions about Apex

5. **Enable Cleanup**
   ```bash
   npm run test:signup -- --cleanup
   ```

## Additional Resources

- **Full Documentation**: `SIGNUP-E2E-TEST-GUIDE.md`
- **Quick Reference**: `SIGNUP-TEST-QUICK-REFERENCE.md`
- **VAPI Troubleshooting**: `VAPI-TROUBLESHOOTING-GUIDE.md`
- **Signup API Code**: `src/app/api/signup/route.ts`
- **VAPI Client**: `src/lib/vapi/client.ts`

## Support

For issues:
1. Check error message in test output
2. Review `VAPI-TROUBLESHOOTING-GUIDE.md`
3. Inspect database records manually
4. Review application logs
5. Contact development team

---

**Created**: 2026-03-25
**Script Version**: 1.0.0
**Status**: Ready for use
