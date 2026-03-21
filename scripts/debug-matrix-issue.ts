// =============================================
// Debug Matrix Issue
// Investigate why matrix shows wrong data
// =============================================

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

async function debugMatrixIssue() {
  console.log('🔍 Debugging matrix display issue...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // 1. Check if John TestUser is actually deleted
    console.log('1️⃣ Checking if John TestUser is deleted in distributors table:');
    const testUserCheck = await client.query(`
      SELECT id, first_name, last_name, email, status
      FROM distributors
      WHERE (first_name ILIKE '%testuser%' OR last_name ILIKE '%testuser%' OR email ILIKE '%testuser%')
      ORDER BY status
    `);
    console.log(`   Found ${testUserCheck.rows.length} TestUser records in distributors:`);
    testUserCheck.rows.forEach(row => {
      console.log(`   - ${row.first_name} ${row.last_name} (${row.email}): status=${row.status}`);
    });
    console.log('');

    // 2. Check members table for TestUser
    console.log('2️⃣ Checking members table for TestUser:');
    const membersCheck = await client.query(`
      SELECT m.member_id, m.full_name, m.email, m.status, m.distributor_id
      FROM members m
      WHERE m.full_name ILIKE '%testuser%' OR m.email ILIKE '%testuser%'
      ORDER BY m.status
    `);
    console.log(`   Found ${membersCheck.rows.length} TestUser records in members:`);
    membersCheck.rows.forEach(row => {
      console.log(`   - ${row.full_name} (${row.email}): status=${row.status}`);
    });
    console.log('');

    // 3. Get apex-vision member_id
    console.log('3️⃣ Finding apex-vision (master) record:');
    const masterCheck = await client.query(`
      SELECT d.id as distributor_id, d.first_name, d.last_name, d.slug, d.is_master,
             m.member_id, m.full_name as member_name
      FROM distributors d
      LEFT JOIN members m ON m.distributor_id = d.id
      WHERE d.is_master = true
    `);
    if (masterCheck.rows.length > 0) {
      const master = masterCheck.rows[0];
      console.log(`   ✅ Found: ${master.first_name} ${master.last_name} (${master.slug})`);
      console.log(`   Distributor ID: ${master.distributor_id}`);
      console.log(`   Member ID: ${master.member_id || 'NOT FOUND'}`);
      console.log('');

      if (master.member_id) {
        // 4. Count direct enrollees (Level 1) of apex-vision
        console.log('4️⃣ Counting Level 1 members (direct enrollees of apex-vision):');
        const level1Count = await client.query(`
          SELECT COUNT(*) as count
          FROM members
          WHERE enroller_id = $1 AND status = 'active'
        `, [master.member_id]);
        console.log(`   Active Level 1 members: ${level1Count.rows[0].count}`);

        // List them
        const level1List = await client.query(`
          SELECT m.member_id, m.full_name, m.email, m.status,
                 d.rep_number, d.status as dist_status
          FROM members m
          LEFT JOIN distributors d ON d.id = m.distributor_id
          WHERE m.enroller_id = $1
          ORDER BY m.status DESC, m.full_name
          LIMIT 25
        `, [master.member_id]);

        console.log(`\n   First 25 Level 1 members:`);
        level1List.rows.forEach((row, idx) => {
          console.log(`   ${idx + 1}. ${row.full_name} (Rep #${row.rep_number || 'N/A'}) - Member Status: ${row.status}, Dist Status: ${row.dist_status}`);
        });
        console.log('');

        // 5. Count ALL members by status
        console.log('5️⃣ Total members by status:');
        const statusCount = await client.query(`
          SELECT status, COUNT(*) as count
          FROM members
          GROUP BY status
          ORDER BY status
        `);
        statusCount.rows.forEach(row => {
          console.log(`   ${row.status}: ${row.count}`);
        });
        console.log('');

        // 6. Check for status mismatch between distributors and members
        console.log('6️⃣ Checking for status mismatches (distributor vs member):');
        const mismatch = await client.query(`
          SELECT d.id, d.first_name, d.last_name, d.status as dist_status,
                 m.member_id, m.full_name, m.status as member_status
          FROM distributors d
          LEFT JOIN members m ON m.distributor_id = d.id
          WHERE d.status != m.status
          LIMIT 10
        `);
        if (mismatch.rows.length > 0) {
          console.log(`   ⚠️  Found ${mismatch.rows.length} mismatches:`);
          mismatch.rows.forEach(row => {
            console.log(`   - ${row.first_name} ${row.last_name}: Distributor=${row.dist_status}, Member=${row.member_status}`);
          });
        } else {
          console.log(`   ✅ No status mismatches found`);
        }
      }
    } else {
      console.log('   ❌ No master distributor found!');
    }

    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    await client.end();
    process.exit(1);
  }
}

debugMatrixIssue();
