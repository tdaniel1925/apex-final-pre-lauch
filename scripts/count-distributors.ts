import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function countDistributors() {
  // Total count
  const { count: totalCount, error: countError } = await supabase
    .from('distributors')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting distributors:', countError);
    return;
  }

  console.log(`\n📊 Total Distributors: ${totalCount}\n`);

  // Get recent distributors
  const { data: distributors, error } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, slug, status, licensing_status, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching distributors:', error);
    return;
  }

  console.log('📋 Recent 20 Distributors:\n');
  console.log('Name                    | Email                           | Slug           | Status   | Licensed | Created');
  console.log('─'.repeat(130));

  distributors?.forEach((d) => {
    const name = `${d.first_name} ${d.last_name}`.padEnd(23);
    const email = (d.email || 'N/A').padEnd(31);
    const slug = (d.slug || 'N/A').padEnd(14);
    const status = (d.status || 'N/A').padEnd(8);
    const licensing = (d.licensing_status || 'N/A').padEnd(8);
    const created = new Date(d.created_at).toLocaleDateString();

    console.log(`${name} | ${email} | ${slug} | ${status} | ${licensing} | ${created}`);
  });
}

countDistributors();
