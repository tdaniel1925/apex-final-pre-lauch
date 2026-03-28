import { createServiceClient } from '@/lib/supabase/service'

async function forceCleanupEmail() {
  const supabase = createServiceClient()
  const email = 'trenttdaniel@gmail.com'

  console.log('=== FORCE CLEANUP FOR EMAIL ===')
  console.log(`Email: ${email}\n`)

  // Step 1: Try to create auth user to see current status
  console.log('1️⃣ Testing if email is available...')
  const { data: testSignup, error: testError } = await supabase.auth.signUp({
    email,
    password: 'TempTest123!',
  })

  if (testError) {
    console.log(`   ❌ Error: ${testError.code}`)
    console.log(`   Message: ${testError.message}`)

    if (testError.code === 'user_already_exists') {
      console.log(`   🔴 User still exists (soft-deleted or active)\n`)

      // Try to find in listUsers
      console.log('2️⃣ Searching in listUsers()...')
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const foundUser = users?.find(u => u.email === email)

      if (foundUser) {
        console.log(`   ✅ Found user: ${foundUser.id}`)
        console.log(`   Created: ${foundUser.created_at}`)
        console.log(`   Deleted: ${foundUser.deleted_at || 'Not deleted'}`)

        console.log('\n3️⃣ Attempting to delete user...')
        const { error: deleteError } = await supabase.auth.admin.deleteUser(foundUser.id)

        if (deleteError) {
          console.log(`   ❌ Delete failed: ${deleteError.message}`)
        } else {
          console.log(`   ✅ User deleted successfully!`)
          console.log(`   ⚠️  Wait 2-3 minutes before trying again (Supabase grace period)`)
        }
      } else {
        console.log(`   ❌ User NOT found in listUsers()`)
        console.log(`   This means the user is in grace period (soft-deleted)`)
        console.log(`   Supabase Auth grace period can be 2-5 minutes`)
        console.log(`\n   💡 SOLUTIONS:`)
        console.log(`   1. Wait 3-5 more minutes`)
        console.log(`   2. Use: trenttdaniel+test1@gmail.com (Gmail ignores +suffix)`)
        console.log(`   3. Use: sellg.sb@gmail.com`)
      }
    }
  } else if (testSignup.user) {
    console.log(`   ✅ Email is available! User created successfully`)
    console.log(`   User ID: ${testSignup.user.id}`)
    console.log('\n   Cleaning up test user...')
    await supabase.auth.admin.deleteUser(testSignup.user.id)
    console.log(`   ✅ Test user cleaned up`)
    console.log(`\n   🎉 EMAIL IS NOW AVAILABLE FOR SIGNUP!`)
  }

  console.log('\n=== END ===\n')
}

forceCleanupEmail().catch(console.error)
