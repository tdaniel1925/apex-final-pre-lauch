// =============================================
// Count Test Users Script (using pg client)
// Counts distributors with "testuser" in name
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

async function countTestUsers() {
  console.log('🔍 Counting test users...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Count distributors with 'testuser' in any name field
    const countResult = await client.query(`
      SELECT COUNT(*) as count
      FROM distributors
      WHERE (
        first_name ILIKE '%testuser%' OR
        last_name ILIKE '%testuser%' OR
        email ILIKE '%testuser%'
      )
      AND status != 'deleted'
    `);

    const count = parseInt(countResult.rows[0].count);
    console.log(`✅ Found ${count} reps with "testuser" in their name\n`);

    // Get details
    const detailsResult = await client.query(`
      SELECT id, first_name, last_name, email, status, created_at
      FROM distributors
      WHERE (
        first_name ILIKE '%testuser%' OR
        last_name ILIKE '%testuser%' OR
        email ILIKE '%testuser%'
      )
      AND status != 'deleted'
      ORDER BY created_at DESC
    `);

    if (detailsResult.rows.length > 0) {
      console.log('📋 Test users found:');
      detailsResult.rows.forEach((user, idx) => {
        console.log(`   ${idx + 1}. ${user.first_name} ${user.last_name} (${user.email}) - Status: ${user.status}`);
      });
      console.log('');
    }

    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    await client.end();
    process.exit(1);
  }
}

countTestUsers();
