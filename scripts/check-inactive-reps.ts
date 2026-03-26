import { createServiceClient } from '../src/lib/supabase/service';

const supabase = createServiceClient();

async function checkInactive() {
  console.log('🔍 Checking for inactive reps...\n');

  // Check distributors table
  const { data: inactiveDistributors, error: distError } = await supabase
    .from('distributors')
    .select('id, email, first_name, last_name, status, created_at')
    .neq('status', 'active')
    .order('created_at', { ascending: false });

  if (distError) {
    console.error('Error:', distError);
    return;
  }

  console.log('📊 DISTRIBUTORS TABLE:');
  console.log(`Total non-active: ${inactiveDistributors?.length || 0}\n`);

  if (inactiveDistributors && inactiveDistributors.length > 0) {
    inactiveDistributors.forEach((d, i) => {
      console.log(`${i + 1}. ${d.first_name} ${d.last_name} (${d.email})`);
      console.log(`   Status: ${d.status}`);
      console.log(`   Joined: ${new Date(d.created_at).toLocaleDateString()}\n`);
    });
  } else {
    console.log('   ✅ All distributors are ACTIVE\n');
  }

  // Check members table
  const { data: inactiveMembers, error: memberError } = await supabase
    .from('members')
    .select('member_id, email, full_name, status, enrollment_date')
    .neq('status', 'active')
    .order('enrollment_date', { ascending: false });

  if (memberError) {
    console.error('Error:', memberError);
    return;
  }

  console.log('📊 MEMBERS TABLE:');
  console.log(`Total non-active: ${inactiveMembers?.length || 0}\n`);

  if (inactiveMembers && inactiveMembers.length > 0) {
    inactiveMembers.forEach((m, i) => {
      console.log(`${i + 1}. ${m.full_name} (${m.email})`);
      console.log(`   Status: ${m.status}`);
      console.log(`   Enrolled: ${new Date(m.enrollment_date).toLocaleDateString()}\n`);
    });
  } else {
    console.log('   ✅ All members are ACTIVE\n');
  }

  // Check total counts
  const { count: totalDist } = await supabase
    .from('distributors')
    .select('*', { count: 'exact', head: true });

  const { count: activeDist } = await supabase
    .from('distributors')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  console.log('📈 SUMMARY:');
  console.log(`Total Distributors: ${totalDist}`);
  console.log(`Active: ${activeDist}`);
  console.log(`Inactive: ${(totalDist || 0) - (activeDist || 0)}`);
}

checkInactive().catch(console.error);
