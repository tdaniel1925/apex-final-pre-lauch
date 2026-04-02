import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function searchAhn() {
  console.log('Searching for Ahn...\n');

  // Search for first name starting with Ahn
  const { data: results } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, slug, rep_number')
    .ilike('first_name', 'ahn%')
    .order('rep_number', { ascending: true });

  if (!results || results.length === 0) {
    console.log('No results found for first name starting with "Ahn"\n');

    // Try last name
    const { data: lastNameResults } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, slug, rep_number')
      .ilike('last_name', '%doan%')
      .order('rep_number', { ascending: true });

    if (lastNameResults && lastNameResults.length > 0) {
      console.log('Found by last name containing "Doan":\n');
      lastNameResults.forEach((d, index) => {
        console.log(`${index + 1}. ${d.first_name} ${d.last_name}`);
        console.log(`   Email: ${d.email}`);
        console.log(`   Rep #: ${d.rep_number}`);
        console.log('');
      });
    } else {
      console.log('No results found for last name containing "Doan" either');
    }
  } else {
    console.log(`Found ${results.length} distributors:\n`);
    results.forEach((d, index) => {
      console.log(`${index + 1}. ${d.first_name} ${d.last_name}`);
      console.log(`   Email: ${d.email}`);
      console.log(`   Rep #: ${d.rep_number}`);
      console.log('');
    });
  }
}

searchAhn();
