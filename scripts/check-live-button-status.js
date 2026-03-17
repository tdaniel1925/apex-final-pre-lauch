// Check if /live button should be active right now
const now = new Date();

// Get Central Time
const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
const dayOfWeek = centralTime.getDay();
const hours = centralTime.getHours();
const minutes = centralTime.getMinutes();
const currentMinutes = hours * 60 + minutes;

const liveStart = 18 * 60; // 6:00 PM (1080 minutes)
const eventEnd = 19 * 60 + 30; // 7:30 PM (1170 minutes)

const isTuesday = dayOfWeek === 2;
const isThursday = dayOfWeek === 4;

const isLive = (isTuesday || isThursday) && currentMinutes >= liveStart && currentMinutes < eventEnd;

// Day names
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

console.log('========================================');
console.log('LIVE BUTTON STATUS CHECK');
console.log('========================================\n');

console.log('Current Time (Local):', now.toLocaleString());
console.log('Current Time (Central):', centralTime.toLocaleString('en-US', { timeZone: 'America/Chicago', timeZoneName: 'short' }));
console.log('Day of Week:', days[dayOfWeek]);
console.log('Hour:', hours);
console.log('Minute:', minutes);
console.log('Current Minutes:', currentMinutes);

console.log('\n--- Button Activation Logic ---');
console.log('Is Tuesday or Thursday?', isTuesday || isThursday);
console.log('Current time >= 6:00 PM (1080)?', currentMinutes >= liveStart);
console.log('Current time < 7:30 PM (1170)?', currentMinutes < eventEnd);

console.log('\n========================================');
console.log('RESULT: Button is', isLive ? '🟢 ACTIVE (LIVE)' : '🔴 INACTIVE');
console.log('========================================');

if (!isLive) {
  console.log('\nButton will activate next:');
  if (isTuesday || isThursday) {
    if (currentMinutes < liveStart) {
      const minutesUntil = liveStart - currentMinutes;
      console.log(`  In ${Math.floor(minutesUntil / 60)} hours and ${minutesUntil % 60} minutes (6:00 PM today)`);
    } else {
      console.log('  Next Tuesday or Thursday at 6:00 PM Central');
    }
  } else {
    const daysUntilTuesday = (2 - dayOfWeek + 7) % 7 || 7;
    const daysUntilThursday = (4 - dayOfWeek + 7) % 7 || 7;
    const nextDay = daysUntilTuesday < daysUntilThursday ? 'Tuesday' : 'Thursday';
    const daysUntil = Math.min(daysUntilTuesday, daysUntilThursday);
    console.log(`  ${nextDay} at 6:00 PM Central (in ${daysUntil} days)`);
  }
}

console.log('\n📍 Check it live: http://localhost:3050/live');
