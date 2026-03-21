// =============================================
// Delete Test Users Script
// Deletes distributors with "testuser" in name
// =============================================

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Validate environment variables
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

async function deleteTestUsers() {
  console.log('🗑️  Deleting test users...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // First, get the list of test users to delete
    const listResult = await client.query(`
      SELECT id, first_name, last_name, email, status
      FROM distributors
      WHERE (
        first_name ILIKE '%testuser%' OR
        last_name ILIKE '%testuser%' OR
        email ILIKE '%testuser%'
      )
      AND status != 'deleted'
    `);

    if (listResult.rows.length === 0) {
      console.log('✅ No test users found to delete.');
      await client.end();
      process.exit(0);
    }

    console.log(`Found ${listResult.rows.length} test users to delete:\n`);
    listResult.rows.forEach((user, idx) => {
      console.log(`   ${idx + 1}. ${user.first_name} ${user.last_name} (${user.email})`);
    });
    console.log('');

    // Update their status to 'deleted'
    const deleteResult = await client.query(`
      UPDATE distributors
      SET
        status = 'deleted',
        updated_at = NOW()
      WHERE (
        first_name ILIKE '%testuser%' OR
        last_name ILIKE '%testuser%' OR
        email ILIKE '%testuser%'
      )
      AND status != 'deleted'
      RETURNING id, first_name, last_name, email
    `);

    console.log(`✅ Successfully deleted ${deleteResult.rows.length} test users:\n`);
    deleteResult.rows.forEach((user, idx) => {
      console.log(`   ${idx + 1}. ${user.first_name} ${user.last_name} (${user.email})`);
    });
    console.log('');

    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    await client.end();
    process.exit(1);
  }
}

deleteTestUsers();
