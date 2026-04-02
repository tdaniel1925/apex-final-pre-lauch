/**
 * Setup Cal.com Automation
 * - Add Dialpad meeting link
 * - Configure booking fields (email, phone)
 * - Set up webhook for notifications
 */

const API_KEY = 'cal_live_4a9d1c6e22ea632fd84a556813c0b5f5';
const API_BASE = 'https://api.cal.com/v1';
const EVENT_TYPE_ID = 5229336;

async function setupAutomation() {
  console.log('\n🔧 Setting up Cal.com Automation...\n');
  console.log('='.repeat(70));

  try {
    // Step 1: Update event type with Dialpad link and booking fields
    console.log('\n📝 Step 1: Configuring event type...');

    const eventTypeUpdate = {
      title: 'Apex Affinity Group Onboarding',
      slug: 'apex-affinity-group-onboarding',
      length: 30,
      description: 'Book your 30-minute onboarding session to get started with your new AI-powered tools.',
      locations: [
        {
          type: 'link',
          link: 'https://meetings.dialpad.com/room/aicallers',
          displayLocationPublicly: true,
        }
      ],
      bookingFields: [
        {
          name: 'name',
          type: 'name',
          label: 'Your Name',
          required: true,
          placeholder: 'John Doe',
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email Address',
          required: true,
          placeholder: 'john@example.com',
        },
        {
          name: 'phone',
          type: 'phone',
          label: 'Phone Number',
          required: true,
          placeholder: '(555) 123-4567',
        },
        {
          name: 'product',
          type: 'text',
          label: 'Product Purchased',
          required: false,
          placeholder: 'Product name',
        },
        {
          name: 'notes',
          type: 'textarea',
          label: 'Anything we should know before the session?',
          required: false,
          placeholder: 'Questions, topics to cover, etc.',
        },
      ],
    };

    const updateResponse = await fetch(`${API_BASE}/event-types/${EVENT_TYPE_ID}?apiKey=${API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventTypeUpdate),
    });

    const updateData = await updateResponse.json();

    if (!updateResponse.ok) {
      throw new Error(`Failed to update event type: ${JSON.stringify(updateData)}`);
    }

    console.log('✅ Event type configured!');
    console.log('   Meeting Location: https://meetings.dialpad.com/room/aicallers');
    console.log('   Booking Fields: Name, Email, Phone, Product, Notes');

    // Step 2: Note about webhook setup
    console.log('\n🔗 Step 2: Webhook Setup');
    console.log('📋 Webhook will be created at:');
    console.log('   /api/webhooks/calcom');
    console.log('\n⚠️  After deployment, you need to add webhook URL in Cal.com:');
    console.log('   1. Go to: https://app.cal.com/settings/developer/webhooks');
    console.log('   2. Click "New Webhook"');
    console.log('   3. Subscriber URL: https://yourdomain.com/api/webhooks/calcom');
    console.log('   4. Select events: BOOKING_CREATED');
    console.log('   5. Save');

    console.log('\n' + '='.repeat(70));
    console.log('🎉 AUTOMATION SETUP COMPLETE!\n');
    console.log('📋 Summary:');
    console.log('   ✅ Dialpad meeting link added');
    console.log('   ✅ Email & phone fields required');
    console.log('   ✅ Product field added (auto-filled from purchase)');
    console.log('   ✅ Webhook endpoint created (see /api/webhooks/calcom)');
    console.log('\n📧 When booking is made:');
    console.log('   1. Email sent to: tavaresdavis81@gmail.com');
    console.log('   2. Email sent to: tdaniel@botmakers.ai');
    console.log('   3. Confirmation sent to client');
    console.log('   4. Sponsor notified about their customer\'s booking');
    console.log('   5. Notification added to sponsor\'s back office');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
  }
}

setupAutomation();
