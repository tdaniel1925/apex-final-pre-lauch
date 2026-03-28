import { createServiceClient } from '@/lib/supabase/service'

async function debugSignup() {
  const supabase = createServiceClient()

  const testData = {
    email: 'trenttdaniel@gmail.com',
    password: 'TestPass123!',
    first_name: 'Trent',
    last_name: 'Daniel',
    slug: 'trent-daniel-test',
    phone: '214-555-1234',
    address_line1: '123 Test St',
    city: 'Dallas',
    state: 'TX',
    zip: '75001',
    registration_type: 'personal',
    birth_month: '01',
    birth_day: '15',
    birth_year: '1990',
    ssn: '123-45-6789',
    bio: 'I am a test user for debugging the voice agent system.',
  }

  console.log('=== SIGNUP DEBUG ===\n')
  console.log('Test Data:', JSON.stringify(testData, null, 2))
  console.log('\n' + '─'.repeat(80) + '\n')

  // Step 1: Check if email already exists in distributors
  console.log('1️⃣ Checking if email exists in distributors...')
  const { data: existingDist } = await supabase
    .from('distributors')
    .select('email')
    .eq('email', testData.email)
    .single()

  if (existingDist) {
    console.log('   ❌ Email already exists in distributors table')
    return
  }
  console.log('   ✅ Email not in distributors\n')

  // Step 2: Check if email exists in auth
  console.log('2️⃣ Checking if email exists in auth...')
  const { data: authData } = await supabase.auth.admin.listUsers()
  const existingAuth = authData?.users.find(u => u.email === testData.email)

  if (existingAuth) {
    console.log('   ⚠️  Email exists in auth system (orphaned)')
    console.log('   Auth ID:', existingAuth.id)
    console.log('   Cleaning up...')
    await supabase.auth.admin.deleteUser(existingAuth.id)
    console.log('   ✅ Orphaned auth user deleted\n')
  } else {
    console.log('   ✅ Email not in auth system\n')
  }

  // Step 3: Check slug availability
  console.log('3️⃣ Checking slug availability...')
  const { data: existingSlug } = await supabase
    .from('distributors')
    .select('slug')
    .eq('slug', testData.slug)
    .single()

  if (existingSlug) {
    console.log('   ❌ Slug already taken')
    return
  }
  console.log('   ✅ Slug available\n')

  // Step 4: Get master distributor (sponsor)
  console.log('4️⃣ Getting master distributor...')
  const { data: masterDist } = await supabase
    .from('distributors')
    .select('id')
    .eq('is_master', true)
    .single()

  if (!masterDist) {
    console.log('   ❌ Master distributor not found!')
    return
  }
  console.log('   ✅ Master distributor:', masterDist.id, '\n')

  // Step 5: Create auth user
  console.log('5️⃣ Creating auth user...')
  const { data: authResult, error: authError } = await supabase.auth.signUp({
    email: testData.email,
    password: testData.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      data: {
        first_name: testData.first_name,
        last_name: testData.last_name,
      },
    },
  })

  if (authError || !authResult.user) {
    console.log('   ❌ Auth user creation failed!')
    console.error('   Error:', authError)
    return
  }
  console.log('   ✅ Auth user created:', authResult.user.id, '\n')

  // Step 6: Call atomic function to create distributor
  console.log('6️⃣ Creating distributor via atomic function...')
  console.log('   Calling create_distributor_atomic with:')
  console.log('   - p_bio:', testData.bio)

  const { data: distributorRows, error: distributorError } = await supabase.rpc(
    'create_distributor_atomic',
    {
      p_auth_user_id: authResult.user.id,
      p_first_name: testData.first_name,
      p_last_name: testData.last_name,
      p_email: testData.email,
      p_slug: testData.slug,
      p_sponsor_id: masterDist.id,
      p_phone: testData.phone,
      p_licensing_status: 'non_licensed',
      p_registration_type: testData.registration_type,
      p_ssn: testData.ssn,
      p_birth_date: `${testData.birth_year}-${testData.birth_month}-${testData.birth_day}`,
      p_address_line1: testData.address_line1,
      p_address_line2: '',
      p_city: testData.city,
      p_state: testData.state,
      p_zip: testData.zip,
      p_bio: testData.bio || null, // NEW: Bio parameter
    }
  )

  if (distributorError) {
    console.log('   ❌ DISTRIBUTOR CREATION FAILED!')
    console.error('   Error:', distributorError)
    console.error('   Code:', distributorError.code)
    console.error('   Message:', distributorError.message)
    console.error('   Details:', distributorError.details)
    console.error('   Hint:', distributorError.hint)

    // Clean up auth user
    console.log('\n   🧹 Cleaning up orphaned auth user...')
    await supabase.auth.admin.deleteUser(authResult.user.id)
    console.log('   ✅ Auth user deleted\n')

    console.log('🔴 ROOT CAUSE: Distributor atomic function is failing')
    console.log('   This is why you keep getting orphaned auth users!\n')
    return
  }

  console.log('   ✅ Distributor created successfully!')
  console.log('   Distributor ID:', (distributorRows as any)?.id)
  console.log('\n✅ SIGNUP SUCCESSFUL!\n')
}

debugSignup().catch(console.error)
