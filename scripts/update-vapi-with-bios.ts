/**
 * Update existing VAPI assistants with distributor bios
 * Run this after merging bio feature to personalize existing AI agents
 */

import { createServiceClient } from '../src/lib/supabase/service';
import { generateNetworkMarketingPrompt } from '../src/lib/vapi/prompts/network-marketing';

const supabase = createServiceClient();

// VAPI API configuration
const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_API_URL = 'https://api.vapi.ai';

/**
 * Update a VAPI assistant's system prompt
 */
async function updateVapiAssistant(assistantId: string, systemPrompt: string) {
  const response = await fetch(`${VAPI_API_URL}/assistant/${assistantId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${VAPI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`VAPI API error: ${error}`);
  }

  return response.json();
}

async function updateVapiAssistants() {
  console.log('🔄 Updating VAPI assistants with distributor bios...\n');

  // Get all distributors with VAPI assistants and bios
  const { data: distributors, error } = await supabase
    .from('distributors')
    .select(`
      id,
      first_name,
      last_name,
      slug,
      bio,
      vapi_assistant_id,
      sponsor:sponsor_id(first_name, last_name)
    `)
    .not('vapi_assistant_id', 'is', null)
    .not('bio', 'is', null);

  if (error) {
    console.error('❌ Error fetching distributors:', error);
    return;
  }

  if (!distributors || distributors.length === 0) {
    console.log('ℹ️  No distributors found with both VAPI assistants and bios');
    return;
  }

  console.log(`Found ${distributors.length} distributor(s) with bios to update\n`);

  let successCount = 0;
  let failCount = 0;

  for (const dist of distributors) {
    // Extract sponsor name
    const sponsorData = Array.isArray(dist.sponsor) ? dist.sponsor[0] : dist.sponsor;
    const sponsorName = sponsorData
      ? `${sponsorData.first_name} ${sponsorData.last_name}`
      : 'Apex Vision';

    // Generate updated prompt with bio
    const systemPrompt = generateNetworkMarketingPrompt({
      firstName: dist.first_name,
      lastName: dist.last_name,
      sponsorName,
      replicatedSiteUrl: `https://reachtheapex.net/${dist.slug}`,
      distributorBio: dist.bio,
    });

    try {
      await updateVapiAssistant(dist.vapi_assistant_id, systemPrompt);
      console.log(`✅ Updated VAPI assistant for ${dist.first_name} ${dist.last_name}`);
      console.log(`   Bio preview: ${dist.bio.substring(0, 60)}...`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed for ${dist.first_name} ${dist.last_name}:`, error);
      failCount++;
    }

    // Rate limiting - wait 500ms between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully updated: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📝 Total processed: ${distributors.length}`);
}

updateVapiAssistants()
  .then(() => {
    console.log('\n✅ Update complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
