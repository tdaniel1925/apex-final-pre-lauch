import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTrentCredits() {
  console.log('\n=== INVESTIGATING TEAM MEMBER CREDITS ===\n');

  // Get Sella's team members
  const { data: sella } = await supabase
    .from('distributors')
    .select('id')
    .eq('email', 'sellag.sb@gmail.com')
    .single();

  const { data: teamMembers } = await supabase
    .from('distributors')
    .select(`
      id,
      first_name,
      last_name,
      email,
      member:members!members_distributor_id_fkey (
        personal_credits_monthly,
        team_credits_monthly
      )
    `)
    .eq('sponsor_id', sella.id);

  console.log('Team Members with Credits:\n');
  teamMembers?.forEach((tm) => {
    const member = Array.isArray(tm.member) ? tm.member[0] : tm.member;
    console.log(`${tm.first_name} ${tm.last_name}:`);
    console.log(`  Personal: ${member?.personal_credits_monthly || 0}`);
    console.log(`  Team: ${member?.team_credits_monthly || 0}`);
    console.log('');
  });

  // Calculate total
  const total = teamMembers?.reduce((sum, tm) => {
    const member = Array.isArray(tm.member) ? tm.member[0] : tm.member;
    return sum + (member?.personal_credits_monthly || 0);
  }, 0);

  console.log('TOTAL TEAM CREDITS:', total);

  const { data: dist } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email')
    .eq('email', 'sellag.sb@gmail.com')
    .single();

  if (!dist) {
    console.log('Trent Daniel not found');
    return;
  }

  console.log('Found:', dist.first_name, dist.last_name, dist.email);
  console.log('Distributor ID:', dist.id);

  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('distributor_id', dist.id)
    .single();

  console.log('\nMember Record:');
  console.log('  personal_credits_monthly:', member?.personal_credits_monthly);
  console.log('  team_credits_monthly:', member?.team_credits_monthly);
  console.log('  override_qualified:', member?.override_qualified);

  const { data: sales } = await supabase
    .from('sales')
    .select('*')
    .eq('seller_id', dist.id);

  console.log('\nSales Records:', sales?.length || 0);
  if (sales && sales.length > 0) {
    sales.forEach((s, i) => {
      console.log(`  Sale ${i + 1}: ${s.product_name} - $${s.amount_cents / 100} - ${s.created_at}`);
    });
  }

  const { data: enrollees } = await supabase
    .from('distributors')
    .select('id, first_name, last_name')
    .eq('sponsor_id', dist.id);

  console.log('\nDirect Enrollees:', enrollees?.length || 0);
  enrollees?.forEach((e, i) => {
    console.log(`  ${i + 1}. ${e.first_name} ${e.last_name}`);
  });

  // Check for any team member sales
  if (enrollees && enrollees.length > 0) {
    console.log('\n Checking team member sales...');
    const enrolleeIds = enrollees.map(e => e.id);
    const { data: teamSales } = await supabase
      .from('sales')
      .select('*')
      .in('seller_id', enrolleeIds);

    console.log('  Team Sales:', teamSales?.length || 0);
    if (teamSales && teamSales.length > 0) {
      teamSales.forEach((s, i) => {
        console.log(`    Sale ${i + 1}: ${s.product_name} - $${s.amount_cents / 100}`);
      });
    }
  }

  console.log('\n=== END ===\n');
}

checkTrentCredits().catch(console.error);
