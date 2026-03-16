/**
 * List Apex Distributors
 * Shows all distributors with phone numbers for AgentOS sync
 */

import dotenv from 'dotenv'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function listDistributors() {
  console.log('📋 Listing Apex Distributors\n')

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  const result: any = await (supabase as any)
    .from('distributors')
    .select('id, first_name, last_name, email, phone, affiliate_code, business_center_tier, is_admin, created_at')
    .order('created_at', { ascending: false })

  if (result.error) {
    console.error('❌ Error:', result.error)
    return
  }

  console.log(`Total distributors: ${result.data?.length || 0}\n`)

  if (result.data && result.data.length > 0) {
    console.log('Distributors with phone numbers:\n')

    const withPhone = result.data.filter((d: any) => d.phone)

    withPhone.forEach((d: any) => {
      console.log(`📱 ${d.first_name} ${d.last_name}`)
      console.log(`   Email: ${d.email}`)
      console.log(`   Phone: ${d.phone}`)
      console.log(`   Affiliate Code: ${d.affiliate_code}`)
      console.log(`   Tier: ${d.business_center_tier || 'free'}`)
      console.log(`   Created: ${new Date(d.created_at).toLocaleDateString()}`)
      console.log('')
    })

    console.log(`\nDistributors WITHOUT phone numbers: ${result.data.length - withPhone.length}`)

    const noPhone = result.data.filter((d: any) => !d.phone)
    if (noPhone.length > 0 && noPhone.length <= 10) {
      console.log('\nNo phone:')
      noPhone.forEach((d: any) => {
        console.log(`   - ${d.first_name} ${d.last_name} (${d.email})`)
      })
    }
  } else {
    console.log('⚠️  No distributors found')
  }
}

listDistributors()
