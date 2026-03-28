// =============================================
// Check if Trigger Exists
// Verify suspension cascade trigger was applied
// =============================================

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

async function checkTriggerExists() {
  console.log('🔍 Checking if suspension cascade trigger exists...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Check for the trigger
    const triggerCheck = await client.query(`
      SELECT tgname, tgenabled
      FROM pg_trigger
      WHERE tgname = 'distributors_status_sync_to_members'
    `);

    if (triggerCheck.rows.length > 0) {
      console.log('✅ Trigger EXISTS:');
      console.log(`   Name: ${triggerCheck.rows[0].tgname}`);
      console.log(`   Enabled: ${triggerCheck.rows[0].tgenabled === 'O' ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ Trigger DOES NOT EXIST!');
      console.log('   The migration may not have been applied to the database.');
    }
    console.log('');

    // Check for the function
    const functionCheck = await client.query(`
      SELECT proname, prosrc
      FROM pg_proc
      WHERE proname = 'sync_distributor_status_to_members'
    `);

    if (functionCheck.rows.length > 0) {
      console.log('✅ Function EXISTS:');
      console.log(`   Name: ${functionCheck.rows[0].proname}`);
    } else {
      console.log('❌ Function DOES NOT EXIST!');
    }

    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    await client.end();
    process.exit(1);
  }
}

checkTriggerExists();
