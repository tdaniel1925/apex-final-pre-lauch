/**
 * Lookup Johnathon Bunch in the database
 */

import { createServiceClient } from '../src/lib/supabase/service';

const supabase = createServiceClient();

async function lookupJohnathonBunch() {
  console.log('🔍 Looking up Johnathon/Jonathan Bunch...\n');

  const { data: distributors, error } = await supabase
    .from('distributors')
    .select('*')
    .or('first_name.ilike.%johnathon%,first_name.ilike.%jonathan%,last_name.ilike.%bunch%,email.ilike.%johnathon%,email.ilike.%jonathan%,email.ilike.%bunch%')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  if (!distributors || distributors.length === 0) {
    console.log('❌ No distributors found matching "Johnathon Bunch"');
    process.exit(0);
  }

  console.log(`✅ Found ${distributors.length} distributor(s):\n`);

  for (const dist of distributors) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Name: ${dist.first_name} ${dist.last_name}`);
    console.log(`Email: ${dist.email}`);
    console.log(`Slug: ${dist.slug}`);
    console.log(`ID: ${dist.id}`);
    console.log(`Status: ${dist.status}`);
    console.log(`Phone: ${dist.phone_number || 'N/A'}`);
    console.log(`AI Phone: ${dist.ai_phone_number || 'N/A'}`);
    console.log(`VAPI Assistant: ${dist.vapi_assistant_id || 'N/A'}`);
    console.log(`Matrix Position: ${dist.matrix_position || 'N/A'}`);
    console.log(`Matrix Parent: ${dist.matrix_parent_id || 'Root'}`);
    console.log(`Sponsor: ${dist.sponsor_id || 'N/A'}`);
    console.log(`Created: ${dist.created_at}`);
    console.log('');
  }

  // Also check member record
  if (distributors.length > 0) {
    console.log('\n📊 Member Records:\n');

    for (const dist of distributors) {
      const { data: member } = await supabase
        .from('members')
        .select('*')
        .eq('distributor_id', dist.id)
        .single();

      if (member) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Member ID: ${member.member_id}`);
        console.log(`Email: ${member.email}`);
        console.log(`Status: ${member.status}`);
        console.log(`Tech Rank: ${member.tech_rank}`);
        console.log(`Insurance Rank: ${member.insurance_rank || 'N/A'}`);
        console.log(`Personal Credits (Monthly): ${member.personal_credits_monthly || 0}`);
        console.log(`Team Credits (Monthly): ${member.team_credits_monthly || 0}`);
        console.log('');
      }
    }
  }
}

lookupJohnathonBunch()
  .then(() => {
    console.log('✅ Lookup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
