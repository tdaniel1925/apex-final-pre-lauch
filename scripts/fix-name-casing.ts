// =============================================
// Fix Name Casing
// Convert all names to Title Case
// =============================================

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function fixNameCasing() {
  console.log('🔧 Fixing name casing to Title Case...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Fix distributors table
    console.log('1️⃣ Fixing distributors table...');
    const distResult = await client.query(`
      UPDATE distributors
      SET
        first_name = INITCAP(first_name),
        last_name = INITCAP(last_name),
        updated_at = NOW()
      WHERE status != 'deleted'
        AND (
          first_name != INITCAP(first_name)
          OR last_name != INITCAP(last_name)
        )
      RETURNING id, first_name, last_name, email
    `);

    if (distResult.rows.length > 0) {
      console.log(`   ✅ Fixed ${distResult.rows.length} distributors:\n`);
      distResult.rows.forEach((row, idx) => {
        console.log(`   ${idx + 1}. ${row.first_name} ${row.last_name} (${row.email})`);
      });
      console.log('');
    } else {
      console.log(`   ℹ️  No distributors needed fixing\n`);
    }

    // Fix members table
    console.log('2️⃣ Fixing members table...');
    const membersResult = await client.query(`
      UPDATE members
      SET
        full_name = INITCAP(full_name),
        updated_at = NOW()
      WHERE status = 'active'
        AND full_name != INITCAP(full_name)
      RETURNING member_id, full_name, email
    `);

    if (membersResult.rows.length > 0) {
      console.log(`   ✅ Fixed ${membersResult.rows.length} members:\n`);
      membersResult.rows.forEach((row, idx) => {
        console.log(`   ${idx + 1}. ${row.full_name} (${row.email})`);
      });
      console.log('');
    } else {
      console.log(`   ℹ️  No members needed fixing\n`);
    }

    console.log('✅ All names fixed to Title Case!');

    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    await client.end();
    process.exit(1);
  }
}

fixNameCasing();
