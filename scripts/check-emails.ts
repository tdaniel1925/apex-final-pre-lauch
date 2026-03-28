import { createServiceClient } from '@/lib/supabase/service'

async function checkEmails() {
  const supabase = createServiceClient()

  const emails = [
    'trenttdaniel@gmail.com',
    'tdaniel@bundlefly.com',
    'sellg.sb@gmail.com'
  ]

  console.log('=== EMAIL LOOKUP ===\n')

  for (const email of emails) {
    const { data: distributor, error } = await supabase
      .from('distributors')
      .select(`
        id,
        first_name,
        last_name,
        slug,
        email,
        phone,
        current_rank,
        business_center_tier,
        ai_phone_number,
        bio,
        first_call_completed,
        created_at
      `)
      .eq('email', email)
      .single()

    if (error || !distributor) {
      console.log(`❌ ${email}: NOT FOUND\n`)
    } else {
      console.log(`✅ ${email}:`)
      console.log(`   Name: ${distributor.first_name} ${distributor.last_name}`)
      console.log(`   Slug: ${distributor.slug}`)
      console.log(`   Phone: ${distributor.phone || 'N/A'}`)
      console.log(`   Rank: ${distributor.current_rank || 'starter'}`)
      console.log(`   Tier: ${distributor.business_center_tier || 'free'}`)
      console.log(`   AI Phone: ${distributor.ai_phone_number || 'Not provisioned'}`)
      console.log(`   Bio: ${distributor.bio ? distributor.bio.substring(0, 80) + '...' : 'None'}`)
      console.log(`   First Call Done: ${distributor.first_call_completed ? 'Yes' : 'No'}`)
      console.log(`   Joined: ${new Date(distributor.created_at).toLocaleDateString()}`)
      console.log()
    }
  }
}

checkEmails().catch(console.error)
