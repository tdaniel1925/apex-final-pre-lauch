const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://brejvdvzwshroxkkhmzy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk'
);

async function getStats() {
  // Total distributors
  const { count: totalCount } = await supabase
    .from('distributors')
    .select('*', { count: 'exact', head: true });

  // Distributors with phone numbers
  const { count: phoneCount } = await supabase
    .from('distributors')
    .select('*', { count: 'exact', head: true })
    .not('phone', 'is', null)
    .neq('phone', '');

  // Get actual list
  const { data: reps } = await supabase
    .from('distributors')
    .select('first_name, last_name, email, phone, created_at')
    .order('created_at', { ascending: false });

  console.log('📊 APEX DISTRIBUTOR STATISTICS');
  console.log('═'.repeat(60));
  console.log('');
  console.log('Total Distributors:', totalCount || 0);
  console.log('With Phone Numbers:', phoneCount || 0);
  console.log('Missing Phone Numbers:', (totalCount - phoneCount) || 0);
  console.log('');
  console.log('📋 ALL DISTRIBUTORS:');
  console.log('─'.repeat(60));

  if (reps) {
    reps.forEach((rep, i) => {
      const num = i + 1;
      console.log(num + '. ' + rep.first_name + ' ' + rep.last_name);
      console.log('   Email: ' + rep.email);
      console.log('   Phone: ' + (rep.phone || '❌ Not set'));
      console.log('');
    });
  }
}

getStats().catch(err => console.error('Error:', err));
