# Quick Migration Reference

## What Changed?

### New Fields in Distributors Table
- `registration_type` - 'personal' or 'business'
- `business_type` - LLC, Corporation, etc. (for businesses)
- `tax_id_type` - 'ssn', 'ein', or 'itin'
- `date_of_birth` - For age verification
- `dba_name` - Doing Business As name
- `business_website` - Business website URL
- `phone` - Now REQUIRED (was optional)

### Updated Function
`create_distributor_atomic` now accepts 21 parameters (was 10-12)

## Business Rules

### Personal Registration
- Use `registration_type: 'personal'`
- Use `tax_id_type: 'ssn'` or `'itin'` (NOT 'ein')
- Phone required
- Address required (validated by form)

### Business Registration
- Use `registration_type: 'business'`
- Must provide `company_name` ✅
- Must provide `business_type` ✅
- Must use `tax_id_type: 'ein'` ✅
- Phone required
- Address required (validated by form)
- DBA and website optional

## API Usage

### Signup API Call Example (Personal)
```javascript
await supabase.rpc('create_distributor_atomic', {
  p_auth_user_id: user.id,
  p_first_name: 'John',
  p_last_name: 'Doe',
  p_email: 'john@example.com',
  p_slug: 'johndoe',
  p_phone: '555-123-4567',
  p_registration_type: 'personal',
  p_tax_id_type: 'ssn',
  p_date_of_birth: '1990-01-15',
  p_address_line1: '123 Main St',
  p_city: 'Austin',
  p_state: 'TX',
  p_zip: '78701'
});
```

### Signup API Call Example (Business)
```javascript
await supabase.rpc('create_distributor_atomic', {
  p_auth_user_id: user.id,
  p_first_name: 'Jane',
  p_last_name: 'Smith',
  p_email: 'jane@example.com',
  p_slug: 'janesmith',
  p_phone: '555-987-6543',
  p_company_name: 'Smith Enterprises LLC',
  p_registration_type: 'business',
  p_business_type: 'llc',
  p_tax_id_type: 'ein',
  p_dba_name: 'Smith & Co',
  p_business_website: 'https://smithenterprises.com',
  p_address_line1: '456 Business Blvd',
  p_address_line2: 'Suite 200',
  p_city: 'Dallas',
  p_state: 'TX',
  p_zip: '75201'
});
```

## Validation Errors

### "Business registrations must have a company_name"
- Solution: Provide `p_company_name` when `p_registration_type: 'business'`

### "Business registrations must have a business_type"
- Solution: Provide `p_business_type` ('llc', 'corporation', etc.)

### "Business registrations must use EIN"
- Solution: Set `p_tax_id_type: 'ein'` for business registrations

### "Personal registrations cannot use EIN"
- Solution: Use `p_tax_id_type: 'ssn'` or `'itin'` for personal registrations

## Testing

### Verify Column Exists
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'distributors' AND column_name = 'registration_type';
```

### Test Personal Insert
```sql
SELECT create_distributor_atomic(
  p_auth_user_id => '[your-auth-user-id]'::uuid,
  p_first_name => 'Test',
  p_last_name => 'User',
  p_email => 'test@example.com',
  p_slug => 'testuser',
  p_phone => '5551234567',
  p_registration_type => 'personal',
  p_tax_id_type => 'ssn',
  p_address_line1 => '123 Test St',
  p_city => 'Test City',
  p_state => 'TX',
  p_zip => '12345'
);
```

### Run Validation Tests
```bash
node scripts/test-signup-flow.js
```

## Quick Commands

```bash
# Verify migrations applied
node scripts/verify-migrations.js

# Test signup flow
node scripts/test-signup-flow.js

# Check database directly
psql $DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'distributors' AND column_name IN ('registration_type', 'business_type', 'tax_id_type');"
```

## Status: ✅ READY

All migrations applied. Database ready for signup testing.
