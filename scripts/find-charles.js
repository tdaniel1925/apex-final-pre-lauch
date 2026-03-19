// Find Charles Potter in the database
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findCharles() {
  console.log('\nSearching for Charles Potter...\n');

  // Try different search patterns
  const searches = [
    { pattern: '%charles%potter%', field: 'last_name' },
    { pattern: '%charles%', field: 'first_name' },
    { pattern: '%potter%', field: 'last_name' },
  ];

  for (const search of searches) {
    console.log(`Searching ${search.field} ILIKE '${search.pattern}'...`);
    const { data, error } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email')
      .ilike(search.field, search.pattern);

    if (error) {
      console.error('Error:', error);
      continue;
    }

    if (data && data.length > 0) {
      console.log(`Found ${data.length} distributor(s):`);
      data.forEach(d => {
        console.log(`  - ${d.first_name} ${d.last_name} (${d.email})`);
        console.log(`    ID: ${d.id}`);
      });
    } else {
      console.log('  No matches found.');
    }
    console.log('');
  }

  // Also search members table
  console.log('Searching members table for Charles...');
  const { data: members, error: memberError } = await supabase
    .from('members')
    .select('member_id, full_name, email')
    .ilike('full_name', '%charles%');

  if (memberError) {
    console.error('Error:', memberError);
  } else if (members && members.length > 0) {
    console.log(`Found ${members.length} member(s):`);
    members.forEach(m => {
      console.log(`  - ${m.full_name} (${m.email})`);
      console.log(`    Member ID: ${m.member_id}`);
    });
  } else {
    console.log('  No matches found in members.');
  }
}

findCharles().catch(console.error);
