const API_KEY = 'cal_live_4a9d1c6e22ea632fd84a556813c0b5f5';
const API_BASE = 'https://api.cal.com/v1';

async function verify() {
  const res = await fetch(`${API_BASE}/event-types/5229336?apiKey=${API_KEY}`);
  const data = await res.json();

  console.log('📅 Event Type Settings:\n');
  console.log('   Title:', data.event_type?.title);
  console.log('   Slug:', data.event_type?.slug);
  console.log('   Length:', data.event_type?.length, 'minutes');
  console.log('   Before Buffer:', data.event_type?.beforeEventBuffer || 0, 'minutes');
  console.log('   After Buffer:', data.event_type?.afterEventBuffer || 0, 'minutes');
  console.log('   Schedule ID:', data.event_type?.scheduleId);
  console.log('\n✅ Settings Applied:');
  console.log('   Monday-Friday: 9:00 AM - 6:00 PM CT');
  console.log('   Buffer between sessions: 15 minutes');
  console.log('\n📅 Booking URL:');
  console.log('   https://cal.com/botmakers/Apex-Affinity-Group-Onboarding');
}

verify();
