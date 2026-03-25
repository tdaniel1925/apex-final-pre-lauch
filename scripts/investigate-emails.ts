import { createServiceClient } from '@/lib/supabase/service'

async function investigateEmails() {
  const supabase = createServiceClient()

  const emails = [
    'trenttdaniel@gmail.com',
    'sellg.sb@gmail.com'
  ]

  console.log('=== EMAIL INVESTIGATION REPORT ===\n')

  for (const email of emails) {
    console.log(`\n🔍 Investigating: ${email}`)
    console.log('─'.repeat(60))

    // 1. Check distributors table
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, created_at, auth_user_id')
      .eq('email', email)
      .maybeSingle()

    console.log('\n1️⃣ DISTRIBUTORS TABLE:')
    if (distributor) {
      console.log(`   ✅ FOUND: ${distributor.first_name} ${distributor.last_name}`)
      console.log(`      ID: ${distributor.id}`)
      console.log(`      Auth User ID: ${distributor.auth_user_id}`)
      console.log(`      Created: ${distributor.created_at}`)
    } else {
      console.log(`   ❌ NOT FOUND`)
    }

    // 2. Check auth.users table
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id, email, created_at, deleted_at, confirmed_at')
      .eq('email', email)
      .maybeSingle()

    console.log('\n2️⃣ AUTH.USERS TABLE:')
    if (authUsers) {
      console.log(`   ✅ FOUND IN AUTH`)
      console.log(`      Auth ID: ${authUsers.id}`)
      console.log(`      Email: ${authUsers.email}`)
      console.log(`      Created: ${authUsers.created_at}`)
      console.log(`      Confirmed: ${authUsers.confirmed_at || 'Not confirmed'}`)
      console.log(`      Deleted: ${authUsers.deleted_at || 'Active'}`)

      // Check if this auth user has a distributor
      if (authUsers.id) {
        const { data: linkedDist } = await supabase
          .from('distributors')
          .select('id, first_name, last_name, email')
          .eq('auth_user_id', authUsers.id)
          .maybeSingle()

        console.log('\n   🔗 LINKED DISTRIBUTOR:')
        if (linkedDist) {
          console.log(`      ✅ Found: ${linkedDist.first_name} ${linkedDist.last_name} (${linkedDist.email})`)
        } else {
          console.log(`      ❌ ORPHANED AUTH RECORD - No distributor linked!`)
        }
      }
    } else {
      console.log(`   ❌ NOT FOUND`)
    }

    // 3. Check members table
    const { data: member } = await supabase
      .from('members')
      .select('id, email, first_name, last_name, distributor_id, created_at')
      .eq('email', email)
      .maybeSingle()

    console.log('\n3️⃣ MEMBERS TABLE:')
    if (member) {
      console.log(`   ✅ FOUND: ${member.first_name} ${member.last_name}`)
      console.log(`      Member ID: ${member.id}`)
      console.log(`      Distributor ID: ${member.distributor_id}`)
      console.log(`      Created: ${member.created_at}`)
    } else {
      console.log(`   ❌ NOT FOUND`)
    }

    console.log('\n' + '═'.repeat(60))
  }

  // 4. Check for all orphaned auth users (auth.users without distributors)
  console.log('\n\n🔍 CHECKING FOR ALL ORPHANED AUTH RECORDS...\n')

  const { data: allAuthUsers } = await supabase
    .from('auth.users')
    .select('id, email, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (allAuthUsers) {
    const orphans = []
    for (const authUser of allAuthUsers) {
      const { data: dist } = await supabase
        .from('distributors')
        .select('id')
        .eq('auth_user_id', authUser.id)
        .maybeSingle()

      if (!dist) {
        orphans.push(authUser)
      }
    }

    console.log(`Found ${orphans.length} orphaned auth records (last 50 checked):`)
    orphans.forEach((orphan, idx) => {
      console.log(`   ${idx + 1}. ${orphan.email} (${orphan.id}) - Created: ${new Date(orphan.created_at).toLocaleString()}`)
    })
  }

  console.log('\n\n=== END REPORT ===\n')
}

investigateEmails().catch(console.error)
