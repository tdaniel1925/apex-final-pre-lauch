// =============================================
// Count All Reps
// Full breakdown of distributor counts
// =============================================

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

async function countAllReps() {
  console.log('📊 Counting all reps in the system...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // 1. Total distributors by status
    console.log('1️⃣ Distributors by status:');
    const distByStatus = await client.query(`
      SELECT status, COUNT(*) as count
      FROM distributors
      GROUP BY status
      ORDER BY status
    `);
    let totalDist = 0;
    distByStatus.rows.forEach(row => {
      console.log(`   ${row.status}: ${row.count}`);
      totalDist += parseInt(row.count);
    });
    console.log(`   TOTAL: ${totalDist}\n`);

    // 2. Members by status
    console.log('2️⃣ Members by status:');
    const membersByStatus = await client.query(`
      SELECT status, COUNT(*) as count
      FROM members
      GROUP BY status
      ORDER BY status
    `);
    let totalMembers = 0;
    membersByStatus.rows.forEach(row => {
      console.log(`   ${row.status}: ${row.count}`);
      totalMembers += parseInt(row.count);
    });
    console.log(`   TOTAL: ${totalMembers}\n`);

    // 3. Distributors WITHOUT members record
    console.log('3️⃣ Distributors without members record:');
    const noMembers = await client.query(`
      SELECT COUNT(*) as count
      FROM distributors d
      LEFT JOIN members m ON m.distributor_id = d.id
      WHERE m.member_id IS NULL AND d.status != 'deleted'
    `);
    console.log(`   Count: ${noMembers.rows[0].count}\n`);

    // 4. Get apex-vision and count enrollees by level
    const master = await client.query(`
      SELECT d.id as distributor_id, m.member_id
      FROM distributors d
      LEFT JOIN members m ON m.distributor_id = d.id
      WHERE d.is_master = true
    `);

    if (master.rows.length > 0 && master.rows[0].member_id) {
      console.log('4️⃣ Breakdown by enroller:');

      // Direct enrollees of apex-vision
      const level1 = await client.query(`
        SELECT COUNT(*) as count
        FROM members
        WHERE enroller_id = $1 AND status = 'active'
      `, [master.rows[0].member_id]);
      console.log(`   Level 1 (direct enrollees of apex-vision): ${level1.rows[0].count}`);

      // Who are people enrolled by?
      const enrollerBreakdown = await client.query(`
        SELECT
          e.full_name as enroller_name,
          e.member_id as enroller_id,
          COUNT(m.member_id) as enrollee_count
        FROM members m
        LEFT JOIN members e ON e.member_id = m.enroller_id
        WHERE m.status = 'active'
        GROUP BY e.full_name, e.member_id
        ORDER BY enrollee_count DESC
        LIMIT 10
      `);
      console.log(`\n   Top 10 enrollers:`);
      enrollerBreakdown.rows.forEach((row, idx) => {
        console.log(`   ${idx + 1}. ${row.enroller_name}: ${row.enrollee_count} enrollees`);
      });
    }

    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    await client.end();
    process.exit(1);
  }
}

countAllReps();
