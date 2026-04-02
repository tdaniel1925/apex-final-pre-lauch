/**
 * Cal.com API Setup Script
 * Automatically creates the onboarding event type
 */

const API_KEY = 'cal_live_4a9d1c6e22ea632fd84a556813c0b5f5';
const API_BASE = 'https://api.cal.com/v1';

async function setupCalCom() {
  console.log('\n📅 Setting up Cal.com Event Type...\n');
  console.log('='.repeat(70));

  try {
    // Step 1: Get user info
    console.log('\n📋 Step 1: Getting your Cal.com account info...');
    const userResponse = await fetch(`${API_BASE}/me?apiKey=${API_KEY}`);
    const userData = await userResponse.json();

    if (!userResponse.ok) {
      throw new Error(`Failed to get user info: ${JSON.stringify(userData)}`);
    }

    console.log(`✅ Logged in as: ${userData.user?.email || userData.user?.username}`);
    console.log(`   Username: ${userData.user?.username}`);
    const username = userData.user?.username;

    // Step 2: Check for existing event types
    console.log('\n🔍 Step 2: Checking for existing event types...');
    const eventTypesResponse = await fetch(`${API_BASE}/event-types?apiKey=${API_KEY}`);
    const eventTypesData = await eventTypesResponse.json();

    const existingOnboarding = eventTypesData.event_types?.find(
      et => et.slug === 'onboarding' || et.title === 'Onboarding Session'
    );

    if (existingOnboarding) {
      console.log(`✅ Onboarding event type already exists!`);
      console.log(`   URL: https://cal.com/${username}/onboarding`);
      console.log(`   Event Type ID: ${existingOnboarding.id}`);

      updateCodeWithLink(username);
      return;
    }

    // Step 3: Create onboarding event type
    console.log('\n📝 Step 3: Creating "Onboarding Session" event type...');

    const eventTypeData = {
      title: 'Onboarding Session',
      slug: 'onboarding',
      length: 30,
      description: 'Book a 30-minute onboarding session with BotMakers to get started with your new AI-powered tools.',
      hidden: false,
      locations: [
        {
          type: 'integrations:daily',
          displayLocationPublicly: true,
        }
      ],
      metadata: {
        apps: {}
      },
      bookingFields: [
        {
          name: 'name',
          type: 'name',
          required: true,
          placeholder: 'Your name',
        },
        {
          name: 'email',
          type: 'email',
          required: true,
          placeholder: 'Your email',
        },
        {
          name: 'notes',
          type: 'textarea',
          required: false,
          placeholder: 'Anything we should know before the session?',
        },
      ],
    };

    const createResponse = await fetch(`${API_BASE}/event-types?apiKey=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventTypeData),
    });

    const createData = await createResponse.json();

    if (!createResponse.ok) {
      throw new Error(`Failed to create event type: ${JSON.stringify(createData)}`);
    }

    console.log('✅ Event type created successfully!');
    console.log(`   Event Type ID: ${createData.event_type.id}`);
    console.log(`   URL: https://cal.com/${username}/onboarding`);

    // Step 4: Set availability (Mon-Sat, 9am-6pm CT)
    console.log('\n⏰ Step 4: Setting availability (Mon-Sat, 9am-6pm CT)...');

    // Note: Cal.com API uses schedules for availability
    // The default schedule should work, but we'll note this
    console.log('⚠️  Note: Set your availability manually in Cal.com dashboard:');
    console.log('   1. Go to https://app.cal.com/availability');
    console.log('   2. Edit your schedule');
    console.log('   3. Set: Monday-Saturday, 9:00 AM - 6:00 PM Central Time');

    // Step 5: Update code
    console.log('\n📝 Step 5: Updating code with Cal.com link...');
    updateCodeWithLink(username);

    console.log('\n' + '='.repeat(70));
    console.log('🎉 SETUP COMPLETE!\n');
    console.log('✅ Event type created: https://cal.com/' + username + '/onboarding');
    console.log('✅ Code updated with your Cal.com link');
    console.log('\n📋 Next Steps:');
    console.log('   1. Visit https://app.cal.com/event-types');
    console.log('   2. Click on "Onboarding Session"');
    console.log('   3. Set your availability (Mon-Sat, 9am-6pm CT)');
    console.log('   4. Connect your calendar (Google/Outlook)');
    console.log('   5. Test: Make a purchase and see the modal!');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your API key is valid');
    console.log('2. Visit https://app.cal.com/settings/developer/api-keys');
    console.log('3. Create a new API key if needed');
  }
}

function updateCodeWithLink(username) {
  const fs = require('fs');
  const path = require('path');

  const successPagePath = path.join(__dirname, 'src/app/products/success/page.tsx');

  try {
    let content = fs.readFileSync(successPagePath, 'utf8');

    // Update the calLink
    content = content.replace(
      /calLink="[^"]+"/,
      `calLink="${username}/onboarding"`
    );

    fs.writeFileSync(successPagePath, content, 'utf8');
    console.log(`✅ Updated src/app/products/success/page.tsx`);
    console.log(`   Cal.com link: ${username}/onboarding`);
  } catch (error) {
    console.log(`⚠️  Could not auto-update code: ${error.message}`);
    console.log(`   Manually update: calLink="${username}/onboarding"`);
  }
}

setupCalCom();
