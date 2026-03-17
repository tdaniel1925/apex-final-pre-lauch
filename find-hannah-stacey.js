const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findDistributors() {
  const { data, error } = await supabase
    .from('distributors')
    .select('*')
    .or('first_name.ilike.%hannah%,last_name.ilike.%hannah%,first_name.ilike.%stacey%,last_name.ilike.%stacey%,first_name.ilike.%stacy%,last_name.ilike.%stacy%')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== Found Distributors ===\n');
  data.forEach((dist, index) => {
    console.log(`Record #${index + 1}:`);
    console.log(`  ID: ${dist.id}`);
    console.log(`  Rep #: ${dist.rep_number || 'Not assigned'}`);
    console.log(`  Name: ${dist.first_name} ${dist.last_name}`);
    console.log(`  Email: ${dist.email}`);
    console.log(`  Phone: ${dist.phone || 'N/A'}`);
    console.log(`  Slug: ${dist.slug || 'Not set'}`);
    console.log(`  Status: ${dist.status}`);
    console.log(`  Created: ${new Date(dist.created_at).toLocaleString()}`);
    console.log('---');
  });

  console.log(`\nTotal records found: ${data.length}`);
}

findDistributors();
