/**
 * SIGNUP FLOW TEST SCRIPT
 * Tests both personal and business registration flows
 * Run with: node scripts/test-signup-flow.js
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

// Test data
const testAuthUserId = '00000000-0000-0000-0000-000000000001';

async function testPersonalRegistration(client) {
  console.log('\n📋 TEST 1: PERSONAL REGISTRATION');
  console.log('==================================');

  try {
    // Generate unique slug
    const slug = `test-personal-${Date.now()}`;

    const result = await client.query(`
      SELECT create_distributor_atomic(
        p_auth_user_id => $1::uuid,
        p_first_name => $2,
        p_last_name => $3,
        p_email => $4,
        p_slug => $5,
        p_phone => $6,
        p_registration_type => $7,
        p_tax_id_type => $8,
        p_date_of_birth => $9,
        p_address_line1 => $10,
        p_city => $11,
        p_state => $12,
        p_zip => $13
      ) AS distributor;
    `, [
      testAuthUserId,
      'John',
      'Doe',
      `john.doe.${Date.now()}@example.com`,
      slug,
      '555-123-4567',
      'personal',
      'ssn',
      '1990-01-15',
      '123 Main St',
      'Austin',
      'TX',
      '78701'
    ]);

    console.log('✅ Personal registration successful!');
    console.log('   Details:');
    const dist = result.rows[0].distributor;
    console.log(`   - ID: ${dist.id}`);
    console.log(`   - Name: ${dist.first_name} ${dist.last_name}`);
    console.log(`   - Email: ${dist.email}`);
    console.log(`   - Slug: ${dist.slug}`);
    console.log(`   - Registration Type: ${dist.registration_type}`);
    console.log(`   - Tax ID Type: ${dist.tax_id_type}`);
    console.log(`   - Date of Birth: ${dist.date_of_birth}`);
    console.log(`   - Phone: ${dist.phone}`);
    console.log(`   - Address: ${dist.address_line1}, ${dist.city}, ${dist.state} ${dist.zip}`);

    // Clean up test data
    await client.query('DELETE FROM distributors WHERE slug = $1', [slug]);
    console.log('   🧹 Test data cleaned up');

    return true;
  } catch (error) {
    console.error('❌ Personal registration failed:', error.message);
    return false;
  }
}

async function testBusinessRegistration(client) {
  console.log('\n📋 TEST 2: BUSINESS REGISTRATION');
  console.log('==================================');

  try {
    // Generate unique slug
    const slug = `test-business-${Date.now()}`;

    const result = await client.query(`
      SELECT create_distributor_atomic(
        p_auth_user_id => $1::uuid,
        p_first_name => $2,
        p_last_name => $3,
        p_email => $4,
        p_slug => $5,
        p_phone => $6,
        p_company_name => $7,
        p_registration_type => $8,
        p_business_type => $9,
        p_tax_id_type => $10,
        p_dba_name => $11,
        p_business_website => $12,
        p_address_line1 => $13,
        p_address_line2 => $14,
        p_city => $15,
        p_state => $16,
        p_zip => $17
      ) AS distributor;
    `, [
      testAuthUserId,
      'Jane',
      'Smith',
      `jane.smith.${Date.now()}@example.com`,
      slug,
      '555-987-6543',
      'Smith Enterprises LLC',
      'business',
      'llc',
      'ein',
      'Smith & Co',
      'https://smithenterprises.com',
      '456 Business Blvd',
      'Suite 200',
      'Dallas',
      'TX',
      '75201'
    ]);

    console.log('✅ Business registration successful!');
    console.log('   Details:');
    const dist = result.rows[0].distributor;
    console.log(`   - ID: ${dist.id}`);
    console.log(`   - Name: ${dist.first_name} ${dist.last_name}`);
    console.log(`   - Email: ${dist.email}`);
    console.log(`   - Slug: ${dist.slug}`);
    console.log(`   - Company: ${dist.company_name}`);
    console.log(`   - DBA: ${dist.dba_name || 'N/A'}`);
    console.log(`   - Registration Type: ${dist.registration_type}`);
    console.log(`   - Business Type: ${dist.business_type}`);
    console.log(`   - Tax ID Type: ${dist.tax_id_type}`);
    console.log(`   - Website: ${dist.business_website || 'N/A'}`);
    console.log(`   - Phone: ${dist.phone}`);
    console.log(`   - Address: ${dist.address_line1}, ${dist.address_line2 || ''}`);
    console.log(`              ${dist.city}, ${dist.state} ${dist.zip}`);

    // Clean up test data
    await client.query('DELETE FROM distributors WHERE slug = $1', [slug]);
    console.log('   🧹 Test data cleaned up');

    return true;
  } catch (error) {
    console.error('❌ Business registration failed:', error.message);
    return false;
  }
}

async function testValidationErrors(client) {
  console.log('\n📋 TEST 3: VALIDATION ERROR HANDLING');
  console.log('=====================================');

  let passed = 0;
  let failed = 0;

  // Test 1: Business without company_name
  console.log('\n  Test 3a: Business without company_name (should fail)');
  try {
    await client.query(`
      SELECT create_distributor_atomic(
        p_auth_user_id => $1::uuid,
        p_first_name => 'Test',
        p_last_name => 'User',
        p_email => 'test@example.com',
        p_slug => 'test-no-company',
        p_phone => '5551234567',
        p_registration_type => 'business',
        p_tax_id_type => 'ein'
      ) AS distributor;
    `, [testAuthUserId]);

    console.log('    ❌ FAILED - Should have thrown error for missing company_name');
    failed++;
  } catch (error) {
    if (error.message.includes('company_name')) {
      console.log('    ✅ PASSED - Correctly rejected business without company_name');
      passed++;
    } else {
      console.log(`    ❌ FAILED - Wrong error: ${error.message}`);
      failed++;
    }
  }

  // Test 2: Business without business_type
  console.log('\n  Test 3b: Business without business_type (should fail)');
  try {
    await client.query(`
      SELECT create_distributor_atomic(
        p_auth_user_id => $1::uuid,
        p_first_name => 'Test',
        p_last_name => 'User',
        p_email => 'test2@example.com',
        p_slug => 'test-no-biztype',
        p_phone => '5551234567',
        p_company_name => 'Test Company',
        p_registration_type => 'business',
        p_tax_id_type => 'ein'
      ) AS distributor;
    `, [testAuthUserId]);

    console.log('    ❌ FAILED - Should have thrown error for missing business_type');
    failed++;
  } catch (error) {
    if (error.message.includes('business_type')) {
      console.log('    ✅ PASSED - Correctly rejected business without business_type');
      passed++;
    } else {
      console.log(`    ❌ FAILED - Wrong error: ${error.message}`);
      failed++;
    }
  }

  // Test 3: Personal with EIN (should fail)
  console.log('\n  Test 3c: Personal registration with EIN (should fail)');
  try {
    await client.query(`
      SELECT create_distributor_atomic(
        p_auth_user_id => $1::uuid,
        p_first_name => 'Test',
        p_last_name => 'User',
        p_email => 'test3@example.com',
        p_slug => 'test-personal-ein',
        p_phone => '5551234567',
        p_registration_type => 'personal',
        p_tax_id_type => 'ein'
      ) AS distributor;
    `, [testAuthUserId]);

    console.log('    ❌ FAILED - Should have thrown error for personal with EIN');
    failed++;
  } catch (error) {
    if (error.message.includes('ein') || error.message.includes('Personal')) {
      console.log('    ✅ PASSED - Correctly rejected personal registration with EIN');
      passed++;
    } else {
      console.log(`    ❌ FAILED - Wrong error: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n  Summary: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

async function main() {
  console.log('🧪 SIGNUP FLOW TEST SUITE');
  console.log('=========================\n');

  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Run tests
    const test1 = await testPersonalRegistration(client);
    const test2 = await testBusinessRegistration(client);
    const test3 = await testValidationErrors(client);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUITE SUMMARY');
    console.log('='.repeat(60));
    console.log(`${test1 ? '✅' : '❌'} Personal Registration Test`);
    console.log(`${test2 ? '✅' : '❌'} Business Registration Test`);
    console.log(`${test3 ? '✅' : '❌'} Validation Error Test`);

    if (test1 && test2 && test3) {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('🚦 Signup flow is ready for production use.');
      process.exit(0);
    } else {
      console.log('\n⚠️  SOME TESTS FAILED');
      console.log('Review errors above and fix issues before deploying.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 FATAL ERROR:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
