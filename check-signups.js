// Quick script to check tonight's signups
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSignups() {
  // Get today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all prospects created today
  const { data, error, count } = await supabase
    .from('prospects')
    .select('*', { count: 'exact' })
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n==============================================');
  console.log(`TONIGHT'S SIGNUPS: ${count || 0}`);
  console.log('==============================================\n');

  if (data && data.length > 0) {
    console.log('Recent signups:');
    data.forEach((prospect, index) => {
      const time = new Date(prospect.created_at).toLocaleTimeString();
      console.log(`${index + 1}. ${prospect.first_name} ${prospect.last_name} (${prospect.email}) - ${time}`);
    });
  } else {
    console.log('No signups yet tonight.');
  }

  console.log('\n==============================================\n');
}

checkSignups();
