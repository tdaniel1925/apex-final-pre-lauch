/**
 * Test Cal.com Booking Webhook
 * Simulates a booking webhook from Cal.com to test email notifications
 */

async function testWebhook() {
  console.log('\n🧪 Testing Cal.com Booking Webhook...\n');
  console.log('='.repeat(70));

  const testPayload = {
    triggerEvent: 'BOOKING_CREATED',
    payload: {
      booking: {
        id: 'test_' + Date.now(),
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        responses: {
          phone: '(555) 123-4567',
          product: 'PulseMarket',
          notes: 'Looking forward to learning about the platform!',
        },
        metadata: {
          session_id: 'cs_test_webhook_' + Date.now(),
        },
      },
      attendees: [
        {
          name: 'John Test User',
          email: 'john.test@example.com',
          timeZone: 'America/Chicago',
        },
      ],
      eventType: {
        title: 'Apex Affinity Group Onboarding',
        slug: 'apex-affinity-group-onboarding',
      },
      metadata: {},
    },
  };

  console.log('\n📝 Test Booking Details:');
  console.log(`   Customer: ${testPayload.payload.attendees[0].name}`);
  console.log(`   Email: ${testPayload.payload.attendees[0].email}`);
  console.log(`   Phone: ${testPayload.payload.booking.responses.phone}`);
  console.log(`   Product: ${testPayload.payload.booking.responses.product}`);
  console.log(`   Start Time: ${new Date(testPayload.payload.booking.startTime).toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);

  try {
    console.log('\n🔄 Sending webhook to localhost...');
    const response = await fetch('http://localhost:3050/api/webhooks/calcom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('\n✅ Webhook processed successfully!');
      console.log('   Status:', response.status);
      console.log('   Response:', result);

      console.log('\n📧 Expected Emails Sent:');
      console.log('   ✅ Admin: tavaresdavis81@gmail.com');
      console.log('   ✅ Admin: tdaniel@botmakers.ai');
      console.log('   ✅ Client: john.test@example.com');
      console.log('   ⚠️  Sponsor: (if sponsor found in database)');

      console.log('\n💡 Next Steps:');
      console.log('   1. Check your email inboxes');
      console.log('   2. Verify Dialpad link is present');
      console.log('   3. Check sponsor back office for notification (if applicable)');
    } else {
      console.log('\n❌ Webhook failed!');
      console.log('   Status:', response.status);
      console.log('   Error:', result);
    }

    console.log('\n' + '='.repeat(70));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure dev server is running (npm run dev)');
    console.log('2. Check RESEND_API_KEY is set in .env.local');
    console.log('3. Verify webhook route exists at /api/webhooks/calcom');
  }
}

testWebhook();
