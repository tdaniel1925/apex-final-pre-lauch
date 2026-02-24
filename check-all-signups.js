// Check all signups in database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllSignups() {
  const { data, error, count } = await supabase
    .from('prospects')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n==============================================');
  console.log(`TOTAL SIGNUPS: ${count || 0}`);
  console.log('==============================================\n');

  if (data && data.length > 0) {
    console.log('All signups:');
    data.forEach((prospect, index) => {
      const date = new Date(prospect.created_at).toLocaleString();
      console.log(`${index + 1}. ${prospect.first_name} ${prospect.last_name} (${prospect.email}) - ${date}`);
    });
  } else {
    console.log('No signups in database.');
  }

  console.log('\n==============================================\n');
}

checkAllSignups();
