import { createServiceClient } from '@/lib/supabase/service'

async function listDavidTownsend() {
  const supabase = createServiceClient()

  console.log('=== FINDING DAVID/TOWNSEND ===\n')

  const { data: people } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, slug, email')
    .or('first_name.ilike.%david%,last_name.ilike.%townsend%')

  if (!people || people.length === 0) {
    console.log('❌ No matches found')
    return
  }

  console.log(`Found ${people.length} matches:\n`)

  people.forEach((person, idx) => {
    console.log(`${idx + 1}. ${person.first_name} ${person.last_name}`)
    console.log(`   Slug: ${person.slug}`)
    console.log(`   Email: ${person.email}`)
    console.log(`   ID: ${person.id}`)
    console.log()
  })
}

listDavidTownsend().catch(console.error)
