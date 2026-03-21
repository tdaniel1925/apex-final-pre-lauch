// =============================================
// Check Name Casing
// Find names that aren't in Title Case
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

function needsCaseFixing(name: string): boolean {
  const titleCased = toTitleCase(name);
  return name !== titleCased;
}

async function checkNameCasing() {
  console.log('🔍 Checking for names not in Title Case...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Check distributors table
    console.log('1️⃣ Checking distributors table:');
    const distributors = await client.query(`
      SELECT id, first_name, last_name, email, status
      FROM distributors
      WHERE status != 'deleted'
      ORDER BY first_name, last_name
    `);

    const distNeedsFix: any[] = [];
    distributors.rows.forEach(row => {
      const firstNeedsFix = needsCaseFixing(row.first_name);
      const lastNeedsFix = needsCaseFixing(row.last_name);

      if (firstNeedsFix || lastNeedsFix) {
        distNeedsFix.push({
          id: row.id,
          current: `${row.first_name} ${row.last_name}`,
          correct: `${toTitleCase(row.first_name)} ${toTitleCase(row.last_name)}`,
          email: row.email,
        });
      }
    });

    if (distNeedsFix.length > 0) {
      console.log(`   ⚠️  Found ${distNeedsFix.length} distributors with incorrect casing:\n`);
      distNeedsFix.forEach((d, idx) => {
        console.log(`   ${idx + 1}. Current: "${d.current}" → Should be: "${d.correct}"`);
        console.log(`      (${d.email})`);
      });
      console.log('');
    } else {
      console.log(`   ✅ All distributor names are in Title Case\n`);
    }

    // Check members table
    console.log('2️⃣ Checking members table:');
    const members = await client.query(`
      SELECT member_id, full_name, email, status
      FROM members
      WHERE status = 'active'
      ORDER BY full_name
    `);

    const membersNeedsFix: any[] = [];
    members.rows.forEach(row => {
      if (needsCaseFixing(row.full_name)) {
        membersNeedsFix.push({
          member_id: row.member_id,
          current: row.full_name,
          correct: toTitleCase(row.full_name),
          email: row.email,
        });
      }
    });

    if (membersNeedsFix.length > 0) {
      console.log(`   ⚠️  Found ${membersNeedsFix.length} members with incorrect casing:\n`);
      membersNeedsFix.forEach((m, idx) => {
        console.log(`   ${idx + 1}. Current: "${m.current}" → Should be: "${m.correct}"`);
        console.log(`      (${m.email})`);
      });
      console.log('');
    } else {
      console.log(`   ✅ All member names are in Title Case\n`);
    }

    // Export fix counts
    console.log('\n📊 Summary:');
    console.log(`   Distributors needing fix: ${distNeedsFix.length}`);
    console.log(`   Members needing fix: ${membersNeedsFix.length}`);
    console.log(`   Total: ${distNeedsFix.length + membersNeedsFix.length}`);

    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    await client.end();
    process.exit(1);
  }
}

checkNameCasing();
