import { createServiceClient } from '@/lib/supabase/service'

async function checkAuthUsers() {
  const supabase = createServiceClient()

  const emails = [
    'trenttdaniel@gmail.com',
    'sellg.sb@gmail.com'
  ]

  console.log('=== CHECKING SUPABASE AUTH ADMIN API ===\n')

  // Use admin API to list users
  const { data, error } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error('Error listing users:', error)
    return
  }

  console.log(`Total users in system: ${data.users.length}\n`)

  for (const email of emails) {
    console.log(`🔍 Searching for: ${email}`)

    const user = data.users.find(u => u.email === email)

    if (user) {
      console.log(`   ✅ FOUND IN AUTH SYSTEM`)
      console.log(`      Auth ID: ${user.id}`)
      console.log(`      Email: ${user.email}`)
      console.log(`      Created: ${user.created_at}`)
      console.log(`      Confirmed: ${user.confirmed_at || 'NOT CONFIRMED'}`)
      console.log(`      Last Sign In: ${user.last_sign_in_at || 'Never'}`)
      console.log(`      Deleted: ${user.deleted_at || 'Active'}`)

      // Check if linked to distributor
      const { data: dist } = await supabase
        .from('distributors')
        .select('id, first_name, last_name, email')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      if (dist) {
        console.log(`      🔗 Linked to distributor: ${dist.first_name} ${dist.last_name}`)
      } else {
        console.log(`      ⚠️  ORPHANED - No distributor record!`)
      }
    } else {
      console.log(`   ❌ NOT FOUND`)
    }
    console.log()
  }

  // List all orphaned auth users
  console.log('\n=== ALL ORPHANED AUTH USERS ===\n')
  let orphanCount = 0

  for (const user of data.users) {
    const { data: dist } = await supabase
      .from('distributors')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!dist) {
      orphanCount++
      console.log(`${orphanCount}. ${user.email} (${user.id})`)
      console.log(`   Created: ${user.created_at}`)
      console.log(`   Confirmed: ${user.confirmed_at || 'NOT CONFIRMED'}`)
      console.log()
    }
  }

  if (orphanCount === 0) {
    console.log('✅ No orphaned auth users found!')
  } else {
    console.log(`⚠️  Found ${orphanCount} orphaned auth users`)
  }
}

checkAuthUsers().catch(console.error)
