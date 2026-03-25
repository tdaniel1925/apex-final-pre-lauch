import { createServiceClient } from '@/lib/supabase/service'

async function checkSoftDeletedUsers() {
  const supabase = createServiceClient()

  const testEmails = ['trenttdaniel@gmail.com', 'sellg.sb@gmail.com']

  console.log('=== CHECKING FOR SOFT-DELETED AUTH USERS ===\n')

  for (const email of testEmails) {
    console.log(`🔍 Checking: ${email}`)

    // Method 1: Try to find via getUserById (if we had the ID)
    // Method 2: Try to sign up and see what happens
    const { data, error } = await supabase.auth.signUp({
      email,
      password: 'TempPass123!',
    })

    if (error) {
      console.log(`   ⚠️  Auth Error: ${error.code}`)
      console.log(`   Message: ${error.message}`)

      if (error.code === 'user_already_exists' || error.message?.includes('already registered')) {
        console.log(`   🔴 SOFT-DELETED USER DETECTED!`)
        console.log(`   The user exists in auth but is marked for deletion.`)
        console.log(`   Supabase has a grace period before permanent deletion.`)
        console.log(`   You need to wait ~60 seconds or use a different email.\n`)
      }
    } else if (data.user) {
      console.log(`   ✅ User created successfully (was clean)`)
      console.log(`   Cleaning up test user...`)
      await supabase.auth.admin.deleteUser(data.user.id)
      console.log(`   ✅ Cleaned up\n`)
    }
  }

  console.log('=== SOLUTION ===')
  console.log('Option 1: Wait 60 seconds and try again')
  console.log('Option 2: Use different email addresses')
  console.log('Option 3: Add retry logic with exponential backoff\n')
}

checkSoftDeletedUsers().catch(console.error)
