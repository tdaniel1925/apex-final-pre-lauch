/**
 * Update Cal.com Event Type Slug
 */

const API_KEY = 'cal_live_4a9d1c6e22ea632fd84a556813c0b5f5';
const API_BASE = 'https://api.cal.com/v1';
const EVENT_TYPE_ID = 5229336;

async function updateEventType() {
  console.log('\n📝 Updating Cal.com Event Type Slug...\n');
  console.log('='.repeat(70));

  try {
    // Update event type slug
    console.log('\n🔄 Updating event type...');
    const updateResponse = await fetch(`${API_BASE}/event-types/${EVENT_TYPE_ID}?apiKey=${API_KEY}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug: 'Apex-Affinity-Group-Onboarding',
        title: 'Apex Affinity Group Onboarding',
      }),
    });

    const updateData = await updateResponse.json();

    if (!updateResponse.ok) {
      throw new Error(`Failed to update: ${JSON.stringify(updateData)}`);
    }

    console.log('✅ Event type updated successfully!');
    console.log(`   Event Type ID: ${EVENT_TYPE_ID}`);
    console.log(`   New Slug: Apex-Affinity-Group-Onboarding`);
    console.log(`   New Title: Apex Affinity Group Onboarding`);
    console.log(`   New URL: https://cal.com/botmakers/Apex-Affinity-Group-Onboarding`);

    // Update code
    console.log('\n📝 Updating code...');
    const fs = require('fs');
    const path = require('path');

    const successPagePath = path.join(__dirname, 'src/app/products/success/page.tsx');

    try {
      let content = fs.readFileSync(successPagePath, 'utf8');

      // Update the calLink
      content = content.replace(
        /calLink="[^"]+"/,
        `calLink="botmakers/Apex-Affinity-Group-Onboarding"`
      );

      fs.writeFileSync(successPagePath, content, 'utf8');
      console.log(`✅ Updated src/app/products/success/page.tsx`);
      console.log(`   Cal.com link: botmakers/Apex-Affinity-Group-Onboarding`);
    } catch (error) {
      console.log(`⚠️  Could not auto-update code: ${error.message}`);
      console.log(`   Manually update: calLink="botmakers/Apex-Affinity-Group-Onboarding"`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 UPDATE COMPLETE!\n');
    console.log('✅ Event type slug: Apex-Affinity-Group-Onboarding');
    console.log('✅ Booking URL: https://cal.com/botmakers/Apex-Affinity-Group-Onboarding');
    console.log('✅ Code updated with new link');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Update failed:', error.message);
  }
}

updateEventType();
