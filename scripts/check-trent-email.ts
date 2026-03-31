import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEmail() {
  const emailToCheck = 'trenttdaniel@gmail.com';

  console.log(`\n🔍 Checking for email: ${emailToCheck}\n`);

  const { data: distributor, error } = await supabase
    .from('distributors')
    .select('*')
    .eq('email', emailToCheck)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error querying database:', error);
    return;
  }

  if (!distributor) {
    console.log(`❌ No distributor found with email: ${emailToCheck}\n`);

    const { data: similar } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, slug')
      .ilike('email', '%trent%')
      .order('created_at', { ascending: false });

    if (similar && similar.length > 0) {
      console.log(`\n📧 Found ${similar.length} emails containing "trent":\n`);
      similar.forEach((d, i) => {
        console.log(`${i + 1}. ${d.first_name} ${d.last_name}`);
        console.log(`   Email: ${d.email}`);
        console.log(`   Slug: ${d.slug}\n`);
      });
    }
    return;
  }

  console.log(`✅ DISTRIBUTOR FOUND:\n`);
  console.log(`ID:                ${distributor.id}`);
  console.log(`Name:              ${distributor.first_name} ${distributor.last_name}`);
  console.log(`Email:             ${distributor.email}`);
  console.log(`Slug:              ${distributor.slug}`);
  console.log(`Status:            ${distributor.status}`);
  console.log(`Licensing Status:  ${distributor.licensing_status}`);
  console.log(`Created:           ${new Date(distributor.created_at).toLocaleString()}`);
  console.log('\n');
}

checkEmail();
