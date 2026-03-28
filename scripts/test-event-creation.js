require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCreate() {
  console.log('\n🧪 Testing event creation with service role...\n');

  const testEvent = {
    event_name: 'Test Event via Script',
    event_type: 'training',
    event_description: 'Testing RLS',
    event_date_time: new Date('2026-06-15T14:00:00').toISOString(),
    event_duration_minutes: 120,
    event_timezone: 'America/Chicago',
    location_type: 'virtual',
    virtual_meeting_link: 'https://zoom.us/j/123',
    virtual_meeting_platform: 'Zoom',
    status: 'active',
    is_public: true,
    is_featured: false,
  };

  const { data, error } = await supabase
    .from('company_events')
    .insert([testEvent])
    .select()
    .single();

  if (error) {
    console.log('❌ Failed to create event:');
    console.log('   Code:', error.code);
    console.log('   Message:', error.message);
    console.log('   Details:', error.details);
    console.log('   Hint:', error.hint);
    return;
  }

  console.log('✅ Event created successfully!');
  console.log('   ID:', data.id);
  console.log('   Name:', data.event_name);

  // Clean up
  await supabase.from('company_events').delete().eq('id', data.id);
  console.log('\n🧹 Cleaned up test event');
}

testCreate();
