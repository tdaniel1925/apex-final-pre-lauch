// Find who Sella's sponsor actually is
import { createServiceClient } from '../src/lib/supabase/service';

async function findCorrectSponsor() {
  const client = createServiceClient();

  const sponsorId = '712a4dbf-7397-4fe6-8fcf-8a9a51172858';

  console.log('Looking for distributor with ID:', sponsorId, '\n');

  const { data, error } = await client
    .from('distributors')
    .select('id, first_name, last_name, email, slug')
    .eq('id', sponsorId)
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sella\'s ACTUAL sponsor:');
  console.log(data);
}

findCorrectSponsor();
