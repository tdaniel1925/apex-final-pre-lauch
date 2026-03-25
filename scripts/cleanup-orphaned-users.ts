import { createServiceClient } from '@/lib/supabase/service'

async function cleanupOrphanedUsers() {
  const supabase = createServiceClient()

  console.log('=== ORPHANED AUTH USERS CLEANUP ===\n')

  // Get all auth users
  const { data, error } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error('Error listing users:', error)
    return
  }

  console.log(`Total auth users: ${data.users.length}`)

  const orphans: any[] = []

  // Find orphaned users
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

  console.log(`Orphaned users found: ${orphans.length}\n`)

  if (orphans.length === 0) {
    console.log('✅ No orphaned users to clean up!')
    return
  }

  console.log('🗑️  Starting deletion...\n')
  console.log('─'.repeat(100))

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < orphans.length; i++) {
    const user = orphans[i]
    const num = (i + 1).toString().padStart(3)

    process.stdout.write(`${num}. Deleting ${user.email}... `)

    try {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

      if (deleteError) {
        console.log(`❌ FAILED: ${deleteError.message}`)
        failCount++
      } else {
        console.log(`✅ DELETED`)
        successCount++
      }
    } catch (err: any) {
      console.log(`❌ ERROR: ${err.message}`)
      failCount++
    }
  }

  console.log('─'.repeat(100))
  console.log('\n=== CLEANUP SUMMARY ===')
  console.log(`  Total Orphaned Users: ${orphans.length}`)
  console.log(`  ✅ Successfully Deleted: ${successCount}`)
  console.log(`  ❌ Failed to Delete: ${failCount}`)
  console.log(`  Success Rate: ${((successCount / orphans.length) * 100).toFixed(1)}%`)

  // Verify cleanup
  console.log('\n🔍 Verifying cleanup...')
  const { data: postCleanupData } = await supabase.auth.admin.listUsers()

  if (postCleanupData) {
    const remainingOrphans: any[] = []

    for (const user of postCleanupData.users) {
      const { data: dist } = await supabase
        .from('distributors')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      if (!dist) {
        remainingOrphans.push(user)
      }
    }

    console.log(`\nRemaining orphaned users: ${remainingOrphans.length}`)
    console.log(`Total auth users after cleanup: ${postCleanupData.users.length}`)
    console.log(`Linked users: ${postCleanupData.users.length - remainingOrphans.length}`)

    if (remainingOrphans.length === 0) {
      console.log('\n✅ ALL ORPHANED USERS SUCCESSFULLY CLEANED UP!')
    } else {
      console.log('\n⚠️  Some orphaned users remain:')
      remainingOrphans.forEach((user, idx) => {
        console.log(`   ${idx + 1}. ${user.email}`)
      })
    }
  }

  console.log('\n=== CLEANUP COMPLETE ===\n')
}

cleanupOrphanedUsers().catch(console.error)
