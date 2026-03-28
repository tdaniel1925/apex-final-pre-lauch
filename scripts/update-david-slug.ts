import { createServiceClient } from '@/lib/supabase/service'

async function updateDavidSlug() {
  const supabase = createServiceClient()

  console.log('=== UPDATING DAVID TOWNSEND SLUG ===\n')

  // Find David Townsend by ID
  console.log('1️⃣ Finding David Townsend...')
  const { data: david, error: findError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, slug, email')
    .eq('id', '698483b5-d53c-42bc-8a26-5815cbd31436')
    .single()

  if (findError || !david) {
    console.log('   ❌ Could not find David Townsend')
    console.log('   Error:', findError)
    return
  }

  console.log(`   ✅ Found: ${david.first_name} ${david.last_name}`)
  console.log(`   Current slug: ${david.slug}`)
  console.log(`   Email: ${david.email}`)
  console.log(`   ID: ${david.id}\n`)

  // Check if new slug is available
  console.log('2️⃣ Checking if "david.leslie" is available...')
  const { data: existingSlug } = await supabase
    .from('distributors')
    .select('id, slug')
    .eq('slug', 'david.leslie')
    .single()

  if (existingSlug) {
    console.log('   ❌ Slug "david.leslie" is already taken!')
    console.log('   Taken by distributor ID:', existingSlug.id)
    return
  }

  console.log('   ✅ Slug "david.leslie" is available\n')

  // Update the slug
  console.log('3️⃣ Updating slug...')
  const { error: updateError } = await supabase
    .from('distributors')
    .update({ slug: 'david.leslie' })
    .eq('id', david.id)

  if (updateError) {
    console.log('   ❌ Failed to update slug')
    console.log('   Error:', updateError)
    return
  }

  console.log('   ✅ Slug updated successfully!\n')

  // Verify the update
  console.log('4️⃣ Verifying update...')
  const { data: updated } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, slug')
    .eq('id', david.id)
    .single()

  if (updated) {
    console.log(`   ✅ Verified: ${updated.first_name} ${updated.last_name}`)
    console.log(`   New slug: ${updated.slug}`)
    console.log(`   Replicated site: ${process.env.NEXT_PUBLIC_APP_URL}/${updated.slug}`)
  }

  console.log('\n✅ SLUG UPDATE COMPLETE!\n')
}

updateDavidSlug().catch(console.error)
