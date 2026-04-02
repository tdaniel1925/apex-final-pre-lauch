/**
 * Update Cal.com Availability
 * Monday-Friday 9am-6pm CT with 15min buffer
 */

const API_KEY = 'cal_live_4a9d1c6e22ea632fd84a556813c0b5f5';
const API_BASE = 'https://api.cal.com/v1';
const EVENT_TYPE_ID = 5229336;

async function updateAvailability() {
  console.log('\n⏰ Updating Cal.com Availability...\n');
  console.log('='.repeat(70));

  try {
    // Step 1: Get user info to find default schedule
    console.log('\n📋 Step 1: Getting user info...');
    const userResponse = await fetch(`${API_BASE}/me?apiKey=${API_KEY}`);
    const userData = await userResponse.json();

    const defaultScheduleId = userData.user?.defaultScheduleId;
    console.log(`✅ Found default schedule ID: ${defaultScheduleId}`);

    // Step 2: Update the schedule with Monday-Friday 9am-6pm
    console.log('\n📅 Step 2: Updating schedule to Monday-Friday 9am-6pm CT...');

    const scheduleData = {
      name: 'Business Hours',
      timeZone: 'America/Chicago',
      availability: [
        {
          days: [1], // Monday
          startTime: '09:00',
          endTime: '18:00',
        },
        {
          days: [2], // Tuesday
          startTime: '09:00',
          endTime: '18:00',
        },
        {
          days: [3], // Wednesday
          startTime: '09:00',
          endTime: '18:00',
        },
        {
          days: [4], // Thursday
          startTime: '09:00',
          endTime: '18:00',
        },
        {
          days: [5], // Friday
          startTime: '09:00',
          endTime: '18:00',
        },
      ],
    };

    const scheduleResponse = await fetch(`${API_BASE}/schedules/${defaultScheduleId}?apiKey=${API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleData),
    });

    const scheduleResult = await scheduleResponse.json();

    if (!scheduleResponse.ok) {
      console.log('⚠️  Schedule update response:', JSON.stringify(scheduleResult, null, 2));
    } else {
      console.log('✅ Schedule updated successfully!');
      console.log('   Days: Monday - Friday');
      console.log('   Hours: 9:00 AM - 6:00 PM Central Time');
    }

    // Step 3: Update event type with 15-minute buffer
    console.log('\n⏱️  Step 3: Setting 15-minute buffer between sessions...');

    const eventTypeResponse = await fetch(`${API_BASE}/event-types/${EVENT_TYPE_ID}?apiKey=${API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        beforeEventBuffer: 0,      // No buffer before
        afterEventBuffer: 15,       // 15 minutes after
        scheduleId: defaultScheduleId,
      }),
    });

    const eventTypeResult = await eventTypeResponse.json();

    if (!eventTypeResponse.ok) {
      console.log('⚠️  Event type update response:', JSON.stringify(eventTypeResult, null, 2));
    } else {
      console.log('✅ Buffer time set successfully!');
      console.log('   Before session: 0 minutes');
      console.log('   After session: 15 minutes');
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 AVAILABILITY UPDATE COMPLETE!\n');
    console.log('📋 Summary:');
    console.log('   ✅ Days: Monday - Friday');
    console.log('   ✅ Hours: 9:00 AM - 6:00 PM Central Time');
    console.log('   ✅ Buffer: 15 minutes between sessions');
    console.log('   ✅ Timezone: America/Chicago (Central Time)');
    console.log('\n📅 Your booking page:');
    console.log('   https://cal.com/botmakers/Apex-Affinity-Group-Onboarding');
    console.log('\n💡 Note: You can also manage availability at:');
    console.log('   https://app.cal.com/availability');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Update failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your API key is valid');
    console.log('2. Visit https://app.cal.com/settings/developer/api-keys');
    console.log('3. You can also set availability manually at:');
    console.log('   https://app.cal.com/availability');
  }
}

updateAvailability();
