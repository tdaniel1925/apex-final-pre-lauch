# Signup E2E Test - Quick Reference

## Quick Start

```bash
# Basic test (personal registration, no cleanup)
npm run test:signup

# Test with cleanup
npm run test:signup -- --cleanup

# Test business registration
npm run test:signup -- --type=business --cleanup

# Production test (ALWAYS use --cleanup in production)
npm run test:signup -- --prod --cleanup
```

## Command Options

| Flag | Description | Example |
|------|-------------|---------|
| `--cleanup` | Delete test data after test | `npm run test:signup -- --cleanup` |
| `--prod` | Test against production | `npm run test:signup -- --prod --cleanup` |
| `--type=business` | Test business registration | `npm run test:signup -- --type=business` |
| `--type=personal` | Test personal registration (default) | `npm run test:signup` |

## What Gets Tested

- ✅ Signup API validation
- ✅ Database record creation (auth, distributor, member, tax info)
- ✅ Matrix placement
- ✅ VAPI assistant creation
- ✅ Phone number provisioning
- ✅ Area code matching
- ✅ End-to-end verification

## Required Environment Variables

```bash
NEXT_PUBLIC_APP_URL="http://localhost:3050"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
VAPI_API_KEY="your-vapi-api-key"
```

## Test Data Generated

### Personal Registration
- First Name: `Test`
- Last Name: `UserXXX` (random)
- Email: `test-{timestamp}-{random}@apextest.local`
- Phone: `555XXXXXXX` (random)
- Password: `TestPass123!`
- SSN: `123-45-6789` (test SSN)
- DOB: `1990-01-15` (34 years old)

### Business Registration
- First Name: `Test`
- Last Name: `AgencyXXX` (random)
- Email: `test-{timestamp}-{random}@apextest.local`
- Company: `Test Agency LLC {timestamp}`
- Business Type: `LLC`
- EIN: `12-3456789` (test EIN)
- DBA: `Test Agency`

## Success Output

```
✅ All Tests Passed!

📊 Test Summary:
   ✅ Signup API: Success
   ✅ Distributor Record: Created
   ✅ Member Record: Created
   ✅ Matrix Placement: Position X
   ✅ VAPI Agent: Provisioned
   ✅ Phone Number: +1XXXXXXXXXX

🔑 Test Account Credentials:
   Email: test-xxx@apextest.local
   Password: TestPass123!
```

## Common Issues

| Error | Solution |
|-------|----------|
| `VAPI_API_KEY not set` | Add VAPI key to `.env.local` |
| `Too many requests` | Wait 15 minutes or disable rate limiting |
| `No numbers available` | Normal - VAPI tries nearby area codes |
| `Agent shows as Pending` | Wait 30 seconds - provisioning is async |

## Manual Verification

After test completes:

1. **Login**: Use credentials from test output
2. **Call Agent**: Call the phone number shown
3. **Check Dashboard**: Verify matrix position
4. **Inspect DB**: Query records in Supabase

## Cleanup

### With --cleanup Flag
- Automatically deletes all test data
- Removes auth user, distributor, member, VAPI agent

### Without --cleanup Flag
- Test data remains in database
- Manually delete via Supabase Dashboard
- Or run cleanup script later

## Best Practices

✅ **DO**:
- Use `--cleanup` in development
- Test both personal and business types
- Verify VAPI integration
- Run before deploying

❌ **DON'T**:
- Run production tests without `--cleanup`
- Skip verification steps
- Ignore failure messages

## Files

| File | Description |
|------|-------------|
| `scripts/test-signup-e2e.ts` | Main test script |
| `SIGNUP-E2E-TEST-GUIDE.md` | Full documentation |
| `SIGNUP-TEST-QUICK-REFERENCE.md` | This file |

## Next Steps

1. Run basic test: `npm run test:signup`
2. Verify output shows all checkmarks
3. Login with test credentials
4. Call VAPI phone number
5. Run with cleanup: `npm run test:signup -- --cleanup`

---

For full documentation, see `SIGNUP-E2E-TEST-GUIDE.md`
