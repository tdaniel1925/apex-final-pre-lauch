const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRepNumber() {
  console.log('Checking highest rep_number...');

  const { data, error } = await supabase
    .from('distributors')
    .select('rep_number')
    .order('rep_number', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Highest rep_number:', data[0]?.rep_number);
  }

  // Check if there's a sequence
  const { data: sequences } = await supabase.rpc('pg_get_serial_sequence', {
    tablename: 'distributors',
    columnname: 'rep_number'
  }).catch(() => ({ data: null }));

  console.log('Sequence info:', sequences);
}

checkRepNumber();
