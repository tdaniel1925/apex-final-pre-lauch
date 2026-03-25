/**
 * End-to-End Signup Test with VAPI Agent Creation
 *
 * This script tests the complete signup flow including:
 * - Personal/Business registration
 * - VAPI assistant creation
 * - Phone number provisioning
 * - Database record creation
 *
 * Usage:
 *   npm run test:signup              # Run test with temp data
 *   npm run test:signup -- --cleanup # Run test and cleanup after
 *   npm run test:signup -- --prod    # Test on production
 *   npm run test:signup -- --type=business # Test business registration
 */

import * as dotenv from 'dotenv'
import { createServiceClient } from '../src/lib/supabase/service'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050'
const VAPI_API_KEY = process.env.VAPI_API_KEY
const VAPI_BASE_URL = 'https://api.vapi.ai'

// Test configuration from CLI args
const args = process.argv.slice(2)
const shouldCleanup = args.includes('--cleanup')
const isProd = args.includes('--prod')
const registrationType = args.find(arg => arg.startsWith('--type='))?.split('=')[1] || 'personal'

// Track created resources for cleanup
const createdResources: {
  authUserId?: string
  distributorId?: string
  vapiAssistantId?: string
  vapiPhoneNumberId?: string
} = {}

// ========================================
// Test Data Generator
// ========================================

function generateTestEmail(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 7)
  return `test-${timestamp}-${random}@apextest.local`
}

function generateTestPhone(): string {
  // Generate random US phone number (555 area code for testing)
  const areaCode = '555'
  const exchange = Math.floor(Math.random() * 900) + 100
  const lineNumber = Math.floor(Math.random() * 9000) + 1000
  return `${areaCode}${exchange}${lineNumber}`
}

function generateTestSlug(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 7)
  return `test-${random}-${timestamp}`.toLowerCase()
}

function generatePersonalTestData() {
  const firstName = 'Test'
  const lastName = `User${Math.random().toString(36).substring(2, 5).toUpperCase()}`

  return {
    registration_type: 'personal' as const,
    first_name: firstName,
    last_name: lastName,
    email: generateTestEmail(),
    password: 'TestPass123!',
    slug: generateTestSlug(),
    phone: generateTestPhone(),
    address_line1: '123 Test Street',
    address_line2: '',
    city: 'Houston',
    state: 'TX',
    zip: '77001',
    licensing_status: 'non_licensed' as const,
    date_of_birth: '1990-01-15', // 34 years old
    ssn: '123-45-6789', // Test SSN
    company_name: '',
    sponsor_slug: '', // No sponsor for test
  }
}

function generateBusinessTestData() {
  const firstName = 'Test'
  const lastName = `Agency${Math.random().toString(36).substring(2, 5).toUpperCase()}`

  return {
    registration_type: 'business' as const,
    first_name: firstName,
    last_name: lastName,
    email: generateTestEmail(),
    password: 'TestPass123!',
    slug: generateTestSlug(),
    phone: generateTestPhone(),
    address_line1: '456 Business Blvd',
    address_line2: 'Suite 100',
    city: 'Dallas',
    state: 'TX',
    zip: '75201',
    licensing_status: 'licensed' as const,
    company_name: `Test Agency LLC ${Date.now()}`,
    business_type: 'llc' as const,
    ein: '12-3456789', // Test EIN
    dba_name: 'Test Agency',
    business_website: 'https://test-agency.example.com',
    sponsor_slug: '', // No sponsor for test
  }
}

// ========================================
// Test Functions
// ========================================

async function submitSignup(testData: any) {
  console.log('📤 Submitting signup form...')
  console.log(`   Type: ${testData.registration_type}`)
  console.log(`   Email: ${testData.email}`)
  console.log(`   Phone: ${testData.phone}`)

  const response = await fetch(`${API_BASE_URL}/api/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(`Signup failed: ${result.message || result.error || 'Unknown error'}`)
  }

  return result
}

async function verifyDistributorRecord(distributorId: string) {
  console.log('💾 Verifying distributor record...')

  const supabase = createServiceClient()

  const { data: distributor, error } = await supabase
    .from('distributors')
    .select('*')
    .eq('id', distributorId)
    .single()

  if (error || !distributor) {
    throw new Error(`Distributor record not found: ${error?.message}`)
  }

  console.log('   ✅ Distributor record found')
  console.log(`      - ID: ${distributor.id}`)
  console.log(`      - Slug: ${distributor.slug}`)
  console.log(`      - Email: ${distributor.email}`)
  console.log(`      - Matrix Position: ${distributor.matrix_position}`)
  console.log(`      - Matrix Depth: ${distributor.matrix_depth}`)

  return distributor
}

async function verifyMemberRecord(distributorId: string) {
  console.log('💾 Verifying member record...')

  const supabase = createServiceClient()

  const { data: member, error } = await supabase
    .from('members')
    .select('*')
    .eq('distributor_id', distributorId)
    .single()

  if (error || !member) {
    throw new Error(`Member record not found: ${error?.message}`)
  }

  console.log('   ✅ Member record found')
  console.log(`      - Member ID: ${member.member_id}`)
  console.log(`      - Status: ${member.status}`)
  console.log(`      - Tech Rank: ${member.tech_rank}`)

  return member
}

async function verifyVapiAgent(assistantId: string) {
  console.log('🤖 Verifying VAPI assistant...')

  if (!VAPI_API_KEY) {
    throw new Error('VAPI_API_KEY not set in environment')
  }

  const response = await fetch(`${VAPI_BASE_URL}/assistant/${assistantId}`, {
    headers: {
      'Authorization': `Bearer ${VAPI_API_KEY}`,
    },
  })

  if (!response.ok) {
    throw new Error(`VAPI assistant not found: ${response.statusText}`)
  }

  const assistant = await response.json()

  console.log('   ✅ VAPI assistant found')
  console.log(`      - Assistant ID: ${assistant.id}`)
  console.log(`      - Name: ${assistant.name}`)

  return assistant
}

async function verifyVapiPhoneNumber(phoneNumberId: string) {
  console.log('📞 Verifying VAPI phone number...')

  if (!VAPI_API_KEY) {
    throw new Error('VAPI_API_KEY not set in environment')
  }

  const response = await fetch(`${VAPI_BASE_URL}/phone-number/${phoneNumberId}`, {
    headers: {
      'Authorization': `Bearer ${VAPI_API_KEY}`,
    },
  })

  if (!response.ok) {
    throw new Error(`VAPI phone number not found: ${response.statusText}`)
  }

  const phoneNumber = await response.json()

  console.log('   ✅ VAPI phone number found')
  console.log(`      - Phone Number: ${phoneNumber.number}`)
  console.log(`      - Provider: ${phoneNumber.provider}`)

  return phoneNumber
}

async function cleanupResources() {
  if (!shouldCleanup) {
    console.log('\n⚠️  Skipping cleanup (use --cleanup flag to cleanup after test)')
    return
  }

  console.log('\n🧹 Cleaning up test resources...')

  const supabase = createServiceClient()

  try {
    // Delete auth user (cascade will delete distributor, member, etc.)
    if (createdResources.authUserId) {
      console.log('   Deleting auth user...')
      await supabase.auth.admin.deleteUser(createdResources.authUserId)
      console.log('   ✅ Auth user deleted')
    }

    // Delete VAPI assistant (will also delete associated phone number)
    if (createdResources.vapiAssistantId && VAPI_API_KEY) {
      console.log('   Deleting VAPI assistant...')
      await fetch(`${VAPI_BASE_URL}/assistant/${createdResources.vapiAssistantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
        },
      })
      console.log('   ✅ VAPI assistant deleted')
    }

    console.log('✅ Cleanup complete')
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
  }
}

// ========================================
// Main Test Runner
// ========================================

async function runTest() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║       🧪 End-to-End Signup Test with VAPI Agent          ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  console.log('')

  // Show configuration
  console.log('📋 Test Configuration:')
  console.log(`   Environment: ${isProd ? 'PRODUCTION' : 'LOCAL/STAGING'}`)
  console.log(`   API URL: ${API_BASE_URL}`)
  console.log(`   Registration Type: ${registrationType}`)
  console.log(`   Cleanup After: ${shouldCleanup ? 'YES' : 'NO'}`)
  console.log('')

  try {
    // Step 1: Generate test data
    console.log('📝 Generating test data...')
    const testData = registrationType === 'business'
      ? generateBusinessTestData()
      : generatePersonalTestData()

    console.log(`   ✅ Test data generated`)
    console.log(`      - Name: ${testData.first_name} ${testData.last_name}`)
    console.log(`      - Email: ${testData.email}`)
    console.log(`      - Phone: ${testData.phone}`)
    console.log(`      - Slug: ${testData.slug}`)
    if (registrationType === 'business') {
      console.log(`      - Company: ${testData.company_name}`)
    }
    console.log('')

    // Step 2: Submit signup
    const signupResult = await submitSignup(testData)

    if (!signupResult.success) {
      throw new Error(`Signup failed: ${signupResult.message}`)
    }

    console.log('✅ Signup successful!')
    console.log(`   Distributor ID: ${signupResult.data.distributor.id}`)
    console.log(`   AI Phone Provisioned: ${signupResult.data.aiPhoneProvisioned ? 'YES' : 'NO'}`)
    console.log('')

    // Store IDs for cleanup
    createdResources.distributorId = signupResult.data.distributor.id
    createdResources.authUserId = signupResult.data.distributor.auth_user_id

    // Step 3: Verify distributor record
    const distributor = await verifyDistributorRecord(signupResult.data.distributor.id)
    console.log('')

    // Step 4: Verify member record
    await verifyMemberRecord(signupResult.data.distributor.id)
    console.log('')

    // Step 5: Verify VAPI agent (if provisioned)
    if (distributor.vapi_assistant_id) {
      createdResources.vapiAssistantId = distributor.vapi_assistant_id
      await verifyVapiAgent(distributor.vapi_assistant_id)
      console.log('')

      // Step 6: Verify VAPI phone number
      if (distributor.vapi_phone_number_id) {
        createdResources.vapiPhoneNumberId = distributor.vapi_phone_number_id
        const phoneNumber = await verifyVapiPhoneNumber(distributor.vapi_phone_number_id)
        console.log('')

        // Show test call instructions
        console.log('📞 Test Call Instructions:')
        console.log(`   Call ${phoneNumber.number} to test the AI agent`)
        console.log(`   Expected: Professional greeting and information about Apex Affinity Group`)
        console.log('')
      }
    } else {
      console.log('⚠️  VAPI agent not provisioned (async process may still be running)')
      console.log('   Check distributor record in 30 seconds for agent details')
      console.log('')
    }

    // Step 7: Summary
    console.log('╔════════════════════════════════════════════════════════════╗')
    console.log('║                  ✅ All Tests Passed!                     ║')
    console.log('╚════════════════════════════════════════════════════════════╝')
    console.log('')
    console.log('📊 Test Summary:')
    console.log(`   ✅ Signup API: Success`)
    console.log(`   ✅ Distributor Record: Created`)
    console.log(`   ✅ Member Record: Created`)
    console.log(`   ✅ Matrix Placement: Position ${distributor.matrix_position || 'N/A'}`)
    console.log(`   ${distributor.vapi_assistant_id ? '✅' : '⏳'} VAPI Agent: ${distributor.vapi_assistant_id ? 'Provisioned' : 'Pending'}`)
    console.log(`   ${distributor.ai_phone_number ? '✅' : '⏳'} Phone Number: ${distributor.ai_phone_number || 'Pending'}`)
    console.log('')

    // Show credentials
    console.log('🔑 Test Account Credentials:')
    console.log(`   Email: ${testData.email}`)
    console.log(`   Password: ${testData.password}`)
    console.log(`   Login URL: ${API_BASE_URL}/login`)
    console.log(`   Dashboard: ${API_BASE_URL}/dashboard`)
    console.log('')

  } catch (error: any) {
    console.error('\n❌ Test Failed!')
    console.error(`   Error: ${error.message}`)
    if (error.stack) {
      console.error(`\n   Stack Trace:`)
      console.error(error.stack)
    }

    // Cleanup on failure
    await cleanupResources()

    process.exit(1)
  }

  // Cleanup on success (if requested)
  await cleanupResources()
}

// Run the test
runTest()
  .then(() => {
    console.log('✅ Test completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test runner error:', error)
    process.exit(1)
  })
