// =============================================
// Explain Matrix Structure
// Show how the matrix actually works
// =============================================

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

async function explainMatrixStructure() {
  console.log('📖 Explaining Matrix Structure...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Check what matrix columns exist
    console.log('1️⃣ Matrix-related columns in distributors table:');
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'distributors'
        AND column_name LIKE '%matrix%'
      ORDER BY ordinal_position
    `);

    if (columns.rows.length > 0) {
      columns.rows.forEach(r => {
        console.log(`   - ${r.column_name}: ${r.data_type} (nullable: ${r.is_nullable})`);
      });
    } else {
      console.log(`   ⚠️  No matrix_* columns found in distributors table!`);
    }
    console.log('');

    // Check enrollment columns
    console.log('2️⃣ Enrollment-related columns in members table:');
    const memberCols = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'members'
        AND (column_name LIKE '%enroll%' OR column_name LIKE '%sponsor%')
      ORDER BY ordinal_position
    `);
    memberCols.rows.forEach(r => {
      console.log(`   - ${r.column_name}: ${r.data_type} (nullable: ${r.is_nullable})`);
    });
    console.log('');

    // Get a sample distributor to show structure
    console.log('3️⃣ Sample distributor record (Phil Resch):');
    const sample = await client.query(`
      SELECT d.id, d.first_name, d.last_name, d.rep_number,
             d.matrix_parent_id, d.matrix_position, d.matrix_depth,
             m.member_id, m.enroller_id, m.sponsor_id
      FROM distributors d
      LEFT JOIN members m ON m.distributor_id = d.id
      WHERE d.first_name = 'Phil' AND d.last_name = 'Resch'
      LIMIT 1
    `);

    if (sample.rows.length > 0) {
      const s = sample.rows[0];
      console.log(`   Distributor: ${s.first_name} ${s.last_name} (Rep #${s.rep_number})`);
      console.log(`   Matrix fields:`);
      console.log(`     - matrix_parent_id: ${s.matrix_parent_id || 'NULL'}`);
      console.log(`     - matrix_position: ${s.matrix_position || 'NULL'}`);
      console.log(`     - matrix_depth: ${s.matrix_depth || 'NULL'}`);
      console.log(`   Member fields:`);
      console.log(`     - member_id: ${s.member_id || 'NULL'}`);
      console.log(`     - enroller_id: ${s.enroller_id || 'NULL'}`);
      console.log(`     - sponsor_id: ${s.sponsor_id || 'NULL'}`);
    }
    console.log('');

    // Show what the current matrix page uses
    console.log('4️⃣ What the current matrix page actually uses:');
    console.log(`   ✅ Uses: members.enroller_id (enrollment chain)`);
    console.log(`   ✅ Query: SELECT * FROM members WHERE enroller_id = current_user_member_id`);
    console.log(`   ✅ Recursive: Level 1 = direct enrollees, Level 2 = their enrollees, etc.`);
    console.log(`   ❌ Does NOT use: distributors.matrix_parent_id (placement tree)`);
    console.log('');

    // Count how many have matrix_parent_id set
    console.log('5️⃣ Checking matrix_parent_id usage:');
    const matrixCount = await client.query(`
      SELECT
        COUNT(*) FILTER (WHERE matrix_parent_id IS NOT NULL) as with_parent,
        COUNT(*) FILTER (WHERE matrix_parent_id IS NULL) as without_parent,
        COUNT(*) as total
      FROM distributors
      WHERE status != 'deleted'
    `);
    const mc = matrixCount.rows[0];
    console.log(`   Distributors WITH matrix_parent_id: ${mc.with_parent}`);
    console.log(`   Distributors WITHOUT matrix_parent_id: ${mc.without_parent}`);
    console.log(`   Total active: ${mc.total}`);
    console.log('');

    console.log('📝 SUMMARY:');
    console.log(`   Your system has TWO different tree structures:`);
    console.log(`   1. ENROLLMENT TREE (enroller_id) - Currently used by matrix page`);
    console.log(`   2. PLACEMENT TREE (matrix_parent_id) - NOT currently used`);
    console.log('');
    console.log(`   The matrix page shows the ENROLLMENT tree, which is based on`);
    console.log(`   who recruited whom, not on binary/5-way placement positions.`);

    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    await client.end();
    process.exit(1);
  }
}

explainMatrixStructure();
