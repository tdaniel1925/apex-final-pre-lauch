# Signup E2E Test Script

## Quick Start

```bash
# Run the test
npm run test:signup

# Run with cleanup
npm run test:signup -- --cleanup

# Test business registration
npm run test:signup -- --type=business --cleanup
```

## What This Script Does

This script performs a complete end-to-end test of the signup process:

1. Generates realistic test data (personal or business)
2. Submits signup form via API
3. Waits for VAPI agent provisioning
4. Verifies all database records created
5. Verifies VAPI assistant and phone number
6. Provides test credentials for manual verification
7. Optionally cleans up all test data

## Command Options

| Flag | Description |
|------|-------------|
| `--cleanup` | Delete all test data after test completes |
| `--prod` | Test against production (requires NEXT_PUBLIC_APP_URL) |
| `--type=personal` | Test personal registration (default) |
| `--type=business` | Test business registration |

## Examples

```bash
# Basic test (leaves test data in database)
npm run test:signup

# Test with automatic cleanup
npm run test:signup -- --cleanup

# Test business registration with cleanup
npm run test:signup -- --type=business --cleanup

# Production test (ALWAYS use --cleanup)
npm run test:signup -- --prod --cleanup
```

## Required Environment Variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_APP_URL="http://localhost:3050"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
VAPI_API_KEY="your-vapi-api-key"
```

## Success Output

```
✅ All Tests Passed!

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
```

## Manual Verification

After test completes:

1. **Login**: Use email/password from output
2. **Dashboard**: Verify matrix position shown
3. **Call Agent**: Call the phone number to test VAPI
4. **Check Database**: Inspect records in Supabase

## Troubleshooting

### Common Issues

**"VAPI_API_KEY not set"**
- Add VAPI key to `.env.local`

**"Too many requests"**
- Rate limiting is active
- Wait 15 minutes or disable in dev mode

**"No numbers available in area code"**
- This is normal - VAPI will try nearby area codes
- Finally falls back to any US number

**"Agent shows as Pending"**
- VAPI provisioning is asynchronous
- Wait 30 seconds and query database again

## Documentation

- **Full Guide**: `SIGNUP-E2E-TEST-GUIDE.md`
- **Quick Reference**: `SIGNUP-TEST-QUICK-REFERENCE.md`
- **VAPI Troubleshooting**: `VAPI-TROUBLESHOOTING-GUIDE.md`
- **Summary**: `SIGNUP-E2E-TEST-SUMMARY.md`

## Code Structure

```typescript
// Generate test data
const testData = generatePersonalTestData()
// or
const testData = generateBusinessTestData()

// Submit signup
const result = await submitSignup(testData)

// Verify database records
await verifyDistributorRecord(distributorId)
await verifyMemberRecord(distributorId)

// Verify VAPI resources
await verifyVapiAgent(assistantId)
await verifyVapiPhoneNumber(phoneNumberId)

// Cleanup (if --cleanup flag)
await cleanupResources()
```

## Test Data Format

### Personal Registration
- Email: `test-{timestamp}-{random}@apextest.local`
- Password: `TestPass123!`
- SSN: `123-45-6789` (test SSN)
- DOB: `1990-01-15` (34 years old)
- Phone: `555XXXXXXX` (random)

### Business Registration
- Email: `test-{timestamp}-{random}@apextest.local`
- Password: `TestPass123!`
- Company: `Test Agency LLC {timestamp}`
- EIN: `12-3456789` (test EIN)
- Business Type: `LLC`

## Cleanup Behavior

**With `--cleanup` flag**:
- Deletes auth user (cascades to distributor, member, tax info)
- Deletes VAPI assistant (releases phone number)
- Removes all test data

**Without `--cleanup` flag**:
- Test data remains in database
- Useful for manual inspection
- Can be deleted later via Supabase Dashboard

## Best Practices

✅ **DO**:
- Run test before deploying
- Use `--cleanup` in development
- Test both personal and business types
- Verify VAPI phone works

❌ **DON'T**:
- Run production tests without `--cleanup`
- Skip manual verification
- Ignore error messages

## File Location

**Script**: `scripts/test-signup-e2e.ts`
**Docs**: Root directory markdown files

---

For detailed documentation, see `SIGNUP-E2E-TEST-GUIDE.md`
