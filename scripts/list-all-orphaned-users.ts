import { createServiceClient } from '@/lib/supabase/service'

async function listAllOrphanedUsers() {
  const supabase = createServiceClient()

  console.log('=== ALL ORPHANED AUTH USERS ===')
  console.log('Auth users without distributor records\n')

  // Get all auth users
  const { data, error } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error('Error listing users:', error)
    return
  }

  console.log(`Total auth users: ${data.users.length}`)

  const orphans: any[] = []

  // Check each user for distributor linkage
  for (const user of data.users) {
    const { data: dist } = await supabase
      .from('distributors')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!dist) {
      orphans.push(user)
    }
  }

  console.log(`Orphaned auth users: ${orphans.length}\n`)
  console.log('─'.repeat(120))

  // Sort by creation date (newest first)
  orphans.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  orphans.forEach((user, idx) => {
    const createdDate = new Date(user.created_at).toLocaleString()
    const confirmed = user.confirmed_at ? 'YES' : 'NO'
    const lastSignIn = user.last_sign_in_at
      ? new Date(user.last_sign_in_at).toLocaleString()
      : 'Never'

    console.log(`${(idx + 1).toString().padStart(3)}. ${user.email}`)
    console.log(`     Auth ID: ${user.id}`)
    console.log(`     Created: ${createdDate}`)
    console.log(`     Confirmed: ${confirmed}`)
    console.log(`     Last Sign In: ${lastSignIn}`)
    console.log()
  })

  console.log('─'.repeat(120))
  console.log(`\nSUMMARY:`)
  console.log(`  Total Auth Users: ${data.users.length}`)
  console.log(`  Orphaned Users: ${orphans.length}`)
  console.log(`  Linked Users: ${data.users.length - orphans.length}`)
  console.log(`  Percentage Orphaned: ${((orphans.length / data.users.length) * 100).toFixed(1)}%`)
}

listAllOrphanedUsers().catch(console.error)
