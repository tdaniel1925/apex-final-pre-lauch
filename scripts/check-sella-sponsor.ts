// Check Sella's sponsor information
import { createServiceClient } from '../src/lib/supabase/service';

async function checkSellaSponsor() {
  const client = createServiceClient();

  console.log('Checking Sella\'s sponsor...\n');

  const { data, error } = await client
    .from('distributors')
    .select('id, first_name, last_name, email, sponsor_id, sponsor:distributors!sponsor_id(id, first_name, last_name, email, slug)')
    .eq('id', '0b72d952-b556-4a09-8f86-7eae0299cfa4')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sella\'s Data:');
  console.log('Name:', data.first_name, data.last_name);
  console.log('Email:', data.email);
  console.log('Sponsor ID:', data.sponsor_id);
  console.log('\nSponsor Info:');
  console.log(data.sponsor);
}

checkSellaSponsor();
