import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkMembersSchema() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n📋 Members Table Fields:\n');
  Object.keys(data).sort().forEach(key => {
    console.log(`  - ${key}`);
  });

  console.log('\n✅ Checking for pay_level or paying_rank fields...\n');
  if ('pay_level' in data) {
    console.log('  ✅ pay_level EXISTS');
  } else {
    console.log('  ❌ pay_level DOES NOT EXIST');
  }

  if ('paying_rank' in data) {
    console.log('  ✅ paying_rank EXISTS');
  } else {
    console.log('  ❌ paying_rank DOES NOT EXIST');
  }

  if ('tech_rank' in data) {
    console.log(`  ✅ tech_rank EXISTS (value: ${data.tech_rank})`);
  }

  if ('highest_rank' in data || 'lifetime_rank' in data) {
    console.log(`  ✅ highest/lifetime rank field EXISTS`);
  } else {
    console.log('  ❌ No highest/lifetime rank field');
  }
}

checkMembersSchema();
