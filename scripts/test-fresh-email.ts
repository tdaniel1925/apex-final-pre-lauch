import { createServiceClient } from '@/lib/supabase/service'

async function testFreshEmail() {
  const supabase = createServiceClient()

  const emails = [
    'trenttdaniel+test1@gmail.com',  // Gmail plus addressing
    'sellg.sb@gmail.com',            // Alternative email
  ]

  console.log('=== TESTING FRESH EMAILS ===\n')

  for (const email of emails) {
    console.log(`🔍 Testing: ${email}`)

    const { data, error } = await supabase.auth.signUp({
      email,
      password: 'TestPassword123!',
    })

    if (error) {
      console.log(`   ❌ BLOCKED: ${error.code}`)
      console.log(`   Message: ${error.message}`)
      console.log(`   Status: Still in grace period or already used\n`)
    } else if (data.user) {
      console.log(`   ✅ SUCCESS - Email is available!`)
      console.log(`   User ID: ${data.user.id}`)

      // Clean up immediately
      await supabase.auth.admin.deleteUser(data.user.id)
      console.log(`   🧹 Cleaned up test user\n`)
    }
  }

  console.log('=== RECOMMENDATION ===')
  console.log('Use whichever email showed ✅ SUCCESS above for your test signup.\n')
}

testFreshEmail().catch(console.error)
