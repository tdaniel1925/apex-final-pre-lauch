// Update Pulse product price IDs in Vercel via CLI
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const prices = {
  'STRIPE_PULSEMARKET_RETAIL_PRICE_ID': 'price_1TIClH0s7Jg0EdCpmtyGm6q9',
  'STRIPE_PULSEMARKET_MEMBER_PRICE_ID': 'price_1TIClI0s7Jg0EdCp8kq6nbox',
  'STRIPE_PULSEFLOW_RETAIL_PRICE_ID': 'price_1TIClI0s7Jg0EdCpVfybCJyT',
  'STRIPE_PULSEFLOW_MEMBER_PRICE_ID': 'price_1TIClI0s7Jg0EdCpLwhhiZuz',
  'STRIPE_PULSEDRIVE_RETAIL_PRICE_ID': 'price_1TIClJ0s7Jg0EdCpiCqXwgel',
  'STRIPE_PULSEDRIVE_MEMBER_PRICE_ID': 'price_1TIClJ0s7Jg0EdCpWY9OpdFh',
  'STRIPE_PULSECOMMAND_RETAIL_PRICE_ID': 'price_1TIClJ0s7Jg0EdCpUo41hli0',
  'STRIPE_PULSECOMMAND_MEMBER_PRICE_ID': 'price_1TIClK0s7Jg0EdCpbAoW8JXA',
};

async function updatePrices() {
  console.log('Updating Pulse product price IDs in Vercel Production...\n');

  for (const [name, value] of Object.entries(prices)) {
    try {
      // Remove old value
      console.log(`Removing old ${name}...`);
      try {
        await execAsync(`echo "y" | vercel env rm "${name}" production 2>&1`);
      } catch (e) {
        // Might not exist, that's ok
      }

      // Add new value
      console.log(`Adding new ${name}...`);
      await execAsync(`echo "${value}" | tr -d '\\n\\r' | vercel env add "${name}" production`);
      console.log(`✅ ${name} updated\n`);
    } catch (error) {
      console.error(`❌ Error updating ${name}:`, error.message, '\n');
    }
  }

  console.log('\n✅ All Pulse price IDs updated! Trigger a redeploy to apply changes.');
}

updatePrices();
